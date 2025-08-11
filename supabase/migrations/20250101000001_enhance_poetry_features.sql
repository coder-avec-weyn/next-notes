-- Enhanced Poetry Table with Advanced Features
-- This migration adds new columns for advanced poetry features

-- Add new columns to poetry table if they don't exist
ALTER TABLE poetry 
ADD COLUMN IF NOT EXISTS word_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reading_time INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS rhyme_scheme TEXT,
ADD COLUMN IF NOT EXISTS poetry_form TEXT;

-- Update existing poems to calculate word count and reading time
UPDATE poetry 
SET 
  word_count = CASE 
    WHEN content IS NOT NULL AND content != '' 
    THEN array_length(string_to_array(trim(content), ' '), 1)
    ELSE 0 
  END,
  reading_time = CASE 
    WHEN content IS NOT NULL AND content != '' 
    THEN GREATEST(1, CEIL(array_length(string_to_array(trim(content), ' '), 1) / 200.0))
    ELSE 0 
  END
WHERE word_count = 0 OR word_count IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_poetry_mood ON poetry(mood);
CREATE INDEX IF NOT EXISTS idx_poetry_theme ON poetry(theme);
CREATE INDEX IF NOT EXISTS idx_poetry_poetry_form ON poetry(poetry_form);
CREATE INDEX IF NOT EXISTS idx_poetry_word_count ON poetry(word_count);
CREATE INDEX IF NOT EXISTS idx_poetry_tags ON poetry USING GIN(tags);

-- Create a function to automatically update word count and reading time
CREATE OR REPLACE FUNCTION update_poetry_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate word count
  NEW.word_count = CASE 
    WHEN NEW.content IS NOT NULL AND NEW.content != '' 
    THEN array_length(string_to_array(trim(NEW.content), ' '), 1)
    ELSE 0 
  END;
  
  -- Calculate reading time (words per minute = 200)
  NEW.reading_time = CASE 
    WHEN NEW.word_count > 0 
    THEN GREATEST(1, CEIL(NEW.word_count / 200.0))
    ELSE 0 
  END;
  
  -- Update the updated_at timestamp
  NEW.updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update metrics on insert/update
DROP TRIGGER IF EXISTS trigger_update_poetry_metrics ON poetry;
CREATE TRIGGER trigger_update_poetry_metrics
  BEFORE INSERT OR UPDATE ON poetry
  FOR EACH ROW
  EXECUTE FUNCTION update_poetry_metrics();

-- Create a view for poetry analytics
CREATE OR REPLACE VIEW poetry_analytics AS
SELECT 
  user_id,
  COUNT(*) as total_poems,
  COUNT(*) FILTER (WHERE is_favorite = true) as favorite_poems,
  COUNT(*) FILTER (WHERE is_public = true) as public_poems,
  COUNT(*) FILTER (WHERE is_pinned = true) as pinned_poems,
  COUNT(*) FILTER (WHERE is_archived = true) as archived_poems,
  SUM(word_count) as total_words,
  ROUND(AVG(word_count)) as avg_words_per_poem,
  SUM(reading_time) as total_reading_time,
  ROUND(AVG(reading_time)) as avg_reading_time,
  COUNT(DISTINCT mood) FILTER (WHERE mood IS NOT NULL) as unique_moods,
  COUNT(DISTINCT theme) FILTER (WHERE theme IS NOT NULL) as unique_themes,
  COUNT(DISTINCT poetry_form) FILTER (WHERE poetry_form IS NOT NULL) as unique_forms,
  array_agg(DISTINCT mood) FILTER (WHERE mood IS NOT NULL) as moods_used,
  array_agg(DISTINCT theme) FILTER (WHERE theme IS NOT NULL) as themes_used,
  array_agg(DISTINCT poetry_form) FILTER (WHERE poetry_form IS NOT NULL) as forms_used
FROM poetry
GROUP BY user_id;