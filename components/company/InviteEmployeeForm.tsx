"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { inviteEmployee } from "@/lib/actions/invitations";

export default function InviteEmployeeForm({ orgId }: { orgId: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("learner");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setNotice("");
    setInviteLink("");
    setCopied(false);

    const formData = new FormData();
    formData.set("email", email);
    formData.set("role", role);

    startTransition(async () => {
      try {
        const result = await inviteEmployee(orgId, formData);
        setInviteLink(result.inviteUrl);
        setNotice(
          result.emailSent
            ? `Invitation emailed to ${email}.`
            : "Invitation created. Email sending is not configured yet — share the link below."
        );
        setEmail("");
        setRole("learner");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to send invitation");
      }
    });
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may be unavailable (insecure context) — link is still selectable.
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="invite_email" className="text-n-700">
            Email
          </Label>
          <Input
            id="invite_email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="employee@company.com"
            required
            className="border-n-200 focus-visible:ring-lms-accent"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="invite_role" className="text-n-700">
            Role
          </Label>
          <select
            id="invite_role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="h-9 w-full sm:w-44 rounded-sm border border-n-200 bg-n-0 px-3 text-sm text-n-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lms-accent"
          >
            <option value="learner">Learner</option>
            <option value="company_admin">Company admin</option>
          </select>
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="bg-lms-accent hover:bg-lms-accent-600 text-white"
        >
          {isPending ? "Sending..." : "Send invite"}
        </Button>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}
      {notice && <p className="text-sm text-n-600">{notice}</p>}

      {inviteLink && (
        <div className="flex items-center gap-2 rounded-sm border border-n-200 bg-n-50 px-3 py-2">
          <code className="flex-1 text-xs text-n-700 break-all">{inviteLink}</code>
          <button
            type="button"
            onClick={copyLink}
            className="shrink-0 text-xs font-medium text-lms-accent hover:text-lms-accent-600"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      )}
    </form>
  );
}
