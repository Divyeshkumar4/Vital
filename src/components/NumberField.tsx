import { TextInput, View } from 'react-native';
import { Text } from './Text';

interface Props {
  label?: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  suffix?: string;
  error?: string;
  /** 'integer' restricts to whole numbers, 'decimal' allows a single decimal point. */
  mode?: 'integer' | 'decimal';
}

function sanitize(v: string, mode: 'integer' | 'decimal'): string {
  if (mode === 'integer') return v.replace(/[^0-9]/g, '');
  // Allow one leading minus? No — health metrics are non-negative.
  const cleaned = v.replace(/[^0-9.]/g, '');
  const firstDot = cleaned.indexOf('.');
  if (firstDot === -1) return cleaned;
  return cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, '');
}

export function NumberField({
  label,
  value,
  onChangeText,
  placeholder,
  suffix,
  error,
  mode = 'decimal',
}: Props) {
  return (
    <View className="gap-2">
      {label ? <Text variant="caption">{label}</Text> : null}
      <View
        className={`flex-row items-center min-h-12 px-4 rounded-lg bg-bg-surface border ${
          error ? 'border-danger' : 'border-border'
        }`}
      >
        <TextInput
          className="flex-1 text-fg text-base"
          placeholderTextColor="#5E6B79"
          value={value}
          onChangeText={(v) => onChangeText(sanitize(v, mode))}
          placeholder={placeholder}
          inputMode={mode === 'integer' ? 'numeric' : 'decimal'}
          keyboardType={mode === 'integer' ? 'number-pad' : 'decimal-pad'}
        />
        {suffix ? (
          <Text variant="caption" className="ml-2">
            {suffix}
          </Text>
        ) : null}
      </View>
      {error ? (
        <Text variant="caption" className="text-danger">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
