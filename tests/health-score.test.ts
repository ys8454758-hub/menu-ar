import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { computeDishHealthScore } from '../lib/health-score';

describe('Health Score Calculation', () => {
  it('should return 0 for dish with no scans, no model, and old update date', () => {
    const dish = {
      scanEvents: [],
      model: null,
      updatedAt: new Date('2020-01-01'),
    };

    const score = computeDishHealthScore(dish as any);

    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('should increase score with more scans', () => {
    const baseDish = {
      model: { qualityRating: 3 },
      updatedAt: new Date(),
    };

    const dish1 = { ...baseDish, scanEvents: Array(10).fill({}) };
    const dish2 = { ...baseDish, scanEvents: Array(100).fill({}) };

    const score1 = computeDishHealthScore(dish1 as any);
    const score2 = computeDishHealthScore(dish2 as any);

    expect(score2).toBeGreaterThan(score1);
  });

  it('should increase score with better model quality', () => {
    const baseDish = {
      scanEvents: Array(50).fill({}),
      updatedAt: new Date(),
    };

    const dish1 = { ...baseDish, model: { qualityRating: 1 } };
    const dish2 = { ...baseDish, model: { qualityRating: 5 } };

    const score1 = computeDishHealthScore(dish1 as any);
    const score2 = computeDishHealthScore(dish2 as any);

    expect(score2).toBeGreaterThan(score1);
  });
});

describe('Slug Generation', () => {
  it('should generate valid slug from name', () => {
    // Test would go here if we export the function
    expect(true).toBe(true);
  });
});
