-- Create poetry table
CREATE TABLE IF NOT EXISTS public.poetry (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Poem',
  content TEXT DEFAULT '',
  style JSONB DEFAULT '{"font": "serif", "alignment": "left", "lineSpacing": 1.5, "fontSize": "medium", "indentation": 0, "firstLineIndent": false, "italics": false, "bold": false, "uppercase": false}',
  tags TEXT[] DEFAULT '{}',
  color TEXT DEFAULT '#ffffff',
  is_favorite BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  mood TEXT,
  theme TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS poetry_user_id_idx ON public.poetry(user_id);
CREATE INDEX IF NOT EXISTS poetry_created_at_idx ON public.poetry(created_at DESC);
CREATE INDEX IF NOT EXISTS poetry_is_favorite_idx ON public.poetry(is_favorite);
CREATE INDEX IF NOT EXISTS poetry_is_pinned_idx ON public.poetry(is_pinned);

-- Enable RLS on poetry table
ALTER TABLE public.poetry ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for poetry
DROP POLICY IF EXISTS "Users can view own poetry" ON public.poetry;
CREATE POLICY "Users can view own poetry"
  ON public.poetry FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own poetry" ON public.poetry;
CREATE POLICY "Users can insert own poetry"
  ON public.poetry FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own poetry" ON public.poetry;
CREATE POLICY "Users can update own poetry"
  ON public.poetry FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own poetry" ON public.poetry;
CREATE POLICY "Users can delete own poetry"
  ON public.poetry FOR DELETE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view public poetry" ON public.poetry;
CREATE POLICY "Anyone can view public poetry"
  ON public.poetry FOR SELECT
  USING (is_public = true);

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_poetry_updated_at ON public.poetry;
CREATE TRIGGER update_poetry_updated_at 
    BEFORE UPDATE ON public.poetry
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();