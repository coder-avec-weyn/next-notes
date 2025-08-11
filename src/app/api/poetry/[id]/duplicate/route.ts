import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../../supabase/server";

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

    const { params } = await request.json();
    const id = params?.id;

    if (!id) {
      return NextResponse.json(
        { error: "Poem ID is required" },
        { status: 400 }
      );
    }

    // Get the original poem
    const { data: originalPoem, error: fetchError } = await supabase
      .from("poetry")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !originalPoem) {
      return NextResponse.json(
        { error: "Poem not found" },
        { status: 404 }
      );
    }

    // Create a duplicate with modified title
    const duplicateData = {
      ...originalPoem,
      id: undefined, // Let the database generate a new ID
      title: `${originalPoem.title} (Copy)`,
      created_at: undefined, // Let the database set the current timestamp
      updated_at: undefined,
    };

    const { data: duplicatedPoem, error: duplicateError } = await supabase
      .from("poetry")
      .insert(duplicateData)
      .select()
      .single();

    if (duplicateError) {
      console.error("Error duplicating poem:", duplicateError);
      return NextResponse.json(
        { error: "Failed to duplicate poem" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: duplicatedPoem });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}