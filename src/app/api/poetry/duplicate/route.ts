import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../supabase/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = await createClient();

    if (!supabase) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 },
      );
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the ID from the URL path
    const id = request.url.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { error: "Poem ID is required" },
        { status: 400 },
      );
    }

    // Fetch the original poem
    const { data: originalPoem, error: fetchError } = await supabase
      .from("poetry")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !originalPoem) {
      console.error("Error fetching original poem:", fetchError);
      return NextResponse.json({ error: "Poem not found" }, { status: 404 });
    }

    // Create a duplicate with a new ID
    const duplicatePoem = {
      ...originalPoem,
      id: uuidv4(), // Generate a new UUID
      title: `${originalPoem.title} (Copy)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_pinned: false, // Reset pinned status
    };

    delete duplicatePoem.id; // Let Supabase generate a new ID

    // Insert the duplicate
    const { data: newPoem, error: insertError } = await supabase
      .from("poetry")
      .insert(duplicatePoem)
      .select()
      .single();

    if (insertError) {
      console.error("Error duplicating poem:", insertError);
      return NextResponse.json(
        { error: "Failed to duplicate poem" },
        { status: 500 },
      );
    }

    return NextResponse.json({ data: newPoem });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
