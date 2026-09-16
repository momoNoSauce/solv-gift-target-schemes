// The small target-scheme card on the product page: one row that says this
// product counts toward a scheme, and what buying it does for the shop. A tap
// opens the scheme sheet (SchemeSheet.js).
//
// Anatomy, in the page's card style (white, 1 px grey_3, square): the eyebrow
// TARGET SCHEME(S) once, then a row per scheme, 68 px each, divided:
//   left    the next gift's picture in a 48 px tile (the thing to win)
//   middle  line 1, bold 14: the scheme title ("Mega Diwali Scheme")
//           line 2, 12 sub: the ask, or the state ("Buy ₹3,60,000 more to win
//           the Soundbar", "Starts 1 Oct · 8 slabs", "You've qualified for the
//           Kettle")
//   right   a chevron disc in the accent tint
// A tap on a row opens the sheet for that scheme alone.
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { F } from '../theme';
import { SOLV, GiftThumb, usePressScale } from '../gifts/solv';
import { STATE } from '../gifts/state';
import { Animated } from 'react-native';

// One line for the middle: what buying this product does for the shop.
export function nodeLine(scheme) {
  const s = scheme.s;
  const money = scheme.money;
  if (s.state === STATE.SCHEDULED) return `Starts ${s.startLabel} · ${s.ladder.length === 1 ? '1 slab' : `${s.ladder.length} slabs`}`;
  if (s.ended) return s.earned ? `You won the ${s.secured.shortName}` : 'Ended';
  if (!s.next) return `You've qualified for the ${s.secured.shortName}`;
  const ask = `Buy ${money(s.remaining)} more to win the ${s.next.cash ? `${s.next.cash} cashback` : s.next.shortName}`;
  return ask;
}

function SchemeRow({ scheme, onPress, last }) {
  const press = usePressScale(0.98);
  const s = scheme.s;
  const gift = s.next || s.secured || s.top;
  return (
    <Animated.View style={{ transform: [{ scale: press.scale }] }}>
      <Pressable
        style={[styles.row, !last && styles.rowDivider]}
        onPress={() => onPress(scheme)}
        onPressIn={press.pressIn}
        onPressOut={press.pressOut}
        android_ripple={{ color: 'rgba(0,0,0,0.06)' }}
        accessibilityRole="button"
        accessibilityLabel={`Target scheme: ${scheme.title}. ${nodeLine(scheme)}`}
      >
        <View style={styles.tile}>
          <GiftThumb gift={gift} size={34} />
        </View>
        <View style={styles.text}>
          <Text style={styles.title} numberOfLines={1} allowFontScaling={false}>{scheme.title}</Text>
          <Text style={[styles.line, TAB]} numberOfLines={1} allowFontScaling={false}>{nodeLine(scheme)}</Text>
        </View>
        <View style={styles.chev}>
          <Svg width={18} height={18} viewBox="0 0 24 24">
            <Path d="M9.29 6.71a1 1 0 0 0 0 1.41L13.17 12l-3.88 3.88a1 1 0 1 0 1.42 1.41l4.59-4.59a1 1 0 0 0 0-1.41L10.71 6.7a1 1 0 0 0-1.42.01z" fill={SOLV.blue} />
          </Svg>
        </View>
      </Pressable>
    </Animated.View>
  );
}

// The card: the eyebrow once, then one row per scheme the product counts
// toward. A tap on a row opens the sheet for that scheme.
export default function SchemeNodeCard({ schemes, onPress, style }) {
  return (
    <View style={[styles.card, style]}>
      <Text style={styles.eyebrow} allowFontScaling={false}>{schemes.length === 1 ? 'TARGET SCHEME' : 'TARGET SCHEMES'}</Text>
      {schemes.map((sc, i) => <SchemeRow key={sc.id} scheme={sc} onPress={onPress} last={i === schemes.length - 1} />)}
    </View>
  );
}

const TAB = { fontVariant: ['tabular-nums'] };

const styles = StyleSheet.create({
  // The page's own card language: white, 1 px grey_3, square corners.
  card: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#CCCCCC', paddingTop: 10 },
  eyebrow: { color: SOLV.blue, fontFamily: F.bold, fontSize: 10, lineHeight: 13, letterSpacing: 0.8, paddingHorizontal: 12 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingLeft: 12, paddingRight: 10, gap: 12 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: '#ebebeb' },
  tile: { width: 48, height: 48, borderRadius: 10, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1 },
  title: { color: SOLV.ink, fontFamily: F.bold, fontSize: 14, lineHeight: 18 },
  line: { color: SOLV.sub, fontFamily: F.regular, fontSize: 12, lineHeight: 16, marginTop: 1 },
  chev: { width: 30, height: 30, borderRadius: 15, backgroundColor: SOLV.blueBg, alignItems: 'center', justifyContent: 'center' },
});
