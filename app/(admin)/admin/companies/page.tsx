import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Tables } from "@/types/supabase";

type Organization = Tables<"organizations"> & {
  organization_members: { count: number }[];
};

export default async function CompaniesPage() {
  const supabase = await createClient();
  const { data: organizations } = await supabase
    .from("organizations")
    .select("*, organization_members(count)")
    .order("created_at", { ascending: false });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-n-900 tracking-tight">Companies</h1>
          <p className="text-sm text-n-400 mt-0.5">
            {organizations?.length ?? 0} {(organizations?.length ?? 0) === 1 ? "company" : "companies"}
          </p>
        </div>
        <Link
          href="/admin/companies/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-medium bg-lms-accent hover:bg-lms-accent-600 text-white transition-colors"
        >
          <Plus className="w-4 h-4" />
          New company
        </Link>
      </div>

      {!organizations?.length ? (
        <div className="border border-dashed border-n-200 rounded-md p-12 text-center">
          <p className="text-sm text-n-400">No companies yet. Create your first one!</p>
        </div>
      ) : (
        <div className="border border-n-200 rounded-md overflow-hidden shadow-1">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-n-200 bg-n-50">
                <th className="text-left px-4 py-3 text-n-600 font-medium">Name</th>
                <th className="text-left px-4 py-3 text-n-600 font-medium">Slug</th>
                <th className="text-left px-4 py-3 text-n-600 font-medium">Seats</th>
                <th className="text-left px-4 py-3 text-n-600 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {(organizations as Organization[]).map((org) => {
                const memberCount = org.organization_members[0]?.count ?? 0;
                return (
                  <tr key={org.id} className="border-b border-n-200 last:border-0 hover:bg-n-50">
                    <td className="px-4 py-3 text-n-900 font-medium">{org.name}</td>
                    <td className="px-4 py-3 text-n-500 font-mono text-xs">{org.slug}</td>
                    <td className="px-4 py-3 text-n-700">
                      {memberCount} / {org.seat_limit === 0 ? "∞" : org.seat_limit}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={org.status === "active" ? "default" : "secondary"}
                        className={
                          org.status === "active"
                            ? "bg-success/10 text-success border-success/20"
                            : "bg-warn/10 text-warn border-warn/20"
                        }
                      >
                        {org.status === "active" ? "Active" : "Suspended"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/companies/${org.id}`}
                        className="text-lms-accent hover:text-lms-accent-600 text-sm font-medium"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
