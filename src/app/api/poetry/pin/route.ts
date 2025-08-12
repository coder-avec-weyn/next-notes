import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../supabase/server";

export async function PATCH(request: NextRequest) {
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
    const id = request.url.split("/").slice(-2)[0];

    if (!id) {
      return NextResponse.json(
        { error: "Poem ID is required" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { is_pinned } = body;

    if (typeof is_pinned !== "boolean") {
      return NextResponse.json(
        { error: "is_pinned must be a boolean value" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("poetry")
      .update({ is_pinned })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating pin status:", error);
      return NextResponse.json(
        { error: "Failed to update pin status" },
        { status: 500 },
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
