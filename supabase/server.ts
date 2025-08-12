import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const createClient = async () => {
  try {
    const cookieStore = await cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error(
        "Missing Supabase environment variables. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment.",
      );
      throw new Error(
        "Supabase configuration is missing. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.",
      );
    }

    // Validate URL format
    try {
      new URL(supabaseUrl);
    } catch (error) {
      console.error("Invalid Supabase URL format:", supabaseUrl);
      return null;
    }

    // Validate API key format (basic check)
    if (
      typeof supabaseAnonKey !== "string" ||
      supabaseAnonKey.length < 10 // Simple length check instead of specific format
    ) {
      console.error("Invalid Supabase API key format");
      return null;
    }

    return createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
            console.warn("Cookie setting failed in server component:", error);
          }
        },
      },
    });
  } catch (error) {
    console.error("Failed to create Supabase server client:", error);
    return null;
  }
};
