"use client";

import { useEffect, useState } from "react";

interface LoadingProgressProps {
    progress: number;
    dishName?: string;
}

export default function LoadingProgress({ progress, dishName }: LoadingProgressProps) {
    const [displayProgress, setDisplayProgress] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => setDisplayProgress(progress), 50);
        return () => clearTimeout(timer);
    }, [progress]);

    return (
        <div className="w-full">
            <div className="mb-4">
                {dishName ? (
                    <h1 className="text-display-md font-display text-text-accent tracking-widest animate-pulse">
                        {dishName}
                    </h1>
                ) : (
                    <div className="h-8 w-48 bg-surface animate-pulse rounded-none" />
                )}
            </div>
            <div className="relative w-full h-1 bg-surface overflow-hidden">
                <div
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-plasma/60 via-plasma to-plasma/60 transition-all duration-300 ease-out"
                    style={{ width: `${displayProgress}%` }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-plasma/30 to-transparent animate-scanline" />
            </div>
            <div className="mt-2 flex justify-between items-center">
                <span className="text-body-xs font-mono text-text-tertiary">
                    {displayProgress < 100 ? "MATERIALIZING MODEL..." : "MODEL READY"}
                </span>
                <span className="text-body-xs font-mono text-plasma">
                    {Math.round(displayProgress)}%
                </span>
            </div>
        </div>
    );
}