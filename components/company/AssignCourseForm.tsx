"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { assignCourse } from "@/lib/actions/assignments";

type CourseOption = { id: string; title: string };
type MemberOption = { id: string; email: string };

export default function AssignCourseForm({
  orgId,
  courses,
  members,
}: {
  orgId: string;
  courses: CourseOption[];
  members: MemberOption[];
}) {
  const [courseId, setCourseId] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [dueAt, setDueAt] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const allSelected = members.length > 0 && selectedIds.length === members.length;

  function toggleMember(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  }

  function toggleAll() {
    setSelectedIds(allSelected ? [] : members.map((m) => m.id));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    startTransition(async () => {
      try {
        await assignCourse({
          orgId,
          courseId,
          memberIds: selectedIds,
          dueAt: dueAt || null,
        });
        setSuccess(true);
        setSelectedIds([]);
        setDueAt("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to assign course");
      }
    });
  }

  if (courses.length === 0) {
    return <p className="text-sm text-n-400">No published courses to assign yet.</p>;
  }
  if (members.length === 0) {
    return <p className="text-sm text-n-400">No employees to assign courses to yet.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="course" className="text-n-700">Course</Label>
        <select
          id="course"
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          required
          className="w-full h-9 px-3 rounded-sm border border-n-200 bg-n-0 text-sm text-n-900 focus:outline-none focus:ring-2 focus:ring-lms-accent"
        >
          <option value="">Select a course…</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-n-700">Employees</Label>
          <button
            type="button"
            onClick={toggleAll}
            className="text-xs text-lms-accent hover:underline"
          >
            {allSelected ? "Deselect all" : "Select all"}
          </button>
        </div>
        <div className="border border-n-200 rounded-sm max-h-48 overflow-y-auto divide-y divide-n-200">
          {members.map((m) => (
            <label
              key={m.id}
              className="flex items-center gap-3 px-3 py-2 text-sm text-n-900 cursor-pointer hover:bg-n-50"
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(m.id)}
                onChange={() => toggleMember(m.id)}
                className="w-4 h-4 accent-lms-accent"
              />
              {m.email}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="due_at" className="text-n-700">Deadline (optional)</Label>
        <Input
          id="due_at"
          type="date"
          value={dueAt}
          onChange={(e) => setDueAt(e.target.value)}
          className="border-n-200 focus-visible:ring-lms-accent"
        />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}
      {success && <p className="text-sm text-success">Course assigned ✓</p>}

      <Button
        type="submit"
        disabled={isPending || !courseId || selectedIds.length === 0}
        className="bg-lms-accent hover:bg-lms-accent-600 text-white"
      >
        {isPending ? "Assigning..." : "Assign course"}
      </Button>
    </form>
  );
}
