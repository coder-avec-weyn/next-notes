-- Comprehensive fix for user search functionality
-- This migration ensures the users table has proper structure and indexes for search

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Ensure all required columns exist in users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS username VARCHAR(50),
ADD COLUMN IF NOT EXISTS public_profile BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS company TEXT,
ADD COLUMN IF NOT EXISTS job_title TEXT;

-- Add unique constraint to username if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'users_username_unique' 
        AND table_name = 'users'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users ADD CONSTRAINT users_username_unique UNIQUE (username);
    END IF;
END $$;

-- Drop existing search indexes to recreate them optimally
DROP INDEX IF EXISTS public.users_username_idx;
DROP INDEX IF EXISTS public.users_name_idx;
DROP INDEX IF EXISTS public.users_full_name_idx;
DROP INDEX IF EXISTS public.users_email_idx;
DROP INDEX IF EXISTS public.users_public_profile_idx;
DROP INDEX IF EXISTS public.idx_users_username;
DROP INDEX IF EXISTS public.idx_users_name;
DROP INDEX IF EXISTS public.idx_users_public_profile;
DROP INDEX IF EXISTS public.users_username_search_idx;
DROP INDEX IF EXISTS public.users_name_search_idx;
DROP INDEX IF EXISTS public.users_full_name_search_idx;
DROP INDEX IF EXISTS public.users_email_search_idx;

-- Create optimized search indexes using GIN with trigram support
CREATE INDEX users_username_search_idx ON public.users USING gin (username gin_trgm_ops) WHERE public_profile = true;
CREATE INDEX users_name_search_idx ON public.users USING gin (name gin_trgm_ops) WHERE public_profile = true;
CREATE INDEX users_full_name_search_idx ON public.users USING gin (full_name gin_trgm_ops) WHERE public_profile = true;
CREATE INDEX users_email_search_idx ON public.users USING gin (email gin_trgm_ops) WHERE public_profile = true;

-- Create additional indexes for filtering and sorting
CREATE INDEX users_public_profile_idx ON public.users (public_profile);
CREATE INDEX users_created_at_idx ON public.users (created_at DESC);
CREATE INDEX users_location_idx ON public.users (location) WHERE public_profile = true;
CREATE INDEX users_company_idx ON public.users (company) WHERE public_profile = true;

-- Drop all existing RLS policies on users table
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Users can view public profiles" ON public.users;
DROP POLICY IF EXISTS "Anyone can view public profiles" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert own data" ON public.users;

-- Create comprehensive RLS policies for search functionality
CREATE POLICY "Users can view own data"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Anyone can view public profiles"
  ON public.users FOR SELECT
  USING (public_profile = true);

CREATE POLICY "Users can update own data"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own data"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Ensure RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create a function to count public notes for users (for search results)
CREATE OR REPLACE FUNCTION get_user_public_notes_count(user_uuid uuid)
RETURNS integer AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::integer
        FROM public.notes
        WHERE user_id = user_uuid AND is_public = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a view for public user search (optional, for better performance)
CREATE OR REPLACE VIEW public.public_users_search AS
SELECT 
    id,
    username,
    name,
    full_name,
    email,
    bio,
    avatar_url,
    created_at,
    location,
    website,
    company,
    job_title,
    public_profile,
    get_user_public_notes_count(id) as public_notes_count
FROM public.users
WHERE public_profile = true;

-- Grant access to the view
GRANT SELECT ON public.public_users_search TO authenticated, anon;

-- Add some sample test data for search functionality (remove in production)
INSERT INTO public.users (
    id, 
    username, 
    name, 
    full_name, 
    email, 
    bio, 
    public_profile, 
    location, 
    company, 
    website,
    created_at,
    token_identifier
)
VALUES 
(
    '00000000-0000-0000-0000-000000000001', 
    'testuser1', 
    'Test User', 
    'Test User One', 
    'test1@example.com', 
    'This is a test user for search functionality', 
    true, 
    'San Francisco, CA', 
    'Tech Corp', 
    'https://testuser1.com',
    NOW(),
    'test-token-1'
),
(
    '00000000-0000-0000-0000-000000000002', 
    'searchtest', 
    'Search Test', 
    'Search Test User', 
    'search@example.com', 
    'Another test user for search functionality', 
    true, 
    'New York, NY', 
    'Search Inc', 
    'https://searchtest.com',
    NOW(),
    'test-token-2'
),
(
    '00000000-0000-0000-0000-000000000003', 
    'privateuser', 
    'Private User', 
    'Private Test User', 
    'private@example.com', 
    'This user has private profile', 
    false, 
    'Los Angeles, CA', 
    'Private Corp', 
    null,
    NOW(),
    'test-token-3'
)
ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    name = EXCLUDED.name,
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    bio = EXCLUDED.bio,
    public_profile = EXCLUDED.public_profile,
    location = EXCLUDED.location,
    company = EXCLUDED.company,
    website = EXCLUDED.website;

-- Add realtime support for users table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'users'
        AND schemaname = 'public'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
    END IF;
END $$;

-- Create indexes on notes table for public notes count function
CREATE INDEX IF NOT EXISTS notes_user_id_public_idx ON public.notes (user_id) WHERE is_public = true;

-- Analyze tables for better query planning
ANALYZE public.users;
ANALYZE public.notes;