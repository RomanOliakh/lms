import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildCompanyReport, reportToCsv } from "@/lib/reports/company-report";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Authorize via RLS: the org row is only visible to a platform admin or a member
  // of that org, so a missing row means the caller may not read this org's report.
  const { data: organization } = await supabase
    .from("organizations")
    .select("slug")
    .eq("id", id)
    .maybeSingle();
  if (!organization) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rows = await buildCompanyReport(supabase, id);
  const csv = reportToCsv(rows);
  const date = new Date().toISOString().slice(0, 10);
  const filename = `report-${organization.slug ?? id}-${date}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
