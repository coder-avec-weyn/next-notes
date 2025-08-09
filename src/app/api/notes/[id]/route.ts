import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../supabase/server";
import { UpdateNoteData } from "@/types/note";
import { validateAndSanitizeInput, logSQLPreview } from "@/utils/auth";

// GET - Fetch a single note by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = await createClient();
    const { id } = params;

    // Validate UUID format
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id,
      )
    ) {
      return NextResponse.json(
        { error: "Invalid note ID format" },
        { status: 400 },
      );
    }

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    logSQLPreview("select", "notes", null, { id, user_id: user.id });

    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Note not found" }, { status: 404 });
      }
      console.error("Error fetching note:", error);
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

// PATCH - Update a note by ID (changed from PUT to PATCH for partial updates)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = await createClient();
    const { id } = params;

    // Validate UUID format
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id,
      )
    ) {
      return NextResponse.json(
        { error: "Invalid note ID format" },
        { status: 400 },
      );
    }

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requestData = await request.json();

    // Validate and sanitize input
    const schema = {
      title: { type: "string", required: false, maxLength: 200 },
      content: { type: "string", required: false, maxLength: 50000 },
      category: { type: "string", required: false, maxLength: 50 },
      tags: { type: "array", required: false },
      color: { type: "string", required: false, maxLength: 7 },
      is_favorite: { type: "boolean", required: false },
      is_pinned: { type: "boolean", required: false },
      is_archived: { type: "boolean", required: false },
      is_public: { type: "boolean", required: false },
      priority: { type: "string", required: false },
      status: { type: "string", required: false },
      location: { type: "string", required: false, maxLength: 100 },
      mood: { type: "string", required: false, maxLength: 50 },
      weather: { type: "string", required: false, maxLength: 50 },
      reminder_date: { type: "string", required: false },
    };

    const { isValid, sanitized, errors } = validateAndSanitizeInput(
      requestData,
      schema,
    );
    if (!isValid) {
      return NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 },
      );
    }

    // Additional validation for specific fields
    if (sanitized.color && !/^#[0-9A-Fa-f]{6}$/.test(sanitized.color)) {
      return NextResponse.json(
        { error: "Invalid color format. Use hex format like #ffffff" },
        { status: 400 },
      );
    }

    if (
      sanitized.priority &&
      !["low", "medium", "high"].includes(sanitized.priority)
    ) {
      return NextResponse.json(
        { error: "Invalid priority. Must be low, medium, or high" },
        { status: 400 },
      );
    }

    if (
      sanitized.status &&
      !["draft", "published", "review"].includes(sanitized.status)
    ) {
      return NextResponse.json(
        { error: "Invalid status. Must be draft, published, or review" },
        { status: 400 },
      );
    }

    // Validate and sanitize tags
    if (sanitized.tags) {
      if (!Array.isArray(sanitized.tags) || sanitized.tags.length > 20) {
        return NextResponse.json(
          { error: "Tags must be an array with maximum 20 items" },
          { status: 400 },
        );
      }
      sanitized.tags = sanitized.tags
        .filter((tag) => typeof tag === "string" && tag.trim().length > 0)
        .map((tag) => tag.trim().toLowerCase())
        .slice(0, 20);
    }

    // Validate reminder_date if provided
    if (sanitized.reminder_date) {
      const reminderDate = new Date(sanitized.reminder_date);
      if (isNaN(reminderDate.getTime())) {
        return NextResponse.json(
          { error: "Invalid reminder_date format. Use ISO 8601 format" },
          { status: 400 },
        );
      }
    }

    // Calculate word count and reading time if content is being updated
    if (sanitized.content !== undefined) {
      const wordCount = sanitized.content
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0).length;
      const readingTime = Math.max(1, Math.ceil(wordCount / 200)); // 200 words per minute
      sanitized.word_count = wordCount;
      sanitized.reading_time = readingTime;
    }

    // Add updated_at timestamp
    const updateData = {
      ...sanitized,
      updated_at: new Date().toISOString(),
    };

    logSQLPreview("update", "notes", updateData, { id, user_id: user.id });

    const { data, error } = await supabase
      .from("notes")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Note not found" }, { status: 404 });
      }
      console.error("Error updating note:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(
      `[${new Date().toISOString()}] Note updated: ${id} by user ${user.id}`,
    );

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT - Full update (replace entire note)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  // For full updates, we can reuse the PATCH logic but require all fields
  return PATCH(request, { params });
}

// DELETE - Delete a note by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = await createClient();
    const { id } = params;

    // Validate UUID format
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id,
      )
    ) {
      return NextResponse.json(
        { error: "Invalid note ID format" },
        { status: 400 },
      );
    }

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    logSQLPreview("delete", "notes", null, { id, user_id: user.id });

    // First check if note exists and belongs to user
    const { data: existingNote, error: fetchError } = await supabase
      .from("notes")
      .select("id, title")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return NextResponse.json({ error: "Note not found" }, { status: 404 });
      }
      console.error("Error checking note existence:", fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    const { error } = await supabase
      .from("notes")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting note:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(
      `[${new Date().toISOString()}] Note deleted: ${id} ("${existingNote.title}") by user ${user.id}`,
    );

    return NextResponse.json({
      message: "Note deleted successfully",
      deletedNote: {
        id: existingNote.id,
        title: existingNote.title,
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
