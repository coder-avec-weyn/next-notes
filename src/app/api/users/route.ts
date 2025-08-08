import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../supabase/server";
import { UserProfile } from "@/types/note";

// GET - Fetch current user profile
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user from auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Try to get user from public.users table
    let { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    // If user doesn't exist in public.users, create them
    if (error && error.code === "PGRST116") {
      const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.email?.split("@")[0] || "",
          full_name: user.user_metadata?.full_name || "",
          avatar_url: user.user_metadata?.avatar_url || "",
          token_identifier: user.id,
          theme_preference: "system",
          notification_preferences: {
            email: true,
            push: true,
            reminders: true,
          },
          social_links: {},
          privacy_settings: {
            profile_visibility: "public",
            email_visibility: "private",
            activity_visibility: "friends",
          },
          timezone: "UTC",
          language: "en",
          two_factor_enabled: false,
          login_count: 1,
          profile_completion_percentage: 0,
          account_status: "active",
          last_login_at: new Date().toISOString(),
          phone: null,
          location: null,
          website: null,
          company: null,
          job_title: null,
          date_of_birth: null,
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error creating user:", insertError);
        return NextResponse.json(
          { error: insertError.message },
          { status: 500 },
        );
      }

      data = newUser;
    } else if (error) {
      console.error("Error fetching user:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update last login
    await supabase
      .from("users")
      .update({
        last_login_at: new Date().toISOString(),
        login_count: (data.login_count || 0) + 1,
      })
      .eq("id", user.id);

    const userProfile: UserProfile = {
      ...data,
      theme_preference: data.theme_preference || "system",
      notification_preferences: data.notification_preferences || {
        email: true,
        push: true,
        reminders: true,
      },
      social_links: data.social_links || {},
      privacy_settings: data.privacy_settings || {
        profile_visibility: "public",
        email_visibility: "private",
        activity_visibility: "friends",
      },
      timezone: data.timezone || "UTC",
      language: data.language || "en",
      two_factor_enabled: data.two_factor_enabled || false,
      login_count: data.login_count || 0,
      profile_completion_percentage: data.profile_completion_percentage || 0,
      account_status: data.account_status || "active",
      phone: data.phone || null,
      location: data.location || null,
      website: data.website || null,
      company: data.company || null,
      job_title: data.job_title || null,
      date_of_birth: data.date_of_birth || null,
    };

    return NextResponse.json({ data: userProfile });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT - Update current user profile
export async function PUT(request: NextRequest) {
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

    const updates = await request.json();

    // Handle empty date fields by converting them to null
    const processedUpdates = { ...updates };
    if (processedUpdates.date_of_birth === "") {
      processedUpdates.date_of_birth = null;
    }

    const { data, error } = await supabase
      .from("users")
      .update({
        ...processedUpdates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      console.error("Error updating user:", error);
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
