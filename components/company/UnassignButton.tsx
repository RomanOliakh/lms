"use client";

import { useTransition } from "react";
import { X } from "lucide-react";
import { unassignCourse } from "@/lib/actions/assignments";

export default function UnassignButton({
  assignmentId,
  orgId,
}: {
  assignmentId: string;
  orgId: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("Remove this assignment? The employee will lose access to the course.")) return;
    startTransition(async () => {
      try {
        await unassignCourse(assignmentId, orgId);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to remove assignment");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      title="Remove assignment"
      className="text-n-400 hover:text-danger disabled:opacity-50"
    >
      <X className="w-4 h-4" />
    </button>
  );
}
