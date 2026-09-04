// The entry for the founder review: two options, side by side. Option A is the
// dock bar (version A), Option B is the sheet and the arc (version B). Each card
// shows a device preview of its landing frame, the option's name, and one line
// on what differs. Tapping a card opens that version; the back arrow returns.
//
// Motion: the title settles first, then the two cards rise 60 ms apart, then
// the footnote. Cards press to 0.97 on a spring. Everything under 300 ms.
import React, { useEffect, useRef } from 'react';
import { View, Text, Image, Pressable, StyleSheet, Animated, Easing, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { F } from '../theme';
import { usePressScale } from '../gifts/solv';
import { SETTLED } from './motion';

const INK = '#0B0A14';
const PREVIEW_A = require('../../exploration-screenshots/pager-01-landing-diwali.png');
const PREVIEW_B = require('../../exploration-screenshots/arc-01-landing-diwali.png');

const OPTIONS = [
  {
    key: 'A',
    title: 'Dock',
    line: 'Every scheme in a glass pill near the thumb. The page fills the screen.',
    href: '/schemes',
    preview: PREVIEW_A,
  },
  {
    key: 'B',
    title: 'Arc',
    line: 'The page is a card. The schemes sit on an arc under it and turn as you swipe.',
    href: '/schemes/arc',
    preview: PREVIEW_B,
  },
];

function OptionCard({ option, anim, width, onPress }) {
  const press = usePressScale(0.97);
  // the device preview keeps the 412 x 915 frame's aspect
  const previewW = width - 2 * 14;
  const previewH = Math.round(previewW * (915 / 412));
  return (
    <Animated.View style={[styles.card, { width, opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }, { scale: press.scale }] }]}>
      <Pressable onPress={onPress} onPressIn={press.pressIn} onPressOut={press.pressOut} accessibilityRole="button" accessibilityLabel={`Option ${option.key}, ${option.title}`} style={styles.cardInner}>
        <View style={styles.cardHead}>
          <Text style={styles.option} allowFontScaling={false}>OPTION {option.key}</Text>
          <Text style={styles.cardTitle} allowFontScaling={false}>{option.title}</Text>
        </View>
        <View style={[styles.device, { width: previewW, height: previewH }]}>
          <Image source={option.preview} style={{ width: previewW, height: previewH }} resizeMode="cover" />
          <View pointerEvents="none" style={styles.deviceEdge} />
        </View>
        <Text style={styles.cardLine} allowFontScaling={false}>{option.line}</Text>
      </Pressable>
    </Animated.View>
  );
}

export default function OptionsEntry() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  // two cards side by side on a phone: 16 px margins, 12 px gutter
  const cardW = Math.floor((Math.min(width, 412) - 16 * 2 - 12) / 2);

  const a = useRef([0, 1, 2, 3].map(() => new Animated.Value(SETTLED ? 1 : 0))).current;
  useEffect(() => {
    if (SETTLED) return;
    const out = (v, d) => Animated.timing(v, { toValue: 1, duration: d, easing: Easing.out(Easing.cubic), useNativeDriver: false });
    Animated.stagger(60, [out(a[0], 260), out(a[1], 300), out(a[2], 300), out(a[3], 260)]).start();
  }, []);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <Animated.View style={[styles.head, { opacity: a[0], transform: [{ translateY: a[0].interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }]}>
        <Text style={styles.eyebrow} allowFontScaling={false}>SOLV · MY SCHEMES</Text>
        <Text style={styles.title} allowFontScaling={false}>Two ways in</Text>
        <Text style={styles.sub} allowFontScaling={false}>
          Both open on the Mega Diwali Scheme. Swipe the page, or the schemes below it, to move between schemes.
        </Text>
      </Animated.View>
      <View style={styles.row}>
        {OPTIONS.map((o, i) => (
          <OptionCard key={o.key} option={o} anim={a[i + 1]} width={cardW} onPress={() => router.push(o.href)} />
        ))}
      </View>
      <Animated.Text style={[styles.foot, { opacity: a[3] }]} allowFontScaling={false}>
        Prototype, September 2026. Data is illustrative.
      </Animated.Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: INK, alignItems: 'center' },
  head: { width: '100%', maxWidth: 412, paddingHorizontal: 20, paddingTop: 28 },
  eyebrow: { color: 'rgba(255,255,255,0.55)', fontFamily: F.bold, fontSize: 11, lineHeight: 14, letterSpacing: 1.4 },
  title: { marginTop: 8, color: '#fff', fontFamily: F.bold, fontSize: 30, lineHeight: 36, letterSpacing: 0.1 },
  sub: { marginTop: 8, color: 'rgba(255,255,255,0.68)', fontFamily: F.regular, fontSize: 14, lineHeight: 20 },
  row: { width: '100%', maxWidth: 412, flexDirection: 'row', justifyContent: 'center', gap: 12, paddingHorizontal: 16, marginTop: 24 },
  card: {
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    overflow: 'hidden',
  },
  cardInner: { padding: 14, paddingBottom: 16 },
  cardHead: { marginBottom: 12 },
  option: { color: 'rgba(255,255,255,0.55)', fontFamily: F.bold, fontSize: 10.5, lineHeight: 13, letterSpacing: 1.4 },
  cardTitle: { marginTop: 3, color: '#fff', fontFamily: F.bold, fontSize: 20, lineHeight: 25 },
  device: { borderRadius: 14, overflow: 'hidden', backgroundColor: '#1A1730' },
  // the image's edge: pure white at low alpha on a dark ground
  deviceEdge: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)' },
  cardLine: { marginTop: 12, color: 'rgba(255,255,255,0.68)', fontFamily: F.regular, fontSize: 12.5, lineHeight: 17 },
  foot: { marginTop: 'auto', marginBottom: 16, color: 'rgba(255,255,255,0.40)', fontFamily: F.regular, fontSize: 12, lineHeight: 16 },
});
