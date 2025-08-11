import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../../supabase/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = await createClient();
    const id = params.id;

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if poem exists and belongs to user
    const { data: existingPoem, error: fetchError } = await supabase
      .from("poetry")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return NextResponse.json(
          { error: "Poem not found or you don't have permission to update it" },
          { status: 404 },
        );
      }
      console.error("Error fetching poem:", fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    const { is_pinned } = await request.json();

    if (typeof is_pinned !== "boolean") {
      return NextResponse.json(
        { error: "is_pinned must be a boolean" },
        { status: 400 },
      );
    }

    // Update the pin status
    const { data, error } = await supabase
      .from("poetry")
      .update({ is_pinned })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating pin status:", error);
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
