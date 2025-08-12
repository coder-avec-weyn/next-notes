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

  // Handle user data questions
  const handleUserDataQuestion = async (userMessage: Message) => {
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    if (userId) {
      saveChatMessage(userMessage, userId);
    }

    try {
      // Fetch user's notes and poetry data
      const [notesResponse, poetryResponse] = await Promise.all([
        fetch("/api/notes").catch(() => null),
        fetch("/api/poetry").catch(() => null),
      ]);

      let notesData = [];
      let poetryData = [];
      let userStats = {
        totalNotes: 0,
        favoriteNotes: 0,
        pinnedNotes: 0,
        totalPoems: 0,
        favoritePoems: 0,
        publicPoems: 0,
        categories: {},
        recentActivity: 0,
      };

      if (notesResponse && notesResponse.ok) {
        const notesResult = await notesResponse.json();
        notesData = notesResult.data || [];
        userStats.totalNotes = notesData.length;
        userStats.favoriteNotes = notesData.filter((n) => n.is_favorite).length;
        userStats.pinnedNotes = notesData.filter((n) => n.is_pinned).length;

        // Calculate recent activity (last 7 days)
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        userStats.recentActivity = notesData.filter(
          (n) => new Date(n.updated_at) > weekAgo,
        ).length;

        // Category distribution
        notesData.forEach((note) => {
          userStats.categories[note.category] =
            (userStats.categories[note.category] || 0) + 1;
        });
      }

      if (poetryResponse && poetryResponse.ok) {
        const poetryResult = await poetryResponse.json();
        poetryData = poetryResult.data || [];
        userStats.totalPoems = poetryData.length;
        userStats.favoritePoems = poetryData.filter(
          (p) => p.is_favorite,
        ).length;
        userStats.publicPoems = poetryData.filter((p) => p.is_public).length;
      }

      // Generate personalized response based on the question
      let responseContent = "";
      const lowerMessage = userMessage.content.toLowerCase();

      if (lowerMessage.includes("who am i")) {
        responseContent = `You are a creative writer and thinker using our advanced note-taking and poetry platform! Here's what I know about your creative journey:

📝 **Your Writing Portfolio:**
• ${userStats.totalNotes} notes created
• ${userStats.totalPoems} poems crafted
• ${userStats.favoriteNotes} favorite notes
• ${userStats.favoritePoems} favorite poems
• ${userStats.recentActivity} items updated this week

🎨 **Your Creative Style:**
${userStats.totalPoems > 0 ? `You're a poet at heart with ${userStats.totalPoems} poems in your collection!` : "You have the soul of a writer, ready to explore poetry!"}
${userStats.publicPoems > 0 ? ` You've shared ${userStats.publicPoems} poems publicly, inspiring others with your words.` : ""}

You're someone who values organization, creativity, and the power of written expression. Keep writing and creating!`;
      } else if (
        lowerMessage.includes("my notes") ||
        lowerMessage.includes("how many notes")
      ) {
        const topCategory = Object.keys(userStats.categories).reduce(
          (a, b) => (userStats.categories[a] > userStats.categories[b] ? a : b),
          "general",
        );
        responseContent = `📚 **Your Note Collection:**

• **Total Notes:** ${userStats.totalNotes}
• **Favorites:** ${userStats.favoriteNotes}
• **Pinned:** ${userStats.pinnedNotes}
• **Most Used Category:** ${topCategory} (${userStats.categories[topCategory] || 0} notes)
• **Recent Activity:** ${userStats.recentActivity} notes updated this week

${userStats.totalNotes === 0 ? "Ready to start your writing journey? Click 'New Note' to create your first masterpiece!" : "Your collection is growing beautifully! Each note is a step in your creative journey."}`;
      } else if (
        lowerMessage.includes("my poems") ||
        lowerMessage.includes("how many poems")
      ) {
        responseContent = `🎭 **Your Poetry Collection:**

• **Total Poems:** ${userStats.totalPoems}
• **Favorites:** ${userStats.favoritePoems}
• **Public Poems:** ${userStats.publicPoems}
• **Private Poems:** ${userStats.totalPoems - userStats.publicPoems}

${userStats.totalPoems === 0 ? "Your poetry journey awaits! Visit the Poetry Studio to craft your first verse with our advanced formatting tools." : `You've created ${userStats.totalPoems} beautiful poems! Your words have the power to move hearts and minds.`}`;
      } else if (
        lowerMessage.includes("how to create") ||
        lowerMessage.includes("how do i create")
      ) {
        if (lowerMessage.includes("poem")) {
          responseContent = `🎨 **Creating Poetry Made Beautiful:**

1. **Visit Poetry Studio** - Click the 'New Poem' button or navigate to /dashboard/poetry
2. **Choose Your Style** - Select from serif, sans-serif, cursive, or fantasy fonts
3. **Format Beautifully** - Adjust alignment, line spacing, and indentation
4. **Add Meaning** - Set mood, theme, and tags for organization
5. **Style Your Words** - Use bold, italics, uppercase, and special effects
6. **Preview & Share** - Use showcase mode to present your work beautifully

**Pro Tips:**
• Use the rhyme suggestions feature for perfect verses
• Try different typography to match your poem's mood
• Enable public sharing to inspire other writers
• Save favorites for quick access to your best work`;
        } else {
          responseContent = `📝 **Creating Notes Like a Pro:**

1. **Start Fresh** - Click 'New Note' from dashboard or notes page
2. **Choose Category** - Organize with categories like work, personal, ideas, journal
3. **Set Priority** - Mark as low, medium, or high priority
4. **Add Rich Content** - Use our rich text editor for formatting
5. **Tag Smartly** - Add tags for easy searching and filtering
6. **Customize** - Choose colors, set reminders, add location/mood
7. **Organize** - Pin important notes, favorite the best ones

**Power Features:**
• Real-time sync across all devices
• Advanced search and filtering
• Export to multiple formats
• Collaborative editing
• Analytics to track your progress`;
        }
      } else if (
        lowerMessage.includes("what is this") ||
        lowerMessage.includes("what can i do")
      ) {
        responseContent = `🌟 **Welcome to Your Creative Sanctuary!**

This is a comprehensive platform designed for writers, thinkers, and creators like you. Here's what makes it special:

📝 **Advanced Note-Taking:**
• Rich text editing with full formatting
• Smart categorization and tagging
• Real-time sync across devices
• Advanced search and analytics
• Export and sharing capabilities

🎭 **Poetry Studio:**
• Professional typography controls
• Beautiful presentation modes
• Mood and theme organization
• Rhyme and synonym suggestions
• Public sharing and showcasing

✨ **AI-Powered Features:**
• Writing inspiration and suggestions
• Content improvement recommendations
• Creative prompts and ideas
• Smart organization assistance

🔧 **Productivity Tools:**
• Reminders and scheduling
• Progress tracking and analytics
• Collaborative features
• Multi-format export options

You're not just taking notes—you're building a creative legacy!`;
      } else {
        // Default personalized response
        responseContent = `Based on your creative journey so far:

📊 **Your Stats:**
• ${userStats.totalNotes} notes
• ${userStats.totalPoems} poems
• ${userStats.recentActivity} recent updates

I'm here to help you make the most of this platform! Whether you need writing inspiration, want to learn about features, or need help organizing your thoughts, just ask. What would you like to explore today?`;
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
        content:
          "I'd love to help you with information about your data, but I'm having trouble accessing it right now. However, I can still assist you with writing tips, creative inspiration, and guidance on using this platform's features! What would you like to explore?",
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
        // Add welcome message if no history
        const welcomeMessage = {
          id: crypto.randomUUID(),
          role: "assistant" as const,
          content:
            'Welcome back to your personal writing sanctuary! I\'m here to inspire and guide your creative journey.\n\n🎨 **What I Can Help You With:**\n• Generate creative writing ideas and prompts\n• Provide insights about your notes and poems\n• Guide you through platform features\n• Offer writing tips and inspiration\n• Answer questions about your personal data\n• Help organize and improve your content\n\n✨ **Try asking me:**\n• "Who am I?" - Get insights about your writing journey\n• "How many notes do I have?" - See your collection stats\n• "How do I create a poem?" - Learn about our Poetry Studio\n• "What can this app do?" - Discover all features\n\nWhat would you like to explore today?',
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
        content:
          "Welcome to your personal writing sanctuary! I'm your dedicated AI assistant, here to inspire and guide your creative journey. Whether you're seeking fresh note ideas, exploring trending topics, or need help crafting the perfect words, I'm here to help you flourish as a writer. What creative adventure shall we embark on today?",
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
    ];

    return userDataPatterns.some((pattern) => pattern.test(lowerMessage));
  };

  // Enhanced response processing
  const processAIResponse = (response: string): string => {
    // Remove HTML tags and excessive asterisks, clean up formatting
    return response
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .replace(/\*{2,}/g, "") // Remove multiple asterisks
      .replace(/\*([^*]+)\*/g, "$1") // Remove single asterisk emphasis
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim();
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
        content:
          "I appreciate your curiosity, but I'm designed to respect privacy and maintain confidentiality. I cannot provide information about other users or access their personal data. However, I'm here to help you with your own writing journey, creative ideas, and note-taking needs. Is there something specific about your own work I can assist you with?",
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
        content:
          "Greetings, fellow wordsmith! I am your personal AI writing companion, thoughtfully crafted to elevate your creative expression within this beautiful note-taking sanctuary. Think of me as your literary confidant—I'm here to spark inspiration, help you discover compelling topics, refine your thoughts, and transform your ideas into eloquent prose. Whether you're penning heartfelt journal entries, crafting professional notes, or exploring the depths of creative writing, I'm your dedicated partner in this journey of words. Together, we'll unlock the writer within you and create something truly remarkable.",
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
      // Enhanced context for the AI
      const appContext = `You are an AI assistant for a comprehensive note-taking and poetry application. This platform offers:

**Core Features:**
- Advanced note creation and editing with rich text support
- Poetry creation with sophisticated formatting tools (fonts, alignment, spacing, styles)
- Real-time synchronization across devices
- Smart categorization and tagging system
- Favorites, pinning, and archiving capabilities
- Advanced search and filtering
- Analytics and insights
- Export functionality (JSON, PDF, etc.)
- Collaborative features
- AI-powered writing assistance

**User Management:**
- Secure authentication with Supabase
- User profiles with customizable settings
- Privacy controls and public/private content
- Cross-platform accessibility

**Poetry Features:**
- Advanced typography controls (serif, sans-serif, cursive, fantasy fonts)
- Text alignment and spacing options
- Mood and theme categorization
- Rhyme scheme analysis
- Poetry form recognition
- Beautiful showcase modes for presentation

**Note Features:**
- Multiple categories (general, work, personal, ideas, todo, journal, meeting, research, project, travel)
- Priority levels (low, medium, high)
- Status tracking (draft, review, published)
- Word count and reading time calculation
- Location and mood tracking
- Reminder system

Always provide helpful, creative, and writer-focused responses. Be encouraging and inspiring while being practical and informative.`;

      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: `${appContext}\n\nUser question: ${userMessage.content}`,
          type: "chatbot",
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();

      // Handle chunked responses
      if (data.chunks && data.chunks.length > 1) {
        // Send first chunk immediately
        const firstMessage = {
          id: crypto.randomUUID(),
          role: "assistant" as const,
          content: processAIResponse(data.chunks[0]),
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, firstMessage]);
        if (userId) {
          saveChatMessage(firstMessage, userId);
        }

        // Queue remaining chunks
        setPendingChunks(data.chunks.slice(1));
        setIsProcessingChunks(true);
      } else {
        // Single response
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

  // Process pending chunks with delay
  useEffect(() => {
    if (pendingChunks.length > 0 && isProcessingChunks) {
      const timer = setTimeout(() => {
        const nextChunk = pendingChunks[0];
        const remainingChunks = pendingChunks.slice(1);

        const chunkMessage = {
          id: crypto.randomUUID(),
          role: "assistant" as const,
          content: processAIResponse(nextChunk),
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, chunkMessage]);
        if (userId) {
          saveChatMessage(chunkMessage, userId);
        }

        setPendingChunks(remainingChunks);

        if (remainingChunks.length === 0) {
          setIsProcessingChunks(false);
        }
      }, 1500); // 1.5 second delay between chunks

      return () => clearTimeout(timer);
    }
  }, [pendingChunks, isProcessingChunks, userId]);

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

      // Add welcome message back
      const welcomeMessage = {
        id: crypto.randomUUID(),
        role: "assistant" as const,
        content:
          "Welcome back to your personal writing sanctuary! I'm here to inspire and guide your creative journey. What would you like to explore today?",
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
              onClick={() =>
                handleQuickAction("How do I create a beautiful poem?")
              }
              className="flex items-center gap-1 text-xs hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all"
            >
              <Sparkles className="h-3 w-3" />
              Create Poetry
            </Button>
          </div>
          <div className="text-xs text-muted-foreground text-center">
            💡 Ask me about your data, writing tips, or platform features!
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
