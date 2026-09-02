// Crafted stage surfaces. A flat two-stop linear gradient reads as a default;
// these scenes build depth the way a lit room does:
//   1. a solid ground with a vertical falloff,
//   2. a warm key glow behind the pedestal,
//   3. a cool ambient glow at the top edge,
//   4. a vignette that darkens the corners,
//   5. sparse light specks, festive themes only, at fixed positions.
// Everything is deterministic: the same theme always paints the same pixels.
import React from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, RadialGradient, Stop, Rect, Circle } from 'react-native-svg';

// Fixed speck field (viewBox 412 x 480): position, radius, opacity. Kept away
// from the centre so the pedestal and the copy stay clean.
const SPECKS = [
  [38, 84, 1.6, 0.5], [86, 190, 1.1, 0.32], [58, 320, 1.4, 0.4],
  [128, 52, 1.2, 0.35], [170, 132, 1.0, 0.26], [352, 74, 1.6, 0.5],
  [312, 168, 1.1, 0.3], [376, 250, 1.4, 0.42], [330, 340, 1.2, 0.32],
  [250, 44, 1.0, 0.3], [390, 140, 1.0, 0.28], [24, 236, 1.0, 0.3],
];

let uid = 0;

// Fills its parent (position absolute). `focusY` is where the key glow centres,
// as a fraction of the height (the pedestal's middle).
export default function StageScene({ stage, festive, focusY = 0.42 }) {
  const id = React.useRef(`sc${uid++}`).current;
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 412 480"
      preserveAspectRatio="xMidYMid slice"
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    >
      <Defs>
        <LinearGradient id={`${id}g`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={stage.ground} />
          <Stop offset="1" stopColor={stage.ground2} />
        </LinearGradient>
        <RadialGradient id={`${id}key`} cx="50%" cy={`${focusY * 100}%`} r="46%">
          <Stop offset="0" stopColor={stage.glowKey} stopOpacity="0.34" />
          <Stop offset="0.55" stopColor={stage.glowKey} stopOpacity="0.10" />
          <Stop offset="1" stopColor={stage.glowKey} stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id={`${id}amb`} cx="18%" cy="-8%" r="70%">
          <Stop offset="0" stopColor={stage.glowAmbient} stopOpacity="0.5" />
          <Stop offset="1" stopColor={stage.glowAmbient} stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id={`${id}vin`} cx="50%" cy="42%" r="78%">
          <Stop offset="0" stopColor="#000" stopOpacity="0" />
          <Stop offset="0.72" stopColor="#000" stopOpacity="0" />
          <Stop offset="1" stopColor="#000" stopOpacity="0.32" />
        </RadialGradient>
      </Defs>
      <Rect x="0" y="0" width="412" height="480" fill={`url(#${id}g)`} />
      <Rect x="0" y="0" width="412" height="480" fill={`url(#${id}amb)`} />
      <Rect x="0" y="0" width="412" height="480" fill={`url(#${id}key)`} />
      {festive
        ? SPECKS.map(([x, y, r, o], i) => (
            <Circle key={i} cx={x} cy={y} r={r} fill={stage.speck} opacity={o} />
          ))
        : null}
      <Rect x="0" y="0" width="412" height="480" fill={`url(#${id}vin)`} />
    </Svg>
  );
}

// The card's header band: the ground with its vertical falloff and a hairline
// of the accent along the bottom edge. No glow: at 44px a glow reads as a
// smear, not a light.
export function BandScene({ stage }) {
  const id = React.useRef(`bd${uid++}`).current;
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 412 44"
      preserveAspectRatio="xMidYMid slice"
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    >
      <Defs>
        <LinearGradient id={`${id}g`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={stage.ground} />
          <Stop offset="1" stopColor={stage.ground2} />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="412" height="44" fill={`url(#${id}g)`} />
      <Rect x="0" y="43" width="412" height="1" fill={stage.speck} opacity="0.35" />
    </Svg>
  );
}
