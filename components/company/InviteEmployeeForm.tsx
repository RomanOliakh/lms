"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { inviteEmployee, type InviteResult } from "@/lib/actions/invitations";

export default function InviteEmployeeForm({ orgId }: { orgId: string }) {
  const [email, setEmail] = useState("");
  const [orgRole, setOrgRole] = useState("learner");
  const [error, setError] = useState("");
  const [result, setResult] = useState<InviteResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setResult(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        const res = await inviteEmployee(orgId, formData);
        setResult(res);
        setEmail("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to send invitation");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-3 items-end">
        <div className="space-y-1.5 flex-1">
          <Label htmlFor="invite_email" className="text-n-700">Email</Label>
          <Input
            id="invite_email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="employee@company.com"
            required
            className="border-n-200 focus-visible:ring-lms-accent"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="invite_role" className="text-n-700">Role</Label>
          <select
            id="invite_role"
            name="org_role"
            value={orgRole}
            onChange={(e) => setOrgRole(e.target.value)}
            className="h-9 px-3 rounded-sm border border-n-200 bg-n-0 text-sm text-n-900 focus:outline-none focus:ring-2 focus:ring-lms-accent"
          >
            <option value="learner">Learner</option>
            <option value="company_admin">Company admin</option>
          </select>
        </div>
        <Button
          type="submit"
          disabled={isPending || !email}
          className="bg-lms-accent hover:bg-lms-accent-600 text-white"
        >
          {isPending ? "Inviting..." : "Invite"}
        </Button>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      {result && (
        <div className="border border-n-200 rounded-sm p-3 text-sm space-y-1">
          {result.emailError ? (
            <p className="text-warn">
              Invitation created, but the email could not be sent ({result.emailError}).
              Share the link manually:
            </p>
          ) : (
            <p className="text-success">Invitation email sent ✓</p>
          )}
          <p className="font-mono text-xs text-n-700 break-all select-all">
            {result.inviteUrl}
          </p>
        </div>
      )}
    </form>
  );
}
