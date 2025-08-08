import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../supabase/server";

// POST - Duplicate a note
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { noteId } = await request.json();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the original note
    const { data: originalNote, error: fetchError } = await supabase
      .from("notes")
      .select("*")
      .eq("id", noteId)
      .eq("user_id", user.id)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return NextResponse.json({ error: "Note not found" }, { status: 404 });
      }
      console.error("Error fetching note:", fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    // Create duplicate note
    const duplicateNote = {
      title: `${originalNote.title} (Copy)`,
      content: originalNote.content,
      category: originalNote.category,
      tags: originalNote.tags,
      color: originalNote.color,
      is_favorite: false, // Reset favorite status
      is_pinned: false, // Reset pinned status
      is_archived: false, // Reset archived status
      user_id: user.id,
    };

    const { data: newNote, error: createError } = await supabase
      .from("notes")
      .insert([duplicateNote])
      .select()
      .single();

    if (createError) {
      console.error("Error creating duplicate note:", createError);
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    return NextResponse.json({ data: newNote }, { status: 201 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
