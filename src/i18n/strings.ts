/**
 * String catalog. All user-facing copy lives here so we can localize later.
 * Usage:  import { t } from '@/i18n/strings'; t('auth.signIn')
 *
 * Phase 0: English only. Phase 1+: add locale files and a real i18n lib (e.g. i18next).
 */
const en = {
  app: {
    name: 'Vital',
    tagline: 'Your science-backed health coach',
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
