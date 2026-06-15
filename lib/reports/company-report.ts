import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

// One row per (employee × assigned course). Completion is measured ONLY across
// courses the company assigned to the employee (B2B scope — not self-enrollments).
export type CompanyReportRow = {
  email: string;
  courseTitle: string;
  dueAt: string | null;
  completedLessons: number;
  totalLessons: number;
  completionPct: number;
  quizzesTaken: number;
  quizzesTotal: number;
  quizScorePct: number | null; // null = no quiz attempts yet
};

// Builds the company training report. Relies on the caller's RLS scope: a platform
// admin sees every org, a company admin only the orgs they administer.
export async function buildCompanyReport(
  supabase: SupabaseClient<Database>,
  orgId: string
): Promise<CompanyReportRow[]> {
  const { data: assignments } = await supabase
    .from("course_assignments")
    .select(
      "member_id, course_id, due_at, organization_members(user_id, invited_email), courses(title)"
    )
    .eq("org_id", orgId);

  if (!assignments || assignments.length === 0) return [];

  const courseIds = [...new Set(assignments.map((a) => a.course_id))];
  const userIds = [
    ...new Set(
      assignments
        .map(
          (a) =>
            (a.organization_members as unknown as { user_id: string | null } | null)
              ?.user_id
        )
        .filter((u): u is string => !!u)
    ),
  ];

  // course → lessons (via modules)
  const { data: modules } = await supabase
    .from("modules")
    .select("id, course_id")
    .in("course_id", courseIds);
  const moduleIds = (modules ?? []).map((m) => m.id);
  const moduleToCourse = new Map((modules ?? []).map((m) => [m.id, m.course_id]));

  let lessons: { id: string; module_id: string }[] = [];
  if (moduleIds.length) {
    const { data } = await supabase
      .from("lessons")
      .select("id, module_id")
      .in("module_id", moduleIds);
    lessons = data ?? [];
  }

  const courseToLessons = new Map<string, string[]>();
  for (const l of lessons) {
    const cid = moduleToCourse.get(l.module_id);
    if (!cid) continue;
    if (!courseToLessons.has(cid)) courseToLessons.set(cid, []);
    courseToLessons.get(cid)!.push(l.id);
  }
  const allLessonIds = lessons.map((l) => l.id);

  // which lessons carry a quiz
  const quizLessonSet = new Set<string>();
  if (allLessonIds.length) {
    const { data: qq } = await supabase
      .from("quiz_questions")
      .select("lesson_id")
      .in("lesson_id", allLessonIds);
    for (const q of qq ?? []) quizLessonSet.add(q.lesson_id);
  }

  // completed lessons per user
  const completedByUser = new Map<string, Set<string>>();
  if (userIds.length && allLessonIds.length) {
    const { data: prog } = await supabase
      .from("lesson_progress")
      .select("user_id, lesson_id")
      .in("user_id", userIds)
      .in("lesson_id", allLessonIds)
      .eq("completed", true);
    for (const p of prog ?? []) {
      if (!completedByUser.has(p.user_id)) completedByUser.set(p.user_id, new Set());
      completedByUser.get(p.user_id)!.add(p.lesson_id);
    }
  }

  // quiz attempts per user → lesson
  const attemptsByUser = new Map<string, Map<string, { score: number; total: number }>>();
  if (userIds.length && allLessonIds.length) {
    const { data: attempts } = await supabase
      .from("quiz_attempts")
      .select("user_id, lesson_id, score, total")
      .in("user_id", userIds)
      .in("lesson_id", allLessonIds);
    for (const at of attempts ?? []) {
      if (!attemptsByUser.has(at.user_id)) attemptsByUser.set(at.user_id, new Map());
      attemptsByUser.get(at.user_id)!.set(at.lesson_id, { score: at.score, total: at.total });
    }
  }

  const rows: CompanyReportRow[] = assignments.map((a) => {
    const member = a.organization_members as unknown as {
      user_id: string | null;
      invited_email: string | null;
    } | null;
    const course = a.courses as unknown as { title: string } | null;
    const userId = member?.user_id ?? null;

    const courseLessons = courseToLessons.get(a.course_id) ?? [];
    const totalLessons = courseLessons.length;

    const userCompleted = userId ? completedByUser.get(userId) : undefined;
    const completedLessons = courseLessons.filter((lid) => userCompleted?.has(lid)).length;
    const completionPct =
      totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    const quizLessons = courseLessons.filter((lid) => quizLessonSet.has(lid));
    const quizzesTotal = quizLessons.length;
    const userAttempts = userId ? attemptsByUser.get(userId) : undefined;
    let sumScore = 0;
    let sumTotal = 0;
    let taken = 0;
    for (const lid of quizLessons) {
      const at = userAttempts?.get(lid);
      if (at) {
        sumScore += at.score;
        sumTotal += at.total;
        taken++;
      }
    }
    const quizScorePct = sumTotal > 0 ? Math.round((sumScore / sumTotal) * 100) : null;

    return {
      email: member?.invited_email ?? "—",
      courseTitle: course?.title ?? "—",
      dueAt: a.due_at,
      completedLessons,
      totalLessons,
      completionPct,
      quizzesTaken: taken,
      quizzesTotal,
      quizScorePct,
    };
  });

  rows.sort(
    (x, y) => x.email.localeCompare(y.email) || x.courseTitle.localeCompare(y.courseTitle)
  );
  return rows;
}

// RFC-4180-ish CSV: quote every field, double internal quotes.
export function reportToCsv(rows: CompanyReportRow[]): string {
  const header = [
    "Employee",
    "Course",
    "Due date",
    "Completion %",
    "Lessons completed",
    "Lessons total",
    "Quiz score %",
    "Quizzes taken",
    "Quizzes total",
  ];
  const esc = (v: string | number | null) => `"${String(v ?? "").replace(/"/g, '""')}"`;

  const lines = [header.map(esc).join(",")];
  for (const r of rows) {
    lines.push(
      [
        r.email,
        r.courseTitle,
        r.dueAt ? new Date(r.dueAt).toLocaleDateString("en-GB") : "",
        r.completionPct,
        r.completedLessons,
        r.totalLessons,
        r.quizScorePct ?? "",
        r.quizzesTaken,
        r.quizzesTotal,
      ]
        .map(esc)
        .join(",")
    );
  }
  return lines.join("\r\n");
}
