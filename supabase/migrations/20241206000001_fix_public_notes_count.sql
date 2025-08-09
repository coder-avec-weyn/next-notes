-- Fix public notes count functionality
-- This migration ensures the public notes count is working correctly

-- First, let's check the current state of the notes table
-- and ensure all required columns exist
ALTER TABLE public.notes 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;

-- Create indexes for better performance on public notes queries
CREATE INDEX IF NOT EXISTS notes_user_id_public_archived_idx 
ON public.notes (user_id, is_public, is_archived) 
WHERE is_public = true AND is_archived = false;

CREATE INDEX IF NOT EXISTS notes_is_public_idx 
ON public.notes (is_public) 
WHERE is_public = true;

-- Update the get_user_public_notes_count function to be more robust
CREATE OR REPLACE FUNCTION get_user_public_notes_count(user_uuid uuid)
RETURNS integer AS $$
DECLARE
    note_count integer;
BEGIN
    SELECT COUNT(*)::integer INTO note_count
    FROM public.notes
    WHERE user_id = user_uuid 
      AND is_public = true 
      AND is_archived = false;
    
    -- Log for debugging
    RAISE NOTICE 'User % has % public notes', user_uuid, note_count;
    
    RETURN COALESCE(note_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the public_users_search view to use the improved function
CREATE OR REPLACE VIEW public.public_users_search AS
SELECT 
    u.id,
    u.username,
    u.name,
    u.full_name,
    u.email,
    u.bio,
    u.avatar_url,
    u.created_at,
    u.location,
    u.website,
    u.company,
    u.job_title,
    u.public_profile,
    (
        SELECT COUNT(*)::integer
        FROM public.notes n
        WHERE n.user_id = u.id 
          AND n.is_public = true 
          AND n.is_archived = false
    ) as public_notes_count
FROM public.users u
WHERE u.public_profile = true;

-- Grant necessary permissions
GRANT SELECT ON public.public_users_search TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_user_public_notes_count(uuid) TO authenticated, anon;

-- Test data removed to avoid foreign key constraint violations
-- Users can create their own test notes through the application

-- Enable realtime for notes table if not already enabled
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'notes'
        AND schemaname = 'public'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notes;
    END IF;
END $$;

-- Analyze tables for better query planning
ANALYZE public.users;
ANALYZE public.notes;

-- Function is ready to use
-- Test queries can be run manually after users create public notes
