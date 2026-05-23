import { Text as RNText, TextProps } from 'react-native';

type Variant = 'display' | 'h1' | 'h2' | 'body' | 'caption' | 'mono';

const variantClass: Record<Variant, string> = {
  display: 'text-5xl font-bold text-fg',
  h1: 'text-3xl font-semibold text-fg',
  h2: 'text-xl font-semibold text-fg',
  body: 'text-base text-fg',
  caption: 'text-sm text-fg-muted',
  mono: 'text-sm font-mono text-fg',
};

interface Props extends TextProps {
  variant?: Variant;
  className?: string;
}

export function Text({ variant = 'body', className = '', ...rest }: Props) {
  return <RNText className={`${variantClass[variant]} ${className}`} {...rest} />;
}
