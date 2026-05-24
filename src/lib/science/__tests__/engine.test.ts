import { compute } from '../engine';
import type { ScienceInput } from '../types';

function baseInput(overrides: Partial<ScienceInput> = {}): ScienceInput {
  return {
    weightKg: 80,
    heightCm: 180,
    age: 30,
    sex: 'male',
    activity: 'moderate',
    goal: 'lose',
    persona: 'training',
    deficitPct: 20,
    ...overrides,
  };
}

describe('compute — full end-to-end worked example', () => {
  // 30y male, 80 kg, 180 cm, moderate activity, training, 20% deficit.
  // BMR (MSJ) = 1780. TDEE = 1780 × 1.55 = 2759. Final = 2759 × 0.8 = 2207.2.
  // Matrix → training/lose → protein def 2.2 g/kg, fat def 22%.
  // proteinG = 176, fatG ≈ 53.94, carbG ≈ 264.
  const r = compute(baseInput());

  it('returns ok', () => {
    expect(r.ok).toBe(true);
  });

  if (r.ok) {
    it('matches BMR 1780', () => {
      expect(r.value.bmr).toBe(1780);
    });
    it('matches TDEE ≈ 2759', () => {
      expect(r.value.tdee).toBeCloseTo(2759, 0);
    });
    it('applies the 20% deficit (final ≈ 2207)', () => {
      expect(r.value.finalCalories).toBeCloseTo(2207.2, 1);
      expect(r.value.pctAdj).toBe(-20);
      expect(r.value.flooredTo).toBeNull();
    });
    it('uses matrix-default protein 2.2 g/kg → 176 g', () => {
      expect(r.value.protein.perKg).toBeCloseTo(2.2, 4);
      expect(r.value.protein.g).toBeCloseTo(176, 4);
      expect(r.value.protein.basis).toBe('BW');
    });
    it('produces a positive fiber target and meal distribution', () => {
      expect(r.value.fiberG).toBeGreaterThan(20);
      expect(r.value.perMeal.mealsPerDay).toBeGreaterThanOrEqual(3);
      expect(r.value.perMeal.mealsPerDay).toBeLessThanOrEqual(5);
    });
    it('labels BMI band as Normal (BMI 24.69)', () => {
      expect(r.value.bmi.band).toBe('Normal');
    });
  }
});

describe('compute — safety floor activates for tiny user with deep deficit', () => {
  // 50 kg female, 160 cm, 25y, sedentary, lose, 25% deficit.
  // BMR (MSJ) = 10×50 + 6.25×160 − 5×25 − 161 = 500 + 1000 − 125 − 161 = 1214.
  // TDEE = 1214 × 1.2 = 1456.8. Final candidate = 1456.8 × 0.75 = 1092.6.
  // Floor = max(1214, 1200) = 1214. Final clamps to 1214 and a warning is added.
  const r = compute(
    baseInput({
      weightKg: 50,
      heightCm: 160,
      age: 25,
      sex: 'female',
      activity: 'sedentary',
      goal: 'lose',
      persona: 'general',
      deficitPct: 25,
    }),
  );

  it('returns ok', () => {
    expect(r.ok).toBe(true);
  });

  if (r.ok) {
    it('clamps to BMR-based floor and reports it', () => {
      expect(r.value.flooredTo).not.toBeNull();
      expect(r.value.finalCalories).toBeCloseTo(1214, 0);
    });
    it('warns about the clamp', () => {
      expect(r.value.warnings.some((w) => /safe minimum/.test(w.text))).toBe(true);
    });
  }
});

describe('compute — input validation', () => {
  it('rejects weight outside 35–300 kg', () => {
    const r = compute(baseInput({ weightKg: 25 }));
    expect(r.ok).toBe(false);
  });

  it('rejects height outside 130–230 cm', () => {
    const r = compute(baseInput({ heightCm: 120 }));
    expect(r.ok).toBe(false);
  });

  it('rejects under-18 users with a helpful message', () => {
    const r = compute(baseInput({ age: 16 }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.message).toMatch(/pediatric/i);
  });

  it('rejects Katch-McArdle without body fat %', () => {
    const r = compute(baseInput({ bmrMethod: 'km' }));
    expect(r.ok).toBe(false);
  });

  it('rejects deficit above 25% without supervision', () => {
    const r = compute(baseInput({ deficitPct: 35 }));
    expect(r.ok).toBe(false);
  });

  it('allows deficit up to 40% with supervised flag', () => {
    const r = compute(baseInput({ deficitPct: 35, clinicallySupervised: true }));
    expect(r.ok).toBe(true);
  });
});

describe('compute — Katch-McArdle path uses LBM for both BMR and protein', () => {
  // 80 kg, 15% BF → LBM 68. KM BMR = 370 + 21.6 × 68 = 1838.8.
  // training-lose with proteinLBM.def = 2.7 → proteinG = 2.7 × 68 = 183.6.
  const r = compute(
    baseInput({
      bmrMethod: 'km',
      bodyFatPct: 15,
    }),
  );

  it('returns ok', () => {
    expect(r.ok).toBe(true);
  });

  if (r.ok) {
    it('uses KM BMR ≈ 1838.8', () => {
      expect(r.value.bmr).toBeCloseTo(1838.8, 1);
    });
    it('uses LBM-basis protein at 2.7 g/kg → ≈ 183.6 g', () => {
      expect(r.value.protein.basis).toBe('LBM');
      expect(r.value.protein.g).toBeCloseTo(183.6, 1);
    });
    it('includes body fat category label', () => {
      expect(r.value.bodyFat?.category).toBe('Fit');
    });
  }
});

describe('compute — endurance and older overrides', () => {
  it('endurance flag uses endurance matrix even for training persona', () => {
    const r = compute(baseInput({ endurance: true, goal: 'maintain' }));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.protein.perKg).toBeCloseTo(1.6, 4); // endurance maintain default
  });

  it('age 70 with general persona uses older matrix', () => {
    const r = compute(
      baseInput({ age: 70, persona: 'general', goal: 'maintain', deficitPct: undefined }),
    );
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.protein.perKg).toBeCloseTo(1.2, 4); // older maintain default
  });
});

describe('compute — diet pattern bumps protein', () => {
  it('vegan adds 0.2 g/kg on top of matrix default', () => {
    // general-maintain default = 1.2, vegan add = 0.2 → effective 1.4.
    const r = compute(
      baseInput({ goal: 'maintain', persona: 'general', dietPattern: 'vegan' }),
    );
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.protein.perKg).toBeCloseTo(1.4, 4);
  });
});
