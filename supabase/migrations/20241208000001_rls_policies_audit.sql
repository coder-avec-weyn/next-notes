-- RLS Policies Audit and Update
-- This migration ensures proper Row Level Security policies for the notes app

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Ensure RLS is enabled on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Anyone can view public profiles" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert own data" ON public.users;

DROP POLICY IF EXISTS "Users can view own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can insert own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can update own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can delete own notes" ON public.notes;
DROP POLICY IF EXISTS "Public notes are viewable by everyone" ON public.notes;
DROP POLICY IF EXISTS "Service role can access all notes" ON public.notes;

-- USERS TABLE POLICIES
-- Policy 1: Users can view their own data
CREATE POLICY "Users can view own data"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Policy 2: Anyone can view public profiles (for search functionality)
CREATE POLICY "Anyone can view public profiles"
  ON public.users FOR SELECT
  USING (public_profile = true);

-- Policy 3: Users can update their own data
CREATE POLICY "Users can update own data"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy 4: Users can insert their own data (for new registrations)
CREATE POLICY "Users can insert own data"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- NOTES TABLE POLICIES
-- Policy 1: Users can view their own notes
CREATE POLICY "Users can view own notes"
  ON public.notes FOR SELECT
  USING (auth.uid() = user_id);

-- Policy 2: Anyone can view public notes from users with public profiles
CREATE POLICY "Public notes are viewable by everyone"
  ON public.notes FOR SELECT
  USING (
    is_public = true 
    AND is_archived = false 
    AND EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = notes.user_id 
      AND users.public_profile = true
    )
  );

-- Policy 3: Users can insert their own notes
CREATE POLICY "Users can insert own notes"
  ON public.notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can update their own notes
CREATE POLICY "Users can update own notes"
  ON public.notes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy 5: Users can delete their own notes
CREATE POLICY "Users can delete own notes"
  ON public.notes FOR DELETE
  USING (auth.uid() = user_id);

-- Policy 6: Service role can access all data (for admin operations)
CREATE POLICY "Service role can access all notes"
  ON public.notes FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can access all users"
  ON public.users FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Create function to execute SQL (for admin schema operations)
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS void AS $$
BEGIN
  -- Only allow service role to execute this function
  IF auth.jwt() ->> 'role' != 'service_role' THEN
    RAISE EXCEPTION 'Access denied: Service role required';
  END IF;
  
  EXECUTE sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION exec_sql(text) TO service_role;

-- Ensure realtime is enabled for both tables
DO $$
BEGIN
    -- Add notes table to realtime if not already added
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'notes'
        AND schemaname = 'public'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notes;
    END IF;
    
    -- Add users table to realtime if not already added
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'users'
        AND schemaname = 'public'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS notes_user_id_public_idx ON public.notes (user_id) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS notes_is_public_idx ON public.notes (is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS notes_created_at_idx ON public.notes (created_at DESC);
CREATE INDEX IF NOT EXISTS notes_updated_at_idx ON public.notes (updated_at DESC);
CREATE INDEX IF NOT EXISTS notes_category_idx ON public.notes (category);
CREATE INDEX IF NOT EXISTS notes_tags_idx ON public.notes USING gin (tags);

CREATE INDEX IF NOT EXISTS users_public_profile_idx ON public.users (public_profile) WHERE public_profile = true;
CREATE INDEX IF NOT EXISTS users_username_idx ON public.users (username) WHERE public_profile = true;
CREATE INDEX IF NOT EXISTS users_created_at_idx ON public.users (created_at DESC);

-- Analyze tables for better query planning
ANALYZE public.users;
ANALYZE public.notes;

-- Log the completion
DO $$
BEGIN
  RAISE NOTICE 'RLS policies audit completed at %', NOW();
  RAISE NOTICE 'Realtime enabled for public.notes and public.users';
  RAISE NOTICE 'Performance indexes created';
END $$;
