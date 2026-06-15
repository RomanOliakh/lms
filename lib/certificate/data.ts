import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

export type CertificateData = {
  name: string;
  courseTitle: string;
  companyName: string;
  completedOn: string; // formatted "15 June 2026"
};

// Builds the data for a completion certificate, or returns null if the user has
// NOT completed 100% of the course (no partial certificates). Uses a service-role
// client because an admin generating an employee's certificate must read that
// employee's profile/email, which row-level security would otherwise hide.
export async function getCertificateData(
  service: SupabaseClient<Database>,
  userId: string,
  courseId: string
): Promise<CertificateData | null> {
  const { data: course, error: courseError } = await service
    .from("courses")
    .select("title")
    .eq("id", courseId)
    .maybeSingle();
  if (courseError) throw new Error(`Failed to load course: ${courseError.message}`);
  if (!course) return null;

  // Lessons in the course (via modules).
  const { data: modules, error: modulesError } = await service
    .from("modules")
    .select("id")
    .eq("course_id", courseId);
  if (modulesError) throw new Error(`Failed to load modules: ${modulesError.message}`);
  const moduleIds = (modules ?? []).map((m) => m.id);
  if (moduleIds.length === 0) return null;

  const { data: lessons, error: lessonsError } = await service
    .from("lessons")
    .select("id")
    .in("module_id", moduleIds);
  if (lessonsError) throw new Error(`Failed to load lessons: ${lessonsError.message}`);
  const lessonIds = (lessons ?? []).map((l) => l.id);
  if (lessonIds.length === 0) return null;

  // Completed lessons for this user.
  const { data: progress, error: progressError } = await service
    .from("lesson_progress")
    .select("lesson_id, updated_at")
    .eq("user_id", userId)
    .eq("completed", true)
    .in("lesson_id", lessonIds);
  if (progressError) throw new Error(`Failed to load progress: ${progressError.message}`);

  // Require 100% completion.
  if ((progress?.length ?? 0) < lessonIds.length) return null;

  const completedAt = (progress ?? [])
    .map((p) => p.updated_at)
    .filter((d): d is string => !!d)
    .sort()
    .at(-1);
  const completedOn = formatLongDate(completedAt ?? new Date().toISOString());

  // Name: profile full_name, fall back to email. Fail closed on query errors —
  // keep fallbacks only for genuinely missing rows.
  const { data: profile, error: profileError } = await service
    .from("profiles")
    .select("full_name")
    .eq("id", userId)
    .maybeSingle();
  if (profileError) throw new Error(`Failed to load profile: ${profileError.message}`);

  const { data: authUser, error: authUserError } = await service.auth.admin.getUserById(userId);
  if (authUserError) throw new Error(`Failed to load auth user: ${authUserError.message}`);
  const email = authUser?.user?.email ?? "";
  const name = profile?.full_name?.trim() || email || "Learner";

  // Company that assigned this course to the user.
  const { data: assignment, error: assignmentError } = await service
    .from("course_assignments")
    .select("organizations(name), organization_members!inner(user_id)")
    .eq("course_id", courseId)
    .eq("organization_members.user_id", userId)
    .limit(1)
    .maybeSingle();
  if (assignmentError) {
    throw new Error(`Failed to load certificate organization: ${assignmentError.message}`);
  }
  const companyName =
    (assignment?.organizations as unknown as { name: string } | null)?.name ?? "your company";

  return { name, courseTitle: course.title, companyName, completedOn };
}

function formatLongDate(iso: string): string {
  const d = new Date(iso);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return `${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}
