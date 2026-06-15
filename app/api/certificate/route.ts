import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getCertificateData } from "@/lib/certificate/data";
import { renderCertificate } from "@/lib/certificate/document";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const courseId = request.nextUrl.searchParams.get("courseId");
  const userIdParam = request.nextUrl.searchParams.get("userId");
  if (!courseId) {
    return NextResponse.json({ error: "courseId is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const targetUserId = userIdParam ?? user.id;
  const service = createServiceClient();

  // A learner may only download their own certificate; an admin may download a
  // certificate for an employee in an org they administer (platform admin: any).
  if (targetUserId !== user.id) {
    const authorized = await callerCanIssueFor(
      supabase,
      service,
      user.id,
      targetUserId,
      courseId
    );
    if (!authorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const data = await getCertificateData(service, targetUserId, courseId);
  if (!data) {
    return NextResponse.json(
      { error: "Certificate not available — course is not 100% complete" },
      { status: 403 }
    );
  }

  const pdf = await renderCertificate(data);
  const filename = `certificate-${slugify(data.courseTitle)}.pdf`;

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

async function callerCanIssueFor(
  supabase: Awaited<ReturnType<typeof createClient>>,
  service: ReturnType<typeof createServiceClient>,
  callerId: string,
  targetUserId: string,
  courseId: string
): Promise<boolean> {
  // Platform admin → full access.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", callerId)
    .maybeSingle();
  if (profile?.role === "admin") return true;

  // Company admin → only for an active employee who was ASSIGNED this exact course
  // in an org the caller administers (keeps delegation inside the report scope).
  const { data: adminOrgs } = await service
    .from("organization_members")
    .select("org_id")
    .eq("user_id", callerId)
    .eq("status", "active")
    .in("org_role", ["company_admin", "owner"]);
  if (!adminOrgs?.length) return false;

  const adminOrgIds = adminOrgs.map((o) => o.org_id);
  const { data: scopedAssignments } = await service
    .from("course_assignments")
    .select("org_id, organization_members!inner(user_id, status)")
    .eq("course_id", courseId)
    .eq("organization_members.user_id", targetUserId)
    .eq("organization_members.status", "active")
    .in("org_id", adminOrgIds)
    .limit(1);

  return Boolean(scopedAssignments?.length);
}

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "course"
  );
}
