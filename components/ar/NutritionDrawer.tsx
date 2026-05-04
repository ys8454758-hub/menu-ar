"use client";
import { useState } from "react";

interface NutritionInfo {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
}

interface NutritionDrawerProps {
    nutrition: NutritionInfo;
    servingSize?: string;
}

export default function NutritionDrawer({ nutrition, servingSize }: NutritionDrawerProps) {
    const [open, setOpen] = useState(false);
    const items = [
        { l: "Calories", v: nutrition.calories, u: "kcal", c: "text-ember" },
        { l: "Protein", v: nutrition.protein, u: "g", c: "text-plasma" },
        { l: "Carbs", v: nutrition.carbs, u: "g", c: "text-solar" },
        { l: "Fat", v: nutrition.fat, u: "g", c: "text-ember" },
        { l: "Fiber", v: nutrition.fiber, u: "g", c: "text-success" },
        { l: "Sugar", v: nutrition.sugar, u: "g", c: "text-solar" },
        { l: "Sodium", v: nutrition.sodium, u: "mg", c: "text-text-tertiary" },
    ];
    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="absolute bottom-24 right-4 z-20 flex items-center gap-2 px-3 py-2 rounded-none border  /80 border-border text-text-tertiary hover:border-plasma/50 transition-all duration-300"
            >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M8 1v14M1 8h14" stroke="currentColor" strokeWidth="1" opacity="0.5" />
                </svg>
                <span className="text-body-xs font-mono tracking-widest">NUTRITION</span>
            </button>
            {open && (
                <div className="absolute inset-0 z-30 flex items-end justify-center">
                    <div className="absolute inset-0  /60 backdrop-blur-sm" onClick={() => setOpen(false)} />
                    <div className="relative w-full max-w-md   border-t border-plasma/30 p-6 animate-materialize">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-heading-md font-display text-plasma tracking-widest">NUTRITION</h3>
                            <button onClick={() => setOpen(false)} className="text-text-tertiary hover:text-plasma transition-colors">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" />
                                </svg>
                            </button>
                        </div>
                        {servingSize && (
                            <p className="text-body-xs font-mono text-text-tertiary mb-4">
                                PER {servingSize.toUpperCase()}
                            </p>
                        )}
                        <div className="space-y-3">
                            {items.map((n) => (
                                <div key={n.l} className="flex justify-between items-center border-b border-border/50 pb-2">
                                    <span className="text-body-sm font-mono text-text-secondary">{n.l}</span>
                                    <span className={"text-body-sm font-mono " + n.c}>
                                        {n.v ?? "\u2014"} {n.u}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}