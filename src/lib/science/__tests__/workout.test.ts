import {
  repSchemeForGoal,
  suggestProgression,
  kgToLb,
  lbToKg,
  type PreviousSet,
} from '../workout';

describe('repSchemeForGoal', () => {
  it('returns the strength scheme (3-6 reps, 3-5 sets, 2-5 min rest)', () => {
    const s = repSchemeForGoal('strength');
    expect(s.repsMin).toBe(3);
    expect(s.repsMax).toBe(6);
    expect(s.restSec).toBeGreaterThanOrEqual(120);
    expect(s.targetRir).toBe(2);
  });

  it('returns the hypertrophy scheme (8-12 reps, ~90 s rest)', () => {
    const s = repSchemeForGoal('hypertrophy');
    expect(s.repsMin).toBe(8);
    expect(s.repsMax).toBe(12);
    expect(s.restSec).toBeGreaterThanOrEqual(60);
    expect(s.restSec).toBeLessThanOrEqual(120);
    expect(s.targetRir).toBe(2);
  });

  it('returns the endurance scheme (12-20+ reps, 30-60 s rest, no RIR target)', () => {
    const s = repSchemeForGoal('endurance');
    expect(s.repsMin).toBe(12);
    expect(s.repsMax).toBeGreaterThanOrEqual(20);
    expect(s.restSec).toBeLessThanOrEqual(60);
    expect(s.targetRir).toBeNull();
  });
});

describe('suggestProgression', () => {
  it('first session: 0 kg @ target reps', () => {
    const r = suggestProgression([], 8, true);
    expect(r.reason).toBe('first_session');
    expect(r.weightKg).toBe(0);
    expect(r.reps).toBe(8);
  });

  it('all sets hit, avg RIR >= 2, compound: add 2.5 kg', () => {
    const sets: PreviousSet[] = [
      { weightKg: 80, reps: 8, rir: 2 },
      { weightKg: 80, reps: 8, rir: 2 },
      { weightKg: 80, reps: 8, rir: 2 },
    ];
    const r = suggestProgression(sets, 8, true);
    expect(r.reason).toBe('add_weight');
    expect(r.weightKg).toBeCloseTo(82.5, 6);
    expect(r.reps).toBe(8);
  });

  it('all sets hit, avg RIR >= 2, isolation: add 1.25 kg', () => {
    const sets: PreviousSet[] = [
      { weightKg: 15, reps: 12, rir: 3 },
      { weightKg: 15, reps: 12, rir: 2 },
      { weightKg: 15, reps: 12, rir: 2 },
    ];
    const r = suggestProgression(sets, 12, false);
    expect(r.reason).toBe('add_weight');
    expect(r.weightKg).toBeCloseTo(16.25, 6);
    expect(r.reps).toBe(12);
  });

  it('all sets hit but RIR low (< 2): hold weight, add 1 rep target', () => {
    const sets: PreviousSet[] = [
      { weightKg: 80, reps: 8, rir: 0 },
      { weightKg: 80, reps: 8, rir: 1 },
      { weightKg: 80, reps: 8, rir: 1 },
    ];
    const r = suggestProgression(sets, 8, true);
    expect(r.reason).toBe('add_reps');
    expect(r.weightKg).toBe(80);
    expect(r.reps).toBe(9);
  });

  it('missed target reps on any set: hold weight, repeat same target', () => {
    const sets: PreviousSet[] = [
      { weightKg: 80, reps: 8, rir: 2 },
      { weightKg: 80, reps: 8, rir: 1 },
      { weightKg: 80, reps: 6, rir: 0 }, // missed
    ];
    const r = suggestProgression(sets, 8, true);
    expect(r.reason).toBe('hold');
    expect(r.weightKg).toBe(80);
    expect(r.reps).toBe(8);
  });

  it('handles unrated sets (null RIR) safely - treats average as 0', () => {
    const sets: PreviousSet[] = [
      { weightKg: 50, reps: 10, rir: null },
      { weightKg: 50, reps: 10, rir: null },
    ];
    const r = suggestProgression(sets, 10, false);
    // Hit reps but RIR is effectively 0 -> add reps, not weight.
    expect(r.reason).toBe('add_reps');
    expect(r.weightKg).toBe(50);
  });
});

describe('kgToLb / lbToKg', () => {
  it('round-trips kg', () => {
    expect(lbToKg(kgToLb(80))).toBeCloseTo(80, 6);
  });

  it('matches the known canonical conversion', () => {
    // 1 kg = 2.2046226218 lb
    expect(kgToLb(1)).toBeCloseTo(2.2046226218, 6);
  });
});
