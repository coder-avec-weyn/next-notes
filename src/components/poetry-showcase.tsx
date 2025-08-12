"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Heart,
  Share2,
  Eye,
  Calendar,
  Tag,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Download,
  Copy,
  Star,
  Pin,
  Globe,
  Moon,
  Sun,
  Leaf,
  Sparkles,
  Music,
  Coffee,
  Feather,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Poetry } from "@/types/poetry";
import { cn } from "@/lib/utils";

interface PoetryShowcaseProps {
  poems: Poetry[];
  className?: string;
  viewMode?: "scroll" | "page" | "minimal";
  showControls?: boolean;
  autoPlay?: boolean;
}

const MOOD_ICONS = {
  romantic: Heart,
  melancholic: Moon,
  joyful: Sun,
  nature: Leaf,
  mystical: Sparkles,
  contemplative: BookOpen,
};

const BACKGROUND_TEXTURES = {
  parchment: "linear-gradient(45deg, #f7f3e9, #f1ede4)",
  vintage: "linear-gradient(45deg, #f5f1eb, #ede7d9)",
  modern: "linear-gradient(45deg, #ffffff, #f8fafc)",
  dark: "linear-gradient(45deg, #1e293b, #334155)",
  cream: "linear-gradient(45deg, #fefcf3, #faf8f1)",
};

export function PoetryShowcase({
  poems,
  className,
  viewMode = "scroll",
  showControls = true,
  autoPlay = false,
}: PoetryShowcaseProps) {
  const [currentPoemIndex, setCurrentPoemIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [currentViewMode, setCurrentViewMode] = useState(viewMode);

  const currentPoem = poems[currentPoemIndex];
  const filteredPoems = selectedMood
    ? poems.filter((poem) => poem.mood === selectedMood)
    : poems;

  // Auto-advance poems in page mode
  useEffect(() => {
    if (autoPlay && currentViewMode === "page" && filteredPoems.length > 1) {
      const interval = setInterval(() => {
        setCurrentPoemIndex((prev) => (prev + 1) % filteredPoems.length);
      }, 10000); // 10 seconds per poem
      return () => clearInterval(interval);
    }
  }, [autoPlay, currentViewMode, filteredPoems.length]);

  const nextPoem = () => {
    setCurrentPoemIndex((prev) => (prev + 1) % filteredPoems.length);
  };

  const prevPoem = () => {
    setCurrentPoemIndex(
      (prev) => (prev - 1 + filteredPoems.length) % filteredPoems.length,
    );
  };

  const getFontFamily = (font: string) => {
    switch (font) {
      case "cursive":
        return "Dancing Script, cursive";
      case "monospace":
        return "Fira Code, monospace";
      case "fantasy":
        return "Cinzel, fantasy";
      case "sans-serif":
        return "Inter, sans-serif";
      default:
        return "Georgia, serif";
    }
  };

  const getBackgroundGradient = (mood: string) => {
    switch (mood) {
      case "romantic":
        return "linear-gradient(135deg, #fecaca, #fef3c7)";
      case "melancholic":
        return "linear-gradient(135deg, #cbd5e1, #e2e8f0)";
      case "joyful":
        return "linear-gradient(135deg, #fef3c7, #fde68a)";
      case "nature":
        return "linear-gradient(135deg, #dcfce7, #bbf7d0)";
      case "mystical":
        return "linear-gradient(135deg, #e9d5ff, #ddd6fe)";
      case "contemplative":
        return "linear-gradient(135deg, #f3e8ff, #e9d5ff)";
      default:
        return BACKGROUND_TEXTURES.parchment;
    }
  };

  const readAloud = (text: string) => {
    if ("speechSynthesis" in window) {
      if (isReading) {
        speechSynthesis.cancel();
        setIsReading(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.8;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        utterance.onend = () => setIsReading(false);
        speechSynthesis.speak(utterance);
        setIsReading(true);
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadPoem = (poem: Poetry) => {
    const content = `${poem.title}\n\n${poem.content}\n\n---\nTags: ${poem.tags.join(", ")}\nMood: ${poem.mood}\nTheme: ${poem.theme}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${poem.title || "poem"}.txt`;
    a.click();
  };

  if (!poems.length) {
    return (
      <div className="text-center py-16">
        <Feather className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No poems to display</h3>
        <p className="text-muted-foreground">
          Start creating your poetry collection.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Controls */}
      {showControls && (
        <div className="mb-6 space-y-4">
          {/* View Mode Tabs */}
          <Tabs
            value={currentViewMode}
            onValueChange={(value: any) => setCurrentViewMode(value)}
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="scroll">Scroll View</TabsTrigger>
              <TabsTrigger value="page">Page View</TabsTrigger>
              <TabsTrigger value="minimal">Minimal</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Mood Filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedMood === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedMood(null)}
              className="gap-1"
            >
              All Moods
            </Button>
            {Object.entries(MOOD_ICONS).map(([mood, Icon]) => (
              <Button
                key={mood}
                variant={selectedMood === mood ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedMood(mood)}
                className="gap-1"
              >
                <Icon className="w-3 h-3" />
                {mood.charAt(0).toUpperCase() + mood.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div
        className={cn(
          "relative",
          isFullscreen &&
            "fixed inset-0 z-50 bg-background p-8 overflow-y-auto",
        )}
      >
        {currentViewMode === "scroll" && (
          <div className="space-y-8">
            {filteredPoems.map((poem, index) => (
              <motion.div
                key={poem.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <PoemCard
                  poem={poem}
                  onReadAloud={readAloud}
                  isReading={isReading}
                />
              </motion.div>
            ))}
          </div>
        )}

        {currentViewMode === "page" && currentPoem && (
          <div className="relative">
            {/* Navigation */}
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="outline"
                size="sm"
                onClick={prevPoem}
                disabled={filteredPoems.length <= 1}
                className="gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {currentPoemIndex + 1} of {filteredPoems.length}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </Button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={nextPoem}
                disabled={filteredPoems.length <= 1}
                className="gap-1"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentPoem.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <PoemCard
                  poem={currentPoem}
                  onReadAloud={readAloud}
                  isReading={isReading}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {currentViewMode === "minimal" && (
          <div className="max-w-2xl mx-auto">
            {filteredPoems.map((poem, index) => (
              <motion.div
                key={poem.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="mb-12 last:mb-0"
              >
                <MinimalPoemView poem={poem} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PoemCard({
  poem,
  onReadAloud,
  isReading,
}: {
  poem: Poetry;
  onReadAloud: (text: string) => void;
  isReading: boolean;
}) {
  const MoodIcon = MOOD_ICONS[poem.mood as keyof typeof MOOD_ICONS] || BookOpen;

  return (
    <Card
      className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
      style={{
        background: getBackgroundGradient(poem.mood || "contemplative"),
      }}
    >
      <CardContent className="p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h2
              className="text-2xl font-bold mb-2"
              style={{
                fontFamily: getFontFamily(poem.style.font),
                textAlign: poem.style.alignment as any,
              }}
            >
              {poem.title}
            </h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MoodIcon className="w-4 h-4" />
              <span>{poem.mood}</span>
              {poem.theme && (
                <>
                  <Separator orientation="vertical" className="h-4" />
                  <span>{poem.theme}</span>
                </>
              )}
              <Separator orientation="vertical" className="h-4" />
              <Calendar className="w-4 h-4" />
              <span>{new Date(poem.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {poem.is_favorite && (
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
            )}
            {poem.is_pinned && (
              <Pin className="w-4 h-4 text-blue-500 fill-current" />
            )}
            {poem.is_public && <Globe className="w-4 h-4 text-green-500" />}
          </div>
        </div>

        {/* Content */}
        <div
          className="mb-6 text-lg leading-relaxed whitespace-pre-wrap prose prose-sm max-w-none"
          style={{
            fontFamily: getFontFamily(poem.style.font),
            textAlign: poem.style.alignment as any,
            lineHeight: poem.style.lineSpacing,
            fontSize:
              poem.style.fontSize === "small"
                ? "1rem"
                : poem.style.fontSize === "medium"
                  ? "1.125rem"
                  : "1.25rem",
            fontStyle: poem.style.italics ? "italic" : "normal",
            fontWeight: poem.style.bold ? "bold" : "normal",
            textTransform: poem.style.uppercase ? "uppercase" : "none",
            letterSpacing: `${poem.style.letterSpacing || 0}px`,
            paddingLeft: `${(poem.style.indentation || 0) * 20}px`,
          }}
          dangerouslySetInnerHTML={{ __html: poem.content }}
        />

        {/* Tags */}
        {poem.tags.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {poem.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReadAloud(`${poem.title}. ${poem.content}`)}
              className="gap-1"
            >
              {isReading ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
              {isReading ? "Stop" : "Read Aloud"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                navigator.clipboard.writeText(
                  `${poem.title}\n\n${poem.content}`,
                )
              }
              className="gap-1"
            >
              <Copy className="w-4 h-4" />
              Copy
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const content = `${poem.title}\n\n${poem.content}`;
                const blob = new Blob([content], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${poem.title || "poem"}.txt`;
                a.click();
              }}
              className="gap-1"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Eye className="w-4 h-4" />
            <span>
              Reading time: ~{Math.ceil(poem.content.split(" ").length / 200)}{" "}
              min
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MinimalPoemView({ poem }: { poem: Poetry }) {
  return (
    <div className="text-center">
      <h3
        className="text-xl font-semibold mb-4"
        style={{
          fontFamily: getFontFamily(poem.style.font),
        }}
      >
        {poem.title}
      </h3>
      <div
        className="text-lg leading-relaxed whitespace-pre-wrap mb-4 prose prose-sm max-w-none"
        style={{
          fontFamily: getFontFamily(poem.style.font),
          textAlign: poem.style.alignment as any,
          lineHeight: poem.style.lineSpacing,
          fontStyle: poem.style.italics ? "italic" : "normal",
          fontWeight: poem.style.bold ? "bold" : "normal",
        }}
        dangerouslySetInnerHTML={{ __html: poem.content }}
      />
      {poem.tags.length > 0 && (
        <div className="flex justify-center gap-1">
          {poem.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

function getBackgroundGradient(mood: string) {
  switch (mood) {
    case "romantic":
      return "linear-gradient(135deg, #fecaca, #fef3c7)";
    case "melancholic":
      return "linear-gradient(135deg, #cbd5e1, #e2e8f0)";
    case "joyful":
      return "linear-gradient(135deg, #fef3c7, #fde68a)";
    case "nature":
      return "linear-gradient(135deg, #dcfce7, #bbf7d0)";
    case "mystical":
      return "linear-gradient(135deg, #e9d5ff, #ddd6fe)";
    case "contemplative":
      return "linear-gradient(135deg, #f3e8ff, #e9d5ff)";
    default:
      return "linear-gradient(45deg, #f7f3e9, #f1ede4)";
  }
}

function getFontFamily(font: string) {
  switch (font) {
    case "cursive":
      return "Dancing Script, cursive";
    case "monospace":
      return "Fira Code, monospace";
    case "fantasy":
      return "Cinzel, fantasy";
    case "sans-serif":
      return "Inter, sans-serif";
    default:
      return "Georgia, serif";
  }
}
