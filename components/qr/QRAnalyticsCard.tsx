"use client";

import { useMemo } from "react";
import { calculateReliabilityScore, getScoreColor, getScoreLabel, QRConfig } from "@/lib/qr-reliability";
import { cn } from "@/lib/utils";

interface QRAnalyticsCardProps {
  config: QRConfig;
  scanCount?: number;
  lastScanned?: string | null;
  className?: string;
}

export default function QRAnalyticsCard({ config, scanCount = 0, lastScanned, className }: QRAnalyticsCardProps) {
  const { score, breakdown } = useMemo(() => calculateReliabilityScore(config), [config]);
  const scoreColor = getScoreColor(score);
  const scoreLabel = getScoreLabel(score);

  return (
    <div className={cn("border border-border bg-terminal p-4 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-body-sm font-ui text-text-secondary tracking-wider uppercase">
          Reliability Score
        </h3>
        <span className="text-body-xs font-mono text-text-tertiary">{scanCount} scans</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-surface"
            />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke={scoreColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${score * 2.64} 264`}
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-display-sm font-display" style={{ color: scoreColor }}>
              {score}
            </span>
          </div>
        </div>

        <div className="flex-1 space-y-1">
          <p className="text-body-sm font-ui" style={{ color: scoreColor }}>
            {scoreLabel}
          </p>
          <p className="text-body-xs font-body text-text-tertiary">
            {lastScanned
              ? `Last scan: ${new Date(lastScanned).toLocaleDateString()}`
              : "No scans yet"}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <ScoreBar label="Contrast" value={breakdown.contrastScore} color={scoreColor} />
        <ScoreBar label="Error Correction" value={breakdown.ecLevelScore} color={scoreColor} />
        <ScoreBar label="Logo Size" value={breakdown.logoScore} color={scoreColor} />
        <ScoreBar label="Frame" value={breakdown.frameScore} color={scoreColor} />
      </div>

      {score < 60 && (
        <div className="p-3 border border-amber-400/30 bg-amber-400/10">
          <p className="text-body-xs font-body text-amber-400">
            Score is below recommended. Consider adjusting colors or increasing error correction level.
          </p>
        </div>
      )}
    </div>
  );
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-body-xs font-body text-text-tertiary w-28">{label}</span>
      <div className="flex-1 h-2 bg-surface overflow-hidden">
        <div
          className="h-full transition-all duration-300"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-body-xs font-mono text-text-tertiary w-8 text-right">{value}</span>
    </div>
  );
}