"use client";

import { useState, useRef } from "react";
import ARModelViewer from "@/components/ar/ModelViewer";
import ARActionHub from "@/components/ar/ARActionHub";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import { convertCaloriesToSteps, formatSteps } from "@/lib/health-converter";

interface Annotation {
  label: string;
  position: { x: number; y: number; z: number };
  description?: string;
}

interface DishViewClientProps {
  dish: {
    name: string;
    description?: string;
    price?: number;
    restaurant: {
      name: string;
      phone?: string;
      logoUrl?: string;
    };
    model?: {
      glbUrl?: string;
      arSizeLocked: boolean;
      scaleX: number;
      scaleY: number;
      scaleZ: number;
      annotations?: Annotation[];
    };
    badges: { type: string }[];
    ingredients: { name: string }[];
    nutrition?: {
      calories?: number;
      protein?: number;
      carbs?: number;
      fat?: number;
      fiber?: number;
      sodium?: number;
      sugar?: number;
      servingSize?: string;
      allergens: { name: string }[];
    };
  };
}

const DIETARY_OPTIONS = [
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Dairy-Free",
  "Nut-Free",
  "Halal",
  "Kosher",
];

export default function DishViewClient({ dish }: DishViewClientProps) {
  const [dietaryFilters, setDietaryFilters] = useState<string[]>([]);
  const [showDietaryPanel, setShowDietaryPanel] = useState(false);
  const [isGhosted, setIsGhosted] = useState(false);
  const modelRef = useRef<HTMLElement | null>(null);

  const scale = dish.model
    ? { x: dish.model.scaleX, y: dish.model.scaleY, z: dish.model.scaleZ }
    : { x: 1, y: 1, z: 1 };

  const badges = dish.badges.map((b) => ({
    label: b.type,
    color: "#00FFD1",
  }));

  const nutrition = dish.nutrition
    ? {
        calories: dish.nutrition.calories,
        protein: dish.nutrition.protein,
        carbs: dish.nutrition.carbs,
        fat: dish.nutrition.fat,
        fiber: dish.nutrition.fiber,
        sodium: dish.nutrition.sodium,
        sugar: dish.nutrition.sugar,
        servingSize: dish.nutrition.servingSize,
        allergens: dish.nutrition.allergens.map((a) => a.name),
      }
    : null;

  const allergenNames = nutrition?.allergens || [];
  const ingredientNames = dish.ingredients.map((i) => i.name);

  const hasConflict =
    dietaryFilters.length > 0 &&
    allergenNames.some((allergen) => {
      const lowerAllergen = allergen.toLowerCase();
      if (
        dietaryFilters.includes("Vegetarian") ||
        dietaryFilters.includes("Vegan")
      ) {
        if (
          lowerAllergen.includes("meat") ||
          lowerAllergen.includes("chicken") ||
          lowerAllergen.includes("beef") ||
          lowerAllergen.includes("pork") ||
          lowerAllergen.includes("fish") ||
          lowerAllergen.includes("seafood") ||
          lowerAllergen.includes("egg")
        ) {
          return true;
        }
      }
      if (dietaryFilters.includes("Dairy-Free")) {
        if (
          lowerAllergen.includes("dairy") ||
          lowerAllergen.includes("milk") ||
          lowerAllergen.includes("cheese") ||
          lowerAllergen.includes("butter")
        ) {
          return true;
        }
      }
      if (dietaryFilters.includes("Gluten-Free")) {
        if (lowerAllergen.includes("gluten") || lowerAllergen.includes("wheat")) {
          return true;
        }
      }
      return false;
    });

  const healthConversion =
    nutrition?.calories ? convertCaloriesToSteps(nutrition.calories) : null;

  const toggleDietaryFilter = (filter: string) => {
    setDietaryFilters((prev) => {
      const newFilters = prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter];

      const hasConflict =
        newFilters.length > 0 &&
        allergenNames.some((allergen) => {
          const lowerAllergen = allergen.toLowerCase();
          if (
            newFilters.includes("Vegetarian") ||
            newFilters.includes("Vegan")
          ) {
            if (
              lowerAllergen.includes("meat") ||
              lowerAllergen.includes("chicken") ||
              lowerAllergen.includes("beef") ||
              lowerAllergen.includes("pork") ||
              lowerAllergen.includes("fish") ||
              lowerAllergen.includes("seafood") ||
              lowerAllergen.includes("egg")
            ) {
              return true;
            }
          }
          if (newFilters.includes("Dairy-Free")) {
            if (
              lowerAllergen.includes("dairy") ||
              lowerAllergen.includes("milk") ||
              lowerAllergen.includes("cheese") ||
              lowerAllergen.includes("butter")
            ) {
              return true;
            }
          }
          return false;
        });

      setIsGhosted(hasConflict);
      return newFilters;
    });
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-terminal/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-body-lg font-display text-text-accent tracking-wider">
                {dish.name}
              </h1>
              <p className="text-body-xs font-body text-text-secondary">
                {dish.restaurant.name}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <LanguageSwitcher />
              {dish.price && (
                <div className="text-body-lg font-mono text-plasma mt-1">
                  ₹{dish.price.toFixed(2)}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 3D Model Viewer */}
        {dish.model?.glbUrl ? (
          <div
            className="relative group"
            style={{
              filter: isGhosted ? "grayscale(1) opacity(0.5)" : "none",
              transition: "filter 0.5s ease-in-out",
            }}
          >
            <ARModelViewer
              ref={modelRef}
              glbUrl={dish.model.glbUrl}
              dishName={dish.name}
              scale={scale}
              arSizeLocked={dish.model.arSizeLocked}
              annotations={dish.model.annotations || []}
              allergens={allergenNames}
            />
            <ARActionHub
              modelRef={modelRef}
              dishName={dish.name}
              restaurantName={dish.restaurant.name}
              ingredients={ingredientNames}
            />
            <div className="absolute bottom-6 right-6 z-10 pointer-events-none flex flex-col items-center gap-2 animate-bounce opacity-80 group-hover:opacity-100 transition-opacity">
              <div className="w-12 h-12 bg-void/60 backdrop-blur-md rounded-full border border-plasma flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.4)]">
                <span className="text-plasma font-display tracking-widest text-lg">
                  AR
                </span>
              </div>
              <span className="text-[10px] font-ui text-plasma tracking-widest uppercase bg-void/80 px-2 py-0.5 border border-plasma/30 shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                Tap to View in Space
              </span>
            </div>
          </div>
        ) : (
          <div className="w-full h-96 bg-terminal rounded-none border border-border flex items-center justify-center">
            <p className="text-body-md font-body text-text-secondary">
              3D model not available for this dish
            </p>
          </div>
        )}

        {/* Dietary Preferences Toggle */}
        <div className="space-y-2">
          <button
            onClick={() => setShowDietaryPanel(!showDietaryPanel)}
            className="flex items-center gap-2 text-body-md font-display text-text-accent tracking-wider"
          >
            <span>🥗</span>
            Dietary Preferences
            {isGhosted && (
              <span className="text-ember text-body-xs font-body animate-pulse">
                (Showing filtered view)
              </span>
            )}
          </button>
          <div className="flex flex-wrap gap-2">
            {DIETARY_OPTIONS.map((option) => (
              <button
                key={option}
                onClick={() => toggleDietaryFilter(option)}
                className={`px-3 py-1.5 border rounded-none font-ui text-xs tracking-widest uppercase transition-colors ${
                  dietaryFilters.includes(option)
                    ? "bg-neon-violet/20 border-neon-violet text-neon-violet"
                    : "bg-terminal border-border text-text-secondary hover:border-neon-violet"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          {hasConflict && (
            <div className="mt-2 p-3 border border-ember/30 bg-ember/5 rounded-none">
              <p className="text-body-sm font-body text-ember">
                ⚠️ This dish contains allergens that conflict with your dietary
                preferences. The view above is dimmed.
              </p>
            </div>
          )}
        </div>

        {/* Description */}
        {dish.description && (
          <div className="space-y-2">
            <h2 className="text-body-md font-display text-text-accent tracking-wider">
              Description
            </h2>
            <p className="text-body-sm font-body text-text-secondary">
              {dish.description}
            </p>
          </div>
        )}

        {/* Dietary Badges */}
        {badges.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-body-md font-display text-text-accent tracking-wider">
              Dietary Information
            </h2>
            <div className="flex flex-wrap gap-2">
              {badges.map((badge, index) => (
                <span
                  key={index}
                  className="px-3 py-1 border border-plasma text-plasma font-ui text-xs tracking-widest uppercase rounded-none"
                >
                  {badge.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Ingredients */}
        {dish.ingredients.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-body-md font-display text-text-accent tracking-wider">
              Ingredients
            </h2>
            <div className="flex flex-wrap gap-2">
              {dish.ingredients.map((ingredient, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-surface border border-border text-text-secondary font-body text-xs rounded-none"
                >
                  {ingredient.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Nutrition */}
        {nutrition && (
          <div className="space-y-2">
            <h2 className="text-body-md font-display text-text-accent tracking-wider">
              Nutrition
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {nutrition.calories && (
                <div className="border border-border bg-terminal p-3 rounded-none">
                  <p className="text-body-xs font-body text-text-secondary">
                    Calories
                  </p>
                  <p className="text-body-lg font-mono text-plasma">
                    {nutrition.calories}
                  </p>
                </div>
              )}
              {nutrition.protein && (
                <div className="border border-border bg-terminal p-3 rounded-none">
                  <p className="text-body-xs font-body text-text-secondary">
                    Protein
                  </p>
                  <p className="text-body-lg font-mono text-plasma">
                    {nutrition.protein}g
                  </p>
                </div>
              )}
              {nutrition.carbs && (
                <div className="border border-border bg-terminal p-3 rounded-none">
                  <p className="text-body-xs font-body text-text-secondary">
                    Carbs
                  </p>
                  <p className="text-body-lg font-mono text-plasma">
                    {nutrition.carbs}g
                  </p>
                </div>
              )}
              {nutrition.fat && (
                <div className="border border-border bg-terminal p-3 rounded-none">
                  <p className="text-body-xs font-body text-text-secondary">
                    Fat
                  </p>
                  <p className="text-body-lg font-mono text-plasma">
                    {nutrition.fat}g
                  </p>
                </div>
              )}
            </div>

            {/* Step Converter Card */}
            {healthConversion && (
              <div className="mt-4 p-4 border border-neon-violet/30 bg-neon-violet/5 rounded-none">
                <p className="text-body-sm font-display text-neon-violet mb-3 tracking-wider">
                  🔄 Calorie to Activity Converter
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">👟</span>
                    <div>
                      <p className="text-body-lg font-mono text-plasma">
                        {formatSteps(healthConversion.steps)}
                      </p>
                      <p className="text-body-xs font-body text-text-secondary">
                        Steps
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🚶</span>
                    <div>
                      <p className="text-body-lg font-mono text-plasma">
                        {healthConversion.walkingMinutes}
                      </p>
                      <p className="text-body-xs font-body text-text-secondary">
                        Walking Minutes
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-body-xs font-body text-text-tertiary mt-3">
                  Based on 70kg adult • Walking at moderate pace (3.5 METs)
                </p>
              </div>
            )}

            {nutrition.allergens.length > 0 && (
              <div className="mt-4 p-4 border border-ember/30 bg-ember/5 rounded-none">
                <p className="text-body-sm font-body text-ember mb-2">
                  ⚠️ Allergen Warning
                </p>
                <p className="text-body-xs font-body text-text-secondary">
                  May contain: {nutrition.allergens.join(", ")}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border">
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `${dish.name} at ${dish.restaurant.name}`,
                  text: `Check out this dish in 3D AR!`,
                  url: window.location.href,
                });
              }
            }}
            className="flex-1 rounded-none border border-plasma bg-transparent text-plasma px-4 py-3 font-ui text-sm tracking-widest uppercase hover:bg-plasma/10 transition-colors"
          >
            Share Dish
          </button>
          {dish.restaurant.phone && (
            <a
              href={`tel:${dish.restaurant.phone}`}
              className="flex-1 rounded-none bg-plasma text-void px-4 py-3 font-ui text-sm tracking-widest uppercase hover:bg-plasma/90 transition-colors text-center"
            >
              Call Waiter
            </a>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center">
          <p className="text-body-xs font-body text-text-tertiary">
            Powered by Livin3D • Experience food in Augmented Reality
          </p>
        </div>
      </footer>
    </div>
  );
}