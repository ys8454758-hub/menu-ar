// lib/business-rules.ts - Business logic validations

import prisma from './prisma';

// Plan limits
export const PLAN_LIMITS = {
  FREE: { dishes: 3, qrCodes: 5, storage: 50 * 1024 * 1024 },
  STARTER: { dishes: 10, qrCodes: 25, storage: 500 * 1024 * 1024 },
  GROWTH: { dishes: 50, qrCodes: 100, storage: 2 * 1024 * 1024 * 1024 },
  PRO: { dishes: -1, qrCodes: -1, storage: 10 * 1024 * 1024 * 1024 }, // -1 = unlimited
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;

// Validate if user can create more dishes
export async function canCreateDish(restaurantId: string): Promise<{ allowed: boolean; reason?: string }> {
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      include: {
        subscription: true,
        _count: {
          select: { dishes: true },
        },
      },
    });

    if (!restaurant) {
      return { allowed: false, reason: 'Restaurant not found' };
    }

    const plan = (restaurant.subscription?.plan || 'FREE') as PlanType;
    const limits = PLAN_LIMITS[plan];
    const currentCount = restaurant._count.dishes;

    if (limits.dishes >= 0 && currentCount >= limits.dishes) {
      return {
        allowed: false,
        reason: `Plan limit reached: ${limits.dishes} dishes. Upgrade to add more.`,
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error('canCreateDish error:', error);
    return { allowed: false, reason: 'Validation error' };
  }
}

// Validate dish name
export function validateDishName(name: string): { valid: boolean; error?: string } {
  const trimmed = name.trim();

  if (!trimmed) {
    return { valid: false, error: 'Dish name is required' };
  }

  if (trimmed.length < 2) {
    return { valid: false, error: 'Dish name must be at least 2 characters' };
  }

  if (trimmed.length > 100) {
    return { valid: false, error: 'Dish name must be less than 100 characters' };
  }

  // Prevent SQL injection attempts (basic check)
  if (/['";\\]/.test(trimmed)) {
    return { valid: false, error: 'Dish name contains invalid characters' };
  }

  return { valid: true };
}

// Validate slug
export function validateSlug(slug: string): { valid: boolean; error?: string } {
  if (!slug) {
    return { valid: false, error: 'Slug is required' };
  }

  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!slugRegex.test(slug)) {
    return { valid: false, error: 'Slug must contain only lowercase letters, numbers, and hyphens' };
  }

  if (slug.length < 2 || slug.length > 100) {
    return { valid: false, error: 'Slug must be between 2 and 100 characters' };
  }

  return { valid: true };
}

// Get file size in MB with 2 decimal places
export function formatFileSize(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(2)} MB`;
}

// Validate GLB file
export function validateGLBFile(file: { size: number; name: string }): { valid: boolean; error?: string } {
  const maxSize = 50 * 1024 * 1024; // 50MB

  if (!file.name.toLowerCase().endsWith('.glb')) {
    return { valid: false, error: 'File must be a .glb file' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: `File size exceeds 50MB limit (${formatFileSize(file.size)})` };
  }

  if (file.size < 1024) {
    return { valid: false, error: 'File too small (must be at least 1KB)' };
  }

  return { valid: true };
}

// Calculate days until subscription expires
export function getDaysUntilExpiry(currentPeriodEnd: Date | null): number {
  if (!currentPeriodEnd) return 0;
  const now = new Date();
  const end = new Date(currentPeriodEnd);
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

// Check if subscription is active
export function isSubscriptionActive(status: string | null): boolean {
  if (!status) return false;
  return status === 'ACTIVE' || status === 'TRIALING';
}
