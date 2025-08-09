"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Note } from "@/types/note";
import { NoteItem } from "@/components/note-item";
import { staggerContainer, staggerItem } from "@/utils/animations";
import { FileText } from "lucide-react";

interface NotesListProps {
  notes: Note[];
  viewMode: "grid" | "list";
  onEditNote: (noteId: string) => void;
  isLoading?: boolean;
}

export function NotesList({
  notes,
  viewMode,
  onEditNote,
  isLoading = false,
}: NotesListProps) {
  if (isLoading) {
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
        role="status"
        aria-label="Loading notes"
      >
        {Array.from({ length: viewMode === "grid" ? 8 : 4 }).map((_, i) => (
          <motion.div key={i} variants={staggerItem}>
            <div className="bg-card rounded-lg border p-6 relative overflow-hidden">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-5/6"></div>
                  <div className="h-3 bg-muted rounded w-4/6"></div>
                </div>
                <div className="flex space-x-2">
                  <div className="h-6 bg-muted rounded w-16"></div>
                  <div className="h-6 bg-muted rounded w-20"></div>
                </div>
              </div>
              <motion.div
                className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ["calc(-100%)", "calc(100%)"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                style={{ opacity: 0.7 }}
              />
            </div>
          </motion.div>
        ))}
      </motion.div>
    );
  }

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
      role="list"
      aria-label="Notes list"
    >
      <AnimatePresence mode="popLayout">
        {notes.map((note) => (
          <motion.div
            key={note.id}
            variants={staggerItem}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, height: 0 }}
            transition={{ duration: 0.3 }}
            role="listitem"
          >
            <NoteItem
              note={note}
              viewMode={viewMode}
              onEdit={() => onEditNote(note.id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
