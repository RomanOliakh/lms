"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteOrganization } from "@/lib/actions/organizations";

export default function DeleteCompanyButton({ organizationId }: { organizationId: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("Видалити компанію і всіх її співробітників?")) return;
    setError("");
    startTransition(async () => {
      try {
        await deleteOrganization(organizationId);
        router.push("/admin/companies");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Помилка видалення");
      }
    });
  }

  return (
    <div className="flex items-center gap-3">
      {error && <p className="text-xs text-danger">{error}</p>}
      <button
        onClick={handleClick}
        disabled={isPending}
        className="inline-flex items-center gap-1.5 text-sm text-n-400 hover:text-danger transition-colors disabled:opacity-50"
      >
        <Trash2 className="w-4 h-4" />
        {isPending ? "Видалення..." : "Видалити компанію"}
      </button>
    </div>
  );
}
