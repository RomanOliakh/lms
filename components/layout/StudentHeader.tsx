"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, LayoutDashboard, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export default function StudentHeader({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <header className="h-[var(--header-h)] border-b border-n-200 bg-n-0 flex items-center px-6 gap-6 shrink-0">
      <Link
        href="/courses"
        className="text-sm font-semibold text-n-900 tracking-tight mr-2"
      >
        LMS
      </Link>

      <nav className="flex items-center gap-1">
        <Link
          href="/courses"
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-sm font-medium transition-colors",
            pathname.startsWith("/courses")
              ? "bg-lms-accent-50 text-lms-accent"
              : "text-n-600 hover:bg-n-100 hover:text-n-900"
          )}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Каталог
        </Link>
        <Link
          href="/dashboard"
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-sm font-medium transition-colors",
            pathname === "/dashboard"
              ? "bg-lms-accent-50 text-lms-accent"
              : "text-n-600 hover:bg-n-100 hover:text-n-900"
          )}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          Мої курси
        </Link>
      </nav>

      <div className="ml-auto flex items-center gap-3">
        <span className="text-xs text-n-400 hidden sm:block">{userEmail}</span>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-sm text-n-600 hover:bg-n-100 hover:text-n-900 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Вийти
        </button>
      </div>
    </header>
  );
}
