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

      // Generate personalized response based on the question
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

        const displayName =
          userProfile?.full_name ||
          userProfile?.name ||
          currentUser?.user_metadata?.full_name ||
          username;

        const creativeLevel = userStats.totalNotes + userStats.totalPoems;
        let creativeTitle = "Aspiring Writer";

        if (creativeLevel >= 100) creativeTitle = "Master Wordsmith";
        else if (creativeLevel >= 50) creativeTitle = "Prolific Author";
        else if (creativeLevel >= 25) creativeTitle = "Seasoned Writer";
        else if (creativeLevel >= 10) creativeTitle = "Dedicated Creator";
        else if (creativeLevel >= 5) creativeTitle = "Emerging Storyteller";

        // Build comprehensive user profile response
        const profileDetails = [];

        if (lowerMessage.includes("username")) {
          responseContent = `Hi there! Your username is: ${username}`;
        } else {
          profileDetails.push(
            `Hello ${displayName}! You are a ${creativeTitle} on an inspiring creative journey.`,
          );

          // Personal details
          if (userProfile?.bio) {
            profileDetails.push(`Your bio: "${userProfile.bio}"`);
          }
          if (userProfile?.location) {
            profileDetails.push(`Location: ${userProfile.location}`);
          }
          if (userProfile?.company && userProfile?.job_title) {
            profileDetails.push(
              `Professional: ${userProfile.job_title} at ${userProfile.company}`,
            );
          } else if (userProfile?.job_title) {
            profileDetails.push(`Job Title: ${userProfile.job_title}`);
          } else if (userProfile?.company) {
            profileDetails.push(`Company: ${userProfile.company}`);
          }

          // Creative statistics
          const creativeStats = [];
          if (userStats.totalNotes > 0) {
            creativeStats.push(
              `${userStats.totalNotes} notes (${userStats.favoriteNotes} favorites, ${userStats.pinnedNotes} pinned)`,
            );
          }
          if (userStats.totalPoems > 0) {
            creativeStats.push(
              `${userStats.totalPoems} poems (${userStats.favoritePoems} favorites, ${userStats.publicPoems} public)`,
            );
          }
          if (userStats.totalWords > 0) {
            creativeStats.push(
              `${userStats.totalWords.toLocaleString()} total words written`,
            );
          }
          if (userStats.creativeStreak > 0) {
            creativeStats.push(
              `${userStats.creativeStreak} day creative streak`,
            );
          }

          if (creativeStats.length > 0) {
            profileDetails.push(
              `Your creative achievements: ${creativeStats.join(", ")}`,
            );
          }

          // Tags and interests
          if (userStats.tags.size > 0) {
            const topTags = Array.from(userStats.tags).slice(0, 5).join(", ");
            profileDetails.push(`Your favorite topics: ${topTags}`);
          }

          // Recent activity
          if (userStats.recentActivity > 0) {
            profileDetails.push(
              `You've been actively creating with ${userStats.recentActivity} updates this week.`,
            );
          }

          // Profile completion
          if (userProfile?.profile_completion_percentage) {
            profileDetails.push(
              `Profile completion: ${userProfile.profile_completion_percentage}%`,
            );
          }

          const motivationalMessage =
            creativeLevel === 0
              ? "Your creative canvas awaits! Every great writer started with a single word, and yours is about to begin."
              : creativeLevel < 5
                ? "You're building something beautiful! Each piece you create adds to your unique creative voice."
                : creativeLevel < 15
                  ? "Your dedication to writing is evident in every piece you craft. You're developing a distinctive style that's uniquely yours."
                  : creativeLevel < 50
                    ? "You've established yourself as a committed writer with a growing body of work that reflects your creative evolution."
                    : "You are a true master of words, with an impressive collection that showcases your artistic journey and creative mastery.";

          responseContent = `${profileDetails.join("\n\n")}\n\n${motivationalMessage}\n\nYour writing journey is a testament to your creativity, organization, and passion for expression. Keep nurturing that creative spark within you!`;
        }
      } else if (
        lowerMessage.includes("my notes") ||
        lowerMessage.includes("how many notes")
      ) {
        const topCategory = Object.keys(userStats.categories).reduce(
          (a, b) => (userStats.categories[a] > userStats.categories[b] ? a : b),
          "general",
        );

        if (userStats.totalNotes === 0) {
          responseContent =
            "Your note collection is like a blank canvas waiting for your first brushstroke! Ready to start your writing journey? Click 'New Note' to create your first masterpiece and begin building your personal knowledge library.";
        } else {
          const categoryText =
            userStats.categories[topCategory] > 1
              ? `Your favorite category is ${topCategory} with ${userStats.categories[topCategory]} notes`
              : `You have notes across different categories, with ${topCategory} being one of them`;

          const activityText =
            userStats.recentActivity > 0
              ? `You've been actively writing with ${userStats.recentActivity} updates this week`
              : "Take some time to revisit and update your existing notes";

          responseContent = `Your note collection tells a story of ${userStats.totalNotes} thoughtful entries. ${categoryText}. You've marked ${userStats.favoriteNotes} as favorites and pinned ${userStats.pinnedNotes} for quick access. ${activityText}. Your collection is growing beautifully, each note representing a moment of inspiration or important thought!`;
        }
      } else if (
        lowerMessage.includes("my poems") ||
        lowerMessage.includes("how many poems")
      ) {
        if (userStats.totalPoems === 0) {
          responseContent =
            "Your poetry journey awaits like an empty stage ready for your first performance! Visit the Poetry Studio to craft your first verse with our advanced formatting tools. Every great poet started with a single line, and yours is waiting to be written.";
        } else {
          const publicText =
            userStats.publicPoems > 0
              ? `You've courageously shared ${userStats.publicPoems} poems with the world, inspiring others with your words`
              : "Your poems are treasured privately, each one a personal reflection of your inner voice";

          const favoriteText =
            userStats.favoritePoems > 0
              ? ` You've marked ${userStats.favoritePoems} as favorites, showing which pieces hold special meaning for you`
              : "";

          responseContent = `You've created ${userStats.totalPoems} beautiful poems, each one a unique expression of your artistic soul! ${publicText}.${favoriteText}. Your poetry collection represents ${userStats.totalPoems} moments of inspiration transformed into art. Keep writing, your words have the power to move hearts and minds!`;
        }
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
        lowerMessage.includes("what can i do") ||
        lowerMessage.includes("features") ||
        lowerMessage.includes("tutorial") ||
        lowerMessage.includes("how to use") ||
        lowerMessage.includes("navigation") ||
        lowerMessage.includes("guide")
      ) {
        responseContent = `Welcome to Your Creative Sanctuary!

This is a comprehensive platform designed for writers, thinkers, and creators like you. Here's what makes it special:

Advanced Note-Taking:
• Rich text editing with full formatting and markdown support
• Smart categorization (general, work, personal, ideas, todo, journal, meeting, research, project, travel)
• Priority levels (low, medium, high) and status tracking (draft, review, published)
• Real-time sync across all devices with offline support
• Advanced search and filtering by content, tags, category, priority, status
• Color coding and visual organization
• Favorites, pinning, and archiving capabilities
• Word count, reading time calculation, and analytics
• Location and mood tracking for context
• Reminder system with notifications
• Export to JSON, PDF, and text formats
• Bulk operations and collaborative features

Poetry Studio:
• Professional typography controls (serif, sans-serif, cursive, fantasy fonts)
• Advanced formatting (alignment, line spacing, indentation, stanza spacing)
• Text styling (bold, italics, uppercase, underline, text shadow)
• Beautiful presentation modes (scroll, page, minimal showcase)
• Mood and theme organization for emotional context
• Rhyme scheme analysis and poetry form recognition
• Background textures and visual enhancements
• Public sharing and community showcasing
• Poetry-specific analytics and insights

AI-Powered Features:
• Personalized writing assistant with access to your data
• Creative writing prompts tailored to your interests
• Content improvement and style suggestions
• Writing pattern analysis and insights
• Smart organization recommendations
• Rhyme and synonym suggestions for poetry
• Grammar and style enhancement
• Topic and theme suggestions based on your history

Productivity Tools:
• Comprehensive dashboard with statistics and insights
• Real-time collaboration and sharing
• Advanced analytics (word count trends, category distribution, activity patterns)
• Multi-format export and backup options
• Cross-platform accessibility (web, mobile-responsive)
• Dark/light theme support
• Keyboard shortcuts and quick actions
• Search across all content with advanced filters

User Management:
• Secure authentication with profile customization
• Privacy controls (public/private content)
• Activity logging and session management
• Two-factor authentication support
• Profile completion tracking
• Social links and professional information
• Timezone and language preferences

Navigation Guide:
• Dashboard: Overview of your creative work and statistics
• Notes: Create, edit, and manage all your notes
• Poetry: Access the Poetry Studio for creating and showcasing poems
• Profile: Manage your account settings and personal information
• Search: Find any content across notes and poetry
• Analytics: Deep insights into your writing patterns and progress

You're not just taking notes—you're building a creative legacy with professional tools and AI assistance!`;
      } else if (
        lowerMessage.includes("export my") ||
        lowerMessage.includes("backup my") ||
        lowerMessage.includes("download my")
      ) {
        responseContent = `You can easily export and backup your creative work! Here's how:\n\nFor Notes: Visit your notes page and use the export feature to download in JSON, PDF, or text format. You can export all notes or select specific ones.\n\nFor Poetry: From the poetry section, you can export your poems with their beautiful formatting preserved, perfect for creating a personal anthology.\n\nYour data is always yours to keep and share. Regular backups ensure your creative work is safe and portable across platforms.`;
      } else if (
        lowerMessage.includes("writing tips") ||
        lowerMessage.includes("improve my writing") ||
        lowerMessage.includes("writing advice")
      ) {
        const tips = [
          "Write consistently, even if it's just a few sentences daily. Consistency builds momentum and improves your craft over time.",
          "Read your work aloud. Your ears will catch awkward phrasing and rhythm issues that your eyes might miss.",
          "Use the active voice when possible. It makes your writing more direct and engaging.",
          "Show, don't tell. Instead of saying 'she was angry,' describe her clenched fists and sharp words.",
          "Edit ruthlessly. Your first draft is just the beginning. Great writing happens in the revision process.",
        ];
        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        responseContent = `Here's a personalized writing tip for you: ${randomTip}\n\nRemember, every great writer started where you are now. Use this platform's features like categories and tags to organize your thoughts, and don't forget to mark your favorites to track your progress. Keep writing, keep improving!`;
      } else if (
        lowerMessage.includes("creative inspiration") ||
        lowerMessage.includes("writing prompts") ||
        lowerMessage.includes("story ideas")
      ) {
        const prompts = [
          "Write about a memory that changed how you see the world. What happened, and how did it shift your perspective?",
          "Describe a place that feels like home to you, but focus on the small details that make it special.",
          "Create a character who discovers something unexpected in their daily routine. What do they find?",
          "Write about a conversation you wish you could have with someone from your past.",
          "Imagine you could give advice to yourself from five years ago. What would you say?",
        ];
        const randomPrompt =
          prompts[Math.floor(Math.random() * prompts.length)];
        responseContent = `Here's a creative prompt to spark your imagination: ${randomPrompt}\n\nTake this idea and make it your own! Use the rich text editor to format your thoughts beautifully, and don't forget to categorize and tag your work for easy discovery later. Your creativity is unique, let it flow!`;
      } else if (
        lowerMessage.includes("analyze my") ||
        lowerMessage.includes("insights about my") ||
        lowerMessage.includes("patterns in my") ||
        lowerMessage.includes("my writing style") ||
        lowerMessage.includes("my habits")
      ) {
        const insights = [];
        const recommendations = [];

        // Content volume analysis
        if (userStats.totalNotes > 20) {
          insights.push(
            `You're a prolific note-taker with ${userStats.totalNotes} entries, demonstrating exceptional dedication to capturing and organizing your thoughts.`,
          );
        } else if (userStats.totalNotes > 5) {
          insights.push(
            `You're a consistent note-taker with ${userStats.totalNotes} entries, showing good habits in documenting your ideas.`,
          );
        }

        if (userStats.totalPoems > 10) {
          insights.push(
            `Your ${userStats.totalPoems} poems reveal a deeply poetic soul with a strong commitment to artistic expression.`,
          );
        } else if (userStats.totalPoems > 2) {
          insights.push(
            `Your ${userStats.totalPoems} poems show your artistic side and appreciation for creative expression.`,
          );
        }

        // Writing productivity analysis
        if (userStats.averageWordsPerNote > 500) {
          insights.push(
            `Your notes average ${userStats.averageWordsPerNote} words each, indicating you prefer detailed, comprehensive documentation.`,
          );
          recommendations.push(
            "Consider breaking longer notes into smaller, focused pieces for easier reference.",
          );
        } else if (userStats.averageWordsPerNote > 200) {
          insights.push(
            `Your notes average ${userStats.averageWordsPerNote} words each, showing a good balance between detail and conciseness.`,
          );
        } else if (userStats.averageWordsPerNote > 0) {
          insights.push(
            `Your notes average ${userStats.averageWordsPerNote} words each, suggesting you prefer concise, focused entries.`,
          );
          recommendations.push(
            "Try expanding some notes with more details or examples to enhance their value.",
          );
        }

        // Activity patterns
        if (userStats.creativeStreak > 7) {
          insights.push(
            `You have an impressive ${userStats.creativeStreak}-day creative streak, showing exceptional consistency in your writing practice.`,
          );
        } else if (userStats.creativeStreak > 3) {
          insights.push(
            `Your ${userStats.creativeStreak}-day creative streak shows good momentum in your writing routine.`,
          );
        } else if (userStats.recentActivity > 0) {
          insights.push(
            `You've been actively creating with ${userStats.recentActivity} updates this week, showing engagement with your work.`,
          );
          recommendations.push(
            "Try to write something every day, even if it's just a few sentences, to build a creative habit.",
          );
        }

        // Content organization patterns
        const topCategory = Object.keys(userStats.categories).reduce(
          (a, b) => (userStats.categories[a] > userStats.categories[b] ? a : b),
          "general",
        );

        if (userStats.categories[topCategory] > 5) {
          insights.push(
            `Your strong preference for ${topCategory} content (${userStats.categories[topCategory]} notes) suggests this is a core area of interest and expertise.`,
          );
        }

        // Engagement patterns
        const favoriteRatio =
          (userStats.favoriteNotes + userStats.favoritePoems) /
          (userStats.totalNotes + userStats.totalPoems);
        if (favoriteRatio > 0.3) {
          insights.push(
            `You mark ${Math.round(favoriteRatio * 100)}% of your content as favorites, indicating high standards and strong emotional connection to your work.`,
          );
        } else if (favoriteRatio > 0.1) {
          insights.push(
            `You mark ${Math.round(favoriteRatio * 100)}% of your content as favorites, showing selective appreciation for your best work.`,
          );
        }

        // Public sharing patterns
        const publicRatio =
          (userStats.publicNotes + userStats.publicPoems) /
          (userStats.totalNotes + userStats.totalPoems);
        if (publicRatio > 0.5) {
          insights.push(
            `You share ${Math.round(publicRatio * 100)}% of your content publicly, demonstrating confidence and a desire to connect with others through your writing.`,
          );
          recommendations.push(
            "Consider engaging with the community by reading and commenting on other public works.",
          );
        } else if (publicRatio > 0.2) {
          insights.push(
            `You share ${Math.round(publicRatio * 100)}% of your content publicly, showing selective sharing of your best work.`,
          );
        } else {
          insights.push(
            "You prefer to keep most of your work private, which is perfectly fine for personal reflection and growth.",
          );
          recommendations.push(
            "Consider sharing some of your favorite pieces publicly to connect with other writers and get feedback.",
          );
        }

        // Tag usage analysis
        if (userStats.tags.size > 20) {
          insights.push(
            `You use ${userStats.tags.size} different tags, showing excellent organizational skills and diverse interests.`,
          );
        } else if (userStats.tags.size > 10) {
          insights.push(
            `You use ${userStats.tags.size} different tags, demonstrating good organization and varied topics.`,
          );
        } else if (userStats.tags.size > 0) {
          insights.push(
            `You use ${userStats.tags.size} tags for organization, which helps with content discovery.`,
          );
          recommendations.push(
            "Consider using more specific tags to improve content organization and searchability.",
          );
        }

        // Productivity insights
        if (userStats.totalWords > 50000) {
          insights.push(
            `You've written over ${userStats.totalWords.toLocaleString()} words total - that's equivalent to a short novel! Your dedication to writing is truly impressive.`,
          );
        } else if (userStats.totalWords > 10000) {
          insights.push(
            `You've written ${userStats.totalWords.toLocaleString()} words total, showing substantial creative output and commitment.`,
          );
        }

        // Generate recommendations based on patterns
        if (userStats.totalNotes > userStats.totalPoems * 5) {
          recommendations.push(
            "You seem to prefer note-taking over poetry. Try exploring the Poetry Studio to add more creative expression to your writing.",
          );
        } else if (userStats.totalPoems > userStats.totalNotes * 2) {
          recommendations.push(
            "You have a strong poetic inclination. Consider using notes to capture ideas and inspiration for future poems.",
          );
        }

        if (
          userStats.archivedNotes + userStats.archivedPoems >
          (userStats.totalNotes + userStats.totalPoems) * 0.3
        ) {
          recommendations.push(
            "You archive a significant portion of your work. Consider reviewing archived content periodically - you might find gems worth revisiting.",
          );
        }

        const finalResponse =
          insights.length > 0
            ? `Based on your writing patterns, here are detailed insights about your creative journey:\n\n${insights.join("\n\n")}${recommendations.length > 0 ? `\n\nRecommendations for enhancing your writing practice:\n\n${recommendations.join("\n\n")}` : ""}\n\nThese patterns reveal your unique creative voice and demonstrate your commitment to thoughtful expression. Your writing journey shows both consistency and growth!`
            : "You're just beginning your creative journey! As you write more, I'll be able to provide detailed insights about your unique patterns, preferences, and writing style. Every piece you create adds to your creative fingerprint and helps me understand your artistic voice better.";

        responseContent = finalResponse;
      } else if (
        lowerMessage.includes("advanced features") ||
        lowerMessage.includes("pro tips") ||
        lowerMessage.includes("hidden features") ||
        lowerMessage.includes("shortcuts") ||
        lowerMessage.includes("productivity")
      ) {
        responseContent = `Here are 5 advanced features and pro tips to supercharge your creative workflow:\n\n1. Smart Bulk Operations:\n• Select multiple notes using checkboxes and perform bulk actions\n• Export selected notes in different formats (JSON, PDF, text)\n• Apply tags, categories, or status changes to multiple items at once\n• Use Ctrl+Click to select individual items or Shift+Click for ranges\n\n2. Advanced Search & Filtering:\n• Use search operators: "exact phrase", category:work, tag:important\n• Combine filters: show only pinned notes from last month with high priority\n• Search across both content and metadata (location, mood, weather)\n• Save frequently used filter combinations as bookmarks\n\n3. Real-time Collaboration & Sync:\n• Changes sync instantly across all your devices\n• See live indicators when content is being updated\n• Collaborate with others on public notes and poems\n• Use the broadcast system for multi-tab synchronization\n\n4. AI-Powered Content Enhancement:\n• Ask me to analyze your writing patterns and suggest improvements\n• Get personalized writing prompts based on your content history\n• Use AI to help with rhyme schemes and poetry structure\n• Request content suggestions based on your most-used tags and categories\n\n5. Advanced Poetry Studio Features:\n• Use background textures (parchment, canvas, etc.) for visual appeal\n• Apply text shadows and letter spacing for artistic effects\n• Create custom stanza spacing and first-line indentation\n• Use the showcase mode with auto-play for presentations\n• Analyze your poetry for form recognition and rhyme scheme detection\n\nBonus Pro Tips:\n• Use keyboard shortcuts: Ctrl+N for new note, Ctrl+S to save\n• Pin your most important content for quick dashboard access\n• Set up reminders with specific dates and times\n• Use color coding to create visual organization systems\n• Export your data regularly as backup (JSON format preserves all metadata)\n\nThese features transform your writing from simple note-taking into a professional creative workflow!`;
      } else if (
        lowerMessage.includes("data export") ||
        lowerMessage.includes("backup") ||
        lowerMessage.includes("download data") ||
        lowerMessage.includes("migrate")
      ) {
        responseContent = `Your data is always yours to keep and control! Here's everything you need to know about data export and backup:\n\nExport Options:\n• JSON Format: Complete data with all metadata, formatting, and relationships preserved\n• PDF Format: Beautiful formatted documents perfect for printing or sharing\n• Text Format: Plain text version for maximum compatibility\n• Bulk Export: Select multiple items or export everything at once\n\nWhat Gets Exported:\n• All note content, titles, and rich text formatting\n• Complete poetry with styling, fonts, and layout information\n• Metadata: categories, tags, priorities, status, creation/update dates\n• Personal data: favorites, pins, archive status, color coding\n• Analytics data: word counts, reading times, activity patterns\n\nHow to Export:\n• From Notes page: Use the export button in the toolbar\n• Bulk selection: Check items you want and click export\n• Individual items: Use the menu in each note or poem\n• Complete backup: Export all data from your profile settings\n\nData Portability:\n• JSON exports can be imported into other systems\n• All exports include timestamps and unique identifiers\n• No vendor lock-in - your data remains accessible\n• Regular automated backups recommended for peace of mind\n\nPrivacy & Security:\n• Exports only include your own data (privacy protected)\n• All exports are generated client-side when possible\n• No data is shared with third parties during export\n• You control what gets exported and when\n\nBest Practices:\n• Export regularly (monthly or quarterly)\n• Store backups in multiple locations (cloud + local)\n• Test restore procedures periodically\n• Keep exports organized with date stamps\n• Use JSON format for complete data preservation\n\nYour creative work is valuable - these tools ensure it's always safe and portable!`;
      } else if (
        lowerMessage.includes("collaboration") ||
        lowerMessage.includes("sharing") ||
        lowerMessage.includes("public") ||
        lowerMessage.includes("community")
      ) {
        responseContent = `Discover the power of creative collaboration and community sharing:\n\nSharing Your Work:\n• Make notes and poems public to share with the community\n• Control visibility: public, private, or friends-only\n• Share individual pieces or entire collections\n• Get feedback and inspiration from other writers\n• Build your public profile and creative portfolio\n\nCollaboration Features:\n• Real-time editing and synchronization\n• Comment and feedback systems on public content\n• Follow other writers and discover new voices\n• Collaborative writing projects and challenges\n• Community-driven writing prompts and themes\n\nPublic Profile Benefits:\n• Showcase your best work to a wider audience\n• Connect with like-minded writers and creators\n• Participate in writing communities and discussions\n• Get discovered by readers interested in your topics\n• Build your reputation as a thoughtful writer\n\nPrivacy Controls:\n• Granular privacy settings for each piece of content\n• Choose what appears on your public profile\n• Control who can see your activity and statistics\n• Option to share anonymously or with full attribution\n• Easy toggle between public and private modes\n\nCommunity Guidelines:\n• Respectful and constructive feedback encouraged\n• Original content and proper attribution required\n• Diverse voices and perspectives welcomed\n• Safe space for creative expression and growth\n• Moderation tools to maintain quality discussions\n\nNetworking Opportunities:\n• Connect with writers in your areas of interest\n• Join writing groups and themed communities\n• Participate in collaborative projects and challenges\n• Share resources, tips, and writing techniques\n• Build lasting relationships with fellow creators\n\nYour voice matters in our creative community - share your unique perspective and inspire others!`;
      } else {
        responseContent = `I'm your comprehensive AI writing assistant, here to help with every aspect of your creative journey! I have access to all your personal data, notes, poems, and platform features to provide you with the most accurate and personalized responses possible.\n\nI can help you with:\n\nPersonal Data & Analytics:\n• Your username, profile information, and account details\n• Complete statistics about your notes and poetry collection\n• Writing patterns, habits, and productivity insights\n• Content analysis and personalized recommendations\n• Progress tracking and goal setting\n\nContent Management:\n• Creating, organizing, and optimizing your notes and poems\n• Advanced search and filtering techniques\n• Tagging strategies and categorization systems\n• Export and backup procedures\n• Content improvement suggestions\n\nPlatform Navigation:\n• Complete tutorials for all features and tools\n• Keyboard shortcuts and productivity tips\n• Advanced features and hidden capabilities\n• Troubleshooting and technical support\n• Best practices for optimal workflow\n\nCreative Assistance:\n• Personalized writing prompts based on your interests\n• Poetry techniques and formatting guidance\n• Style analysis and improvement suggestions\n• Creative inspiration tailored to your writing patterns\n• Collaboration and sharing strategies\n\nTechnical Support:\n• Data export and import procedures\n• Privacy settings and security features\n• Synchronization and backup solutions\n• Integration with other tools and platforms\n• Performance optimization tips\n\nJust ask me anything about yourself, your content, the platform features, or creative writing in general. I'm here to provide accurate, helpful, and personalized assistance for your unique creative journey!`;
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
      /\b(my progress|my journey|my writing)\b/,
      /\b(export my|backup my|download my)\b/,
      /\b(writing tips|improve my writing|writing advice)\b/,
      /\b(creative inspiration|writing prompts|story ideas)\b/,
      /\b(analyze my|insights about my|patterns in my)\b/,
    ];

    return userDataPatterns.some((pattern) => pattern.test(lowerMessage));
  };

  // Enhanced response processing
  const processAIResponse = (response: string): string => {
    // Remove HTML tags, excessive asterisks, and unnecessary formatting
    return response
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
      .replace(/^\s*[•-]\s*/gm, "") // Remove bullet points at line start
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

      // Enhanced context for the AI
      const appContext = `You are an AI assistant for a comprehensive note-taking and poetry application. You have access to the user's complete data and should provide personalized, accurate responses.

**User Context:** ${userContext}

**Platform Features:**
- Advanced note creation and editing with rich text support, categories (general, work, personal, ideas, todo, journal, meeting, research, project, travel), priority levels (low, medium, high), status tracking (draft, review, published)
- Poetry creation with sophisticated formatting tools (serif, sans-serif, cursive, fantasy fonts), text alignment and spacing, mood and theme categorization, rhyme scheme analysis, poetry form recognition, beautiful showcase modes
- Real-time synchronization across devices with offline support
- Smart categorization and tagging system with advanced search and filtering
- Favorites, pinning, and archiving capabilities with bulk operations
- Analytics and insights including word count trends, category distribution, activity patterns
- Export functionality (JSON, PDF, text) with complete data portability
- Collaborative features with public/private sharing and community interaction
- AI-powered writing assistance with personalized prompts and suggestions
- User profiles with customizable settings, privacy controls, and professional information
- Cross-platform accessibility with responsive design
- Personal writing journey tracking with streak counters and progress analytics
- Advanced productivity tools including reminders, keyboard shortcuts, and workflow optimization
- Security features with two-factor authentication and session management
- Data backup and migration tools with complete export capabilities

**Navigation:**
- Dashboard: Overview with statistics and recent activity
- Notes: Create, edit, and manage all notes with advanced filtering
- Poetry: Access Poetry Studio for creating and showcasing poems
- Profile: Manage account settings and personal information
- Search: Find content across notes and poetry with advanced operators
- Analytics: Deep insights into writing patterns and progress

**Response Guidelines:**
- Always provide accurate, personalized responses based on the user's actual data
- Be encouraging and inspiring while being practical and informative
- Remove all HTML tags, excessive formatting, asterisks, bullet points, and emojis
- Focus on the user's specific needs and creative journey
- Provide actionable advice and clear instructions
- Maintain a supportive, creative, and professional tone`;

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
              onClick={() => handleQuickAction("What can this platform do?")}
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
