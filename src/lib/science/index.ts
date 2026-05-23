/**
 * Public API for the science engine.
 * Spec: /docs/METHODOLOGY.md.
 */
export { compute } from './engine';
export { MATRIX, resolveMatrix, isOlderAdult } from './matrix';
export { bmrMSJ, bmrHB, bmrKM, leanBodyMass } from './bmr';
export { activityFactorOf, tdee, calorieFloor, applyGoalAdjustment, clampToFloor } from './energy';
export { assembleMacros, carbAdvisory, carbFloorGkg, dietPatternProteinAddGkg } from './macros';
export { perMealProteinGkg, mealDistribution, fiberTargetG } from './distribution';
export { bmi, bmiBand, bodyFatCategory } from './bands';
export {
  METHODOLOGY_VERSION,
  METHODOLOGY_REVIEWED,
  ACTIVITY_FACTORS,
  conventionalCalorieMinimum,
} from './constants';
export type * from './types';
