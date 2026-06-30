import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  getCompanyReport,
  REPORT_STATUS_LABELS,
  type ReportStatus,
} from "@/lib/reports/company-report";

const STATUS_BADGE: Record<ReportStatus, string> = {
  completed: "bg-success/10 text-success border-success/20",
  in_progress: "bg-lms-accent-50 text-lms-accent border-lms-accent-100",
  not_started: "bg-n-100 text-n-500 border-n-200",
  overdue: "bg-danger/10 text-danger border-danger/20",
};

export default async function CompanyReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = await getCompanyReport(id);

  if (!report.orgName) notFound();

  const tracked = report.rows.length;
  const avg =
    tracked > 0
      ? Math.round(
          report.rows.reduce((s, r) => s + r.completionPct, 0) / tracked
        )
      : 0;
  const completedCount = report.rows.filter(
    (r) => r.status === "completed"
  ).length;

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
        {tracked > 0 && (
          <a
            href={`/admin/companies/${id}/report/export`}
            className="inline-flex items-center gap-2 rounded-sm border border-n-200 bg-n-0 px-3 py-2 text-sm font-medium text-n-700 shadow-1 hover:bg-n-50"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </a>
        )}
      </div>

      <h1 className="text-xl font-semibold text-n-900 tracking-tight">
        {report.orgName} — Completion report
      </h1>
      <p className="text-sm text-n-500 mt-1 mb-6">
        Generated {new Date(report.generatedAt).toLocaleString("en-GB")}
      </p>

      {tracked === 0 ? (
        <div className="border border-dashed border-n-200 rounded-md p-8 text-center">
          <p className="text-sm text-n-400">
            No course assignments yet — nothing to report. Assign a course on the
            company page first.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <SummaryCard label="Assignments tracked" value={String(tracked)} />
            <SummaryCard
              label="Completed"
              value={`${completedCount} / ${tracked}`}
            />
            <SummaryCard label="Average completion" value={`${avg}%`} />
          </div>

          <div className="border border-n-200 rounded-md overflow-hidden shadow-1">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-n-200 bg-n-50">
                  <th className="text-left px-4 py-3 text-n-600 font-medium">
                    Employee
                  </th>
                  <th className="text-left px-4 py-3 text-n-600 font-medium">
                    Course
                  </th>
                  <th className="text-left px-4 py-3 text-n-600 font-medium">
                    Progress
                  </th>
                  <th className="text-left px-4 py-3 text-n-600 font-medium">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-n-600 font-medium">
                    Deadline
                  </th>
                </tr>
              </thead>
              <tbody>
                {report.rows.map((r, i) => (
                  <tr
                    key={`${r.employeeEmail}-${r.courseTitle}-${i}`}
                    className="border-b border-n-200 last:border-0"
                  >
                    <td className="px-4 py-3 text-n-900">{r.employeeEmail}</td>
                    <td className="px-4 py-3 text-n-700">{r.courseTitle}</td>
                    <td className="px-4 py-3 text-n-700">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 rounded-full bg-n-100 overflow-hidden">
                          <div
                            className="h-full bg-lms-accent"
                            style={{ width: `${r.completionPct}%` }}
                          />
                        </div>
                        <span className="tabular-nums text-n-600">
                          {r.completedLessons}/{r.totalLessons} ·{" "}
                          {r.completionPct}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="secondary"
                        className={STATUS_BADGE[r.status]}
                      >
                        {REPORT_STATUS_LABELS[r.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-n-700">
                      {r.dueAt
                        ? new Date(r.dueAt).toLocaleDateString("en-GB")
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-n-200 rounded-md p-4 shadow-1">
      <p className="text-xs text-n-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-semibold text-n-900 tracking-tight mt-1">
        {value}
      </p>
    </div>
  );
}
