"use client";

import type { QRDesign } from "./types";

export interface QRTheme {
    name: string;
    design: Partial<QRDesign>;
    preview: { fg: string; bg: string };
}

export const builtInThemes: QRTheme[] = [
    { name: "Plasma", design: { foregroundColor: "#00ff88", backgroundColor: "#0a0a0a" }, preview: { fg: "#00ff88", bg: "#0a0a0a" } },
    { name: "Ocean", design: { foregroundColor: "#06b6d4", backgroundColor: "#0c1222" }, preview: { fg: "#06b6d4", bg: "#0c1222" } },
    { name: "Sunset", design: { foregroundColor: "#f97316", backgroundColor: "#1a0a00" }, preview: { fg: "#f97316", bg: "#1a0a00" } },
    { name: "Royal", design: { foregroundColor: "#a855f7", backgroundColor: "#0f0720" }, preview: { fg: "#a855f7", bg: "#0f0720" } },
    { name: "Rose", design: { foregroundColor: "#f43f5e", backgroundColor: "#1a0510" }, preview: { fg: "#f43f5e", bg: "#1a0510" } },
    { name: "Classic", design: { foregroundColor: "#000000", backgroundColor: "#ffffff" }, preview: { fg: "#000000", bg: "#ffffff" } },
    { name: "Minimal", design: { foregroundColor: "#374151", backgroundColor: "#f9fafb" }, preview: { fg: "#374151", bg: "#f9fafb" } },
    { name: "Neon", design: { foregroundColor: "#22d3ee", backgroundColor: "#030712" }, preview: { fg: "#22d3ee", bg: "#030712" } },
];

interface QRThemeSelectorProps {
    currentDesign: QRDesign;
    onApplyTheme: (design: QRDesign) => void;
}

export default function QRThemeSelector({ currentDesign, onApplyTheme }: QRThemeSelectorProps) {
    const applyTheme = (theme: QRTheme) => {
        onApplyTheme({ ...currentDesign, ...theme.design });
    };

    return (
        <div>
            <label className="text-sm font-medium text-neutral-300 mb-3 block">Quick Themes</label>
            <div className="grid grid-cols-4 gap-2">
                {builtInThemes.map((theme) => {
                    const isActive = currentDesign.foregroundColor === theme.design.foregroundColor && currentDesign.backgroundColor === theme.design.backgroundColor;
                    return (
                        <button key={theme.name} onClick={() => applyTheme(theme)} className={`group flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all ${isActive ? "ring-2 ring-plasma bg-neutral-800" : "hover:bg-neutral-800/50"}`}>
                            <div className="w-10 h-10 rounded-lg border border-neutral-700 flex items-center justify-center relative overflow-hidden" style={{ background: theme.preview.bg }}>
                                <div className="absolute inset-1 rounded" style={{ background: `repeating-conic-gradient(${theme.preview.fg} 0% 25%, transparent 0% 50%) 0 0 / 6px 6px`, opacity: 0.8 }} />
                            </div>
                            <span className="text-[10px] text-neutral-400 group-hover:text-neutral-200 transition-colors">{theme.name}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}