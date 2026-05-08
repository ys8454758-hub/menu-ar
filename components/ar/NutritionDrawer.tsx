"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Flame, Beef, Wheat, Droplets } from "lucide-react";
import { cn } from "@/lib/utils";

interface NutritionData {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sodium?: number;
  sugar?: number;
  servingSize?: string;
}

interface NutritionDrawerProps {
  nutrition: NutritionData | null;
  className?: string;
}

const NUTRIENT_ICONS: Record<string, React.ReactNode> = {
  calories: <Flame className="w-4 h-4" />,
  protein: <Beef className="w-4 h-4" />,
  carbs: <Wheat className="w-4 h-4" />,
  fat: <Droplets className="w-4 h-4" />,
};

export default function NutritionDrawer({ nutrition, className }: NutritionDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!nutrition) return null;

  const nutrients = [
    { key: "calories", label: "Calories", value: nutrition.calories, unit: "" },
    { key: "protein", label: "Protein", value: nutrition.protein, unit: "g" },
    { key: "carbs", label: "Carbs", value: nutrition.carbs, unit: "g" },
    { key: "fat", label: "Fat", value: nutrition.fat, unit: "g" },
    { key: "fiber", label: "Fiber", value: nutrition.fiber, unit: "g" },
    { key: "sodium", label: "Sodium", value: nutrition.sodium, unit: "mg" },
    { key: "sugar", label: "Sugar", value: nutrition.sugar, unit: "g" },
  ].filter(n => n.value !== undefined && n.value !== null);

  return (
    <div className={cn("", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 border border-border bg-terminal hover:border-plasma/50 transition-colors"
      >
        <span className="text-body-md font-ui text-text-accent tracking-wider">Nutrition</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-text-secondary" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 border-x border-b border-border bg-terminal/50 space-y-4">
              {nutrition.servingSize && (
                <p className="text-body-sm font-body text-text-secondary">
                  Serving size: {nutrition.servingSize}
                </p>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {nutrients.map((nutrient) => (
                  <div key={nutrient.key} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-plasma/10 flex items-center justify-center text-plasma">
                      {NUTRIENT_ICONS[nutrient.key]}
                    </div>
                    <div>
                      <p className="text-body-xs font-body text-text-secondary">{nutrient.label}</p>
                      <p className="text-body-md font-mono text-text-accent">
                        {nutrient.value}{nutrient.unit}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}