import React from 'react';
import Svg, { Path, Defs, LinearGradient, Stop, G, ClipPath } from 'react-native-svg';
import { GOLD_TAG_SMALL, GOLD_TAG_LARGE } from './goldTagPaths';

// gold_exclusive_tag.xml (small card) / gold_exclusive_tag_large.xml (large card),
// rendered from the drawables' own path data.
export function GoldTag({ height, large }) {
  const t = large ? GOLD_TAG_LARGE : GOLD_TAG_SMALL;
  const [, , vbW, vbH] = t.viewBox.split(' ').map(Number);
  return (
    <Svg width={(height * vbW) / vbH} height={height} viewBox={t.viewBox}>
      <Defs>
        <LinearGradient id={`pill${large ? 'L' : 'S'}`} x1="0" y1="0.5" x2="1" y2="0.5">
          <Stop offset="0" stopColor="#FBEDFF" />
          <Stop offset="1" stopColor="#F1C7FF" />
        </LinearGradient>
        <LinearGradient id={`flame${large ? 'L' : 'S'}`} x1="0" y1="1" x2="1" y2="0.9">
          <Stop offset="0" stopColor="#F57E16" />
          <Stop offset="0.53" stopColor="#FFAC40" />
          <Stop offset="0.93" stopColor="#B86E0F" />
        </LinearGradient>
        <LinearGradient id={`crown${large ? 'L' : 'S'}`} x1="0.5" y1="1" x2="0.5" y2="0">
          <Stop offset="0" stopColor="#6909B8" />
          <Stop offset="1" stopColor="#A922A3" />
        </LinearGradient>
        <ClipPath id={`clip${large ? 'L' : 'S'}`}>
          <Path d={t.clip} />
        </ClipPath>
      </Defs>
      <Path fill={`url(#pill${large ? 'L' : 'S'})`} d={t.pill} />
      <G clipPath={`url(#clip${large ? 'L' : 'S'})`}>
        <Path fill={`url(#flame${large ? 'L' : 'S'})`} d={t.flame} />
        <Path fill={`url(#crown${large ? 'L' : 'S'})`} d={t.crownOuter} />
        <Path fill={`url(#crown${large ? 'L' : 'S'})`} d={t.crownInner} />
      </G>
      <Path fill={`url(#crown${large ? 'L' : 'S'})`} d={t.lettering} />
    </Svg>
  );
}


// Alias used by the cashback claimed rows, which draw the same tag at 70x30.
export function GoldExclusiveTag({ height }) {
  return <GoldTag height={height} large={false} />;
}
