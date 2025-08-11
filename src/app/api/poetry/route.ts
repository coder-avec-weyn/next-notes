import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    if (!supabase) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter");

    let query = supabase
      .from("poetry")
      .select("*")
      .eq("user_id", user.id);

    // Apply filters
    if (filter === "favorites") {
      query = query.eq("is_favorite", true);
    } else if (filter === "pinned") {
      query = query.eq("is_pinned", true);
    } else if (filter === "archived") {
      query = query.eq("is_archived", true);
    } else if (filter === "public") {
      query = query.eq("is_public", true);
    }

    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching poetry:", error);
      return NextResponse.json(
        { error: "Failed to fetch poetry" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    if (!supabase) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      content,
      style,
      tags,
      color,
      is_favorite,
      is_pinned,
      is_public,
      mood,
      theme,
    } = body;

    const { data, error } = await supabase
      .from("poetry")
      .insert({
        user_id: user.id,
        title: title || "Untitled Poem",
        content: content || "",
        style: style || {
          font: "serif",
          alignment: "left",
          lineSpacing: 1.5,
          fontSize: "medium",
          indentation: 0,
          firstLineIndent: false,
          italics: false,
          bold: false,
          uppercase: false,
        },
        tags: tags || [],
        color: color || "#ffffff",
        is_favorite: is_favorite || false,
        is_pinned: is_pinned || false,
        is_public: is_public || false,
        mood: mood || null,
        theme: theme || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating poetry:", error);
      return NextResponse.json(
        { error: "Failed to create poem" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}