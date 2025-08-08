import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../supabase/server";

// POST - Validate username availability
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 },
      );
    }

    // Check if username meets requirements
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        {
          error:
            "Username must be 3-30 characters long and contain only letters, numbers, and underscores",
        },
        { status: 400 },
      );
    }

    // Check if username is already taken
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("username", username.toLowerCase())
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error checking username:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const isAvailable = !data;

    return NextResponse.json({
      available: isAvailable,
      message: isAvailable
        ? "Username is available"
        : "Username is already taken",
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
