"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sendInvitationEmail } from "@/lib/email/invitation";

export type InviteResult = {
  inviteUrl: string;
  emailError: string | null;
};

export async function inviteEmployee(
  orgId: string,
  formData: FormData
): Promise<InviteResult> {
  const supabase = await createClient();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const org_role =
    formData.get("org_role") === "company_admin" ? "company_admin" : "learner";

  if (!email || !email.includes("@")) throw new Error("Enter a valid email");

  const { data: org } = await supabase
    .from("organizations")
    .select("name")
    .eq("id", orgId)
    .single();
  if (!org) throw new Error("Company not found or insufficient permissions");

  const { data: existing } = await supabase
    .from("organization_members")
    .select("id")
    .eq("org_id", orgId)
    .eq("invited_email", email)
    .maybeSingle();
  if (existing) throw new Error("This email is already invited to this company");

  const { data: member, error } = await supabase
    .from("organization_members")
    .insert({ org_id: orgId, invited_email: email, org_role, status: "invited" })
    .select("invite_token")
    .single();

  if (error) {
    // P0001 = seat-limit trigger; surface its message as-is
    throw new Error(error.message);
  }

  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${member.invite_token}`;
  const { error: emailError } = await sendInvitationEmail({
    to: email,
    organizationName: org.name,
    inviteUrl,
  });

  revalidatePath(`/admin/companies/${orgId}`);
  // Email failure is non-fatal (dev mode can only deliver to the Resend account
  // owner) — the admin gets the link to share manually.
  return { inviteUrl, emailError };
}

export async function revokeInvitation(memberId: string, orgId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organization_members")
    .delete()
    .eq("id", memberId)
    .eq("status", "invited")
    .select("id");

  if (error) throw new Error(error.message);
  if (!data?.length) throw new Error("Invitation not found or already accepted");

  revalidatePath(`/admin/companies/${orgId}`);
}
