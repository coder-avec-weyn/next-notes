import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../supabase/server";

// GET - Search for public users by username, name, full_name, or email
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    if (!supabase) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 },
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!query || query.trim().length < 1) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 },
      );
    }

    const searchQuery = query.trim();
    console.log("Searching for:", searchQuery);

    // Search for users with public profiles using the regular client
    // The RLS policy "Users can view public profiles" allows this
    const { data, error } = await supabase
      .from("users")
      .select(
        "id, username, name, full_name, email, bio, avatar_url, created_at, public_profile, location, website, company, job_title",
      )
      .eq("public_profile", true)
      .or(
        `username.ilike.%${searchQuery}%,name.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`,
      )
      .limit(limit)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error searching users:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`Found ${data?.length || 0} users matching "${searchQuery}"`);
    
    // Debug: Let's also check how many public users exist in total
    const { data: allPublicUsers, error: countError } = await supabase
      .from("users")
      .select("id, username, name, full_name, public_profile")
      .eq("public_profile", true)
      .limit(5);
      
    if (!countError) {
      console.log("Sample public users:", allPublicUsers);
    }

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error("Unexpected error in user search:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}