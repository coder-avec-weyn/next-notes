import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../../supabase/server";

// GET - Fetch public notes by user ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = await createClient();
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    // First check if user has public profile
    const { data: userProfile, error: userError } = await supabase
      .from("users")
      .select("public_profile")
      .eq("id", id)
      .single();

    if (userError || !userProfile?.public_profile) {
      return NextResponse.json(
        { error: "User not found or profile is private" },
        { status: 404 },
      );
    }

    // Get public notes
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", id)
      .eq("is_public", true)
      .eq("is_archived", false)
      .order("updated_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching public notes:", error);
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
