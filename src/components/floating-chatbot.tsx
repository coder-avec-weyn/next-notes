"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chatbot } from "@/components/chatbot";

export function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen ? (
          <Chatbot
            onClose={() => setIsOpen(false)}
            isFloating={true}
            className="shadow-2xl border-2 border-primary/20"
          />
        ) : (
          <motion.div
            initial={{ scale: 0, opacity: 0, rotate: -180 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0, rotate: 180 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => setIsOpen(true)}
              size="lg"
              className="h-16 w-16 rounded-full shadow-xl bg-gradient-to-r from-primary via-primary/90 to-primary/80 hover:from-primary/90 hover:via-primary/80 hover:to-primary/70 transition-all duration-500 border-2 border-white/20 backdrop-blur-sm relative overflow-hidden group"
              aria-label="Open AI Writing Assistant"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              <div className="relative flex items-center justify-center">
                <Bot className="h-7 w-7 text-white drop-shadow-sm" />
                <Sparkles className="h-3 w-3 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
              </div>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
