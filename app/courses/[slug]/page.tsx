import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Clock, BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import EnrollButton from "@/components/course/EnrollButton";

export default async function CourseSlugPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ enrolled?: string }>;
}) {
  const { slug } = await params;
  const { enrolled: enrolledParam } = await searchParams;
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!course) notFound();

  const { data: modules } = await supabase
    .from("modules")
    .select("*, lessons(*)")
    .eq("course_id", course.id)
    .order("position")
    .order("position", { referencedTable: "lessons" });

  const { data: { user } } = await supabase.auth.getUser();

  let isEnrolled = false;
  let firstLessonSlug: string | null = null;

  if (user) {
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", course.id)
      .maybeSingle();
    isEnrolled = !!enrollment || enrolledParam === "true";
  }

  const allLessons = (modules ?? []).flatMap((m) => m.lessons ?? []);
  if (allLessons.length > 0) {
    firstLessonSlug = allLessons[0].slug;
  }

  const totalLessons = allLessons.length;
  const totalDuration = allLessons.reduce((sum, l) => sum + (l.duration ?? 0), 0);

  return (
    <div className="min-h-screen bg-n-0">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <Link
          href="/courses"
          className="inline-flex items-center gap-1 text-sm text-n-500 hover:text-n-900 mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Course catalog
        </Link>

        {course.thumbnail_url && (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="w-full h-52 object-cover rounded-md mb-6 border border-n-200"
          />
        )}

        <h1 className="text-2xl font-semibold text-n-900 tracking-tight mb-2">{course.title}</h1>

        {course.description && (
          <p className="text-sm text-n-600 mb-4 leading-relaxed">{course.description}</p>
        )}

        <div className="flex items-center gap-5 text-xs text-n-500 mb-6">
          {totalLessons > 0 && (
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              {totalLessons} lesson{totalLessons === 1 ? "" : "s"}
            </span>
          )}
          {totalDuration > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {Math.round(totalDuration / 60)} min
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 mb-8">
          <p className="text-xl font-semibold text-n-900">
            {course.price === 0 ? "Free" : `${course.price} UAH`}
          </p>
          <EnrollButton
            courseId={course.id}
            isEnrolled={isEnrolled}
            firstLessonSlug={firstLessonSlug}
            isLoggedIn={!!user}
          />
        </div>

        {(modules ?? []).length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-n-700 uppercase tracking-wide mb-3">
              Curriculum
            </h2>
            <div className="space-y-2">
              {(modules ?? []).map((module) => (
                <div key={module.id} className="border border-n-200 rounded-md overflow-hidden">
                  <div className="px-4 py-2.5 bg-n-50 text-sm font-semibold text-n-800">
                    {module.title}
                  </div>
                  {(module.lessons ?? []).length > 0 && (
                    <ul className="divide-y divide-n-100">
                      {(module.lessons ?? []).map((lesson: { id: string; title: string; duration: number | null }) => (
                        <li key={lesson.id} className="px-4 py-2 flex items-center justify-between text-sm text-n-700">
                          <span>{lesson.title}</span>
                          {lesson.duration && (
                            <span className="text-xs text-n-400">
                              {Math.round(lesson.duration / 60)} min
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
