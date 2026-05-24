/**
 * String catalog. All user-facing copy lives here so we can localize later.
 * Usage:  import { t } from '@/i18n/strings'; t('auth.signIn')
 *
 * Phase 0: English only. Phase 1+: add locale files and a real i18n lib.
 */
const en = {
  app: {
    name: 'Vital',
    tagline: 'Your science-backed health coach',
  },
  common: {
    save: 'Save',
    saving: 'Saving…',
    cancel: 'Cancel',
    edit: 'Edit',
    continue: 'Continue',
    optional: 'optional',
    yes: 'Yes',
    no: 'No',
  },
  auth: {
    signIn: 'Sign in',
    signUp: 'Create account',
    signOut: 'Sign out',
    email: 'Email',
    password: 'Password',
    needAccount: "Don't have an account? Create one",
    haveAccount: 'Already have an account? Sign in',
    continueWithGoogle: 'Continue with Google',
    continueWithApple: 'Continue with Apple',
    or: 'or',
    welcome: 'Welcome to Vital',
    welcomeSubtitle: 'One app for nutrition, training, and the science behind both.',
    checkEmail: 'Check your email to confirm your account.',
    signedInAs: 'Signed in as',
  },
  onboarding: {
    title: 'Let’s build your plan',
    subtitle: 'Takes about a minute. Numbers all use published science (see methodology in the docs).',
    name: 'What should we call you?',
    namePlaceholder: 'Your name (optional)',
    age: 'Age',
    sex: 'Sex',
    male: 'Male',
    female: 'Female',
    nb: 'Non-binary',
    units: 'Units',
    metric: 'Metric (kg, cm)',
    imperial: 'Imperial (lb, ft/in)',
    height: 'Height',
    weight: 'Weight',
    heightFeet: 'Feet',
    heightInches: 'Inches',
    bodyFat: 'Body fat %',
    bodyFatHelp: 'Optional — improves accuracy if you know it (DEXA, smart scale, calipers).',
    activity: 'Activity level',
    activitySedentary: 'Sedentary (little / no exercise)',
    activityLight: 'Light (1–3 days / wk)',
    activityModerate: 'Moderate (3–5 days / wk)',
    activityVery: 'Very active (6–7 days / wk)',
    activityExtra: 'Extra active (physical job + training)',
    persona: 'Are you training?',
    personaTraining: 'Yes — I lift / do structured training',
    personaGeneral: 'No — general fitness',
    endurance: 'Endurance focus? (running, cycling, swimming)',
    diet: 'Dietary pattern',
    dietOmnivore: 'Omnivore',
    dietVegetarian: 'Vegetarian',
    dietVegan: 'Vegan',
    goal: 'Goal',
    goalLose: 'Lose fat',
    goalMaintain: 'Maintain',
    goalGain: 'Gain muscle',
    submit: 'Calculate my plan',
    errors: {
      ageRange: 'Age must be 18–120.',
      weight: 'Enter a valid weight.',
      height: 'Enter a valid height.',
      required: 'Required.',
      saveFailed: 'Could not save your profile. Please try again.',
    },
  },
  dashboard: {
    title: 'Your daily targets',
    calories: 'Calories',
    kcal: 'kcal',
    deficit: 'deficit',
    surplus: 'surplus',
    maintenance: 'maintenance',
    protein: 'Protein',
    fat: 'Fat',
    carbs: 'Carbs',
    fiber: 'Fiber',
    perMeal: 'Per meal',
    mealsPerDay: 'meals / day',
    yourStats: 'Your stats',
    bmi: 'BMI',
    bodyFat: 'Body fat',
    bmr: 'BMR (resting metabolism)',
    tdee: 'TDEE (daily expenditure)',
    safetyHeading: 'A few things to know',
    editProfile: 'Edit your info',
    startLogging: 'Find a food',
    startLoggingComing: 'logging UI coming next',
    disclaimer:
      'General fitness and nutrition information — not medical advice. Consult a qualified professional if you are pregnant, under 18, elderly, or managing a medical condition.',
    methodologyTag: 'Methodology',
  },
  foods: {
    findTitle: 'Find a food',
    searchPlaceholder: 'Search foods, brands, products…',
    scanBarcode: 'Scan barcode',
    enterSearch: 'Type at least 3 letters to start searching.',
    noResults: 'No matches. Try a different word.',
    searching: 'Searching…',
    perServing: 'Per',
    per100g: 'Per 100 g',
    g: 'g',
    kcal: 'kcal',
    protein: 'Protein',
    carbs: 'Carbs',
    fat: 'Fat',
    fiber: 'Fiber',
    nutritionMissing: 'Open Food Facts does not have full nutrition data for this product yet. Try another match.',
    sourceLabel: 'Source',
    sourceOff: 'Open Food Facts',
    backToSearch: 'Back to search',
    scanTitle: 'Point at a barcode',
    scanHelp: 'Hold steady, about 6 in / 15 cm away.',
    scanPermission: 'Vital needs camera access to scan barcodes. You can enable it in Settings.',
    scanPermissionGrant: 'Grant camera access',
    scanLooking: 'Looking up product…',
    scanNotFound: 'That barcode is not in Open Food Facts yet.',
    scanError: 'Could not look up that barcode. Check your internet and try again.',
    saveError: 'Could not save that food. Please try again.',
  },
  errors: {
    generic: 'Something went wrong. Please try again.',
    invalidEmail: 'Please enter a valid email address.',
    weakPassword: 'Password must be at least 8 characters.',
    notConfigured: 'Supabase is not configured yet. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env.',
  },
} as const;

type StringPath<T, K extends keyof T = keyof T> = K extends string
  ? T[K] extends Record<string, unknown>
    ? `${K}.${StringPath<T[K]>}`
    : K
  : never;

type Key = StringPath<typeof en>;

export function t(key: Key): string {
  const parts = key.split('.');
  let node: unknown = en;
  for (const p of parts) {
    if (node && typeof node === 'object' && p in (node as Record<string, unknown>)) {
      node = (node as Record<string, unknown>)[p];
    } else {
      return key;
    }
  }
  return typeof node === 'string' ? node : key;
}
