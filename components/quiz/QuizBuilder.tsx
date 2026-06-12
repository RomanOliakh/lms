"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  createQuestion,
  updateQuestion,
  deleteQuestion,
  createOption,
  updateOption,
  deleteOption,
} from "@/lib/actions/quiz";
import { Tables } from "@/types/supabase";

type Option = Tables<"quiz_options">;
type Question = Tables<"quiz_questions"> & { quiz_options: Option[] };

export default function QuizBuilder({
  lessonId,
  courseId,
  questions,
}: {
  lessonId: string;
  courseId: string;
  questions: Question[];
}) {
  const [isPending, startTransition] = useTransition();

  function handleAddQuestion() {
    startTransition(async () => {
      await createQuestion(lessonId, courseId);
    });
  }

  function handleDeleteQuestion(id: string) {
    if (!confirm("Delete this question?")) return;
    startTransition(async () => {
      await deleteQuestion(id, lessonId, courseId);
    });
  }

  function handleQuestionChange(id: string, field: "question" | "type", value: string) {
    startTransition(async () => {
      await updateQuestion(id, lessonId, courseId, { [field]: value });
    });
  }

  function handleAddOption(questionId: string) {
    startTransition(async () => {
      await createOption(questionId, lessonId, courseId);
    });
  }

  function handleDeleteOption(id: string) {
    startTransition(async () => {
      await deleteOption(id, lessonId, courseId);
    });
  }

  function handleOptionTextChange(id: string, text: string) {
    startTransition(async () => {
      await updateOption(id, lessonId, courseId, { text });
    });
  }

  function handleToggleCorrect(id: string, current: boolean) {
    startTransition(async () => {
      await updateOption(id, lessonId, courseId, { is_correct: !current });
    });
  }

  return (
    <div className="space-y-4">
      {questions.length === 0 && (
        <p className="text-sm text-n-400 py-4 text-center border border-dashed border-n-200 rounded-md">
          No questions yet
        </p>
      )}

      {questions.map((q, qIdx) => (
        <div key={q.id} className="border border-n-200 rounded-md overflow-hidden">
          <div className="flex items-start gap-3 px-4 py-3 bg-n-50 border-b border-n-200">
            <span className="text-xs font-medium text-n-500 mt-1 shrink-0">
              {qIdx + 1}.
            </span>
            <DebouncedInput
              value={q.question}
              onCommit={(val) => handleQuestionChange(q.id, "question", val)}
              className="flex-1 text-sm border-n-200 focus-visible:ring-lms-accent"
              placeholder="Question text"
            />
            <select
              defaultValue={q.type}
              onChange={(e) => handleQuestionChange(q.id, "type", e.target.value)}
              className="text-xs border border-n-200 rounded-xs px-2 py-1 bg-n-0 text-n-700 focus:outline-none focus:ring-1 focus:ring-lms-accent"
            >
              <option value="single">Single answer</option>
              <option value="multiple">Multiple answers</option>
            </select>
            <button
              onClick={() => handleDeleteQuestion(q.id)}
              className="p-1 text-n-400 hover:text-danger shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="divide-y divide-n-100">
            {q.quiz_options.map((opt) => (
              <div key={opt.id} className="flex items-center gap-3 px-4 py-2.5">
                <button
                  onClick={() => handleToggleCorrect(opt.id, opt.is_correct)}
                  className={cn(
                    "w-5 h-5 rounded-xs border flex items-center justify-center shrink-0 transition-colors",
                    opt.is_correct
                      ? "bg-success border-success text-white"
                      : "border-n-300 text-transparent hover:border-n-500"
                  )}
                >
                  <Check className="w-3 h-3" />
                </button>
                <DebouncedInput
                  value={opt.text}
                  onCommit={(val) => handleOptionTextChange(opt.id, val)}
                  className="flex-1 text-sm border-n-200 focus-visible:ring-lms-accent"
                  placeholder="Option text"
                />
                <button
                  onClick={() => handleDeleteOption(opt.id)}
                  className="p-1 text-n-400 hover:text-danger shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            <div className="px-4 py-2.5">
              <button
                onClick={() => handleAddOption(q.id)}
                disabled={isPending}
                className="text-xs text-lms-accent hover:text-lms-accent-600 font-medium flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Add option
              </button>
            </div>
          </div>
        </div>
      ))}

      <Button
        onClick={handleAddQuestion}
        disabled={isPending}
        variant="outline"
        className="border-n-200 text-n-700 hover:bg-n-50"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add question
      </Button>
    </div>
  );
}

function DebouncedInput({
  value: initialValue,
  onCommit,
  className,
  placeholder,
}: {
  value: string;
  onCommit: (value: string) => void;
  className?: string;
  placeholder?: string;
}) {
  const [value, setValue] = useState(initialValue);

  return (
    <Input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => { if (value !== initialValue) onCommit(value); }}
      onKeyDown={(e) => { if (e.key === "Enter") onCommit(value); }}
      className={className}
      placeholder={placeholder}
    />
  );
}
