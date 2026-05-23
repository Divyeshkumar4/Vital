import { ReactNode } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cssInterop } from 'nativewind';

cssInterop(View, { className: 'style' });
cssInterop(ScrollView, { className: 'style', contentContainerClassName: 'contentContainerStyle' });
cssInterop(SafeAreaView, { className: 'style' });

interface Props {
  children: ReactNode;
  scroll?: boolean;
  className?: string;
}

export function Screen({ children, scroll = false, className = '' }: Props) {
  const Wrapper = scroll ? ScrollView : View;
  const wrapperProps = scroll
    ? { contentContainerClassName: `flex-grow p-6 gap-4 ${className}` }
    : { className: `flex-1 p-6 gap-4 ${className}` };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <Wrapper {...wrapperProps}>{children}</Wrapper>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
