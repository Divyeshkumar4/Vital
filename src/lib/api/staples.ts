/**
 * Vital staples library — a bundled catalog of generic, unbranded foods that
 * Open Food Facts doesn't represent well (cooked rice, roti, dal, eggs, etc).
 *
 * Per-100 g values are drawn from USDA FoodData Central (public, free of
 * copyright) and standard Indian nutrition references. We export under
 * source = 'usda' so the foods table check-constraint accepts the rows.
 *
 * Each entry has aliases so search picks up regional names (chawal, dal,
 * paneer, etc).
 */

import type { OffFood } from './openFoodFacts';

export interface Staple {
  id: string;
  name: string;
  brand: string | null;
  aliases: string[];
  kcalPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g: number | null;
  servingSizeG: number | null;
  servingLabel: string | null;
}

export const STAPLES: Staple[] = [
  // -------- GRAINS / CARBS --------
  { id: 'rice-white-cooked',  name: 'White rice, cooked',  brand: null, aliases: ['rice', 'chawal', 'basmati', 'jasmine'], kcalPer100g: 130, proteinPer100g: 2.7, carbsPer100g: 28.2, fatPer100g: 0.3, fiberPer100g: 0.4, servingSizeG: 150, servingLabel: '1 cup cooked' },
  { id: 'rice-brown-cooked',  name: 'Brown rice, cooked',  brand: null, aliases: ['brown rice'], kcalPer100g: 111, proteinPer100g: 2.6, carbsPer100g: 23, fatPer100g: 0.9, fiberPer100g: 1.8, servingSizeG: 150, servingLabel: '1 cup cooked' },
  { id: 'roti-whole-wheat',   name: 'Roti, whole wheat',   brand: null, aliases: ['chapati', 'phulka', 'fulka'], kcalPer100g: 297, proteinPer100g: 11, carbsPer100g: 56, fatPer100g: 4, fiberPer100g: 9, servingSizeG: 40, servingLabel: '1 medium roti' },
  { id: 'naan',               name: 'Naan',                brand: null, aliases: [], kcalPer100g: 310, proteinPer100g: 9, carbsPer100g: 50, fatPer100g: 9, fiberPer100g: 2, servingSizeG: 90, servingLabel: '1 piece' },
  { id: 'bread-white',        name: 'White bread',         brand: null, aliases: ['toast'], kcalPer100g: 265, proteinPer100g: 9, carbsPer100g: 49, fatPer100g: 3.2, fiberPer100g: 2.7, servingSizeG: 30, servingLabel: '1 slice' },
  { id: 'bread-whole-wheat',  name: 'Whole-wheat bread',   brand: null, aliases: ['brown bread', 'multigrain'], kcalPer100g: 247, proteinPer100g: 13, carbsPer100g: 41, fatPer100g: 3.4, fiberPer100g: 7, servingSizeG: 30, servingLabel: '1 slice' },
  { id: 'pasta-cooked',       name: 'Pasta, cooked',       brand: null, aliases: ['spaghetti', 'penne', 'noodles'], kcalPer100g: 131, proteinPer100g: 5, carbsPer100g: 25, fatPer100g: 1.1, fiberPer100g: 1.8, servingSizeG: 200, servingLabel: '1 cup cooked' },
  { id: 'oats-dry',           name: 'Rolled oats, dry',    brand: null, aliases: ['oatmeal'], kcalPer100g: 379, proteinPer100g: 13.2, carbsPer100g: 67.7, fatPer100g: 6.5, fiberPer100g: 10.1, servingSizeG: 40, servingLabel: '1/2 cup dry' },
  { id: 'oats-cooked',        name: 'Oatmeal, cooked',     brand: null, aliases: ['porridge'], kcalPer100g: 71, proteinPer100g: 2.5, carbsPer100g: 12, fatPer100g: 1.5, fiberPer100g: 1.7, servingSizeG: 240, servingLabel: '1 cup cooked' },
  { id: 'quinoa-cooked',      name: 'Quinoa, cooked',      brand: null, aliases: [], kcalPer100g: 120, proteinPer100g: 4.4, carbsPer100g: 21.3, fatPer100g: 1.9, fiberPer100g: 2.8, servingSizeG: 185, servingLabel: '1 cup cooked' },
  { id: 'potato-boiled',      name: 'Potato, boiled',      brand: null, aliases: ['aloo'], kcalPer100g: 87, proteinPer100g: 1.9, carbsPer100g: 20.1, fatPer100g: 0.1, fiberPer100g: 1.8, servingSizeG: 150, servingLabel: '1 medium' },
  { id: 'sweet-potato-cooked',name: 'Sweet potato, cooked',brand: null, aliases: ['shakarkand'], kcalPer100g: 76, proteinPer100g: 1.4, carbsPer100g: 17.7, fatPer100g: 0.1, fiberPer100g: 2.5, servingSizeG: 150, servingLabel: '1 medium' },
  { id: 'idli',               name: 'Idli',                brand: null, aliases: [], kcalPer100g: 130, proteinPer100g: 4.6, carbsPer100g: 27, fatPer100g: 0.5, fiberPer100g: 0.8, servingSizeG: 30, servingLabel: '1 piece' },
  { id: 'dosa',               name: 'Plain dosa',          brand: null, aliases: [], kcalPer100g: 168, proteinPer100g: 3.7, carbsPer100g: 22, fatPer100g: 7, fiberPer100g: 1, servingSizeG: 80, servingLabel: '1 medium' },
  { id: 'poha-cooked',        name: 'Poha, cooked',        brand: null, aliases: ['flattened rice'], kcalPer100g: 130, proteinPer100g: 2.5, carbsPer100g: 28, fatPer100g: 1.5, fiberPer100g: 0.6, servingSizeG: 200, servingLabel: '1 plate' },
  { id: 'upma',               name: 'Upma',                brand: null, aliases: [], kcalPer100g: 156, proteinPer100g: 3.8, carbsPer100g: 22, fatPer100g: 6, fiberPer100g: 1.4, servingSizeG: 200, servingLabel: '1 plate' },

  // -------- PROTEINS --------
  { id: 'chicken-breast',     name: 'Chicken breast, cooked', brand: null, aliases: ['chicken'], kcalPer100g: 165, proteinPer100g: 31, carbsPer100g: 0, fatPer100g: 3.6, fiberPer100g: 0, servingSizeG: 120, servingLabel: '1 fillet' },
  { id: 'chicken-thigh',      name: 'Chicken thigh, cooked',  brand: null, aliases: [], kcalPer100g: 209, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 11, fiberPer100g: 0, servingSizeG: 100, servingLabel: '1 thigh' },
  { id: 'egg-whole',          name: 'Egg, whole',          brand: null, aliases: ['eggs'], kcalPer100g: 155, proteinPer100g: 13, carbsPer100g: 1.1, fatPer100g: 11, fiberPer100g: 0, servingSizeG: 50, servingLabel: '1 large egg' },
  { id: 'egg-white',          name: 'Egg white',           brand: null, aliases: ['egg whites'], kcalPer100g: 52, proteinPer100g: 11, carbsPer100g: 0.7, fatPer100g: 0.2, fiberPer100g: 0, servingSizeG: 33, servingLabel: '1 large white' },
  { id: 'salmon-cooked',      name: 'Salmon, cooked',      brand: null, aliases: [], kcalPer100g: 208, proteinPer100g: 22, carbsPer100g: 0, fatPer100g: 13, fiberPer100g: 0, servingSizeG: 150, servingLabel: '1 fillet' },
  { id: 'tuna-canned-water',  name: 'Tuna, canned in water',  brand: null, aliases: [], kcalPer100g: 116, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 0.8, fiberPer100g: 0, servingSizeG: 100, servingLabel: '1 can drained' },
  { id: 'white-fish-cooked',  name: 'White fish (tilapia/cod), cooked', brand: null, aliases: ['fish'], kcalPer100g: 128, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 2.7, fiberPer100g: 0, servingSizeG: 150, servingLabel: '1 fillet' },
  { id: 'shrimp-cooked',      name: 'Shrimp, cooked',      brand: null, aliases: ['prawns'], kcalPer100g: 99, proteinPer100g: 24, carbsPer100g: 0.2, fatPer100g: 0.3, fiberPer100g: 0, servingSizeG: 100, servingLabel: '1 serving' },
  { id: 'tofu-firm',          name: 'Tofu, firm',          brand: null, aliases: [], kcalPer100g: 144, proteinPer100g: 17.3, carbsPer100g: 2.8, fatPer100g: 8.7, fiberPer100g: 2.3, servingSizeG: 100, servingLabel: '1 block' },
  { id: 'paneer',             name: 'Paneer',              brand: null, aliases: ['cottage cheese indian'], kcalPer100g: 296, proteinPer100g: 18, carbsPer100g: 6, fatPer100g: 22, fiberPer100g: 0, servingSizeG: 50, servingLabel: '1/3 cup cubes' },
  { id: 'toor-dal-cooked',    name: 'Toor dal, cooked',    brand: null, aliases: ['dal', 'arhar dal', 'pigeon pea', 'lentils'], kcalPer100g: 116, proteinPer100g: 7.5, carbsPer100g: 21, fatPer100g: 0.6, fiberPer100g: 7.6, servingSizeG: 200, servingLabel: '1 katori' },
  { id: 'moong-dal-cooked',   name: 'Moong dal, cooked',   brand: null, aliases: ['dal', 'mung bean', 'green gram'], kcalPer100g: 105, proteinPer100g: 7, carbsPer100g: 19, fatPer100g: 0.4, fiberPer100g: 7.6, servingSizeG: 200, servingLabel: '1 katori' },
  { id: 'masoor-dal-cooked',  name: 'Masoor dal, cooked',  brand: null, aliases: ['dal', 'red lentil'], kcalPer100g: 116, proteinPer100g: 9, carbsPer100g: 20, fatPer100g: 0.4, fiberPer100g: 7.9, servingSizeG: 200, servingLabel: '1 katori' },
  { id: 'chickpeas-cooked',   name: 'Chickpeas, cooked',   brand: null, aliases: ['chole', 'chana', 'garbanzo'], kcalPer100g: 164, proteinPer100g: 9, carbsPer100g: 27, fatPer100g: 2.6, fiberPer100g: 7.6, servingSizeG: 150, servingLabel: '1 cup' },
  { id: 'rajma-cooked',       name: 'Rajma (kidney beans), cooked', brand: null, aliases: ['kidney bean'], kcalPer100g: 127, proteinPer100g: 8.7, carbsPer100g: 22.8, fatPer100g: 0.5, fiberPer100g: 6.4, servingSizeG: 150, servingLabel: '1 cup' },
  { id: 'black-beans-cooked', name: 'Black beans, cooked', brand: null, aliases: [], kcalPer100g: 132, proteinPer100g: 8.9, carbsPer100g: 24, fatPer100g: 0.5, fiberPer100g: 8.7, servingSizeG: 150, servingLabel: '1 cup' },
  { id: 'lean-beef-cooked',   name: 'Lean beef, cooked',   brand: null, aliases: ['steak'], kcalPer100g: 217, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 12, fiberPer100g: 0, servingSizeG: 150, servingLabel: '1 serving' },
  { id: 'whey-protein',       name: 'Whey protein powder', brand: null, aliases: ['protein powder'], kcalPer100g: 400, proteinPer100g: 80, carbsPer100g: 8, fatPer100g: 4, fiberPer100g: 0, servingSizeG: 30, servingLabel: '1 scoop' },

  // -------- DAIRY --------
  { id: 'milk-whole',         name: 'Whole milk',          brand: null, aliases: [], kcalPer100g: 61, proteinPer100g: 3.2, carbsPer100g: 4.8, fatPer100g: 3.3, fiberPer100g: 0, servingSizeG: 240, servingLabel: '1 cup' },
  { id: 'milk-skim',          name: 'Skim milk',           brand: null, aliases: ['fat-free milk'], kcalPer100g: 34, proteinPer100g: 3.4, carbsPer100g: 5, fatPer100g: 0.1, fiberPer100g: 0, servingSizeG: 240, servingLabel: '1 cup' },
  { id: 'yogurt-greek',       name: 'Greek yogurt, plain', brand: null, aliases: [], kcalPer100g: 73, proteinPer100g: 10, carbsPer100g: 3.9, fatPer100g: 1.9, fiberPer100g: 0, servingSizeG: 170, servingLabel: '1 cup' },
  { id: 'yogurt-plain',       name: 'Plain yogurt (curd)', brand: null, aliases: ['dahi', 'curd'], kcalPer100g: 61, proteinPer100g: 3.5, carbsPer100g: 4.7, fatPer100g: 3.3, fiberPer100g: 0, servingSizeG: 150, servingLabel: '1 cup' },
  { id: 'cottage-cheese',     name: 'Cottage cheese, low-fat', brand: null, aliases: [], kcalPer100g: 98, proteinPer100g: 11, carbsPer100g: 3.4, fatPer100g: 4.3, fiberPer100g: 0, servingSizeG: 100, servingLabel: '1/2 cup' },
  { id: 'cheese-cheddar',     name: 'Cheddar cheese',      brand: null, aliases: [], kcalPer100g: 402, proteinPer100g: 25, carbsPer100g: 1.3, fatPer100g: 33, fiberPer100g: 0, servingSizeG: 28, servingLabel: '1 slice' },
  { id: 'butter',             name: 'Butter',              brand: null, aliases: [], kcalPer100g: 717, proteinPer100g: 0.9, carbsPer100g: 0.1, fatPer100g: 81, fiberPer100g: 0, servingSizeG: 14, servingLabel: '1 tbsp' },
  { id: 'ghee',               name: 'Ghee',                brand: null, aliases: ['clarified butter'], kcalPer100g: 900, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100, fiberPer100g: 0, servingSizeG: 5, servingLabel: '1 tsp' },

  // -------- FATS / SPREADS --------
  { id: 'olive-oil',          name: 'Olive oil',           brand: null, aliases: ['oil'], kcalPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100, fiberPer100g: 0, servingSizeG: 14, servingLabel: '1 tbsp' },
  { id: 'coconut-oil',        name: 'Coconut oil',         brand: null, aliases: [], kcalPer100g: 862, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100, fiberPer100g: 0, servingSizeG: 14, servingLabel: '1 tbsp' },
  { id: 'peanut-butter',      name: 'Peanut butter',       brand: null, aliases: [], kcalPer100g: 588, proteinPer100g: 25, carbsPer100g: 20, fatPer100g: 50, fiberPer100g: 6, servingSizeG: 16, servingLabel: '1 tbsp' },
  { id: 'almond-butter',      name: 'Almond butter',       brand: null, aliases: [], kcalPer100g: 614, proteinPer100g: 21, carbsPer100g: 19, fatPer100g: 56, fiberPer100g: 10, servingSizeG: 16, servingLabel: '1 tbsp' },

  // -------- NUTS / SEEDS --------
  { id: 'almonds',            name: 'Almonds',             brand: null, aliases: [], kcalPer100g: 579, proteinPer100g: 21, carbsPer100g: 22, fatPer100g: 50, fiberPer100g: 12.5, servingSizeG: 28, servingLabel: '1 oz (23 nuts)' },
  { id: 'peanuts-roasted',    name: 'Peanuts, roasted',    brand: null, aliases: [], kcalPer100g: 585, proteinPer100g: 24, carbsPer100g: 21, fatPer100g: 49, fiberPer100g: 8, servingSizeG: 28, servingLabel: '1 oz' },
  { id: 'cashews',            name: 'Cashews',             brand: null, aliases: [], kcalPer100g: 553, proteinPer100g: 18, carbsPer100g: 30, fatPer100g: 44, fiberPer100g: 3.3, servingSizeG: 28, servingLabel: '1 oz' },
  { id: 'walnuts',            name: 'Walnuts',             brand: null, aliases: [], kcalPer100g: 654, proteinPer100g: 15, carbsPer100g: 14, fatPer100g: 65, fiberPer100g: 6.7, servingSizeG: 28, servingLabel: '1 oz' },
  { id: 'chia-seeds',         name: 'Chia seeds',          brand: null, aliases: [], kcalPer100g: 486, proteinPer100g: 17, carbsPer100g: 42, fatPer100g: 31, fiberPer100g: 34, servingSizeG: 15, servingLabel: '1 tbsp' },
  { id: 'flax-seeds',         name: 'Flax seeds',          brand: null, aliases: ['flaxseed', 'alsi'], kcalPer100g: 534, proteinPer100g: 18, carbsPer100g: 29, fatPer100g: 42, fiberPer100g: 27, servingSizeG: 10, servingLabel: '1 tbsp' },
  { id: 'roasted-chana',      name: 'Roasted chana',       brand: null, aliases: ['roasted gram'], kcalPer100g: 374, proteinPer100g: 22, carbsPer100g: 58, fatPer100g: 5, fiberPer100g: 16, servingSizeG: 30, servingLabel: '1/4 cup' },

  // -------- FRUITS --------
  { id: 'apple',              name: 'Apple',               brand: null, aliases: [], kcalPer100g: 52, proteinPer100g: 0.3, carbsPer100g: 14, fatPer100g: 0.2, fiberPer100g: 2.4, servingSizeG: 180, servingLabel: '1 medium' },
  { id: 'banana',             name: 'Banana',              brand: null, aliases: [], kcalPer100g: 89, proteinPer100g: 1.1, carbsPer100g: 23, fatPer100g: 0.3, fiberPer100g: 2.6, servingSizeG: 120, servingLabel: '1 medium' },
  { id: 'orange',             name: 'Orange',              brand: null, aliases: [], kcalPer100g: 47, proteinPer100g: 0.9, carbsPer100g: 12, fatPer100g: 0.1, fiberPer100g: 2.4, servingSizeG: 150, servingLabel: '1 medium' },
  { id: 'mango',              name: 'Mango',               brand: null, aliases: [], kcalPer100g: 60, proteinPer100g: 0.8, carbsPer100g: 15, fatPer100g: 0.4, fiberPer100g: 1.6, servingSizeG: 165, servingLabel: '1 cup' },
  { id: 'grapes',             name: 'Grapes',              brand: null, aliases: [], kcalPer100g: 67, proteinPer100g: 0.6, carbsPer100g: 17, fatPer100g: 0.4, fiberPer100g: 0.9, servingSizeG: 100, servingLabel: '1 cup' },
  { id: 'berries-mixed',      name: 'Mixed berries',       brand: null, aliases: ['strawberries', 'blueberries', 'raspberries'], kcalPer100g: 57, proteinPer100g: 0.7, carbsPer100g: 14, fatPer100g: 0.3, fiberPer100g: 2.4, servingSizeG: 150, servingLabel: '1 cup' },
  { id: 'watermelon',         name: 'Watermelon',          brand: null, aliases: ['tarbooj'], kcalPer100g: 30, proteinPer100g: 0.6, carbsPer100g: 7.6, fatPer100g: 0.2, fiberPer100g: 0.4, servingSizeG: 150, servingLabel: '1 cup cubed' },
  { id: 'papaya',             name: 'Papaya',              brand: null, aliases: [], kcalPer100g: 43, proteinPer100g: 0.5, carbsPer100g: 11, fatPer100g: 0.3, fiberPer100g: 1.7, servingSizeG: 145, servingLabel: '1 cup' },
  { id: 'avocado',            name: 'Avocado',             brand: null, aliases: [], kcalPer100g: 160, proteinPer100g: 2, carbsPer100g: 9, fatPer100g: 15, fiberPer100g: 7, servingSizeG: 100, servingLabel: '1/2 medium' },

  // -------- VEGETABLES --------
  { id: 'spinach-raw',        name: 'Spinach, raw',        brand: null, aliases: ['palak'], kcalPer100g: 23, proteinPer100g: 2.9, carbsPer100g: 3.6, fatPer100g: 0.4, fiberPer100g: 2.2, servingSizeG: 30, servingLabel: '1 cup' },
  { id: 'broccoli-cooked',    name: 'Broccoli, cooked',    brand: null, aliases: [], kcalPer100g: 35, proteinPer100g: 2.4, carbsPer100g: 7, fatPer100g: 0.4, fiberPer100g: 3.3, servingSizeG: 90, servingLabel: '1 cup' },
  { id: 'cauliflower-cooked', name: 'Cauliflower, cooked', brand: null, aliases: ['gobi'], kcalPer100g: 23, proteinPer100g: 1.8, carbsPer100g: 4, fatPer100g: 0.5, fiberPer100g: 2.3, servingSizeG: 100, servingLabel: '1 cup' },
  { id: 'cucumber',           name: 'Cucumber',            brand: null, aliases: ['kheera'], kcalPer100g: 16, proteinPer100g: 0.6, carbsPer100g: 3.6, fatPer100g: 0.1, fiberPer100g: 0.5, servingSizeG: 100, servingLabel: '1 cup' },
  { id: 'tomato',             name: 'Tomato',              brand: null, aliases: [], kcalPer100g: 18, proteinPer100g: 0.9, carbsPer100g: 3.9, fatPer100g: 0.2, fiberPer100g: 1.2, servingSizeG: 120, servingLabel: '1 medium' },
  { id: 'carrot',             name: 'Carrot',              brand: null, aliases: ['gajar'], kcalPer100g: 41, proteinPer100g: 0.9, carbsPer100g: 10, fatPer100g: 0.2, fiberPer100g: 2.8, servingSizeG: 60, servingLabel: '1 medium' },
  { id: 'onion',              name: 'Onion',               brand: null, aliases: ['pyaaz'], kcalPer100g: 40, proteinPer100g: 1.1, carbsPer100g: 9.3, fatPer100g: 0.1, fiberPer100g: 1.7, servingSizeG: 110, servingLabel: '1 medium' },
  { id: 'bell-pepper',        name: 'Bell pepper',         brand: null, aliases: ['capsicum', 'shimla mirch'], kcalPer100g: 31, proteinPer100g: 1, carbsPer100g: 6, fatPer100g: 0.3, fiberPer100g: 2.1, servingSizeG: 120, servingLabel: '1 medium' },
  { id: 'mixed-vegetables',   name: 'Mixed vegetables, cooked', brand: null, aliases: ['sabzi'], kcalPer100g: 55, proteinPer100g: 2.5, carbsPer100g: 11, fatPer100g: 0.5, fiberPer100g: 4, servingSizeG: 150, servingLabel: '1 cup' },

  // -------- MISC --------
  { id: 'honey',              name: 'Honey',               brand: null, aliases: ['shahad'], kcalPer100g: 304, proteinPer100g: 0.3, carbsPer100g: 82, fatPer100g: 0, fiberPer100g: 0.2, servingSizeG: 21, servingLabel: '1 tbsp' },
  { id: 'sugar-white',        name: 'Sugar, white',        brand: null, aliases: ['cheeni'], kcalPer100g: 387, proteinPer100g: 0, carbsPer100g: 100, fatPer100g: 0, fiberPer100g: 0, servingSizeG: 4, servingLabel: '1 tsp' },
  { id: 'coffee-black',       name: 'Coffee, black',       brand: null, aliases: [], kcalPer100g: 1, proteinPer100g: 0.1, carbsPer100g: 0, fatPer100g: 0, fiberPer100g: 0, servingSizeG: 240, servingLabel: '1 cup' },
  { id: 'tea-black',          name: 'Tea, black',          brand: null, aliases: ['chai'], kcalPer100g: 1, proteinPer100g: 0, carbsPer100g: 0.3, fatPer100g: 0, fiberPer100g: 0, servingSizeG: 240, servingLabel: '1 cup' },
];

function toOffShape(s: Staple): OffFood {
  return {
    sourceId: s.id,
    name: s.name,
    brand: s.brand,
    barcode: null,
    kcalPer100g: s.kcalPer100g,
    proteinPer100g: s.proteinPer100g,
    carbsPer100g: s.carbsPer100g,
    fatPer100g: s.fatPer100g,
    fiberPer100g: s.fiberPer100g,
    servingSizeG: s.servingSizeG,
    servingLabel: s.servingLabel,
    imageUrl: null,
  };
}

/**
 * Search the bundled staples library. Matches name AND aliases (case-insensitive).
 * Returns up to `limit` results.
 */
export function searchStaples(query: string, limit = 12): OffFood[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const out: { staple: Staple; score: number }[] = [];
  for (const s of STAPLES) {
    const name = s.name.toLowerCase();
    let score = 0;
    if (name === q) score = 100;
    else if (name.startsWith(q)) score = 80;
    else if (name.includes(q)) score = 60;
    else if (s.aliases.some((a) => a.toLowerCase().startsWith(q))) score = 50;
    else if (s.aliases.some((a) => a.toLowerCase().includes(q))) score = 30;
    if (score > 0) out.push({ staple: s, score });
  }
  out.sort((a, b) => b.score - a.score);
  return out.slice(0, limit).map((r) => toOffShape(r.staple));
}
