"use client";

import { cn } from "@/lib/utils";

interface ScanHeatmapProps {
  data: { date: string; count: number }[];
  className?: string;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ScanHeatmap({ data, className }: ScanHeatmapProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  const getColor = (count: number): string => {
    if (count === 0) return "bg-surface";
    const intensity = Math.min(count / maxCount, 1);
    if (intensity > 0.75) return "bg-plasma";
    if (intensity > 0.5) return "bg-plasma/70";
    if (intensity > 0.25) return "bg-plasma/40";
    return "bg-plasma/20";
  };

  return (
    <div className={cn("", className)}>
      <h3 className="text-body-sm font-ui text-text-secondary tracking-wider uppercase mb-4">
        Scan Activity
      </h3>

      <div className="grid grid-cols-7 gap-1">
        {DAYS.map((day) => (
          <div key={day} className="text-body-xs font-mono text-text-tertiary text-center">
            {day}
          </div>
        ))}

        {data.slice(-28).map((d, i) => (
          <div
            key={i}
            className={cn(
              "aspect-square rounded-sm transition-colors",
              getColor(d.count)
            )}
            title={`${d.date}: ${d.count} scans`}
          />
        ))}
      </div>

      <div className="flex items-center justify-end gap-2 mt-3">
        <span className="text-body-xs font-mono text-text-tertiary">Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-surface" />
          <div className="w-3 h-3 rounded-sm bg-plasma/20" />
          <div className="w-3 h-3 rounded-sm bg-plasma/40" />
          <div className="w-3 h-3 rounded-sm bg-plasma/70" />
          <div className="w-3 h-3 rounded-sm bg-plasma" />
        </div>
        <span className="text-body-xs font-mono text-text-tertiary">More</span>
      </div>
    </div>
  );
}