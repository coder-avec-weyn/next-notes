import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../supabase/server";
import { CreateNoteData, NoteFilters } from "@/types/note";

// GET - Fetch all notes with optional filters
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Build query
    let query = supabase
      .from("notes")
      .select("*")
      .eq("user_id", user.id)
      .order("is_pinned", { ascending: false })
      .order("updated_at", { ascending: false });

    // Apply filters
    const category = searchParams.get("category");
    const isFavorite = searchParams.get("is_favorite");
    const isArchived = searchParams.get("is_archived");
    const isPinned = searchParams.get("is_pinned");
    const search = searchParams.get("search");
    const tags = searchParams.get("tags");

    if (category && category !== "all") {
      query = query.eq("category", category);
    }
    if (isFavorite !== null) {
      query = query.eq("is_favorite", isFavorite === "true");
    }
    if (isArchived !== null) {
      query = query.eq("is_archived", isArchived === "true");
    }
    if (isPinned !== null) {
      query = query.eq("is_pinned", isPinned === "true");
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }
    if (tags) {
      const tagArray = tags.split(",");
      query = query.overlaps("tags", tagArray);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching notes:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST - Create a new note
export async function POST(request: NextRequest) {
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

    const noteData: CreateNoteData = await request.json();

    // Add user_id to the note data
    const noteWithUser = {
      ...noteData,
      user_id: user.id,
      title: noteData.title || "Untitled Note",
      content: noteData.content || "",
      category: noteData.category || "general",
      tags: noteData.tags || [],
      color: noteData.color || "#ffffff",
      is_favorite: noteData.is_favorite || false,
      is_pinned: noteData.is_pinned || false,
      is_archived: false,
      is_public: noteData.is_public || false,
    };

    const { data, error } = await supabase
      .from("notes")
      .insert([noteWithUser])
      .select()
      .single();

    if (error) {
      console.error("Error creating note:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
