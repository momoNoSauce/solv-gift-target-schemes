// My Schemes, version B: the sheet and the arc. The scheme page is a floating
// card that ends above the dock zone; the schemes sit on an arc under it, the
// way the reference video arranges them, and the whole arc turns as the card
// swipes. The focused scheme's full name and status read under the apex.
// A list button in the fixed chrome opens every scheme as a sheet, for a member
// with more schemes than an arc shows at a glance.
//
// Same engine as version A (src/schemes/usePager.js): one position value,
// two gesture surfaces (the card strip, the arc zone), one spring.
//
// Prototype controls: ?view=typical|start|over|many|empty, ?i=, ?pos=,
// ?static=1. Tapping the scheme title toggles the demo panel.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path } from 'react-native-svg';
import { F } from '../../src/theme';
import { IconBack } from '../../src/icons';
import GiftGlyph from '../../src/gifts/icons';
import { themeOf } from '../../src/gifts/themes';
import { schemesFor, VIEWS } from '../../src/schemes/registry';
import { usePager } from '../../src/schemes/usePager';
import SchemePage from '../../src/schemes/SchemePage';
import ArcDock, { ARC_PITCH, ZONE_H } from '../../src/schemes/ArcDock';
import AllSchemesSheet from '../../src/schemes/AllSchemesSheet';
import { T } from '../../src/schemes/copy';

const SHEET_MARGIN = 14;
const SHEET_RADIUS = 24;
const SHEET_TOP = 10;   // below the safe area

// The ground: one cool near-black for every page, with a whisper (18 %) of the
// active theme's night mixed in. The card carries the colour; the floor
// recedes. A full theme flood behind a blue card lost the card's edge and
// recoloured the whole screen on every swipe.
const INK = '#0B0A14';
const TINT = 0.18;
const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mix = (a, b, t) => {
  const [r1, g1, b1] = hex(a);
  const [r2, g2, b2] = hex(b);
  const ch = (x, y) => Math.round(x + (y - x) * t).toString(16).padStart(2, '0');
  return `#${ch(r1, r2)}${ch(g1, g2)}${ch(b1, b2)}`;
};

export default function MySchemesArc() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const viewKey = VIEWS[params.view] ? params.view : 'typical';
  const schemes = useMemo(() => schemesFor(viewKey), [viewKey]);
  const n = schemes.length;
  const initial = Math.min(Math.max(0, Number(params.i) || 0), Math.max(0, n - 1));
  const pinned = params.pos != null && params.pos !== '' && Number.isFinite(Number(params.pos)) ? Number(params.pos) : null;
  const firstIndex = useRef(pinned != null ? Math.round(pinned) : initial).current;

  const [size, setSize] = useState({ w: 0, h: 0 });
  const pager = usePager({ count: n, initial: firstIndex });
  const { pos, index, goTo, pagePan, dockPan, setPageUnit, setDockUnit } = pager;
  useEffect(() => setPageUnit(size.w), [size.w]);
  useEffect(() => setDockUnit(ARC_PITCH), []);
  useEffect(() => {
    if (pinned != null) pager._setPos(pinned);
  }, [pinned]);
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.__schemes = { setPos: pager._setPos, pos: pager._pos, goTo, count: n, index };
    }
  }, [n, goTo, index]);
  const offsets = useMemo(() => schemes.map((_, i) => Animated.subtract(pos, i)), [schemes, pos]);

  const [demoOpen, setDemoOpen] = useState(params.demo === '1');
  const [listOpen, setListOpen] = useState(false);

  const grounds = schemes.map((x) => mix(INK, themeOf(x.theme).stage.ground2, TINT));
  const ground = n > 1
    ? pos.interpolate({ inputRange: schemes.map((_, i) => i), outputRange: grounds, extrapolate: 'clamp' })
    : grounds[0] || INK;

  const zoneH = ZONE_H + insets.bottom;
  const sheetTop = insets.top + SHEET_TOP;
  const sheetW = size.w - SHEET_MARGIN * 2;
  const firstRunning = Math.max(0, schemes.findIndex((x) => x.group === 'running'));
  const t = T.en;

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" />
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
            style={[
              styles.strip,
              { top: sheetTop, bottom: zoneH, width: size.w * n, transform: [{ translateX: Animated.multiply(pos, -size.w) }] },
            ]}
          >
            {schemes.map((sc, i) => (
              <View key={sc.id} style={{ width: size.w, height: '100%', paddingHorizontal: SHEET_MARGIN }}>
                <View style={styles.sheet}>
                  <SchemePage
                    scheme={sc}
                    active={index === i}
                    first={i === firstIndex}
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
          {/* The same dark glass as the schemes pill, so the arrow reads on the light
              list that scrolls under it as well as on the stage. */}
          <Pressable onPress={() => router.back()} style={styles.backBtn} android_ripple={{ color: '#ffffff33', borderless: true }} accessibilityLabel="Back">
            <IconBack size={22} color="#fff" />
          </Pressable>
          {n > 1 ? (
            <Pressable onPress={() => setListOpen(true)} style={styles.listBtn} accessibilityLabel="All schemes" android_ripple={{ color: '#ffffff33', borderless: true }}>
              <Svg width={18} height={18} viewBox="0 0 24 24">
                <Path d="M4 7h16M4 12h16M4 17h10" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
              </Svg>
              <Text style={styles.listCount} numberOfLines={1} allowFontScaling={false}>{n} schemes</Text>
            </Pressable>
          ) : null}
        </View>

        {n > 0 && size.w > 0 ? (
          <ArcDock schemes={schemes} pos={pos} onSelect={goTo} panHandlers={dockPan} width={size.w} bottomInset={insets.bottom} />
        ) : null}

        <AllSchemesSheet open={listOpen} schemes={schemes} index={index} onSelect={goTo} onClose={() => setListOpen(false)} height={size.h} bottomInset={insets.bottom} />

        {demoOpen ? (
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
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, overflow: 'hidden' },
  strip: { position: 'absolute', left: 0, flexDirection: 'row' },
  sheet: {
    flex: 1,
    borderRadius: SHEET_RADIUS,
    overflow: 'hidden',
    backgroundColor: '#F7F7F7',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  chrome: { position: 'absolute', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chromeBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backBtn: { width: 36, height: 36, marginVertical: 4, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.22)', alignItems: 'center', justifyContent: 'center' },
  // 36 px tall inside the 44 px chrome row: a glass pill that names what it opens.
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
