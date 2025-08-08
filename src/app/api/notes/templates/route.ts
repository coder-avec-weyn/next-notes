import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../supabase/server";

// GET - Fetch note templates
export async function GET(request: NextRequest) {
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

    // Default templates
    const templates = [
      {
        id: "meeting-notes",
        title: "Meeting Notes",
        content:
          "# Meeting Notes\n\n**Date:** \n**Attendees:** \n**Agenda:** \n\n## Discussion Points\n\n## Action Items\n\n## Next Steps\n",
        category: "meeting",
        tags: ["meeting", "notes"],
      },
      {
        id: "daily-journal",
        title: "Daily Journal",
        content:
          "# Daily Journal - {date}\n\n## Today's Highlights\n\n## Challenges\n\n## Gratitude\n\n## Tomorrow's Goals\n",
        category: "journal",
        tags: ["journal", "daily"],
      },
      {
        id: "project-plan",
        title: "Project Plan",
        content:
          "# Project Plan\n\n**Project Name:** \n**Start Date:** \n**End Date:** \n\n## Objectives\n\n## Milestones\n\n## Resources\n\n## Risks\n",
        category: "project",
        tags: ["project", "planning"],
      },
      {
        id: "recipe",
        title: "Recipe",
        content:
          "# Recipe Name\n\n**Prep Time:** \n**Cook Time:** \n**Servings:** \n\n## Ingredients\n\n## Instructions\n\n## Notes\n",
        category: "recipe",
        tags: ["recipe", "cooking"],
      },
      {
        id: "travel-itinerary",
        title: "Travel Itinerary",
        content:
          "# Travel Itinerary\n\n**Destination:** \n**Dates:** \n\n## Day 1\n\n## Day 2\n\n## Packing List\n\n## Important Info\n",
        category: "travel",
        tags: ["travel", "itinerary"],
      },
    ];

    return NextResponse.json({ data: templates });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
