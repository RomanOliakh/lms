"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateLesson } from "@/lib/actions/lessons";
import { Tables } from "@/types/supabase";

type Lesson = Tables<"lessons">;

export default function LessonForm({
  lesson,
  courseId,
}: {
  lesson: Lesson;
  courseId: string;
}) {
  const [type, setType] = useState(lesson.type);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSaved(false);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await updateLesson(lesson.id, courseId, formData);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Помилка збереження");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="title" className="text-n-700">Назва</Label>
        <Input
          id="title"
          name="title"
          defaultValue={lesson.title}
          required
          className="border-n-200 focus-visible:ring-lms-accent"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="slug" className="text-n-700">Slug</Label>
        <Input
          id="slug"
          name="slug"
          defaultValue={lesson.slug}
          required
          className="border-n-200 focus-visible:ring-lms-accent font-mono text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="type" className="text-n-700">Тип уроку</Label>
        <select
          id="type"
          name="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full border border-n-200 rounded-sm px-3 py-2 text-sm bg-n-0 text-n-900 focus:outline-none focus:ring-1 focus:ring-lms-accent"
        >
          <option value="text">Текст (MDX)</option>
          <option value="video">Відео (Bunny.net)</option>
        </select>
      </div>

      {type === "text" ? (
        <div className="space-y-1.5">
          <Label htmlFor="content" className="text-n-700">Контент (MDX)</Label>
          <Textarea
            id="content"
            name="content"
            defaultValue={lesson.content ?? ""}
            rows={8}
            placeholder="## Заголовок&#10;&#10;Текст уроку..."
            className="border-n-200 focus-visible:ring-lms-accent font-mono text-sm resize-y"
          />
        </div>
      ) : (
        <div className="space-y-1.5">
          <Label htmlFor="video_url" className="text-n-700">URL відео (Bunny.net)</Label>
          <Input
            id="video_url"
            name="video_url"
            defaultValue={lesson.video_url ?? ""}
            placeholder="https://iframe.mediadelivery.net/embed/..."
            className="border-n-200 focus-visible:ring-lms-accent"
          />
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="duration" className="text-n-700">Тривалість (секунди)</Label>
        <Input
          id="duration"
          name="duration"
          type="number"
          min="0"
          defaultValue={lesson.duration ?? ""}
          placeholder="600"
          className="border-n-200 focus-visible:ring-lms-accent"
        />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <Button
        type="submit"
        disabled={isPending}
        className="bg-lms-accent hover:bg-lms-accent-600 text-white"
      >
        {isPending ? "Збереження..." : saved ? "Збережено ✓" : "Зберегти урок"}
      </Button>
    </form>
  );
}
