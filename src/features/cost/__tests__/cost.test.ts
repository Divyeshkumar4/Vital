import { median, sumSpendByDate, type CommunityPriceSummary } from '../types';
import type { FoodLog } from '@/features/log/types';

function makeLog(overrides: Partial<FoodLog>): FoodLog {
  return {
    id: overrides.id ?? Math.random().toString(),
    userId: 'u1',
    date: '2026-05-28',
    meal: 'lunch',
    foodId: null,
    foodName: 'Rice',
    brand: null,
    quantityG: 100,
    kcal: 130,
    proteinG: 2.7,
    carbsG: 28,
    fatG: 0.3,
    fiberG: 0.4,
    priceAtLog: null,
    currencyAtLog: null,
    createdAt: '2026-05-28T12:00:00Z',
    ...overrides,
  };
}

describe('median', () => {
  it('returns 0 for empty input', () => {
    expect(median([])).toBe(0);
  });
  it('returns the single element for length 1', () => {
    expect(median([5])).toBe(5);
  });
  it('returns the middle for odd-length input', () => {
    expect(median([1, 3, 2])).toBe(2);
  });
  it('returns the mean of the two middles for even-length input', () => {
    expect(median([1, 2, 3, 4])).toBe(2.5);
  });
  it('handles unsorted input', () => {
    expect(median([10, 1, 100, 50])).toBe(30);
  });
});

describe('sumSpendByDate', () => {
  it('returns no rows for empty input', () => {
    expect(sumSpendByDate([], 'USD')).toEqual([]);
  });

  it('sums priced entries per date and ignores unpriced ones in the amount', () => {
    const logs: FoodLog[] = [
      makeLog({ date: '2026-05-28', priceAtLog: 1.5, currencyAtLog: 'USD' }),
      makeLog({ date: '2026-05-28', priceAtLog: 2.0, currencyAtLog: 'USD' }),
      makeLog({ date: '2026-05-28', priceAtLog: null }),
      makeLog({ date: '2026-05-27', priceAtLog: 4.25, currencyAtLog: 'USD' }),
    ];
    const out = sumSpendByDate(logs, 'USD');
    expect(out).toHaveLength(2);
    const may28 = out.find((d) => d.date === '2026-05-28');
    const may27 = out.find((d) => d.date === '2026-05-27');
    expect(may28).toEqual({
      date: '2026-05-28',
      amount: 3.5,
      currency: 'USD',
      loggedEntries: 3,
      pricedEntries: 2,
    });
    expect(may27).toEqual({
      date: '2026-05-27',
      amount: 4.25,
      currency: 'USD',
      loggedEntries: 1,
      pricedEntries: 1,
    });
  });

  it('sorts dates newest first', () => {
    const logs: FoodLog[] = [
      makeLog({ date: '2026-05-25', priceAtLog: 1 }),
      makeLog({ date: '2026-05-27', priceAtLog: 1 }),
      makeLog({ date: '2026-05-26', priceAtLog: 1 }),
    ];
    const dates = sumSpendByDate(logs, 'USD').map((d) => d.date);
    expect(dates).toEqual(['2026-05-27', '2026-05-26', '2026-05-25']);
  });
});

// Type smoke test: ensure CommunityPriceSummary stays in shape.
const _summary: CommunityPriceSummary = {
  medianPer100g: 1.5,
  count: 3,
  currency: 'USD',
};
void _summary;
