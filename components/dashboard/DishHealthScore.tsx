"use client";

import { cn } from "@/lib/utils";
import { getHealthScoreColor, getHealthScoreBg, getHealthScoreLabel } from "@/lib/health-score";

interface DishHealthScoreProps {
  score: number;
  scanCount?: number;
  qualityRating?: number;
  updatedAt?: string;
  showDetails?: boolean;
  className?: string;
}

export default function DishHealthScore({
  score,
  scanCount,
  qualityRating,
  updatedAt,
  showDetails = false,
  className,
}: DishHealthScoreProps) {
  const colorClass = getHealthScoreColor(score);
  const bgClass = getHealthScoreBg(score);
  const label = getHealthScoreLabel(score);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-3">
        <div className={cn("px-3 py-2 border font-display text-display-sm", bgClass, colorClass)}>
          {score}
        </div>
        <div>
          <p className={cn("text-body-sm font-ui tracking-wider", colorClass)}>{label}</p>
          <p className="text-body-xs font-body text-text-tertiary">Health Score</p>
        </div>
      </div>

      {showDetails && (
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/50">
          <div>
            <p className="text-body-xs font-mono text-text-tertiary">{scanCount ?? 0}</p>
            <p className="text-body-xs font-body text-text-secondary">Scans</p>
          </div>
          <div>
            <p className="text-body-xs font-mono text-text-tertiary">
              {qualityRating != null ? `${qualityRating}/5` : "—"}
            </p>
            <p className="text-body-xs font-body text-text-secondary">Model</p>
          </div>
          <div>
            <p className="text-body-xs font-mono text-text-tertiary">
              {updatedAt
                ? `${Math.floor((Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24))}d`
                : "—"}
            </p>
            <p className="text-body-xs font-body text-text-secondary">Age</p>
          </div>
        </div>
      )}
    </div>
  );
}