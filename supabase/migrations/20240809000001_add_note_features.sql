-- Add new columns to notes table
ALTER TABLE IF EXISTS notes
ADD COLUMN IF NOT EXISTS collaborators uuid[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS version integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS template_id uuid,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS mood text,
ADD COLUMN IF NOT EXISTS weather text;

-- Create templates table
CREATE TABLE IF NOT EXISTS templates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text,
  category text DEFAULT 'general',
  tags text[] DEFAULT '{}',
  color text DEFAULT '#ffffff',
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Add RLS policies for templates
DROP POLICY IF EXISTS "Users can only see their own templates" ON templates;
CREATE POLICY "Users can only see their own templates"
ON templates FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own templates" ON templates;
CREATE POLICY "Users can insert their own templates"
ON templates FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own templates" ON templates;
CREATE POLICY "Users can update their own templates"
ON templates FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own templates" ON templates;
CREATE POLICY "Users can delete their own templates"
ON templates FOR DELETE
USING (auth.uid() = user_id);

-- Enable RLS on templates
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- Enable realtime for templates
alter publication supabase_realtime add table templates;
