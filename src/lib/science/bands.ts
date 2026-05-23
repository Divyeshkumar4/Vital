/**
 * BMI and body-fat category labels. Spec: /docs/METHODOLOGY.md § 10.
 */
import type { BmiPopulation, Sex } from './types';
import { BMI_THRESHOLDS } from './constants';

export function bmi(weightKg: number, heightCm: number): number {
  const m = heightCm / 100;
  return weightKg / (m * m);
}

export function bmiBand(bmiValue: number, population: BmiPopulation = 'standard'): string {
  const t = BMI_THRESHOLDS[population];
  if (bmiValue < t.underweight) return 'Underweight';
  if (bmiValue < t.normal) return 'Normal';
  if (bmiValue < t.overweight) return 'Overweight';
  if (bmiValue < t.obese1) return 'Obese I';
  if (bmiValue < t.obese2) return 'Obese II';
  return 'Obese III';
}

/**
 * ACE 2009 body-fat % category labels (with NSCA overlap).
 * Treat as orienting bands, not precision diagnoses.
 */
export function bodyFatCategory(bf: number, sex: Sex): string {
  if (sex === 'female') {
    if (bf < 14) return 'Essential / very lean';
    if (bf < 21) return 'Athletic';
    if (bf < 25) return 'Fit';
    if (bf < 32) return 'Average';
    return 'High';
  }
  // Male and non-binary use male thresholds as the more conservative reference.
  if (bf < 6) return 'Essential / very lean';
  if (bf < 14) return 'Athletic';
  if (bf < 18) return 'Fit';
  if (bf < 25) return 'Average';
  return 'High';
}
