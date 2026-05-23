import { bmi, bmiBand, bodyFatCategory } from '../bands';

describe('bmi', () => {
  it('computes BMI as kg/m²', () => {
    expect(bmi(80, 180)).toBeCloseTo(24.69, 2);
    expect(bmi(65, 165)).toBeCloseTo(23.88, 2);
  });
});

describe('bmiBand — standard population', () => {
  it.each([
    [17, 'Underweight'],
    [18.5, 'Normal'],
    [22, 'Normal'],
    [25, 'Overweight'],
    [29.9, 'Overweight'],
    [30, 'Obese I'],
    [35, 'Obese II'],
    [40, 'Obese III'],
    [45, 'Obese III'],
  ])('BMI %f → %s', (value, expected) => {
    expect(bmiBand(value, 'standard')).toBe(expected);
  });
});

describe('bmiBand — Asian (WHO 2004) population', () => {
  it.each([
    [18, 'Underweight'],
    [22, 'Normal'],
    [23, 'Overweight'],
    [27.5, 'Obese I'],
    [32.5, 'Obese II'],
    [37.5, 'Obese III'],
  ])('BMI %f → %s', (value, expected) => {
    expect(bmiBand(value, 'asian')).toBe(expected);
  });
});

describe('bodyFatCategory', () => {
  it('female bands', () => {
    expect(bodyFatCategory(10, 'female')).toBe('Essential / very lean');
    expect(bodyFatCategory(18, 'female')).toBe('Athletic');
    expect(bodyFatCategory(23, 'female')).toBe('Fit');
    expect(bodyFatCategory(30, 'female')).toBe('Average');
    expect(bodyFatCategory(35, 'female')).toBe('High');
  });

  it('male bands', () => {
    expect(bodyFatCategory(5, 'male')).toBe('Essential / very lean');
    expect(bodyFatCategory(12, 'male')).toBe('Athletic');
    expect(bodyFatCategory(16, 'male')).toBe('Fit');
    expect(bodyFatCategory(22, 'male')).toBe('Average');
    expect(bodyFatCategory(28, 'male')).toBe('High');
  });

  it('non-binary uses the male thresholds (more conservative)', () => {
    expect(bodyFatCategory(12, 'nb')).toBe('Athletic');
    expect(bodyFatCategory(28, 'nb')).toBe('High');
  });
});
