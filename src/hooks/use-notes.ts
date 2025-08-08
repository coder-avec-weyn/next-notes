"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../supabase/client";
import {
  Note,
  CreateNoteData,
  UpdateNoteData,
  NoteFilters,
} from "@/types/note";
import { useToast } from "@/components/ui/use-toast";

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const { toast } = useToast();

  const fetchNotes = async (filters?: NoteFilters) => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams();
      if (filters?.category && filters.category !== "all") {
        params.append("category", filters.category);
      }
      if (filters?.is_favorite !== undefined) {
        params.append("is_favorite", filters.is_favorite.toString());
      }
      if (filters?.is_archived !== undefined) {
        params.append("is_archived", filters.is_archived.toString());
      }
      if (filters?.is_pinned !== undefined) {
        params.append("is_pinned", filters.is_pinned.toString());
      }
      if (filters?.search) {
        params.append("search", filters.search);
      }
      if (filters?.tags && filters.tags.length > 0) {
        params.append("tags", filters.tags.join(","));
      }

      const response = await fetch(`/api/notes?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch notes");
      }

      setNotes(result.data || []);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch notes";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createNote = async (noteData: CreateNoteData): Promise<Note | null> => {
    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(noteData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create note");
      }

      const newNote = result.data;
      setNotes((prev) => [newNote, ...prev]);
      toast({
        title: "Success",
        description: "Note created successfully",
      });
      return newNote;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create note";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    }
  };

  const updateNote = async (
    id: string,
    updates: UpdateNoteData,
  ): Promise<Note | null> => {
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update note");
      }

      const updatedNote = result.data;
      setNotes((prev) =>
        prev.map((note) => (note.id === id ? updatedNote : note)),
      );
      toast({
        title: "Success",
        description: "Note updated successfully",
      });
      return updatedNote;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update note";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteNote = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete note");
      }

      setNotes((prev) => prev.filter((note) => note.id !== id));
      toast({
        title: "Success",
        description: "Note deleted successfully",
      });
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete note";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };

  const toggleFavorite = async (id: string, is_favorite: boolean) => {
    try {
      const response = await fetch(`/api/notes/${id}/favorite`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_favorite }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update favorite status");
      }

      const updatedNote = result.data;
      setNotes((prev) =>
        prev.map((note) => (note.id === id ? updatedNote : note)),
      );
      return updatedNote;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update favorite status";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    }
  };

  const togglePin = async (id: string, is_pinned: boolean) => {
    try {
      const response = await fetch(`/api/notes/${id}/pin`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_pinned }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update pin status");
      }

      const updatedNote = result.data;
      setNotes((prev) =>
        prev.map((note) => (note.id === id ? updatedNote : note)),
      );
      return updatedNote;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update pin status";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    }
  };

  const toggleArchive = async (id: string, is_archived: boolean) => {
    try {
      const response = await fetch(`/api/notes/${id}/archive`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_archived }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update archive status");
      }

      const updatedNote = result.data;
      setNotes((prev) =>
        prev.map((note) => (note.id === id ? updatedNote : note)),
      );
      return updatedNote;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update archive status";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    }
  };

  const duplicateNote = async (id: string): Promise<Note | null> => {
    try {
      const response = await fetch("/api/notes/duplicate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ noteId: id }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to duplicate note");
      }

      const duplicatedNote = result.data;
      setNotes((prev) => [duplicatedNote, ...prev]);
      toast({
        title: "Success",
        description: "Note duplicated successfully",
      });
      return duplicatedNote;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to duplicate note";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    }
  };

  const getAnalytics = async () => {
    try {
      const response = await fetch("/api/notes/analytics");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch analytics");
      }

      return result.data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch analytics";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    }
  };

  const getTemplates = async () => {
    try {
      const response = await fetch("/api/notes/templates");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch templates");
      }

      return result.data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch templates";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    }
  };

  const exportNotes = async (format: string = "json", noteIds?: string[]) => {
    try {
      const params = new URLSearchParams({ format });
      if (noteIds && noteIds.length > 0) {
        params.append("noteIds", noteIds.join(","));
      }

      const response = await fetch(`/api/notes/export?${params.toString()}`);

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to export notes");
      }

      // Create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        response.headers
          .get("Content-Disposition")
          ?.split("filename=")[1]
          ?.replace(/"/g, "") || `notes-export.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Notes exported successfully",
      });
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to export notes";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchNotes();

    // Set up real-time subscription
    const channel = supabase
      .channel("notes_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notes",
        },
        () => {
          fetchNotes();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    notes,
    loading,
    error,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
    toggleFavorite,
    togglePin,
    toggleArchive,
    duplicateNote,
    getAnalytics,
    getTemplates,
    exportNotes,
  };
}
