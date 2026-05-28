# Vital — Science Methodology (Layer 1)

> **Version:** 1.0.0
> **Adopted:** 2026-05-23
> **Adapted from:** FuelWise methodology v8.20 (2026-05-02), Layer 1 subset.
>
> This document is the source of truth for every calculation in `/src/lib/science/`. Code follows this document, not the other way around. When a change is needed: update this document → bump the version → update code → update tests, in that order.
>
> Every formula and number traces back to a published source. If a number cannot be sourced, do not invent it — flag it for review.
>
> **Layer 1** scope = healthy adults aged 18–120, with optional body fat %, diet pattern, and endurance/older-adult overrides. **Layer 2** (pregnancy, lactation, GLP-1 medications, CKD/dialysis, post-bariatric) is architected for but not wired into v1.

---

## 1. Inputs (Layer 1)

| Field | Type | Notes |
|---|---|---|
| `weightKg` | number | 35–300 kg |
| `heightCm` | number | 130–230 cm |
| `age` | number | 18–120 |
| `sex` | `'male' \| 'female' \| 'nb'` | Non-binary uses mid-point constants |
| `activityFactor` | number | 1.2 / 1.375 / 1.55 / 1.725 / 1.9 |
| `goal` | `'lose' \| 'maintain' \| 'gain'` | — |
| `persona` | `'training' \| 'general'` | Whether the user lifts/structured trains |
| `endurance` | boolean | If true, MATRIX.endurance branch is used |
| `bodyFatPct` | number \| null | 3–60% if provided; enables Katch-McArdle and LBM-based protein |
| `bmrMethod` | `'msj' \| 'hb' \| 'km'` | `km` requires `bodyFatPct` |
| `dietPattern` | `'omnivore' \| 'vegetarian' \| 'vegan'` | Adjusts protein per Pinckaers 2021 |
| `deficitPct` / `surplusPct` | number | Capped per § 4 |
| `clinicallySupervised` | boolean | Unlocks higher deficit ceiling |
| `asianBmi` | boolean | Use Asian BMI thresholds in band labels |

Older adults (age ≥ 65) auto-use `MATRIX.older` regardless of `persona`. Endurance flag overrides to `MATRIX.endurance`.

---

## 2. BMR

### 2.1 Mifflin-St Jeor (default)
- Male: `BMR = 10·w + 6.25·h − 5·a + 5`
- Female: `BMR = 10·w + 6.25·h − 5·a − 161`
- Non-binary: `BMR = 10·w + 6.25·h − 5·a − 78` (mean of male/female sex constants)
- Source: Mifflin et al. 1990, *Am J Clin Nutr*.

### 2.2 Harris-Benedict (revised, Roza & Shizgal 1984)
- Male: `BMR = 88.362 + 13.397·w + 4.799·h − 5.677·a`
- Female: `BMR = 447.593 + 9.247·w + 3.098·h − 4.330·a`

### 2.3 Katch-McArdle (when body-fat % known)
- `BMR = 370 + 21.6·LBM` where `LBM = weight × (1 − bodyFat/100)`
- Most accurate for lean/athletic users; requires reliable BF%.

---

## 3. TDEE

`TDEE = BMR × activityFactor`

| Level | Factor |
|---|---|
| Sedentary (little/no exercise) | 1.2 |
| Lightly active (1–3 days/wk) | 1.375 |
| Moderately active (3–5 days/wk) | 1.55 |
| Very active (6–7 days/wk) | 1.725 |
| Extra active (physical job + training) | 1.9 |

Source: ACSM general activity guidelines / standard Mifflin practice.

---

## 4. Goal calories and caps

### 4.1 Maintenance
`finalCalories = TDEE`

### 4.2 Surplus (gain)
`finalCalories = TDEE × (1 + surplusPct/100)`
- Surplus must be **1–20%**. Above 20% reliably stores excess as fat with no additional lean-mass benefit (Iraki, Fitschen, Espinar & Helms 2019, *Sports*).

### 4.3 Deficit (lose)
`finalCalories = TDEE × (1 − deficitPct/100)`
- Self-directed deficit must be **1–25%**.
- With `clinicallySupervised = true`, ceiling rises to **40%** (intended for medically supervised VLCD/PSMF).
- Source: Helms et al. 2014, *JISSN*; Iraki 2019; Slater 2019.

### 4.4 Calorie floor (safety)
`floor = max(BMR, conventionalMinimum(sex))`
- `conventionalMinimum`: male 1,500 kcal/day, female / nb 1,200 kcal/day.
- If `finalCalories < floor`, clamp to `floor` and surface a non-blocking explanation. The user must acknowledge to proceed below 25% deficit.
- Source: ACSM/ADA position; common-practice protective floors.

### 4.5 Max loss rate
- Clamp deficit so weekly weight loss ≤ **1% body weight / week** (Helms 2014; ISSN nat-bb position stand).
- For kcal→kg conversion use **7,700 kcal per kg** of body weight (Wishnofsky 1958, still operationally used; replaced for adaptive models — see deferred adaptive calibration in Layer 2 roadmap).

---

## 5. Macro MATRIX (persona × goal)

The matrix returns, for each (persona, goal):
- `protein.{min, max, def}` g/kg of body weight (or `proteinLBM` g/kg of lean body mass for training-lose)
- `fat.{min, max, def}` percent of total calories
- `adjust.{min, max, def, kind}` deficit% / surplus% / none
- `rateRange` recommended kg/week change
- `rateRef` literature reference

Carbs are calculated as the remainder after protein and fat, with a 130 g/day RDA floor warning (IOM 2002).

### 5.1 TRAINING (lifts, structured strength work)

| Goal | Protein def (g/kg) | Protein band | Fat % def | Adjust % def | Rate (kg/wk) |
|---|---|---|---|---|---|
| Lose | 2.2 | 1.8–2.7 (BW) / 2.3–3.1 (LBM) | 22 | −20 (10–30) | 0.5–1.0 |
| Maintain | 1.8 | 1.6–2.2 | 28 | 0 | — |
| Gain | 1.8 | 1.6–2.2 | 25 | +10 (5–20) | 0.25–0.5 |

Citations: Helms 2014 JISSN; Morton 2018 BJSM; Murphy/Hector/Phillips 2015 EJSS; Iraki 2019 Sports.

### 5.2 GENERAL (non-trainer)

| Goal | Protein def (g/kg) | Protein band | Fat % def | Adjust % def | Rate (kg/wk) |
|---|---|---|---|---|---|
| Lose | 1.4 | 1.2–1.6 | 30 | −20 (10–25) | 0.5–1.0 |
| Maintain | 1.2 | 1.0–1.4 | 30 | 0 | — |
| Gain | 1.4 | 1.2–1.6 | 30 | +10 (5–15) | 0.2–0.4 |

Citations: Wycherley 2012 AJCN; Phillips/Chevalier/Leidy 2016; Tagawa 2021; 2025 DGAC Scientific Report; Aragon & Schoenfeld 2013 JISSN.

### 5.3 OLDER (age ≥ 65, auto)

| Goal | Protein def (g/kg) | Protein band | Fat % def | Adjust % def | Rate (kg/wk) |
|---|---|---|---|---|---|
| Lose | 1.5 | 1.2–2.0 | 30 | −15 (10–20) | 0.3–0.7 |
| Maintain | 1.2 | 1.0–2.0 | 30 | 0 | — |
| Gain | 1.3 | 1.2–1.5 | 30 | +10 (5–15) | 0.2–0.4 |

Citations: PROT-AGE (Bauer 2013); ESPEN (Deutz 2014); Phillips & Martinson 2019; Traylor 2018.

### 5.4 ENDURANCE (flag override)

| Goal | Protein def (g/kg) | Protein band | Fat % def | Adjust % def | Rate (kg/wk) |
|---|---|---|---|---|---|
| Lose | 1.8 | 1.6–2.0 | 25 | −15 (5–20) | 0.3–0.7 |
| Maintain | 1.6 | 1.4–1.8 | 25 | 0 | — |
| Gain | 1.6 | 1.4–1.8 | 25 | +10 (5–15) | 0.2–0.4 |

Citations: ACSM/AND/DC 2016 (most recent position); Mettler 2010 MSSE; Pasiakos 2013; Longland 2016; Garthe 2011 IJSNEM.

---

## 6. Diet pattern adjustment

If `dietPattern === 'vegan'`: protein g/kg += **0.2**.
If `dietPattern === 'vegetarian'`: protein g/kg += **0.1**.
Source: Pinckaers et al. 2021 — plant proteins have lower leucine per gram, so total intake compensates for muscle-protein synthesis equivalence.

---

## 7. Macro assembly

```
proteinG = effectiveRatio × basis     // basis = weight or LBM
proteinC = proteinG × 4
fatC     = finalCalories × (fatPct / 100)
fatG     = fatC / 9
carbC    = finalCalories − (proteinC + fatC)
carbG    = carbC / 4
```

If `proteinC + fatC > finalCalories` → `carbG = 0` and surface a **danger** warning (reduce protein or fat).

### 7.1 Fat absolute floor
`fatG < 0.5 × weightKg` → warn (hormones, EFA status). Sources: FAO 2010 Food and Nutrition Paper 91; Helms 2014; Lambert 2004; RED-S Mountjoy 2018.

### 7.2 Carb advisory
- Activity-graded floors (g/kg of BW):
  - Training persona: 3 / 5 / 6 / 8 at activity factor < 1.55 / ≥1.55 / ≥1.725 / ≥1.9. Source: ACSM/AND/DC 2016.
  - General persona: 0 / 1.0 / 2.0 at activity factor < 1.55 / ≥1.55 / ≥1.725. Source: graduated extrapolation.
- Upper warning: > 12 g/kg → flag (plausible only for ultra-endurance, Burke et al. 2011).
- RDA floor: 130 g/day (IOM 2002, glucose for brain).

---

## 8. Fiber

`fiberG = (finalCalories / 1000) × 14`
Source: IOM DRI 2002 — 14 g per 1,000 kcal across all adult ages.

---

## 9. Per-meal protein distribution

Age-graded per-meal protein (g/kg per meal):
- < 18 → not supported (v1 is adult-only)
- 18–50 → **0.24**
- 50–65 → linear interpolation 0.24 → 0.4
- ≥ 65 → **0.4**

`perMealG = max(20, round(mpsGkg × weight))`, capped between 20 and 40 g (Schoenfeld & Aragon 2018 muscle-protein-synthesis dose-response; Moore 2015 *J Gerontol A* for older-adult upper anchor).

`mealsPerDay = clamp(round(proteinG / perMealG), 3, 5)`.

---

## 10. BMI and body-fat bands (informational labels)

### 10.1 BMI (`bmiBand(bmi, population)`)
- **Standard:** <18.5 Underweight / 18.5–25 Normal / 25–30 Overweight / 30–35 Obese I / 35–40 Obese II / ≥40 Obese III.
- **Asian (WHO 2004):** <18.5 / 23 / 27.5 / 32.5 / 37.5 thresholds.

### 10.2 Body fat % (`bodyFatCategory(bf, sex)`)
- Female: <14 Essential / <21 Athletic / <25 Fit / <32 Average / else High.
- Male: <6 Essential / <14 Athletic / <18 Fit / <25 Average / else High.
- Source: ACE 2009 (Personal Trainer Manual, 4th ed.), overlapping NSCA Essentials. Treat as orienting bands, not precision diagnoses.

---

## 11. Result shape

The `compute(input)` orchestrator returns:

```ts
{
  bmr: number
  tdee: number
  finalCalories: number    // after adjustment + floor clamp
  flooredTo: number | null // present if clamp activated
  pctAdj: number           // signed; negative for deficit
  protein: { g, kcal, perKg, basis: 'BW' | 'LBM' }
  fat:     { g, kcal, pct }
  carb:    { g, kcal }
  fiberG: number
  perMeal: { lowG, highG, mealsPerDay }
  bmi: { value, band }
  bodyFat: { pct, category } | null
  warnings: { severity: 'danger' | 'warn' | 'info'; text: string }[]
}
```

---

## 12. Non-negotiables

1. Never silently exceed the calorie cap or fall below the calorie floor without surfacing a warning.
2. Never weaken a safety guardrail to make a feature work.
3. Every constant in `constants.ts` has a citation in this document.
4. Every function in `/src/lib/science/` has a unit test with a worked example.
5. Bump `METHODOLOGY_VERSION` whenever a number or formula changes here.

---

## 13. Workout programming (Phase 2)

### 13.1 Rep / set / rest schemes
Mirror of master prompt § 3.7.

| Goal | Reps | Sets | Rest (s) | Target RIR |
|---|---|---|---|---|
| Strength | 3–6 | 4 | 180 | 2 |
| Hypertrophy (default) | 8–12 | 3 | 90 | 2 |
| Endurance | 12–20 | 3 | 45 | n/a |

Sources: ACSM Guidelines for Exercise Testing & Prescription 11th ed; ISSN position stand on resistance training (Helms et al. 2014 *JISSN*); Schoenfeld 2017 for hypertrophy rep-range equivalence within 5–30 reps when taken close to failure.

### 13.2 Progressive overload
Implemented in `suggestProgression()` (`src/lib/science/workout.ts`).

Given the user's most recent session of an exercise:
- **First time** → return target reps at 0 kg; user fills in starting weight.
- **All sets hit reps + avg RIR ≥ 2** → add **2.5 kg** (compound) or **1.25 kg** (isolation). Keep rep target.
- **Hit reps but RIR < 2** → hold weight, add **+1 rep** to next session's target.
- **Missed reps on any set** → hold weight, repeat same target.

Rationale: matches Helms 2014's "double progression" pattern with RIR (Hackett 2012, Zourdos 2016) as the readiness signal. Tiny increments avoid the spiking/stalling that plagues purely linear progression past the novice phase.

### 13.3 Routine templates (Phase 2 generator)
Three program shapes per `src/features/workout/generator.ts`:

- **Beginner** — 3-day full-body A/B/A. Mon/Wed/Fri default weekdays. Compound emphasis (squat / bench / row / OHP / chin-up / deadlift).
- **Intermediate** — 4-day upper / lower with power and hypertrophy days. Mon/Tue/Thu/Fri default.
- **Advanced** — 6-day push / pull / legs with A and B variants. Mon–Sat default.

Each template is goal-aware: the chosen training goal sets the rep range, sets, and rest seconds uniformly across the routine. Equipment customization (master prompt § 2.3) is currently implicit — templates assume gym access (barbell + dumbbell + machines); a future pass will substitute when only a subset of equipment is available.

---

## Layer 2 roadmap (not in v1)

Architectural placeholders should exist (engine accepts the inputs, returns `null`/skip), but they ship later:
- Pregnancy / lactation (IOM DRI 2002/2005)
- GLP-1 receptor agonist users (Almandoz 2025)
- CKD non-dialysis vs hemodialysis / peritoneal dialysis (KDOQI 2020)
- Post-bariatric surgery floor (ASMBS 2017; Mechanick 2019)
- Adaptive TDEE recalibration from weight trend (Hall 2011 *Lancet*)
- T2D fiber/protein priority messaging
- BMI-based clinical referrals (very low / very high)
