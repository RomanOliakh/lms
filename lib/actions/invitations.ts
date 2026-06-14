"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendInviteEmail } from "@/lib/resend";

const INVITABLE_ROLES = ["learner", "company_admin"] as const;
type InvitableRole = (typeof INVITABLE_ROLES)[number];

const TOKEN_TTL_MS = 72 * 60 * 60 * 1000; // 72 hours

function appUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001").replace(/\/+$/, "");
}

function friendlyDbError(error: { code?: string; message: string }): string {
  // Seat-limit trigger raises P0001 with a human-readable message.
  if (error.code === "P0001") return error.message;
  if (error.code === "23505") return "This person has already been invited to this company";
  return error.message;
}

export type InviteResult = {
  inviteUrl: string;
  emailSent: boolean;
  emailSkipped: boolean;
};

export async function inviteEmployee(orgId: string, formData: FormData): Promise<InviteResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const email = ((formData.get("email") as string) || "").trim().toLowerCase();
  const roleRaw = (formData.get("role") as string) || "learner";
  const role: InvitableRole = (INVITABLE_ROLES as readonly string[]).includes(roleRaw)
    ? (roleRaw as InvitableRole)
    : "learner";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Enter a valid email address");
  }

  // Look up an existing membership for this email in this org (RLS scopes this to
  // orgs the caller administers).
  const { data: existing } = await supabase
    .from("organization_members")
    .select("id, status")
    .eq("org_id", orgId)
    .eq("invited_email", email)
    .maybeSingle();

  if (existing?.status === "active") {
    throw new Error("This person is already an active member of this company");
  }

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS).toISOString();

  if (existing) {
    // Pending invite already exists → resend: rotate token, refresh expiry and role.
    const { error } = await supabase
      .from("organization_members")
      .update({ invitation_token: token, token_expires_at: expiresAt, org_role: role })
      .eq("id", existing.id);
    if (error) throw new Error(friendlyDbError(error));
  } else {
    const { error } = await supabase.from("organization_members").insert({
      org_id: orgId,
      invited_email: email,
      org_role: role,
      status: "invited",
      invitation_token: token,
      token_expires_at: expiresAt,
    });
    if (error) throw new Error(friendlyDbError(error));
  }

  const inviteUrl = `${appUrl()}/invite/${token}`;

  // Company name for the email — best-effort, falls back to a generic label.
  const { data: org } = await supabase
    .from("organizations")
    .select("name")
    .eq("id", orgId)
    .maybeSingle();

  const result = await sendInviteEmail({
    to: email,
    companyName: org?.name ?? "your company",
    inviteUrl,
  });

  revalidatePath(`/admin/companies/${orgId}`);

  return {
    inviteUrl,
    emailSent: result.sent,
    emailSkipped: result.skipped ?? false,
  };
}

export async function revokeInvitation(memberId: string, orgId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("organization_members")
    .delete()
    .eq("id", memberId)
    .eq("status", "invited")
    .select("id");

  if (error) throw new Error(friendlyDbError(error));
  if (!data?.length) {
    throw new Error("Invitation not found, already accepted, or insufficient permissions");
  }

  revalidatePath(`/admin/companies/${orgId}`);
}

export type AcceptResult = { orgId: string };

export async function acceptInvitation(token: string): Promise<AcceptResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You need to be signed in to accept an invitation");

  // The invited user is not yet a member, so RLS would hide this row — use the
  // service-role client to claim it. All security checks are enforced here.
  const service = createServiceClient();

  const { data: membership } = await service
    .from("organization_members")
    .select("id, org_id, invited_email, status, token_expires_at, user_id")
    .eq("invitation_token", token)
    .maybeSingle();

  if (!membership) throw new Error("This invitation is invalid or has already been used");
  if (membership.status === "active") throw new Error("This invitation has already been accepted");
  if (membership.token_expires_at && new Date(membership.token_expires_at) < new Date()) {
    throw new Error("This invitation has expired — ask your administrator to resend it");
  }
  if ((membership.invited_email ?? "").toLowerCase() !== (user.email ?? "").toLowerCase()) {
    throw new Error("This invitation was sent to a different email address");
  }

  // Guard against the unique(org_id, user_id) collision with a clearer message.
  const { data: alreadyMember } = await service
    .from("organization_members")
    .select("id")
    .eq("org_id", membership.org_id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (alreadyMember) throw new Error("You are already a member of this company");

  const { error } = await service
    .from("organization_members")
    .update({
      user_id: user.id,
      status: "active",
      invitation_token: null,
      token_expires_at: null,
    })
    .eq("id", membership.id);

  if (error) throw new Error(friendlyDbError(error));

  revalidatePath("/dashboard");
  return { orgId: membership.org_id };
}
