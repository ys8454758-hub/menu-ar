export function computeDishHealthScore(dish: {
  scanEvents?: { id: string }[];
  model?: { qualityRating: number | null } | null;
  updatedAt: string | Date;
}): number {
  const scanCount = dish.scanEvents?.length || 0;
  const qualityRating = dish.model?.qualityRating ?? 0;
  const updatedAt = typeof dish.updatedAt === 'string' ? new Date(dish.updatedAt) : dish.updatedAt;
  const daysSinceUpdate = Math.floor((Date.now() - updatedAt.getTime()) / (1000 * 60 * 60 * 24));

  const scanScore = Math.min(scanCount / 100, 1) * 40;
  const modelScore = (qualityRating / 5) * 30;
  const freshnessScore = Math.max(0, (45 - daysSinceUpdate) / 45) * 30;

  return Math.round(scanScore + modelScore + freshnessScore);
}

export function getHealthScoreColor(score: number): string {
  if (score >= 80) return 'text-success';
  if (score >= 50) return 'text-amber-400';
  return 'text-ember';
}

export function getHealthScoreBg(score: number): string {
  if (score >= 80) return 'bg-success/10 border-success/30';
  if (score >= 50) return 'bg-amber-400/10 border-amber-400/30';
  return 'bg-ember/10 border-ember/30';
}

export function getHealthScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 50) return 'Good';
  return 'Needs Attention';
}