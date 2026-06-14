import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { Button } from "@/components/ui/button";
import AcceptInviteButton from "@/components/company/AcceptInviteButton";

export const dynamic = "force-dynamic";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-n-0 p-4">
      <div className="w-full max-w-sm bg-n-100 border border-n-200 rounded-md shadow-1 p-8">
        {children}
      </div>
    </div>
  );
}

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // Read the invite with the service-role client: the invited user is not yet a
  // member, so RLS would hide the row. Read-only here — the claim happens in the
  // server action with the same security checks.
  const service = createServiceClient();
  const { data: invite } = await service
    .from("organization_members")
    .select("id, org_id, invited_email, status, token_expires_at, organizations(name)")
    .eq("invitation_token", token)
    .maybeSingle();

  const companyName =
    (invite?.organizations as { name: string } | null)?.name ?? "the company";

  if (!invite) {
    return (
      <Shell>
        <h1 className="text-xl font-semibold text-n-900">Invitation not found</h1>
        <p className="text-sm text-n-500 mt-2">
          This invitation link is invalid or has already been used. Ask your administrator
          to send a new one.
        </p>
      </Shell>
    );
  }

  if (invite.status === "active") {
    return (
      <Shell>
        <h1 className="text-xl font-semibold text-n-900">Already accepted</h1>
        <p className="text-sm text-n-500 mt-2">This invitation has already been accepted.</p>
        <Link
          href="/dashboard"
          className="mt-4 inline-block text-sm text-lms-accent hover:text-lms-accent-600 font-medium"
        >
          Go to dashboard →
        </Link>
      </Shell>
    );
  }

  const expired =
    invite.token_expires_at != null && new Date(invite.token_expires_at) < new Date();
  if (expired) {
    return (
      <Shell>
        <h1 className="text-xl font-semibold text-n-900">Invitation expired</h1>
        <p className="text-sm text-n-500 mt-2">
          This invitation has expired. Ask your administrator to resend it.
        </p>
      </Shell>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const nextPath = `/invite/${token}`;

  // Not signed in → offer sign in / sign up, returning here afterwards.
  if (!user) {
    return (
      <Shell>
        <h1 className="text-xl font-semibold text-n-900">
          Join {companyName}
        </h1>
        <p className="text-sm text-n-500 mt-2">
          You&apos;ve been invited as{" "}
          <span className="font-medium text-n-700">{invite.invited_email}</span>. Sign in
          or create an account with that email to accept.
        </p>
        <div className="mt-6 space-y-3">
          <Link href={`/login?next=${encodeURIComponent(nextPath)}`} className="block">
            <Button className="w-full bg-lms-accent hover:bg-lms-accent-600 text-white">
              Sign in
            </Button>
          </Link>
          <Link
            href={`/signup?next=${encodeURIComponent(nextPath)}`}
            className="block text-center text-sm text-lms-accent hover:text-lms-accent-600 font-medium"
          >
            Create an account
          </Link>
        </div>
      </Shell>
    );
  }

  // Signed in with a different email → cannot accept.
  if ((invite.invited_email ?? "").toLowerCase() !== (user.email ?? "").toLowerCase()) {
    return (
      <Shell>
        <h1 className="text-xl font-semibold text-n-900">Wrong account</h1>
        <p className="text-sm text-n-500 mt-2">
          This invitation was sent to{" "}
          <span className="font-medium text-n-700">{invite.invited_email}</span>, but
          you&apos;re signed in as{" "}
          <span className="font-medium text-n-700">{user.email}</span>. Sign in with the
          invited email to accept.
        </p>
      </Shell>
    );
  }

  // Signed in with the matching email → ready to accept.
  return (
    <Shell>
      <h1 className="text-xl font-semibold text-n-900">Join {companyName}</h1>
      <p className="text-sm text-n-500 mt-2 mb-6">
        You&apos;re signed in as{" "}
        <span className="font-medium text-n-700">{user.email}</span>. Accept to join and
        see your assigned training.
      </p>
      <AcceptInviteButton token={token} />
    </Shell>
  );
}
