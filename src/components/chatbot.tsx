"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Sparkles,
  TrendingUp,
  Lightbulb,
  X,
  Minimize2,
  Maximize2,
  Trash2,
  RotateCcw,
  Bot,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { fadeIn, slideInFromRight, slideInFromLeft } from "@/utils/animations";
import { createClient } from "../../supabase/client";
import { useToast } from "@/components/ui/use-toast";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

type ChatbotProps = {
  onClose?: () => void;
  initialPrompt?: string;
  className?: string;
  isFloating?: boolean;
};

export function Chatbot({
  onClose,
  initialPrompt,
  className = "",
  isFloating = false,
}: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState(initialPrompt || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [pendingChunks, setPendingChunks] = useState<string[]>([]);
  const [isProcessingChunks, setIsProcessingChunks] = useState(false);
  const { toast } = useToast();

  // Handle user data questions with concise responses
  const handleUserDataQuestion = async (userMessage: Message) => {
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    if (userId) {
      saveChatMessage(userMessage, userId);
    }

    try {
      // Fetch comprehensive user data including profile, notes, and poetry
      const [notesResponse, poetryResponse, userProfileResponse] =
        await Promise.all([
          fetch("/api/notes").catch(() => null),
          fetch("/api/poetry").catch(() => null),
          userId
            ? supabase
                .from("users")
                .select("*")
                .eq("id", userId)
                .single()
                .then((result) => ({ data: result.data, error: result.error }))
                .catch(() => ({ data: null, error: null }))
            : Promise.resolve({ data: null, error: null }),
        ]);

      let notesData = [];
      let poetryData = [];
      let userProfile = null;
      let userStats = {
        totalNotes: 0,
        favoriteNotes: 0,
        pinnedNotes: 0,
        archivedNotes: 0,
        publicNotes: 0,
        totalPoems: 0,
        favoritePoems: 0,
        publicPoems: 0,
        archivedPoems: 0,
        categories: {},
        tags: new Set(),
        recentActivity: 0,
        totalWords: 0,
        averageWordsPerNote: 0,
        readingTime: 0,
        creativeStreak: 0,
      };

      // Get user profile data
      if (userProfileResponse && userProfileResponse.data) {
        userProfile = userProfileResponse.data;
      }

      if (notesResponse && notesResponse.ok) {
        const notesResult = await notesResponse.json();
        notesData = notesResult.data || [];
        userStats.totalNotes = notesData.length;
        userStats.favoriteNotes = notesData.filter((n) => n.is_favorite).length;
        userStats.pinnedNotes = notesData.filter((n) => n.is_pinned).length;
        userStats.archivedNotes = notesData.filter((n) => n.is_archived).length;
        userStats.publicNotes = notesData.filter((n) => n.is_public).length;

        // Calculate recent activity (last 7 days)
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        userStats.recentActivity = notesData.filter(
          (n) => new Date(n.updated_at) > weekAgo,
        ).length;

        // Category distribution and tags
        notesData.forEach((note) => {
          userStats.categories[note.category] =
            (userStats.categories[note.category] || 0) + 1;
          if (note.tags) {
            note.tags.forEach((tag) => userStats.tags.add(tag));
          }
          if (note.word_count) {
            userStats.totalWords += note.word_count;
          }
          if (note.reading_time) {
            userStats.readingTime += note.reading_time;
          }
        });

        userStats.averageWordsPerNote =
          userStats.totalNotes > 0
            ? Math.round(userStats.totalWords / userStats.totalNotes)
            : 0;
      }

      if (poetryResponse && poetryResponse.ok) {
        const poetryResult = await poetryResponse.json();
        poetryData = poetryResult.data || [];
        userStats.totalPoems = poetryData.length;
        userStats.favoritePoems = poetryData.filter(
          (p) => p.is_favorite,
        ).length;
        userStats.publicPoems = poetryData.filter((p) => p.is_public).length;
        userStats.archivedPoems = poetryData.filter(
          (p) => p.is_archived,
        ).length;

        // Add poetry tags and word counts
        poetryData.forEach((poem) => {
          if (poem.tags) {
            poem.tags.forEach((tag) => userStats.tags.add(tag));
          }
          if (poem.word_count) {
            userStats.totalWords += poem.word_count;
          }
          if (poem.reading_time) {
            userStats.readingTime += poem.reading_time;
          }
        });
      }

      // Calculate creative streak (consecutive days with activity)
      const sortedDates = [...notesData, ...poetryData]
        .map((item) => new Date(item.created_at).toDateString())
        .filter((date, index, arr) => arr.indexOf(date) === index)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

      let streak = 0;
      const today = new Date().toDateString();
      for (let i = 0; i < sortedDates.length; i++) {
        const expectedDate = new Date();
        expectedDate.setDate(expectedDate.getDate() - i);
        if (sortedDates[i] === expectedDate.toDateString()) {
          streak++;
        } else {
          break;
        }
      }
      userStats.creativeStreak = streak;

      // Generate concise response based on the question
      let responseContent = "";
      const lowerMessage = userMessage.content.toLowerCase();

      if (
        lowerMessage.includes("who am i") ||
        lowerMessage.includes("my username") ||
        lowerMessage.includes("what is my username")
      ) {
        // Get username from multiple sources
        const username =
          userProfile?.username ||
          userProfile?.name ||
          userProfile?.full_name ||
          currentUser?.user_metadata?.full_name ||
          currentUser?.user_metadata?.name ||
          currentUser?.email?.split("@")[0] ||
          "Creative Soul";

        if (lowerMessage.includes("username")) {
          responseContent = `Your username is ${username}.`;
        } else {
          responseContent = `You are ${username}.`;
        }
      } else if (
        lowerMessage.includes("my notes") ||
        lowerMessage.includes("how many notes")
      ) {
        if (userStats.totalNotes === 0) {
          responseContent = "You have no notes yet.";
        } else {
          responseContent = `You have ${userStats.totalNotes} notes.`;
        }
      } else if (
        lowerMessage.includes("my poems") ||
        lowerMessage.includes("how many poems")
      ) {
        if (userStats.totalPoems === 0) {
          responseContent = "You have no poems yet.";
        } else {
          responseContent = `You have ${userStats.totalPoems} poems.`;
        }
      } else if (
        lowerMessage.includes("how to create") ||
        lowerMessage.includes("how do i create")
      ) {
        if (lowerMessage.includes("poem")) {
          responseContent = "Click 'New Poem' or go to /dashboard/poetry to create a poem.";
        } else {
          responseContent = "Click 'New Note' from the dashboard or notes page to create a note.";
        }
      } else if (
        lowerMessage.includes("what is this") ||
        lowerMessage.includes("what can i do") ||
        lowerMessage.includes("features")
      ) {
        responseContent = "This is a note-taking and poetry platform. You can create notes, write poems, organize content, and export your work.";
      } else if (
        lowerMessage.includes("export my") ||
        lowerMessage.includes("backup my") ||
        lowerMessage.includes("download my")
      ) {
        responseContent = "You can export your work from the notes or poetry pages using the export button.";
      } else if (
        lowerMessage.includes("writing tips") ||
        lowerMessage.includes("improve my writing")
      ) {
        responseContent = "Write consistently, read your work aloud, use active voice, and edit ruthlessly.";
      } else if (
        lowerMessage.includes("creative inspiration") ||
        lowerMessage.includes("writing prompts")
      ) {
        const prompts = [
          "Write about a memory that changed your perspective.",
          "Describe a place that feels like home.",
          "Create a character who discovers something unexpected.",
          "Write about a conversation you wish you could have.",
          "Give advice to yourself from five years ago."
        ];
        const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
        responseContent = randomPrompt;
      } else if (
        lowerMessage.includes("analyze my") ||
        lowerMessage.includes("my writing style") ||
        lowerMessage.includes("my habits")
      ) {
        if (userStats.totalNotes + userStats.totalPoems === 0) {
          responseContent = "You haven't written anything yet to analyze.";
        } else {
          responseContent = `You have ${userStats.totalNotes} notes and ${userStats.totalPoems} poems. Your average note length is ${userStats.averageWordsPerNote} words.`;
        }
      } else {
        responseContent = "I can help with your notes, poems, writing tips, and platform features. What would you like to know?";
      }

      const aiMessage = {
        id: crypto.randomUUID(),
        role: "assistant" as const,
        content: responseContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      if (userId) {
        saveChatMessage(aiMessage, userId);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      const errorMessage = {
        id: crypto.randomUUID(),
        role: "assistant" as const,
        content: "I'm having trouble accessing your data right now. Please try again.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
      if (userId) {
        saveChatMessage(errorMessage, userId);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Get user ID and user data on component mount
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUserId(data.user.id);
        setCurrentUser(data.user);
        // Load chat history
        loadChatHistory(data.user.id);
      }
    };
    getUser();
  }, []);

  // Load chat history from Supabase
  const loadChatHistory = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("chat_history")
        .select("*")
        .eq("user_id", userId)
        .order("timestamp", { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const formattedMessages = data.map((msg) => ({
          id: msg.id,
          role: msg.role as "user" | "assistant",
          content: msg.content,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(formattedMessages);
      } else if (data && data.length === 0) {
        // Add concise welcome message if no history
        const welcomeMessage = {
          id: crypto.randomUUID(),
          role: "assistant" as const,
          content: "Hello! How can I help you today?",
          timestamp: new Date(),
        };
        setMessages([welcomeMessage]);
        saveChatMessage(welcomeMessage, userId);
      }
    } catch (err) {
      console.error("Error loading chat history:", err);
      // Add welcome message as fallback
      const welcomeMessage = {
        id: crypto.randomUUID(),
        role: "assistant" as const,
        content: "Hello! How can I help you today?",
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  };

  // Save message to Supabase
  const saveChatMessage = async (message: Message, userId: string) => {
    try {
      await supabase.from("chat_history").insert({
        id: message.id,
        user_id: userId,
        role: message.role,
        content: message.content,
        timestamp: message.timestamp.toISOString(),
      });
    } catch (err) {
      console.error("Error saving chat message:", err);
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Check if user is asking about other users
  const checkForUserInquiry = (message: string): boolean => {
    const lowerMessage = message.toLowerCase();
    const userInquiryPatterns = [
      /\b(other user|another user|different user)\b/,
      /\b(user\s+\w+|@\w+)\b/,
      /\b(someone else|other people|other person)\b/,
      /\b(check.*user|find.*user|search.*user)\b/,
      /\b(user.*profile|profile.*user)\b/,
      /\b(user.*data|data.*user)\b/,
      /\b(user.*info|info.*user)\b/,
    ];

    return userInquiryPatterns.some((pattern) => pattern.test(lowerMessage));
  };

  // Check if user is asking "who are you"
  const checkForIdentityQuestion = (message: string): boolean => {
    const lowerMessage = message.toLowerCase();
    const identityPatterns = [
      /\b(who are you|what are you|who r u)\b/,
      /\b(tell me about yourself|about you)\b/,
      /\b(what is your name|your name)\b/,
      /\b(introduce yourself|introduction)\b/,
    ];

    return identityPatterns.some((pattern) => pattern.test(lowerMessage));
  };

  // Check if user is asking "who am I" or about their own data
  const checkForUserDataQuestion = (message: string): boolean => {
    const lowerMessage = message.toLowerCase();
    const userDataPatterns = [
      /\b(who am i|who i am)\b/,
      /\b(my (total |)notes?|how many notes)\b/,
      /\b(my (total |)poems?|how many poems)\b/,
      /\b(my data|my information|my profile)\b/,
      /\b(my stats|my statistics|my analytics)\b/,
      /\b(how to create|how do i create)\b/,
      /\b(what is this (app|application|website|platform))\b/,
      /\b(what can i do|what features|how does this work)\b/,
      /\b(my progress|my journey|my writing)\b/,
      /\b(export my|backup my|download my)\b/,
      /\b(writing tips|improve my writing|writing advice)\b/,
      /\b(creative inspiration|writing prompts|story ideas)\b/,
      /\b(analyze my|insights about my|patterns in my)\b/,
    ];

    return userDataPatterns.some((pattern) => pattern.test(lowerMessage));
  };

  // Enhanced response processing - make responses more concise
  const processAIResponse = (response: string): string => {
    // Remove HTML tags, excessive asterisks, and unnecessary formatting
    let processed = response
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .replace(/\*{2,}/g, "") // Remove multiple asterisks
      .replace(/\*([^*]+)\*/g, "$1") // Remove single asterisk emphasis
      .replace(/•/g, "") // Remove bullet points
      .replace(
        /📝|📚|🎭|🎨|✨|💡|🌟|🔧|📊|🎯|⚡|🚀|💫|🎪|🎬|🎵|🎸|🎤|🎧|🎹|🎺|🎻|🎪|🎨|🖌️|🖍️|✏️|📝|📖|📚|📓|📔|📕|📗|📘|📙|📒|📑|📄|📃|📋|📊|📈|📉|📌|📍|📎|📏|📐|✂️|🔗|📱|💻|🖥️|⌨️|🖱️|🖨️|💾|💿|📀|💽|💾|📷|📸|📹|🎥|📽️|🎞️|📺|📻|📢|📣|📯|🔔|🔕|🎼|🎵|🎶|🎙️|🎚️|🎛️|🎤|🎧|📻|🎷|🎺|🎸|🎻|🥁|🎹|🎼|🎵|🎶|🎙️|🎚️|🎛️|🎤|🎧|📻/g,
        "",
      ) // Remove emojis
      .replace(/\*\*([^*]+)\*\*/g, "$1") // Remove bold markdown
      .replace(/\s+/g, " ") // Normalize whitespace
      .replace(/^[\s•-]+/gm, "") // Remove bullet points at line start
      .trim();

    // Truncate overly long responses to keep them concise
    const sentences = processed.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length > 2) {
      processed = sentences.slice(0, 2).join(". ") + ".";
    }

    return processed;
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: crypto.randomUUID(),
      role: "user" as const,
      content: input.trim(),
      timestamp: new Date(),
    };

    // Check for user inquiry about other users
    if (checkForUserInquiry(userMessage.content)) {
      const restrictionMessage = {
        id: crypto.randomUUID(),
        role: "assistant" as const,
        content: "I can only help with your own data and writing, not other users' information.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage, restrictionMessage]);
      setInput("");

      if (userId) {
        saveChatMessage(userMessage, userId);
        saveChatMessage(restrictionMessage, userId);
      }
      return;
    }

    // Check for identity question
    if (checkForIdentityQuestion(userMessage.content)) {
      const identityMessage = {
        id: crypto.randomUUID(),
        role: "assistant" as const,
        content: "I'm your AI writing assistant, here to help with your notes, poems, and creative writing.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage, identityMessage]);
      setInput("");

      if (userId) {
        saveChatMessage(userMessage, userId);
        saveChatMessage(identityMessage, userId);
      }
      return;
    }

    // Check for user data questions
    if (checkForUserDataQuestion(userMessage.content)) {
      handleUserDataQuestion(userMessage);
      return;
    }

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    if (userId) {
      saveChatMessage(userMessage, userId);
    }

    try {
      // Get comprehensive user context for AI
      const [userNotesResponse, userPoetryResponse, userProfileResponse] =
        await Promise.all([
          fetch("/api/notes").catch(() => null),
          fetch("/api/poetry").catch(() => null),
          userId
            ? supabase
                .from("users")
                .select("*")
                .eq("id", userId)
                .single()
                .then((result) => ({ data: result.data, error: result.error }))
                .catch(() => ({ data: null, error: null }))
            : Promise.resolve({ data: null, error: null }),
        ]);

      let userContext = "";
      if (userNotesResponse && userNotesResponse.ok) {
        const notesData = await userNotesResponse.json();
        const notes = notesData.data || [];
        userContext += `User has ${notes.length} notes. `;
        if (notes.length > 0) {
          const categories = notes.reduce((acc, note) => {
            acc[note.category] = (acc[note.category] || 0) + 1;
            return acc;
          }, {});
          const topCategory = Object.keys(categories).reduce((a, b) =>
            categories[a] > categories[b] ? a : b,
          );
          const totalWords = notes.reduce(
            (sum, note) => sum + (note.word_count || 0),
            0,
          );
          const favorites = notes.filter((n) => n.is_favorite).length;
          const pinned = notes.filter((n) => n.is_pinned).length;
          userContext += `Top category: ${topCategory} (${categories[topCategory]} notes). Total words: ${totalWords}. Favorites: ${favorites}, Pinned: ${pinned}. `;
        }
      }

      if (userPoetryResponse && userPoetryResponse.ok) {
        const poetryData = await userPoetryResponse.json();
        const poems = poetryData.data || [];
        userContext += `User has ${poems.length} poems. `;
        if (poems.length > 0) {
          const publicPoems = poems.filter((p) => p.is_public).length;
          const favoritePoems = poems.filter((p) => p.is_favorite).length;
          userContext += `Public poems: ${publicPoems}, Favorite poems: ${favoritePoems}. `;
        }
      }

      if (userProfileResponse && userProfileResponse.data) {
        const profile = userProfileResponse.data;
        const username =
          profile.username ||
          profile.name ||
          profile.full_name ||
          currentUser?.email?.split("@")[0] ||
          "User";
        userContext += `Username: ${username}. `;
        if (profile.bio) userContext += `Bio: ${profile.bio}. `;
        if (profile.location) userContext += `Location: ${profile.location}. `;
        if (profile.company) userContext += `Company: ${profile.company}. `;
        if (profile.job_title) userContext += `Job: ${profile.job_title}. `;
      }

      // Simplified context for the AI to encourage concise responses
      const appContext = `You are a concise AI assistant for a note-taking and poetry platform. 

CRITICAL RESPONSE RULES:
- Give ONLY the exact information requested
- Keep responses to 1-2 sentences maximum
- No extra explanations unless specifically asked
- No bullet points, formatting, or emojis
- Be direct and factual

User Context: ${userContext}

For greetings, respond briefly and ask how you can help.
For specific questions, answer only what was asked.
For complex requests, provide the essential information only.`;

      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: `${appContext}\n\nUser question: ${userMessage.content}\n\nRespond concisely in 1-2 sentences maximum.`,
          type: "chatbot",
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();

      // Single concise response only
      const aiMessage = {
        id: crypto.randomUUID(),
        role: "assistant" as const,
        content: processAIResponse(data.response),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      if (userId) {
        saveChatMessage(aiMessage, userId);
      }
    } catch (err) {
      console.error("Error fetching from Gemini API:", err);
      setError("Sorry, I couldn't process your request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
    setTimeout(() => handleSendMessage(), 100);
  };

  // Delete a specific message
  const deleteMessage = async (messageId: string) => {
    try {
      // Remove from local state
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));

      // Remove from database if user is logged in
      if (userId) {
        await supabase
          .from("chat_history")
          .delete()
          .eq("id", messageId)
          .eq("user_id", userId);
      }

      toast({
        title: "Message deleted",
        description: "The message has been removed from your chat history.",
      });
    } catch (error) {
      console.error("Error deleting message:", error);
      toast({
        title: "Error",
        description: "Failed to delete message. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Clear all chat history
  const clearChat = async () => {
    try {
      // Clear local state
      setMessages([]);

      // Clear from database if user is logged in
      if (userId) {
        await supabase.from("chat_history").delete().eq("user_id", userId);
      }

      // Add concise welcome message back
      const welcomeMessage = {
        id: crypto.randomUUID(),
        role: "assistant" as const,
        content: "Hello! How can I help you today?",
        timestamp: new Date(),
      };

      setMessages([welcomeMessage]);

      if (userId) {
        saveChatMessage(welcomeMessage, userId);
      }

      toast({
        title: "Chat cleared",
        description: "Your chat history has been cleared successfully.",
      });
    } catch (error) {
      console.error("Error clearing chat:", error);
      toast({
        title: "Error",
        description: "Failed to clear chat. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div
      className={`flex flex-col bg-background border rounded-lg shadow-lg overflow-hidden transition-all duration-300 ${className} ${isFloating ? "z-50" : ""}`}
      style={{
        height: isMinimized ? "60px" : isFloating ? "500px" : "auto",
        width: isFloating ? "380px" : "auto",
        maxHeight: isFloating ? "80vh" : "none",
      }}
      initial={isFloating ? { opacity: 0, scale: 0.9 } : { opacity: 1 }}
      animate={isFloating ? { opacity: 1, scale: 1 } : { opacity: 1 }}
      exit={isFloating ? { opacity: 0, scale: 0.9 } : { opacity: 1 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bot className="h-5 w-5 text-primary" />
            <Sparkles className="h-2 w-2 text-yellow-500 absolute -top-0.5 -right-0.5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">AI Writing Assistant</h3>
            <p className="text-xs text-muted-foreground">
              Your creative companion
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearChat}
              className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
              title="Clear chat history"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
          {isFloating && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-8 w-8 p-0"
              title={isMinimized ? "Maximize" : "Minimize"}
            >
              {isMinimized ? (
                <Maximize2 className="h-4 w-4" />
              ) : (
                <Minimize2 className="h-4 w-4" />
              )}
            </Button>
          )}
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
              title="Close assistant"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      {!isMinimized && (
        <div
          className="flex-1 overflow-y-auto p-4 space-y-4"
          style={{ maxHeight: isFloating ? "300px" : "400px" }}
        >
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial="initial"
                animate="animate"
                variants={
                  message.role === "user" ? slideInFromRight : slideInFromLeft
                }
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} group`}
              >
                <div className="flex items-start gap-2 max-w-[85%]">
                  {message.role === "assistant" && (
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                      <Bot className="h-3 w-3 text-primary" />
                    </div>
                  )}
                  <div
                    className={`rounded-lg p-3 relative ${message.role === "user" ? "bg-primary text-primary-foreground ml-auto" : "bg-muted"}`}
                  >
                    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                      {message.content}
                    </p>
                    <div className="flex items-center justify-between mt-2 gap-2">
                      <div className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMessage(message.id)}
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                        title="Delete message"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  {message.role === "user" && (
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center mt-1 text-primary-foreground">
                      <span className="text-xs font-medium">
                        {currentUser?.user_metadata?.full_name?.[0] ||
                          currentUser?.email?.[0] ||
                          "U"}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              className="flex justify-start"
              initial="initial"
              animate="animate"
              variants={fadeIn}
            >
              <div className="bg-muted rounded-lg p-4 flex items-center space-x-2">
                <LoadingSpinner size="sm" />
                <span className="text-sm">Thinking...</span>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              className="flex justify-start"
              initial="initial"
              animate="animate"
              variants={fadeIn}
            >
              <div className="bg-destructive/10 text-destructive rounded-lg p-3">
                <p className="text-sm">{error}</p>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Quick Actions */}
      {!isMinimized && (
        <div className="p-2 border-t border-border bg-gradient-to-r from-muted/20 to-muted/40">
          <div className="flex flex-wrap gap-2 mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction("Who am I?")}
              className="flex items-center gap-1 text-xs hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all"
            >
              <Lightbulb className="h-3 w-3" />
              Who Am I?
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleQuickAction("How many notes and poems do I have?")
              }
              className="flex items-center gap-1 text-xs hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all"
            >
              <TrendingUp className="h-3 w-3" />
              My Stats
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction("Give me writing inspiration")}
              className="flex items-center gap-1 text-xs hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all"
            >
              <Sparkles className="h-3 w-3" />
              Inspire Me
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction("Analyze my writing patterns")}
              className="flex items-center gap-1 text-xs hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all"
            >
              <TrendingUp className="h-3 w-3" />
              Analyze
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction("How can I improve my writing?")}
              className="flex items-center gap-1 text-xs hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all"
            >
              <Lightbulb className="h-3 w-3" />
              Tips
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction("How do I export my work?")}
              className="flex items-center gap-1 text-xs hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all"
            >
              <TrendingUp className="h-3 w-3" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleQuickAction("What can this platform do?")
              }
              className="flex items-center gap-1 text-xs hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all"
            >
              <Sparkles className="h-3 w-3" />
              Features
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleQuickAction("How do I create a beautiful poem?")
              }
              className="flex items-center gap-1 text-xs hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all"
            >
              <Sparkles className="h-3 w-3" />
              Poetry
            </Button>
          </div>
          <div className="text-xs text-muted-foreground text-center">
            Ask me about your data, writing tips, creative inspiration, export
            options, or platform features!
          </div>
        </div>
      )}

      {/* Input */}
      {!isMinimized && (
        <form
          onSubmit={handleSendMessage}
          className="p-3 border-t bg-background"
        >
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Share your thoughts, ask for inspiration, or request writing help..."
              className="flex-1 border-primary/20 focus:border-primary/40 focus:ring-primary/20"
              disabled={isLoading || isProcessingChunks}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button
              type="submit"
              size="sm"
              disabled={!input.trim() || isLoading || isProcessingChunks}
              className="bg-primary hover:bg-primary/90 transition-all duration-200"
            >
              {isLoading || isProcessingChunks ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="text-xs text-muted-foreground mt-1 text-center">
            Press Enter to send • Shift+Enter for new line
          </div>
        </form>
      )}
    </div>
  );
}