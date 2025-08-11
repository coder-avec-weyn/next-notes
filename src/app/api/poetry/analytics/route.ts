import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    if (!supabase) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: poems, error } = await supabase
      .from("poetry")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching poetry for analytics:", error);
      return NextResponse.json(
        { error: "Failed to fetch poetry analytics" },
        { status: 500 }
      );
    }

    // Calculate analytics
    const totalPoems = poems.length;
    const favoritePoems = poems.filter(p => p.is_favorite).length;
    const publicPoems = poems.filter(p => p.is_public).length;
    
    const totalWords = poems.reduce((sum, poem) => {
      const wordCount = poem.content ? poem.content.split(/\s+/).filter((word: string) => word.length > 0).length : 0;
      return sum + wordCount;
    }, 0);
    
    const averageWordsPerPoem = totalPoems > 0 ? Math.round(totalWords / totalPoems) : 0;
    
    // Most used tags
    const tagCounts: Record<string, number> = {};
    poems.forEach(poem => {
      if (poem.tags && Array.isArray(poem.tags)) {
        poem.tags.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });
    
    const mostUsedTags = Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([tag]) => tag);
    
    // Mood distribution
    const moodDistribution: Record<string, number> = {};
    poems.forEach(poem => {
      if (poem.mood) {
        moodDistribution[poem.mood] = (moodDistribution[poem.mood] || 0) + 1;
      }
    });
    
    // Poems by month
    const poemsByMonth: Record<string, number> = {};
    poems.forEach(poem => {
      const date = new Date(poem.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      poemsByMonth[monthKey] = (poemsByMonth[monthKey] || 0) + 1;
    });
    
    const readingTimeTotal = Math.ceil(totalWords / 200);

    const analytics = {
      total_poems: totalPoems,
      favorite_poems: favoritePoems,
      public_poems: publicPoems,
      total_words: totalWords,
      average_words_per_poem: averageWordsPerPoem,
      most_used_tags: mostUsedTags,
      mood_distribution: moodDistribution,
      poems_by_month: poemsByMonth,
      reading_time_total: readingTimeTotal,
    };

    return NextResponse.json({ data: analytics });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}