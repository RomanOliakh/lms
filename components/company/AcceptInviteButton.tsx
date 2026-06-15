"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { acceptInvitation } from "@/lib/actions/invitations";

export default function AcceptInviteButton({ token }: { token: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    setError("");
    startTransition(async () => {
      try {
        await acceptInvitation(token);
        router.push("/dashboard");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to accept invitation");
      }
    });
  }

  return (
    <div className="space-y-3">
      <Button
        onClick={handleClick}
        disabled={isPending}
        className="w-full bg-lms-accent hover:bg-lms-accent-600 text-white"
      >
        {isPending ? "Joining..." : "Accept & join"}
      </Button>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
