"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

type Option = { id: string; text: string };
type Question = { id: string; question: string; type: string; options: Option[] };

type Result = { question_id: string; is_correct: boolean; correct_option_ids: string[] };

export default function QuizTaker({
  lessonId,
  questions,
}: {
  lessonId: string;
  questions: Question[];
}) {
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [results, setResults] = useState<Result[] | null>(null);
  const [score, setScore] = useState<{ correct: number; total: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (questions.length === 0) return null;

  function toggleOption(questionId: string, optionId: string, type: string) {
    if (results) return;
    setAnswers((prev) => {
      const current = prev[questionId] ?? [];
      if (type === "single") {
        return { ...prev, [questionId]: [optionId] };
      }
      const next = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId];
      return { ...prev, [questionId]: next };
    });
  }

  async function handleSubmit() {
    const unanswered = questions.filter((q) => !(answers[q.id]?.length > 0));
    if (unanswered.length > 0) {
      setError("Дайте відповідь на всі питання");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lesson_id: lessonId, answers }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Помилка перевірки");
        return;
      }
      setResults(data.results);
      setScore({ correct: data.score, total: data.total });
    } finally {
      setSubmitting(false);
    }
  }

  function handleRetry() {
    setAnswers({});
    setResults(null);
    setScore(null);
    setError("");
  }

  const resultMap = results
    ? Object.fromEntries(results.map((r) => [r.question_id, r]))
    : null;

  return (
    <div className="mt-8 border-t border-n-200 pt-6 space-y-6">
      <h2 className="text-sm font-semibold text-n-700 uppercase tracking-wide">Тест</h2>

      {score && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-md text-sm font-semibold ${
          score.correct === score.total
            ? "bg-green-50 text-green-700 border border-green-200"
            : "bg-amber-50 text-amber-700 border border-amber-200"
        }`}>
          {score.correct === score.total ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          Результат: {score.correct} / {score.total}
          {score.correct < score.total && (
            <button
              onClick={handleRetry}
              className="ml-auto text-xs underline font-normal hover:no-underline"
            >
              Спробувати ще раз
            </button>
          )}
        </div>
      )}

      <div className="space-y-5">
        {questions.map((question, qi) => {
          const selected = answers[question.id] ?? [];
          const result = resultMap?.[question.id];

          return (
            <div key={question.id} className="space-y-2">
              <p className="text-sm font-semibold text-n-800">
                {qi + 1}. {question.question}
                {question.type === "multiple" && (
                  <span className="ml-1.5 text-xs font-normal text-n-400">(кілька відповідей)</span>
                )}
              </p>
              <div className="space-y-1.5">
                {question.options.map((option) => {
                  const isSelected = selected.includes(option.id);
                  const isCorrectOption = result?.correct_option_ids.includes(option.id);
                  const showResult = !!result;

                  let optionStyle = "border-n-200 bg-n-0 text-n-800 hover:border-lms-accent";
                  if (showResult) {
                    if (isCorrectOption) {
                      optionStyle = "border-green-400 bg-green-50 text-green-800";
                    } else if (isSelected && !isCorrectOption) {
                      optionStyle = "border-red-300 bg-red-50 text-red-800";
                    } else {
                      optionStyle = "border-n-200 bg-n-0 text-n-500";
                    }
                  } else if (isSelected) {
                    optionStyle = "border-lms-accent bg-lms-accent-50 text-lms-accent";
                  }

                  return (
                    <button
                      key={option.id}
                      onClick={() => toggleOption(question.id, option.id, question.type)}
                      disabled={!!results}
                      className={`w-full text-left px-3 py-2 rounded-sm border text-sm transition-colors ${optionStyle} disabled:cursor-default`}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center ${
                          isSelected && !showResult ? "border-lms-accent bg-lms-accent" :
                          showResult && isCorrectOption ? "border-green-500 bg-green-500" :
                          showResult && isSelected ? "border-red-400 bg-red-400" :
                          "border-n-300"
                        }`}>
                          {(isSelected || (showResult && isCorrectOption)) && (
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </span>
                        {option.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {error && <p className="text-xs text-danger">{error}</p>}

      {!results && (
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="inline-flex items-center px-4 py-2 rounded-sm bg-lms-accent text-white text-sm font-semibold hover:bg-lms-accent-600 transition-colors disabled:opacity-60"
        >
          {submitting ? "Перевіряємо..." : "Перевірити відповіді"}
        </button>
      )}
    </div>
  );
}
