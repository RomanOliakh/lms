"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createModule(courseId: string, title: string) {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("modules")
    .select("position")
    .eq("course_id", courseId)
    .order("position", { ascending: false })
    .limit(1)
    .single();

  const position = (existing?.position ?? -1) + 1;

  const { error } = await supabase
    .from("modules")
    .insert({ course_id: courseId, title, position });

  if (error) throw new Error(error.message);
  revalidatePath(`/admin/courses/${courseId}`);
}

export async function updateModule(id: string, courseId: string, title: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("modules").update({ title }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/courses/${courseId}`);
}

export async function deleteModule(id: string, courseId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("modules").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/courses/${courseId}`);
}

export async function moveModule(id: string, courseId: string, direction: "up" | "down") {
  const supabase = await createClient();

  const { data: modules } = await supabase
    .from("modules")
    .select("id, position")
    .eq("course_id", courseId)
    .order("position");

  if (!modules) return;

  const idx = modules.findIndex((m) => m.id === id);
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= modules.length) return;

  await supabase
    .from("modules")
    .update({ position: modules[swapIdx].position })
    .eq("id", modules[idx].id);
  await supabase
    .from("modules")
    .update({ position: modules[idx].position })
    .eq("id", modules[swapIdx].id);

  revalidatePath(`/admin/courses/${courseId}`);
}
