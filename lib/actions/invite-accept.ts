"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function findPendingInvite(token: string) {
  const admin = createAdminClient();
  const { data: invite } = await admin
    .from("organization_members")
    .select("id, org_id, invited_email, status, organizations(name, status)")
    .eq("invite_token", token)
    .maybeSingle();

  if (!invite || invite.status !== "invited" || !invite.invited_email) return null;
  const org = invite.organizations as unknown as { name: string; status: string } | null;
  if (!org || org.status !== "active") return null;
  return { id: invite.id, invitedEmail: invite.invited_email, orgName: org.name };
}

function activateInvite(memberId: string, userId: string) {
  const admin = createAdminClient();
  return admin
    .from("organization_members")
    .update({ user_id: userId, status: "active" })
    .eq("id", memberId)
    .eq("status", "invited")
    .select("id")
    .single();
}

// Path 1: visitor is already signed in — link their account to the membership.
export async function acceptInviteSignedIn(token: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be signed in");

  const invite = await findPendingInvite(token);
  if (!invite) throw new Error("This invitation is invalid or already used");
  if (user.email?.toLowerCase() !== invite.invitedEmail.toLowerCase())
    throw new Error(
      `This invitation was sent to ${invite.invitedEmail}. Sign out and use the invited account.`
    );

  const { error } = await activateInvite(invite.id, user.id);
  if (error) throw new Error("Could not accept the invitation, try again");
}

// Path 2: visitor has no account — create one (pre-confirmed) and link it.
// The client signs in with the same credentials right after.
export async function acceptInviteNewAccount(token: string, password: string) {
  if (!password || password.length < 8)
    throw new Error("Password must be at least 8 characters");

  const invite = await findPendingInvite(token);
  if (!invite) throw new Error("This invitation is invalid or already used");

  const admin = createAdminClient();
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: invite.invitedEmail,
    password,
    email_confirm: true, // invite link already proves email ownership
  });

  if (createError) {
    if (createError.message.toLowerCase().includes("already"))
      throw new Error("An account with this email already exists — sign in instead");
    throw new Error(createError.message);
  }

  const { error } = await activateInvite(invite.id, created.user.id);
  if (error) throw new Error("Could not accept the invitation, try again");

  return { email: invite.invitedEmail };
}
