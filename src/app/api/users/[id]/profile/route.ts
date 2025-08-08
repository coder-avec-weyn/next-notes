import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../../supabase/server";

// GET - Fetch public user profile by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = await createClient();
    const { id } = params;

    // Get user profile
    const { data: userProfile, error: userError } = await supabase
      .from("users")
      .select(
        "id, username, name, full_name, bio, avatar_url, created_at, public_profile, location, website, company, job_title",
      )
      .eq("id", id)
      .eq("public_profile", true)
      .single();

    if (userError) {
      if (userError.code === "PGRST116") {
        return NextResponse.json(
          { error: "User not found or profile is private" },
          { status: 404 },
        );
      }
      console.error("Error fetching user profile:", userError);
      return NextResponse.json({ error: userError.message }, { status: 500 });
    }

    // Get public notes count
    const { count: publicNotesCount, error: notesError } = await supabase
      .from("notes")
      .select("*", { count: "exact", head: true })
      .eq("user_id", id)
      .eq("is_public", true)
      .eq("is_archived", false);

    if (notesError) {
      console.error("Error fetching notes count:", notesError);
    }

    return NextResponse.json({
      data: {
        ...userProfile,
        public_notes_count: publicNotesCount || 0,
      },
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
