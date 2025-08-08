export interface UserProfile {
  id: string;
  email: string;
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
