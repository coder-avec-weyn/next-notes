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

    // Get public notes count with better error handling
    console.log("Fetching public notes count for user:", id);

    // Log the SQL query that will be executed
    console.log(
      `[SQL] Public notes count query:\n
      SELECT COUNT(*) 
      FROM public.notes 
      WHERE user_id = '${id}' 
        AND is_public = true 
        AND is_archived = false;`,
    );

    // First try using count
    const { count: publicNotesCount, error: notesError } = await supabase
      .from("notes")
      .select("*", { count: "exact", head: true })
      .eq("user_id", id)
      .eq("is_public", true)
      .eq("is_archived", false);

    console.log("Public notes count result (count method):", {
      publicNotesCount,
      notesError,
    });

    // If count returns 0 or error, try alternative approach by fetching all records and counting them
    let finalCount = publicNotesCount || 0;

    if (notesError || finalCount === 0) {
      console.log("Trying alternative approach to count notes...");
      const { data: notesData, error: fetchError } = await supabase
        .from("notes")
        .select("id")
        .eq("user_id", id)
        .eq("is_public", true)
        .eq("is_archived", false);

      if (!fetchError && notesData) {
        finalCount = notesData.length;
        console.log(`Alternative count method found ${finalCount} notes`);
      } else if (fetchError) {
        console.error("Error in alternative count method:", fetchError);
      }
    }

    if (notesError) {
      console.error("Error fetching notes count:", notesError);
    }

    return NextResponse.json({
      data: {
        ...userProfile,
        public_notes_count: finalCount,
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
