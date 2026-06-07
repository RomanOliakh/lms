"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

export async function createLesson(moduleId: string, courseId: string, title: string) {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("lessons")
    .select("position")
    .eq("module_id", moduleId)
    .order("position", { ascending: false })
    .limit(1)
    .single();

  const position = (existing?.position ?? -1) + 1;
  const slug = slugify(title);

  const { data, error } = await supabase
    .from("lessons")
    .insert({ module_id: moduleId, title, slug, position })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  revalidatePath(`/admin/courses/${courseId}`);
  return data.id;
}

export async function updateLesson(id: string, courseId: string, formData: FormData) {
  const supabase = await createClient();
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const type = formData.get("type") as string;
  const content = (formData.get("content") as string) || null;
  const video_url = (formData.get("video_url") as string) || null;
  const duration = formData.get("duration") ? parseInt(formData.get("duration") as string) : null;

  const { error } = await supabase
    .from("lessons")
    .update({ title, slug, type, content, video_url, duration })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath(`/admin/courses/${courseId}/lessons/${id}`);
  revalidatePath(`/admin/courses/${courseId}`);
}

export async function deleteLesson(id: string, courseId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("lessons").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/courses/${courseId}`);
}

export async function moveLesson(
  id: string,
  courseId: string,
  moduleId: string,
  direction: "up" | "down"
) {
  const supabase = await createClient();

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, position")
    .eq("module_id", moduleId)
    .order("position");

  if (!lessons) return;

  const idx = lessons.findIndex((l) => l.id === id);
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= lessons.length) return;

  await supabase
    .from("lessons")
    .update({ position: lessons[swapIdx].position })
    .eq("id", lessons[idx].id);
  await supabase
    .from("lessons")
    .update({ position: lessons[idx].position })
    .eq("id", lessons[swapIdx].id);

  revalidatePath(`/admin/courses/${courseId}`);
}
