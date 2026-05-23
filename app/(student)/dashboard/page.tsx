import Link from "next/link";
import { BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Progress } from "@/components/ui/progress";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("course_id, enrolled_at, courses(id, slug, title, thumbnail_url)")
    .eq("user_id", user!.id)
    .order("enrolled_at", { ascending: false });

  const courseIds = (enrollments ?? []).map((e) => e.course_id);

  type LessonRow = { id: string; slug: string };
  type ModuleRow = { course_id: string; lessons: LessonRow[] };

  let progressByCourse: Record<string, { total: number; completed: number }> = {};
  let continueSlugs: Record<string, string | null> = {};

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
    for (const module of typedModules) {
      if (!lessonsByCourse[module.course_id]) lessonsByCourse[module.course_id] = [];
      lessonsByCourse[module.course_id].push(...module.lessons);
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
        <h1 className="text-xl font-semibold text-n-900 tracking-tight">Мої курси</h1>
        <p className="text-sm text-n-500 mt-0.5">{user?.email}</p>
      </div>

      {!enrollments || enrollments.length === 0 ? (
        <div className="text-center py-20 border border-n-200 rounded-md">
          <BookOpen className="w-8 h-8 text-n-300 mx-auto mb-3" />
          <p className="text-sm text-n-500">Ви ще не записані на жоден курс</p>
          <Link
            href="/courses"
            className="mt-4 inline-flex items-center px-4 py-2 rounded-sm bg-lms-accent text-white text-sm font-semibold hover:bg-lms-accent-600 transition-colors"
          >
            Переглянути каталог
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {enrollments.map((enrollment) => {
            const course = enrollment.courses as unknown as {
              id: string;
              slug: string;
              title: string;
              thumbnail_url: string | null;
            } | null;
            if (!course) return null;

            const prog = progressByCourse[enrollment.course_id] ?? { total: 0, completed: 0 };
            const pct = prog.total > 0 ? Math.round((prog.completed / prog.total) * 100) : 0;
            const continueSlug = continueSlugs[enrollment.course_id];
            const learnHref = continueSlug ? `/learn/${continueSlug}` : `/courses/${course.slug}`;

            return (
              <div
                key={enrollment.course_id}
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
                  <h2 className="text-sm font-semibold text-n-900 truncate mb-1">{course.title}</h2>
                  <div className="flex items-center gap-2 mb-2">
                    <Progress value={pct} className="h-1.5 flex-1" />
                    <span className="text-xs text-n-500 flex-shrink-0">{pct}%</span>
                  </div>
                  <p className="text-xs text-n-400 mb-3">
                    {prog.completed} / {prog.total} уроків завершено
                  </p>
                  <Link
                    href={learnHref}
                    className="inline-flex items-center px-3 py-1.5 rounded-sm bg-lms-accent text-white text-xs font-semibold hover:bg-lms-accent-600 transition-colors"
                  >
                    {pct === 100 ? "Переглянути" : "Продовжити →"}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
