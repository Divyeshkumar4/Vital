/**
 * Design tokens — the single source of truth for color, type, spacing, radius.
 * Used by Tailwind config (via require) and by any non-Tailwind code.
 *
 * Keep it small and modern: a calm dark-by-default palette, one accent, generous spacing.
 */
export const tokens = {
  colors: {
    bg: {
      DEFAULT: '#0B0F14',
      elevated: '#121821',
      surface: '#1A2230',
    },
    fg: {
      DEFAULT: '#E6EDF3',
      muted: '#9AA7B4',
      subtle: '#5E6B79',
    },
    border: {
      DEFAULT: '#222B38',
      strong: '#2E3947',
    },
    accent: {
      DEFAULT: '#5BE49B',
      muted: '#2E8F5C',
      subtle: '#173027',
      contrast: '#06140C',
    },
    info: {
      DEFAULT: '#38BDF8',
      muted: '#1A4D6B',
      subtle: '#0E2939',
      contrast: '#04121C',
    },
    danger: {
      DEFAULT: '#FF6B6B',
      muted: '#7A2E2E',
    },
    warn: {
      DEFAULT: '#FFB454',
      subtle: '#3A2A0F',
    },
  },
  fontFamily: {
    sans: ['System'],
    mono: ['Menlo', 'monospace'],
  },
  fontSize: {
    xs: ['12px', { lineHeight: '16px' }],
    sm: ['14px', { lineHeight: '20px' }],
    base: ['16px', { lineHeight: '24px' }],
    lg: ['18px', { lineHeight: '26px' }],
    xl: ['20px', { lineHeight: '28px' }],
    '2xl': ['24px', { lineHeight: '32px' }],
    '3xl': ['30px', { lineHeight: '36px' }],
    '4xl': ['36px', { lineHeight: '40px' }],
    '5xl': ['48px', { lineHeight: '52px' }],
  },
  spacing: {
    px: '1px',
    0: '0px',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
    20: '80px',
    24: '96px',
  },
  borderRadius: {
    none: '0px',
    sm: '6px',
    md: '10px',
    lg: '14px',
    xl: '20px',
    '2xl': '28px',
    full: '9999px',
  },
} as const;

export type Tokens = typeof tokens;
