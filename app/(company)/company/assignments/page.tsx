import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminOrg } from "@/lib/company/context";
import { formatDueDate } from "@/lib/reports/company-report";
import AssignCourseForm from "@/components/company/AssignCourseForm";
import UnassignButton from "@/components/company/UnassignButton";

export const dynamic = "force-dynamic";

export default async function CompanyAssignmentsPage() {
  const org = await getAdminOrg();
  if (!org) redirect("/dashboard");
  const supabase = await createClient();

  const { data: members } = await supabase
    .from("organization_members")
    .select("id, invited_email, status, user_id")
    .eq("org_id", org.id)
    .order("created_at");

  const { data: courses } = await supabase
    .from("courses")
    .select("id, title")
    .eq("is_published", true)
    .order("title");

  const { data: assignments } = await supabase
    .from("course_assignments")
    .select("id, due_at, created_at, courses(title), organization_members(invited_email)")
    .eq("org_id", org.id)
    .order("created_at", { ascending: false });

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-xl font-semibold text-n-900 tracking-tight mb-1">Course assignments</h1>
      <p className="text-sm text-n-500 mb-6">Assign training to your employees</p>

      {assignments && assignments.length > 0 && (
        <div className="border border-n-200 rounded-md overflow-hidden shadow-1 mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-n-200 bg-n-50">
                <th className="text-left px-4 py-3 text-n-600 font-medium">Course</th>
                <th className="text-left px-4 py-3 text-n-600 font-medium">Employee</th>
                <th className="text-left px-4 py-3 text-n-600 font-medium">Deadline</th>
                <th scope="col" className="px-4 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => {
                const course = a.courses as unknown as { title: string } | null;
                const member = a.organization_members as unknown as {
                  invited_email: string | null;
                } | null;
                return (
                  <tr key={a.id} className="border-b border-n-200 last:border-0">
                    <td className="px-4 py-3 text-n-900">{course?.title ?? "—"}</td>
                    <td className="px-4 py-3 text-n-700">{member?.invited_email ?? "—"}</td>
                    <td className="px-4 py-3 text-n-700">
                      {a.due_at ? formatDueDate(a.due_at) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <UnassignButton assignmentId={a.id} orgId={org.id} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <AssignCourseForm
        orgId={org.id}
        courses={courses ?? []}
        members={(members ?? [])
          .filter((m) => m.status === "active" && m.user_id && m.invited_email)
          .map((m) => ({ id: m.id, email: m.invited_email as string }))}
      />
    </div>
  );
}
