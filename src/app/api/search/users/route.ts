import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

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

    // Create service role client to bypass RLS for public profile searches
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    // Search for users with public profiles
    const { data, error } = await serviceSupabase
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

    // If no results with the specific search, try a broader search
    if (!data || data.length === 0) {
      console.log("No results found, trying broader search...");

      // Try searching with just the first few characters
      const broadQuery = searchQuery.substring(
        0,
        Math.max(2, searchQuery.length - 1),
      );

      const { data: broadData, error: broadError } = await serviceSupabase
        .from("users")
        .select(
          "id, username, name, full_name, email, bio, avatar_url, created_at, public_profile, location, website, company, job_title",
        )
        .eq("public_profile", true)
        .or(
          `username.ilike.%${broadQuery}%,name.ilike.%${broadQuery}%,full_name.ilike.%${broadQuery}%,email.ilike.%${broadQuery}%`,
        )
        .limit(limit)
        .order("created_at", { ascending: false });

      if (broadError) {
        console.error("Error in broad search:", broadError);
      } else {
        console.log(`Broad search found ${broadData?.length || 0} users`);
        return NextResponse.json({ data: broadData || [] });
      }
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
