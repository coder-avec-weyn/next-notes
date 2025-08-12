"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  Hash,
  Clock,
  FileText,
  Focus,
  Lightbulb,
  Mic,
  MicOff,
  Play,
  Pause,
  BarChart3,
  Zap,
  Users,
  History,
  Layers,
  Target,
  Brain,
  Shuffle,
  Timer,
  Bookmark,
  Search,
  Filter,
  Sliders,
  Headphones,
  Camera,
  Paintbrush,
  Scissors,
  Merge,
  GitBranch,
  MessageCircle,
  UserPlus,
  Crown,
  Award,
  TrendingUp,
  Gauge,
  Crosshair,
  Radar,
  Activity,
  Waves,
  Fingerprint,
  Cpu,
  Database,
  Network,
  Workflow,
  Layers3,
  Compass,
  Telescope,
  Microscope,
  FlaskConical,
  Atom,
  Dna,
  Orbit,
  Rocket,
  Satellite,
  Dice1,
  Dice2,
  Dice3,
  Dice4,
  Dice5,
  Dice6,
  Puzzle,
  Target as TargetIcon,
  Crosshair as CrosshairIcon,
  Zap as ZapIcon,
  Brain as BrainIcon,
  Cpu as CpuIcon,
  Database as DatabaseIcon,
  Network as NetworkIcon,
  Workflow as WorkflowIcon,
  Layers3 as Layers3Icon,
  Compass as CompassIcon,
  Telescope as TelescopeIcon,
  Microscope as MicroscopeIcon,
  FlaskConical as FlaskConicalIcon,
  Atom as AtomIcon,
  Dna as DnaIcon,
  Orbit as OrbitIcon,
  Rocket as RocketIcon,
  Satellite as SatelliteIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  {
    value: "cursive",
    label: "Cursive (Elegant)",
    family: "Dancing Script, cursive",
  },
  {
    value: "monospace",
    label: "Monospace (Modern)",
    family: "Fira Code, monospace",
  },
  { value: "fantasy", label: "Fantasy (Artistic)", family: "Cinzel, fantasy" },
  {
    value: "sans-serif",
    label: "Sans Serif (Clean)",
    family: "Inter, sans-serif",
  },
];

const MOOD_PRESETS = [
  { value: "romantic", label: "Romantic", color: "#fecaca", icon: Heart },
  { value: "melancholic", label: "Melancholic", color: "#cbd5e1", icon: Moon },
  { value: "joyful", label: "Joyful", color: "#fef3c7", icon: Sun },
  { value: "nature", label: "Nature", color: "#dcfce7", icon: Leaf },
  { value: "mystical", label: "Mystical", color: "#e9d5ff", icon: Sparkles },
  {
    value: "contemplative",
    label: "Contemplative",
    color: "#f3e8ff",
    icon: BookOpen,
  },
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
  {
    value: "parchment",
    label: "Parchment",
    gradient: "linear-gradient(45deg, #f7f3e9, #f1ede4)",
  },
  {
    value: "vintage",
    label: "Vintage Paper",
    gradient: "linear-gradient(45deg, #f5f1eb, #ede7d9)",
  },
  {
    value: "modern",
    label: "Modern Clean",
    gradient: "linear-gradient(45deg, #ffffff, #f8fafc)",
  },
  {
    value: "dark",
    label: "Dark Elegance",
    gradient: "linear-gradient(45deg, #1e293b, #334155)",
  },
  {
    value: "cream",
    label: "Cream",
    gradient: "linear-gradient(45deg, #fefcf3, #faf8f1)",
  },
];

export function PoetryEditor({ poemId = null, onClose }: PoetryEditorProps) {
  const { poetry, createPoetry, updatePoetry, getPoetry } = usePoetry();

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

  // NEW FEATURES STATE
  const [showLineNumbers, setShowLineNumbers] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [aiThemeSuggestions, setAiThemeSuggestions] = useState<string[]>([]);
  const [loadingThemes, setLoadingThemes] = useState(false);

  // ADVANCED FEATURES STATE (10 NEW FEATURES)
  // 1. Voice Recording & Dictation
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );

  // 2. Text-to-Speech
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const [speechVoice, setSpeechVoice] = useState<string>("");

  // 3. Advanced Poetry Analysis
  const [poetryAnalysis, setPoetryAnalysis] = useState<any>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  // 4. Rhyme & Synonym Assistant
  const [rhymeSuggestions, setRhymeSuggestions] = useState<string[]>([]);
  const [synonymSuggestions, setSynonymSuggestions] = useState<string[]>([]);
  const [selectedWord, setSelectedWord] = useState<string>("");
  const [showWordAssistant, setShowWordAssistant] = useState(false);

  // 5. Version History
  const [versionHistory, setVersionHistory] = useState<
    Array<{ id: string; content: string; timestamp: Date; title: string }>
  >([]);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  // 6. Collaboration Features
  const [collaborators, setCollaborators] = useState<
    Array<{ id: string; name: string; avatar: string; isOnline: boolean }>
  >([]);
  const [showCollaboration, setShowCollaboration] = useState(false);
  const [collaborationMode, setCollaborationMode] = useState(false);

  // 7. Advanced Export Options
  const [exportOptions, setExportOptions] = useState({
    format: "pdf",
    includeMetadata: true,
    includeAnalysis: false,
    customStyling: true,
    watermark: false,
  });
  const [showExportDialog, setShowExportDialog] = useState(false);

  // 8. Poetry Templates & Forms
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [showTemplates, setShowTemplates] = useState(false);
  const [templateStructure, setTemplateStructure] = useState<any>(null);

  // 9. Advanced Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchFilters, setSearchFilters] = useState({
    mood: "",
    form: "",
    dateRange: "",
    wordCount: { min: 0, max: 1000 },
  });
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  // 10. Performance Analytics
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
  const [showMetrics, setShowMetrics] = useState(false);
  const [writingGoals, setWritingGoals] = useState({
    dailyWords: 100,
    weeklyPoems: 3,
    monthlyTarget: 12,
  });

  // AI features
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiMode, setAiMode] = useState<
    "format" | "improve" | "rewrite" | "style" | "custom" | "themes"
  >("improve");
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

  // NEW FEATURE: Calculate word count and reading time
  const getWordCount = () => {
    return content.trim() ? content.trim().split(/\s+/).length : 0;
  };

  const getLineCount = () => {
    return content.split("\n").length;
  };

  const getReadingTime = () => {
    const words = getWordCount();
    const avgWordsPerMinute = 200; // Average reading speed
    const minutes = Math.ceil(words / avgWordsPerMinute);
    return minutes < 1 ? "< 1 min" : `${minutes} min`;
  };

  // NEW FEATURE: Generate AI theme suggestions
  const generateThemeSuggestions = async () => {
    if (!content.trim()) return;

    setLoadingThemes(true);
    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: `Analyze this poem and suggest 5 relevant themes or topics that capture its essence. Return only the themes as a comma-separated list: ${content}`,
          type: "theme_analysis",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const themes = data.response
          .split(",")
          .map((theme: string) => theme.trim())
          .filter((theme: string) => theme.length > 0)
          .slice(0, 5);
        setAiThemeSuggestions(themes);
      }
    } catch (error) {
      console.error("Error generating theme suggestions:", error);
    } finally {
      setLoadingThemes(false);
    }
  };

  // ADVANCED FEATURE 1: Voice Recording & Dictation
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/wav" });
        setAudioBlob(blob);
        // Here you would typically send to speech-to-text API
        transcribeAudio(blob);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    }
  }, [mediaRecorder, isRecording]);

  const transcribeAudio = async (blob: Blob) => {
    // Placeholder for speech-to-text integration
    // In a real implementation, you'd send the audio to a service like Google Speech-to-Text
    console.log("Transcribing audio...", blob);
  };

  // ADVANCED FEATURE 2: Text-to-Speech
  const speakText = useCallback(() => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(content);
      utterance.rate = speechRate;
      if (speechVoice) {
        const voices = speechSynthesis.getVoices();
        const selectedVoice = voices.find(
          (voice) => voice.name === speechVoice,
        );
        if (selectedVoice) utterance.voice = selectedVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);

      speechSynthesis.speak(utterance);
    }
  }, [content, speechRate, speechVoice]);

  const stopSpeaking = useCallback(() => {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  // ADVANCED FEATURE 3: Advanced Poetry Analysis
  const analyzePoetry = useCallback(async () => {
    if (!content.trim()) return;

    setAnalysisLoading(true);
    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Analyze this poem comprehensively. Provide: 1) Meter and rhythm analysis, 2) Rhyme scheme, 3) Literary devices used, 4) Emotional tone, 5) Structural analysis, 6) Syllable count per line, 7) Poetic form identification: ${content}`,
          type: "poetry_analysis",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPoetryAnalysis({
          content: data.response,
          timestamp: new Date(),
          wordCount: getWordCount(),
          lineCount: getLineCount(),
          stanzaCount: content.split("\n\n").length,
        });
        setShowAnalysis(true);
      }
    } catch (error) {
      console.error("Error analyzing poetry:", error);
    } finally {
      setAnalysisLoading(false);
    }
  }, [content]);

  // ADVANCED FEATURE 4: Rhyme & Synonym Assistant
  const getWordSuggestions = useCallback(async (word: string) => {
    if (!word.trim()) return;

    setSelectedWord(word);
    setShowWordAssistant(true);

    try {
      // Get rhymes
      const rhymeResponse = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Provide 10 words that rhyme with "${word}". Return only the words separated by commas.`,
          type: "rhyme_suggestions",
        }),
      });

      if (rhymeResponse.ok) {
        const rhymeData = await rhymeResponse.json();
        setRhymeSuggestions(
          rhymeData.response.split(",").map((w: string) => w.trim()),
        );
      }

      // Get synonyms
      const synonymResponse = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Provide 10 synonyms for "${word}". Return only the words separated by commas.`,
          type: "synonym_suggestions",
        }),
      });

      if (synonymResponse.ok) {
        const synonymData = await synonymResponse.json();
        setSynonymSuggestions(
          synonymData.response.split(",").map((w: string) => w.trim()),
        );
      }
    } catch (error) {
      console.error("Error getting word suggestions:", error);
    }
  }, []);

  // ADVANCED FEATURE 5: Version History
  const saveVersion = useCallback(() => {
    const newVersion = {
      id: Date.now().toString(),
      content,
      title,
      timestamp: new Date(),
    };
    setVersionHistory((prev) => [newVersion, ...prev.slice(0, 19)]); // Keep last 20 versions
  }, [content, title]);

  const restoreVersion = useCallback((version: any) => {
    setContent(version.content);
    setTitle(version.title);
    setShowVersionHistory(false);
  }, []);

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveEnabled && content.trim()) {
      const timer = setTimeout(() => {
        saveVersion();
      }, 30000); // Auto-save every 30 seconds

      return () => clearTimeout(timer);
    }
  }, [content, autoSaveEnabled, saveVersion]);

  // ADVANCED FEATURE 6: Collaboration Features
  const inviteCollaborator = useCallback(async (email: string) => {
    // Placeholder for collaboration invitation
    console.log("Inviting collaborator:", email);
  }, []);

  const toggleCollaborationMode = useCallback(() => {
    setCollaborationMode(!collaborationMode);
    // In real implementation, this would enable real-time sync
  }, [collaborationMode]);

  // ADVANCED FEATURE 7: Advanced Export
  const exportAdvanced = useCallback(async () => {
    const exportData = {
      title,
      content,
      style,
      tags,
      mood,
      theme,
      analysis: exportOptions.includeAnalysis ? poetryAnalysis : null,
      metadata: exportOptions.includeMetadata
        ? {
            wordCount: getWordCount(),
            lineCount: getLineCount(),
            createdAt: new Date().toISOString(),
          }
        : null,
    };

    // Placeholder for advanced export functionality
    console.log("Exporting with options:", exportOptions, exportData);
    setShowExportDialog(false);
  }, [title, content, style, tags, mood, theme, exportOptions, poetryAnalysis]);

  // ADVANCED FEATURE 8: Poetry Templates
  const applyTemplate = useCallback((templateName: string) => {
    const templates = {
      sonnet: {
        structure: "14 lines, ABAB CDCD EFEF GG rhyme scheme",
        placeholder:
          "Line 1 (A)\nLine 2 (B)\nLine 3 (A)\nLine 4 (B)\n\nLine 5 (C)\nLine 6 (D)\nLine 7 (C)\nLine 8 (D)\n\nLine 9 (E)\nLine 10 (F)\nLine 11 (E)\nLine 12 (F)\n\nLine 13 (G)\nLine 14 (G)",
      },
      haiku: {
        structure: "3 lines, 5-7-5 syllable pattern",
        placeholder:
          "First line (5 syllables)\nSecond line (7 syllables)\nThird line (5 syllables)",
      },
      villanelle: {
        structure: "19 lines, ABA ABA ABA ABA ABA ABAA",
        placeholder:
          "A1\nb\nA2\n\na\nb\nA1\n\na\nb\nA2\n\na\nb\nA1\n\na\nb\nA2\n\na\nb\nA1\nA2",
      },
    };

    const template = templates[templateName as keyof typeof templates];
    if (template) {
      setContent(template.placeholder);
      setTemplateStructure(template.structure);
      setSelectedTemplate(templateName);
    }
    setShowTemplates(false);
  }, []);

  // ADVANCED FEATURE 9: Advanced Search
  const performAdvancedSearch = useCallback(async () => {
    // Placeholder for advanced search functionality
    console.log("Performing search with:", searchQuery, searchFilters);
  }, [searchQuery, searchFilters]);

  // ADVANCED FEATURE 10: Performance Analytics
  const updateMetrics = useCallback(() => {
    const metrics = {
      wordsPerMinute: 0, // Calculate based on typing speed
      sessionTime: 0, // Track session duration
      productivity: {
        wordsToday: getWordCount(),
        poemsThisWeek: 1,
        streakDays: 5,
      },
      goals: writingGoals,
      achievements: [
        { name: "First Poem", unlocked: true },
        { name: "Word Master", unlocked: getWordCount() > 100 },
        { name: "Daily Writer", unlocked: false },
      ],
    };
    setPerformanceMetrics(metrics);
  }, [writingGoals]);

  useEffect(() => {
    updateMetrics();
  }, [content, updateMetrics]);

  // NEW FEATURE: Export to HTML
  const exportToHTML = () => {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: ${getCurrentFont()};
            background: ${getCurrentBackground()};
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
            line-height: ${style.lineSpacing};
        }
        .poem-title {
            font-size: 2rem;
            font-weight: bold;
            text-align: center;
            margin-bottom: 2rem;
            border-bottom: 1px solid #ccc;
            padding-bottom: 1rem;
        }
        .poem-content {
            text-align: ${style.alignment as any};
            font-size: ${style.fontSize === "small" ? "1rem" : style.fontSize === "medium" ? "1.125rem" : "1.25rem"};
            font-style: ${style.italics ? "italic" : "normal"};
            font-weight: ${style.bold ? "bold" : "normal"};
            text-transform: ${style.uppercase ? "uppercase" : "none"};
            letter-spacing: ${style.letterSpacing}px;
            padding-left: ${style.indentation * 20}px;
            white-space: pre-wrap;
        }
        .poem-tags {
            margin-top: 2rem;
            padding-top: 1rem;
            border-top: 1px solid #ccc;
            text-align: center;
        }
        .tag {
            display: inline-block;
            background: #f0f0f0;
            padding: 4px 8px;
            margin: 2px;
            border-radius: 4px;
            font-size: 0.8rem;
        }
    </style>
</head>
<body>
    <div class="poem-title">${title}</div>
    <div class="poem-content">${content}</div>
    ${
      tags.length > 0
        ? `
    <div class="poem-tags">
        ${tags.map((tag) => `<span class="tag">#${tag}</span>`).join("")}
    </div>`
        : ""
    }
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title || "poem"}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Load existing poem data
  useEffect(() => {
    if (poemId) {
      // Force refresh poetry data when editing
      const loadPoemData = async () => {
        try {
          await getPoetry();
        } catch (error) {
          console.error("Error fetching poetry data:", error);
        }
      };

      loadPoemData();
    }
  }, [poemId, getPoetry]);

  // Set poem data after poetry is loaded
  useEffect(() => {
    if (poemId && poetry.length > 0) {
      const existingPoem = poetry.find((p) => p.id === poemId);
      if (existingPoem) {
        console.log("Loading poem data:", existingPoem);
        setTitle(existingPoem.title || "Untitled Poem");
        setContent(existingPoem.content || "");
        setTags(existingPoem.tags || []);
        setStyle({
          font: existingPoem.style?.font || "serif",
          alignment: existingPoem.style?.alignment || "left",
          lineSpacing: existingPoem.style?.lineSpacing || 1.6,
          fontSize: existingPoem.style?.fontSize || "medium",
          indentation: existingPoem.style?.indentation || 0,
          stanzaSpacing: existingPoem.style?.stanzaSpacing || 1.5,
          italics: existingPoem.style?.italics || false,
          bold: existingPoem.style?.bold || false,
          uppercase: existingPoem.style?.uppercase || false,
          letterSpacing: existingPoem.style?.letterSpacing || 0,
        });
        setMood(existingPoem.mood || "romantic");
        setTheme(existingPoem.theme || "");
        setIsPublic(existingPoem.is_public || false);
        setIsFavorite(existingPoem.is_favorite || false);
        setIsPinned(existingPoem.is_pinned || false);
        setBackgroundTexture(existingPoem.backgroundTexture || "parchment");
      }
    }
  }, [poemId, poetry]);

  // Handle escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (focusMode) {
          setFocusMode(false);
        } else if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isFullscreen, focusMode, onClose]);

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
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const getMoodColor = (moodValue: string) => {
    const preset = MOOD_PRESETS.find((p) => p.value === moodValue);
    return preset?.color || "#ffffff";
  };

  const getCurrentFont = () => {
    const font = POETRY_FONTS.find((f) => f.value === style.font);
    return font?.family || "Georgia, serif";
  };

  const getCurrentBackground = () => {
    const bg = BACKGROUND_TEXTURES.find((b) => b.value === backgroundTexture);
    return bg?.gradient || BACKGROUND_TEXTURES[0].gradient;
  };

  const handleAIAssist = async () => {
    if (!content.trim() && aiMode !== "custom" && aiMode !== "themes") return;

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
        case "themes":
          await generateThemeSuggestions();
          return;
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
    const preset = MOOD_PRESETS.find((p) => p.value === moodValue);
    if (preset) {
      // Apply mood-specific styling
      switch (moodValue) {
        case "romantic":
          setStyle((prev) => ({
            ...prev,
            font: "cursive",
            alignment: "center",
            italics: true,
          }));
          break;
        case "melancholic":
          setStyle((prev) => ({
            ...prev,
            font: "serif",
            alignment: "left",
            lineSpacing: 2.0,
          }));
          break;
        case "joyful":
          setStyle((prev) => ({
            ...prev,
            font: "sans-serif",
            alignment: "center",
            bold: true,
          }));
          break;
        case "nature":
          setStyle((prev) => ({
            ...prev,
            font: "serif",
            alignment: "left",
            lineSpacing: 1.8,
          }));
          break;
        case "mystical":
          setStyle((prev) => ({
            ...prev,
            font: "fantasy",
            alignment: "center",
            letterSpacing: 1,
          }));
          break;
        case "contemplative":
          setStyle((prev) => ({
            ...prev,
            font: "serif",
            alignment: "left",
            lineSpacing: 1.6,
          }));
          break;
      }
    }
  };

  const formatStanzas = () => {
    const lines = content.split("\n");
    const formatted = lines
      .map((line, index) => {
        if (line.trim() === "" && index > 0 && index < lines.length - 1) {
          return "\n"; // Double line break for stanza separation
        }
        return line;
      })
      .join("\n");
    setContent(formatted);
  };

  // NEW FEATURE: Render line numbers
  const renderLineNumbers = () => {
    if (!showLineNumbers) return null;
    const lines = content.split("\n");
    return (
      <div className="absolute left-0 top-0 text-xs text-muted-foreground/50 font-mono select-none pointer-events-none">
        {lines.map((_, index) => (
          <div key={index} className="h-[1.5rem] flex items-center px-2">
            {index + 1}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      className={cn(
        "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center",
        isFullscreen ? "p-0" : "p-4",
        focusMode && "bg-black/80",
      )}
      onClick={onClose}
    >
      <motion.div
        className={cn(
          "bg-background rounded-xl shadow-2xl overflow-hidden flex flex-col",
          isFullscreen
            ? "w-full h-full rounded-none"
            : "w-full max-w-7xl max-h-[95vh]",
          focusMode && "max-w-4xl",
        )}
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        style={{
          background: getCurrentBackground(),
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header - Improved with better spacing and organization */}
        {!focusMode && (
          <div className="sticky top-0 z-10 flex flex-col border-b bg-background/80 backdrop-blur-sm">
            {/* Main Header Row */}
            <div className="flex items-center justify-between p-4">
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
                      isFavorite &&
                        "bg-yellow-500 hover:bg-yellow-600 text-white",
                    )}
                  >
                    <Star
                      className={cn("w-4 h-4", isFavorite && "fill-current")}
                    />
                  </Button>
                  <Button
                    variant={isPinned ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsPinned(!isPinned)}
                    className={cn(
                      "h-8 px-3 gap-1",
                      isPinned && "bg-blue-500 hover:bg-blue-600 text-white",
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
                      isPublic && "bg-green-500 hover:bg-green-600 text-white",
                    )}
                  >
                    <Globe
                      className={cn("w-4 h-4", isPublic && "fill-current")}
                    />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Enhanced stats with new features */}
                <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground bg-muted/30 px-3 py-1 rounded-lg">
                  <div className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    {getWordCount()} words
                  </div>
                  <div className="flex items-center gap-1">
                    <Hash className="w-3 h-3" />
                    {getLineCount()} lines
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {getReadingTime()}
                  </div>
                  {collaborationMode && (
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {collaborators.length} collaborators
                    </div>
                  )}
                  {autoSaveEnabled && (
                    <div className="flex items-center gap-1 text-green-500">
                      <Save className="w-3 h-3" />
                      Auto-save
                    </div>
                  )}
                </div>

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

            {/* Toolbar Row - Organized into logical groups with proper spacing */}
            <div className="flex flex-wrap items-center gap-1 px-4 pb-2 overflow-x-auto">
              {/* View Controls Group */}
              <div className="flex items-center gap-1 p-1 bg-muted/20 rounded-md">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFocusMode(!focusMode)}
                  className="h-8 gap-1"
                  title="Focus Mode"
                >
                  <Focus className="w-4 h-4" />
                  <span className="hidden sm:inline">Focus</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                  className="h-8 gap-1"
                  title="Toggle Preview"
                >
                  {showPreview ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">Preview</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="h-8 w-8 p-0"
                  title="Toggle Fullscreen"
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {/* Analysis Group */}
              <div className="flex items-center gap-1 p-1 bg-muted/20 rounded-md">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMetrics(!showMetrics)}
                  className="h-8 gap-1"
                  title="Analytics"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Analytics</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={analyzePoetry}
                  disabled={analysisLoading}
                  className="h-8 gap-1"
                  title="Analyze Poetry"
                >
                  {analysisLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Brain className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">Analyze</span>
                </Button>
              </div>

              {/* Collaboration Group */}
              <div className="flex items-center gap-1 p-1 bg-muted/20 rounded-md">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowVersionHistory(!showVersionHistory)}
                  className="h-8 gap-1"
                  title="Version History"
                >
                  <History className="w-4 h-4" />
                  <span className="hidden sm:inline">Versions</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCollaboration(!showCollaboration)}
                  className="h-8 gap-1"
                  title="Collaboration"
                >
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">Collaborate</span>
                </Button>
              </div>

              {/* Voice & Audio Controls */}
              <div className="flex items-center gap-1 p-1 bg-muted/20 rounded-md">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={cn("h-8 w-8 p-0", isRecording && "text-red-500")}
                  title={isRecording ? "Stop Recording" : "Start Recording"}
                >
                  {isRecording ? (
                    <MicOff className="w-4 h-4" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={isSpeaking ? stopSpeaking : speakText}
                  disabled={!content.trim()}
                  className={cn("h-8 w-8 p-0", isSpeaking && "text-blue-500")}
                  title={isSpeaking ? "Stop Speaking" : "Text to Speech"}
                >
                  {isSpeaking ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {/* AI Assistant */}
              <div className="flex items-center gap-1 ml-auto">
                <Button
                  variant={showAIAssistant ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setShowAIAssistant(!showAIAssistant)}
                  className="h-8 gap-1"
                >
                  <Sparkles className="h-4 w-4" />
                  <span className="hidden sm:inline">AI Assistant</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowStylePanel(!showStylePanel)}
                  className="h-8 gap-1"
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {showStylePanel ? "Hide" : "Show"} Studio
                  </span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Focus Mode Header - Improved positioning */}
        {focusMode && (
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFocusMode(false)}
              className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Main Content - Improved layout with consistent spacing */}
        <div
          className="flex flex-1 overflow-hidden"
          style={{ minHeight: "70vh" }}
        >
          {/* Left Panel - Editor & Poetry Studio */}
          <div
            className={cn(
              "flex flex-col overflow-hidden",
              focusMode ? "w-full" : showPreview ? "w-1/2" : "w-full",
              !focusMode && showStylePanel && showPreview
                ? "w-2/5"
                : !focusMode && showStylePanel
                  ? "w-3/5"
                  : "",
            )}
            style={{
              minWidth: focusMode
                ? "100%"
                : showPreview && showStylePanel
                  ? "35%"
                  : showPreview
                    ? "45%"
                    : "100%",
              maxWidth: focusMode
                ? "100%"
                : showPreview && showStylePanel
                  ? "40%"
                  : showPreview
                    ? "50%"
                    : "100%",
            }}
          >
            {/* Scrollable Content Area with improved padding */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gradient-to-br from-background/40 to-muted/10">
              <div
                className={cn(
                  "mx-auto space-y-4 md:space-y-6",
                  focusMode ? "max-w-4xl" : "max-w-2xl",
                )}
              >
                {/* Title with improved styling */}
                <Input
                  placeholder="Enter your poem title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-xl md:text-2xl font-bold border-none bg-transparent px-0 focus-visible:ring-0 placeholder:text-muted-foreground/50"
                  style={{
                    fontFamily: getCurrentFont(),
                    textAlign: style.alignment as any,
                  }}
                />

                {/* AI Assistant Toggle */}
                {!focusMode && (
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
                )}

                {/* Content Editor with Advanced Features - Improved layout */}
                <div className="relative mt-4">
                  {/* Line numbers with better contrast */}
                  {renderLineNumbers()}

                  {/* Template Structure Guide - Better positioning */}
                  {selectedTemplate && templateStructure && (
                    <div className="absolute right-2 top-2 bg-muted/80 backdrop-blur-sm p-2 rounded text-xs text-muted-foreground max-w-xs z-10">
                      <div className="font-medium mb-1">
                        {selectedTemplate.toUpperCase()}
                      </div>
                      <div>{templateStructure}</div>
                    </div>
                  )}

                  <Textarea
                    ref={contentRef}
                    placeholder="Write your poem here... Let your words flow like verses on parchment. HTML tags are supported. Double-click any word for rhyme/synonym suggestions."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onDoubleClick={(e) => {
                      const selection = window.getSelection();
                      const selectedText = selection?.toString().trim();
                      if (selectedText) {
                        getWordSuggestions(selectedText);
                      }
                    }}
                    className={cn(
                      "min-h-[400px] md:min-h-[500px] resize-none border-none bg-transparent text-lg leading-relaxed focus-visible:ring-0 font-mono",
                      showLineNumbers && "pl-12",
                      focusMode && "min-h-[600px] text-xl",
                      collaborationMode && "border-l-4 border-l-blue-500",
                    )}
                    style={{
                      fontFamily: getCurrentFont(),
                      textAlign: style.alignment as any,
                      lineHeight: style.lineSpacing,
                      fontSize:
                        style.fontSize === "small"
                          ? "1rem"
                          : style.fontSize === "medium"
                            ? "1.125rem"
                            : "1.25rem",
                      fontStyle: style.italics ? "italic" : "normal",
                      fontWeight: style.bold ? "bold" : "normal",
                      textTransform: style.uppercase ? "uppercase" : "none",
                      letterSpacing: `${style.letterSpacing}px`,
                      paddingLeft: showLineNumbers
                        ? "3rem"
                        : `${style.indentation * 20}px`,
                    }}
                  />
                </div>

                {/* AI Assistant Panel */}
                {!focusMode && (
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
                            <h3 className="text-sm font-medium">
                              AI Poetry Assistant
                            </h3>
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
                          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                            {[
                              {
                                value: "format",
                                label: "Format Style",
                                icon: Type,
                              },
                              {
                                value: "improve",
                                label: "Improve",
                                icon: Wand2,
                              },
                              {
                                value: "rewrite",
                                label: "Rewrite",
                                icon: RefreshCw,
                              },
                              {
                                value: "style",
                                label: "Change Mood",
                                icon: Heart,
                              },
                              {
                                value: "themes",
                                label: "Suggest Themes",
                                icon: Lightbulb,
                              },
                              { value: "custom", label: "Custom", icon: Pen },
                            ].map(({ value, label, icon: Icon }) => (
                              <Button
                                key={value}
                                size="sm"
                                variant={
                                  aiMode === value ? "default" : "outline"
                                }
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
                              <Label className="text-sm font-medium mb-2 block text-muted-foreground">
                                Historical Style
                              </Label>
                              <Select
                                value={aiStyle}
                                onValueChange={setAiStyle}
                              >
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {HISTORICAL_STYLES.map((style) => (
                                    <SelectItem
                                      key={style.value}
                                      value={style.value}
                                    >
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
                              <Label className="text-sm font-medium mb-2 block text-muted-foreground">
                                Target Mood
                              </Label>
                              <div className="grid grid-cols-3 gap-2">
                                {MOOD_PRESETS.map((preset) => (
                                  <Button
                                    key={preset.value}
                                    size="sm"
                                    variant={
                                      aiStyle === preset.value
                                        ? "default"
                                        : "outline"
                                    }
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
                              <Label className="text-sm font-medium mb-2 block text-muted-foreground">
                                Custom Instruction
                              </Label>
                              <Input
                                placeholder="e.g., 'Write a haiku about autumn', 'Make this more melancholic', 'Add more metaphors'"
                                value={customPrompt}
                                onChange={(e) =>
                                  setCustomPrompt(e.target.value)
                                }
                                className="h-8"
                              />
                            </div>
                          )}

                          {/* NEW FEATURE: AI Theme Suggestions Display */}
                          {aiMode === "themes" &&
                            aiThemeSuggestions.length > 0 && (
                              <div>
                                <Label className="text-sm font-medium mb-2 block text-muted-foreground">
                                  Suggested Themes
                                </Label>
                                <div className="flex flex-wrap gap-2">
                                  {aiThemeSuggestions.map(
                                    (suggestion, index) => (
                                      <Button
                                        key={index}
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setTheme(suggestion)}
                                        className="h-8 text-xs"
                                      >
                                        {suggestion}
                                      </Button>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}

                          {/* Action Buttons */}
                          <div className="flex justify-between items-center">
                            <Button
                              size="sm"
                              onClick={handleAIAssist}
                              disabled={
                                aiLoading ||
                                loadingThemes ||
                                (aiMode === "custom" && !customPrompt.trim())
                              }
                              className="h-8 gap-1 bg-gradient-to-r from-primary to-primary/80"
                            >
                              {aiLoading || loadingThemes ? (
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
                                  onClick={() =>
                                    navigator.clipboard.writeText(aiSuggestion)
                                  }
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
                                <span className="text-sm font-medium text-muted-foreground">
                                  AI Suggestion
                                </span>
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
                )}

                {/* Tags */}
                {!focusMode && (
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Tags
                    </Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        placeholder="Add a tag..."
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
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
                )}

                {/* Advanced Poetry Tools Section */}
                {!focusMode && (
                  <div className="mt-8 space-y-6">
                    {/* Poetry Studio Header */}
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <Palette className="w-5 h-5 text-primary" />
                        Advanced Poetry Studio
                      </h3>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowTemplates(!showTemplates)}
                          className="h-8 gap-1"
                        >
                          <Layers className="w-4 h-4" />
                          Templates
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setShowAdvancedSearch(!showAdvancedSearch)
                          }
                          className="h-8 gap-1"
                        >
                          <Search className="w-4 h-4" />
                          Search
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowStylePanel(!showStylePanel)}
                          className="h-8 gap-1"
                        >
                          <Settings className="w-4 h-4" />
                          {showStylePanel ? "Hide" : "Show"} Studio
                        </Button>
                      </div>
                    </div>

                    {/* Poetry Templates Panel */}
                    <AnimatePresence>
                      {showTemplates && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border rounded-lg overflow-hidden bg-gradient-to-br from-background/40 to-muted/20"
                        >
                          <div className="bg-muted/30 p-3 border-b flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Layers className="h-4 w-4 text-primary" />
                              <h4 className="text-sm font-medium">
                                Poetry Templates & Forms
                              </h4>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowTemplates(false)}
                              className="h-7 w-7 p-0"
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          <div className="p-4">
                            <div className="grid grid-cols-3 gap-3">
                              {[
                                {
                                  name: "sonnet",
                                  label: "Sonnet",
                                  desc: "14 lines, ABAB CDCD EFEF GG",
                                },
                                {
                                  name: "haiku",
                                  label: "Haiku",
                                  desc: "3 lines, 5-7-5 syllables",
                                },
                                {
                                  name: "villanelle",
                                  label: "Villanelle",
                                  desc: "19 lines, complex rhyme",
                                },
                                {
                                  name: "limerick",
                                  label: "Limerick",
                                  desc: "5 lines, AABBA rhyme",
                                },
                                {
                                  name: "ballad",
                                  label: "Ballad",
                                  desc: "Narrative poem, ABAB",
                                },
                                {
                                  name: "free_verse",
                                  label: "Free Verse",
                                  desc: "No fixed structure",
                                },
                              ].map((template) => (
                                <Button
                                  key={template.name}
                                  variant={
                                    selectedTemplate === template.name
                                      ? "default"
                                      : "outline"
                                  }
                                  size="sm"
                                  onClick={() => applyTemplate(template.name)}
                                  className="h-16 flex-col gap-1 text-xs p-2"
                                >
                                  <div className="font-medium">
                                    {template.label}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {template.desc}
                                  </div>
                                </Button>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Quick Style Actions */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                      {MOOD_PRESETS.slice(0, 6).map((preset) => (
                        <Button
                          key={preset.value}
                          size="sm"
                          variant={
                            mood === preset.value ? "default" : "outline"
                          }
                          onClick={() => applyMoodPreset(preset.value)}
                          className="h-12 flex-col gap-1 text-xs transition-all duration-200"
                          style={{
                            backgroundColor:
                              mood === preset.value ? preset.color : undefined,
                            borderColor:
                              mood === preset.value ? preset.color : undefined,
                          }}
                        >
                          <preset.icon className="h-4 w-4" />
                          {preset.label}
                        </Button>
                      ))}
                    </div>

                    {/* Typography Quick Controls */}
                    <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-border/50">
                      <h4 className="text-sm font-medium mb-3 text-muted-foreground">
                        Quick Typography
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs font-medium mb-1 block">
                            Font Style
                          </Label>
                          <Select
                            value={style.font}
                            onValueChange={(value) =>
                              setStyle({ ...style, font: value })
                            }
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {POETRY_FONTS.map((font) => (
                                <SelectItem key={font.value} value={font.value}>
                                  <span
                                    style={{ fontFamily: font.family }}
                                    className="text-xs"
                                  >
                                    {font.label}
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs font-medium mb-1 block">
                            Alignment
                          </Label>
                          <div className="flex gap-1">
                            {[
                              { value: "left", icon: AlignLeft },
                              { value: "center", icon: AlignCenter },
                              { value: "right", icon: AlignRight },
                            ].map(({ value, icon: Icon }) => (
                              <Button
                                key={value}
                                variant={
                                  style.alignment === value
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() =>
                                  setStyle({ ...style, alignment: value })
                                }
                                className="flex-1 h-8 p-0"
                              >
                                <Icon className="w-3 h-3" />
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Live Preview */}
          {!focusMode && showPreview && (
            <div
              className={cn(
                "border-l bg-gradient-to-br from-background/20 to-muted/10 overflow-y-auto",
                showStylePanel ? "w-2/5" : "w-1/2",
              )}
              style={{
                minWidth: showStylePanel ? "35%" : "45%",
                maxWidth: showStylePanel ? "40%" : "50%",
              }}
            >
              <div className="p-6">
                <div className="max-w-xl mx-auto">
                  <div className="mb-6 text-center">
                    <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center justify-center gap-2">
                      <Eye className="w-5 h-5 text-primary" />
                      Live Preview
                    </h3>
                    <Separator className="bg-border/50" />
                  </div>

                  <div
                    ref={previewRef}
                    className="p-8 rounded-xl shadow-xl min-h-[500px] border border-border/20 backdrop-blur-sm"
                    style={{
                      background: getCurrentBackground(),
                      fontFamily: getCurrentFont(),
                      textAlign: style.alignment as any,
                      lineHeight: style.lineSpacing,
                      fontSize:
                        style.fontSize === "small"
                          ? "1rem"
                          : style.fontSize === "medium"
                            ? "1.125rem"
                            : "1.25rem",
                      fontStyle: style.italics ? "italic" : "normal",
                      fontWeight: style.bold ? "bold" : "normal",
                      textTransform: style.uppercase ? "uppercase" : "none",
                      letterSpacing: `${style.letterSpacing}px`,
                    }}
                  >
                    <h1 className="text-2xl font-bold mb-8 text-center border-b border-border/30 pb-4">
                      {title || "Untitled Poem"}
                    </h1>
                    <div
                      className="whitespace-pre-wrap prose prose-sm max-w-none text-foreground/90"
                      style={{
                        paddingLeft: `${style.indentation * 20}px`,
                      }}
                      dangerouslySetInnerHTML={{
                        __html:
                          content ||
                          "<em class='text-muted-foreground'>Your poem will appear here as you write...</em>",
                      }}
                    ></div>

                    {tags.length > 0 && (
                      <div className="mt-8 pt-6 border-t border-border/30">
                        <div className="flex flex-wrap gap-2 justify-center">
                          {tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-xs bg-background/50 backdrop-blur-sm"
                            >
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Advanced Style Panel */}
          {!focusMode && showStylePanel && (
            <div
              className={cn(
                "border-l bg-gradient-to-b from-background/60 to-background/30 backdrop-blur-sm overflow-y-auto",
                showPreview ? "w-1/5" : "w-80",
              )}
              style={{
                minWidth: showPreview ? "20%" : "300px",
                maxWidth: showPreview ? "25%" : "350px",
              }}
            >
              <div className="p-4">
                <div className="space-y-6">
                  <div className="flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm p-2 -m-2 rounded-lg border border-border/50">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <Wand2 className="w-4 h-4 text-primary" />
                      Advanced Studio
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowStylePanel(false)}
                      className="h-7 w-7 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <Tabs defaultValue="style" className="w-full">
                    <TabsList className="grid w-full grid-cols-6 bg-muted/50">
                      <TabsTrigger value="style" className="text-xs">
                        Style
                      </TabsTrigger>
                      <TabsTrigger value="mood" className="text-xs">
                        Mood
                      </TabsTrigger>
                      <TabsTrigger value="tools" className="text-xs">
                        Tools
                      </TabsTrigger>
                      <TabsTrigger value="analysis" className="text-xs">
                        Analysis
                      </TabsTrigger>
                      <TabsTrigger value="collab" className="text-xs">
                        Collab
                      </TabsTrigger>
                      <TabsTrigger value="export" className="text-xs">
                        Export
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="style" className="space-y-4 mt-4">
                      {/* Font Selection */}
                      <div className="bg-card/30 rounded-lg p-3 border border-border/30">
                        <Label className="text-xs font-medium mb-2 block text-muted-foreground">
                          Typography
                        </Label>
                        <Select
                          value={style.font}
                          onValueChange={(value) =>
                            setStyle({ ...style, font: value })
                          }
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {POETRY_FONTS.map((font) => (
                              <SelectItem key={font.value} value={font.value}>
                                <span
                                  style={{ fontFamily: font.family }}
                                  className="text-xs"
                                >
                                  {font.label}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Font Size */}
                      <div className="bg-card/30 rounded-lg p-3 border border-border/30">
                        <Label className="text-xs font-medium mb-2 block text-muted-foreground">
                          Font Size
                        </Label>
                        <Select
                          value={style.fontSize}
                          onValueChange={(value) =>
                            setStyle({ ...style, fontSize: value })
                          }
                        >
                          <SelectTrigger className="h-8 text-xs">
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
                      <div className="bg-card/30 rounded-lg p-3 border border-border/30">
                        <Label className="text-xs font-medium mb-2 block text-muted-foreground">
                          Alignment
                        </Label>
                        <div className="flex gap-1">
                          <Button
                            variant={
                              style.alignment === "left" ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() =>
                              setStyle({ ...style, alignment: "left" })
                            }
                            className="flex-1 h-8"
                          >
                            <AlignLeft className="w-3 h-3" />
                          </Button>
                          <Button
                            variant={
                              style.alignment === "center"
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() =>
                              setStyle({ ...style, alignment: "center" })
                            }
                            className="flex-1 h-8"
                          >
                            <AlignCenter className="w-3 h-3" />
                          </Button>
                          <Button
                            variant={
                              style.alignment === "right"
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() =>
                              setStyle({ ...style, alignment: "right" })
                            }
                            className="flex-1 h-8"
                          >
                            <AlignRight className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Line Spacing */}
                      <div className="bg-card/30 rounded-lg p-3 border border-border/30">
                        <Label className="text-xs font-medium mb-2 block text-muted-foreground">
                          Line Spacing: {style.lineSpacing.toFixed(1)}
                        </Label>
                        <Slider
                          value={[style.lineSpacing]}
                          onValueChange={([value]) =>
                            setStyle({ ...style, lineSpacing: value })
                          }
                          min={1}
                          max={3}
                          step={0.1}
                          className="mt-2"
                        />
                      </div>

                      {/* Letter Spacing */}
                      <div className="bg-card/30 rounded-lg p-3 border border-border/30">
                        <Label className="text-xs font-medium mb-2 block text-muted-foreground">
                          Letter Spacing: {style.letterSpacing}px
                        </Label>
                        <Slider
                          value={[style.letterSpacing]}
                          onValueChange={([value]) =>
                            setStyle({ ...style, letterSpacing: value })
                          }
                          min={-2}
                          max={5}
                          step={0.5}
                          className="mt-2"
                        />
                      </div>

                      {/* Indentation */}
                      <div className="bg-card/30 rounded-lg p-3 border border-border/30">
                        <Label className="text-xs font-medium mb-2 block text-muted-foreground">
                          Indentation: {style.indentation}
                        </Label>
                        <Slider
                          value={[style.indentation]}
                          onValueChange={([value]) =>
                            setStyle({ ...style, indentation: value })
                          }
                          min={0}
                          max={10}
                          step={1}
                          className="mt-2"
                        />
                      </div>

                      {/* Text Style Toggles */}
                      <div className="bg-card/30 rounded-lg p-3 border border-border/30 space-y-3">
                        <Label className="text-xs font-medium text-muted-foreground">
                          Text Style
                        </Label>
                        <div className="flex items-center justify-between">
                          <Label className="text-xs flex items-center gap-2">
                            <Bold className="w-3 h-3" />
                            Bold
                          </Label>
                          <Switch
                            checked={style.bold}
                            onCheckedChange={(checked) =>
                              setStyle({ ...style, bold: checked })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-xs flex items-center gap-2">
                            <Italic className="w-3 h-3" />
                            Italic
                          </Label>
                          <Switch
                            checked={style.italics}
                            onCheckedChange={(checked) =>
                              setStyle({ ...style, italics: checked })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-xs flex items-center gap-2">
                            <Type className="w-3 h-3" />
                            Uppercase
                          </Label>
                          <Switch
                            checked={style.uppercase}
                            onCheckedChange={(checked) =>
                              setStyle({ ...style, uppercase: checked })
                            }
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="mood" className="space-y-4 mt-4">
                      {/* Mood Presets */}
                      <div className="bg-card/30 rounded-lg p-3 border border-border/30">
                        <Label className="text-xs font-medium mb-3 block text-muted-foreground">
                          Mood Presets
                        </Label>
                        <div className="grid grid-cols-2 gap-2">
                          {MOOD_PRESETS.map((preset) => (
                            <Button
                              key={preset.value}
                              size="sm"
                              variant={
                                mood === preset.value ? "default" : "outline"
                              }
                              onClick={() => applyMoodPreset(preset.value)}
                              className="h-12 flex-col gap-1 text-xs transition-all duration-200"
                              style={{
                                backgroundColor:
                                  mood === preset.value
                                    ? preset.color
                                    : undefined,
                                borderColor:
                                  mood === preset.value
                                    ? preset.color
                                    : undefined,
                              }}
                            >
                              <preset.icon className="h-3 w-3" />
                              {preset.label}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Background Texture */}
                      <div className="bg-card/30 rounded-lg p-3 border border-border/30">
                        <Label className="text-xs font-medium mb-2 block text-muted-foreground">
                          Background
                        </Label>
                        <Select
                          value={backgroundTexture}
                          onValueChange={setBackgroundTexture}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {BACKGROUND_TEXTURES.map((texture) => (
                              <SelectItem
                                key={texture.value}
                                value={texture.value}
                              >
                                {texture.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Theme */}
                      <div className="bg-card/30 rounded-lg p-3 border border-border/30">
                        <Label className="text-xs font-medium mb-2 block text-muted-foreground">
                          Theme
                        </Label>
                        <Input
                          placeholder="e.g., love, nature, loss, hope..."
                          value={theme}
                          onChange={(e) => setTheme(e.target.value)}
                          className="h-8 text-xs"
                        />
                        {content.trim() && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={generateThemeSuggestions}
                            disabled={loadingThemes}
                            className="w-full mt-2 h-7 text-xs gap-1"
                          >
                            {loadingThemes ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <Lightbulb className="h-3 w-3" />
                            )}
                            AI Suggest Themes
                          </Button>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="tools" className="space-y-4 mt-4">
                      {/* Editor Options */}
                      <div className="bg-card/30 rounded-lg p-3 border border-border/30 space-y-3">
                        <Label className="text-xs font-medium text-muted-foreground">
                          Editor Options
                        </Label>

                        {/* NEW FEATURE: Line Numbers Toggle */}
                        <div className="flex items-center justify-between">
                          <Label className="text-xs flex items-center gap-2">
                            <Hash className="w-3 h-3" />
                            Line Numbers
                          </Label>
                          <Switch
                            checked={showLineNumbers}
                            onCheckedChange={setShowLineNumbers}
                          />
                        </div>
                      </div>

                      {/* Poetry Tools */}
                      <div className="bg-card/30 rounded-lg p-3 border border-border/30 space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground">
                          Poetry Tools
                        </Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={formatStanzas}
                          className="w-full justify-start gap-2 h-8 text-xs"
                        >
                          <Quote className="h-3 w-3" />
                          Format Stanzas
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const words = getWordCount();
                            const lines = getLineCount();
                            const readingTime = getReadingTime();
                            alert(
                              `Word count: ${words}\nLine count: ${lines}\nReading time: ${readingTime}`,
                            );
                          }}
                          className="w-full justify-start gap-2 h-8 text-xs"
                        >
                          <BookOpen className="h-3 w-3" />
                          Detailed Stats
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigator.clipboard.writeText(content)}
                          className="w-full justify-start gap-2 h-8 text-xs"
                        >
                          <Copy className="h-3 w-3" />
                          Copy Text
                        </Button>
                      </div>

                      {/* Quick Actions */}
                      <div className="bg-card/30 rounded-lg p-3 border border-border/30">
                        <div className="text-xs text-muted-foreground space-y-2">
                          <div className="font-medium">Quick Actions</div>
                          <div className="space-y-1 text-xs">
                            <div>⌘ + S: Save poem</div>
                            <div>⌘ + Enter: Save & close</div>
                            <div>Esc: Exit focus/fullscreen/close</div>
                            <div>F11: Toggle focus mode</div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* ADVANCED FEATURE: Analysis Tab */}
                    <TabsContent value="analysis" className="space-y-4 mt-4">
                      <div className="bg-card/30 rounded-lg p-3 border border-border/30 space-y-3">
                        <Label className="text-xs font-medium text-muted-foreground">
                          Poetry Analysis
                        </Label>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={analyzePoetry}
                          disabled={analysisLoading || !content.trim()}
                          className="w-full justify-start gap-2 h-8 text-xs"
                        >
                          {analysisLoading ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <Brain className="h-3 w-3" />
                          )}
                          Analyze Structure
                        </Button>

                        {poetryAnalysis && (
                          <div className="text-xs bg-muted/20 p-2 rounded max-h-32 overflow-y-auto">
                            <div className="font-medium mb-1">
                              Analysis Results:
                            </div>
                            <div className="whitespace-pre-wrap">
                              {poetryAnalysis.content}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Show Analysis Panel</Label>
                          <Switch
                            checked={showAnalysis}
                            onCheckedChange={setShowAnalysis}
                          />
                        </div>
                      </div>

                      {/* Word Assistant */}
                      <div className="bg-card/30 rounded-lg p-3 border border-border/30 space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground">
                          Word Assistant
                        </Label>
                        <div className="text-xs text-muted-foreground mb-2">
                          Double-click any word in your poem for suggestions
                        </div>

                        {selectedWord && (
                          <div className="space-y-2">
                            <div className="font-medium text-xs">
                              Selected: "{selectedWord}"
                            </div>

                            {rhymeSuggestions.length > 0 && (
                              <div>
                                <Label className="text-xs font-medium mb-2 block">
                                  Rhyming Words
                                </Label>
                                <div className="flex flex-wrap gap-2">
                                  {rhymeSuggestions.map((word, i) => (
                                    <Button
                                      key={i}
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        const newContent = content.replace(
                                          new RegExp(`\\b${selectedWord}\\b`, "g"),
                                          word,
                                        );
                                        setContent(newContent);
                                        setShowWordAssistant(false);
                                      }}
                                      className="h-8 text-xs"
                                    >
                                      {word}
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {synonymSuggestions.length > 0 && (
                              <div>
                                <Label className="text-xs font-medium mb-2 block">
                                  Synonyms
                                </Label>
                                <div className="flex flex-wrap gap-2">
                                  {synonymSuggestions.map((word, i) => (
                                    <Button
                                      key={i}
                                      variant="secondary"
                                      size="sm"
                                      onClick={() => {
                                        const newContent = content.replace(
                                          new RegExp(`\\b${selectedWord}\\b`, "g"),
                                          word,
                                        );
                                        setContent(newContent);
                                        setShowWordAssistant(false);
                                      }}
                                      className="h-8 text-xs"
                                    >
                                      {word}
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    {/* ADVANCED FEATURE: Collaboration Tab */}
                    <TabsContent value="collab" className="space-y-4 mt-4">
                      <div className="bg-card/30 rounded-lg p-3 border border-border/30 space-y-3">
                        <Label className="text-xs font-medium text-muted-foreground">
                          Collaboration
                        </Label>

                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Collaboration Mode</Label>
                          <Switch
                            checked={collaborationMode}
                            onCheckedChange={toggleCollaborationMode}
                          />
                        </div>

                        {collaborationMode && (
                          <div className="space-y-2">
                            <Input
                              placeholder="Enter collaborator email..."
                              className="h-7 text-xs"
                              onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                  const email = (e.target as HTMLInputElement)
                                    .value;
                                  if (email) {
                                    inviteCollaborator(email);
                                    (e.target as HTMLInputElement).value = "";
                                  }
                                }
                              }}
                            />

                            <div className="text-xs text-muted-foreground">
                              Active Collaborators: {collaborators.length}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Auto-save</Label>
                          <Switch
                            checked={autoSaveEnabled}
                            onCheckedChange={setAutoSaveEnabled}
                          />
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setShowVersionHistory(!showVersionHistory)
                          }
                          className="w-full justify-start gap-2 h-8 text-xs"
                        >
                          <History className="h-3 w-3" />
                          Version History ({versionHistory.length})
                        </Button>
                      </div>
                    </TabsContent>

                    {/* ENHANCED Export Tab */}
                    <TabsContent value="export" className="space-y-4 mt-4">
                      <div className="bg-card/30 rounded-lg p-3 border border-border/30 space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground">
                          Advanced Export Options
                        </Label>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs">Include Metadata</Label>
                            <Switch
                              checked={exportOptions.includeMetadata}
                              onCheckedChange={(checked) =>
                                setExportOptions((prev) => ({
                                  ...prev,
                                  includeMetadata: checked,
                                }))
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label className="text-xs">Include Analysis</Label>
                            <Switch
                              checked={exportOptions.includeAnalysis}
                              onCheckedChange={(checked) =>
                                setExportOptions((prev) => ({
                                  ...prev,
                                  includeAnalysis: checked,
                                }))
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label className="text-xs">Custom Styling</Label>
                            <Switch
                              checked={exportOptions.customStyling}
                              onCheckedChange={(checked) =>
                                setExportOptions((prev) => ({
                                  ...prev,
                                  customStyling: checked,
                                }))
                              }
                            />
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const blob = new Blob([`${title}\n\n${content}`], {
                              type: "text/plain",
                            });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = `${title || "poem"}.txt`;
                            a.click();
                            URL.revokeObjectURL(url);
                          }}
                          className="w-full justify-start gap-2 h-8 text-xs"
                        >
                          <FileText className="h-3 w-3" />
                          Export as Text
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={exportToHTML}
                          className="w-full justify-start gap-2 h-8 text-xs"
                        >
                          <Download className="h-3 w-3" />
                          Export as HTML
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={exportAdvanced}
                          className="w-full justify-start gap-2 h-8 text-xs"
                        >
                          <Crown className="h-3 w-3" />
                          Advanced Export (PDF/DOCX)
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const shareData = {
                              title: title || "Untitled Poem",
                              text: content,
                            };
                            if (navigator.share) {
                              navigator.share(shareData);
                            } else {
                              navigator.clipboard.writeText(
                                `${title}\n\n${content}`,
                              );
                              alert("Poem copied to clipboard!");
                            }
                          }}
                          className="w-full justify-start gap-2 h-8 text-xs"
                        >
                          <Share2 className="h-3 w-3" />
                          Share Poem
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ADVANCED FEATURE MODALS */}

        {/* Version History Modal */}
        <AnimatePresence>
          {showVersionHistory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
              onClick={() => setShowVersionHistory(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-background rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Version History
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowVersionHistory(false)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  {versionHistory.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      No version history yet. Versions are saved automatically
                      every 30 seconds.
                    </div>
                  ) : (
                    versionHistory.map((version, index) => (
                      <div
                        key={version.id}
                        className="border rounded-lg p-3 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-sm">
                            {version.title || "Untitled"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {version.timestamp.toLocaleString()}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {version.content.substring(0, 100)}...
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => restoreVersion(version)}
                            className="h-7 text-xs"
                          >
                            <RotateCcw className="w-3 h-3 mr-1" />
                            Restore
                          </Button>
                          <Badge variant="secondary" className="text-xs">
                            Version {versionHistory.length - index}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Performance Analytics Modal */}
        <AnimatePresence>
          {showMetrics && performanceMetrics && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
              onClick={() => setShowMetrics(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-background rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Performance Analytics
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMetrics(false)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Productivity Stats */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Productivity
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Words Today
                        </span>
                        <span className="font-medium">
                          {performanceMetrics.productivity.wordsToday}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Poems This Week
                        </span>
                        <span className="font-medium">
                          {performanceMetrics.productivity.poemsThisWeek}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Writing Streak
                        </span>
                        <span className="font-medium">
                          {performanceMetrics.productivity.streakDays} days
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Goals */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Writing Goals
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <Label className="text-xs">
                          Daily Words: {writingGoals.dailyWords}
                        </Label>
                        <Slider
                          value={[writingGoals.dailyWords]}
                          onValueChange={([value]) =>
                            setWritingGoals((prev) => ({
                              ...prev,
                              dailyWords: value,
                            }))
                          }
                          min={50}
                          max={500}
                          step={25}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">
                          Weekly Poems: {writingGoals.weeklyPoems}
                        </Label>
                        <Slider
                          value={[writingGoals.weeklyPoems]}
                          onValueChange={([value]) =>
                            setWritingGoals((prev) => ({
                              ...prev,
                              weeklyPoems: value,
                            }))
                          }
                          min={1}
                          max={10}
                          step={1}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Achievements */}
                  <Card className="md:col-span-2">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        Achievements
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {performanceMetrics.achievements.map(
                          (achievement: any, index: number) => (
                            <div
                              key={index}
                              className={cn(
                                "p-3 rounded-lg border text-center",
                                achievement.unlocked
                                  ? "bg-primary/10 border-primary/20"
                                  : "bg-muted/50 border-border",
                              )}
                            >
                              <div
                                className={cn(
                                  "text-sm font-medium mb-1",
                                  achievement.unlocked
                                    ? "text-primary"
                                    : "text-muted-foreground",
                                )}
                              >
                                {achievement.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {achievement.unlocked ? "Unlocked!" : "Locked"}
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Word Assistant Modal */}
        <AnimatePresence>
          {showWordAssistant && selectedWord && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
              onClick={() => setShowWordAssistant(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-background rounded-lg p-6 max-w-lg w-full mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Word Assistant: "{selectedWord}"
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowWordAssistant(false)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  {rhymeSuggestions.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium mb-2 block">
                        Rhyming Words
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {rhymeSuggestions.map((word, i) => (
                          <Button
                            key={i}
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newContent = content.replace(
                                new RegExp(`\\b${selectedWord}\\b`, "g"),
                                word,
                              );
                              setContent(newContent);
                              setShowWordAssistant(false);
                            }}
                            className="h-8 text-xs"
                          >
                            {word}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {synonymSuggestions.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium mb-2 block">
                        Synonyms
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {synonymSuggestions.map((word, i) => (
                          <Button
                            key={i}
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              const newContent = content.replace(
                                new RegExp(`\\b${selectedWord}\\b`, "g"),
                                word,
                              );
                              setContent(newContent);
                              setShowWordAssistant(false);
                            }}
                            className="h-8 text-xs"
                          >
                            {word}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}