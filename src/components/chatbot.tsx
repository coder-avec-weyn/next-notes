"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, TrendingUp, Lightbulb, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { fadeIn, slideInFromRight, slideInFromLeft } from "@/utils/animations";
import { createClient } from "../../supabase/client";

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
};

export function Chatbot({
  onClose,
  initialPrompt,
  className = "",
}: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState(initialPrompt || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);

  // Get user ID on component mount
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUserId(data.user.id);
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
            "Hi there! I'm your AI assistant. I can help you think of new note topics or show you trending topics. What would you like to do today?",
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
          "Hi there! I'm your AI assistant. I can help you think of new note topics or show you trending topics. What would you like to do today?",
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

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: crypto.randomUUID(),
      role: "user" as const,
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    if (userId) {
      saveChatMessage(userMessage, userId);
    }

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: userMessage.content,
          type: "chatbot",
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();

      const aiMessage = {
        id: crypto.randomUUID(),
        role: "assistant" as const,
        content: data.response,
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
    handleSendMessage();
  };

  return (
    <div
      className={`flex flex-col bg-background border rounded-lg shadow-lg overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-medium">AI Assistant</h3>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ maxHeight: "400px" }}
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
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
              >
                <p className="whitespace-pre-wrap break-words text-sm">
                  {message.content}
                </p>
                <div className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
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

      {/* Quick Actions */}
      <div className="p-2 border-t border-border flex flex-wrap gap-2 bg-muted/30">
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            handleQuickAction("Suggest 5 creative note topics for me")
          }
          className="flex items-center gap-1 text-xs"
        >
          <Lightbulb className="h-3 w-3" />
          Suggest Topics
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            handleQuickAction(
              "What are the trending topics in technology today?",
            )
          }
          className="flex items-center gap-1 text-xs"
        >
          <TrendingUp className="h-3 w-3" />
          Tech Trends
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            handleQuickAction(
              "What are some trending lifestyle topics I could write about?",
            )
          }
          className="flex items-center gap-1 text-xs"
        >
          <TrendingUp className="h-3 w-3" />
          Lifestyle Trends
        </Button>
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-3 border-t flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
          className="flex-1"
          disabled={isLoading}
        />
        <Button type="submit" size="sm" disabled={!input.trim() || isLoading}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
