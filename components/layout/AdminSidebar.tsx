"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, Users, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/admin/courses", label: "Курси", icon: BookOpen },
  { href: "/admin/students", label: "Студенти", icon: Users },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <aside className="flex flex-col w-[var(--sidebar-w)] h-full border-r border-n-200 bg-n-50 shrink-0">
      <div className="flex items-center h-[var(--header-h)] px-5 border-b border-n-200">
        <span className="text-sm font-semibold text-n-900 tracking-tight">LMS Admin</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-medium transition-colors",
              pathname.startsWith(href)
                ? "bg-lms-accent-50 text-lms-accent"
                : "text-n-600 hover:bg-n-100 hover:text-n-900"
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-n-200">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-sm text-sm text-n-600 hover:bg-n-100 hover:text-n-900 transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Вийти
        </button>
      </div>
    </aside>
  );
}
