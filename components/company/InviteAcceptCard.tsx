"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import {
  acceptInviteSignedIn,
  acceptInviteNewAccount,
} from "@/lib/actions/invite-accept";

export default function InviteAcceptCard({
  token,
  orgName,
  invitedEmail,
  sessionEmail,
}: {
  token: string;
  orgName: string;
  invitedEmail: string;
  sessionEmail: string | null;
}) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const emailMatches =
    sessionEmail?.toLowerCase() === invitedEmail.toLowerCase();

  function handleJoinSignedIn() {
    setError("");
    startTransition(async () => {
      try {
        await acceptInviteSignedIn(token);
        router.push("/dashboard");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to accept invitation");
      }
    });
  }

  function handleJoinNewAccount(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      try {
        const { email } = await acceptInviteNewAccount(token, password);
        const supabase = createClient();
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) {
          // Account is created and linked — fall back to manual login
          router.push("/login");
          return;
        }
        router.push("/dashboard");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to accept invitation");
      }
    });
  }

  return (
    <div className="max-w-sm w-full border border-n-200 rounded-lg shadow-pop p-6">
      <h1 className="text-lg font-semibold text-n-900 tracking-tight mb-1">
        Join {orgName}
      </h1>
      <p className="text-sm text-n-500 mb-5">
        Invitation for <span className="font-medium text-n-700">{invitedEmail}</span>
      </p>

      {sessionEmail && emailMatches && (
        <Button
          onClick={handleJoinSignedIn}
          disabled={isPending}
          className="w-full bg-lms-accent hover:bg-lms-accent-600 text-white"
        >
          {isPending ? "Joining..." : `Join ${orgName}`}
        </Button>
      )}

      {sessionEmail && !emailMatches && (
        <p className="text-sm text-warn">
          You are signed in as {sessionEmail}, but this invitation was sent to{" "}
          {invitedEmail}. Sign out first, then open the link again.
        </p>
      )}

      {!sessionEmail && (
        <form onSubmit={handleJoinNewAccount} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-n-700">
              Create a password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              minLength={8}
              className="border-n-200 focus-visible:ring-lms-accent"
            />
          </div>
          <Button
            type="submit"
            disabled={isPending || password.length < 8}
            className="w-full bg-lms-accent hover:bg-lms-accent-600 text-white"
          >
            {isPending ? "Creating account..." : "Create account & join"}
          </Button>
          <p className="text-xs text-n-400 text-center">
            Already have an account?{" "}
            <a href="/login" className="text-lms-accent hover:underline">
              Sign in
            </a>{" "}
            and open the link again.
          </p>
        </form>
      )}

      {error && <p className="text-sm text-danger mt-3">{error}</p>}
    </div>
  );
}
