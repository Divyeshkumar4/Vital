/**
 * Persona × goal macro matrix. Spec: /docs/METHODOLOGY.md § 5.
 * Every cell is cited; do not change defaults without bumping METHODOLOGY_VERSION.
 */
import type { MatrixGoalCell, Persona, Goal } from './types';

interface MatrixShape {
  training: Record<Goal, MatrixGoalCell>;
  general: Record<Goal, MatrixGoalCell>;
  older: Record<Goal, MatrixGoalCell>;
  endurance: Record<Goal, MatrixGoalCell>;
}

export const MATRIX: MatrixShape = {
  training: {
    lose: {
      protein: {
        min: 1.8,
        max: 2.7,
        def: 2.2,
        basis: 'BW',
        note: '1.8–2.7 g/kg BW protects lean mass during energy restriction in trained athletes (Murphy/Hector/Phillips 2015 EJSS; Helms 2014 JISSN).',
      },
      proteinLBM: {
        min: 2.3,
        max: 3.1,
        def: 2.7,
        basis: 'LBM',
        note: 'When body fat % is known, 2.3–3.1 g/kg LBM is the precision target (Helms/Aragon/Fitschen 2014 JISSN).',
      },
      fat: {
        min: 18,
        max: 30,
        def: 22,
        note: '18–30% of calories for lean-phase use. Hard floor 0.5 g/kg BW (FAO 2010).',
      },
      adjust: { min: 10, max: 30, def: 20, kind: 'deficit' },
      rateRange: [0.5, 1.0],
      rateRef: 'Helms et al. 2014, JISSN',
    },
    maintain: {
      protein: {
        min: 1.6,
        max: 2.2,
        def: 1.8,
        basis: 'BW',
        note: 'Morton 2018 BJSM dose-response breakpoint at 1.62 g/kg; ISSN consensus range up to 2.2 (Jäger 2017).',
      },
      fat: {
        min: 20,
        max: 35,
        def: 28,
        note: 'IOM AMDR 20–35% (DRI 2002).',
      },
      adjust: { min: 0, max: 0, def: 0, kind: 'none' },
      rateRange: null,
      rateRef: null,
    },
    gain: {
      protein: {
        min: 1.6,
        max: 2.2,
        def: 1.8,
        basis: 'BW',
        note: '1.6–2.2 g/kg during surplus (Iraki/Fitschen/Espinar/Helms 2019 Sports).',
      },
      fat: {
        min: 20,
        max: 30,
        def: 25,
        note: '20–30%; lower end leaves room for fueling carbs (Iraki 2019).',
      },
      adjust: { min: 5, max: 20, def: 10, kind: 'surplus' },
      rateRange: [0.25, 0.5],
      rateRef: 'Iraki et al. 2019, Sports',
    },
  },
  general: {
    lose: {
      protein: {
        min: 1.2,
        max: 1.6,
        def: 1.4,
        basis: 'BW',
        note: '1.2–1.6 g/kg preserves lean mass in non-athletes (Wycherley 2012 AJCN; 2025 DGAC Scientific Report).',
      },
      fat: { min: 20, max: 35, def: 30, note: 'IOM AMDR 20–35% (DRI 2002).' },
      adjust: { min: 10, max: 25, def: 20, kind: 'deficit' },
      rateRange: [0.5, 1.0],
      rateRef: 'Wycherley 2012, AJCN; 2025 DGAC',
    },
    maintain: {
      protein: {
        min: 1.0,
        max: 1.4,
        def: 1.2,
        basis: 'BW',
        note: '1.0–1.4 g/kg for healthy adults (Phillips/Chevalier/Leidy 2016; Tagawa 2021).',
      },
      fat: { min: 20, max: 35, def: 30, note: 'IOM AMDR 20–35%.' },
      adjust: { min: 0, max: 0, def: 0, kind: 'none' },
      rateRange: null,
      rateRef: null,
    },
    gain: {
      protein: {
        min: 1.2,
        max: 1.6,
        def: 1.4,
        basis: 'BW',
        note: '1.2–1.6 g/kg without heavy resistance training (Slater 2019 Front Nutr).',
      },
      fat: { min: 20, max: 35, def: 30, note: 'IOM AMDR 20–35%.' },
      adjust: { min: 5, max: 15, def: 10, kind: 'surplus' },
      rateRange: [0.2, 0.4],
      rateRef: 'Aragon & Schoenfeld 2013, JISSN',
    },
  },
  older: {
    lose: {
      protein: {
        min: 1.2,
        max: 2.0,
        def: 1.5,
        basis: 'BW',
        note: '1.2–2.0 g/kg for 65+ during weight loss (PROT-AGE Bauer 2013; ESPEN Deutz 2014; Phillips/Martinson 2019).',
      },
      fat: { min: 20, max: 35, def: 30, note: 'IOM AMDR 20–35%.' },
      adjust: { min: 10, max: 20, def: 15, kind: 'deficit' },
      rateRange: [0.3, 0.7],
      rateRef: 'Slower pace recommended for older adults',
    },
    maintain: {
      protein: {
        min: 1.0,
        max: 2.0,
        def: 1.2,
        basis: 'BW',
        note: '1.0–1.2 g/kg baseline; up to 2.0 for active older adults training with resistance.',
      },
      fat: { min: 20, max: 35, def: 30, note: 'IOM AMDR 20–35%.' },
      adjust: { min: 0, max: 0, def: 0, kind: 'none' },
      rateRange: null,
      rateRef: null,
    },
    gain: {
      protein: {
        min: 1.2,
        max: 1.5,
        def: 1.3,
        basis: 'BW',
        note: '1.2–1.5 g/kg for older adults during weight gain (PROT-AGE; ESPEN).',
      },
      fat: { min: 20, max: 35, def: 30, note: 'IOM AMDR 20–35%.' },
      adjust: { min: 5, max: 15, def: 10, kind: 'surplus' },
      rateRange: [0.2, 0.4],
      rateRef: 'Phillips et al. 2016',
    },
  },
  endurance: {
    lose: {
      protein: {
        min: 1.6,
        max: 2.0,
        def: 1.8,
        basis: 'BW',
        note: '1.6–2.0 g/kg for endurance athletes during weight loss (ACSM/AND/DC 2016; Mettler 2010 MSSE).',
      },
      fat: { min: 20, max: 30, def: 25, note: '20–30%; lower fat preserves room for high carb needs.' },
      adjust: { min: 5, max: 20, def: 15, kind: 'deficit' },
      rateRange: [0.3, 0.7],
      rateRef: 'Slower loss preserves training capacity',
    },
    maintain: {
      protein: {
        min: 1.4,
        max: 1.8,
        def: 1.6,
        basis: 'BW',
        note: '1.4–1.8 g/kg, ACSM/AND/DC 2016 endurance range.',
      },
      fat: { min: 20, max: 30, def: 25, note: '20–30% with high-carb emphasis.' },
      adjust: { min: 0, max: 0, def: 0, kind: 'none' },
      rateRange: null,
      rateRef: null,
    },
    gain: {
      protein: {
        min: 1.4,
        max: 1.8,
        def: 1.6,
        basis: 'BW',
        note: 'Endurance athletes rarely surplus aggressively. 1.4–1.8 g/kg with calories for fueling.',
      },
      fat: { min: 20, max: 30, def: 25, note: '20–30%.' },
      adjust: { min: 5, max: 15, def: 10, kind: 'surplus' },
      rateRange: [0.2, 0.4],
      rateRef: 'Garthe et al. 2011, IJSNEM',
    },
  },
};

export function isOlderAdult(age: number): boolean {
  return age >= 65;
}

export function resolveMatrix(
  persona: Persona,
  goal: Goal,
  age: number,
  endurance: boolean,
): MatrixGoalCell {
  if (endurance) return MATRIX.endurance[goal];
  if (isOlderAdult(age)) return MATRIX.older[goal];
  return MATRIX[persona][goal];
}
