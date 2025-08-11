export interface Poetry {
  id: string;
  user_id: string;
  title: string;
  content: string;
  style: {
    font: string;
    alignment: string;
    lineSpacing: number;
    fontSize: string;
    indentation: number;
    firstLineIndent: boolean;
    italics: boolean;
    bold: boolean;
    uppercase: boolean;
    letterSpacing?: number;
    stanzaSpacing?: number;
    underline?: boolean;
    textShadow?: boolean;
    backgroundTexture?: string;
  };
  tags: string[];
  color: string;
  is_favorite: boolean;
  is_archived: boolean;
  is_pinned: boolean;
  is_public: boolean;
  mood?: string;
  theme?: string;
  word_count?: number;
  reading_time?: number;
  rhyme_scheme?: string;
  poetry_form?: string;
  created_at: string;
  updated_at: string;
}

export interface PoetryAnalytics {
  total_poems: number;
  favorite_poems: number;
  public_poems: number;
  total_words: number;
  average_words_per_poem: number;
  most_used_tags: string[];
  mood_distribution: Record<string, number>;
  poems_by_month: Record<string, number>;
  reading_time_total: number;
}

export interface RhymeSuggestion {
  word: string;
  score: number;
  syllables: number;
}

export interface PoetryTool {
  name: string;
  description: string;
  action: (text: string) => string | Promise<string>;
}