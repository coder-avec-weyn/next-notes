export interface UserProfile {
  id: string;
  email: string;
  username?: string;
  name?: string;
  full_name?: string;
  bio?: string;
  avatar_url?: string;
  phone?: string;
  location?: string;
  website?: string;
  company?: string;
  job_title?: string;
  timezone: string;
  language: string;
  date_of_birth?: string;
  social_links: Record<string, string>;
  privacy_settings: {
    profile_visibility: "public" | "private" | "friends";
    email_visibility: "public" | "private" | "friends";
    activity_visibility: "public" | "private" | "friends";
  };
  theme_preference: "light" | "dark" | "system";
  notification_preferences: {
    email: boolean;
    push: boolean;
    reminders: boolean;
  };
  two_factor_enabled: boolean;
  last_login_at?: string;
  login_count: number;
  profile_completion_percentage: number;
  account_status: "active" | "inactive" | "suspended";
  created_at: string;
  updated_at?: string;
}

export interface UserActivityLog {
  id: string;
  user_id: string;
  activity_type: string;
  activity_description?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  device_info?: string;
  ip_address?: string;
  location?: string;
  is_active: boolean;
  expires_at: string;
  created_at: string;
  last_accessed_at: string;
}

export interface UserPreference {
  id: string;
  user_id: string;
  category: string;
  preference_key: string;
  preference_value: any;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  color: string;
  is_favorite: boolean;
  is_pinned: boolean;
  is_archived: boolean;
  reminder_date?: string;
  priority?: "low" | "medium" | "high";
  status?: "draft" | "published" | "review";
  location?: string;
  mood?: string;
  weather?: string;
  word_count?: number;
  reading_time?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateNoteData {
  title: string;
  content: string;
  category: string;
  tags: string[];
  color: string;
  is_favorite: boolean;
  is_pinned: boolean;
  reminder_date?: string;
  priority?: "low" | "medium" | "high";
  status?: "draft" | "published" | "review";
  location?: string;
  mood?: string;
  weather?: string;
  word_count?: number;
  reading_time?: number;
}

export interface UpdateNoteData extends Partial<CreateNoteData> {}

export const NOTE_CATEGORIES = [
  "general",
  "work",
  "personal",
  "ideas",
  "todo",
  "journal",
  "meeting",
  "research",
  "project",
  "travel",
] as const;

export const NOTE_COLORS = [
  "#ffffff",
  "#fef3c7",
  "#fde68a",
  "#fed7aa",
  "#fecaca",
  "#f3e8ff",
  "#e0e7ff",
  "#bfdbfe",
  "#a7f3d0",
  "#d1fae5",
] as const;

export const NOTE_PRIORITIES = ["low", "medium", "high"] as const;

export const NOTE_STATUSES = ["draft", "published", "review"] as const;

export const NOTE_MOODS = [
  "happy",
  "sad",
  "excited",
  "calm",
  "anxious",
  "motivated",
  "tired",
  "focused",
  "creative",
  "grateful",
] as const;

export const NOTE_WEATHER = [
  "sunny",
  "cloudy",
  "rainy",
  "snowy",
  "windy",
  "foggy",
  "stormy",
  "clear",
  "overcast",
  "humid",
] as const;
