"use client";

import { cn } from "@/lib/utils";

interface BadgePreviewProps {
  badge: {
    type: string;
    label: string;
    color?: string;
  };
  className?: string;
}

const DEFAULT_COLORS: Record<string, string> = {
  VEG: "#39FF14",
  NON_VEG: "#FF6B35",
  JAIN: "#FFD700",
  VEGAN: "#00FFD1",
};

export default function BadgePreview({ badge, className }: BadgePreviewProps) {
  const color = badge.color || DEFAULT_COLORS[badge.type] || "#00FFD1";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 border font-ui text-xs tracking-wider uppercase",
        className
      )}
      style={{
        borderColor: `${color}50`,
        color: color,
        backgroundColor: `${color}10`,
      }}
    >
      {badge.type === "VEG" && (
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
      )}
      {badge.type === "NON_VEG" && (
        <span
          className="w-2 h-2"
          style={{
            backgroundColor: color,
            clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
          }}
        />
      )}
      {badge.label}
    </div>
  );
}

export function SampleDishCard() {
  return (
    <div className="border border-border bg-terminal p-4 space-y-3">
      <div className="w-full h-32 bg-surface flex items-center justify-center">
        <span className="text-text-tertiary text-body-sm">Dish Image</span>
      </div>
      <h4 className="text-body-md font-ui text-text-accent">Sample Dish Name</h4>
      <p className="text-body-xs font-body text-text-tertiary">
        A delicious sample dish description
      </p>
      <div className="flex gap-2">
        <BadgePreview badge={{ type: "VEG", label: "Veg", color: "#39FF14" }} />
        <BadgePreview badge={{ type: "JAIN", label: "Jain", color: "#FFD700" }} />
      </div>
      <p className="text-body-md font-mono text-plasma">₹250.00</p>
    </div>
  );
}