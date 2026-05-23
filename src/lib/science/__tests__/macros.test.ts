import {
  assembleMacros,
  carbAdvisory,
  carbFloorGkg,
  dietPatternProteinAddGkg,
} from '../macros';
import { MATRIX } from '../matrix';

describe('dietPatternProteinAddGkg', () => {
  it('adds 0 for omnivore, 0.1 for vegetarian, 0.2 for vegan', () => {
    expect(dietPatternProteinAddGkg('omnivore')).toBe(0);
    expect(dietPatternProteinAddGkg('vegetarian')).toBe(0.1);
    expect(dietPatternProteinAddGkg('vegan')).toBe(0.2);
  });
});

describe('carbFloorGkg', () => {
  it('training floors step with activity factor (3 / 5 / 6 / 8)', () => {
    expect(carbFloorGkg(1.2, 'training')).toBe(3);
    expect(carbFloorGkg(1.55, 'training')).toBe(5);
    expect(carbFloorGkg(1.725, 'training')).toBe(6);
    expect(carbFloorGkg(1.9, 'training')).toBe(8);
  });

  it('general floors step with activity factor (0 / 1 / 2)', () => {
    expect(carbFloorGkg(1.2, 'general')).toBe(0);
    expect(carbFloorGkg(1.55, 'general')).toBe(1.0);
    expect(carbFloorGkg(1.725, 'general')).toBe(2.0);
  });
});

describe('carbAdvisory', () => {
  it('flags carbs below the training floor', () => {
    // 80 kg user, training, moderate (af 1.55) → floor 5 g/kg. 200 g / 80 kg = 2.5 g/kg → below.
    const msg = carbAdvisory(200, 80, 1.55, 'training');
    expect(msg).not.toBeNull();
    expect(msg).toMatch(/recommended 5 g\/kg/);
  });

  it('returns null when carbs are within the band', () => {
    // 80 kg, training, moderate → floor 5. 500 g / 80 = 6.25 g/kg → fine. And 6.25 < 12 → no upper flag.
    expect(carbAdvisory(500, 80, 1.55, 'training')).toBeNull();
  });

  it('flags ultra-high carb intake', () => {
    // 80 kg user → 12 g/kg = 960. 1100 / 80 = 13.75 → above.
    const msg = carbAdvisory(1100, 80, 1.9, 'training');
    expect(msg).not.toBeNull();
    expect(msg).toMatch(/unusually high/);
  });

  it('returns null for zero or negative carbs', () => {
    expect(carbAdvisory(0, 80, 1.55, 'training')).toBeNull();
  });
});

describe('assembleMacros — training/lose worked example', () => {
  // 80 kg male, training, lose, finalCalories = 2200, protein 2.2 g/kg, fat 22%, moderate activity.
  // proteinG = 2.2 × 80 = 176, proteinKcal = 704.
  // fatKcal = 2200 × 0.22 = 484, fatG ≈ 53.78.
  // carbKcal = 2200 − 704 − 484 = 1012, carbG = 253.
  const cell = MATRIX.training.lose;
  const result = assembleMacros({
    proteinPerKgRequested: cell.protein.def,
    fatPctRequested: cell.fat.def,
    finalCalories: 2200,
    weightKg: 80,
    lbmKg: null,
    preferLBM: false,
    cell,
    persona: 'training',
    activityFactor: 1.55,
    dietPattern: 'omnivore',
  });

  it('hits expected protein grams and kcal', () => {
    expect(result.proteinG).toBeCloseTo(176, 4);
    expect(result.proteinKcal).toBeCloseTo(704, 4);
  });

  it('hits expected fat grams and kcal', () => {
    expect(result.fatKcal).toBeCloseTo(484, 4);
    expect(result.fatG).toBeCloseTo(53.78, 1);
  });

  it('fills remaining with carbs', () => {
    expect(result.carbKcal).toBeCloseTo(1012, 4);
    expect(result.carbG).toBeCloseTo(253, 4);
  });

  it('uses BW basis when LBM not requested', () => {
    expect(result.basisLabel).toBe('BW');
    expect(result.basisKg).toBe(80);
  });

  it('produces no danger warnings on a normal cell', () => {
    expect(result.warnings.find((w) => w.severity === 'danger')).toBeUndefined();
  });
});

describe('assembleMacros — overshoot guard', () => {
  // If protein + fat exceeds calories, carbs go to 0 and a danger warning fires.
  const cell = MATRIX.general.lose;
  const result = assembleMacros({
    proteinPerKgRequested: 5, // wildly high
    fatPctRequested: 80,      // wildly high
    finalCalories: 1500,
    weightKg: 80,
    lbmKg: null,
    preferLBM: false,
    cell,
    persona: 'general',
    activityFactor: 1.2,
    dietPattern: 'omnivore',
  });

  it('clamps carbs to 0 and emits a danger warning', () => {
    expect(result.carbKcal).toBe(0);
    expect(result.warnings.some((w) => w.severity === 'danger')).toBe(true);
  });
});

describe('assembleMacros — vegan add', () => {
  const cell = MATRIX.general.maintain;
  const result = assembleMacros({
    proteinPerKgRequested: 1.2,
    fatPctRequested: 30,
    finalCalories: 2000,
    weightKg: 70,
    lbmKg: null,
    preferLBM: false,
    cell,
    persona: 'general',
    activityFactor: 1.375,
    dietPattern: 'vegan',
  });

  // effectiveRatio = 1.2 + 0.2 = 1.4 → proteinG = 1.4 × 70 = 98.
  it('adds vegan offset to protein g/kg', () => {
    expect(result.effectiveRatioGkg).toBeCloseTo(1.4, 6);
    expect(result.proteinG).toBeCloseTo(98, 4);
  });

  it('does NOT surface a citation-laden warning for the diet add (computation detail)', () => {
    // Diet pattern adjustment is silent in the warnings — it's reflected in proteinG.
    expect(result.warnings.some((w) => /Pinckaers/.test(w.text))).toBe(false);
  });
});

describe('assembleMacros — training-lose with LBM basis', () => {
  // 80 kg, 15% BF → LBM 68. proteinLBM.def = 2.7 → 2.7 × 68 = 183.6 g.
  const cell = MATRIX.training.lose;
  const result = assembleMacros({
    proteinPerKgRequested: cell.proteinLBM?.def ?? 0,
    fatPctRequested: cell.fat.def,
    finalCalories: 2200,
    weightKg: 80,
    lbmKg: 68,
    preferLBM: true,
    cell,
    persona: 'training',
    activityFactor: 1.55,
    dietPattern: 'omnivore',
  });

  it('uses LBM basis when requested', () => {
    expect(result.basisLabel).toBe('LBM');
    expect(result.basisKg).toBe(68);
    expect(result.proteinG).toBeCloseTo(183.6, 1);
  });
});
