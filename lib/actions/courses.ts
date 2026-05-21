"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createCourse(formData: FormData) {
  const supabase = await createClient();
  const title = formData.get("title") as string;
  const slug = (formData.get("slug") as string) || slugify(title);
  const description = formData.get("description") as string;
  const price = parseFloat((formData.get("price") as string) || "0");
  const thumbnail_url = (formData.get("thumbnail_url") as string) || null;
  const is_published = formData.get("is_published") === "true";

  const { data, error } = await supabase
    .from("courses")
    .insert({ title, slug, description: description || null, price, thumbnail_url, is_published })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  return { id: data.id };
}

export async function updateCourse(id: string, formData: FormData) {
  const supabase = await createClient();
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const price = parseFloat((formData.get("price") as string) || "0");
  const thumbnail_url = (formData.get("thumbnail_url") as string) || null;
  const is_published = formData.get("is_published") === "true";

  const { error } = await supabase
    .from("courses")
    .update({
      title,
      slug,
      description: description || null,
      price,
      thumbnail_url,
      is_published,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath(`/admin/courses/${id}`);
  revalidatePath("/admin/courses");
}

export async function deleteCourse(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("courses").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/courses");
  redirect("/admin/courses");
}
