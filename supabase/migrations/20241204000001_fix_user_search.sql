-- Fix user search functionality by updating RLS policies and ensuring proper columns exist

-- Add missing columns if they don't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS public_profile BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS company TEXT,
ADD COLUMN IF NOT EXISTS job_title TEXT;

-- Create indexes for better search performance
CREATE INDEX IF NOT EXISTS users_username_idx ON public.users(username);
CREATE INDEX IF NOT EXISTS users_name_idx ON public.users(name);
CREATE INDEX IF NOT EXISTS users_full_name_idx ON public.users(full_name);
CREATE INDEX IF NOT EXISTS users_email_idx ON public.users(email);
CREATE INDEX IF NOT EXISTS users_public_profile_idx ON public.users(public_profile);

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;

-- Create new policies that allow public profile viewing
CREATE POLICY "Users can view own data"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can view public profiles"
  ON public.users FOR SELECT
  USING (public_profile = true);

CREATE POLICY "Users can update own data"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own data"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Enable realtime for users table
alter publication supabase_realtime add table users;