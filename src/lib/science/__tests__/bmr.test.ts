import { bmrMSJ, bmrHB, bmrKM, leanBodyMass } from '../bmr';

describe('bmrMSJ — Mifflin-St Jeor', () => {
  // Worked example: 30y male, 80 kg, 180 cm
  // 10×80 + 6.25×180 − 5×30 + 5 = 800 + 1125 − 150 + 5 = 1780
  it('matches the canonical male example exactly', () => {
    expect(bmrMSJ(80, 180, 30, 'male')).toBe(1780);
  });

  // Worked example: 30y female, 65 kg, 165 cm
  // 10×65 + 6.25×165 − 5×30 − 161 = 650 + 1031.25 − 150 − 161 = 1370.25
  it('matches the canonical female example exactly', () => {
    expect(bmrMSJ(65, 165, 30, 'female')).toBeCloseTo(1370.25, 4);
  });

  // Non-binary uses sex constant of −78 (mean of +5 and −161).
  // 800 + 1125 − 150 − 78 = 1697
  it('uses the midpoint sex constant for non-binary', () => {
    expect(bmrMSJ(80, 180, 30, 'nb')).toBe(1697);
  });

  it('lowers BMR with age (older example)', () => {
    const young = bmrMSJ(80, 180, 25, 'male');
    const old = bmrMSJ(80, 180, 65, 'male');
    expect(young - old).toBe(200); // 5 kcal × 40 years
  });
});

describe('bmrHB — Harris-Benedict revised', () => {
  // 30y male, 80 kg, 180 cm
  // 88.362 + 13.397×80 + 4.799×180 − 5.677×30
  // = 88.362 + 1071.76 + 863.82 − 170.31 = 1853.632
  it('matches the canonical male example', () => {
    expect(bmrHB(80, 180, 30, 'male')).toBeCloseTo(1853.632, 2);
  });

  // 30y female, 65 kg, 165 cm
  // 447.593 + 9.247×65 + 3.098×165 − 4.33×30
  // = 447.593 + 601.055 + 511.17 − 129.9 = 1429.918
  it('matches the canonical female example', () => {
    expect(bmrHB(65, 165, 30, 'female')).toBeCloseTo(1429.918, 2);
  });
});

describe('bmrKM — Katch-McArdle', () => {
  // 80 kg with 15% BF → LBM 68 → 370 + 21.6×68 = 1838.8
  it('matches a worked example using lean body mass', () => {
    const lbm = leanBodyMass(80, 15);
    expect(lbm).toBeCloseTo(68, 4);
    expect(bmrKM(lbm)).toBeCloseTo(1838.8, 2);
  });
});

describe('leanBodyMass', () => {
  it('returns weight × (1 − bf/100)', () => {
    expect(leanBodyMass(100, 20)).toBe(80);
    expect(leanBodyMass(70, 25)).toBeCloseTo(52.5, 4);
  });
});
