// lib/health-converter.ts

export interface HealthConversionResult {
  steps: number;
  walkingMinutes: number;
  calories: number;
}

export function convertCaloriesToSteps(calories: number): HealthConversionResult {
  if (calories <= 0) {
    return { steps: 0, walkingMinutes: 0, calories: 0 };
  }

  const steps = Math.round(calories / 0.04);

  const walkingMinutes = Math.round(calories / 3.5);

  return {
    steps,
    walkingMinutes,
    calories
  };
}

export function formatSteps(steps: number): string {
  if (steps >= 1000) {
    return `${(steps / 1000).toFixed(1)}k`;
  }
  return steps.toString();
}

export function getDishCategoryFromAllergens(allergens: string[]): string {
  const allergenLower = allergens.map(a => a.toLowerCase());

  if (allergenLower.some(a => a.includes('meat') || a.includes('chicken') || a.includes('beef') || a.includes('pork'))) {
    return 'meat';
  }
  if (allergenLower.some(a => a.includes('dairy') || a.includes('milk') || a.includes('cheese') || a.includes('butter'))) {
    return 'dairy';
  }
  if (allergenLower.some(a => a.includes('seafood') || a.includes('fish') || a.includes('shrimp') || a.includes('prawn'))) {
    return 'seafood';
  }
  if (allergenLower.some(a => a.includes('egg'))) {
    return 'egg';
  }

  return 'vegetarian';
}

export const SFX_CATEGORIES: Record<string, string> = {
  vegetarian: '/sounds/ambient-nature.mp3',
  meat: '/sounds/sizzle-meat.mp3',
  dairy: '/sounds/cream-pour.mp3',
  seafood: '/sounds/ocean-waves.mp3',
  egg: '/sounds/light-sizzle.mp3',
  default: '/sounds/ambient-restaurant.mp3'
};