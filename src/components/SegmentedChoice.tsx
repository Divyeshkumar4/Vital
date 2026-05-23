import { Pressable, View } from 'react-native';
import { Text } from './Text';

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
                selected ? 'bg-accent border-accent' : 'bg-bg-surface border-border'
              } ${vertical ? 'w-full' : ''}`}
            >
              <Text className={selected ? 'text-accent-contrast font-semibold' : 'text-fg'}>
                {opt.label}
              </Text>
              {opt.hint ? (
                <Text
                  variant="caption"
                  className={selected ? 'text-accent-contrast/80' : 'text-fg-muted'}
                >
                  {opt.hint}
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
