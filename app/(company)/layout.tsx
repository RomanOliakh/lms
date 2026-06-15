import { redirect } from "next/navigation";
import CompanySidebar from "@/components/layout/CompanySidebar";
import { getAdminOrg } from "@/lib/company/context";

export default async function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const org = await getAdminOrg();
  if (!org) redirect("/dashboard");

  return (
    <div className="flex h-screen bg-n-0 overflow-hidden">
      <CompanySidebar companyName={org.name} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
