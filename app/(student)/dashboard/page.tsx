import Link from "next/link";
import { BookOpen, Award } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Progress } from "@/components/ui/progress";
import ProfileNameForm from "@/components/profile/ProfileNameForm";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user!.id)
    .maybeSingle();

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("course_id, enrolled_at, courses(id, slug, title, thumbnail_url)")
    .eq("user_id", user!.id)
    .order("enrolled_at", { ascending: false });

  // B2B: courses assigned by the user's company
  const { data: assignments } = await supabase
    .from("course_assignments")
    .select(
      "course_id, due_at, courses(id, slug, title, thumbnail_url), organization_members!inner(user_id)"
    )
    .eq("organization_members.user_id", user!.id)
    .order("created_at", { ascending: false });

  type CourseInfo = {
    id: string;
    slug: string;
    title: string;
    thumbnail_url: string | null;
  } | null;

  // Merge: assignments first (they carry a deadline), then self-enrollments
  const myCourses: { courseId: string; course: CourseInfo; dueAt: string | null; assigned: boolean }[] = [];
  const seen = new Set<string>();
  for (const a of assignments ?? []) {
    if (seen.has(a.course_id)) continue;
    seen.add(a.course_id);
    myCourses.push({
      courseId: a.course_id,
      course: a.courses as unknown as CourseInfo,
      dueAt: a.due_at,
      assigned: true,
    });
  }
  for (const e of enrollments ?? []) {
    if (seen.has(e.course_id)) continue;
    seen.add(e.course_id);
    myCourses.push({
      courseId: e.course_id,
      course: e.courses as unknown as CourseInfo,
      dueAt: null,
      assigned: false,
    });
  }

  const courseIds = myCourses.map((c) => c.courseId);

  type LessonRow = { id: string; slug: string };
  type ModuleRow = { course_id: string; lessons: LessonRow[] };

  const progressByCourse: Record<string, { total: number; completed: number }> = {};
  const continueSlugs: Record<string, string | null> = {};

  if (courseIds.length > 0) {
    const { data: modules } = await supabase
      .from("modules")
      .select("course_id, position, lessons(id, slug, position)")
      .in("course_id", courseIds)
      .order("position")
      .order("position", { referencedTable: "lessons" });

    const typedModules = (modules ?? []) as unknown as ModuleRow[];
    const allLessonIds = typedModules.flatMap((m) => m.lessons.map((l) => l.id));

    const { data: progressRows } = await supabase
      .from("lesson_progress")
      .select("lesson_id, completed")
      .eq("user_id", user!.id)
      .in("lesson_id", allLessonIds);

    const completedSet = new Set(
      (progressRows ?? []).filter((p) => p.completed).map((p) => p.lesson_id)
    );

    // Group lessons by course in order
    const lessonsByCourse: Record<string, LessonRow[]> = {};
    for (const mod of typedModules) {
      if (!lessonsByCourse[mod.course_id]) lessonsByCourse[mod.course_id] = [];
      lessonsByCourse[mod.course_id].push(...mod.lessons);
    }

    for (const cid of courseIds) {
      const lessons = lessonsByCourse[cid] ?? [];
      progressByCourse[cid] = { total: lessons.length, completed: 0 };
      for (const l of lessons) {
        if (completedSet.has(l.id)) progressByCourse[cid].completed += 1;
      }
      const firstUnfinished = lessons.find((l) => !completedSet.has(l.id));
      continueSlugs[cid] = firstUnfinished?.slug ?? lessons[0]?.slug ?? null;
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-n-900 tracking-tight">My courses</h1>
        <p className="text-sm text-n-500 mt-0.5">{user?.email}</p>
        <div className="mt-4">
          <ProfileNameForm initialName={profile?.full_name ?? ""} />
        </div>
      </div>

      {myCourses.length === 0 ? (
        <div className="text-center py-20 border border-n-200 rounded-md">
          <BookOpen className="w-8 h-8 text-n-300 mx-auto mb-3" />
          <p className="text-sm text-n-500">You are not enrolled in any course yet</p>
          <Link
            href="/courses"
            className="mt-4 inline-flex items-center px-4 py-2 rounded-sm bg-lms-accent text-white text-sm font-semibold hover:bg-lms-accent-600 transition-colors"
          >
            Browse catalog
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {myCourses.map(({ courseId, course, dueAt, assigned }) => {
            if (!course) return null;

            const prog = progressByCourse[courseId] ?? { total: 0, completed: 0 };
            const pct = prog.total > 0 ? Math.round((prog.completed / prog.total) * 100) : 0;
            const continueSlug = continueSlugs[courseId];
            const learnHref = continueSlug ? `/learn/${continueSlug}` : `/courses/${course.slug}`;
            const overdue = dueAt && pct < 100 && new Date(dueAt) < new Date();

            return (
              <div
                key={courseId}
                className="flex gap-4 border border-n-200 rounded-md p-4 shadow-1"
              >
                {course.thumbnail_url ? (
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-20 h-16 object-cover rounded-sm flex-shrink-0"
                  />
                ) : (
                  <div className="w-20 h-16 bg-n-100 rounded-sm flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-sm font-semibold text-n-900 truncate">{course.title}</h2>
                    {assigned && (
                      <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-xs bg-lms-accent-50 text-lms-accent flex-shrink-0">
                        Assigned
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Progress value={pct} className="h-1.5 flex-1" />
                    <span className="text-xs text-n-500 flex-shrink-0">{pct}%</span>
                  </div>
                  <p className="text-xs text-n-400 mb-3">
                    {prog.completed} / {prog.total} lessons completed
                    {dueAt && (
                      <span className={overdue ? "text-danger font-semibold" : ""}>
                        {" "}· due {new Date(dueAt).toLocaleDateString("en-GB")}
                      </span>
                    )}
                  </p>
                  <div className="flex items-center gap-2">
                    <Link
                      href={learnHref}
                      className="inline-flex items-center px-3 py-1.5 rounded-sm bg-lms-accent text-white text-xs font-semibold hover:bg-lms-accent-600 transition-colors"
                    >
                      {pct === 100 ? "Review" : "Continue →"}
                    </Link>
                    {pct === 100 && (
                      <a
                        href={`/api/certificate?courseId=${courseId}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-sm border border-n-200 text-n-700 text-xs font-semibold hover:bg-n-50 transition-colors"
                      >
                        <Award className="w-3.5 h-3.5" />
                        Certificate
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
