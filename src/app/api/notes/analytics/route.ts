import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../supabase/server";

// GET - Fetch notes analytics
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all user notes for analytics
    const { data: notes, error } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching notes for analytics:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calculate analytics
    const totalNotes = notes.length;
    const favoriteNotes = notes.filter((note) => note.is_favorite).length;
    const pinnedNotes = notes.filter((note) => note.is_pinned).length;
    const archivedNotes = notes.filter((note) => note.is_archived).length;

    // Category distribution
    const categoryStats = notes.reduce(
      (acc, note) => {
        acc[note.category] = (acc[note.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Tag usage
    const tagStats = notes.reduce(
      (acc, note) => {
        note.tags.forEach((tag: string) => {
          acc[tag] = (acc[tag] || 0) + 1;
        });
        return acc;
      },
      {} as Record<string, number>,
    );

    // Notes created per month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyStats = notes
      .filter((note) => new Date(note.created_at) >= sixMonthsAgo)
      .reduce(
        (acc, note) => {
          const month = new Date(note.created_at).toISOString().slice(0, 7);
          acc[month] = (acc[month] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

    // Average word count
    const totalWords = notes.reduce((sum, note) => {
      return sum + (note.content?.split(" ").length || 0);
    }, 0);
    const averageWordCount =
      totalNotes > 0 ? Math.round(totalWords / totalNotes) : 0;

    const analytics = {
      totalNotes,
      favoriteNotes,
      pinnedNotes,
      archivedNotes,
      categoryStats,
      tagStats,
      monthlyStats,
      averageWordCount,
      totalWords,
      mostUsedCategory:
        Object.entries(categoryStats).sort(([, a], [, b]) => b - a)[0]?.[0] ||
        "general",
      mostUsedTag:
        Object.entries(tagStats).sort(([, a], [, b]) => b - a)[0]?.[0] || null,
    };

    return NextResponse.json({ data: analytics });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
