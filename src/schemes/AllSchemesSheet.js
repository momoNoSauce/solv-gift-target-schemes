// "All schemes": the list behind the dock, for a member with more schemes than
// a dock can show at a glance. A bottom sheet on the dark ground: a handle, the
// count, two groups (running, completed), one row per scheme with its art, its
// full name, its status line and a chevron. The scheme on screen carries a
// "Viewing" mark. Tapping a row springs the pager to that scheme and closes
// the sheet. References: Grab's outlet list and Transit's settings sheet
// (Mobbin, Sep 2026): round mark, two lines, chevron, grouped.
//
// Motion: the scrim fades (200 ms) and the sheet springs up (stiffness 300,
// damping 32); closing reverses both, faster and still easing OUT (200 ms
// sheet, 160 ms scrim), so the first frame of the exit moves. Both can be
// interrupted by the next tap.
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { F } from '../theme';
import GiftGlyph from '../gifts/icons';
import SchemeArt from './SchemeArt';
import { statusLine } from './registry';
import { T } from './copy';

const INK = '#FFFFFF';
const SUB = 'rgba(255,255,255,0.64)';
const LINE = 'rgba(255,255,255,0.08)';
const SHEET_BG = '#1A1730';

export default function AllSchemesSheet({ open, schemes, index, onSelect, onClose, height, bottomInset = 0 }) {
  const [mounted, setMounted] = useState(open);
  const scrim = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(1)).current;   // 1 = below the screen, 0 = in place

  useEffect(() => {
    if (open) {
      setMounted(true);
      Animated.parallel([
        Animated.timing(scrim, { toValue: 1, duration: 200, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
        Animated.spring(slide, { toValue: 0, stiffness: 300, damping: 32, mass: 1, useNativeDriver: false }),
      ]).start();
    } else if (mounted) {
      Animated.parallel([
        Animated.timing(scrim, { toValue: 0, duration: 160, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
        Animated.timing(slide, { toValue: 1, duration: 200, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
      ]).start(({ finished }) => finished && setMounted(false));
    }
  }, [open]);

  if (!mounted) return null;
  const t = T.en;
  const running = schemes.map((s, i) => [s, i]).filter(([s]) => s.group === 'running');
  const completed = schemes.map((s, i) => [s, i]).filter(([s]) => s.group === 'completed');
  const sheetH = Math.min(height * 0.72, 72 + (schemes.length + 2) * 64 + bottomInset + 16);

  const Row = ([sc, i]) => (
    <Pressable
      key={sc.id}
      onPress={() => {
        onSelect(i);
        onClose();
      }}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: 'rgba(255,255,255,0.06)' }]}
      accessibilityRole="button"
      accessibilityLabel={sc.title}
    >
      <SchemeArt scheme={sc} size={40} dim={sc.group === 'completed'} />
      <View style={styles.rowText}>
        <Text style={styles.rowTitle} numberOfLines={1} allowFontScaling={false}>{sc.title}</Text>
        <Text style={styles.rowStatus} numberOfLines={1} allowFontScaling={false}>{statusLine(sc)}</Text>
      </View>
      {i === index ? (
        <Text style={styles.viewing} allowFontScaling={false}>Viewing</Text>
      ) : (
        <Svg width={18} height={18} viewBox="0 0 24 24">
          <Path fill="rgba(255,255,255,0.4)" d="M8.59,16.58L13.17,12L8.59,7.41L10,6l6,6l-6,6L8.59,16.58z" />
        </Svg>
      )}
    </Pressable>
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View style={[styles.scrim, { opacity: scrim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
      </Animated.View>
      <Animated.View
        style={[
          styles.sheet,
          { height: sheetH, paddingBottom: bottomInset + 8, transform: [{ translateY: slide.interpolate({ inputRange: [0, 1], outputRange: [0, sheetH + 40] }) }] },
        ]}
      >
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.title} allowFontScaling={false}>All schemes</Text>
          <Text style={styles.count} allowFontScaling={false}>{schemes.length}</Text>
          <Pressable onPress={onClose} style={styles.close} accessibilityLabel="Close" hitSlop={8}>
            <Svg width={18} height={18} viewBox="0 0 24 24">
              <Path d="M6 6l12 12M18 6L6 18" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
            </Svg>
          </Pressable>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          {running.length ? <Text style={styles.section} allowFontScaling={false}>{t.running}</Text> : null}
          {running.map(Row)}
          {completed.length ? <Text style={[styles.section, running.length && { marginTop: 14 }]} allowFontScaling={false}>{t.completed}</Text> : null}
          {completed.map(Row)}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: SHEET_BG,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -6 },
  },
  handle: { alignSelf: 'center', width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.28)', marginTop: 8 },
  header: { flexDirection: 'row', alignItems: 'center', height: 52, marginTop: 4 },
  title: { color: INK, fontFamily: F.bold, fontSize: 17, lineHeight: 22 },
  count: { marginLeft: 8, color: SUB, fontFamily: F.medium, fontSize: 13, lineHeight: 17, fontVariant: ['tabular-nums'] },
  close: { marginLeft: 'auto', width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.10)', alignItems: 'center', justifyContent: 'center' },
  section: { color: SUB, fontFamily: F.bold, fontSize: 11, lineHeight: 14, letterSpacing: 1, marginTop: 4, marginBottom: 4, paddingHorizontal: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, height: 60, paddingHorizontal: 4, borderRadius: 12, borderTopWidth: 1, borderTopColor: LINE },
  rowText: { flex: 1 },
  rowTitle: { color: INK, fontFamily: F.medium, fontSize: 15, lineHeight: 19 },
  rowStatus: { marginTop: 1, color: SUB, fontFamily: F.regular, fontSize: 12, lineHeight: 16, fontVariant: ['tabular-nums'] },
  viewing: { color: SUB, fontFamily: F.medium, fontSize: 12, lineHeight: 16 },
});
