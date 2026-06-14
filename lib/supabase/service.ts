import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

// Service-role client — bypasses RLS. Use ONLY in server-side code (Server Actions,
// route handlers, Server Components) for operations that legitimately cross tenant
// boundaries, e.g. a not-yet-member user claiming an invitation. NEVER import this
// into a Client Component: it would leak the service-role key to the browser.
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Supabase service-role env vars are not configured");
  }

  return createSupabaseClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
