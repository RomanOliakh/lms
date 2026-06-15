import Link from "next/link";
import { redirect } from "next/navigation";
import { Users, BookOpenCheck, BarChart3 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getAdminOrg } from "@/lib/company/context";

export const dynamic = "force-dynamic";

export default async function CompanyDashboardPage() {
  const org = await getAdminOrg();
  if (!org) redirect("/dashboard");
  const supabase = await createClient();

  const [
    { data: members, error: membersError },
    { count: assignmentCount, error: assignmentsError },
  ] = await Promise.all([
    supabase.from("organization_members").select("status").eq("org_id", org.id),
    supabase
      .from("course_assignments")
      .select("id", { count: "exact", head: true })
      .eq("org_id", org.id),
  ]);
  if (membersError || assignmentsError) {
    throw new Error(
      membersError?.message ?? assignmentsError?.message ?? "Failed to load dashboard metrics"
    );
  }

  const total = members?.length ?? 0;
  const active = (members ?? []).filter((m) => m.status === "active").length;
  const invited = (members ?? []).filter((m) => m.status === "invited").length;
  const seatLabel = org.seat_limit > 0 ? `${total} / ${org.seat_limit}` : `${total}`;

  const cards = [
    { label: "Seats used", value: seatLabel, href: "/company/employees", icon: Users },
    { label: "Active employees", value: String(active), href: "/company/employees", icon: Users },
    { label: "Pending invites", value: String(invited), href: "/company/employees", icon: Users },
    { label: "Course assignments", value: String(assignmentCount ?? 0), href: "/company/assignments", icon: BookOpenCheck },
  ];

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-xl font-semibold text-n-900 tracking-tight mb-1">{org.name}</h1>
      <p className="text-sm text-n-500 mb-6">Manage your team&apos;s training</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="border border-n-200 rounded-md p-4 shadow-1 hover:border-n-300 transition-colors"
          >
            <c.icon className="w-4 h-4 text-n-400 mb-2" />
            <div className="text-2xl font-semibold text-n-900">{c.value}</div>
            <div className="text-xs text-n-500 mt-0.5">{c.label}</div>
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/company/employees" className="inline-flex items-center gap-1.5 rounded-sm bg-lms-accent px-3 py-2 text-sm font-medium text-white hover:bg-lms-accent-600">
          <Users className="w-4 h-4" /> Invite employees
        </Link>
        <Link href="/company/assignments" className="inline-flex items-center gap-1.5 rounded-sm border border-n-200 px-3 py-2 text-sm font-medium text-n-700 hover:bg-n-50">
          <BookOpenCheck className="w-4 h-4" /> Assign a course
        </Link>
        <Link href="/company/report" className="inline-flex items-center gap-1.5 rounded-sm border border-n-200 px-3 py-2 text-sm font-medium text-n-700 hover:bg-n-50">
          <BarChart3 className="w-4 h-4" /> View report
        </Link>
      </div>
    </div>
  );
}
