import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const course_id = body?.course_id as string | undefined;
  if (!course_id) {
    return NextResponse.json({ error: "course_id required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("enrollments")
    .insert({ user_id: user.id, course_id })
    .select()
    .single();

  if (error && error.code !== "23505") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
