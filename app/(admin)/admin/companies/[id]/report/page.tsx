import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Download } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { buildCompanyReport } from "@/lib/reports/company-report";

export const dynamic = "force-dynamic";

export default async function CompanyReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: organization } = await supabase
    .from("organizations")
    .select("name")
    .eq("id", id)
    .single();

  if (!organization) notFound();

  const rows = await buildCompanyReport(supabase, id);

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <Link
          href={`/admin/companies/${id}`}
          className="inline-flex items-center gap-1 text-sm text-n-500 hover:text-n-900"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to company
        </Link>
        {rows.length > 0 && (
          <Link
            href={`/admin/companies/${id}/report/export`}
            prefetch={false}
            className="inline-flex items-center gap-1.5 rounded-sm bg-lms-accent px-3 py-2 text-sm font-medium text-white hover:bg-lms-accent-600"
          >
            <Download className="w-4 h-4" />
            Download CSV
          </Link>
        )}
      </div>

      <h1 className="text-xl font-semibold text-n-900 tracking-tight mb-1">
        Training report
      </h1>
      <p className="text-sm text-n-500 mb-6">
        {organization.name} — completion across assigned courses
      </p>

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
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-n-200 last:border-0">
                  <td className="px-4 py-3 text-n-900">{r.email}</td>
                  <td className="px-4 py-3 text-n-700">{r.courseTitle}</td>
                  <td className="px-4 py-3 text-n-700">
                    {r.dueAt ? new Date(r.dueAt).toLocaleDateString("en-GB") : "—"}
                  </td>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
