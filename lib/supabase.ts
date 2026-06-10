import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Server-only Supabase client using the service-role key. This bypasses RLS,
// so it must NEVER be imported into a client component. RLS stays enabled with
// no public policies => the browser (anon key) can't touch the DB directly;
// every read/write flows through our Next.js API routes. That isolation is a
// deliberate talking point: "the database is never exposed to the client."
//
// Created lazily (not at import time) so `next build` doesn't crash before the
// key is set; env is validated on first actual use.

let client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Add them to .env.local — " +
        "the service_role key is in Supabase Dashboard -> Project Settings -> API."
    );
  }

  client = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
