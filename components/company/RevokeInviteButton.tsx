"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { revokeInvitation } from "@/lib/actions/invitations";

export default function RevokeInviteButton({
  memberId,
  orgId,
}: {
  memberId: string;
  orgId: string;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("Revoke this invitation? The invite link will stop working.")) return;
    setError("");
    startTransition(async () => {
      try {
        await revokeInvitation(memberId, orgId);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to revoke");
      }
    });
  }

  return (
    <span className="inline-flex items-center gap-2">
      {error && <span className="text-xs text-danger">{error}</span>}
      <button
        onClick={handleClick}
        disabled={isPending}
        title="Revoke invitation"
        className="inline-flex items-center gap-1 text-xs text-n-400 hover:text-danger transition-colors disabled:opacity-50"
      >
        <X className="w-3.5 h-3.5" />
        {isPending ? "Revoking..." : "Revoke"}
      </button>
    </span>
  );
}
