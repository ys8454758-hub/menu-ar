export interface QRConfig {
  foregroundColor: string;
  backgroundColor: string;
  logoSizePercent: number;
  logoUrl?: string;
  errorCorrection: 'L' | 'M' | 'Q' | 'H';
  frameStyle?: string;
  frameText?: string;
  frameTextColor?: string;
}

export interface ReliabilityBreakdown {
  contrastScore: number;
  ecLevelScore: number;
  logoScore: number;
  frameScore: number;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  if (!rgb1 || !rgb2) return 0;

  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function calculateContrastScore(config: QRConfig): number {
  const ratio = getContrastRatio(config.foregroundColor, config.backgroundColor);
  if (ratio >= 7) return 100;
  if (ratio >= 4.5) return 80;
  if (ratio >= 3) return 60;
  if (ratio >= 2) return 40;
  return 20;
}

function getECLevelScore(level: string): number {
  switch (level) {
    case 'H': return 100;
    case 'Q': return 85;
    case 'M': return 70;
    case 'L': return 50;
    default: return 70;
  }
}

function calculateLogoScore(logoSizePercent: number): number {
  if (logoSizePercent >= 15 && logoSizePercent <= 25) return 100;
  if (logoSizePercent >= 10 && logoSizePercent <= 30) return 80;
  if (logoSizePercent >= 5 && logoSizePercent <= 35) return 60;
  if (logoSizePercent >= 3 && logoSizePercent <= 40) return 40;
  return 20;
}

function calculateFrameScore(config: QRConfig): number {
  if (!config.frameText) return 100;
  const contrast = getContrastRatio(config.frameTextColor || '#000000', config.backgroundColor);
  if (contrast >= 4.5) return 100;
  if (contrast >= 3) return 70;
  if (contrast >= 2) return 40;
  return 20;
}

export function calculateReliabilityScore(config: QRConfig): { score: number; breakdown: ReliabilityBreakdown } {
  const contrastScore = calculateContrastScore(config);
  const ecLevelScore = getECLevelScore(config.errorCorrection);
  const logoScore = calculateLogoScore(config.logoSizePercent);
  const frameScore = calculateFrameScore(config);

  const weightedScore = Math.round(
    (contrastScore * 0.40) +
    (ecLevelScore * 0.30) +
    (logoScore * 0.20) +
    (frameScore * 0.10)
  );

  return {
    score: Math.min(100, Math.max(0, weightedScore)),
    breakdown: {
      contrastScore,
      ecLevelScore,
      logoScore,
      frameScore
    }
  };
}

export function getScoreColor(score: number): string {
  if (score >= 80) return '#10B981';
  if (score >= 60) return '#F59E0B';
  if (score >= 40) return '#F97316';
  return '#EF4444';
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Poor';
}