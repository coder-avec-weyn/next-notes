import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../supabase/server";
import { CreateNoteData, NoteFilters } from "@/types/note";
import { validateAndSanitizeInput, logSQLPreview } from "@/utils/auth";

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

    // Parse and validate pagination parameters
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "20")),
    );
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from("notes")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("is_pinned", { ascending: false })
      .order("updated_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters with sanitization
    const category = searchParams.get("category");
    const isFavorite = searchParams.get("is_favorite");
    const isArchived = searchParams.get("is_archived");
    const isPinned = searchParams.get("is_pinned");
    const isPublic = searchParams.get("is_public");
    const search = searchParams.get("search")?.trim();
    const tags = searchParams.get("tags")?.trim();

    if (category && category !== "all" && /^[a-zA-Z0-9_-]+$/.test(category)) {
      query = query.eq("category", category);
    }
    if (isFavorite !== null && ["true", "false"].includes(isFavorite)) {
      query = query.eq("is_favorite", isFavorite === "true");
    }
    if (isArchived !== null && ["true", "false"].includes(isArchived)) {
      query = query.eq("is_archived", isArchived === "true");
    }
    if (isPinned !== null && ["true", "false"].includes(isPinned)) {
      query = query.eq("is_pinned", isPinned === "true");
    }
    if (isPublic !== null && ["true", "false"].includes(isPublic)) {
      query = query.eq("is_public", isPublic === "true");
    }
    if (search && search.length <= 100) {
      // Sanitize search input to prevent injection
      const sanitizedSearch = search.replace(/[%_]/g, "\\$&");
      query = query.or(
        `title.ilike.%${sanitizedSearch}%,content.ilike.%${sanitizedSearch}%`,
      );
    }
    if (tags && tags.length <= 200) {
      const tagArray = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0 && tag.length <= 50);
      if (tagArray.length > 0) {
        query = query.overlaps("tags", tagArray);
      }
    }

    logSQLPreview("select", "notes", null, {
      user_id: user.id,
      filters: {
        category,
        isFavorite,
        isArchived,
        isPinned,
        isPublic,
        search: !!search,
        tags: !!tags,
      },
    });

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching notes:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
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
      is_public: { type: "boolean", required: false },
      priority: { type: "string", required: false },
      status: { type: "string", required: false },
      location: { type: "string", required: false, maxLength: 100 },
      mood: { type: "string", required: false, maxLength: 50 },
      weather: { type: "string", required: false, maxLength: 50 },
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

    // Calculate word count and reading time
    const content = sanitized.content || "";
    const wordCount = content
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200)); // 200 words per minute

    // Add user_id and computed fields to the note data
    const noteWithUser = {
      user_id: user.id,
      title: sanitized.title || "Untitled Note",
      content: sanitized.content || "",
      category: sanitized.category || "general",
      tags: sanitized.tags || [],
      color: sanitized.color || "#ffffff",
      is_favorite: sanitized.is_favorite || false,
      is_pinned: sanitized.is_pinned || false,
      is_archived: false,
      is_public: sanitized.is_public || false,
      priority: sanitized.priority || "medium",
      status: sanitized.status || "draft",
      location: sanitized.location || null,
      mood: sanitized.mood || null,
      weather: sanitized.weather || null,
      word_count: wordCount,
      reading_time: readingTime,
    };

    logSQLPreview("insert", "notes", noteWithUser);

    const { data, error } = await supabase
      .from("notes")
      .insert([noteWithUser])
      .select()
      .single();

    if (error) {
      console.error("Error creating note:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(
      `[${new Date().toISOString()}] Note created: ${data.id} by user ${user.id}`,
    );

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
