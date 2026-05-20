import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tables } from "@/types/supabase";

type Course = Tables<"courses">;

export default async function CoursesPage() {
  const supabase = await createClient();
  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-n-900 tracking-tight">Курси</h1>
          <p className="text-sm text-n-400 mt-0.5">
            {courses?.length ?? 0} курс{(courses?.length ?? 0) !== 1 ? "ів" : ""}
          </p>
        </div>
        <Link
          href="/admin/courses/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-medium bg-lms-accent hover:bg-lms-accent-600 text-white transition-colors"
        >
          <Plus className="w-4 h-4" />
          Новий курс
        </Link>
      </div>

      {!courses?.length ? (
        <div className="border border-dashed border-n-200 rounded-md p-12 text-center">
          <p className="text-sm text-n-400">Ще немає курсів. Створіть перший!</p>
        </div>
      ) : (
        <div className="border border-n-200 rounded-md overflow-hidden shadow-1">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-n-200 bg-n-50">
                <th className="text-left px-4 py-3 text-n-600 font-medium">Назва</th>
                <th className="text-left px-4 py-3 text-n-600 font-medium">Slug</th>
                <th className="text-left px-4 py-3 text-n-600 font-medium">Ціна</th>
                <th className="text-left px-4 py-3 text-n-600 font-medium">Статус</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {courses.map((course: Course) => (
                <tr key={course.id} className="border-b border-n-200 last:border-0 hover:bg-n-50">
                  <td className="px-4 py-3 text-n-900 font-medium">{course.title}</td>
                  <td className="px-4 py-3 text-n-500 font-mono text-xs">{course.slug}</td>
                  <td className="px-4 py-3 text-n-700">
                    {course.price === 0 ? "Безкоштовно" : `₴${course.price}`}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={course.is_published ? "default" : "secondary"}
                      className={
                        course.is_published
                          ? "bg-success/10 text-success border-success/20"
                          : "bg-n-100 text-n-500 border-n-200"
                      }
                    >
                      {course.is_published ? "Опубліковано" : "Чернетка"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/courses/${course.id}`}
                      className="text-lms-accent hover:text-lms-accent-600 text-sm font-medium"
                    >
                      Редагувати
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
