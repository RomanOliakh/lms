import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import LessonPlayer from "@/components/lesson/LessonPlayer";

export default async function LearnPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: lesson } = await supabase
    .from("lessons")
    .select("*, modules(course_id, courses(slug, title))")
    .eq("slug", slug)
    .single();

  if (!lesson) notFound();

  const moduleData = lesson.modules as { course_id: string; courses: { slug: string; title: string } | null } | null;
  const courseId = moduleData?.course_id;
  const courseSlug = moduleData?.courses?.slug;
  const courseTitle = moduleData?.courses?.title;

  if (!courseId || !courseSlug) notFound();

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .maybeSingle();

  if (!enrollment) redirect(`/courses/${courseSlug}`);

  const { data: modules } = await supabase
    .from("modules")
    .select("id, position, title, lessons(id, slug, title, position)")
    .eq("course_id", courseId)
    .order("position")
    .order("position", { referencedTable: "lessons" });

  const allLessons = (modules ?? []).flatMap((m) => m.lessons ?? []);
  const currentIndex = allLessons.findIndex((l) => l.slug === slug);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("completed, watch_time")
    .eq("user_id", user.id)
    .eq("lesson_id", lesson.id)
    .maybeSingle();

  return (
    <div className="min-h-screen bg-n-0">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <Link
          href={`/courses/${courseSlug}`}
          className="inline-flex items-center gap-1 text-sm text-n-500 hover:text-n-900 mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          {courseTitle ?? "Курс"}
        </Link>

        <h1 className="text-xl font-semibold text-n-900 tracking-tight mb-6">{lesson.title}</h1>

        <LessonPlayer
          lessonId={lesson.id}
          type={lesson.type}
          videoUrl={lesson.video_url}
          content={lesson.content}
          initialCompleted={progress?.completed ?? false}
        />

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-n-200">
          {prevLesson ? (
            <Link
              href={`/learn/${prevLesson.slug}`}
              className="inline-flex items-center gap-1 text-sm text-n-600 hover:text-n-900"
            >
              <ChevronLeft className="w-4 h-4" />
              {prevLesson.title}
            </Link>
          ) : (
            <div />
          )}
          {nextLesson ? (
            <Link
              href={`/learn/${nextLesson.slug}`}
              className="inline-flex items-center gap-1 text-sm text-n-600 hover:text-n-900"
            >
              {nextLesson.title}
              <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
  );
}
