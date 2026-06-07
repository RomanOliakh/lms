"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Plus, Pencil, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { createModule, updateModule, deleteModule, moveModule } from "@/lib/actions/modules";
import { createLesson, deleteLesson, moveLesson } from "@/lib/actions/lessons";
import { Tables } from "@/types/supabase";

type Module = Tables<"modules"> & { lessons: Tables<"lessons">[] };

export default function CurriculumEditor({
  courseId,
  modules,
}: {
  courseId: string;
  modules: Module[];
}) {
  const [openModules, setOpenModules] = useState<Set<string>>(new Set(modules.map((m) => m.id)));
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [editingModule, setEditingModule] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [newLessonTitles, setNewLessonTitles] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  function toggleModule(id: string) {
    setOpenModules((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleAddModule() {
    if (!newModuleTitle.trim()) return;
    startTransition(async () => {
      await createModule(courseId, newModuleTitle.trim());
      setNewModuleTitle("");
    });
  }

  function handleRenameModule(id: string) {
    if (!editTitle.trim()) return;
    startTransition(async () => {
      await updateModule(id, courseId, editTitle.trim());
      setEditingModule(null);
    });
  }

  function handleDeleteModule(id: string) {
    if (!confirm("Видалити модуль і всі його уроки?")) return;
    startTransition(async () => {
      await deleteModule(id, courseId);
    });
  }

  function handleMoveModule(id: string, dir: "up" | "down") {
    startTransition(async () => {
      await moveModule(id, courseId, dir);
    });
  }

  function handleAddLesson(moduleId: string) {
    const title = newLessonTitles[moduleId]?.trim();
    if (!title) return;
    startTransition(async () => {
      await createLesson(moduleId, courseId, title);
      setNewLessonTitles((prev) => ({ ...prev, [moduleId]: "" }));
    });
  }

  function handleDeleteLesson(lessonId: string) {
    if (!confirm("Видалити урок?")) return;
    startTransition(async () => {
      await deleteLesson(lessonId, courseId);
    });
  }

  function handleMoveLesson(lessonId: string, moduleId: string, dir: "up" | "down") {
    startTransition(async () => {
      await moveLesson(lessonId, courseId, moduleId, dir);
    });
  }

  return (
    <div className="space-y-2">
      {modules.map((mod, modIdx) => (
        <div key={mod.id} className="border border-n-200 rounded-md overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 bg-n-50">
            <button
              onClick={() => toggleModule(mod.id)}
              className="text-n-500 hover:text-n-900"
            >
              {openModules.has(mod.id) ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>

            {editingModule === mod.id ? (
              <div className="flex items-center gap-2 flex-1">
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRenameModule(mod.id)}
                  className="h-7 text-sm border-n-200 focus-visible:ring-lms-accent"
                  autoFocus
                />
                <Button
                  size="sm"
                  onClick={() => handleRenameModule(mod.id)}
                  disabled={isPending}
                  className="h-7 bg-lms-accent hover:bg-lms-accent-600 text-white text-xs px-2"
                >
                  OK
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingModule(null)}
                  className="h-7 text-xs px-2"
                >
                  Скасувати
                </Button>
              </div>
            ) : (
              <span className="flex-1 text-sm font-medium text-n-900">{mod.title}</span>
            )}

            <div className="flex items-center gap-1 ml-auto">
              <button
                onClick={() => handleMoveModule(mod.id, "up")}
                disabled={modIdx === 0 || isPending}
                className="p-1 text-n-400 hover:text-n-700 disabled:opacity-30"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleMoveModule(mod.id, "down")}
                disabled={modIdx === modules.length - 1 || isPending}
                className="p-1 text-n-400 hover:text-n-700 disabled:opacity-30"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  setEditingModule(mod.id);
                  setEditTitle(mod.title);
                }}
                className="p-1 text-n-400 hover:text-n-700"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDeleteModule(mod.id)}
                className="p-1 text-n-400 hover:text-danger"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {openModules.has(mod.id) && (
            <div className="divide-y divide-n-100">
              {mod.lessons.map((lesson, lessonIdx) => (
                <div
                  key={lesson.id}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-n-50"
                >
                  <span className="flex-1 text-sm text-n-700">{lesson.title}</span>
                  <span className={cn(
                    "text-xs px-1.5 py-0.5 rounded-xs font-medium",
                    lesson.type === "video"
                      ? "bg-lms-accent-50 text-lms-accent"
                      : "bg-n-100 text-n-500"
                  )}>
                    {lesson.type === "video" ? "Відео" : "Текст"}
                  </span>
                  <button
                    onClick={() => handleMoveLesson(lesson.id, mod.id, "up")}
                    disabled={lessonIdx === 0 || isPending}
                    className="p-1 text-n-400 hover:text-n-700 disabled:opacity-30"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMoveLesson(lesson.id, mod.id, "down")}
                    disabled={lessonIdx === mod.lessons.length - 1 || isPending}
                    className="p-1 text-n-400 hover:text-n-700 disabled:opacity-30"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <Link
                    href={`/admin/courses/${courseId}/lessons/${lesson.id}`}
                    className="p-1 text-n-400 hover:text-lms-accent"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={() => handleDeleteLesson(lesson.id)}
                    className="p-1 text-n-400 hover:text-danger"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              <div className="flex items-center gap-2 px-4 py-2.5">
                <Input
                  placeholder="Назва уроку"
                  value={newLessonTitles[mod.id] ?? ""}
                  onChange={(e) =>
                    setNewLessonTitles((prev) => ({ ...prev, [mod.id]: e.target.value }))
                  }
                  onKeyDown={(e) => e.key === "Enter" && handleAddLesson(mod.id)}
                  className="h-7 text-sm border-n-200 focus-visible:ring-lms-accent"
                />
                <Button
                  size="sm"
                  onClick={() => handleAddLesson(mod.id)}
                  disabled={isPending || !newLessonTitles[mod.id]?.trim()}
                  className="h-7 bg-lms-accent hover:bg-lms-accent-600 text-white text-xs px-2 shrink-0"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Урок
                </Button>
              </div>
            </div>
          )}
        </div>
      ))}

      <div className="flex items-center gap-2 pt-1">
        <Input
          placeholder="Назва модуля"
          value={newModuleTitle}
          onChange={(e) => setNewModuleTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddModule()}
          className="border-n-200 focus-visible:ring-lms-accent"
        />
        <Button
          onClick={handleAddModule}
          disabled={isPending || !newModuleTitle.trim()}
          className="bg-lms-accent hover:bg-lms-accent-600 text-white shrink-0"
        >
          <Plus className="w-4 h-4 mr-1" />
          Модуль
        </Button>
      </div>
    </div>
  );
}
