import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../supabase/server";

// GET - Search for public users by username or display name
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: "Search query must be at least 2 characters long" },
        { status: 400 },
      );
    }

    const searchQuery = query.trim().toLowerCase();

    // Search for users by username or display name
    const { data, error } = await supabase
      .from("users")
      .select(
        "id, username, name, full_name, bio, avatar_url, created_at, public_profile",
      )
      .eq("public_profile", true)
      .or(
        `username.ilike.%${searchQuery}%,name.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`,
      )
      .limit(limit)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error searching users:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
