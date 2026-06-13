import { createBrowserClient } from "@supabase/ssr";

/**
 * Returns a Supabase client safe to use inside Client Components ("use client").
 * Call this once per component (or via a shared context), not inside loops.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
