import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { PUBLIC_SUPABASE_URL } from "astro:env/client";
import { SUPABASE_SECRET_KEY, SUPABASE_SERVICE_ROLE_KEY } from "astro:env/server";
import type { Database } from "./database.types";

export type AdminSupabaseClient = SupabaseClient<Database>;

let adminClient: AdminSupabaseClient | undefined;

export function getAdminSupabaseClient(): AdminSupabaseClient {
  const key = SUPABASE_SECRET_KEY || SUPABASE_SERVICE_ROLE_KEY;

  if (!PUBLIC_SUPABASE_URL || !key) {
    throw new Error(
      "Supabase admin access is not configured. Set PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in the trusted server environment.",
    );
  }

  adminClient ??= createClient<Database>(PUBLIC_SUPABASE_URL, key, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });

  return adminClient;
}
