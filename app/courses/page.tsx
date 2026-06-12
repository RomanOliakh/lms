import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Tables } from "@/types/supabase";

type Course = Tables<"courses">;

function formatPrice(price: number) {
  if (price === 0) return "Free";
  return `${price} UAH`;
}

export default async function CoursesPage() {
  const supabase = await createClient();

  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-n-0">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-semibold text-n-900 tracking-tight mb-2">Course catalog</h1>
        <p className="text-sm text-n-500 mb-8">Pick a course and start learning</p>

        {!courses || courses.length === 0 ? (
          <div className="text-center py-20 text-n-400">
            <p className="text-base">No courses yet</p>
            <p className="text-sm mt-1">Contact your administrator</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((course: Course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CourseCard({ course }: { course: Course }) {
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group block border border-n-200 rounded-md bg-n-0 shadow-1 hover:shadow-2 transition-shadow overflow-hidden"
    >
      {course.thumbnail_url ? (
        <img
          src={course.thumbnail_url}
          alt={course.title}
          className="w-full h-40 object-cover"
        />
      ) : (
        <div className="w-full h-40 bg-n-100 flex items-center justify-center text-n-400 text-sm">
          No cover image
        </div>
      )}
      <div className="p-4">
        <h2 className="text-sm font-semibold text-n-900 tracking-tight mb-1 group-hover:text-lms-accent transition-colors line-clamp-2">
          {course.title}
        </h2>
        {course.description && (
          <p className="text-xs text-n-500 line-clamp-2 mb-3">{course.description}</p>
        )}
        <p className="text-sm font-semibold text-lms-accent">{formatPrice(course.price)}</p>
      </div>
    </Link>
  );
}
