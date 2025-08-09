import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!query || query.trim().length < 1) {
      return NextResponse.json(
        { error: "Search query is required and must be at least 1 character" },
        { status: 400 },
      );
    }

    const searchTerm = query.trim();
    console.log(`[Search API] Searching for: "${searchTerm}"`);

    // ✅ Point to the public.users table
    const { data: users, error } = await supabase
      .from("users")
      .select(
        `
        id,
        avatar_url,
        user_id,
        token_identifier,
        image,
        created_at,
        updated_at,
        email,
        name,
        full_name,
        bio,
        theme_preference,
        notification_preferences,
        phone,
        location,
        website,
        company,
        job_title,
        timezone,
        language,
        date_of_birth,
        social_links,
        privacy_settings,
        two_factor_enabled,
        last_login_at,
        login_count,
        profile_completion_percentage,
        account_status,
        username,
        public_profile
      `,
      )
      .eq("public_profile", true)
      .or(
        `username.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`,
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[Search API] Database error:", error);
      return NextResponse.json(
        { error: "Failed to search users", details: error.message },
        { status: 500 },
      );
    }

    // Get public notes count for each user
    const usersWithNotesCount = await Promise.all(
      (users || []).map(async (user) => {
        const { count } = await supabase
          .from("notes")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("is_public", true);

        return {
          ...user,
          public_notes_count: count || 0,
        };
      }),
    );

    console.log(
      `[Search API] Found ${usersWithNotesCount.length} users matching "${searchTerm}"`,
    );

    return NextResponse.json({
      data: usersWithNotesCount,
      total: usersWithNotesCount.length,
      query: searchTerm,
    });
  } catch (error) {
    console.error("[Search API] Unexpected error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
