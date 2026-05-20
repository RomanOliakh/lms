import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-n-0 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-xl font-semibold text-n-900 tracking-tight">Дашборд студента</h1>
        <p className="text-sm text-n-400 mt-1">{user?.email}</p>
        <p className="text-xs text-n-300 mt-4">Sprint 3 — coming soon</p>
      </div>
    </div>
  );
}
