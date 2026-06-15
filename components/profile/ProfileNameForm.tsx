"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateProfileName } from "@/lib/actions/profile";

export default function ProfileNameForm({ initialName }: { initialName: string }) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaved(false);
    setError("");
    startTransition(async () => {
      try {
        await updateProfileName(name);
        setSaved(true);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2">
      <div className="space-y-1">
        <label htmlFor="full_name" className="block text-xs text-n-500">
          Your name (shown on certificates)
        </label>
        <Input
          id="full_name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your full name"
          className="h-9 w-64 border-n-200 focus-visible:ring-lms-accent"
        />
      </div>
      <Button
        type="submit"
        disabled={isPending}
        className="bg-lms-accent hover:bg-lms-accent-600 text-white"
      >
        {isPending ? "Saving..." : "Save"}
      </Button>
      {saved && <span className="text-xs text-success" role="status">Saved ✓</span>}
      {error && <span className="text-xs text-danger" role="alert">{error}</span>}
    </form>
  );
}
