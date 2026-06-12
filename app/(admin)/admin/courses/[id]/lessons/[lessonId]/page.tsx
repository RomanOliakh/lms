import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Separator } from "@/components/ui/separator";
import LessonForm from "@/components/lesson/LessonForm";
import QuizBuilder from "@/components/quiz/QuizBuilder";
import { Tables } from "@/types/supabase";

type Question = Tables<"quiz_questions"> & { quiz_options: Tables<"quiz_options">[] };

export default async function EditLessonPage({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>;
}) {
  const { id: courseId, lessonId } = await params;
  const supabase = await createClient();

  const { data: lesson } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", lessonId)
    .single();

  if (!lesson) notFound();

  const { data: questions } = await supabase
    .from("quiz_questions")
    .select("*, quiz_options(*)")
    .eq("lesson_id", lessonId)
    .order("position")
    .order("position", { referencedTable: "quiz_options" });

  return (
    <div className="p-8 max-w-2xl">
      <Link
        href={`/admin/courses/${courseId}`}
        className="inline-flex items-center gap-1 text-sm text-n-500 hover:text-n-900 mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to course
      </Link>

      <h1 className="text-xl font-semibold text-n-900 tracking-tight mb-6">{lesson.title}</h1>

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-n-700 uppercase tracking-wide mb-4">
          Lesson
        </h2>
        <LessonForm lesson={lesson} courseId={courseId} />
      </section>

      <Separator className="my-8 bg-n-200" />

      <section>
        <h2 className="text-sm font-semibold text-n-700 uppercase tracking-wide mb-4">
          Quiz
        </h2>
        <QuizBuilder
          lessonId={lessonId}
          courseId={courseId}
          questions={(questions ?? []) as Question[]}
        />
      </section>
    </div>
  );
}
