"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";

const motion = dynamic(
  () => import("framer-motion").then((mod) => mod.motion),
  { ssr: false },
);
const AnimatePresence = dynamic(
  () => import("framer-motion").then((mod) => mod.AnimatePresence),
  { ssr: false },
);
import {
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  Star,
  Archive,
  Pin,
  Tag,
  Calendar,
  SortAsc,
  SortDesc,
  Palette,
  BarChart3,
  Download,
  FileText,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useNotes } from "@/hooks/use-notes";
import { NOTE_COLORS } from "@/types/note";

import { NOTE_CATEGORIES, NOTE_PRIORITIES, NOTE_STATUSES } from "@/types/note";
import { LoadingSpinner, LoadingCard } from "@/components/ui/loading-spinner";
import { NotesList } from "@/components/notes-list";
import { NoteEditor } from "@/components/note-editor";
import { NotesAnalytics } from "@/components/notes-analytics";
import { fadeInUp, staggerContainer, staggerItem } from "@/utils/animations";
import { cn } from "@/lib/utils";

export default function NotesPage() {
  const { notes, loading, fetchNotes, exportNotes } = useNotes();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState<"notes" | "analytics">("notes");
  const [sortBy, setSortBy] = useState<"updated" | "created" | "title">(
    "updated",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showFavorites, setShowFavorites] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [showPinned, setShowPinned] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);

  // Get all unique tags from notes
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    notes.forEach((note) => {
      note.tags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags);
  }, [notes]);

  // Filter and sort notes
  const filteredNotes = useMemo(() => {
    let filtered = notes.filter((note) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !note.title.toLowerCase().includes(query) &&
          !note.content.toLowerCase().includes(query)
        ) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== "all" && note.category !== selectedCategory) {
        return false;
      }

      // Priority filter
      if (selectedPriority !== "all" && note.priority !== selectedPriority) {
        return false;
      }

      // Status filter
      if (selectedStatus !== "all" && note.status !== selectedStatus) {
        return false;
      }

      // Tags filter
      if (selectedTags.length > 0) {
        if (!selectedTags.some((tag) => note.tags.includes(tag))) {
          return false;
        }
      }

      // Favorites filter
      if (showFavorites && !note.is_favorite) {
        return false;
      }

      // Archived filter
      if (showArchived !== note.is_archived) {
        return false;
      }

      // Pinned filter
      if (showPinned && !note.is_pinned) {
        return false;
      }

      return true;
    });

    // Sort notes
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "created":
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        default:
          aValue = new Date(a.updated_at).getTime();
          bValue = new Date(b.updated_at).getTime();
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [
    notes,
    searchQuery,
    selectedCategory,
    selectedTags,
    selectedPriority,
    selectedStatus,
    showFavorites,
    showArchived,
    showPinned,
    sortBy,
    sortOrder,
  ]);

  const handleCreateNote = () => {
    setSelectedNote(null);
    setIsEditorOpen(true);
  };

  const handleEditNote = (noteId: string) => {
    setSelectedNote(noteId);
    setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setSelectedNote(null);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleBulkExport = async (format: string) => {
    await exportNotes(
      format,
      selectedNotes.length > 0 ? selectedNotes : undefined,
    );
  };

  const toggleNoteSelection = (noteId: string) => {
    setSelectedNotes((prev) =>
      prev.includes(noteId)
        ? prev.filter((id) => id !== noteId)
        : [...prev, noteId],
    );
  };

  const selectAllNotes = () => {
    setSelectedNotes(filteredNotes.map((note) => note.id));
  };

  const clearSelection = () => {
    setSelectedNotes([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <LoadingCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Tabs
                value={activeTab}
                onValueChange={(value: any) => setActiveTab(value)}
              >
                <TabsList className="bg-muted dark:bg-muted">
                  <TabsTrigger
                    value="notes"
                    className="gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground"
                  >
                    <FileText className="w-4 h-4" />
                    Notes
                  </TabsTrigger>
                  <TabsTrigger
                    value="analytics"
                    className="gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Analytics
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <Badge
                variant="secondary"
                className="text-foreground bg-secondary dark:bg-secondary dark:text-secondary-foreground"
              >
                {filteredNotes.length} notes
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              {activeTab === "notes" && (
                <>
                  <Button onClick={handleCreateNote} className="gap-2">
                    <Plus className="w-4 h-4" />
                    New Note
                  </Button>

                  {/* Bulk Actions */}
                  {selectedNotes.length > 0 && (
                    <div className="flex items-center gap-2 border-l pl-2">
                      <span className="text-sm text-muted-foreground">
                        {selectedNotes.length} selected
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBulkExport("json")}
                        className="gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Export
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearSelection}
                      >
                        Clear
                      </Button>
                    </div>
                  )}

                  <div className="flex items-center gap-1 border rounded-lg p-1">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {activeTab === "notes" && (
        <div className="border-b bg-card/30 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background dark:bg-background text-foreground dark:text-foreground border-border dark:border-border"
                />
              </div>

              {/* Category Filter */}
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-40 bg-background dark:bg-background text-foreground dark:text-foreground border-border dark:border-border">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-background dark:bg-background border-border dark:border-border">
                  <SelectItem
                    value="all"
                    className="text-foreground dark:text-foreground"
                  >
                    All Categories
                  </SelectItem>
                  {NOTE_CATEGORIES.map((category) => (
                    <SelectItem
                      key={category}
                      value={category}
                      className="text-foreground dark:text-foreground"
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Priority Filter */}
              <Select
                value={selectedPriority}
                onValueChange={setSelectedPriority}
              >
                <SelectTrigger className="w-32 bg-background dark:bg-background text-foreground dark:text-foreground border-border dark:border-border">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent className="bg-background dark:bg-background border-border dark:border-border">
                  <SelectItem
                    value="all"
                    className="text-foreground dark:text-foreground"
                  >
                    All Priorities
                  </SelectItem>
                  {NOTE_PRIORITIES.map((priority) => (
                    <SelectItem
                      key={priority}
                      value={priority}
                      className="text-foreground dark:text-foreground"
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-32 bg-background dark:bg-background text-foreground dark:text-foreground border-border dark:border-border">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-background dark:bg-background border-border dark:border-border">
                  <SelectItem
                    value="all"
                    className="text-foreground dark:text-foreground"
                  >
                    All Statuses
                  </SelectItem>
                  {NOTE_STATUSES.map((status) => (
                    <SelectItem
                      key={status}
                      value={status}
                      className="text-foreground dark:text-foreground"
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <Select
                  value={sortBy}
                  onValueChange={(value: any) => setSortBy(value)}
                >
                  <SelectTrigger className="w-32 bg-background dark:bg-background text-foreground dark:text-foreground border-border dark:border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background dark:bg-background border-border dark:border-border">
                    <SelectItem
                      value="updated"
                      className="text-foreground dark:text-foreground"
                    >
                      Updated
                    </SelectItem>
                    <SelectItem
                      value="created"
                      className="text-foreground dark:text-foreground"
                    >
                      Created
                    </SelectItem>
                    <SelectItem
                      value="title"
                      className="text-foreground dark:text-foreground"
                    >
                      Title
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
                  }
                  className="bg-background dark:bg-background text-foreground dark:text-foreground border-border dark:border-border hover:bg-muted dark:hover:bg-muted"
                >
                  {sortOrder === "asc" ? (
                    <SortAsc className="w-4 h-4" />
                  ) : (
                    <SortDesc className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-4 mt-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="favorites"
                  checked={showFavorites}
                  onCheckedChange={setShowFavorites}
                />
                <Label
                  htmlFor="favorites"
                  className="flex items-center gap-1 text-foreground dark:text-foreground"
                >
                  <Star className="w-4 h-4" />
                  Favorites
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="pinned"
                  checked={showPinned}
                  onCheckedChange={setShowPinned}
                />
                <Label
                  htmlFor="pinned"
                  className="flex items-center gap-1 text-foreground dark:text-foreground"
                >
                  <Pin className="w-4 h-4" />
                  Pinned
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="archived"
                  checked={showArchived}
                  onCheckedChange={setShowArchived}
                />
                <Label
                  htmlFor="archived"
                  className="flex items-center gap-1 text-foreground dark:text-foreground"
                >
                  <Archive className="w-4 h-4" />
                  Archived
                </Label>
              </div>
            </div>

            {/* Tags Filter */}
            {allTags.length > 0 && (
              <div className="mt-4">
                <Label className="text-sm font-medium mb-2 block text-foreground dark:text-foreground">
                  Filter by tags:
                </Label>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={
                        selectedTags.includes(tag) ? "default" : "outline"
                      }
                      className="cursor-pointer hover:bg-primary/10 dark:hover:bg-primary/10 text-foreground dark:text-foreground transition-all duration-200"
                      onClick={() => toggleTag(tag)}
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bulk Selection */}
          {filteredNotes.length > 0 && (
            <div className="container mx-auto px-4 flex items-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={selectAllNotes}
                disabled={selectedNotes.length === filteredNotes.length}
              >
                Select All
              </Button>
              {selectedNotes.length > 0 && (
                <Button variant="outline" size="sm" onClick={clearSelection}>
                  Clear Selection
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {activeTab === "notes" ? (
          <NotesList
            notes={filteredNotes}
            viewMode={viewMode}
            onEditNote={handleEditNote}
          />
        ) : (
          <NotesAnalytics />
        )}
      </div>

      {/* Note Editor Modal */}
      <AnimatePresence>
        {isEditorOpen && (
          <NoteEditor noteId={selectedNote} onClose={handleCloseEditor} />
        )}
      </AnimatePresence>
    </div>
  );
}
