import { Pressable, PressableProps, ActivityIndicator } from 'react-native';
import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const variantClass: Record<Variant, { bg: string; fg: string }> = {
  primary: { bg: 'bg-accent active:bg-accent-muted', fg: 'text-accent-contrast' },
  secondary: { bg: 'bg-bg-surface active:bg-bg-elevated border border-border', fg: 'text-fg' },
  ghost: { bg: 'bg-transparent active:bg-bg-surface', fg: 'text-fg' },
  danger: { bg: 'bg-danger active:bg-danger-muted', fg: 'text-fg' },
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
  const v = variantClass[variant];
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled ?? undefined, busy: loading }}
      disabled={isDisabled ?? undefined}
      className={`min-h-12 px-6 rounded-lg items-center justify-center ${v.bg} ${isDisabled ? 'opacity-50' : ''} ${className}`}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator />
      ) : (
        <Text className={`text-base font-semibold ${v.fg}`}>{title}</Text>
      )}
    </Pressable>
  );
}
