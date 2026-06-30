import Link from "next/link";
import { redirect } from "next/navigation";
import { Download } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getAdminOrg } from "@/lib/company/context";
import { buildCompanyReport, formatDueDate } from "@/lib/reports/company-report";

export const dynamic = "force-dynamic";

export default async function CompanyReportPage() {
  const org = await getAdminOrg();
  if (!org) redirect("/dashboard");
  const supabase = await createClient();

  const rows = await buildCompanyReport(supabase, org.id);

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-semibold text-n-900 tracking-tight">Training report</h1>
        {rows.length > 0 && (
          <Link
            href={`/api/companies/${org.id}/report/export`}
            prefetch={false}
            className="inline-flex items-center gap-1.5 rounded-sm bg-lms-accent px-3 py-2 text-sm font-medium text-white hover:bg-lms-accent-600"
          >
            <Download className="w-4 h-4" />
            Download CSV
          </Link>
        )}
      </div>
      <p className="text-sm text-n-500 mb-6">Completion across assigned courses</p>

      {rows.length === 0 ? (
        <div className="border border-dashed border-n-200 rounded-md p-8 text-center">
          <p className="text-sm text-n-400">
            No course assignments yet. Assign a course to employees to see their progress here.
          </p>
        </div>
      ) : (
        <div className="border border-n-200 rounded-md overflow-hidden shadow-1">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-n-200 bg-n-50">
                <th className="text-left px-4 py-3 text-n-600 font-medium">Employee</th>
                <th className="text-left px-4 py-3 text-n-600 font-medium">Course</th>
                <th className="text-left px-4 py-3 text-n-600 font-medium">Deadline</th>
                <th className="text-left px-4 py-3 text-n-600 font-medium">Completion</th>
                <th className="text-left px-4 py-3 text-n-600 font-medium">Quiz score</th>
                <th className="text-left px-4 py-3 text-n-600 font-medium">Certificate</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-n-200 last:border-0">
                  <td className="px-4 py-3 text-n-900">{r.email}</td>
                  <td className="px-4 py-3 text-n-700">{r.courseTitle}</td>
                  <td className="px-4 py-3 text-n-700">{r.dueAt ? formatDueDate(r.dueAt) : "—"}</td>
                  <td className="px-4 py-3 text-n-700">
                    {r.completionPct}%{" "}
                    <span className="text-n-400">
                      ({r.completedLessons}/{r.totalLessons})
                    </span>
                  </td>
                  <td className="px-4 py-3 text-n-700">
                    {r.quizzesTotal === 0 ? (
                      <span className="text-n-400">—</span>
                    ) : r.quizScorePct === null ? (
                      <span className="text-n-400">Not taken</span>
                    ) : (
                      <>
                        {r.quizScorePct}%{" "}
                        <span className="text-n-400">
                          ({r.quizzesTaken}/{r.quizzesTotal})
                        </span>
                      </>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {r.completionPct === 100 && r.userId ? (
                      <a
                        href={`/api/certificate?courseId=${r.courseId}&userId=${r.userId}`}
                        className="text-lms-accent hover:underline"
                      >
                        PDF
                      </a>
                    ) : (
                      <span className="text-n-400">—</span>
                    )}
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
