"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

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
