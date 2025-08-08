"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Star,
  Pin,
  Archive,
  Trash2,
  Edit,
  Calendar,
  Tag,
  MoreVertical,
  Copy,
  ExternalLink,
  FileText,
  Download,
  Clock,
  MapPin,
  Smile,
  Cloud,
  AlertCircle,
} from "lucide-react";
import { Note } from "@/types/note";
import { useNotes } from "@/hooks/use-notes";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cardHover, buttonPress } from "@/utils/animations";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface NoteItemProps {
  note: Note;
  viewMode: "grid" | "list";
  onEdit: () => void;
}

export function NoteItem({ note, viewMode, onEdit }: NoteItemProps) {
  const {
    toggleFavorite,
    togglePin,
    toggleArchive,
    deleteNote,
    duplicateNote,
    exportNotes,
  } = useNotes();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleFavorite(note.id, !note.is_favorite);
  };

  const handleTogglePin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await togglePin(note.id, !note.is_pinned);
  };

  const handleToggleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleArchive(note.id, !note.is_archived);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const success = await deleteNote(note.id);
    if (!success) {
      setIsDeleting(false);
    }
  };

  const handleCopyContent = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(note.content);
      toast({
        title: "Copied!",
        description: "Note content copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy content",
        variant: "destructive",
      });
    }
  };

  const handleDuplicate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await duplicateNote(note.id);
  };

  const handleExport = async (e: React.MouseEvent, format: string) => {
    e.stopPropagation();
    await exportNotes(format, [note.id]);
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high":
        return "text-red-500";
      case "medium":
        return "text-yellow-500";
      case "low":
        return "text-green-500";
      default:
        return "text-muted-foreground";
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800";
      case "review":
        return "bg-yellow-100 text-yellow-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  const truncateContent = (content: string, maxLength: number) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  return (
    <motion.div {...cardHover} whileTap={{ scale: 0.98 }}>
      <Card
        className={cn(
          "cursor-pointer transition-all duration-200 hover:shadow-md relative overflow-hidden",
          viewMode === "list" && "flex-row",
          note.is_archived && "opacity-60",
          isDeleting && "opacity-50 pointer-events-none",
        )}
        style={{ backgroundColor: note.color }}
        onClick={onEdit}
      >
        {/* Pin indicator */}
        {note.is_pinned && (
          <div className="absolute top-2 right-2 z-10">
            <Pin className="w-4 h-4 text-primary fill-current" />
          </div>
        )}

        <CardHeader className={cn("pb-2", viewMode === "list" && "flex-1")}>
          <div className="flex items-start justify-between gap-2">
            <h3
              className={cn(
                "font-semibold line-clamp-2 text-foreground",
                viewMode === "list" ? "text-lg" : "text-base",
              )}
            >
              {note.title || "Untitled Note"}
            </h3>

            <div className="flex items-center gap-1">
              {/* Favorite button */}
              <motion.div {...buttonPress}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 w-8 p-0 hover:bg-background/50",
                    note.is_favorite && "text-yellow-500",
                  )}
                  onClick={handleToggleFavorite}
                >
                  <Star
                    className={cn(
                      "w-4 h-4",
                      note.is_favorite && "fill-current",
                    )}
                  />
                </Button>
              </motion.div>

              {/* More options */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-background/50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit();
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCopyContent}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Content
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDuplicate}>
                    <FileText className="w-4 h-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => handleExport(e, "markdown")}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export as Markdown
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleTogglePin}>
                    <Pin className="w-4 h-4 mr-2" />
                    {note.is_pinned ? "Unpin" : "Pin"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleToggleArchive}>
                    <Archive className="w-4 h-4 mr-2" />
                    {note.is_archived ? "Unarchive" : "Archive"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onSelect={(e) => e.preventDefault()}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Note</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete &quot;
                          {note.title || "Untitled Note"}&quot;? This action
                          cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className={cn("pt-0", viewMode === "list" && "flex-1")}>
          {/* Content preview */}
          {note.content && (
            <p
              className={cn(
                "text-muted-foreground mb-3 whitespace-pre-wrap",
                viewMode === "grid"
                  ? "text-sm line-clamp-3"
                  : "text-base line-clamp-2",
              )}
            >
              {truncateContent(note.content, viewMode === "grid" ? 150 : 200)}
            </p>
          )}

          {/* Tags */}
          {note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {note.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </Badge>
              ))}
              {note.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{note.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant="outline"
                  className="text-xs capitalize text-foreground"
                >
                  {note.category}
                </Badge>
                {note.priority && (
                  <div
                    className={cn(
                      "flex items-center gap-1",
                      getPriorityColor(note.priority),
                    )}
                  >
                    <AlertCircle className="w-3 h-3" />
                    <span className="text-xs capitalize">{note.priority}</span>
                  </div>
                )}
                {note.status && (
                  <Badge
                    className={cn(
                      "text-xs capitalize",
                      getStatusColor(note.status),
                    )}
                  >
                    {note.status}
                  </Badge>
                )}
                {note.reminder_date && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(note.reminder_date)}</span>
                  </div>
                )}
              </div>
              <span className="text-muted-foreground">
                {formatDate(note.updated_at)}
              </span>
            </div>

            {/* Additional metadata */}
            {(note.location ||
              note.mood ||
              note.weather ||
              note.word_count) && (
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {note.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{note.location}</span>
                  </div>
                )}
                {note.mood && (
                  <div className="flex items-center gap-1">
                    <Smile className="w-3 h-3" />
                    <span className="capitalize">{note.mood}</span>
                  </div>
                )}
                {note.weather && (
                  <div className="flex items-center gap-1">
                    <Cloud className="w-3 h-3" />
                    <span className="capitalize">{note.weather}</span>
                  </div>
                )}
                {note.word_count && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{note.word_count} words</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
