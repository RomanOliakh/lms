"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function EnrollButton({
  courseId,
  isEnrolled,
  firstLessonSlug,
  isLoggedIn,
}: {
  courseId: string;
  isEnrolled: boolean;
  firstLessonSlug: string | null;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [enrolled, setEnrolled] = useState(isEnrolled);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  if (!isLoggedIn) {
    return (
      <a
        href="/login"
        className="inline-flex items-center px-5 py-2 rounded-sm bg-lms-accent text-white text-sm font-semibold hover:bg-lms-accent-600 transition-colors"
      >
        Увійти, щоб записатись
      </a>
    );
  }

  if (enrolled && firstLessonSlug) {
    return (
      <a
        href={`/learn/${firstLessonSlug}`}
        className="inline-flex items-center px-5 py-2 rounded-sm bg-lms-accent text-white text-sm font-semibold hover:bg-lms-accent-600 transition-colors"
      >
        Продовжити навчання →
      </a>
    );
  }

  if (enrolled) {
    return (
      <span className="inline-flex items-center px-5 py-2 rounded-sm bg-n-100 text-n-600 text-sm font-semibold">
        Ви вже записані
      </span>
    );
  }

  function handleEnroll() {
    setError("");
    startTransition(async () => {
      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ course_id: courseId }),
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "Помилка запису");
          return;
        }

        // Paid course — redirect to Stripe checkout
        if (data.url) {
          window.location.href = data.url;
          return;
        }

        // Free course — enrolled directly
        setEnrolled(true);
        if (firstLessonSlug) {
          router.push(`/learn/${firstLessonSlug}`);
        }
      } catch {
        setError("Помилка з'єднання");
      }
    });
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleEnroll}
        disabled={isPending}
        className="inline-flex items-center px-5 py-2 rounded-sm bg-lms-accent text-white text-sm font-semibold hover:bg-lms-accent-600 transition-colors disabled:opacity-60"
      >
        {isPending ? "Записуємось..." : "Записатись на курс"}
      </button>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
