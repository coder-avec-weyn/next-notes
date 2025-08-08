-- Add new columns to users table for enhanced profile features
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS website text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS company text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS job_title text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'UTC';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS language text DEFAULT 'en';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS date_of_birth date;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS privacy_settings jsonb DEFAULT '{"profile_visibility": "public", "email_visibility": "private", "activity_visibility": "friends"}'::jsonb;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS two_factor_enabled boolean DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_login_at timestamp with time zone;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS login_count integer DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS profile_completion_percentage integer DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS account_status text DEFAULT 'active';

-- Create user_activity_logs table for activity tracking
CREATE TABLE IF NOT EXISTS public.user_activity_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    activity_type text NOT NULL,
    activity_description text,
    ip_address inet,
    user_agent text,
    created_at timestamp with time zone DEFAULT NOW()
);

-- Create user_sessions table for session management
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    session_token text UNIQUE NOT NULL,
    device_info text,
    ip_address inet,
    location text,
    is_active boolean DEFAULT true,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT NOW(),
    last_accessed_at timestamp with time zone DEFAULT NOW()
);

-- Create user_preferences table for detailed preferences
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    category text NOT NULL,
    preference_key text NOT NULL,
    preference_value jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW(),
    UNIQUE(user_id, category, preference_key)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS user_activity_logs_user_id_idx ON public.user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS user_activity_logs_created_at_idx ON public.user_activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS user_sessions_user_id_idx ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS user_sessions_is_active_idx ON public.user_sessions(is_active);
CREATE INDEX IF NOT EXISTS user_preferences_user_id_idx ON public.user_preferences(user_id);

-- Enable RLS on new tables
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_activity_logs
DROP POLICY IF EXISTS "Users can view own activity logs" ON public.user_activity_logs;
CREATE POLICY "Users can view own activity logs"
  ON public.user_activity_logs FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own activity logs" ON public.user_activity_logs;
CREATE POLICY "Users can insert own activity logs"
  ON public.user_activity_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for user_sessions
DROP POLICY IF EXISTS "Users can view own sessions" ON public.user_sessions;
CREATE POLICY "Users can view own sessions"
  ON public.user_sessions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own sessions" ON public.user_sessions;
CREATE POLICY "Users can update own sessions"
  ON public.user_sessions FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own sessions" ON public.user_sessions;
CREATE POLICY "Users can delete own sessions"
  ON public.user_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policies for user_preferences
DROP POLICY IF EXISTS "Users can manage own preferences" ON public.user_preferences;
CREATE POLICY "Users can manage own preferences"
  ON public.user_preferences FOR ALL
  USING (auth.uid() = user_id);

-- Add tables to realtime publication
DO $
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'user_activity_logs'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.user_activity_logs;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'user_sessions'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.user_sessions;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'user_preferences'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.user_preferences;
    END IF;
END $;

-- Create function to calculate profile completion percentage
CREATE OR REPLACE FUNCTION calculate_profile_completion(user_row public.users)
RETURNS integer AS $$
DECLARE
    completion_score integer := 0;
    total_fields integer := 15;
BEGIN
    -- Basic fields (5 points each)
    IF user_row.name IS NOT NULL AND user_row.name != '' THEN completion_score := completion_score + 1; END IF;
    IF user_row.full_name IS NOT NULL AND user_row.full_name != '' THEN completion_score := completion_score + 1; END IF;
    IF user_row.email IS NOT NULL AND user_row.email != '' THEN completion_score := completion_score + 1; END IF;
    IF user_row.bio IS NOT NULL AND user_row.bio != '' THEN completion_score := completion_score + 1; END IF;
    IF user_row.avatar_url IS NOT NULL AND user_row.avatar_url != '' THEN completion_score := completion_score + 1; END IF;
    
    -- Additional fields (1 point each)
    IF user_row.phone IS NOT NULL AND user_row.phone != '' THEN completion_score := completion_score + 1; END IF;
    IF user_row.location IS NOT NULL AND user_row.location != '' THEN completion_score := completion_score + 1; END IF;
    IF user_row.website IS NOT NULL AND user_row.website != '' THEN completion_score := completion_score + 1; END IF;
    IF user_row.company IS NOT NULL AND user_row.company != '' THEN completion_score := completion_score + 1; END IF;
    IF user_row.job_title IS NOT NULL AND user_row.job_title != '' THEN completion_score := completion_score + 1; END IF;
    IF user_row.timezone IS NOT NULL AND user_row.timezone != 'UTC' THEN completion_score := completion_score + 1; END IF;
    IF user_row.language IS NOT NULL AND user_row.language != 'en' THEN completion_score := completion_score + 1; END IF;
    IF user_row.date_of_birth IS NOT NULL THEN completion_score := completion_score + 1; END IF;
    IF user_row.social_links IS NOT NULL AND jsonb_array_length(jsonb_object_keys(user_row.social_links)) > 0 THEN completion_score := completion_score + 1; END IF;
    IF user_row.theme_preference IS NOT NULL AND user_row.theme_preference != 'system' THEN completion_score := completion_score + 1; END IF;
    
    RETURN (completion_score * 100 / total_fields);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update profile completion percentage
CREATE OR REPLACE FUNCTION update_profile_completion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.profile_completion_percentage := calculate_profile_completion(NEW);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_profile_completion 
    BEFORE INSERT OR UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_profile_completion();

-- Create function to log user activity
CREATE OR REPLACE FUNCTION log_user_activity(
    p_user_id uuid,
    p_activity_type text,
    p_activity_description text DEFAULT NULL,
    p_ip_address inet DEFAULT NULL,
    p_user_agent text DEFAULT NULL
)
RETURNS void AS $$
BEGIN
    INSERT INTO public.user_activity_logs (
        user_id,
        activity_type,
        activity_description,
        ip_address,
        user_agent
    ) VALUES (
        p_user_id,
        p_activity_type,
        p_activity_description,
        p_ip_address,
        p_user_agent
    );
END;
$$ LANGUAGE plpgsql;
