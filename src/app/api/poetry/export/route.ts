import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../supabase/server";

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
    const format = searchParams.get("format") || "txt";
    const poemIds = searchParams.get("poemIds")?.split(",") || [];

    let query = supabase
      .from("poetry")
      .select("*")
      .eq("user_id", user.id);

    // If specific poem IDs are provided, filter by them
    if (poemIds.length > 0) {
      query = query.in("id", poemIds);
    }

    query = query.order("created_at", { ascending: false });

    const { data: poems, error } = await query;

    if (error) {
      console.error("Error fetching poems for export:", error);
      return NextResponse.json(
        { error: "Failed to fetch poems" },
        { status: 500 }
      );
    }

    let content = "";
    let filename = "";
    let contentType = "";

    switch (format.toLowerCase()) {
      case "txt":
        content = poems.map(poem => 
          `${poem.title}\n${"=".repeat(poem.title.length)}\n\n${poem.content}\n\n${poem.tags.length > 0 ? `Tags: ${poem.tags.join(", ")}\n` : ""}${poem.mood ? `Mood: ${poem.mood}\n` : ""}${poem.theme ? `Theme: ${poem.theme}\n` : ""}\nCreated: ${new Date(poem.created_at).toLocaleDateString()}\n\n${"─".repeat(50)}\n\n`
        ).join("");
        filename = `poetry_collection_${new Date().toISOString().split('T')[0]}.txt`;
        contentType = "text/plain";
        break;

      case "md":
      case "markdown":
        content = `# Poetry Collection\n\nExported on ${new Date().toLocaleDateString()}\n\n---\n\n` +
          poems.map(poem => 
            `## ${poem.title}\n\n${poem.content}\n\n${poem.tags.length > 0 ? `**Tags:** ${poem.tags.join(", ")}  \n` : ""}${poem.mood ? `**Mood:** ${poem.mood}  \n` : ""}${poem.theme ? `**Theme:** ${poem.theme}  \n` : ""}**Created:** ${new Date(poem.created_at).toLocaleDateString()}\n\n---\n\n`
          ).join("");
        filename = `poetry_collection_${new Date().toISOString().split('T')[0]}.md`;
        contentType = "text/markdown";
        break;

      case "json":
        content = JSON.stringify({
          exported_at: new Date().toISOString(),
          total_poems: poems.length,
          poems: poems.map(poem => ({
            title: poem.title,
            content: poem.content,
            tags: poem.tags,
            mood: poem.mood,
            theme: poem.theme,
            style: poem.style,
            is_favorite: poem.is_favorite,
            is_pinned: poem.is_pinned,
            is_public: poem.is_public,
            created_at: poem.created_at,
            updated_at: poem.updated_at
          }))
        }, null, 2);
        filename = `poetry_collection_${new Date().toISOString().split('T')[0]}.json`;
        contentType = "application/json";
        break;

      case "html":
        content = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Poetry Collection</title>
    <style>
        body { font-family: Georgia, serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        .poem { margin-bottom: 40px; page-break-inside: avoid; }
        .poem-title { font-size: 1.5em; font-weight: bold; margin-bottom: 10px; border-bottom: 2px solid #333; }
        .poem-content { white-space: pre-wrap; margin-bottom: 15px; }
        .poem-meta { font-size: 0.9em; color: #666; font-style: italic; }
        .export-info { text-align: center; margin-bottom: 40px; color: #888; }
        @media print { body { margin: 0; } }
    </style>
</head>
<body>
    <div class="export-info">
        <h1>Poetry Collection</h1>
        <p>Exported on ${new Date().toLocaleDateString()}</p>
        <p>${poems.length} poem${poems.length !== 1 ? 's' : ''}</p>
    </div>
    ${poems.map(poem => `
    <div class="poem">
        <div class="poem-title">${poem.title}</div>
        <div class="poem-content">${poem.content}</div>
        <div class="poem-meta">
            ${poem.tags.length > 0 ? `Tags: ${poem.tags.join(", ")} | ` : ""}${poem.mood ? `Mood: ${poem.mood} | ` : ""}${poem.theme ? `Theme: ${poem.theme} | ` : ""}Created: ${new Date(poem.created_at).toLocaleDateString()}
        </div>
    </div>
    `).join("")}
</body>
</html>`;
        filename = `poetry_collection_${new Date().toISOString().split('T')[0]}.html`;
        contentType = "text/html";
        break;

      default:
        return NextResponse.json(
          { error: "Unsupported format. Use txt, md, json, or html" },
          { status: 400 }
        );
    }

    return new NextResponse(content, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error in export API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}