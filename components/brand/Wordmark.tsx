import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

// Brand wordmark — accent mark + "LMS". `iconOnly` renders just the mark.
export default function Wordmark({
  className,
  iconOnly = false,
}: {
  className?: string;
  iconOnly?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-lms-accent text-white shadow-1">
        <GraduationCap className="w-4 h-4" />
      </span>
      {!iconOnly && (
        <span className="text-base font-semibold tracking-tight text-n-900">LMS</span>
      )}
    </span>
  );
}
