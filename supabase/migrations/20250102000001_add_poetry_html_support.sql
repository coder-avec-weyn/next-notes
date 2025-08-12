-- This migration ensures the poetry table has proper support for HTML content
-- It doesn't change the structure but ensures the content column can handle HTML properly

-- First, check if the poetry table exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'poetry') THEN
    -- Create the poetry table if it doesn't exist
    CREATE TABLE public.poetry (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      title TEXT NOT NULL DEFAULT 'Untitled Poem',
      content TEXT NOT NULL DEFAULT '',
      style JSONB NOT NULL DEFAULT '{
        "font": "serif",
        "alignment": "left",
        "lineSpacing": 1.5,
        "fontSize": "medium",
        "indentation": 0,
        "firstLineIndent": false,
        "italics": false,
        "bold": false,
        "uppercase": false,
        "letterSpacing": 0,
        "stanzaSpacing": 1.5,
        "underline": false,
        "textShadow": false,
        "backgroundTexture": "parchment"
      }'::jsonb,
      tags TEXT[] NOT NULL DEFAULT '{}',
      color TEXT NOT NULL DEFAULT '#ffffff',
      is_favorite BOOLEAN NOT NULL DEFAULT false,
      is_archived BOOLEAN NOT NULL DEFAULT false,
      is_pinned BOOLEAN NOT NULL DEFAULT false,
      is_public BOOLEAN NOT NULL DEFAULT false,
      mood TEXT,
      theme TEXT,
      word_count INTEGER,
      reading_time INTEGER,
      rhyme_scheme TEXT,
      poetry_form TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- Add comment to the content column to indicate it can contain HTML
    COMMENT ON COLUMN public.poetry.content IS 'Can contain HTML markup for rich text formatting';

    -- Create indexes for better performance
    CREATE INDEX poetry_user_id_idx ON public.poetry(user_id);
    CREATE INDEX poetry_created_at_idx ON public.poetry(created_at);
    CREATE INDEX poetry_is_favorite_idx ON public.poetry(is_favorite);
    CREATE INDEX poetry_is_pinned_idx ON public.poetry(is_pinned);
    CREATE INDEX poetry_is_public_idx ON public.poetry(is_public);
    
    -- Enable row level security
    ALTER TABLE public.poetry ENABLE ROW LEVEL SECURITY;

    -- Create policies
    CREATE POLICY "Users can view their own poetry"
      ON public.poetry FOR SELECT
      USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert their own poetry"
      ON public.poetry FOR INSERT
      WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update their own poetry"
      ON public.poetry FOR UPDATE
      USING (auth.uid() = user_id);

    CREATE POLICY "Users can delete their own poetry"
      ON public.poetry FOR DELETE
      USING (auth.uid() = user_id);

    CREATE POLICY "Public poetry is viewable by everyone"
      ON public.poetry FOR SELECT
      USING (is_public = true);

    -- Enable realtime
    ALTER PUBLICATION supabase_realtime ADD TABLE public.poetry;
  ELSE
    -- If the table already exists, just add the comment to the content column
    COMMENT ON COLUMN public.poetry.content IS 'Can contain HTML markup for rich text formatting';
  END IF;
END $$;