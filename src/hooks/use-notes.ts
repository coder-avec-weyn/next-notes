"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Note, CreateNoteData, UpdateNoteData } from "@/types/note";
import { createClient } from "../../supabase/client";
import { v4 as uuidv4 } from "uuid";

// Type for optimistic updates tracking
interface OptimisticUpdate {
  id: string;
  type: "create" | "update" | "delete" | "favorite" | "pin" | "archive";
  timestamp: number;
  data?: any;
  originalData?: any;
}

// Type for realtime connection status
type RealtimeStatus = "connecting" | "connected" | "disconnected" | "error";

export function useNotes() {
  const [isLoading, setIsLoading] = useState(false);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesSyncing, setNotesSyncing] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [realtimeStatus, setRealtimeStatus] =
    useState<RealtimeStatus>("disconnected");
  const { toast } = useToast();

  // Refs for tracking optimistic updates and subscriptions
  const optimisticUpdatesRef = useRef<Map<string, OptimisticUpdate>>(new Map());
  const supabaseRef = useRef(createClient());
  const subscriptionRef = useRef<any>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const processedEventsRef = useRef<Set<string>>(new Set());
  const initialFetchDoneRef = useRef(false);

  // Setup realtime subscription and broadcast channel
  useEffect(() => {
    // Initialize broadcast channel for multi-tab sync
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        broadcastChannelRef.current = new BroadcastChannel("notes_sync");
        broadcastChannelRef.current.onmessage = (event) => {
          handleBroadcastEvent(event.data);
        };
      } else {
        console.log(
          "BroadcastChannel not supported, falling back to localStorage",
        );
        // Fallback to localStorage events if BroadcastChannel is not supported
        window.addEventListener("storage", handleStorageEvent);
      }
    } catch (err) {
      console.error("Error setting up broadcast channel:", err);
    }

    // Setup Supabase realtime subscription
    setupRealtimeSubscription();

    // Fetch notes on component mount
    const fetchInitialNotes = async () => {
      const fetchedNotes = await getNotes();
      if (fetchedNotes) {
        setNotes(fetchedNotes);
        initialFetchDoneRef.current = true;
      }
    };

    fetchInitialNotes();

    // Cleanup function
    return () => {
      if (subscriptionRef.current) {
        supabaseRef.current.removeChannel(subscriptionRef.current);
      }
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
      } else {
        window.removeEventListener("storage", handleStorageEvent);
      }
    };
  }, []);

  // Setup realtime subscription
  const setupRealtimeSubscription = useCallback(() => {
    try {
      setRealtimeStatus("connecting");

      // Remove existing subscription if it exists
      if (subscriptionRef.current) {
        supabaseRef.current.removeChannel(subscriptionRef.current);
      }

      const supabase = supabaseRef.current;

      subscriptionRef.current = supabase
        .channel("notes_changes")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "notes" },
          handleRealtimeEvent,
        )
        .subscribe((status) => {
          console.log(`Realtime subscription status: ${status}`);
          setRealtimeStatus(
            status === "SUBSCRIBED" ? "connected" : "connecting",
          );
        });

      console.log("Realtime subscription setup complete");
    } catch (err) {
      console.error("Error setting up realtime subscription:", err);
      setRealtimeStatus("error");
    }
  }, []);

  // Handle realtime events from Supabase
  const handleRealtimeEvent = useCallback((payload: any) => {
    if (!initialFetchDoneRef.current) return;

    const { eventType, new: newRecord, old: oldRecord } = payload;
    const eventId = `${eventType}-${newRecord?.id || oldRecord?.id}-${Date.now()}`;

    // Skip if we've already processed this event
    if (processedEventsRef.current.has(eventId)) return;
    processedEventsRef.current.add(eventId);

    // Limit the size of processed events set
    if (processedEventsRef.current.size > 1000) {
      const iterator = processedEventsRef.current.values();
      processedEventsRef.current.delete(iterator.next().value);
    }

    console.log(`Realtime event received: ${eventType}`, payload);
    setNotesSyncing(true);

    try {
      switch (eventType) {
        case "INSERT":
          handleRealtimeInsert(newRecord);
          break;
        case "UPDATE":
          handleRealtimeUpdate(newRecord);
          break;
        case "DELETE":
          handleRealtimeDelete(oldRecord);
          break;
      }
    } catch (err) {
      console.error("Error handling realtime event:", err);
    } finally {
      setNotesSyncing(false);
    }
  }, []);

  // Handle broadcast events from other tabs
  const handleBroadcastEvent = useCallback((event: any) => {
    if (!event || !event.type) return;

    const { type, data, eventId } = event;

    // Skip if we've already processed this event
    if (processedEventsRef.current.has(eventId)) return;
    processedEventsRef.current.add(eventId);

    console.log(`Broadcast event received: ${type}`, data);

    switch (type) {
      case "note_created":
        setNotes((prev) => [...prev, data]);
        break;
      case "note_updated":
        setNotes((prev) =>
          prev.map((note) => (note.id === data.id ? data : note)),
        );
        break;
      case "note_deleted":
        setNotes((prev) => prev.filter((note) => note.id !== data.id));
        break;
    }
  }, []);

  // Handle localStorage events (fallback for BroadcastChannel)
  const handleStorageEvent = useCallback((event: StorageEvent) => {
    if (!event.key || !event.key.startsWith("notes_sync_")) return;

    try {
      const data = JSON.parse(event.newValue || "{}");
      handleBroadcastEvent(data);
    } catch (err) {
      console.error("Error handling storage event:", err);
    }
  }, []);

  // Broadcast an event to other tabs
  const broadcastEvent = useCallback((type: string, data: any) => {
    const eventId = `${type}-${data.id}-${Date.now()}`;
    const event = { type, data, eventId };

    try {
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.postMessage(event);
      } else {
        // Fallback to localStorage
        localStorage.setItem(`notes_sync_${Date.now()}`, JSON.stringify(event));
        // Clean up old events
        setTimeout(() => {
          localStorage.removeItem(`notes_sync_${Date.now()}`);
        }, 1000);
      }
    } catch (err) {
      console.error("Error broadcasting event:", err);
    }
  }, []);

  // Handle realtime insert
  const handleRealtimeInsert = useCallback((newNote: Note) => {
    setNotes((prev) => {
      // Check if we already have this note (from optimistic update)
      const existingIndex = prev.findIndex((note) => note.id === newNote.id);
      if (existingIndex >= 0) {
        // Replace the optimistic note with the real one
        const updated = [...prev];
        updated[existingIndex] = newNote;
        return updated;
      }
      // Add the new note
      return [...prev, newNote];
    });

    // Remove from optimistic updates if present
    optimisticUpdatesRef.current.delete(newNote.id);
  }, []);

  // Handle realtime update
  const handleRealtimeUpdate = useCallback((updatedNote: Note) => {
    setNotes((prev) =>
      prev.map((note) => (note.id === updatedNote.id ? updatedNote : note)),
    );

    // Remove from optimistic updates if present
    optimisticUpdatesRef.current.delete(updatedNote.id);
  }, []);

  // Handle realtime delete
  const handleRealtimeDelete = useCallback((deletedNote: Note) => {
    setNotes((prev) => prev.filter((note) => note.id !== deletedNote.id));

    // Remove from optimistic updates if present
    optimisticUpdatesRef.current.delete(deletedNote.id);
  }, []);

  // Fetch all notes
  const getNotes = async (filter?: string): Promise<Note[] | null> => {
    setIsLoading(true);
    setNotesLoading(true);
    setError(null);

    try {
      const queryParams = filter ? `?filter=${filter}` : "";
      const response = await fetch(`/api/notes${queryParams}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch notes");
      }
      const { data } = await response.json();

      // Apply any pending optimistic updates to the fetched data
      const updatedData = applyOptimisticUpdates(data);
      setNotes(updatedData); // Update local state
      return updatedData;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
      setNotesLoading(false);
    }
  };

  // Apply optimistic updates to fetched data
  const applyOptimisticUpdates = (data: Note[]): Note[] => {
    if (optimisticUpdatesRef.current.size === 0) return data;

    let result = [...data];

    // Apply each optimistic update
    for (const [id, update] of optimisticUpdatesRef.current.entries()) {
      switch (update.type) {
        case "create":
          // Add optimistically created notes that aren't in the data yet
          if (!result.some((note) => note.id === id)) {
            result.push(update.data);
          }
          break;

        case "update":
        case "favorite":
        case "pin":
        case "archive":
          // Update existing notes
          result = result.map((note) =>
            note.id === id ? { ...note, ...update.data } : note,
          );
          break;

        case "delete":
          // Remove deleted notes
          result = result.filter((note) => note.id !== id);
          break;
      }
    }

    return result;
  };

  // Fetch a single note
  const getNote = async (id: string): Promise<Note | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/notes/${id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch note");
      }
      const { data } = await response.json();
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
      setAnalyticsLoading(false);
    }
  };

  // Create a new note with optimistic update
  const createNote = async (noteData: CreateNoteData): Promise<Note | null> => {
    setIsLoading(true);
    setError(null);

    // Generate a temporary ID for optimistic update
    const tempId = `temp_${uuidv4()}`;
    const timestamp = Date.now();

    // Create optimistic note with temporary ID
    const optimisticNote: Note = {
      id: tempId,
      user_id: "optimistic",
      title: noteData.title || "Untitled Note",
      content: noteData.content || "",
      category: noteData.category || "general",
      tags: noteData.tags || [],
      color: noteData.color || "#ffffff",
      is_favorite: noteData.is_favorite || false,
      is_pinned: noteData.is_pinned || false,
      is_archived: false,
      is_public: noteData.is_public || false,
      priority: noteData.priority || "medium",
      status: noteData.status || "draft",
      location: noteData.location || "",
      mood: noteData.mood || "",
      weather: noteData.weather || "",
      word_count: noteData.content
        ? noteData.content
            .trim()
            .split(/\s+/)
            .filter((w) => w.length > 0).length
        : 0,
      reading_time: noteData.content
        ? Math.max(
            1,
            Math.ceil(
              noteData.content
                .trim()
                .split(/\s+/)
                .filter((w) => w.length > 0).length / 200,
            ),
          )
        : 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      _isOptimistic: true,
    };

    // Add to optimistic updates
    optimisticUpdatesRef.current.set(tempId, {
      id: tempId,
      type: "create",
      timestamp,
      data: optimisticNote,
    });

    // Update UI immediately (optimistically)
    setNotes((prev) => [optimisticNote, ...prev]);

    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(noteData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create note");
      }

      const { data } = await response.json();

      // Remove the optimistic note and add the real one
      optimisticUpdatesRef.current.delete(tempId);

      // Update notes list with the real note
      setNotes((prev) => {
        const filtered = prev.filter((note) => note.id !== tempId);
        return [data, ...filtered];
      });

      // Broadcast to other tabs
      broadcastEvent("note_created", data);

      toast({
        title: "Success",
        description: "Note created successfully",
      });

      return data;
    } catch (err: any) {
      // Rollback optimistic update
      optimisticUpdatesRef.current.delete(tempId);
      setNotes((prev) => prev.filter((note) => note.id !== tempId));

      setError(err.message);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
      setTemplatesLoading(false);
    }
  };

  // Update a note with optimistic update
  const updateNote = async (
    id: string,
    updates: UpdateNoteData,
  ): Promise<Note | null> => {
    setIsLoading(true);
    setError(null);

    // Find the current note
    const currentNote = notes.find((note) => note.id === id);
    if (!currentNote) {
      setError("Note not found");
      toast({
        title: "Error",
        description: "Note not found",
        variant: "destructive",
      });
      setIsLoading(false);
      return null;
    }

    const timestamp = Date.now();

    // Create updated note for optimistic update
    const updatedNote = {
      ...currentNote,
      ...updates,
      updated_at: new Date().toISOString(),
      _isOptimistic: true,
    };

    // Store original for potential rollback
    optimisticUpdatesRef.current.set(id, {
      id,
      type: "update",
      timestamp,
      data: updatedNote,
      originalData: currentNote,
    });

    // Update UI immediately (optimistically)
    setNotes((prev) =>
      prev.map((note) => (note.id === id ? updatedNote : note)),
    );

    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update note");
      }

      const { data } = await response.json();

      // Remove from optimistic updates
      optimisticUpdatesRef.current.delete(id);

      // Update with the real data from server
      setNotes((prev) => prev.map((note) => (note.id === id ? data : note)));

      // Broadcast to other tabs
      broadcastEvent("note_updated", data);

      toast({
        title: "Success",
        description: "Note updated successfully",
      });
      return data;
    } catch (err: any) {
      // Rollback optimistic update
      const originalData = optimisticUpdatesRef.current.get(id)?.originalData;
      optimisticUpdatesRef.current.delete(id);

      if (originalData) {
        setNotes((prev) =>
          prev.map((note) => (note.id === id ? originalData : note)),
        );
      }

      setError(err.message);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a note with optimistic update
  const deleteNote = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    // Find the current note for potential rollback
    const currentNote = notes.find((note) => note.id === id);
    if (!currentNote) {
      setError("Note not found");
      toast({
        title: "Error",
        description: "Note not found",
        variant: "destructive",
      });
      setIsLoading(false);
      return false;
    }

    const timestamp = Date.now();

    // Store original for potential rollback
    optimisticUpdatesRef.current.set(id, {
      id,
      type: "delete",
      timestamp,
      originalData: currentNote,
    });

    // Update UI immediately (optimistically)
    setNotes((prev) => prev.filter((note) => note.id !== id));

    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete note");
      }

      // Remove from optimistic updates
      optimisticUpdatesRef.current.delete(id);

      // Broadcast to other tabs
      broadcastEvent("note_deleted", { id });

      toast({
        title: "Success",
        description: "Note deleted successfully",
      });
      return true;
    } catch (err: any) {
      // Rollback optimistic update
      const originalData = optimisticUpdatesRef.current.get(id)?.originalData;
      optimisticUpdatesRef.current.delete(id);

      if (originalData) {
        setNotes((prev) => [...prev, originalData]);
      }

      setError(err.message);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle favorite status with optimistic update
  const toggleFavorite = async (
    id: string,
    isFavorite: boolean,
  ): Promise<Note | null> => {
    setIsLoading(true);
    setError(null);

    // Find the current note
    const currentNote = notes.find((note) => note.id === id);
    if (!currentNote) {
      setError("Note not found");
      toast({
        title: "Error",
        description: "Note not found",
        variant: "destructive",
      });
      setIsLoading(false);
      return null;
    }

    const timestamp = Date.now();

    // Create updated note for optimistic update
    const updatedNote = {
      ...currentNote,
      is_favorite: isFavorite,
      updated_at: new Date().toISOString(),
      _isOptimistic: true,
    };

    // Store original for potential rollback
    optimisticUpdatesRef.current.set(id, {
      id,
      type: "favorite",
      timestamp,
      data: updatedNote,
      originalData: currentNote,
    });

    // Update UI immediately (optimistically)
    setNotes((prev) =>
      prev.map((note) => (note.id === id ? updatedNote : note)),
    );

    try {
      const response = await fetch(`/api/notes/${id}/favorite`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_favorite: isFavorite }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update favorite status");
      }

      const { data } = await response.json();

      // Remove from optimistic updates
      optimisticUpdatesRef.current.delete(id);

      // Update with the real data from server
      setNotes((prev) => prev.map((note) => (note.id === id ? data : note)));

      // Broadcast to other tabs
      broadcastEvent("note_updated", data);

      return data;
    } catch (err: any) {
      // Rollback optimistic update
      const originalData = optimisticUpdatesRef.current.get(id)?.originalData;
      optimisticUpdatesRef.current.delete(id);

      if (originalData) {
        setNotes((prev) =>
          prev.map((note) => (note.id === id ? originalData : note)),
        );
      }

      setError(err.message);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle pin status with optimistic update
  const togglePin = async (
    id: string,
    isPinned: boolean,
  ): Promise<Note | null> => {
    setIsLoading(true);
    setError(null);

    // Find the current note
    const currentNote = notes.find((note) => note.id === id);
    if (!currentNote) {
      setError("Note not found");
      toast({
        title: "Error",
        description: "Note not found",
        variant: "destructive",
      });
      setIsLoading(false);
      return null;
    }

    const timestamp = Date.now();

    // Create updated note for optimistic update
    const updatedNote = {
      ...currentNote,
      is_pinned: isPinned,
      updated_at: new Date().toISOString(),
      _isOptimistic: true,
    };

    // Store original for potential rollback
    optimisticUpdatesRef.current.set(id, {
      id,
      type: "pin",
      timestamp,
      data: updatedNote,
      originalData: currentNote,
    });

    // Update UI immediately (optimistically)
    setNotes((prev) =>
      prev.map((note) => (note.id === id ? updatedNote : note)),
    );

    try {
      const response = await fetch(`/api/notes/${id}/pin`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_pinned: isPinned }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update pin status");
      }

      const { data } = await response.json();

      // Remove from optimistic updates
      optimisticUpdatesRef.current.delete(id);

      // Update with the real data from server
      setNotes((prev) => prev.map((note) => (note.id === id ? data : note)));

      // Broadcast to other tabs
      broadcastEvent("note_updated", data);

      return data;
    } catch (err: any) {
      // Rollback optimistic update
      const originalData = optimisticUpdatesRef.current.get(id)?.originalData;
      optimisticUpdatesRef.current.delete(id);

      if (originalData) {
        setNotes((prev) =>
          prev.map((note) => (note.id === id ? originalData : note)),
        );
      }

      setError(err.message);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle archive status with optimistic update
  const toggleArchive = async (
    id: string,
    isArchived: boolean,
  ): Promise<Note | null> => {
    setIsLoading(true);
    setError(null);

    // Find the current note
    const currentNote = notes.find((note) => note.id === id);
    if (!currentNote) {
      setError("Note not found");
      toast({
        title: "Error",
        description: "Note not found",
        variant: "destructive",
      });
      setIsLoading(false);
      return null;
    }

    const timestamp = Date.now();

    // Create updated note for optimistic update
    const updatedNote = {
      ...currentNote,
      is_archived: isArchived,
      updated_at: new Date().toISOString(),
      _isOptimistic: true,
    };

    // Store original for potential rollback
    optimisticUpdatesRef.current.set(id, {
      id,
      type: "archive",
      timestamp,
      data: updatedNote,
      originalData: currentNote,
    });

    // Update UI immediately (optimistically)
    setNotes((prev) =>
      prev.map((note) => (note.id === id ? updatedNote : note)),
    );

    try {
      const response = await fetch(`/api/notes/${id}/archive`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_archived: isArchived }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update archive status");
      }

      const { data } = await response.json();

      // Remove from optimistic updates
      optimisticUpdatesRef.current.delete(id);

      // Update with the real data from server
      setNotes((prev) => prev.map((note) => (note.id === id ? data : note)));

      // Broadcast to other tabs
      broadcastEvent("note_updated", data);

      return data;
    } catch (err: any) {
      // Rollback optimistic update
      const originalData = optimisticUpdatesRef.current.get(id)?.originalData;
      optimisticUpdatesRef.current.delete(id);

      if (originalData) {
        setNotes((prev) =>
          prev.map((note) => (note.id === id ? originalData : note)),
        );
      }

      setError(err.message);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Duplicate a note
  const duplicateNote = async (noteId: string): Promise<Note | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/notes/duplicate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ noteId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to duplicate note");
      }

      const { data } = await response.json();
      // Refresh the notes list to ensure UI is up-to-date
      await getNotes();
      toast({
        title: "Success",
        description: "Note duplicated successfully",
      });
      return data;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Export notes
  const exportNotes = async (
    format: string,
    noteIds?: string[],
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      let url = `/api/notes/export?format=${format}`;
      if (noteIds && noteIds.length > 0) {
        url += `&noteIds=${noteIds.join(",")}`;
      }

      window.open(url, "_blank");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Get note templates
  const getTemplates = async () => {
    setIsLoading(true);
    setTemplatesLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/notes/templates`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch templates");
      }
      const { data } = await response.json();
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Get analytics
  const getAnalytics = async () => {
    setIsLoading(true);
    setAnalyticsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/notes/analytics`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch analytics");
      }
      const { data } = await response.json();
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    notesLoading,
    notesSyncing,
    analyticsLoading,
    templatesLoading,
    error,
    notes,
    loading: isLoading,
    realtimeStatus,
    getNotes,
    getNote,
    createNote,
    updateNote,
    deleteNote,
    toggleFavorite,
    togglePin,
    toggleArchive,
    duplicateNote,
    exportNotes,
    getTemplates,
    getAnalytics,
    fetchNotes: async () => {
      const fetchedNotes = await getNotes();
      if (fetchedNotes) {
        setNotes(fetchedNotes);
      }
      return fetchedNotes;
    },
    reconnectRealtime: () => {
      setupRealtimeSubscription();
    },
  };
}
