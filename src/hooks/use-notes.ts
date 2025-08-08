"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Note, CreateNoteData, UpdateNoteData } from "@/types/note";
import { useEffect } from "react";

export function useNotes() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch notes on component mount
    const fetchNotes = async () => {
      const fetchedNotes = await getNotes();
      if (fetchedNotes) {
        setNotes(fetchedNotes);
      }
    };

    fetchNotes();
  }, []);

  // Fetch all notes
  const getNotes = async (filter?: string): Promise<Note[] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const queryParams = filter ? `?filter=${filter}` : "";
      const response = await fetch(`/api/notes${queryParams}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch notes");
      }
      const { data } = await response.json();
      setNotes(data); // Update local state
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
    }
  };

  // Create a new note
  const createNote = async (noteData: CreateNoteData): Promise<Note | null> => {
    setIsLoading(true);
    setError(null);

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
      setNotes((prev) => [data, ...prev]); // Add to local state
      toast({
        title: "Success",
        description: "Note created successfully",
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

  // Update a note
  const updateNote = async (
    id: string,
    updates: UpdateNoteData,
  ): Promise<Note | null> => {
    setIsLoading(true);
    setError(null);

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
      setNotes((prev) => prev.map((note) => (note.id === id ? data : note))); // Update local state
      toast({
        title: "Success",
        description: "Note updated successfully",
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

  // Delete a note
  const deleteNote = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete note");
      }

      setNotes((prev) => prev.filter((note) => note.id !== id)); // Remove from local state
      toast({
        title: "Success",
        description: "Note deleted successfully",
      });
      return true;
    } catch (err: any) {
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

  // Toggle favorite status
  const toggleFavorite = async (
    id: string,
    isFavorite: boolean,
  ): Promise<Note | null> => {
    setIsLoading(true);
    setError(null);

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
      setNotes((prev) => prev.map((note) => (note.id === id ? data : note))); // Update local state
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

  // Toggle pin status
  const togglePin = async (
    id: string,
    isPinned: boolean,
  ): Promise<Note | null> => {
    setIsLoading(true);
    setError(null);

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
      setNotes((prev) => prev.map((note) => (note.id === id ? data : note))); // Update local state
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

  // Toggle archive status
  const toggleArchive = async (
    id: string,
    isArchived: boolean,
  ): Promise<Note | null> => {
    setIsLoading(true);
    setError(null);

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
      setNotes((prev) => prev.map((note) => (note.id === id ? data : note))); // Update local state
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
      setNotes((prev) => [data, ...prev]); // Add to local state
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
    error,
    notes,
    loading: isLoading,
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
  };
}
