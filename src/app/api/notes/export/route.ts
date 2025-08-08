import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../supabase/server";

// GET - Export notes in various formats
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "json";
    const noteIds = searchParams.get("noteIds")?.split(",") || [];

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
      .order("created_at", { ascending: false });

    // Filter by specific note IDs if provided
    if (noteIds.length > 0) {
      query = query.in("id", noteIds);
    }

    const { data: notes, error } = await query;

    if (error) {
      console.error("Error fetching notes for export:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Format data based on requested format
    let exportData: string;
    let contentType: string;
    let filename: string;

    switch (format.toLowerCase()) {
      case "csv":
        const csvHeaders = "Title,Content,Category,Tags,Created,Updated\n";
        const csvRows = notes
          .map(
            (note) =>
              `"${note.title}","${note.content.replace(/"/g, '""')}","${note.category}","${note.tags.join(";")}","${note.created_at}","${note.updated_at}"`,
          )
          .join("\n");
        exportData = csvHeaders + csvRows;
        contentType = "text/csv";
        filename = `notes-export-${new Date().toISOString().split("T")[0]}.csv`;
        break;

      case "markdown":
        exportData = notes
          .map(
            (note) =>
              `# ${note.title}\n\n${note.content}\n\n---\n\n**Category:** ${note.category}\n**Tags:** ${note.tags.join(", ")}\n**Created:** ${new Date(note.created_at).toLocaleDateString()}\n\n`,
          )
          .join("\n");
        contentType = "text/markdown";
        filename = `notes-export-${new Date().toISOString().split("T")[0]}.md`;
        break;

      case "txt":
        exportData = notes
          .map(
            (note) =>
              `${note.title}\n${"=".repeat(note.title.length)}\n\n${note.content}\n\nCategory: ${note.category}\nTags: ${note.tags.join(", ")}\nCreated: ${new Date(note.created_at).toLocaleDateString()}\n\n${"*".repeat(50)}\n\n`,
          )
          .join("");
        contentType = "text/plain";
        filename = `notes-export-${new Date().toISOString().split("T")[0]}.txt`;
        break;

      default: // json
        exportData = JSON.stringify(notes, null, 2);
        contentType = "application/json";
        filename = `notes-export-${new Date().toISOString().split("T")[0]}.json`;
    }

    return new NextResponse(exportData, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
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
