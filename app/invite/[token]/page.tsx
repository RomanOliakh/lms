import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import InviteAcceptCard from "@/components/company/InviteAcceptCard";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const admin = createAdminClient();
  const { data: invite } = await admin
    .from("organization_members")
    .select("id, invited_email, status, organizations(name, status)")
    .eq("invite_token", token)
    .maybeSingle();

  const org = invite?.organizations as unknown as {
    name: string;
    status: string;
  } | null;
  const isValid =
    !!invite &&
    invite.status === "invited" &&
    !!invite.invited_email &&
    !!org &&
    org.status === "active";

  if (!isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-sm w-full border border-n-200 rounded-lg shadow-pop p-6 text-center">
          <h1 className="text-lg font-semibold text-n-900 tracking-tight mb-2">
            Invitation not found
          </h1>
          <p className="text-sm text-n-500">
            This invitation link is invalid, revoked, or already used.
          </p>
        </div>
      </div>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <InviteAcceptCard
        token={token}
        orgName={org.name}
        invitedEmail={invite.invited_email!}
        sessionEmail={user?.email ?? null}
      />
    </div>
  );
}
