import { perMealProteinGkg, mealDistribution, fiberTargetG } from '../distribution';

describe('perMealProteinGkg', () => {
  it('returns 0.24 g/kg for adults up to 50', () => {
    expect(perMealProteinGkg(18)).toBe(0.24);
    expect(perMealProteinGkg(35)).toBe(0.24);
    expect(perMealProteinGkg(50)).toBe(0.24);
  });

  it('returns 0.4 g/kg for adults 65+', () => {
    expect(perMealProteinGkg(65)).toBe(0.4);
    expect(perMealProteinGkg(80)).toBe(0.4);
  });

  it('interpolates linearly between 50 and 65', () => {
    // At age 57.5 (midpoint) → 0.32 g/kg.
    expect(perMealProteinGkg(57.5)).toBeCloseTo(0.32, 4);
  });
});

describe('mealDistribution', () => {
  it('snaps a 30-year-old 80 kg user to a 20-g floor and reasonable meal count', () => {
    // mpsGkg = 0.24, perMealG = max(20, round(0.24 × 80 = 19.2)) = 20.
    // proteinG = 160 → meals = round(160/20) = 8 → clamp to 5.
    const d = mealDistribution(80, 30, 160);
    expect(d.lowG).toBe(20);
    expect(d.highG).toBe(28);
    expect(d.mealsPerDay).toBe(5);
  });

  it('lifts per-meal grams for an older 80 kg user', () => {
    // mpsGkg = 0.4, perMealG = round(0.4 × 80 = 32) = 32.
    // proteinG = 120 → meals = round(120/32) = 4 (within 3–5 clamp).
    const d = mealDistribution(80, 70, 120);
    expect(d.lowG).toBe(32);
    expect(d.highG).toBe(40); // capped at MPS_PER_MEAL_MAX_G
    expect(d.mealsPerDay).toBe(4);
  });

  it('never returns fewer than 3 or more than 5 meals', () => {
    expect(mealDistribution(80, 30, 30).mealsPerDay).toBeGreaterThanOrEqual(3);
    expect(mealDistribution(120, 30, 500).mealsPerDay).toBeLessThanOrEqual(5);
  });
});

describe('fiberTargetG', () => {
  it('returns 14 g per 1000 kcal', () => {
    expect(fiberTargetG(2000)).toBeCloseTo(28, 4);
    expect(fiberTargetG(2500)).toBeCloseTo(35, 4);
    expect(fiberTargetG(1500)).toBeCloseTo(21, 4);
  });
});
