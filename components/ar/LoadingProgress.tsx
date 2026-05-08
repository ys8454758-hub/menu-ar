"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface LoadingProgressProps {
  progress: number;
  dishName?: string;
  className?: string;
}

export default function LoadingProgress({ progress, dishName: _dishName, className }: LoadingProgressProps) {
  void _dishName; // kept for future use
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (progressRef.current) {
      progressRef.current.style.width = `${progress}%`;
    }
  }, [progress]);

  return (
    <div className={cn("w-full h-1 bg-surface overflow-hidden", className)}>
      <div
        ref={progressRef}
        className="h-full bg-plasma transition-all duration-300 ease-out"
        style={{ width: "0%" }}
      />
    </div>
  );
}

export function LoadingScreen({ dishName }: { dishName?: string }) {
  return (
    <div className="min-h-screen bg-void flex flex-col items-center justify-center">
      <div className="text-center space-y-6">
        <div className="w-16 h-16 border-2 border-plasma border-t-transparent rounded-full animate-spin mx-auto" />
        <div className="space-y-2">
          <p className="text-body-lg font-ui text-text-accent tracking-widest">
            LOADING 3D MODEL
          </p>
          {dishName && (
            <p className="text-body-md font-body text-text-secondary">
              {dishName}
            </p>
          )}
        </div>
        <div className="w-64 h-1 bg-surface overflow-hidden rounded-full">
          <div className="h-full bg-plasma animate-pulse" style={{ width: "60%" }} />
        </div>
      </div>
    </div>
  );
}