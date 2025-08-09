-- Improve profile visibility handling
-- This migration ensures proper handling of profile visibility states

-- Add a check constraint to ensure profile_visibility values are valid
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_profile_visibility_check;

-- For future extensibility, we'll keep the privacy_settings JSONB flexible
-- but ensure public_profile boolean is properly maintained

-- Create a function to sync public_profile with privacy_settings.profile_visibility
CREATE OR REPLACE FUNCTION sync_profile_visibility()
RETURNS TRIGGER AS $$
BEGIN
    -- If privacy_settings.profile_visibility is updated, sync public_profile
    IF NEW.privacy_settings IS DISTINCT FROM OLD.privacy_settings THEN
        IF NEW.privacy_settings ? 'profile_visibility' THEN
            NEW.public_profile := (NEW.privacy_settings->>'profile_visibility' = 'public');
        END IF;
    END IF;
    
    -- If public_profile is updated directly, sync privacy_settings
    IF NEW.public_profile IS DISTINCT FROM OLD.public_profile THEN
        -- Ensure privacy_settings exists
        IF NEW.privacy_settings IS NULL THEN
            NEW.privacy_settings := '{}'::jsonb;
        END IF;
        
        -- Update profile_visibility in privacy_settings
        NEW.privacy_settings := jsonb_set(
            NEW.privacy_settings,
            '{profile_visibility}',
            to_jsonb(CASE WHEN NEW.public_profile THEN 'public' ELSE 'private' END)
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS sync_profile_visibility_trigger ON public.users;

-- Create trigger to automatically sync profile visibility
CREATE TRIGGER sync_profile_visibility_trigger
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION sync_profile_visibility();

-- Update existing records to ensure consistency
UPDATE public.users 
SET privacy_settings = COALESCE(privacy_settings, '{}'::jsonb)
WHERE privacy_settings IS NULL;

-- Sync existing public_profile values with privacy_settings
UPDATE public.users 
SET privacy_settings = jsonb_set(
    COALESCE(privacy_settings, '{}'::jsonb),
    '{profile_visibility}',
    to_jsonb(CASE WHEN public_profile THEN 'public' ELSE 'private' END)
)
WHERE NOT (privacy_settings ? 'profile_visibility') 
   OR (privacy_settings->>'profile_visibility') != CASE WHEN public_profile THEN 'public' ELSE 'private' END;

-- Create an index on the profile_visibility within privacy_settings for better performance
CREATE INDEX IF NOT EXISTS users_privacy_profile_visibility_idx 
ON public.users USING btree ((privacy_settings->>'profile_visibility'))
WHERE privacy_settings ? 'profile_visibility';

-- Add comment to document the relationship
COMMENT ON COLUMN public.users.public_profile IS 'Boolean flag for quick profile visibility checks. Synced with privacy_settings.profile_visibility';
COMMENT ON COLUMN public.users.privacy_settings IS 'JSONB containing privacy settings including profile_visibility (public/private/friends), email_visibility, activity_visibility';

-- Analyze the table for better query planning
ANALYZE public.users;