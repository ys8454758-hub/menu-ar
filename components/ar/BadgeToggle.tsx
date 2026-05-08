"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "menuAR_badgeVisible";

export default function BadgeToggle({ className }: { className?: string }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setVisible(stored === "true");
    }
  }, []);

  const toggle = () => {
    const newValue = !visible;
    setVisible(newValue);
    sessionStorage.setItem(STORAGE_KEY, String(newValue));
  };

  return (
    <button
      onClick={toggle}
      className={cn(
        "flex items-center gap-2 px-3 py-2 border border-border bg-terminal/80 backdrop-blur-sm",
        "text-text-secondary hover:text-text-primary transition-colors",
        className
      )}
    >
      {visible ? (
        <>
          <EyeOff className="w-4 h-4" />
          <span className="text-body-xs font-ui tracking-wider">Hide Badges</span>
        </>
      ) : (
        <>
          <Eye className="w-4 h-4" />
          <span className="text-body-xs font-ui tracking-wider">Show Badges</span>
        </>
      )}
    </button>
  );
}

export function getBadgeVisibility(): boolean {
  if (typeof window === "undefined") return true;
  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (stored === null) return true;
  return stored === "true";
}