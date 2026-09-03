// Scheme identity artwork: what a scheme is recognised BY, as opposed to what it
// pays out. A festive scheme wears an illustration of its festival; a brand
// scheme wears the brand's mark on white. The gift photos stay on the page.
//
// Every festival illustration is a deterministic SVG in a 64 x 64 circle so it
// renders sharp at any size: 44 px in a list, 78 px at the dock's apex.
//   diwali  a lit diya in a plum night: bowl, flame with a white core, a warm
//           glow, a rangoli arc of dots below, one sparkle above.
//   onam    a pookalam: three rings of petals, saffron outside, cream inside,
//           a vermilion heart, on Kerala green.
//   holi    three colour clouds, gulal pink, marigold yellow, sky blue, with
//           powder specks on a deep magenta ground.
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { F } from '../theme';
import Svg, { Defs, RadialGradient, LinearGradient, Stop, Circle, Path, Ellipse, G } from 'react-native-svg';

let uid = 0;
const useId = () => React.useRef(`art${uid++}`).current;

function Diya({ size }) {
  const id = useId();
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Defs>
        <RadialGradient id={`${id}bg`} cx="50%" cy="38%" r="70%">
          <Stop offset="0" stopColor="#3A2A6E" />
          <Stop offset="1" stopColor="#160E33" />
        </RadialGradient>
        <RadialGradient id={`${id}glow`} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="#FFD37A" stopOpacity="0.55" />
          <Stop offset="0.6" stopColor="#F2B84B" stopOpacity="0.12" />
          <Stop offset="1" stopColor="#F2B84B" stopOpacity="0" />
        </RadialGradient>
        <LinearGradient id={`${id}flame`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FFE9A8" />
          <Stop offset="0.55" stopColor="#FFB13D" />
          <Stop offset="1" stopColor="#FF7A2F" />
        </LinearGradient>
        <LinearGradient id={`${id}bowl`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#F7CC6A" />
          <Stop offset="1" stopColor="#C98A1B" />
        </LinearGradient>
      </Defs>
      <Circle cx="32" cy="32" r="32" fill={`url(#${id}bg)`} />
      {/* the warm glow behind the flame */}
      <Circle cx="32" cy="27" r="20" fill={`url(#${id}glow)`} />
      {/* the flame: a teardrop with a white core */}
      <Path d="M32 15.5c3.6 4.2 6 7.6 6 11.2 0 3.6-2.7 6.3-6 6.3s-6-2.7-6-6.3c0-3.6 2.4-7 6-11.2z" fill={`url(#${id}flame)`} />
      <Path d="M32 22c1.6 2 2.7 3.7 2.7 5.4 0 1.7-1.2 3-2.7 3s-2.7-1.3-2.7-3c0-1.7 1.1-3.4 2.7-5.4z" fill="#FFF6D6" />
      {/* the bowl: a shallow dish with a lit rim */}
      <Path d="M16 36.5h32c0 6.6-6.2 11.5-16 11.5S16 43.1 16 36.5z" fill={`url(#${id}bowl)`} />
      <Ellipse cx="32" cy="36.6" rx="16" ry="2.6" fill="#FFE29A" />
      <Ellipse cx="32" cy="36.6" rx="12.5" ry="1.5" fill="#B8791A" opacity="0.55" />
      {/* the rangoli arc under the diya */}
      <G fill="#F2B84B">
        <Circle cx="14" cy="52" r="1.3" />
        <Circle cx="20" cy="54.6" r="1.3" />
        <Circle cx="26.5" cy="56.2" r="1.3" />
        <Circle cx="32" cy="56.8" r="1.3" />
        <Circle cx="37.5" cy="56.2" r="1.3" />
        <Circle cx="44" cy="54.6" r="1.3" />
        <Circle cx="50" cy="52" r="1.3" />
      </G>
      <G fill="#FFFFFF" opacity="0.85">
        <Circle cx="17" cy="53.4" r="0.8" />
        <Circle cx="23.2" cy="55.6" r="0.8" />
        <Circle cx="29.2" cy="56.7" r="0.8" />
        <Circle cx="34.8" cy="56.7" r="0.8" />
        <Circle cx="40.8" cy="55.6" r="0.8" />
        <Circle cx="47" cy="53.4" r="0.8" />
      </G>
      {/* one sparkle, top left, where the eye enters */}
      <Path d="M17 14l1.1 2.9 2.9 1.1-2.9 1.1L17 22l-1.1-2.9L13 18l2.9-1.1z" fill="#F2B84B" />
      <Circle cx="48" cy="14" r="1" fill="#F2C46B" opacity="0.7" />
    </Svg>
  );
}

// Petals of a pookalam ring: `n` ellipses around (32,32) at radius `r`.
function Ring({ n, r, rx, ry, fill, opacity = 1, rotate = 0 }) {
  return (
    <G opacity={opacity}>
      {Array.from({ length: n }).map((_, i) => {
        const a = (i / n) * Math.PI * 2 + rotate;
        return <Ellipse key={i} cx={32 + r * Math.cos(a)} cy={32 + r * Math.sin(a)} rx={rx} ry={ry} fill={fill} transform={`rotate(${(a * 180) / Math.PI} ${32 + r * Math.cos(a)} ${32 + r * Math.sin(a)})`} />;
      })}
    </G>
  );
}

function Pookalam({ size }) {
  const id = useId();
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Defs>
        <RadialGradient id={`${id}bg`} cx="50%" cy="40%" r="70%">
          <Stop offset="0" stopColor="#176B4C" />
          <Stop offset="1" stopColor="#092E22" />
        </RadialGradient>
      </Defs>
      <Circle cx="32" cy="32" r="32" fill={`url(#${id}bg)`} />
      <Circle cx="32" cy="32" r="24" fill="#0B3A2A" opacity="0.6" />
      <Ring n={14} r={19.5} rx={4.6} ry={2.4} fill="#F5C04E" />
      <Ring n={14} r={19.5} rx={4.6} ry={2.4} fill="#F5C04E" rotate={Math.PI / 14} opacity={0.9} />
      <Ring n={10} r={13.5} rx={4} ry={2.2} fill="#FFF1B8" rotate={Math.PI / 10} />
      <Ring n={8} r={8.4} rx={3.2} ry={1.9} fill="#F0803C" />
      <Circle cx="32" cy="32" r="4.6" fill="#D1372A" />
      <Circle cx="32" cy="32" r="1.8" fill="#FFE29A" />
    </Svg>
  );
}

function HoliClouds({ size }) {
  const id = useId();
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Defs>
        <RadialGradient id={`${id}bg`} cx="50%" cy="40%" r="70%">
          <Stop offset="0" stopColor="#6A1D7A" />
          <Stop offset="1" stopColor="#32093E" />
        </RadialGradient>
        <RadialGradient id={`${id}p`} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="#FF6FB7" />
          <Stop offset="1" stopColor="#FF4FA3" stopOpacity="0.15" />
        </RadialGradient>
        <RadialGradient id={`${id}y`} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="#FFD86B" />
          <Stop offset="1" stopColor="#FFC93C" stopOpacity="0.15" />
        </RadialGradient>
        <RadialGradient id={`${id}b`} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="#6FD6FF" />
          <Stop offset="1" stopColor="#38C6F4" stopOpacity="0.15" />
        </RadialGradient>
      </Defs>
      <Circle cx="32" cy="32" r="32" fill={`url(#${id}bg)`} />
      <Circle cx="24" cy="27" r="15" fill={`url(#${id}p)`} />
      <Circle cx="40" cy="30" r="14" fill={`url(#${id}y)`} />
      <Circle cx="31" cy="42" r="13" fill={`url(#${id}b)`} />
      <G fill="#FFFFFF" opacity="0.9">
        <Circle cx="14" cy="18" r="1.1" />
        <Circle cx="50" cy="16" r="0.9" />
        <Circle cx="52" cy="44" r="1.2" />
        <Circle cx="12" cy="44" r="0.9" />
        <Circle cx="44" cy="52" r="0.8" />
        <Circle cx="20" cy="52" r="0.7" />
      </G>
      <G fill="#FF9AD5" opacity="0.9">
        <Circle cx="46" cy="22" r="1" />
        <Circle cx="18" cy="36" r="0.9" />
      </G>
    </Svg>
  );
}

export const FESTIVAL_ART = { diwali: Diya, onam: Pookalam, holi: HoliClouds };

// `scheme.art` is { logo: ImageSource } for a brand scheme; a festive scheme is
// drawn from its theme key. `dim` renders a completed scheme at 70 %.
export default function SchemeArt({ scheme, size = 52, dim = false }) {
  const Fest = FESTIVAL_ART[scheme.theme];
  if (Fest) {
    return (
      <View style={[{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden' }, dim && { opacity: 0.7 }]}>
        <Fest size={size} />
      </View>
    );
  }
  return (
    <View style={[styles.disc, { width: size, height: size, borderRadius: size / 2 }, dim && { opacity: 0.7 }]}>
      {scheme.art?.logo ? (
        // A wide wordmark takes 82% of the disc so it stays legible at 42 px; a
        // compact mark sits at 66%, the optical weight of a monogram.
        <Image source={scheme.art.logo} style={{ width: size * (scheme.art.wide ? 0.82 : 0.66), height: size * 0.66 }} resizeMode="contain" />
      ) : (
        // No mark on file yet: the brand's initials in its colour, never a generic glyph.
        <Text style={{ color: scheme.art?.color || '#1A1A1A', fontFamily: F.bold, fontSize: Math.round(size * 0.34), lineHeight: Math.round(size * 0.42), letterSpacing: -0.5 }} allowFontScaling={false}>
          {scheme.art?.mark || scheme.title.slice(0, 1)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  disc: { backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
});
