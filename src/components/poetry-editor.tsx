"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Save,
  Palette,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sparkles,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Star,
  Pin,
  Globe,
  Wand2,
  BookOpen,
  Feather,
  Quote,
  Heart,
  Moon,
  Sun,
  Leaf,
  Music,
  Coffee,
  Pen,
  Copy,
  Check,
  RefreshCw,
  Volume2,
  Download,
  Share2,
  Settings,
  ChevronDown,
  ChevronUp,
  Italic,
  Bold,
  Underline,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { usePoetry } from "@/hooks/use-poetry";
import { cn } from "@/lib/utils";

interface PoetryEditorProps {
  poemId?: string | null;
  onClose: () => void;
}

// Poetry-specific presets
const POETRY_FONTS = [
  { value: "serif", label: "Serif (Classic)", family: "Georgia, serif" },
  { value: "cursive", label: "Cursive (Elegant)", family: "Dancing Script, cursive" },
  { value: "monospace", label: "Monospace (Modern)", family: "Fira Code, monospace" },
  { value: "fantasy", label: "Fantasy (Artistic)", family: "Cinzel, fantasy" },
  { value: "sans-serif", label: "Sans Serif (Clean)", family: "Inter, sans-serif" },
];

const MOOD_PRESETS = [
  { value: "romantic", label: "Romantic", color: "#fecaca", icon: Heart },
  { value: "melancholic", label: "Melancholic", color: "#cbd5e1", icon: Moon },
  { value: "joyful", label: "Joyful", color: "#fef3c7", icon: Sun },
  { value: "nature", label: "Nature", color: "#dcfce7", icon: Leaf },
  { value: "mystical", label: "Mystical", color: "#e9d5ff", icon: Sparkles },
  { value: "contemplative", label: "Contemplative", color: "#f3e8ff", icon: BookOpen },
];

const HISTORICAL_STYLES = [
  { value: "shakespearean", label: "Shakespearean Sonnet" },
  { value: "romantic", label: "Romantic Era" },
  { value: "victorian", label: "Victorian" },
  { value: "modernist", label: "Modernist" },
  { value: "beat", label: "Beat Poetry" },
  { value: "haiku", label: "Haiku" },
  { value: "free_verse", label: "Free Verse" },
  { value: "spoken_word", label: "Spoken Word" },
];

const BACKGROUND_TEXTURES = [
  { value: "parchment", label: "Parchment", gradient: "linear-gradient(45deg, #f7f3e9, #f1ede4)" },
  { value: "vintage", label: "Vintage Paper", gradient: "linear-gradient(45deg, #f5f1eb, #ede7d9)" },
  { value: "modern", label: "Modern Clean", gradient: "linear-gradient(45deg, #ffffff, #f8fafc)" },
  { value: "dark", label: "Dark Elegance", gradient: "linear-gradient(45deg, #1e293b, #334155)" },
  { value: "cream", label: "Cream", gradient: "linear-gradient(45deg, #fefcf3, #faf8f1)" },
];

export function PoetryEditor({ poemId = null, onClose }: PoetryEditorProps) {
  const { poetry, createPoetry, updatePoetry } = usePoetry();
  
  // Basic poem data
  const [title, setTitle] = useState("Untitled Poem");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  
  // Advanced styling
  const [style, setStyle] = useState({
    font: "serif",
    alignment: "left",
    lineSpacing: 1.6,
    fontSize: "medium",
    indentation: 0,
    stanzaSpacing: 1.5,
    italics: false,
    bold: false,
    uppercase: false,
    letterSpacing: 0,
  });
  
  // Mood and theme
  const [mood, setMood] = useState("romantic");
  const [theme, setTheme] = useState("");
  const [backgroundTexture, setBackgroundTexture] = useState("parchment");
  
  // Editor state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [showStylePanel, setShowStylePanel] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // AI features
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiMode, setAiMode] = useState<"format" | "improve" | "rewrite" | "style" | "custom">("improve");
  const [aiStyle, setAiStyle] = useState("romantic");
  const [customPrompt, setCustomPrompt] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  
  // Metadata
  const [isPublic, setIsPublic] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  
  // Refs
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Load existing poem data
  useEffect(() => {
    if (poemId) {
      const existingPoem = poetry.find(p => p.id === poemId);
      if (existingPoem) {
        setTitle(existingPoem.title);
        setContent(existingPoem.content);
        setTags(existingPoem.tags);
        setStyle(existingPoem.style);
        setMood(existingPoem.mood || "romantic");
        setTheme(existingPoem.theme || "");
        setIsPublic(existingPoem.is_public);
        setIsFavorite(existingPoem.is_favorite);
        setIsPinned(existingPoem.is_pinned);
      }
    }
  }, [poemId, poetry]);

  // Handle escape key
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

  const handleSave = async () => {
    setIsSaving(true);
    
    const poemData = {
      title: title.trim() || "Untitled Poem",
      content: content.trim(),
      tags,
      style,
      mood,
      theme: theme.trim(),
      is_public: isPublic,
      is_favorite: isFavorite,
      is_pinned: isPinned,
      color: getMoodColor(mood),
    };

    try {
      if (poemId) {
        await updatePoetry(poemId, poemData);
      } else {
        await createPoetry(poemData);
      }
      onClose();
    } catch (error) {
      console.error("Error saving poem:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const getMoodColor = (moodValue: string) => {
    const preset = MOOD_PRESETS.find(p => p.value === moodValue);
    return preset?.color || "#ffffff";
  };

  const getCurrentFont = () => {
    const font = POETRY_FONTS.find(f => f.value === style.font);
    return font?.family || "Georgia, serif";
  };

  const getCurrentBackground = () => {
    const bg = BACKGROUND_TEXTURES.find(b => b.value === backgroundTexture);
    return bg?.gradient || BACKGROUND_TEXTURES[0].gradient;
  };

  const handleAIAssist = async () => {
    if (!content.trim() && aiMode !== "custom") return;
    
    setAiLoading(true);
    setAiError(null);
    setAiSuggestion("");

    try {
      let prompt = "";
      
      switch (aiMode) {
        case "format":
          prompt = `Format this poem in the style of ${aiStyle} poetry. Apply authentic historical style, language tone, and structure. Keep the core meaning but enhance the poetic form: ${content}`;
          break;
        case "improve":
          prompt = `Improve this poem by enhancing metaphors, rhythm, and imagery while maintaining its essence: ${content}`;
          break;
        case "rewrite":
          prompt = `Rewrite this poem in a different poetic style (${aiStyle}) while preserving the core emotions and themes: ${content}`;
          break;
        case "style":
          prompt = `Transform this poem to have a ${aiStyle} mood and tone: ${content}`;
          break;
        case "custom":
          prompt = customPrompt.trim() + (content.trim() ? `: ${content}` : "");
          break;
      }

      // Truncate if too long
      if (prompt.length > 2000) {
        prompt = prompt.substring(0, 1950) + "...";
      }

      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          type: "poetry_assistant",
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setAiSuggestion(data.response);
    } catch (err) {
      console.error("Error with AI assistant:", err);
      setAiError("Sorry, I couldn't process your request. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const applyAISuggestion = () => {
    if (aiSuggestion) {
      setContent(aiSuggestion);
      setAiSuggestion("");
      setShowAIAssistant(false);
    }
  };

  const applyMoodPreset = (moodValue: string) => {
    setMood(moodValue);
    const preset = MOOD_PRESETS.find(p => p.value === moodValue);
    if (preset) {
      // Apply mood-specific styling
      switch (moodValue) {
        case "romantic":
          setStyle(prev => ({ ...prev, font: "cursive", alignment: "center", italics: true }));
          break;
        case "melancholic":
          setStyle(prev => ({ ...prev, font: "serif", alignment: "left", lineSpacing: 2.0 }));
          break;
        case "joyful":
          setStyle(prev => ({ ...prev, font: "sans-serif", alignment: "center", bold: true }));
          break;
        case "nature":
          setStyle(prev => ({ ...prev, font: "serif", alignment: "left", lineSpacing: 1.8 }));
          break;
        case "mystical":
          setStyle(prev => ({ ...prev, font: "fantasy", alignment: "center", letterSpacing: 1 }));
          break;
        case "contemplative":
          setStyle(prev => ({ ...prev, font: "serif", alignment: "left", lineSpacing: 1.6 }));
          break;
      }
    }
  };

  const formatStanzas = () => {
    const lines = content.split('\n');
    const formatted = lines.map((line, index) => {
      if (line.trim() === '' && index > 0 && index < lines.length - 1) {
        return '\n'; // Double line break for stanza separation
      }
      return line;
    }).join('\n');
    setContent(formatted);
  };

  return (
    <div
      className={cn(
        "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center",
        isFullscreen ? "p-0" : "p-4"
      )}
      onClick={onClose}
    >
      <motion.div
        className={cn(
          "bg-background rounded-xl shadow-2xl overflow-hidden flex flex-col",
          isFullscreen ? "w-full h-full rounded-none" : "w-full max-w-7xl max-h-[95vh]"
        )}
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        style={{
          background: getCurrentBackground(),
        }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Feather className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold">
              {poemId ? "Edit Poem" : "Create New Poem"}
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant={isFavorite ? "default" : "outline"}
                size="sm"
                onClick={() => setIsFavorite(!isFavorite)}
                className={cn(
                  "h-8 px-3 gap-1",
                  isFavorite && "bg-yellow-500 hover:bg-yellow-600 text-white"
                )}
              >
                <Star className={cn("w-4 h-4", isFavorite && "fill-current")} />
              </Button>
              <Button
                variant={isPinned ? "default" : "outline"}
                size="sm"
                onClick={() => setIsPinned(!isPinned)}
                className={cn(
                  "h-8 px-3 gap-1",
                  isPinned && "bg-blue-500 hover:bg-blue-600 text-white"
                )}
              >
                <Pin className={cn("w-4 h-4", isPinned && "fill-current")} />
              </Button>
              <Button
                variant={isPublic ? "default" : "outline"}
                size="sm"
                onClick={() => setIsPublic(!isPublic)}
                className={cn(
                  "h-8 px-3 gap-1",
                  isPublic && "bg-green-500 hover:bg-green-600 text-white"
                )}
              >
                <Globe className={cn("w-4 h-4", isPublic && "fill-current")} />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="h-8 gap-1"
            >
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              Preview
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="h-8 w-8 p-0"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="h-8 gap-2 bg-primary hover:bg-primary/90"
            >
              {isSaving ? (
                <>
                  <LoadingSpinner size="sm" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Editor */}
          <div className={cn(
            "flex-1 p-6 overflow-y-auto",
            showPreview ? "w-1/2" : "w-full"
          )}>
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Title */}
              <Input
                placeholder="Enter your poem title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-2xl font-bold border-none bg-transparent px-0 focus-visible:ring-0 placeholder:text-muted-foreground/50"
                style={{
                  fontFamily: getCurrentFont(),
                  textAlign: style.alignment as any,
                }}
              />

              {/* AI Assistant Toggle */}
              <div className="flex items-center justify-between">
                <Separator className="flex-1" />
                <Button
                  variant={showAIAssistant ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setShowAIAssistant(!showAIAssistant)}
                  className="ml-2 gap-1"
                >
                  <Sparkles className="h-4 w-4" />
                  AI Poetry Assistant
                </Button>
              </div>

              {/* Content Editor */}
              <div className="relative">
                <Textarea
                  ref={contentRef}
                  placeholder="Write your poem here... Let your words flow like verses on parchment."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[500px] resize-none border-none bg-transparent px-0 text-lg leading-relaxed focus-visible:ring-0"
                  style={{
                    fontFamily: getCurrentFont(),
                    textAlign: style.alignment as any,
                    lineHeight: style.lineSpacing,
                    fontSize: style.fontSize === 'small' ? '1rem' 
                      : style.fontSize === 'medium' ? '1.125rem' 
                      : '1.25rem',
                    fontStyle: style.italics ? 'italic' : 'normal',
                    fontWeight: style.bold ? 'bold' : 'normal',
                    textTransform: style.uppercase ? 'uppercase' : 'none',
                    letterSpacing: `${style.letterSpacing}px`,
                    paddingLeft: `${style.indentation * 20}px`,
                  }}
                />
              </div>

              {/* AI Assistant Panel */}
              <AnimatePresence>
                {showAIAssistant && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border rounded-lg overflow-hidden bg-gradient-to-br from-background/40 to-muted/20"
                  >
                    <div className="bg-muted/30 p-3 border-b flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <h3 className="text-sm font-medium">AI Poetry Assistant</h3>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAIAssistant(false)}
                        className="h-7 w-7 p-0"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    <div className="p-4 space-y-4">
                      {/* AI Mode Selection */}
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {[
                          { value: "format", label: "Format Style", icon: Type },
                          { value: "improve", label: "Improve", icon: Wand2 },
                          { value: "rewrite", label: "Rewrite", icon: RefreshCw },
                          { value: "style", label: "Change Mood", icon: Heart },
                          { value: "custom", label: "Custom", icon: Pen },
                        ].map(({ value, label, icon: Icon }) => (
                          <Button
                            key={value}
                            size="sm"
                            variant={aiMode === value ? "default" : "outline"}
                            onClick={() => setAiMode(value as any)}
                            className="h-8 text-xs gap-1"
                          >
                            <Icon className="h-3 w-3" />
                            {label}
                          </Button>
                        ))}
                      </div>

                      {/* Style Selection for Format Mode */}
                      {aiMode === "format" && (
                        <div>
                          <Label className="text-sm font-medium mb-2 block">Historical Style</Label>
                          <Select value={aiStyle} onValueChange={setAiStyle}>
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {HISTORICAL_STYLES.map((style) => (
                                <SelectItem key={style.value} value={style.value}>
                                  {style.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {/* Mood Selection for Style Mode */}
                      {aiMode === "style" && (
                        <div>
                          <Label className="text-sm font-medium mb-2 block">Target Mood</Label>
                          <div className="grid grid-cols-3 gap-2">
                            {MOOD_PRESETS.map((preset) => (
                              <Button
                                key={preset.value}
                                size="sm"
                                variant={aiStyle === preset.value ? "default" : "outline"}
                                onClick={() => setAiStyle(preset.value)}
                                className="h-8 text-xs gap-1"
                              >
                                <preset.icon className="h-3 w-3" />
                                {preset.label}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Custom Prompt */}
                      {aiMode === "custom" && (
                        <div>
                          <Label className="text-sm font-medium mb-2 block">Custom Instruction</Label>
                          <Input
                            placeholder="e.g., 'Write a haiku about autumn', 'Make this more melancholic', 'Add more metaphors'"
                            value={customPrompt}
                            onChange={(e) => setCustomPrompt(e.target.value)}
                            className="h-8"
                          />
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex justify-between items-center">
                        <Button
                          size="sm"
                          onClick={handleAIAssist}
                          disabled={aiLoading || (aiMode === "custom" && !customPrompt.trim())}
                          className="h-8 gap-1 bg-gradient-to-r from-primary to-primary/80"
                        >
                          {aiLoading ? (
                            <>
                              <LoadingSpinner size="sm" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-3 w-3" />
                              Generate
                            </>
                          )}
                        </Button>

                        {aiSuggestion && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigator.clipboard.writeText(aiSuggestion)}
                              className="h-8 gap-1"
                            >
                              <Copy className="h-3 w-3" />
                              Copy
                            </Button>
                            <Button
                              size="sm"
                              onClick={applyAISuggestion}
                              className="h-8 gap-1"
                            >
                              <Check className="h-3 w-3" />
                              Apply
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Error Display */}
                      {aiError && (
                        <div className="p-2 bg-destructive/10 text-destructive text-sm rounded">
                          {aiError}
                        </div>
                      )}

                      {/* AI Suggestion Display */}
                      {aiSuggestion && (
                        <div className="border rounded-lg p-4 bg-background/50">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-muted-foreground">AI Suggestion</span>
                            <Button
                              size="sm"
                              onClick={applyAISuggestion}
                              className="h-6 px-2 text-xs"
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Apply
                            </Button>
                          </div>
                          <div
                            className="text-sm whitespace-pre-wrap p-3 rounded bg-muted/30"
                            style={{
                              fontFamily: getCurrentFont(),
                              lineHeight: style.lineSpacing,
                            }}
                          >
                            {aiSuggestion}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Tags */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Tags</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Add a tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    className="flex-1 h-8"
                  />
                  <Button onClick={handleAddTag} size="sm" className="h-8">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      #{tag} ×
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Live Preview */}
          {showPreview && (
            <div className="w-1/2 border-l bg-gradient-to-br from-background/20 to-muted/10 p-6 overflow-y-auto">
              <div className="max-w-xl mx-auto">
                <div className="mb-4 text-center">
                  <h3 className="text-lg font-semibold text-muted-foreground mb-2">Live Preview</h3>
                  <Separator />
                </div>
                
                <div
                  ref={previewRef}
                  className="p-8 rounded-lg shadow-lg min-h-[500px]"
                  style={{
                    background: getCurrentBackground(),
                    fontFamily: getCurrentFont(),
                    textAlign: style.alignment as any,
                    lineHeight: style.lineSpacing,
                    fontSize: style.fontSize === 'small' ? '1rem' 
                      : style.fontSize === 'medium' ? '1.125rem' 
                      : '1.25rem',
                    fontStyle: style.italics ? 'italic' : 'normal',
                    fontWeight: style.bold ? 'bold' : 'normal',
                    textTransform: style.uppercase ? 'uppercase' : 'none',
                    letterSpacing: `${style.letterSpacing}px`,
                  }}
                >
                  <h1 className="text-2xl font-bold mb-6 text-center">
                    {title || "Untitled Poem"}
                  </h1>
                  <div
                    className="whitespace-pre-wrap"
                    style={{
                      paddingLeft: `${style.indentation * 20}px`,
                    }}
                  >
                    {content || "Your poem will appear here as you write..."}
                  </div>
                  
                  {tags.length > 0 && (
                    <div className="mt-8 pt-4 border-t border-muted">
                      <div className="flex flex-wrap gap-1 justify-center">
                        {tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Style Panel */}
          {showStylePanel && (
            <div className="w-80 border-l bg-gradient-to-b from-background/40 to-background/20 p-4 overflow-y-auto">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Poetry Studio</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowStylePanel(false)}
                    className="h-7 w-7 p-0 lg:hidden"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                </div>

                <Tabs defaultValue="style" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="style">Style</TabsTrigger>
                    <TabsTrigger value="mood">Mood</TabsTrigger>
                    <TabsTrigger value="tools">Tools</TabsTrigger>
                  </TabsList>

                  <TabsContent value="style" className="space-y-4">
                    {/* Font Selection */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Typography</Label>
                      <Select value={style.font} onValueChange={(value) => setStyle({...style, font: value})}>
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {POETRY_FONTS.map((font) => (
                            <SelectItem key={font.value} value={font.value}>
                              <span style={{ fontFamily: font.family }}>{font.label}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Font Size */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Font Size</Label>
                      <Select value={style.fontSize} onValueChange={(value) => setStyle({...style, fontSize: value})}>
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Alignment */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Alignment</Label>
                      <div className="flex gap-1">
                        <Button
                          variant={style.alignment === 'left' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setStyle({...style, alignment: 'left'})}
                          className="flex-1"
                        >
                          <AlignLeft className="w-4 h-4" />
                        </Button>
                        <Button
                          variant={style.alignment === 'center' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setStyle({...style, alignment: 'center'})}
                          className="flex-1"
                        >
                          <AlignCenter className="w-4 h-4" />
                        </Button>
                        <Button
                          variant={style.alignment === 'right' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setStyle({...style, alignment: 'right'})}
                          className="flex-1"
                        >
                          <AlignRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Line Spacing */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block">
                        Line Spacing: {style.lineSpacing.toFixed(1)}
                      </Label>
                      <Slider
                        value={[style.lineSpacing]}
                        onValueChange={([value]) => setStyle({...style, lineSpacing: value})}
                        min={1}
                        max={3}
                        step={0.1}
                        className="mt-2"
                      />
                    </div>

                    {/* Letter Spacing */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block">
                        Letter Spacing: {style.letterSpacing}px
                      </Label>
                      <Slider
                        value={[style.letterSpacing]}
                        onValueChange={([value]) => setStyle({...style, letterSpacing: value})}
                        min={-2}
                        max={5}
                        step={0.5}
                        className="mt-2"
                      />
                    </div>

                    {/* Indentation */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block">
                        Indentation: {style.indentation}
                      </Label>
                      <Slider
                        value={[style.indentation]}
                        onValueChange={([value]) => setStyle({...style, indentation: value})}
                        min={0}
                        max={10}
                        step={1}
                        className="mt-2"
                      />
                    </div>

                    {/* Text Style Toggles */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Bold</Label>
                        <Switch
                          checked={style.bold}
                          onCheckedChange={(checked) => setStyle({...style, bold: checked})}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Italic</Label>
                        <Switch
                          checked={style.italics}
                          onCheckedChange={(checked) => setStyle({...style, italics: checked})}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Uppercase</Label>
                        <Switch
                          checked={style.uppercase}
                          onCheckedChange={(checked) => setStyle({...style, uppercase: checked})}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="mood" className="space-y-4">
                    {/* Mood Presets */}
                    <div>
                      <Label className="text-sm font-medium mb-3 block">Mood Presets</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {MOOD_PRESETS.map((preset) => (
                          <Button
                            key={preset.value}
                            size="sm"
                            variant={mood === preset.value ? "default" : "outline"}
                            onClick={() => applyMoodPreset(preset.value)}
                            className="h-12 flex-col gap-1 text-xs"
                            style={{
                              backgroundColor: mood === preset.value ? preset.color : undefined,
                            }}
                          >
                            <preset.icon className="h-4 w-4" />
                            {preset.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Background Texture */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Background</Label>
                      <Select value={backgroundTexture} onValueChange={setBackgroundTexture}>
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {BACKGROUND_TEXTURES.map((texture) => (
                            <SelectItem key={texture.value} value={texture.value}>
                              {texture.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Theme */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Theme</Label>
                      <Input
                        placeholder="e.g., love, nature, loss, hope..."
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                        className="h-8"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="tools" className="space-y-4">
                    {/* Poetry Tools */}
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={formatStanzas}
                        className="w-full justify-start gap-2"
                      >
                        <Quote className="h-4 w-4" />
                        Format Stanzas
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const words = content.split(/\s+/).length;
                          const lines = content.split('\n').length;
                          alert(`Word count: ${words}\nLine count: ${lines}`);
                        }}
                        className="w-full justify-start gap-2"
                      >
                        <BookOpen className="h-4 w-4" />
                        Word Count
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigator.clipboard.writeText(content)}
                        className="w-full justify-start gap-2"
                      >
                        <Copy className="h-4 w-4" />
                        Copy Text
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const blob = new Blob([`${title}\n\n${content}`], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${title || 'poem'}.txt`;
                          a.click();
                        }}
                        className="w-full justify-start gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Export as Text
                      </Button>
                    </div>

                    {/* Quick Actions */}
                    <Separator />
                    <div className="text-xs text-muted-foreground space-y-2">
                      <div className="font-medium">Quick Actions</div>
                      <div className="space-y-1">
                        <div>⌘ + S: Save poem</div>
                        <div>⌘ + Enter: Save & close</div>
                        <div>Esc: Close editor</div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}