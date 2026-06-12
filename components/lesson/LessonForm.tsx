"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateLesson } from "@/lib/actions/lessons";
import { slugify } from "@/lib/utils";
import { Tables } from "@/types/supabase";

type Lesson = Tables<"lessons">;

export default function LessonForm({ lesson, courseId }: { lesson: Lesson; courseId: string }) {
  const [title, setTitle] = useState(lesson.title);
  const [slug, setSlug] = useState(lesson.slug);
  const [slugEdited, setSlugEdited] = useState(true);
  const [type, setType] = useState(lesson.type);
  const [content, setContent] = useState(lesson.content ?? "");
  const [videoUrl, setVideoUrl] = useState(lesson.video_url ?? "");
  const [duration, setDuration] = useState(String(lesson.duration ?? ""));
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugEdited) setSlug(slugify(value));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSaved(false);
    const formData = new FormData();
    formData.set("title", title);
    formData.set("slug", slug);
    formData.set("type", type);
    formData.set("content", content);
    formData.set("video_url", videoUrl);
    formData.set("duration", duration);

    startTransition(async () => {
      try {
        await updateLesson(lesson.id, courseId, formData);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="title" className="text-n-700">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          required
          className="border-n-200 focus-visible:ring-lms-accent"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="slug" className="text-n-700">Slug</Label>
        <Input
          id="slug"
          value={slug}
          onChange={(e) => { setSlug(e.target.value); setSlugEdited(true); }}
          required
          className="border-n-200 focus-visible:ring-lms-accent font-mono text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="type" className="text-n-700">Lesson type</Label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full border border-n-200 rounded-sm px-3 py-2 text-sm bg-n-0 text-n-900 focus:outline-none focus:ring-1 focus:ring-lms-accent"
        >
          <option value="text">Text (MDX)</option>
          <option value="video">Video (Bunny.net)</option>
        </select>
      </div>

      {type === "text" ? (
        <div className="space-y-1.5">
          <Label htmlFor="content" className="text-n-700">Content (MDX)</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            placeholder={"## Heading\n\nLesson text..."}
            className="border-n-200 focus-visible:ring-lms-accent font-mono text-sm resize-y"
          />
        </div>
      ) : (
        <div className="space-y-1.5">
          <Label htmlFor="video_url" className="text-n-700">Video URL (Bunny.net)</Label>
          <Input
            id="video_url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://iframe.mediadelivery.net/embed/..."
            className="border-n-200 focus-visible:ring-lms-accent"
          />
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="duration" className="text-n-700">Duration (seconds)</Label>
        <Input
          id="duration"
          type="number"
          min="0"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
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
        {isPending ? "Saving..." : saved ? "Saved ✓" : "Save lesson"}
      </Button>
    </form>
  );
}
