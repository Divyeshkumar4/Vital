import {
  activityFactorOf,
  tdee,
  calorieFloor,
  applyGoalAdjustment,
  clampToFloor,
  clampToLossRate,
} from '../energy';
import { ACTIVITY_FACTORS, conventionalCalorieMinimum } from '../constants';

describe('activityFactorOf', () => {
  it('returns the documented multipliers', () => {
    expect(activityFactorOf('sedentary')).toBe(1.2);
    expect(activityFactorOf('light')).toBe(1.375);
    expect(activityFactorOf('moderate')).toBe(1.55);
    expect(activityFactorOf('very')).toBe(1.725);
    expect(activityFactorOf('extra')).toBe(1.9);
  });
});

describe('tdee', () => {
  // BMR 1780, moderate (1.55) → 2759
  it('multiplies BMR by activity factor', () => {
    expect(tdee(1780, ACTIVITY_FACTORS.moderate)).toBeCloseTo(2759, 0);
  });
});

describe('calorieFloor', () => {
  it('returns the larger of BMR or the conventional sex minimum', () => {
    // Low BMR (e.g. 1100) is below the 1200/1500 floor → returns the floor.
    expect(calorieFloor(1100, 'female')).toBe(1200);
    expect(calorieFloor(1100, 'male')).toBe(1500);
    // BMR above the floor → returns BMR.
    expect(calorieFloor(1800, 'female')).toBe(1800);
  });

  it('matches conventionalCalorieMinimum constants', () => {
    expect(conventionalCalorieMinimum('female')).toBe(1200);
    expect(conventionalCalorieMinimum('male')).toBe(1500);
    expect(conventionalCalorieMinimum('nb')).toBe(1200);
  });
});

describe('applyGoalAdjustment', () => {
  it('returns TDEE unchanged for maintain', () => {
    const r = applyGoalAdjustment(2500, 'maintain', {});
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.finalCalories).toBe(2500);
      expect(r.pctApplied).toBe(0);
    }
  });

  it('applies a valid surplus', () => {
    const r = applyGoalAdjustment(2500, 'gain', { surplusPct: 10 });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.finalCalories).toBe(2750);
      expect(r.pctApplied).toBe(10);
    }
  });

  it('rejects surplus above the 20% cap', () => {
    const r = applyGoalAdjustment(2500, 'gain', { surplusPct: 25 });
    expect(r.ok).toBe(false);
  });

  it('applies a valid deficit', () => {
    const r = applyGoalAdjustment(2500, 'lose', { deficit: { pct: 20, supervised: false } });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.finalCalories).toBe(2000);
      expect(r.pctApplied).toBe(-20);
    }
  });

  it('rejects deficit above 25% without supervision flag', () => {
    const r = applyGoalAdjustment(2500, 'lose', { deficit: { pct: 30, supervised: false } });
    expect(r.ok).toBe(false);
  });

  it('allows deficit up to 40% with supervised flag', () => {
    const r = applyGoalAdjustment(2500, 'lose', { deficit: { pct: 35, supervised: true } });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.finalCalories).toBe(2500 * 0.65);
  });

  it('rejects deficit above 40% even with supervision', () => {
    const r = applyGoalAdjustment(2500, 'lose', { deficit: { pct: 45, supervised: true } });
    expect(r.ok).toBe(false);
  });
});

describe('clampToFloor', () => {
  it('clamps below the floor and reports the clamp', () => {
    // BMR 1400 for female → floor = max(1400, 1200) = 1400. Candidate 1000 → clamp to 1400.
    const r = clampToFloor(1000, 1400, 'female');
    expect(r.finalCalories).toBe(1400);
    expect(r.flooredTo).toBe(1400);
  });

  it('returns candidate unchanged when above the floor', () => {
    const r = clampToFloor(2000, 1400, 'female');
    expect(r.finalCalories).toBe(2000);
    expect(r.flooredTo).toBeNull();
  });

  it('uses conventional minimum when BMR is lower', () => {
    // Tiny BMR 1100, female → floor 1200. Candidate 1100 → clamp to 1200.
    const r = clampToFloor(1100, 1100, 'female');
    expect(r.finalCalories).toBe(1200);
    expect(r.flooredTo).toBe(1200);
  });
});

describe('clampToLossRate (METHODOLOGY § 4.5 — ≤ 1% BW/week)', () => {
  it('passes maintain/gain through unchanged', () => {
    expect(clampToLossRate(2000, 2500, 80, 'maintain')).toEqual({
      finalCalories: 2000,
      easedFromRatePct: null,
    });
    expect(clampToLossRate(2750, 2500, 80, 'gain')).toEqual({
      finalCalories: 2750,
      easedFromRatePct: null,
    });
  });

  it('leaves a within-cap deficit unchanged', () => {
    // 80 kg, TDEE 2500, candidate 2100 → deficit 400/day.
    // weekly loss = 400×7/7700 = 0.3636 kg = 0.45%/wk ≤ 1% → no clamp.
    const r = clampToLossRate(2100, 2500, 80, 'lose');
    expect(r.finalCalories).toBe(2100);
    expect(r.easedFromRatePct).toBeNull();
  });

  it('eases a too-aggressive deficit back to exactly 1% BW/week', () => {
    // 100 kg, TDEE 3000, candidate 1600 → deficit 1400/day.
    // weekly loss = 1400×7/7700 = 1.2727 kg = 1.27%/wk > 1% → clamp.
    // max daily deficit = (0.01×100×7700)/7 = 1100 → final = 3000 − 1100 = 1900.
    const r = clampToLossRate(1600, 3000, 100, 'lose');
    expect(r.finalCalories).toBeCloseTo(1900, 6);
    expect(r.easedFromRatePct).toBeCloseTo(1.2727, 3);
    // Sanity: the eased target really does sit at 1% BW/week.
    const easedRate = ((3000 - r.finalCalories) * 7) / 7700 / 100 * 100;
    expect(easedRate).toBeCloseTo(1, 6);
  });

  it('does not clamp when candidate is at or above TDEE (no deficit)', () => {
    const r = clampToLossRate(2600, 2500, 80, 'lose');
    expect(r.finalCalories).toBe(2600);
    expect(r.easedFromRatePct).toBeNull();
  });
});
