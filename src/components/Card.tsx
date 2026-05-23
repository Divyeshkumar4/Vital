import { ReactNode } from 'react';
import { View } from 'react-native';
import { Text } from './Text';

interface Props {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export function Card({ title, subtitle, children, className = '' }: Props) {
  return (
    <View className={`bg-bg-surface border border-border rounded-xl p-5 gap-3 ${className}`}>
      {title ? <Text variant="h2">{title}</Text> : null}
      {subtitle ? <Text variant="caption">{subtitle}</Text> : null}
      {children}
    </View>
  );
}
