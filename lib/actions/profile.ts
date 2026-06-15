"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Lets a learner set the name shown on their completion certificates.
// RLS policy update_own_profile already scopes the update to auth.uid().
export async function updateProfileName(fullName: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const trimmed = fullName.trim().slice(0, 120);
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: trimmed || null })
    .eq("id", user.id);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
}
