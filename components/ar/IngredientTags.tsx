"use client";

interface IngredientTagsProps {
    ingredients: string[];
    allergens?: string[];
}

export default function IngredientTags({ ingredients, allergens }: IngredientTagsProps) {
    return (
        <div className="absolute bottom-24 left-4 z-20 max-w-[60vw]">
            <div className="flex flex-wrap gap-1.5">
                {ingredients.map((ing, i) => {
                    const isAllergen = allergens?.some(
                        (a) => ing.toLowerCase().includes(a.toLowerCase())
                    );
                    return (
                        <span
                            key={i}
                            className={
                                "px-2 py-0.5 text-body-xs font-mono border rounded-none " +
                                (isAllergen
                                    ? "border-ember/50 text-ember bg-ember/10"
                                    : "border-border text-text-tertiary  /80")
                            }
                        >
                            {ing}
                            {isAllergen ? " *" : ""}
                        </span>
                    );
                })}
            </div>
            {allergens && allergens.length > 0 && (
                <p className="text-body-xs font-mono text-ember/70 mt-1.5">
                    * Contains allergen
                </p>
            )}
        </div>
    );
}