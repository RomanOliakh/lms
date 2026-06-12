"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function assignCourse(input: {
  orgId: string;
  courseId: string;
  memberIds: string[];
  dueAt: string | null; // ISO date (yyyy-mm-dd) or null
}) {
  const { orgId, courseId, memberIds, dueAt } = input;
  if (memberIds.length === 0) throw new Error("Select at least one employee");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const rows = memberIds.map((member_id) => ({
    org_id: orgId,
    course_id: courseId,
    member_id,
    due_at: dueAt ? new Date(dueAt).toISOString() : null,
    assigned_by: user?.id ?? null,
  }));

  // Idempotent: re-assigning an already assigned course is a no-op
  const { error } = await supabase
    .from("course_assignments")
    .upsert(rows, { onConflict: "member_id,course_id", ignoreDuplicates: true });

  if (error) throw new Error(error.message);

  revalidatePath(`/admin/companies/${orgId}`);
}

export async function unassignCourse(assignmentId: string, orgId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("course_assignments")
    .delete()
    .eq("id", assignmentId)
    .select("id");

  if (error) throw new Error(error.message);
  if (!data?.length) throw new Error("Assignment not found or insufficient permissions");

  revalidatePath(`/admin/companies/${orgId}`);
}
