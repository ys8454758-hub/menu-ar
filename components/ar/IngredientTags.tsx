"use client";

import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface IngredientTagsProps {
  ingredients: { name: string }[];
  allergens?: string[];
  className?: string;
}

export default function IngredientTags({ ingredients, allergens = [], className }: IngredientTagsProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {ingredients.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-body-sm font-ui text-text-secondary tracking-wider uppercase">
            Ingredients
          </h3>
          <div className="flex flex-wrap gap-2">
            {ingredients.map((ingredient, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-surface border border-border text-text-secondary font-body text-xs"
              >
                {ingredient.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {allergens.length > 0 && (
        <div className="p-4 border border-ember/30 bg-ember/5 rounded-none">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-ember shrink-0 mt-0.5" />
            <div>
              <p className="text-body-sm font-ui text-ember tracking-wider uppercase mb-2">
                Allergen Warning
              </p>
              <p className="text-body-sm font-body text-text-secondary">
                May contain: {allergens.join(", ")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}