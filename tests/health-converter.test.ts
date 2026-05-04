import { describe, it, expect } from 'vitest';
import {
  convertCaloriesToSteps,
  formatSteps,
  getDishCategoryFromAllergens,
  SFX_CATEGORIES
} from '../lib/health-converter';

describe('convertCaloriesToSteps', () => {
  it('should return zero values for zero calories', () => {
    const result = convertCaloriesToSteps(0);
    expect(result.steps).toBe(0);
    expect(result.walkingMinutes).toBe(0);
    expect(result.calories).toBe(0);
  });

  it('should return zero values for negative calories', () => {
    const result = convertCaloriesToSteps(-100);
    expect(result.steps).toBe(0);
    expect(result.walkingMinutes).toBe(0);
    expect(result.calories).toBe(0);
  });

  it('should correctly convert calories to steps using 0.04 factor', () => {
    const result = convertCaloriesToSteps(100);
    expect(result.steps).toBe(2500);
    expect(result.walkingMinutes).toBe(29);
    expect(result.calories).toBe(100);
  });

  it('should correctly convert calories to walking minutes using 3.5 MET factor', () => {
    const result = convertCaloriesToSteps(350);
    expect(result.steps).toBe(8750);
    expect(result.walkingMinutes).toBe(100);
    expect(result.calories).toBe(350);
  });

  it('should round steps to nearest integer', () => {
    const result = convertCaloriesToSteps(123);
    expect(result.steps).toBe(3075);
  });
});

describe('formatSteps', () => {
  it('should return number as string for values under 1000', () => {
    expect(formatSteps(500)).toBe('500');
    expect(formatSteps(999)).toBe('999');
    expect(formatSteps(0)).toBe('0');
  });

  it('should format values 1000 and above with k suffix', () => {
    expect(formatSteps(1000)).toBe('1.0k');
    expect(formatSteps(1500)).toBe('1.5k');
    expect(formatSteps(10000)).toBe('10.0k');
  });

  it('should round to one decimal place', () => {
    expect(formatSteps(1500)).toBe('1.5k');
    expect(formatSteps(3333)).toBe('3.3k');
  });
});

describe('getDishCategoryFromAllergens', () => {
  it('should return meat for meat-containing allergens', () => {
    expect(getDishCategoryFromAllergens(['chicken'])).toBe('meat');
    expect(getDishCategoryFromAllergens(['beef'])).toBe('meat');
    expect(getDishCategoryFromAllergens(['pork'])).toBe('meat');
    expect(getDishCategoryFromAllergens(['meat broth'])).toBe('meat');
  });

  it('should return dairy for dairy-containing allergens', () => {
    expect(getDishCategoryFromAllergens(['milk'])).toBe('dairy');
    expect(getDishCategoryFromAllergens(['dairy'])).toBe('dairy');
    expect(getDishCategoryFromAllergens(['cheese'])).toBe('dairy');
    expect(getDishCategoryFromAllergens(['butter'])).toBe('dairy');
  });

  it('should return seafood for seafood-containing allergens', () => {
    expect(getDishCategoryFromAllergens(['fish'])).toBe('seafood');
    expect(getDishCategoryFromAllergens(['shrimp'])).toBe('seafood');
    expect(getDishCategoryFromAllergens(['prawn'])).toBe('seafood');
    expect(getDishCategoryFromAllergens(['seafood'])).toBe('seafood');
  });

  it('should return egg for egg-containing allergens', () => {
    expect(getDishCategoryFromAllergens(['egg'])).toBe('egg');
    expect(getDishCategoryFromAllergens(['egg white'])).toBe('egg');
  });

  it('should return vegetarian for non-specific allergens', () => {
    expect(getDishCategoryFromAllergens(['wheat'])).toBe('vegetarian');
    expect(getDishCategoryFromAllergens(['soy'])).toBe('vegetarian');
    expect(getDishCategoryFromAllergens(['peanuts'])).toBe('vegetarian');
  });

  it('should return vegetarian for empty array', () => {
    expect(getDishCategoryFromAllergens([])).toBe('vegetarian');
  });

  it('should be case-insensitive', () => {
    expect(getDishCategoryFromAllergens(['CHICKEN'])).toBe('meat');
    expect(getDishCategoryFromAllergens(['Milk'])).toBe('dairy');
    expect(getDishCategoryFromAllergens(['FISH'])).toBe('seafood');
  });
});

describe('SFX_CATEGORIES', () => {
  it('should have all required category keys', () => {
    expect(SFX_CATEGORIES).toHaveProperty('vegetarian');
    expect(SFX_CATEGORIES).toHaveProperty('meat');
    expect(SFX_CATEGORIES).toHaveProperty('dairy');
    expect(SFX_CATEGORIES).toHaveProperty('seafood');
    expect(SFX_CATEGORIES).toHaveProperty('egg');
    expect(SFX_CATEGORIES).toHaveProperty('default');
  });
});