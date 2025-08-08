"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  X,
  Save,
  Star,
  Pin,
  Archive,
  Calendar,
  Tag,
  Palette,
  Type,
  AlignLeft,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlertCircle,
  MapPin,
  Smile,
  Cloud,
  FileText,
  Globe,
} from "lucide-react";
import {
  Note,
  CreateNoteData,
  UpdateNoteData,
  NOTE_CATEGORIES,
  NOTE_COLORS,
  NOTE_PRIORITIES,
  NOTE_STATUSES,
  NOTE_MOODS,
  NOTE_WEATHER,
} from "@/types/note";
import { useNotes } from "@/hooks/use-notes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { slideUp, fadeIn } from "@/utils/animations";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface NoteEditorProps {
  noteId?: string | null;
  onClose: () => void;
}

export function NoteEditor({ noteId, onClose }: NoteEditorProps) {
  const { notes, createNote, updateNote, getTemplates, templatesLoading } =
    useNotes();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [color, setColor] = useState("#ffffff");
  const [isFavorite, setIsFavorite] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [reminderDate, setReminderDate] = useState<Date | undefined>();
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [status, setStatus] = useState<"draft" | "published" | "review">(
    "draft",
  );
  const [location, setLocation] = useState("");
  const [mood, setMood] = useState("none");
  const [weather, setWeather] = useState("none");
  const [templates, setTemplates] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const existingNote = noteId ? notes.find((n) => n.id === noteId) : null;
  const isEditing = !!existingNote;

  useEffect(() => {
    if (existingNote) {
      setTitle(existingNote.title);
      setContent(existingNote.content);
      setCategory(existingNote.category);
      setTags(existingNote.tags);
      setColor(existingNote.color);
      setIsFavorite(existingNote.is_favorite);
      setIsPinned(existingNote.is_pinned);
      setIsPublic(existingNote.is_public);
      setReminderDate(
        existingNote.reminder_date
          ? new Date(existingNote.reminder_date)
          : undefined,
      );
      setPriority(existingNote.priority || "medium");
      setStatus(existingNote.status || "draft");
      setLocation(existingNote.location || "");
      setMood(existingNote.mood || "none");
      setWeather(existingNote.weather || "none");
    }
  }, [existingNote]);

  useEffect(() => {
    const loadTemplates = async () => {
      const templateData = await getTemplates();
      if (templateData) {
        setTemplates(templateData);
      }
    };
    loadTemplates();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);

    const wordCount = content
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
    const readingTime = Math.ceil(wordCount / 200); // Average reading speed

    const noteData = {
      title: title.trim() || "Untitled Note",
      content: content.trim(),
      category,
      tags,
      color,
      is_favorite: isFavorite,
      is_pinned: isPinned,
      is_public: isPublic,
      reminder_date: reminderDate?.toISOString(),
      priority,
      status,
      location: location.trim(),
      mood: mood === "none" ? "" : mood,
      weather: weather === "none" ? "" : weather,
      word_count: wordCount,
      reading_time: readingTime,
    };

    let success = false;
    if (isEditing && noteId) {
      const result = await updateNote(noteId, noteData as UpdateNoteData);
      success = !!result;
    } else {
      const result = await createNote(noteData as CreateNoteData);
      success = !!result;
    }

    setIsSaving(false);
    if (success) {
      onClose();
    }
  };

  const handleAddTag = () => {
    const tag = newTag.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleTemplateSelect = (template: any) => {
    setTitle(template.title);
    setContent(
      template.content.replace("{date}", new Date().toLocaleDateString()),
    );
    setCategory(template.category);
    setTags(template.tags);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSave();
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-card rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        variants={slideUp}
        initial="initial"
        animate="animate"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
        style={{ backgroundColor: color }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-background/50 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-foreground">
              {isEditing ? "Edit Note" : "Create Note"}
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant={isFavorite ? "default" : "outline"}
                size="sm"
                onClick={() => setIsFavorite(!isFavorite)}
                className={cn(
                  "gap-2 transition-all duration-200",
                  isFavorite && "bg-yellow-500 hover:bg-yellow-600 text-white",
                )}
              >
                <Star className={cn("w-4 h-4", isFavorite && "fill-current")} />
                Favorite
              </Button>
              <Button
                variant={isPinned ? "default" : "outline"}
                size="sm"
                onClick={() => setIsPinned(!isPinned)}
                className={cn(
                  "gap-2 transition-all duration-200",
                  isPinned && "bg-blue-500 hover:bg-blue-600 text-white",
                )}
              >
                <Pin className={cn("w-4 h-4", isPinned && "fill-current")} />
                Pin
              </Button>
              <Button
                variant={isPublic ? "default" : "outline"}
                size="sm"
                onClick={() => setIsPublic(!isPublic)}
                className={cn(
                  "gap-2 transition-all duration-200",
                  isPublic && "bg-green-500 hover:bg-green-600 text-white",
                )}
              >
                <Globe className={cn("w-4 h-4", isPublic && "fill-current")} />
                Public
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="gap-2 bg-green-600 hover:bg-green-700 text-white transition-all duration-200"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="hover:bg-red-100 hover:text-red-600 transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Main Editor */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-4">
              {/* Title */}
              <div>
                <Input
                  placeholder="Note title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="text-2xl font-bold border-none bg-transparent px-0 focus-visible:ring-0 placeholder:text-muted-foreground/50"
                />
              </div>

              <Separator />

              {/* Content */}
              <div>
                <Textarea
                  placeholder="Start writing your note..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="min-h-[400px] border-none bg-transparent px-0 resize-none focus-visible:ring-0 text-base leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 border-l bg-gradient-to-b from-background/40 to-background/20 backdrop-blur-sm p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Category */}
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Category
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NOTE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tags */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Tags</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      onClick={handleAddTag}
                      className="bg-blue-500 hover:bg-blue-600 text-white transition-all duration-200"
                    >
                      <Tag className="w-4 h-4" />
                    </Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-all duration-200 px-3 py-1"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          #{tag}
                          <X className="w-3 h-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Color */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Color</Label>
                <div className="grid grid-cols-5 gap-3">
                  {NOTE_COLORS.map((noteColor) => (
                    <button
                      key={noteColor}
                      className={cn(
                        "w-10 h-10 rounded-full border-2 transition-all duration-200 shadow-sm hover:shadow-md",
                        color === noteColor
                          ? "border-primary scale-110 ring-2 ring-primary/30"
                          : "border-border hover:scale-105 hover:border-primary/50",
                      )}
                      style={{ backgroundColor: noteColor }}
                      onClick={() => setColor(noteColor)}
                    />
                  ))}
                </div>
              </div>

              {/* Templates */}
              {!isEditing && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Templates
                  </Label>
                  {templatesLoading ? (
                    <div className="animate-pulse">
                      <div className="h-10 bg-muted rounded"></div>
                    </div>
                  ) : templates.length > 0 ? (
                    <Select
                      onValueChange={(value) => {
                        const template = templates.find((t) => t.id === value);
                        if (template) handleTemplateSelect(template);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              {template.title}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm text-muted-foreground p-2 border rounded">
                      No templates available
                    </p>
                  )}
                </div>
              )}

              {/* Priority */}
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Priority
                </Label>
                <Select
                  value={priority}
                  onValueChange={(value: any) => setPriority(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NOTE_PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p}>
                        <div className="flex items-center gap-2">
                          <AlertCircle
                            className={cn(
                              "w-4 h-4",
                              p === "high"
                                ? "text-red-500"
                                : p === "medium"
                                  ? "text-yellow-500"
                                  : "text-green-500",
                            )}
                          />
                          {p.charAt(0).toUpperCase() + p.slice(1)}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Status</Label>
                <Select
                  value={status}
                  onValueChange={(value: any) => setStatus(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NOTE_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Location
                </Label>
                <div className="flex gap-2">
                  <MapPin className="w-4 h-4 mt-2 text-muted-foreground" />
                  <Input
                    placeholder="Add location..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>

              {/* Mood */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Mood</Label>
                <Select value={mood} onValueChange={setMood}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select mood" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No mood</SelectItem>
                    {NOTE_MOODS.map((m) => (
                      <SelectItem key={m} value={m}>
                        <div className="flex items-center gap-2">
                          <Smile className="w-4 h-4" />
                          {m.charAt(0).toUpperCase() + m.slice(1)}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Weather */}
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Weather
                </Label>
                <Select value={weather} onValueChange={setWeather}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select weather" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No weather</SelectItem>
                    {NOTE_WEATHER.map((w) => (
                      <SelectItem key={w} value={w}>
                        <div className="flex items-center gap-2">
                          <Cloud className="w-4 h-4" />
                          {w.charAt(0).toUpperCase() + w.slice(1)}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Reminder */}
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Reminder
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !reminderDate && "text-muted-foreground",
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {reminderDate
                        ? format(reminderDate, "PPP")
                        : "Set reminder"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={reminderDate}
                      onSelect={setReminderDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                    {reminderDate && (
                      <div className="p-3 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setReminderDate(undefined)}
                          className="w-full"
                        >
                          Clear reminder
                        </Button>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              </div>

              {/* Quick Actions */}
              <div className="pt-4 border-t border-border/50">
                <div className="text-xs font-medium text-muted-foreground mb-3">
                  Quick Actions
                </div>
                <div className="text-xs text-muted-foreground space-y-2">
                  <div className="flex items-center gap-2 p-2 rounded-md bg-muted/30">
                    <kbd className="px-2 py-1 bg-background rounded text-xs font-mono">
                      ⌘
                    </kbd>
                    <span>+</span>
                    <kbd className="px-2 py-1 bg-background rounded text-xs font-mono">
                      Enter
                    </kbd>
                    <span className="ml-2">Save note</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-md bg-muted/30">
                    <kbd className="px-2 py-1 bg-background rounded text-xs font-mono">
                      Esc
                    </kbd>
                    <span className="ml-2">Close editor</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
