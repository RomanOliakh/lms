import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import CompanyForm from "@/components/company/CompanyForm";
import DeleteCompanyButton from "@/components/company/DeleteCompanyButton";
import InviteEmployeeForm from "@/components/company/InviteEmployeeForm";
import RevokeInviteButton from "@/components/company/RevokeInviteButton";

const ORG_ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  company_admin: "Company admin",
  manager: "Manager",
  instructor: "Instructor",
  learner: "Learner",
};

export default async function EditCompanyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: organization } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", id)
    .single();

  if (!organization) notFound();

  const { data: members } = await supabase
    .from("organization_members")
    .select("*")
    .eq("org_id", id)
    .order("created_at");

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/admin/companies"
          className="inline-flex items-center gap-1 text-sm text-n-500 hover:text-n-900"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to companies
        </Link>
        <DeleteCompanyButton organizationId={id} />
      </div>

      <h1 className="text-xl font-semibold text-n-900 tracking-tight mb-6">
        {organization.name}
      </h1>

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-n-700 uppercase tracking-wide mb-4">
          General
        </h2>
        <CompanyForm organization={organization} />
      </section>

      <Separator className="my-8 bg-n-200" />

      <section>
        <h2 className="text-sm font-semibold text-n-700 uppercase tracking-wide mb-4">
          Employees ({members?.length ?? 0}
          {organization.seat_limit > 0 ? ` / ${organization.seat_limit}` : ""})
        </h2>

        <div className="mb-6">
          <InviteEmployeeForm orgId={id} />
        </div>

        {!members?.length ? (
          <div className="border border-dashed border-n-200 rounded-md p-8 text-center">
            <p className="text-sm text-n-400">
              No employees yet. Invite someone by email above.
            </p>
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
                    <td className="px-4 py-3 text-n-900">
                      {member.invited_email ?? "—"}
                    </td>
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
                        <RevokeInviteButton memberId={member.id} orgId={id} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
