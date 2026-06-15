import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminOrg } from "@/lib/company/context";
import { Badge } from "@/components/ui/badge";
import InviteEmployeeForm from "@/components/company/InviteEmployeeForm";
import RevokeInviteButton from "@/components/company/RevokeInviteButton";

export const dynamic = "force-dynamic";

const ORG_ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  company_admin: "Company admin",
  manager: "Manager",
  instructor: "Instructor",
  learner: "Learner",
};

export default async function CompanyEmployeesPage() {
  const org = await getAdminOrg();
  if (!org) redirect("/dashboard");
  const supabase = await createClient();

  const { data: members } = await supabase
    .from("organization_members")
    .select("id, invited_email, org_role, status")
    .eq("org_id", org.id)
    .order("created_at");

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-xl font-semibold text-n-900 tracking-tight mb-1">Employees</h1>
      <p className="text-sm text-n-500 mb-6">
        {members?.length ?? 0}
        {org.seat_limit > 0 ? ` / ${org.seat_limit}` : ""} seats used
      </p>

      <div className="mb-6">
        <InviteEmployeeForm orgId={org.id} />
      </div>

      {!members?.length ? (
        <div className="border border-dashed border-n-200 rounded-md p-8 text-center">
          <p className="text-sm text-n-400">No employees yet. Invite someone by email above.</p>
        </div>
      ) : (
        <div className="border border-n-200 rounded-md overflow-hidden shadow-1">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-n-200 bg-n-50">
                <th className="text-left px-4 py-3 text-n-600 font-medium">Email</th>
                <th className="text-left px-4 py-3 text-n-600 font-medium">Role</th>
                <th className="text-left px-4 py-3 text-n-600 font-medium">Status</th>
                <th scope="col" className="px-4 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className="border-b border-n-200 last:border-0">
                  <td className="px-4 py-3 text-n-900">{member.invited_email ?? "—"}</td>
                  <td className="px-4 py-3 text-n-700">
                    {ORG_ROLE_LABELS[member.org_role] ?? member.org_role}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={member.status === "active" ? "default" : "secondary"}
                      className={
                        member.status === "active"
                          ? "bg-success/10 text-success border-success/20"
                          : "bg-n-100 text-n-500 border-n-200"
                      }
                    >
                      {member.status === "active" ? "Active" : "Invited"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {member.status === "invited" && (
                      <RevokeInviteButton memberId={member.id} orgId={org.id} />
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
