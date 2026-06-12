import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Separator } from "@/components/ui/separator";
import CourseForm from "@/components/course/CourseForm";
import CurriculumEditor from "@/components/course/CurriculumEditor";
import DeleteCourseButton from "@/components/course/DeleteCourseButton";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .single();

  if (!course) notFound();

  const { data: modules } = await supabase
    .from("modules")
    .select("*, lessons(*)")
    .eq("course_id", id)
    .order("position")
    .order("position", { referencedTable: "lessons" });

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/admin/courses"
          className="inline-flex items-center gap-1 text-sm text-n-500 hover:text-n-900"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to courses
        </Link>
        <DeleteCourseButton courseId={id} />
      </div>

      <h1 className="text-xl font-semibold text-n-900 tracking-tight mb-6">{course.title}</h1>

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-n-700 uppercase tracking-wide mb-4">
          General
        </h2>
        <CourseForm course={course} />
      </section>

      <Separator className="my-8 bg-n-200" />

      <section>
        <h2 className="text-sm font-semibold text-n-700 uppercase tracking-wide mb-4">
          Curriculum
        </h2>
        <CurriculumEditor
          courseId={id}
          modules={(modules ?? []) as Parameters<typeof CurriculumEditor>[0]["modules"]}
        />
      </section>
    </div>
  );
}
