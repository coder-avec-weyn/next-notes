import { createBrowserClient } from "@supabase/ssr";

export const createClient = () => {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn(
        "Missing Supabase environment variables. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment.",
      );
      return null;
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

    return createBrowserClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error("Failed to create Supabase browser client:", error);
    return null;
  }
};
