import { TextInput, TextInputProps, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { Text } from './Text';

cssInterop(TextInput, { className: 'style' });

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  className?: string;
}

export function Input({ label, error, className = '', ...rest }: Props) {
  return (
    <View className="gap-2">
      {label ? <Text variant="caption">{label}</Text> : null}
      <TextInput
        placeholderTextColor="#5E6B79"
        className={`min-h-12 px-4 rounded-lg bg-bg-surface border border-border text-fg text-base ${error ? 'border-danger' : ''} ${className}`}
        {...rest}
      />
      {error ? (
        <Text variant="caption" className="text-danger">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
