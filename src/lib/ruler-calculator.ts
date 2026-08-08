/**
 * Organic Timeline Ruler Range Generator for YearGuessr
 * Computes minYear & maxYear bounds around correctYear based on difficulty level.
 */

export interface RulerRange {
  minYear: number;
  maxYear: number;
}

export type DifficultyLevel = 'facil' | 'normal' | 'dificil';

export function generateOrganicRulerRange(
  correctYear: number,
  difficulty: DifficultyLevel = 'normal'
): RulerRange {
  const currentYear = new Date().getFullYear(); // e.g. 2026

  let minSpan: number;
  let maxSpan: number;

  switch (difficulty) {
    case 'facil':
      // Easy: Wider spacing (~180 to ~320 years span) so slider steps represent larger chunks
      minSpan = 180;
      maxSpan = 320;
      break;

    case 'dificil':
      // Hard: Narrow precision spacing (~35 to ~75 years span) requiring exact historical era knowledge
      minSpan = 35;
      maxSpan = 75;
      break;

    case 'normal':
    default:
      // Normal: Balanced spacing (~90 to ~160 years span)
      minSpan = 90;
      maxSpan = 160;
      break;
  }

  // Add random variance to total span
  const targetSpan = Math.floor(minSpan + Math.random() * (maxSpan - minSpan));

  // Position correctYear organically between 28% and 72% along the slider (not dead-center)
  const percentOffset = 0.28 + Math.random() * 0.44;
  const leftYears = Math.round(targetSpan * percentOffset);
  const rightYears = targetSpan - leftYears;

  let minYear = correctYear - leftYears;
  let maxYear = correctYear + rightYears;

  // Clamp limits for modern years (> 1990)
  if (maxYear > currentYear) {
    const overflow = maxYear - currentYear;
    maxYear = currentYear;
    minYear = Math.max(1000, minYear - overflow);
  }

  // Ensure minimum year is at least 1000
  if (minYear < 1000) {
    const underflow = 1000 - minYear;
    minYear = 1000;
    maxYear = Math.min(currentYear, maxYear + underflow);
  }

  // Ensure minYear < correctYear < maxYear
  if (minYear >= correctYear) minYear = Math.max(1000, correctYear - 20);
  if (maxYear <= correctYear) maxYear = Math.min(currentYear, correctYear + 20);

  return { minYear, maxYear };
}
