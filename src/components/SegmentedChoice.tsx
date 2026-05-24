import { Pressable, Text as RNText, View } from 'react-native';
import { Text } from './Text';
import { tokens } from '@/lib/design/tokens';

export interface SegmentedChoiceOption<T extends string> {
  value: T;
  label: string;
  hint?: string;
}

interface Props<T extends string> {
  label?: string;
  value: T | null;
  onChange: (v: T) => void;
  options: SegmentedChoiceOption<T>[];
  vertical?: boolean;
}

export function SegmentedChoice<T extends string>({
  label,
  value,
  onChange,
  options,
  vertical = false,
}: Props<T>) {
  return (
    <View className="gap-2">
      {label ? <Text variant="caption">{label}</Text> : null}
      <View className={`gap-2 ${vertical ? '' : 'flex-row flex-wrap'}`}>
        {options.map((opt) => {
          const selected = opt.value === value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onChange(opt.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              className={`min-h-12 px-4 py-3 rounded-lg border ${
                selected
                  ? 'bg-accent border-accent'
                  : 'bg-bg-surface border-border'
              } ${vertical ? 'w-full' : ''}`}
            >
              <RNText
                style={{
                  color: selected ? tokens.colors.accent.contrast : tokens.colors.fg.DEFAULT,
                  fontSize: 16,
                  fontWeight: selected ? '600' : '400',
                }}
              >
                {opt.label}
              </RNText>
              {opt.hint ? (
                <RNText
                  style={{
                    color: selected ? tokens.colors.accent.contrast : tokens.colors.fg.muted,
                    fontSize: 13,
                    marginTop: 2,
                    opacity: selected ? 0.85 : 1,
                  }}
                >
                  {opt.hint}
                </RNText>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
