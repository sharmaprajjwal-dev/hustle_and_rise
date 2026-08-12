import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  PUBLIC_SUPABASE_ANON_KEY,
  PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  PUBLIC_SUPABASE_URL,
} from "astro:env/client";
import type { Database } from "./database.types";

export type PublicSupabaseClient = SupabaseClient<Database>;

let publicClient: PublicSupabaseClient | undefined;

export function hasPublicSupabaseConfig(): boolean {
  return Boolean(PUBLIC_SUPABASE_URL && (PUBLIC_SUPABASE_PUBLISHABLE_KEY || PUBLIC_SUPABASE_ANON_KEY));
}

export function getPublicSupabaseClient(): PublicSupabaseClient | null {
  const key = PUBLIC_SUPABASE_PUBLISHABLE_KEY || PUBLIC_SUPABASE_ANON_KEY;

  if (!PUBLIC_SUPABASE_URL || !key) {
    return null;
  }

  publicClient ??= createClient<Database>(PUBLIC_SUPABASE_URL, key, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });

  return publicClient;
}
