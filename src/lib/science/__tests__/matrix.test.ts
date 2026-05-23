import { MATRIX, resolveMatrix, isOlderAdult } from '../matrix';

describe('MATRIX defaults — sanity checks against METHODOLOGY.md § 5', () => {
  it('training-lose default protein is 2.2 g/kg', () => {
    expect(MATRIX.training.lose.protein.def).toBe(2.2);
  });

  it('training-lose has an LBM-based protein band when BF% is known', () => {
    expect(MATRIX.training.lose.proteinLBM?.def).toBe(2.7);
  });

  it('general-maintain default protein is 1.2 g/kg', () => {
    expect(MATRIX.general.maintain.protein.def).toBe(1.2);
  });

  it('older-lose protein band spans 1.2–2.0 g/kg', () => {
    expect(MATRIX.older.lose.protein.min).toBe(1.2);
    expect(MATRIX.older.lose.protein.max).toBe(2.0);
  });

  it('endurance-maintain default protein is 1.6 g/kg', () => {
    expect(MATRIX.endurance.maintain.protein.def).toBe(1.6);
  });

  it('every maintain cell has no calorie adjustment', () => {
    for (const persona of ['training', 'general', 'older', 'endurance'] as const) {
      expect(MATRIX[persona].maintain.adjust.def).toBe(0);
      expect(MATRIX[persona].maintain.adjust.kind).toBe('none');
    }
  });

  it('every lose cell is a deficit and every gain cell is a surplus', () => {
    for (const persona of ['training', 'general', 'older', 'endurance'] as const) {
      expect(MATRIX[persona].lose.adjust.kind).toBe('deficit');
      expect(MATRIX[persona].gain.adjust.kind).toBe('surplus');
    }
  });
});

describe('isOlderAdult', () => {
  it('returns true at or above 65', () => {
    expect(isOlderAdult(65)).toBe(true);
    expect(isOlderAdult(80)).toBe(true);
  });

  it('returns false below 65', () => {
    expect(isOlderAdult(64)).toBe(false);
    expect(isOlderAdult(30)).toBe(false);
  });
});

describe('resolveMatrix', () => {
  it('uses endurance branch when endurance flag is set, regardless of persona', () => {
    const r = resolveMatrix('training', 'lose', 30, true);
    expect(r).toBe(MATRIX.endurance.lose);
  });

  it('uses older branch for age 65+ when not endurance', () => {
    const r = resolveMatrix('general', 'maintain', 70, false);
    expect(r).toBe(MATRIX.older.maintain);
  });

  it('endurance overrides older', () => {
    const r = resolveMatrix('general', 'gain', 70, true);
    expect(r).toBe(MATRIX.endurance.gain);
  });

  it('falls through to persona×goal otherwise', () => {
    expect(resolveMatrix('training', 'gain', 30, false)).toBe(MATRIX.training.gain);
    expect(resolveMatrix('general', 'lose', 30, false)).toBe(MATRIX.general.lose);
  });
});
