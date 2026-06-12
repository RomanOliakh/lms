"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createCourse, updateCourse } from "@/lib/actions/courses";
import { slugify } from "@/lib/utils";
import { Tables } from "@/types/supabase";

type Course = Tables<"courses">;

export default function CourseForm({ course }: { course?: Course }) {
  const router = useRouter();
  const [title, setTitle] = useState(course?.title ?? "");
  const [slug, setSlug] = useState(course?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(!!course);
  const [description, setDescription] = useState(course?.description ?? "");
  const [price, setPrice] = useState(String(course?.price ?? "0"));
  const [thumbnailUrl, setThumbnailUrl] = useState(course?.thumbnail_url ?? "");
  const [isPublished, setIsPublished] = useState(course?.is_published ?? false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugEdited) setSlug(slugify(value));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    formData.set("is_published", String(isPublished));

    startTransition(async () => {
      try {
        if (course) {
          await updateCourse(course.id, formData);
        } else {
          const result = await createCourse(formData);
          router.push(`/admin/courses/${result.id}`);
        }
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
          name="title"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Course title"
          required
          className="border-n-200 focus-visible:ring-lms-accent"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="slug" className="text-n-700">Slug</Label>
        <Input
          id="slug"
          name="slug"
          value={slug}
          onChange={(e) => { setSlug(e.target.value); setSlugEdited(true); }}
          placeholder="course-title"
          required
          className="border-n-200 focus-visible:ring-lms-accent font-mono text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description" className="text-n-700">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short course description"
          rows={3}
          className="border-n-200 focus-visible:ring-lms-accent resize-none"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="price" className="text-n-700">Price (UAH)</Label>
        <Input
          id="price"
          name="price"
          type="number"
          min="0"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="border-n-200 focus-visible:ring-lms-accent"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="thumbnail_url" className="text-n-700">Thumbnail URL</Label>
        <Input
          id="thumbnail_url"
          name="thumbnail_url"
          value={thumbnailUrl}
          onChange={(e) => setThumbnailUrl(e.target.value)}
          placeholder="https://..."
          className="border-n-200 focus-visible:ring-lms-accent"
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          id="is_published"
          type="checkbox"
          checked={isPublished}
          onChange={(e) => setIsPublished(e.target.checked)}
          className="w-4 h-4 accent-lms-accent"
        />
        <Label htmlFor="is_published" className="text-n-700 cursor-pointer">
          Publish course
        </Label>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <Button
        type="submit"
        disabled={isPending}
        className="bg-lms-accent hover:bg-lms-accent-600 text-white"
      >
        {isPending ? "Saving..." : course ? "Save changes" : "Create course"}
      </Button>
    </form>
  );
}
