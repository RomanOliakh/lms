import { createClient } from "@/lib/supabase/server";
import StudentHeader from "@/components/layout/StudentHeader";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-n-0 flex flex-col">
      <StudentHeader userEmail={user?.email ?? ""} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
