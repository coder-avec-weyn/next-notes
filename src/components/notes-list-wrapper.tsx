"use client";

import { Note } from "@/types/note";
import { NotesList } from "@/components/notes-list";

interface NotesListWrapperProps {
  notes: Note[];
  viewMode: "grid" | "list";
  isLoading?: boolean;
  onEditNote?: (noteId: string) => void;
}

export function NotesListWrapper({
  notes,
  viewMode,
  isLoading = false,
  onEditNote,
}: NotesListWrapperProps) {
  const handleEditNote = (noteId: string) => {
    if (onEditNote) {
      onEditNote(noteId);
    }
  };

  return (
    <NotesList
      notes={notes}
      viewMode={viewMode}
      onEditNote={handleEditNote}
      isLoading={isLoading}
    />
  );
}
