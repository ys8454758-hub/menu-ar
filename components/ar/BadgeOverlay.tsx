"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BadgeOverlayProps {
  badges: { type: string; label?: string; color?: string }[];
  visible?: boolean;
  className?: string;
}

const DEFAULT_BADGE_COLORS: Record<string, string> = {
  VEG: "#39FF14",
  NON_VEG: "#FF6B35",
  JAIN: "#FFD700",
  VEGAN: "#00FFD1",
};

export default function BadgeOverlay({ badges, visible = true, className }: BadgeOverlayProps) {
  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn("flex flex-wrap gap-2", className)}
    >
      {badges.map((badge, index) => {
        const badgeColor = badge.color || DEFAULT_BADGE_COLORS[badge.type] || "#00FFD1";
        return (
          <motion.span
            key={index}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="px-3 py-1 border font-ui text-xs tracking-widest uppercase"
            style={{
              borderColor: `${badgeColor}50`,
              color: badgeColor,
              backgroundColor: `${badgeColor}10`,
            }}
          >
            {badge.label || badge.type}
          </motion.span>
        );
      })}
    </motion.div>
  );
}