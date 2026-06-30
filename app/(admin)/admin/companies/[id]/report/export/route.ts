import { getCompanyReport, reportToCsv } from "@/lib/reports/company-report";

// Access is gated by proxy.ts (this path is under /admin → platform admins only).
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const report = await getCompanyReport(id);

  if (!report.orgName) {
    return new Response("Not found", { status: 404 });
  }

  const slug =
    report.orgName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "company";
  const date = report.generatedAt.slice(0, 10);
  const filename = `report-${slug}-${date}.csv`;

  // Prepend a UTF-8 BOM so Excel opens non-ASCII employee names correctly.
  const body = "﻿" + reportToCsv(report);

  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
