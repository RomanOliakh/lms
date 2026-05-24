"use client";

import { useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";

export default function LessonPlayer({
  lessonId,
  type,
  videoUrl,
  content,
  initialCompleted,
}: {
  lessonId: string;
  type: string;
  videoUrl: string | null;
  content: string | null;
  initialCompleted: boolean;
}) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [saving, setSaving] = useState(false);

  async function markCompleted() {
    if (completed) return;
    setSaving(true);
    try {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lesson_id: lessonId, completed: true, watch_time: 0 }),
      });
      setCompleted(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {type === "video" && videoUrl ? (
        <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
          <iframe
            src={videoUrl}
            className="absolute inset-0 w-full h-full rounded-md border border-n-200"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      ) : type === "text" && content ? (
        <div className="prose prose-sm max-w-none text-n-800 leading-relaxed whitespace-pre-wrap">
          {content}
        </div>
      ) : (
        <div className="py-10 text-center text-n-400 text-sm">Контент відсутній</div>
      )}

      <button
        onClick={markCompleted}
        disabled={completed || saving}
        className={`inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-sm transition-colors ${
          completed
            ? "text-success bg-n-50 border border-n-200 cursor-default"
            : "text-white bg-lms-accent hover:bg-lms-accent-600 disabled:opacity-60"
        }`}
      >
        {completed ? (
          <>
            <CheckCircle2 className="w-4 h-4" />
            Урок завершено
          </>
        ) : (
          <>
            <Circle className="w-4 h-4" />
            {saving ? "Зберігаємо..." : "Позначити як завершений"}
          </>
        )}
      </button>
    </div>
  );
}
