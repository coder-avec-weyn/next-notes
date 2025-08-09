"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Sparkles,
  Check,
  Wand2,
  Pencil,
  ChevronDown,
  ChevronUp,
  Code,
  Quote,
  Link,
  Heading1,
  Heading2,
  Trash,
  Copy,
  Maximize2,
  Minimize2,
  RefreshCw,
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
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  slideUp,
  fadeIn,
  buttonPress,
  modalAnimation,
} from "@/utils/animations";
import { cn } from "@/lib/utils";
import "../app/globals.css";
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
  const [showWritingAssistant, setShowWritingAssistant] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiMode, setAiMode] = useState<
    "improve" | "rewrite" | "style" | "custom"
  >("improve");
  const [aiStyle, setAiStyle] = useState<
    "formal" | "casual" | "concise" | "creative"
  >("formal");
  const [customPrompt, setCustomPrompt] = useState("");
  const [aiResponseChunks, setAiResponseChunks] = useState<string[]>([]);
  const [editedAiResponse, setEditedAiResponse] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const aiAssistantRef = useRef<HTMLDivElement>(null);

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

  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isFullscreen, onClose]);

  // Scroll to AI assistant when it's shown
  useEffect(() => {
    if (showWritingAssistant && aiAssistantRef.current) {
      setTimeout(() => {
        aiAssistantRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  }, [showWritingAssistant]);

  const handleSave = async () => {
    setIsSaving(true);

    const wordCount = content
      .replace(/<[^>]*>/g, "")
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

  const handleAiAssist = async () => {
    // Allow empty content for custom prompts that generate new content
    if ((aiMode !== "custom" && !content.trim()) || aiLoading) return;

    setAiLoading(true);
    setAiError(null);
    setAiSuggestion("");
    setAiResponseChunks([]);
    setEditedAiResponse("");

    try {
      // Prepare the prompt based on the selected mode and style
      let prompt = "";

      if (aiMode === "improve") {
        prompt = `Improve the following text for better grammar, clarity, and flow without changing the meaning. Use proper HTML formatting with <h1>, <h2>, <strong>, <em>, <ul>, <ol>, <li>, <code>, <pre>, <blockquote> tags where appropriate: ${content}`;
      } else if (aiMode === "rewrite") {
        prompt = `Rewrite the following text to make it more engaging while preserving the key points. Use proper HTML formatting with <h1>, <h2>, <strong>, <em>, <ul>, <ol>, <li>, <code>, <pre>, <blockquote> tags where appropriate: ${content}`;
      } else if (aiMode === "style") {
        prompt = `Rewrite the following text in a ${aiStyle} style. Use proper HTML formatting with <h1>, <h2>, <strong>, <em>, <ul>, <ol>, <li>, <code>, <pre>, <blockquote> tags where appropriate: ${content}`;
      } else if (aiMode === "custom" && customPrompt.trim()) {
        // If content is empty, just use the custom prompt directly
        prompt = content.trim()
          ? `${customPrompt.trim()}. Format your response using HTML tags like <h1>, <h2>, <strong>, <em>, <ul>, <ol>, <li>, <code>, <pre>, <blockquote> where appropriate: ${content}`
          : `${customPrompt.trim()}. Format your response using HTML tags like <h1>, <h2>, <strong>, <em>, <ul>, <ol>, <li>, <code>, <pre>, <blockquote> where appropriate.`;
      } else {
        setAiError("Please enter a custom prompt or select a different mode.");
        setAiLoading(false);
        return;
      }

      // Check if content exceeds character limit
      if (prompt.length > 2000) {
        setAiError(
          "Text is too long for AI processing. Please shorten your note or select a portion to improve.",
        );
        setAiLoading(false);
        return;
      }

      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          type: "writing_assistant",
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();

      if (data.hasMore && data.chunks) {
        // Handle multi-chunk responses
        setAiResponseChunks(data.chunks);
        setAiSuggestion(data.chunks.join(""));
        setEditedAiResponse(data.chunks.join(""));
      } else {
        setAiSuggestion(data.response);
        setEditedAiResponse(data.response);
      }
    } catch (err) {
      console.error("Error fetching from Gemini API:", err);
      setAiError("Sorry, I couldn't process your request. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const applyAiSuggestion = () => {
    if (editedAiResponse) {
      setContent(editedAiResponse);
      setAiSuggestion("");
      setEditedAiResponse("");
      setAiResponseChunks([]);
      setShowWritingAssistant(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  return (
    <motion.div
      className={cn(
        "fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4",
        isFullscreen ? "p-0" : "p-4",
      )}
      initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
      animate={{ opacity: 1, backdropFilter: "blur(4px)" }}
      exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="note-editor-title"
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className={cn(
          "bg-card rounded-xl shadow-2xl overflow-auto flex flex-col",
          isFullscreen
            ? "w-full h-full rounded-none"
            : "w-full max-w-5xl max-h-[90vh]",
        )}
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        style={{ backgroundColor: color }}
        role="document"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 border-b bg-background/50 backdrop-blur-sm gap-3 sm:gap-0">
          <div className="flex items-center gap-4">
            <h2
              className="text-xl font-semibold text-foreground"
              id="note-editor-title"
            >
              {isEditing ? "Edit Note" : "Create Note"}
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant={isFavorite ? "default" : "outline"}
                size="sm"
                onClick={() => setIsFavorite(!isFavorite)}
                className={cn(
                  "gap-1 transition-all duration-200 h-9 px-3 sm:h-8 sm:px-3",
                  isFavorite && "bg-yellow-500 hover:bg-yellow-600 text-white",
                )}
              >
                <Star className={cn("w-4 h-4", isFavorite && "fill-current")} />
                <span className="sm:inline">Favorite</span>
              </Button>
              <Button
                variant={isPinned ? "default" : "outline"}
                size="sm"
                onClick={() => setIsPinned(!isPinned)}
                className={cn(
                  "gap-1 transition-all duration-200 h-9 px-3 sm:h-8 sm:px-3",
                  isPinned && "bg-blue-500 hover:bg-blue-600 text-white",
                )}
              >
                <Pin className={cn("w-4 h-4", isPinned && "fill-current")} />
                <span className="sm:inline">Pin</span>
              </Button>
              <Button
                variant={isPublic ? "default" : "outline"}
                size="sm"
                onClick={() => setIsPublic(!isPublic)}
                className={cn(
                  "gap-1 transition-all duration-200 h-9 px-3 sm:h-8 sm:px-3",
                  isPublic && "bg-green-500 hover:bg-green-600 text-white",
                )}
              >
                <Globe className={cn("w-4 h-4", isPublic && "fill-current")} />
                <span className="sm:inline">Public</span>
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="hover:bg-muted transition-all duration-200"
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="hover:bg-muted transition-all duration-200 lg:hidden"
              title={sidebarVisible ? "Hide sidebar" : "Show sidebar"}
            >
              {sidebarVisible ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
            <motion.div {...buttonPress}>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="gap-2 bg-green-600 hover:bg-green-700 text-white transition-all duration-200"
              >
                <AnimatePresence mode="wait">
                  {isSaving ? (
                    <motion.div
                      key="saving"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-2"
                    >
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </motion.div>
                  ) : (
                    <motion.div
                      key="save"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
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
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Main Editor */}
          <div
            className="flex-1 p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-120px)]"
            ref={contentRef}
          >
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

              <div className="flex items-center justify-between">
                <Separator className="flex-1" />
                <Button
                  variant={showWritingAssistant ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setShowWritingAssistant(!showWritingAssistant)}
                  className="ml-2 gap-1 text-xs transition-all duration-200"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  AI Writing Assistant
                </Button>
              </div>

              {/* Content - Rich Text Editor */}
              <div>
                <RichTextEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Start writing your note..."
                  minHeight="400px"
                  className="border-none bg-transparent px-0 text-base leading-relaxed"
                />
              </div>

              {/* AI Writing Assistant */}
              <AnimatePresence>
                {showWritingAssistant && (
                  <motion.div
                    ref={aiAssistantRef}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border rounded-lg overflow-hidden bg-gradient-to-br from-background to-muted/20 shadow-sm"
                  >
                    <div className="bg-muted/30 p-3 border-b flex items-center justify-between sticky top-0 z-10">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <h3 className="text-sm font-medium">
                          AI Writing Assistant
                        </h3>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowWritingAssistant(false)}
                          className="h-7 w-7 p-0"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    <div className="p-3 space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant={aiMode === "improve" ? "default" : "outline"}
                          onClick={() => setAiMode("improve")}
                          className="text-xs gap-1 transition-all duration-200"
                        >
                          <Pencil className="h-3 w-3" />
                          Improve
                        </Button>
                        <Button
                          size="sm"
                          variant={aiMode === "rewrite" ? "default" : "outline"}
                          onClick={() => setAiMode("rewrite")}
                          className="text-xs gap-1 transition-all duration-200"
                        >
                          <Wand2 className="h-3 w-3" />
                          Rewrite
                        </Button>
                        <Button
                          size="sm"
                          variant={aiMode === "style" ? "default" : "outline"}
                          onClick={() => setAiMode("style")}
                          className="text-xs gap-1 transition-all duration-200"
                        >
                          <Type className="h-3 w-3" />
                          Style
                        </Button>
                        <Button
                          size="sm"
                          variant={aiMode === "custom" ? "default" : "outline"}
                          onClick={() => setAiMode("custom")}
                          className="text-xs gap-1 transition-all duration-200"
                        >
                          <Sparkles className="h-3 w-3" />
                          Custom
                        </Button>
                      </div>

                      {aiMode === "style" && (
                        <div className="flex flex-wrap gap-2">
                          <Badge
                            variant={
                              aiStyle === "formal" ? "default" : "outline"
                            }
                            className={`cursor-pointer transition-all duration-200 hover:scale-105 ${aiStyle === "formal" ? "bg-primary" : ""}`}
                            onClick={() => setAiStyle("formal")}
                          >
                            Formal
                          </Badge>
                          <Badge
                            variant={
                              aiStyle === "casual" ? "default" : "outline"
                            }
                            className={`cursor-pointer transition-all duration-200 hover:scale-105 ${aiStyle === "casual" ? "bg-primary" : ""}`}
                            onClick={() => setAiStyle("casual")}
                          >
                            Casual
                          </Badge>
                          <Badge
                            variant={
                              aiStyle === "concise" ? "default" : "outline"
                            }
                            className={`cursor-pointer transition-all duration-200 hover:scale-105 ${aiStyle === "concise" ? "bg-primary" : ""}`}
                            onClick={() => setAiStyle("concise")}
                          >
                            Concise
                          </Badge>
                          <Badge
                            variant={
                              aiStyle === "creative" ? "default" : "outline"
                            }
                            className={`cursor-pointer transition-all duration-200 hover:scale-105 ${aiStyle === "creative" ? "bg-primary" : ""}`}
                            onClick={() => setAiStyle("creative")}
                          >
                            Creative
                          </Badge>
                        </div>
                      )}

                      {aiMode === "custom" && (
                        <div className="space-y-2">
                          <div className="relative">
                            <Input
                              placeholder="Enter your custom instruction (e.g., 'Make it more professional', 'Summarize this', 'Add more details')..."
                              value={customPrompt}
                              onChange={(e) => setCustomPrompt(e.target.value)}
                              className="text-xs pr-24"
                            />
                            <div className="absolute right-1 top-1/2 -translate-y-1/2">
                              {customPrompt.trim() && (
                                <Button
                                  size="sm"
                                  className="h-6 text-xs"
                                  onClick={() => {
                                    setAiMode("custom");
                                    handleAiAssist();
                                  }}
                                >
                                  Generate
                                </Button>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            💡 Examples: &quot;Write a program for Hello World
                            in Python&quot;, &quot;Summarize this&quot;,
                            &quot;Add more details&quot;, &quot;Fix
                            grammar&quot;
                          </p>
                        </div>
                      )}

                      <div className="flex justify-between">
                        <Button
                          size="sm"
                          onClick={handleAiAssist}
                          disabled={
                            (aiMode !== "custom" && !content.trim()) ||
                            aiLoading ||
                            (aiMode === "custom" && !customPrompt.trim())
                          }
                          className="text-xs gap-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200"
                        >
                          {aiLoading ? (
                            <>
                              <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-3 w-3" />
                              {aiMode === "custom"
                                ? "Apply Custom Prompt"
                                : "Generate Suggestion"}
                            </>
                          )}
                        </Button>

                        {aiSuggestion && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setAiSuggestion("");
                              setEditedAiResponse("");
                              setAiResponseChunks([]);
                            }}
                            className="text-xs gap-1 text-destructive hover:bg-destructive/10"
                          >
                            <Trash className="h-3 w-3" />
                            Clear
                          </Button>
                        )}
                      </div>

                      {aiError && (
                        <div className="p-2 bg-destructive/10 text-destructive text-xs rounded">
                          {aiError}
                        </div>
                      )}

                      {aiLoading && (
                        <div className="p-4 flex flex-col items-center justify-center">
                          <LoadingSpinner size="md" />
                          <p className="mt-2 text-sm text-muted-foreground">
                            Generating AI response...
                          </p>
                        </div>
                      )}

                      {aiSuggestion && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="border rounded-lg p-4 bg-gradient-to-br from-muted/30 to-muted/10 text-sm max-h-[400px] overflow-y-auto shadow-sm"
                        >
                          <div className="flex items-center justify-between gap-2 mb-3 sticky top-0 bg-gradient-to-b from-muted/50 to-transparent backdrop-blur-sm p-1 rounded">
                            <div className="flex items-center gap-2">
                              <Sparkles className="h-3.5 w-3.5 text-primary" />
                              <span className="text-xs font-medium text-muted-foreground">
                                AI Preview - Edit before applying
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 px-2 text-xs"
                                onClick={() =>
                                  copyToClipboard(editedAiResponse)
                                }
                                title="Copy to clipboard"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="default"
                                className="h-6 px-2 text-xs"
                                onClick={applyAiSuggestion}
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Apply
                              </Button>
                            </div>
                          </div>

                          {/* Editable AI response */}
                          <div className="relative">
                            <RichTextEditor
                              value={editedAiResponse}
                              onChange={setEditedAiResponse}
                              className="min-h-[150px] p-3 text-sm border rounded bg-background/50 w-full resize-y"
                              minHeight="150px"
                            />
                          </div>

                          {/* HTML Preview */}
                          <div className="mt-3 border-t pt-3">
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="text-xs font-medium text-muted-foreground">
                                Formatted Preview
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 px-2 text-xs"
                                onClick={applyAiSuggestion}
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Apply to Note
                              </Button>
                            </div>
                            <div
                              className="prose prose-sm max-w-none dark:prose-invert overflow-auto p-3 rounded bg-background/50 border"
                              dangerouslySetInnerHTML={{
                                __html: editedAiResponse,
                              }}
                            />
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Sidebar */}
          <AnimatePresence>
            {(sidebarVisible || window.innerWidth >= 1024) && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "100%", opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "lg:w-80 border-t lg:border-t-0 lg:border-l bg-gradient-to-b from-background/40 to-background/20 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto",
                  !sidebarVisible && "lg:block hidden",
                )}
              >
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
                    <Label className="text-sm font-medium mb-2 block">
                      Tags
                    </Label>
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
                    <Label className="text-sm font-medium mb-2 block">
                      Color
                    </Label>
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
                            const template = templates.find(
                              (t) => t.id === value,
                            );
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
                    <Label className="text-sm font-medium mb-2 block">
                      Status
                    </Label>
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
                    <Label className="text-sm font-medium mb-2 block">
                      Mood
                    </Label>
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
