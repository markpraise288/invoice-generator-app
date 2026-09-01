import { cn } from "@/lib/utils";

interface LeadScoreIndicatorProps {
  score: number; // 0-100
  variant?: "compact" | "detailed";
  className?: string;
}

const getTier = (score: number) => {
  if (score >= 80) return { label: "Hot", color: "bg-red-500", text: "text-red-600 dark:text-red-400" };
  if (score >= 50) return { label: "Warm", color: "bg-amber-500", text: "text-amber-600 dark:text-amber-400" };
  if (score >= 20) return { label: "Cool", color: "bg-sky-500", text: "text-sky-600 dark:text-sky-400" };
  return { label: "Cold", color: "bg-slate-400", text: "text-slate-500 dark:text-slate-400" };
};

export function LeadScoreIndicator({
  score,
  variant = "compact",
  className,
}: LeadScoreIndicatorProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const tier = getTier(clamped);

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-1.5", className)}>
        <div className="flex h-1.5 w-10 overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full rounded-full transition-all", tier.color)}
            style={{ width: `${clamped}%` }}
          />
        </div>
        <span className={cn("text-xs font-medium", tier.text)}>{clamped}</span>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-center justify-between">
        <span className={cn("text-sm font-semibold", tier.text)}>{tier.label} Lead</span>
        <span className="text-sm font-medium text-foreground">{clamped}/100</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", tier.color)}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}