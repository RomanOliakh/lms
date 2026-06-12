import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import CompanyForm from "@/components/company/CompanyForm";

export default function NewCompanyPage() {
  return (
    <div className="p-8 max-w-2xl">
      <Link
        href="/admin/companies"
        className="inline-flex items-center gap-1 text-sm text-n-500 hover:text-n-900 mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to companies
      </Link>
      <h1 className="text-xl font-semibold text-n-900 tracking-tight mb-6">New company</h1>
      <CompanyForm />
    </div>
  );
}
