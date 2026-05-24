import type { MealSlot } from '@/features/log/types';

/**
 * Hand-curated meal templates for Phase 1.6.
 *
 * Each template's nutrition is given for the LISTED quantities (one serving).
 * The plan generator scales each template's quantities so its calories land
 * near the user's per-meal target.
 *
 * Spans Indian + Western staples. Add more freely - any new template appears
 * automatically in the plan UI.
 */

export interface TemplateItem {
  name: string;
  /** Default quantity in grams (or mL for liquids — treated as grams). */
  qtyG: number;
  /** Display unit override, e.g. '1 cup' or '2 eggs'. */
  display?: string;
}

export interface MealTemplate {
  id: string;
  slot: MealSlot;
  name: string;
  items: TemplateItem[];
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export const TEMPLATES: MealTemplate[] = [
  // -------- BREAKFAST --------
  {
    id: 'br-oats-yogurt-berries',
    slot: 'breakfast',
    name: 'Oats, yogurt and berries',
    items: [
      { name: 'Rolled oats (dry)', qtyG: 50 },
      { name: 'Plain Greek yogurt', qtyG: 150 },
      { name: 'Mixed berries', qtyG: 100 },
      { name: 'Honey', qtyG: 10 },
    ],
    kcal: 430,
    proteinG: 22,
    carbsG: 65,
    fatG: 8,
  },
  {
    id: 'br-eggs-toast-avocado',
    slot: 'breakfast',
    name: 'Eggs, toast and avocado',
    items: [
      { name: 'Whole eggs', qtyG: 100, display: '2 eggs' },
      { name: 'Whole-grain toast', qtyG: 60, display: '2 slices' },
      { name: 'Avocado', qtyG: 80 },
    ],
    kcal: 475,
    proteinG: 22,
    carbsG: 35,
    fatG: 26,
  },
  {
    id: 'br-paratha-curd',
    slot: 'breakfast',
    name: 'Aloo paratha with curd',
    items: [
      { name: 'Aloo paratha', qtyG: 150, display: '2 medium' },
      { name: 'Plain curd', qtyG: 150 },
      { name: 'Ghee on paratha', qtyG: 5 },
    ],
    kcal: 510,
    proteinG: 14,
    carbsG: 60,
    fatG: 22,
  },
  {
    id: 'br-poha-peanuts',
    slot: 'breakfast',
    name: 'Poha with peanuts',
    items: [
      { name: 'Poha (cooked)', qtyG: 200 },
      { name: 'Roasted peanuts', qtyG: 20 },
      { name: 'Mixed vegetables', qtyG: 80 },
    ],
    kcal: 380,
    proteinG: 12,
    carbsG: 55,
    fatG: 13,
  },

  // -------- LUNCH --------
  {
    id: 'lu-chicken-rice-veg',
    slot: 'lunch',
    name: 'Chicken, rice and vegetables',
    items: [
      { name: 'Grilled chicken breast', qtyG: 150 },
      { name: 'Cooked white rice', qtyG: 200 },
      { name: 'Mixed sautéed vegetables', qtyG: 150 },
      { name: 'Olive oil (for veg)', qtyG: 8 },
    ],
    kcal: 620,
    proteinG: 48,
    carbsG: 70,
    fatG: 14,
  },
  {
    id: 'lu-dal-rice-veg',
    slot: 'lunch',
    name: 'Dal, rice and sabzi',
    items: [
      { name: 'Toor dal (cooked)', qtyG: 200 },
      { name: 'Cooked basmati rice', qtyG: 180 },
      { name: 'Mixed vegetable sabzi', qtyG: 150 },
      { name: 'Ghee', qtyG: 5 },
    ],
    kcal: 560,
    proteinG: 22,
    carbsG: 90,
    fatG: 11,
  },
  {
    id: 'lu-paneer-roti',
    slot: 'lunch',
    name: 'Paneer curry with roti',
    items: [
      { name: 'Paneer (cubes)', qtyG: 120 },
      { name: 'Whole-wheat roti', qtyG: 120, display: '3 rotis' },
      { name: 'Curry gravy', qtyG: 150 },
      { name: 'Salad', qtyG: 100 },
    ],
    kcal: 640,
    proteinG: 30,
    carbsG: 70,
    fatG: 26,
  },
  {
    id: 'lu-salmon-quinoa',
    slot: 'lunch',
    name: 'Salmon with quinoa and greens',
    items: [
      { name: 'Salmon fillet', qtyG: 150 },
      { name: 'Cooked quinoa', qtyG: 150 },
      { name: 'Steamed broccoli', qtyG: 150 },
      { name: 'Olive oil', qtyG: 5 },
    ],
    kcal: 580,
    proteinG: 42,
    carbsG: 45,
    fatG: 24,
  },

  // -------- DINNER --------
  {
    id: 'di-fish-sweetpotato',
    slot: 'dinner',
    name: 'White fish with sweet potato',
    items: [
      { name: 'White fish fillet', qtyG: 180 },
      { name: 'Roasted sweet potato', qtyG: 200 },
      { name: 'Steamed green beans', qtyG: 150 },
      { name: 'Olive oil', qtyG: 8 },
    ],
    kcal: 510,
    proteinG: 40,
    carbsG: 50,
    fatG: 14,
  },
  {
    id: 'di-chicken-roti-sabzi',
    slot: 'dinner',
    name: 'Tandoori chicken with roti',
    items: [
      { name: 'Tandoori chicken', qtyG: 150 },
      { name: 'Whole-wheat roti', qtyG: 80, display: '2 rotis' },
      { name: 'Cucumber-tomato salad', qtyG: 150 },
    ],
    kcal: 510,
    proteinG: 45,
    carbsG: 45,
    fatG: 14,
  },
  {
    id: 'di-tofu-stir-fry',
    slot: 'dinner',
    name: 'Tofu stir-fry with brown rice',
    items: [
      { name: 'Firm tofu', qtyG: 200 },
      { name: 'Cooked brown rice', qtyG: 150 },
      { name: 'Mixed stir-fry vegetables', qtyG: 200 },
      { name: 'Sesame oil', qtyG: 8 },
    ],
    kcal: 555,
    proteinG: 30,
    carbsG: 60,
    fatG: 20,
  },
  {
    id: 'di-rajma-rice',
    slot: 'dinner',
    name: 'Rajma with jeera rice',
    items: [
      { name: 'Cooked rajma (kidney beans)', qtyG: 200 },
      { name: 'Cooked jeera rice', qtyG: 180 },
      { name: 'Side salad', qtyG: 100 },
    ],
    kcal: 540,
    proteinG: 22,
    carbsG: 95,
    fatG: 7,
  },

  // -------- SNACK --------
  {
    id: 'sn-yogurt-fruit-nuts',
    slot: 'snack',
    name: 'Yogurt, fruit and nuts',
    items: [
      { name: 'Greek yogurt', qtyG: 170 },
      { name: 'Mixed berries or apple', qtyG: 120 },
      { name: 'Almonds', qtyG: 15 },
    ],
    kcal: 280,
    proteinG: 18,
    carbsG: 28,
    fatG: 10,
  },
  {
    id: 'sn-chana-fruit',
    slot: 'snack',
    name: 'Roasted chana with fruit',
    items: [
      { name: 'Roasted chana', qtyG: 40 },
      { name: 'Banana', qtyG: 120, display: '1 medium' },
    ],
    kcal: 270,
    proteinG: 11,
    carbsG: 50,
    fatG: 4,
  },
  {
    id: 'sn-shake',
    slot: 'snack',
    name: 'Protein shake with banana',
    items: [
      { name: 'Whey protein', qtyG: 30, display: '1 scoop' },
      { name: 'Banana', qtyG: 120 },
      { name: 'Milk', qtyG: 250, display: '1 cup' },
      { name: 'Peanut butter', qtyG: 15 },
    ],
    kcal: 395,
    proteinG: 32,
    carbsG: 35,
    fatG: 12,
  },
  {
    id: 'sn-eggs-fruit',
    slot: 'snack',
    name: 'Boiled eggs with fruit',
    items: [
      { name: 'Boiled eggs', qtyG: 100, display: '2 eggs' },
      { name: 'Apple', qtyG: 180, display: '1 medium' },
    ],
    kcal: 230,
    proteinG: 14,
    carbsG: 25,
    fatG: 10,
  },
];

export function templatesForSlot(slot: MealSlot): MealTemplate[] {
  return TEMPLATES.filter((t) => t.slot === slot);
}
