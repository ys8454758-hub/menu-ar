// lib/health-score.ts
import { differenceInDays } from "date-fns";

interface DishWithRelations {
    scanEvents: { id: string }[];
    model?: {
        qualityRating: number | null;
    } | null;
    updatedAt: Date | string;
}

/**
 * Compute a health score (0-100) for a dish based on:
 * - Scan count contribution (40%)
 * - Model quality (30%)
 * - Freshness / update recency (30%)
 */
export function computeDishHealthScore(dish: DishWithRelations): number {
    let score = 0;

    // Scan count contribution (40%)
    const scanScore = Math.min(dish.scanEvents.length / 100, 1) * 40;

    // Model quality (30%)
    const modelScore = ((dish.model?.qualityRating ?? 0) / 5) * 30;

    // Freshness (30%) — 0 if > 45 days old, 30 if updated today
    const daysSinceUpdate = differenceInDays(new Date(), dish.updatedAt);
    const freshnessScore = Math.max(0, ((45 - daysSinceUpdate) / 45)) * 30;

    score = scanScore + modelScore + freshnessScore;
    return Math.round(score);
}

/**
 * Calculate QR scan reliability score based on design config
 */
export function calculateReliabilityScore(config: {
    errorCorrectionLevel: string;
    hasLogo: boolean;
    logoSizePercent?: number;
    foregroundColor: string;
    backgroundColor: string;
    frameStyle?: string;
}): number {
    let score = 100;

    const ecLevel = config.errorCorrectionLevel.toUpperCase();
    if (ecLevel === "L") score -= 30;
    else if (ecLevel === "M") score -= 15;
    else if (ecLevel === "Q") score -= 5;

    if (config.hasLogo) {
        score -= 5;
        const logoSize = config.logoSizePercent ?? 20;
        if (logoSize > 25) score -= 15;
        else if (logoSize > 20) score -= 10;
        else if (logoSize > 15) score -= 5;
    }

    const contrastPenalty = calculateColorContrastPenalty(
        config.foregroundColor,
        config.backgroundColor
    );
    score -= contrastPenalty;

    if (config.frameStyle && config.frameStyle !== "none" && config.frameStyle !== "NONE") {
        score -= 5;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
}

function calculateColorContrastPenalty(foreground: string, background: string): number {
    const fg = parseColor(foreground);
    const bg = parseColor(background);
    const luminance1 = getLuminance(fg);
    const luminance2 = getLuminance(bg);
    const contrastRatio =
        (Math.max(luminance1, luminance2) + 0.05) /
        (Math.min(luminance1, luminance2) + 0.05);

    if (contrastRatio < 3) return 20;
    if (contrastRatio < 4.5) return 10;
    if (contrastRatio < 7) return 5;
    return 0;
}

function parseColor(color: string): { r: number; g: number; b: number } {
    if (color.startsWith("#")) {
        const hex = color.slice(1);
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        return { r, g, b };
    }
    if (color.startsWith("rgb")) {
        const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (match) {
            return { r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]) };
        }
    }
    return { r: 255, g: 255, b: 255 };
}

function getLuminance(color: { r: number; g: number; b: number }): number {
    const { r, g, b } = color;
    const [rs, gs, bs] = [r, g, b].map((c) => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}