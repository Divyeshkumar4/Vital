import { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { tokens } from '@/lib/design/tokens';

interface Props {
  /** 0..1 (clamped). Set to >1 to allow overshoot tinting. */
  progress: number;
  /** Outer diameter in dp. */
  size?: number;
  /** Stroke thickness in dp. */
  strokeWidth?: number;
  /** Tinting strategy:
   *  - 'auto' (default): green when 0–100%, amber when >100%
   *  - explicit string colour
   */
  color?: 'auto' | string;
  trackColor?: string;
  /** Content rendered inside the ring (number, label, etc). */
  children?: ReactNode;
}

export function CircularProgress({
  progress,
  size = 220,
  strokeWidth = 14,
  color = 'auto',
  trackColor = tokens.colors.border.DEFAULT,
  children,
}: Props) {
  const clamped = Math.max(0, progress);
  const stroke =
    color === 'auto' ? (clamped > 1 ? tokens.colors.warn.DEFAULT : tokens.colors.accent.DEFAULT) : color;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = circumference * Math.min(1, clamped);
  const gap = circumference - dash;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg
        width={size}
        height={size}
        style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}
      >
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          strokeDasharray={`${dash}, ${gap}`}
        />
      </Svg>
      <View style={{ alignItems: 'center', justifyContent: 'center', padding: 12 }}>
        {children}
      </View>
    </View>
  );
}
