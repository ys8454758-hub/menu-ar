"use client";

interface DishInfoProps {
    name: string; description?: string; price: number | null;
    badges: { type: string }[];
    nutrition: { calories: number; protein: number; carbs: number; fat: number; allergens: { name: string }[] } | null;
    ingredients: { name: string }[];
}

const BADGE_COLORS: Record<string, string> = {
    VEGAN: "border-success text-success bg-success/10",
    VEGETARIAN: "border-success text-success bg-success/10",
    GLUTEN_FREE: "border-amber-400 text-amber-400 bg-amber-400/10",
    SPICY: "border-ember text-ember bg-ember/10",
    DAIRY_FREE: "border-neon-violet text-neon-violet bg-neon-violet/10",
    KETO: "border-plasma text-plasma bg-plasma/10",
    HALAL: "border-neon-violet text-neon-violet bg-neon-violet/10",
    JAIN: "border-amber-400 text-amber-400 bg-amber-400/10",
};

export default function DishInfo({ name, description, price, badges, nutrition, ingredients }: DishInfoProps) {
    return (
        <div className="absolute bottom-0 left-0 right-0  /90 backdrop-blur-md border-t border-border p-4 max-h-[50vh] overflow-y-auto">
            <div className="max-w-lg mx-auto space-y-3">
                <div className="flex items-start justify-between gap-3">
                    <h2 className="text-display-sm font-display text-text-primary">{name}</h2>
                    {price != null && <span className="text-body-lg font-mono text-plasma flex-shrink-0">₹{price.toFixed(2)}</span>}
                </div>
                {description && <p className="text-body-sm font-body text-text-secondary">{description}</p>}
                {badges.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {badges.map((b) => (
                            <span key={b.type} className={`px-2 py-0.5 border font-ui text-xs tracking-widest uppercase rounded-none ${BADGE_COLORS[b.type] || "border-border text-text-tertiary bg-surface"}`}>
                                {b.type.replace(/_/g, " ")}
                            </span>
                        ))}
                    </div>
                )}
                {ingredients.length > 0 && (
                    <div>
                        <h3 className="text-body-xs font-ui text-text-tertiary tracking-widest uppercase mb-1">Ingredients</h3>
                        <p className="text-body-sm font-body text-text-secondary">{ingredients.map((i) => i.name).join(", ")}</p>
                    </div>
                )}
                {nutrition && (
                    <div>
                        <h3 className="text-body-xs font-ui text-text-tertiary tracking-widest uppercase mb-2">Nutrition</h3>
                        <div className="grid grid-cols-4 gap-2">
                            {[
                                { val: nutrition.calories, unit: "CAL" },
                                { val: `${nutrition.protein}g`, unit: "PRO" },
                                { val: `${nutrition.carbs}g`, unit: "CARB" },
                                { val: `${nutrition.fat}g`, unit: "FAT" },
                            ].map((n) => (
                                <div key={n.unit} className="border border-border bg-surface p-2 rounded-none text-center">
                                    <p className="text-display-xs font-display text-plasma">{n.val}</p>
                                    <p className="text-body-xs font-ui text-text-tertiary">{n.unit}</p>
                                </div>
                            ))}
                        </div>
                        {nutrition.allergens.length > 0 && (
                            <p className="text-body-xs font-ui text-ember mt-2">⚠ Allergens: {nutrition.allergens.map((a) => a.name).join(", ")}</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}