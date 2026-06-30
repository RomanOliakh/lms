import { createServiceClient } from "@/lib/supabase/service";

// Per-employee, per-assigned-course completion. Computed with the service-role
// client because RLS restricts lesson_progress to its own owner — a company
// report legitimately reads every assigned member's progress. The reading is
// always scoped to a single org's members, and the only caller (the /admin
// report page + export route) is gated to platform admins by proxy.ts.

export type ReportStatus =
  | "completed"
  | "in_progress"
  | "not_started"
  | "overdue";

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  completed: "Completed",
  in_progress: "In progress",
  not_started: "Not started",
  overdue: "Overdue",
};

export type CompanyReportRow = {
  employeeEmail: string;
  employeeStatus: string; // active | invited
  courseTitle: string;
  completedLessons: number;
  totalLessons: number;
  completionPct: number; // 0–100 (0 when the course has no lessons)
  dueAt: string | null;
  status: ReportStatus;
};

export type CompanyReport = {
  orgName: string;
  generatedAt: string; // ISO
  rows: CompanyReportRow[];
};

export async function getCompanyReport(orgId: string): Promise<CompanyReport> {
  const db = createServiceClient();
  const generatedAt = new Date().toISOString();

  const { data: org } = await db
    .from("organizations")
    .select("name")
    .eq("id", orgId)
    .single();

  const { data: members } = await db
    .from("organization_members")
    .select("id, invited_email, user_id, status")
    .eq("org_id", orgId);
  const memberById = new Map((members ?? []).map((m) => [m.id, m]));

  const { data: assignments } = await db
    .from("course_assignments")
    .select("member_id, course_id, due_at, courses(title)")
    .eq("org_id", orgId);

  if (!assignments || assignments.length === 0) {
    return { orgName: org?.name ?? "", generatedAt, rows: [] };
  }

  // Lesson ids per assigned course (courses → modules → lessons).
  const courseIds = [...new Set(assignments.map((a) => a.course_id))];
  const lessonsByCourse = new Map<string, string[]>(
    courseIds.map((id) => [id, []])
  );
  const { data: modules } = await db
    .from("modules")
    .select("course_id, lessons(id)")
    .in("course_id", courseIds);
  for (const m of modules ?? []) {
    const lessons = (m.lessons as { id: string }[] | null) ?? [];
    const bucket = lessonsByCourse.get(m.course_id);
    if (bucket) for (const l of lessons) bucket.push(l.id);
  }

  // Completed lessons per assigned member (by their auth user_id).
  const userIds = [
    ...new Set(
      assignments
        .map((a) => memberById.get(a.member_id)?.user_id)
        .filter((id): id is string => Boolean(id))
    ),
  ];
  const allLessonIds = [...new Set([...lessonsByCourse.values()].flat())];
  const completedByUser = new Map<string, Set<string>>();
  if (userIds.length > 0 && allLessonIds.length > 0) {
    const { data: progress } = await db
      .from("lesson_progress")
      .select("user_id, lesson_id")
      .eq("completed", true)
      .in("user_id", userIds)
      .in("lesson_id", allLessonIds);
    for (const p of progress ?? []) {
      let set = completedByUser.get(p.user_id);
      if (!set) {
        set = new Set();
        completedByUser.set(p.user_id, set);
      }
      set.add(p.lesson_id);
    }
  }

  const now = Date.now();
  const rows: CompanyReportRow[] = assignments.map((a) => {
    const member = memberById.get(a.member_id);
    const courseLessons = lessonsByCourse.get(a.course_id) ?? [];
    const total = courseLessons.length;
    const userId = member?.user_id ?? null;
    const completedSet = userId ? completedByUser.get(userId) : undefined;
    const completed = completedSet
      ? courseLessons.filter((id) => completedSet.has(id)).length
      : 0;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    const course = a.courses as unknown as { title: string } | null;

    let status: ReportStatus;
    if (total > 0 && completed === total) status = "completed";
    else if (a.due_at && new Date(a.due_at).getTime() < now) status = "overdue";
    else if (completed > 0) status = "in_progress";
    else status = "not_started";

    return {
      employeeEmail: member?.invited_email ?? "—",
      employeeStatus: member?.status ?? "—",
      courseTitle: course?.title ?? "—",
      completedLessons: completed,
      totalLessons: total,
      completionPct: pct,
      dueAt: a.due_at,
      status,
    };
  });

  rows.sort(
    (a, b) =>
      a.employeeEmail.localeCompare(b.employeeEmail) ||
      a.courseTitle.localeCompare(b.courseTitle)
  );

  return { orgName: org?.name ?? "", generatedAt, rows };
}

function csvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function reportToCsv(report: CompanyReport): string {
  const header = [
    "Employee",
    "Member status",
    "Course",
    "Completed lessons",
    "Total lessons",
    "Completion %",
    "Status",
    "Deadline",
  ];
  const lines = [header.map(csvCell).join(",")];
  for (const r of report.rows) {
    lines.push(
      [
        r.employeeEmail,
        r.employeeStatus,
        r.courseTitle,
        String(r.completedLessons),
        String(r.totalLessons),
        String(r.completionPct),
        REPORT_STATUS_LABELS[r.status],
        r.dueAt ? new Date(r.dueAt).toISOString().slice(0, 10) : "",
      ]
        .map(csvCell)
        .join(",")
    );
  }
  return lines.join("\r\n");
}
