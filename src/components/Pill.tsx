import { Pressable, PressableProps, Text as RNText, View } from 'react-native';
import { tokens } from '@/lib/design/tokens';

type Tone = 'neutral' | 'accent' | 'info' | 'warn' | 'danger';

interface Props extends Omit<PressableProps, 'children'> {
  label: string;
  value?: string;
  tone?: Tone;
  /** When false (default), renders as a non-interactive View. */
  pressable?: boolean;
}

function toneStyles(tone: Tone) {
  switch (tone) {
    case 'accent':
      return {
        bg: tokens.colors.accent.subtle,
        border: tokens.colors.accent.DEFAULT,
        label: tokens.colors.accent.DEFAULT,
        value: tokens.colors.accent.DEFAULT,
      };
    case 'info':
      return {
        bg: tokens.colors.info.subtle,
        border: tokens.colors.info.DEFAULT,
        label: tokens.colors.info.DEFAULT,
        value: tokens.colors.info.DEFAULT,
      };
    case 'warn':
      return {
        bg: tokens.colors.warn.subtle,
        border: tokens.colors.warn.DEFAULT,
        label: tokens.colors.warn.DEFAULT,
        value: tokens.colors.warn.DEFAULT,
      };
    case 'danger':
      return {
        bg: tokens.colors.danger.muted,
        border: tokens.colors.danger.DEFAULT,
        label: tokens.colors.danger.DEFAULT,
        value: tokens.colors.danger.DEFAULT,
      };
    default:
      return {
        bg: tokens.colors.bg.surface,
        border: tokens.colors.border.DEFAULT,
        label: tokens.colors.fg.muted,
        value: tokens.colors.fg.DEFAULT,
      };
  }
}

/**
 * Compact badge for displaying a label + value. Macro pills, status chips,
 * filter tags — anywhere you'd want a short key:value pair in a card.
 */
export function Pill({ label, value, tone = 'neutral', pressable = false, ...rest }: Props) {
  const s = toneStyles(tone);
  const Container: typeof Pressable | typeof View = pressable ? Pressable : View;
  const containerProps = pressable ? rest : {};
  return (
    <Container
      {...containerProps}
      style={{
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: s.bg,
        borderWidth: 1,
        borderColor: s.border,
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 6,
      }}
    >
      <RNText style={{ color: s.label, fontSize: 12, fontWeight: '500' }}>{label}</RNText>
      {value !== undefined ? (
        <RNText style={{ color: s.value, fontSize: 14, fontWeight: '600' }}>{value}</RNText>
      ) : null}
    </Container>
  );
}
