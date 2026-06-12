"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createQuestion(lessonId: string, courseId: string) {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("quiz_questions")
    .select("position")
    .eq("lesson_id", lessonId)
    .order("position", { ascending: false })
    .limit(1)
    .single();

  const position = (existing?.position ?? -1) + 1;

  const { data, error } = await supabase
    .from("quiz_questions")
    .insert({ lesson_id: lessonId, question: "New question", position })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  revalidatePath(`/admin/courses/${courseId}/lessons/${lessonId}`);
  return data.id;
}

export async function updateQuestion(
  id: string,
  lessonId: string,
  courseId: string,
  data: { question?: string; type?: string }
) {
  const supabase = await createClient();
  const { error } = await supabase.from("quiz_questions").update(data).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/courses/${courseId}/lessons/${lessonId}`);
}

export async function deleteQuestion(id: string, lessonId: string, courseId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("quiz_questions").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/courses/${courseId}/lessons/${lessonId}`);
}

export async function createOption(questionId: string, lessonId: string, courseId: string) {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("quiz_options")
    .select("position")
    .eq("question_id", questionId)
    .order("position", { ascending: false })
    .limit(1)
    .single();

  const position = (existing?.position ?? -1) + 1;

  const { error } = await supabase
    .from("quiz_options")
    .insert({ question_id: questionId, text: "Answer option", position });

  if (error) throw new Error(error.message);
  revalidatePath(`/admin/courses/${courseId}/lessons/${lessonId}`);
}

export async function updateOption(
  id: string,
  lessonId: string,
  courseId: string,
  data: { text?: string; is_correct?: boolean }
) {
  const supabase = await createClient();
  const { error } = await supabase.from("quiz_options").update(data).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/courses/${courseId}/lessons/${lessonId}`);
}

export async function deleteOption(id: string, lessonId: string, courseId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("quiz_options").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/courses/${courseId}/lessons/${lessonId}`);
}
