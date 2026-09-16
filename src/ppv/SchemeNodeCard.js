// The small target-scheme card on the product page: one row that says this
// product counts toward a scheme, and what buying it does for the shop. A tap
// opens the scheme sheet (SchemeSheet.js).
//
// Anatomy, 72 px tall, in the page's card style (white, 1 px grey_3, square):
//   left    the next gift's picture in a 44 px tile (the thing to win)
//   middle  line 1, bold 14: the scheme title ("Mega Diwali Scheme")
//           line 2, 12 sub: the ask, or the state ("Buy ₹3,60,000 more to win
//           the Soundbar", "Starts 1 Oct · 8 slabs", "You've qualified for the
//           Kettle · ₹62,000 more for the Microwave")
//   right   a chevron disc in the accent tint
// With two schemes the card carries the nearer win and a "+1 more scheme" line.
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

export default function SchemeNodeCard({ schemes, onPress, style }) {
  const press = usePressScale(0.98);
  const lead = schemes[0];
  const s = lead.s;
  const gift = s.next || s.secured || s.top;
  const more = schemes.length - 1;
  return (
    <Animated.View style={[{ transform: [{ scale: press.scale }] }, style]}>
      <Pressable
        style={styles.card}
        onPress={onPress}
        onPressIn={press.pressIn}
        onPressOut={press.pressOut}
        android_ripple={{ color: 'rgba(0,0,0,0.06)' }}
        accessibilityRole="button"
        accessibilityLabel={`Target scheme: ${lead.title}. ${nodeLine(lead)}`}
      >
        <View style={styles.tile}>
          <GiftThumb gift={gift} size={34} />
        </View>
        <View style={styles.text}>
          <View style={styles.titleRow}>
            <Text style={styles.eyebrow} allowFontScaling={false}>TARGET SCHEME</Text>
            {more > 0 ? <Text style={styles.more} allowFontScaling={false}>+{more} more</Text> : null}
          </View>
          <Text style={styles.title} numberOfLines={1} allowFontScaling={false}>{lead.title}</Text>
          <Text style={[styles.line, TAB]} numberOfLines={1} allowFontScaling={false}>{nodeLine(lead)}</Text>
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

const TAB = { fontVariant: ['tabular-nums'] };

const styles = StyleSheet.create({
  // The page's own card language: white, 1 px grey_3, square corners.
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#CCCCCC', paddingVertical: 12, paddingLeft: 12, paddingRight: 10, gap: 12 },
  tile: { width: 48, height: 48, borderRadius: 10, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eyebrow: { color: SOLV.blue, fontFamily: F.bold, fontSize: 10, lineHeight: 13, letterSpacing: 0.8 },
  more: { color: SOLV.sub, fontFamily: F.medium, fontSize: 11, lineHeight: 13 },
  title: { color: SOLV.ink, fontFamily: F.bold, fontSize: 14, lineHeight: 18, marginTop: 2 },
  line: { color: SOLV.sub, fontFamily: F.regular, fontSize: 12, lineHeight: 16, marginTop: 1 },
  chev: { width: 30, height: 30, borderRadius: 15, backgroundColor: SOLV.blueBg, alignItems: 'center', justifyContent: 'center' },
});
