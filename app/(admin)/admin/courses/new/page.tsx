import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import CourseForm from "@/components/course/CourseForm";

export default function NewCoursePage() {
  return (
    <div className="p-8 max-w-2xl">
      <Link
        href="/admin/courses"
        className="inline-flex items-center gap-1 text-sm text-n-500 hover:text-n-900 mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to courses
      </Link>
      <h1 className="text-xl font-semibold text-n-900 tracking-tight mb-6">New course</h1>
      <CourseForm />
    </div>
  );
}
