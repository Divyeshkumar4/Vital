import { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { tokens } from '@/lib/design/tokens';

interface Props {
  /** 0..1 (clamped to >= 0). Set to >1 to allow overshoot tinting. */
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
    color === 'auto'
      ? clamped > 1
        ? tokens.colors.warn.DEFAULT
        : tokens.colors.accent.DEFAULT
      : color;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = circumference * Math.min(1, clamped);
  const gap = circumference - dash;
  // Don't draw the coloured arc at all when progress is 0 — otherwise the
  // rounded line-cap renders a stray dot at the 12 o'clock starting point.
  const showArc = dash > 0.5;

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
        {showArc ? (
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
        ) : null}
      </Svg>
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          // Keep content well inside the ring so descenders / ascenders never
          // touch the stroke. About 18% of diameter per side has felt right.
          paddingHorizontal: size * 0.18,
        }}
      >
        {children}
      </View>
    </View>
  );
}
