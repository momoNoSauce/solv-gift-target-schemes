// Renders bg_gold_pattern_rounded_top.xml / bg_gold_all_rounded.xml.
// The base path is white; every ornament path uses the drawable's gold gradient.
import React from 'react';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { StyleSheet } from 'react-native';
import { GOLD_SHEET_TOP, GOLD_CARD } from './goldArtwork';

function GoldArt({ art, id, style }) {
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox={art.viewBox}
      preserveAspectRatio="xMidYMid slice"
      style={[StyleSheet.absoluteFill, style]}
    >
      <Defs>
        <LinearGradient id={id} x1="1" y1="0.5" x2="0" y2="0.5">
          <Stop offset="0" stopColor="#F0CA95" />
          <Stop offset="0.16" stopColor="#F3D29B" />
          <Stop offset="0.47" stopColor="#F6DAA2" />
          <Stop offset="0.8" stopColor="#F7DDA5" />
          <Stop offset="0.9" stopColor="#EED39D" />
          <Stop offset="0.96" stopColor="#D6BA8A" />
          <Stop offset="1" stopColor="#BEA176" />
        </LinearGradient>
      </Defs>
      {art.paths.map((p, i) => (
        <Path key={i} d={p.d} fill={p.solid ?? `url(#${id})`} />
      ))}
    </Svg>
  );
}

export const GoldSheetTop = () => <GoldArt art={GOLD_SHEET_TOP} id="goldSheet" />;
export const GoldCardBg = () => <GoldArt art={GOLD_CARD} id="goldCard" />;
