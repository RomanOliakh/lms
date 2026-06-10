"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteOrganization } from "@/lib/actions/organizations";

export default function DeleteCompanyButton({ organizationId }: { organizationId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("Видалити компанію і всіх її співробітників?")) return;
    startTransition(async () => {
      await deleteOrganization(organizationId);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="inline-flex items-center gap-1.5 text-sm text-n-400 hover:text-danger transition-colors disabled:opacity-50"
    >
      <Trash2 className="w-4 h-4" />
      {isPending ? "Видалення..." : "Видалити компанію"}
    </button>
  );
}
