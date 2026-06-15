import { createClient } from "@/lib/supabase/server";

export type AdminOrg = {
  id: string;
  name: string;
  slug: string;
  seat_limit: number;
};

// Returns the organization the current user administers (company_admin/owner,
// active membership), or null. v1 picks the first such org; a multi-org switcher
// is a follow-up (discovery P0 #2: one user may belong to several companies).
export async function getAdminOrg(): Promise<AdminOrg | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organizations(id, name, slug, seat_limit)")
    .eq("user_id", user.id)
    .eq("status", "active")
    .in("org_role", ["company_admin", "owner"])
    .order("created_at")
    .limit(1)
    .maybeSingle();

  return (membership?.organizations as unknown as AdminOrg | null) ?? null;
}
