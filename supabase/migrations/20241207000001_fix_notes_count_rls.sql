-- Fix RLS policies for notes to ensure public notes are visible to everyone

-- First, check if RLS is enabled on the notes table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'notes' 
    AND rowsecurity = true
  ) THEN
    -- Drop existing policies if they might interfere
    DROP POLICY IF EXISTS "Public notes are viewable by everyone" ON public.notes;
    
    -- Create a policy that allows anyone to view public notes
    CREATE POLICY "Public notes are viewable by everyone" 
    ON public.notes FOR SELECT
    USING (is_public = true AND is_archived = false);
    
    -- Log that we've created the policy
    RAISE NOTICE 'Created policy to allow public access to public notes';
  ELSE
    RAISE NOTICE 'RLS is not enabled on notes table, no policy needed';
  END IF;
END $$;

-- Ensure the get_user_public_notes_count function has proper permissions
GRANT EXECUTE ON FUNCTION get_user_public_notes_count(uuid) TO authenticated, anon;

-- Ensure the notes table has proper permissions
GRANT SELECT ON public.notes TO authenticated, anon;

-- Analyze tables for better query planning
ANALYZE public.users;
ANALYZE public.notes;
