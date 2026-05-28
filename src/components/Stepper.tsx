import { Pressable, Text as RNText, TextInput, View } from 'react-native';
import { tokens } from '@/lib/design/tokens';
import { Text } from './Text';

interface Props {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  /** Quick-tap step amount for the +/- buttons. */
  step?: number;
  /** 'integer' = whole numbers only; 'decimal' = allows one decimal point. */
  mode?: 'integer' | 'decimal';
  suffix?: string;
  /** Optional hint shown below the input (e.g. "suggested 80 kg"). */
  hint?: string;
}

function sanitize(v: string, mode: 'integer' | 'decimal'): string {
  if (mode === 'integer') return v.replace(/[^0-9]/g, '');
  const cleaned = v.replace(/[^0-9.]/g, '');
  const firstDot = cleaned.indexOf('.');
  if (firstDot === -1) return cleaned;
  return cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, '');
}

function bump(value: string, delta: number, mode: 'integer' | 'decimal'): string {
  const n = parseFloat(value);
  const base = Number.isFinite(n) ? n : 0;
  const next = Math.max(0, base + delta);
  if (mode === 'integer') return String(Math.round(next));
  // Trim trailing .0
  const rounded = Math.round(next * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}

/**
 * Number input optimised for the workout player — typing OR ± buttons.
 * The ± buttons matter when the user's hands are chalky / sweaty / gloved
 * and on-screen keyboards are slow.
 */
export function Stepper({
  label,
  value,
  onChangeText,
  step = 1,
  mode = 'decimal',
  suffix,
  hint,
}: Props) {
  const dec = () => onChangeText(bump(value, -step, mode));
  const inc = () => onChangeText(bump(value, step, mode));
  return (
    <View style={{ gap: 6 }}>
      <Text variant="caption">{label}</Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Pressable
          onPress={dec}
          accessibilityRole="button"
          accessibilityLabel={`Decrease ${label}`}
          style={{
            width: 56,
            height: 56,
            borderRadius: 12,
            backgroundColor: tokens.colors.bg.surface,
            borderWidth: 1,
            borderColor: tokens.colors.border.DEFAULT,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <RNText style={{ color: tokens.colors.fg.DEFAULT, fontSize: 22, fontWeight: '600' }}>
            −
          </RNText>
        </Pressable>

        <View
          style={{
            flex: 1,
            minHeight: 56,
            backgroundColor: tokens.colors.bg.surface,
            borderWidth: 1,
            borderColor: tokens.colors.border.DEFAULT,
            borderRadius: 12,
            paddingHorizontal: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <TextInput
            value={value}
            onChangeText={(v) => onChangeText(sanitize(v, mode))}
            inputMode={mode === 'integer' ? 'numeric' : 'decimal'}
            keyboardType={mode === 'integer' ? 'number-pad' : 'decimal-pad'}
            selectTextOnFocus
            placeholderTextColor={tokens.colors.fg.subtle}
            placeholder="0"
            style={{
              flex: 1,
              color: tokens.colors.fg.DEFAULT,
              fontSize: 28,
              fontWeight: '600',
              textAlign: 'center',
              fontVariant: ['tabular-nums'],
            }}
          />
          {suffix ? (
            <RNText
              style={{
                color: tokens.colors.fg.muted,
                fontSize: 16,
                marginLeft: 4,
              }}
            >
              {suffix}
            </RNText>
          ) : null}
        </View>

        <Pressable
          onPress={inc}
          accessibilityRole="button"
          accessibilityLabel={`Increase ${label}`}
          style={{
            width: 56,
            height: 56,
            borderRadius: 12,
            backgroundColor: tokens.colors.bg.surface,
            borderWidth: 1,
            borderColor: tokens.colors.border.DEFAULT,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <RNText style={{ color: tokens.colors.fg.DEFAULT, fontSize: 22, fontWeight: '600' }}>
            +
          </RNText>
        </Pressable>
      </View>
      {hint ? (
        <Text variant="caption" className="text-fg-subtle">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}
