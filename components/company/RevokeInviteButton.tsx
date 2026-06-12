"use client";

import { useTransition } from "react";
import { X } from "lucide-react";
import { revokeInvitation } from "@/lib/actions/invitations";

export default function RevokeInviteButton({
  memberId,
  orgId,
}: {
  memberId: string;
  orgId: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("Revoke this invitation? The invite link will stop working.")) return;
    startTransition(async () => {
      try {
        await revokeInvitation(memberId, orgId);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to revoke invitation");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      title="Revoke invitation"
      className="text-n-400 hover:text-danger disabled:opacity-50"
    >
      <X className="w-4 h-4" />
    </button>
  );
}
