// Option A, the detail: the sheet and the arc. A component, not a route, so the
// list can grow a card into it in place. The route (app/schemes/arc.js) wraps it.
//
// Same engine as the dock version (src/schemes/usePager.js): one position
// value, two gesture surfaces (the card strip, the arc zone), one spring.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { F } from '../theme';
import { IconBack } from '../icons';
import GiftGlyph from '../gifts/icons';
import { themeOf } from '../gifts/themes';
import { VIEWS } from './registry';
import { usePager } from './usePager';
import SchemePage from './SchemePage';
import ArcDock, { ARC_PITCH, ZONE_H } from './ArcDock';
import AllSchemesSheet from './AllSchemesSheet';
import { T } from './copy';
import { backToEntry, toList } from './nav';

// The scheme picker (the "N schemes" button and its sheet) is hidden for now,
// per the review of 4 Sep 2026. The swipe and the dock still move between schemes.
const SHOW_PICKER = false;

export const SHEET_MARGIN = 14;
export const SHEET_RADIUS = 24;
export const SHEET_TOP = 10;   // below the safe area

// The ground: one cool near-black for every page, with a whisper (18 %) of the
// active theme's night mixed in. The card carries the colour; the floor recedes.
export const INK = '#0B0A14';
const TINT = 0.18;
const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
export const mix = (a, b, t) => {
  const [r1, g1, b1] = hex(a);
  const [r2, g2, b2] = hex(b);
  const ch = (x, y) => Math.round(x + (y - x) * t).toString(16).padStart(2, '0');
  return `#${ch(r1, r2)}${ch(g1, g2)}${ch(b1, b2)}`;
};

// The sheet's frame on a screen of the given size: where a card grows to.
export function arcSheetRect(w, h, insets) {
  const top = insets.top + SHEET_TOP;
  return { x: SHEET_MARGIN, y: top, w: w - SHEET_MARGIN * 2, h: h - top - (ZONE_H + insets.bottom), radius: SHEET_RADIUS };
}

export default function ArcScreen({ schemes, viewKey = 'typical', initialIndex = 0, pinned = null, demo = false, still = false, embedded = false, onBack, onIndexChange, onHome }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const n = schemes.length;
  const firstIndex = useRef(pinned != null ? Math.round(pinned) : initialIndex).current;

  const [size, setSize] = useState({ w: 0, h: 0 });
  const pager = usePager({ count: n, initial: firstIndex });
  const { pos, index, goTo, pagePan, dockPan, setPageUnit, setDockUnit } = pager;
  useEffect(() => setPageUnit(size.w), [size.w]);
  useEffect(() => setDockUnit(ARC_PITCH), []);
  useEffect(() => {
    if (pinned != null) pager._setPos(pinned);
  }, [pinned]);
  useEffect(() => {
    onIndexChange && onIndexChange(index);
  }, [index]);
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.__schemes = { setPos: pager._setPos, pos: pager._pos, goTo, count: n, index };
    }
  }, [n, goTo, index]);
  const offsets = useMemo(() => schemes.map((_, i) => Animated.subtract(pos, i)), [schemes, pos]);

  const [demoOpen, setDemoOpen] = useState(demo);
  const [listOpen, setListOpen] = useState(false);

  const grounds = schemes.map((x) => mix(INK, themeOf(x.theme).stage.ground2, TINT));
  const ground = n > 1
    ? pos.interpolate({ inputRange: schemes.map((_, i) => i), outputRange: grounds, extrapolate: 'clamp' })
    : grounds[0] || INK;

  const zoneH = ZONE_H + insets.bottom;
  const sheetTop = insets.top + SHEET_TOP;
  const firstRunning = Math.max(0, schemes.findIndex((x) => x.group === 'running'));
  const t = T.en;
  const back = () => (onBack ? onBack(index) : backToEntry(router));
  // Home: back to the list of cards. Embedded, that is the move in reverse.
  const home = () => (onHome ? onHome(index) : toList(router, 'a'));

  return (
    <Animated.View style={[styles.screen, { backgroundColor: ground }]} onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      {n === 0 ? (
        <View style={[styles.empty, { paddingBottom: zoneH }]}>
          <View style={styles.emptyBadge}>
            <GiftGlyph kind="gift" size={30} color="#fff" strokeWidth={1.5} />
          </View>
          <Text style={styles.emptyTitle} allowFontScaling={false}>{t.emptyTitle}</Text>
          <Text style={styles.emptyLine} allowFontScaling={false}>{t.emptyLine}</Text>
        </View>
      ) : size.w > 0 ? (
        <Animated.View
          {...pagePan}
          dataSet={{ noselect: 'true', touch: 'pan-y' }}
          style={[styles.strip, { top: sheetTop, bottom: zoneH, width: size.w * n, transform: [{ translateX: Animated.multiply(pos, -size.w) }] }]}
        >
          {schemes.map((sc, i) => (
            <View key={sc.id} style={{ width: size.w, height: '100%', paddingHorizontal: SHEET_MARGIN }}>
              <View style={styles.sheet}>
                <SchemePage
                  scheme={sc}
                  active={index === i}
                  near={Math.abs(index - i) <= 1}
                  first={i === firstIndex}
                  still={still && i === firstIndex}
                  offset={offsets[i]}
                  bottomPad={24}
                  compact
                  edge
                  onTitlePress={() => setDemoOpen((v) => !v)}
                  onSeeRunning={sc.group === 'completed' ? () => goTo(firstRunning) : null}
                />
              </View>
            </View>
          ))}
        </Animated.View>
      ) : null}

      {/* Fixed chrome over the card: back, and the list of every scheme. */}
      <View style={[styles.chrome, { top: sheetTop + 4, left: SHEET_MARGIN + 6, right: SHEET_MARGIN + 6 }]} pointerEvents="box-none">
        <Pressable onPress={back} style={styles.backBtn} android_ripple={{ color: '#ffffff33', borderless: true }} accessibilityLabel="Back">
          <IconBack size={22} color="#fff" />
        </Pressable>
        {SHOW_PICKER && n > 1 ? (
          <Pressable onPress={() => setListOpen(true)} style={styles.listBtn} accessibilityLabel="All schemes" android_ripple={{ color: '#ffffff33', borderless: true }}>
            <Svg width={18} height={18} viewBox="0 0 24 24">
              <Path d="M4 7h16M4 12h16M4 17h10" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
            </Svg>
            <Text style={styles.listCount} numberOfLines={1} allowFontScaling={false}>{n} schemes</Text>
          </Pressable>
        ) : null}
      </View>

      {n > 0 && size.w > 0 ? (
        <ArcDock schemes={schemes} pos={pos} onSelect={goTo} onHome={home} panHandlers={dockPan} width={size.w} bottomInset={insets.bottom} />
      ) : null}

      <AllSchemesSheet open={SHOW_PICKER && listOpen} schemes={schemes} index={index} onSelect={goTo} onClose={() => setListOpen(false)} height={size.h} bottomInset={insets.bottom} />

      {demoOpen && !embedded ? (
        <View style={[styles.demo, { bottom: zoneH + 8 }]}>
          <View style={styles.demoRow}>
            <Text style={styles.demoLabel} allowFontScaling={false}>View as:</Text>
            {Object.entries(VIEWS).map(([key, v]) => (
              <Pressable key={key} onPress={() => router.replace(`/schemes/arc?view=${key}&demo=1`)} hitSlop={6}>
                <Text style={[styles.demoChip, viewKey === key && styles.demoChipActive]} allowFontScaling={false}>{v.label}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.demoRow}>
            <Pressable onPress={() => router.replace(`/schemes?view=${viewKey}`)} hitSlop={6}>
              <Text style={styles.demoLink} allowFontScaling={false}>Option B: dock bar</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/solv-schemes')} hitSlop={6}>
              <Text style={styles.demoLink} allowFontScaling={false}>Old list page</Text>
            </Pressable>
            <Pressable onPress={() => setDemoOpen(false)} hitSlop={6}>
              <Text style={[styles.demoLink, { marginLeft: 'auto' }]} allowFontScaling={false}>Hide</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </Animated.View>
  );
}

export const sheetStyle = {
  flex: 1,
  borderRadius: SHEET_RADIUS,
  overflow: 'hidden',
  backgroundColor: '#F7F7F7',
  shadowColor: '#000',
  shadowOpacity: 0.35,
  shadowRadius: 24,
  shadowOffset: { width: 0, height: 10 },
  elevation: 12,
};

const styles = StyleSheet.create({
  screen: { flex: 1, overflow: 'hidden' },
  strip: { position: 'absolute', left: 0, flexDirection: 'row' },
  sheet: sheetStyle,
  chrome: { position: 'absolute', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backBtn: { width: 36, height: 36, marginVertical: 4, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.22)', alignItems: 'center', justifyContent: 'center' },
  listBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 10, paddingRight: 12, height: 36, marginVertical: 4, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.22)' },
  listCount: { color: '#fff', fontFamily: F.medium, fontSize: 13, lineHeight: 16, flexShrink: 0, fontVariant: ['tabular-nums'] },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyBadge: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { marginTop: 14, fontFamily: F.bold, fontSize: 15, lineHeight: 19, color: '#fff' },
  emptyLine: { marginTop: 4, textAlign: 'center', fontFamily: F.regular, fontSize: 13, lineHeight: 18, color: 'rgba(255,255,255,0.72)' },

  demo: { position: 'absolute', left: 12, right: 12, backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 14, paddingTop: 8, paddingBottom: 10, gap: 6, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 8 },
  demoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  demoLabel: { fontFamily: F.medium, fontSize: 11, lineHeight: 14, color: '#6B6B6B' },
  demoChip: { fontFamily: F.medium, fontSize: 12, lineHeight: 15, color: '#6B6B6B' },
  demoChipActive: { color: '#0A66E8', fontFamily: F.bold },
  demoLink: { fontFamily: F.medium, fontSize: 11, lineHeight: 14, color: '#6B6B6B', textDecorationLine: 'underline' },
});
