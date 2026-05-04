"use client";

import { useState } from "react";

interface BadgeToggleProps {
    onToggle: (visible: boolean) => void;
}

export default function BadgeToggle({ onToggle }: BadgeToggleProps) {
    const [active, setActive] = useState(false);

    const handleToggle = () => {
        const next = !active;
        setActive(next);
        onToggle(next);
    };

    return (
        <button
            onClick={handleToggle}
            className={`absolute bottom-24 left-4 z-20 flex items-center gap-2 px-3 py-2 rounded-none border transition-all duration-300 ${active
                    ? "bg-plasma/20 border-plasma text-plasma"
                    : " /80 border-border text-text-tertiary hover:border-plasma/50"
                }`}
        >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="4" cy="4" r="1.5" fill="currentColor" />
                <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="12" cy="4" r="1.5" fill="currentColor" />
            </svg>
            <span className="text-body-xs font-mono tracking-widest">BADGES</span>
        </button>
    );
}