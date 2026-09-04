// My Schemes, the new landing. Opening "My Schemes" lands on the MAIN scheme's
// own page (Mega Diwali), not on a list. Every other scheme of the member sits
// in a dock near the thumb; a swipe on the page or on the dock moves to the
// next scheme, and a tap on a dock thumb jumps to it.
//
// Reference: the product pager of a B2C grocery app (Sep 2026 video), where the
// product sheet swipes horizontally and a strip of round thumbnails at the
// bottom tracks the swipe, the focused one enlarged and ringed.
//
// Architecture: one Animated position (src/schemes/usePager.js) drives the
// pages, the dock row, every thumb's scale and ring, the theme colour behind
// the pages and the pedestal parallax. Two gesture surfaces write it (page,
// dock); one spring settles it. Nothing here polls or syncs; it all reads the
// same value, so the page and the dock cannot disagree by a frame.
//
// Prototype controls: ?view=typical|start|over|empty picks the member's
// scenario; ?i= the opening page. Tapping the scheme title toggles a panel.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { F } from '../../src/theme';
import { IconBack } from '../../src/icons';
import GiftGlyph from '../../src/gifts/icons';
import { themeOf } from '../../src/gifts/themes';
import { schemesFor, VIEWS } from '../../src/schemes/registry';
import { usePager } from '../../src/schemes/usePager';
import { backToEntry } from '../../src/schemes/nav';
import SchemePage from '../../src/schemes/SchemePage';
import SchemeDock, { DOCK_H, DOCK_MARGIN, PITCH } from '../../src/schemes/SchemeDock';
import AllSchemesSheet from '../../src/schemes/AllSchemesSheet';
import Svg, { Path } from 'react-native-svg';
import { T } from '../../src/schemes/copy';

export default function MySchemes() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const viewKey = VIEWS[params.view] ? params.view : 'typical';
  const schemes = useMemo(() => schemesFor(viewKey), [viewKey]);
  const n = schemes.length;
  const initial = Math.min(Math.max(0, Number(params.i) || 0), Math.max(0, n - 1));
  // ?pos=1.5 pins a fractional position on load (frame capture); the page
  // that counts as open is the nearest one.
  const pinned = params.pos != null && params.pos !== '' && Number.isFinite(Number(params.pos)) ? Number(params.pos) : null;

  const [pageW, setPageW] = useState(0);
  const pager = usePager({ count: n, initial: pinned != null ? Math.round(pinned) : initial });
  const { pos, index, goTo, pagePan, dockPan, setPageUnit, setDockUnit } = pager;
  useEffect(() => setPageUnit(pageW), [pageW]);
  useEffect(() => setDockUnit(PITCH), []);
  useEffect(() => {
    if (pinned != null) pager._setPos(pinned);
  }, [pinned]);
  // One offset node per page, built once per list.
  const offsets = useMemo(() => schemes.map((_, i) => Animated.subtract(pos, i)), [schemes, pos]);

  // Frame audit hook: window.__schemes.setPos(1.5) places the pager exactly.
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.__schemes = { setPos: pager._setPos, pos: pager._pos, goTo, count: n, index };
    }
  }, [n, goTo, index]);

  const [demoOpen, setDemoOpen] = useState(params.demo === '1');
  const [listOpen, setListOpen] = useState(false);
  const [screenH, setScreenH] = useState(0);
  const firstIndex = useRef(pinned != null ? Math.round(pinned) : initial).current;

  // The backdrop behind the pages carries the theme under the pager, so the
  // rubber band at either end reveals the scheme's own night, never white.
  const grounds = schemes.map((x) => themeOf(x.theme).stage.ground2);
  const backdrop = n > 1
    ? pos.interpolate({ inputRange: schemes.map((_, i) => i), outputRange: grounds, extrapolate: 'clamp' })
    : grounds[0] || '#0847A6';

  const bottomPad = DOCK_H + DOCK_MARGIN * 2 + insets.bottom + 8;
  const firstRunning = Math.max(0, schemes.findIndex((x) => x.group === 'running'));
  const t = T.en;

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Animated.View style={[styles.screen, { backgroundColor: backdrop }]} onLayout={(e) => { setPageW(e.nativeEvent.layout.width); setScreenH(e.nativeEvent.layout.height); }}>
        {n === 0 ? (
          <SafeAreaView style={styles.empty} edges={['top']}>
            <View style={styles.emptyBadge}>
              <GiftGlyph kind="gift" size={30} color="#fff" strokeWidth={1.5} />
            </View>
            <Text style={styles.emptyTitle} allowFontScaling={false}>{t.emptyTitle}</Text>
            <Text style={styles.emptyLine} allowFontScaling={false}>{t.emptyLine}</Text>
          </SafeAreaView>
        ) : pageW > 0 ? (
          <Animated.View
            {...pagePan}
            dataSet={{ noselect: 'true', touch: 'pan-y' }}
            style={[
              styles.strip,
              { width: pageW * n, transform: [{ translateX: Animated.multiply(pos, -pageW) }] },
            ]}
          >
            {schemes.map((sc, i) => (
              <View key={sc.id} style={{ width: pageW, height: '100%' }}>
                <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                  <SchemePage
                    scheme={sc}
                    active={index === i}
                    first={i === firstIndex}
                    offset={offsets[i]}
                    bottomPad={bottomPad}
                    onTitlePress={() => setDemoOpen((v) => !v)}
                    onSeeRunning={sc.group === 'completed' ? () => goTo(firstRunning) : null}
                  />
                </SafeAreaView>
              </View>
            ))}
          </Animated.View>
        ) : null}

        {/* The fixed chrome: one back button, and the list of every scheme. */}
        <SafeAreaView style={styles.topBar} edges={['top']} pointerEvents="box-none">
          <View style={styles.chromeRow} pointerEvents="box-none">
            <Pressable onPress={() => backToEntry(router)} style={styles.backHit} android_ripple={{ color: '#ffffff33', borderless: true }} accessibilityLabel="Back">
              <View style={styles.backChip}>
                <IconBack size={22} color="#fff" />
              </View>
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
        </SafeAreaView>

        {n > 0 && pageW > 0 ? (
          <SchemeDock schemes={schemes} pos={pos} index={index} onSelect={goTo} panHandlers={dockPan} width={pageW} bottomInset={insets.bottom} />
        ) : null}

        <AllSchemesSheet open={listOpen} schemes={schemes} index={index} onSelect={goTo} onClose={() => setListOpen(false)} height={screenH} bottomInset={insets.bottom} />

        {/* Prototype panel: scenarios and the older surfaces. Not app UI. */}
        {demoOpen ? (
          <View style={[styles.demo, { bottom: DOCK_H + DOCK_MARGIN * 2 + insets.bottom }]}>
            <View style={styles.demoRow}>
              <Text style={styles.demoLabel} allowFontScaling={false}>View as:</Text>
              {Object.entries(VIEWS).map(([key, v]) => (
                <Pressable key={key} onPress={() => router.replace(`/schemes?view=${key}&demo=1`)} hitSlop={6}>
                  <Text style={[styles.demoChip, viewKey === key && styles.demoChipActive]} allowFontScaling={false}>{v.label}</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.demoRow}>
              <Pressable onPress={() => router.push('/solv-schemes')} hitSlop={6}>
                <Text style={styles.demoLink} allowFontScaling={false}>Old list page</Text>
              </Pressable>
              <Pressable onPress={() => router.push('/mega-diwali?state=earned&theme=diwali&demo=1')} hitSlop={6}>
                <Text style={styles.demoLink} allowFontScaling={false}>Detail states and themes</Text>
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
  strip: { position: 'absolute', left: 0, top: 0, bottom: 0, flexDirection: 'row' },
  topBar: { position: 'absolute', left: 0, right: 0, top: 0 },
  chromeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 16 },
  listBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 10, paddingRight: 12, height: 36, marginTop: 6, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.22)' },
  listCount: { color: '#fff', fontFamily: F.medium, fontSize: 13, lineHeight: 16, flexShrink: 0, fontVariant: ['tabular-nums'] },
  // A 44px target, the icon 16px from the edge and 14px from the top.
  backHit: { marginLeft: 10, marginTop: 6, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  // Dark glass under the arrow, so it reads on the light list that scrolls under it.
  backChip: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.22)', alignItems: 'center', justifyContent: 'center' },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, paddingBottom: 48 },
  emptyBadge: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { marginTop: 14, fontFamily: F.bold, fontSize: 15, lineHeight: 19, color: '#fff' },
  emptyLine: { marginTop: 4, textAlign: 'center', fontFamily: F.regular, fontSize: 13, lineHeight: 18, color: 'rgba(255,255,255,0.72)' },

  demo: {
    position: 'absolute',
    left: 12,
    right: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 10,
    gap: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  demoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  demoLabel: { fontFamily: F.medium, fontSize: 11, lineHeight: 14, color: '#6B6B6B' },
  demoChip: { fontFamily: F.medium, fontSize: 12, lineHeight: 15, color: '#6B6B6B' },
  demoChipActive: { color: '#0A66E8', fontFamily: F.bold },
  demoLink: { fontFamily: F.medium, fontSize: 11, lineHeight: 14, color: '#6B6B6B', textDecorationLine: 'underline' },
});
