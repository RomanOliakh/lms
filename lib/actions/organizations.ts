"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

function friendlyDbError(error: { code?: string; message: string }): string {
  if (error.code === "23505") return "Компанія з таким slug вже існує";
  return error.message;
}

export async function createOrganization(formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const slug = (formData.get("slug") as string) || slugify(name);
  const logo_url = (formData.get("logo_url") as string) || null;
  const seat_limit = Math.max(0, parseInt((formData.get("seat_limit") as string) || "0", 10) || 0);
  const status = formData.get("status") === "suspended" ? "suspended" : "active";

  const { data, error } = await supabase
    .from("organizations")
    .insert({ name, slug, logo_url, seat_limit, status })
    .select("id")
    .single();

  if (error) throw new Error(friendlyDbError(error));

  return { id: data.id };
}

export async function updateOrganization(id: string, formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const logo_url = (formData.get("logo_url") as string) || null;
  const seat_limit = Math.max(0, parseInt((formData.get("seat_limit") as string) || "0", 10) || 0);
  const status = formData.get("status") === "suspended" ? "suspended" : "active";

  const { data, error } = await supabase
    .from("organizations")
    .update({ name, slug, logo_url, seat_limit, status })
    .eq("id", id)
    .select("id");

  if (error) throw new Error(friendlyDbError(error));
  // RLS silently filters out rows the caller can't touch — surface that instead of pretending success
  if (!data?.length) throw new Error("Компанію не знайдено або бракує прав");

  revalidatePath(`/admin/companies/${id}`);
  revalidatePath("/admin/companies");
}

export async function deleteOrganization(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organizations")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) throw new Error(friendlyDbError(error));
  if (!data?.length) throw new Error("Компанію не знайдено або бракує прав");

  revalidatePath("/admin/companies");
}
