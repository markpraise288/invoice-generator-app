import { cn } from "@/lib/utils";

interface ProjectProgressBarProps {
  progress: number; // 0-100
  showLabel?: boolean;
  className?: string;
}

const getColorClass = (progress: number) => {
  if (progress >= 100) return "bg-emerald-500";
  if (progress >= 50) return "bg-sky-500";
  if (progress > 0) return "bg-amber-500";
  return "bg-muted-foreground/30";
};

export function ProjectProgressBar({
  progress,
  showLabel = false,
  className,
}: ProjectProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, progress));

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", getColorClass(clamped))}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-muted-foreground">{clamped}%</span>
      )}
      <span className="sr-only">{clamped}% complete</span>
    </div>
  );
}