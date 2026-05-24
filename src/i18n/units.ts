/**
 * Unit system helpers. The science layer (master prompt § 3) is metric-internal;
 * convert at the UI boundary so we never store mixed units.
 */
export type UnitSystem = 'metric' | 'imperial';

export const KG_PER_LB = 0.45359237;
export const CM_PER_IN = 2.54;

export const lbToKg = (lb: number) => lb * KG_PER_LB;
export const kgToLb = (kg: number) => kg / KG_PER_LB;
export const inToCm = (inches: number) => inches * CM_PER_IN;
export const cmToIn = (cm: number) => cm / CM_PER_IN;

export const ftInToCm = (feet: number, inches: number) =>
  inToCm(feet * 12 + inches);

export const cmToFtIn = (cm: number) => {
  const totalIn = cmToIn(cm);
  const feet = Math.floor(totalIn / 12);
  const inches = totalIn - feet * 12;
  return { feet, inches };
};
