"use client";

import { motion } from "framer-motion";
import { Note } from "@/types/note";
import { NoteItem } from "@/components/note-item";
import { staggerContainer, staggerItem } from "@/utils/animations";
import { FileText } from "lucide-react";

interface NotesListProps {
  notes: Note[];
  viewMode: "grid" | "list";
  onEditNote: (noteId: string) => void;
}

export function NotesList({ notes, viewMode, onEditNote }: NotesListProps) {
  if (notes.length === 0) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center py-16 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-muted/50 rounded-full p-6 mb-4">
          <FileText className="w-12 h-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-foreground dark:text-foreground">
          No notes found
        </h3>
        <p className="text-muted-foreground dark:text-muted-foreground max-w-md">
          Create your first note or adjust your filters to see existing notes.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`grid gap-4 ${
        viewMode === "grid"
          ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          : "grid-cols-1 max-w-4xl mx-auto"
      }`}
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {notes.map((note) => (
        <motion.div key={note.id} variants={staggerItem}>
          <NoteItem
            note={note}
            viewMode={viewMode}
            onEdit={() => onEditNote(note.id)}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
