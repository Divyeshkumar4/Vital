import { Pressable, PressableProps, Text as RNText, ActivityIndicator } from 'react-native';
import { tokens } from '@/lib/design/tokens';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface VariantStyle {
  bg: string;
  active: string;
  border?: string;
  textColor: string;
}

const variants: Record<Variant, VariantStyle> = {
  primary: {
    bg: 'bg-accent',
    active: 'active:bg-accent-muted',
    textColor: tokens.colors.accent.contrast,
  },
  secondary: {
    bg: 'bg-bg-surface',
    active: 'active:bg-bg-elevated',
    border: 'border border-border',
    textColor: tokens.colors.fg.DEFAULT,
  },
  ghost: {
    bg: 'bg-transparent',
    active: 'active:bg-bg-surface',
    textColor: tokens.colors.fg.DEFAULT,
  },
  danger: {
    bg: 'bg-danger',
    active: 'active:bg-danger-muted',
    textColor: tokens.colors.fg.DEFAULT,
  },
};

interface Props extends PressableProps {
  title: string;
  variant?: Variant;
  loading?: boolean;
  className?: string;
}

export function Button({
  title,
  variant = 'primary',
  loading = false,
  disabled,
  className = '',
  ...rest
}: Props) {
  const v = variants[variant];
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled ?? undefined, busy: loading }}
      disabled={isDisabled ?? undefined}
      className={`min-h-12 px-6 rounded-lg items-center justify-center ${v.bg} ${v.active} ${
        v.border ?? ''
      } ${isDisabled ? 'opacity-50' : ''} ${className}`}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={v.textColor} />
      ) : (
        <RNText style={{ color: v.textColor, fontSize: 16, fontWeight: '600' }}>{title}</RNText>
      )}
    </Pressable>
  );
}
