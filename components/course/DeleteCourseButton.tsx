"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteCourse } from "@/lib/actions/courses";

export default function DeleteCourseButton({ courseId }: { courseId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("Видалити курс і всі його модулі/уроки?")) return;
    startTransition(async () => {
      await deleteCourse(courseId);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="inline-flex items-center gap-1.5 text-sm text-n-400 hover:text-danger transition-colors disabled:opacity-50"
    >
      <Trash2 className="w-4 h-4" />
      {isPending ? "Видалення..." : "Видалити курс"}
    </button>
  );
}
