export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  color: string;
  is_favorite: boolean;
  is_archived: boolean;
  is_pinned: boolean;
  reminder_date?: string;
  created_at: string;
  updated_at: string;
  // New features
  priority?: "low" | "medium" | "high";
  status?: "draft" | "published" | "review";
  word_count?: number;
  reading_time?: number;
  collaborators?: string[];
  version?: number;
  template_id?: string;
  location?: string;
  mood?: string;
  weather?: string;
}

export interface CreateNoteData {
  title?: string;
  content?: string;
  category?: string;
  tags?: string[];
  color?: string;
  is_favorite?: boolean;
  is_pinned?: boolean;
  reminder_date?: string;
  priority?: "low" | "medium" | "high";
  status?: "draft" | "published" | "review";
  collaborators?: string[];
  template_id?: string;
  location?: string;
  mood?: string;
  weather?: string;
}

export interface UpdateNoteData extends Partial<CreateNoteData> {
  is_archived?: boolean;
  word_count?: number;
  reading_time?: number;
  version?: number;
}

export interface NoteFilters {
  category?: string;
  tags?: string[];
  is_favorite?: boolean;
  is_archived?: boolean;
  is_pinned?: boolean;
  search?: string;
  priority?: "low" | "medium" | "high";
  status?: "draft" | "published" | "review";
  collaborators?: string[];
  date_range?: { start: string; end: string };
  word_count_range?: { min: number; max: number };
  location?: string;
  mood?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  theme_preference: "light" | "dark" | "system";
  notification_preferences: {
    email: boolean;
    push: boolean;
    reminders: boolean;
  };
  created_at: string;
}

export const NOTE_CATEGORIES = [
  "general",
  "work",
  "personal",
  "ideas",
  "todo",
  "meeting",
  "project",
  "research",
  "journal",
  "recipe",
  "travel",
  "health",
  "finance",
  "education",
] as const;

export const NOTE_PRIORITIES = ["low", "medium", "high"] as const;
export const NOTE_STATUSES = ["draft", "published", "review"] as const;
export const NOTE_MOODS = [
  "happy",
  "sad",
  "excited",
  "calm",
  "stressed",
  "motivated",
  "creative",
  "focused",
] as const;
export const NOTE_WEATHER = [
  "sunny",
  "cloudy",
  "rainy",
  "snowy",
  "stormy",
  "foggy",
] as const;

export const NOTE_COLORS = [
  "#ffffff", // White
  "#fef3c7", // Yellow
  "#dbeafe", // Blue
  "#dcfce7", // Green
  "#fce7f3", // Pink
  "#f3e8ff", // Purple
  "#fed7d7", // Red
  "#e0e7ff", // Indigo
  "#f0f9ff", // Sky
  "#ecfdf5", // Emerald
] as const;

export type NoteCategory = (typeof NOTE_CATEGORIES)[number];
export type NoteColor = (typeof NOTE_COLORS)[number];
