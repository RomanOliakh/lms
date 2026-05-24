import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { lesson_id, answers } = body as {
    lesson_id?: string;
    // question_id → array of selected option_ids
    answers?: Record<string, string[]>;
  };

  if (!lesson_id || !answers) {
    return NextResponse.json({ error: "lesson_id and answers required" }, { status: 400 });
  }

  // Fetch all questions + options (including is_correct) server-side only
  const { data: questions, error } = await supabase
    .from("quiz_questions")
    .select("id, type, quiz_options(id, is_correct)")
    .eq("lesson_id", lesson_id)
    .order("position");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!questions || questions.length === 0) {
    return NextResponse.json({ score: 0, total: 0, results: [] });
  }

  const results: { question_id: string; is_correct: boolean; correct_option_ids: string[] }[] = [];
  let correct = 0;

  for (const question of questions) {
    const options = question.quiz_options as { id: string; is_correct: boolean }[];
    const correctIds = options.filter((o) => o.is_correct).map((o) => o.id);
    const submitted = answers[question.id] ?? [];

    const isCorrect =
      correctIds.length > 0 &&
      correctIds.length === submitted.length &&
      correctIds.every((id) => submitted.includes(id));

    if (isCorrect) correct++;

    results.push({
      question_id: question.id,
      is_correct: isCorrect,
      correct_option_ids: correctIds,
    });
  }

  return NextResponse.json({
    score: correct,
    total: questions.length,
    results,
  });
}
