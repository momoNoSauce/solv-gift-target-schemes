// Option B, the detail: full-screen pages and the glass dock. A component, not
// a route, so the list can grow a card into it in place. The route
// (app/schemes/index.js) wraps it.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { F } from '../theme';
import { IconBack } from '../icons';
import GiftGlyph from '../gifts/icons';
import { themeOf } from '../gifts/themes';
import { VIEWS } from './registry';
import { usePager } from './usePager';
import SchemePage from './SchemePage';
import SchemeDock, { DOCK_H, DOCK_MARGIN, PITCH } from './SchemeDock';
import AllSchemesSheet from './AllSchemesSheet';
import { T } from './copy';
import { backToEntry } from './nav';

export default function DockScreen({ schemes, viewKey = 'typical', initialIndex = 0, pinned = null, demo = false, still = false, embedded = false, onBack, onIndexChange }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const n = schemes.length;
  const firstIndex = useRef(pinned != null ? Math.round(pinned) : initialIndex).current;

  const [pageW, setPageW] = useState(0);
  const [screenH, setScreenH] = useState(0);
  const pager = usePager({ count: n, initial: firstIndex });
  const { pos, index, goTo, pagePan, dockPan, setPageUnit, setDockUnit } = pager;
  useEffect(() => setPageUnit(pageW), [pageW]);
  useEffect(() => setDockUnit(PITCH), []);
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

  // The backdrop behind the pages carries the theme under the pager, so the
  // rubber band at either end reveals the scheme's own night, never white.
  const grounds = schemes.map((x) => themeOf(x.theme).stage.ground2);
  const backdrop = n > 1
    ? pos.interpolate({ inputRange: schemes.map((_, i) => i), outputRange: grounds, extrapolate: 'clamp' })
    : grounds[0] || '#0847A6';

  const bottomPad = DOCK_H + DOCK_MARGIN * 2 + insets.bottom + 8;
  const firstRunning = Math.max(0, schemes.findIndex((x) => x.group === 'running'));
  const t = T.en;
  const back = () => (onBack ? onBack(index) : backToEntry(router));

  return (
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
          style={[styles.strip, { width: pageW * n, transform: [{ translateX: Animated.multiply(pos, -pageW) }] }]}
        >
          {schemes.map((sc, i) => (
            <View key={sc.id} style={{ width: pageW, height: '100%' }}>
              <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                <SchemePage
                  scheme={sc}
                  active={index === i}
                  near={Math.abs(index - i) <= 1}
                  first={i === firstIndex}
                  still={still && i === firstIndex}
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
          <Pressable onPress={back} style={styles.backHit} android_ripple={{ color: '#ffffff33', borderless: true }} accessibilityLabel="Back">
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

      {demoOpen && !embedded ? (
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
            <Pressable onPress={() => router.replace(`/schemes/arc?view=${viewKey}`)} hitSlop={6}>
              <Text style={styles.demoLink} allowFontScaling={false}>Option A: arc</Text>
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

const styles = StyleSheet.create({
  screen: { flex: 1, overflow: 'hidden' },
  strip: { position: 'absolute', left: 0, top: 0, bottom: 0, flexDirection: 'row' },
  topBar: { position: 'absolute', left: 0, right: 0, top: 0 },
  chromeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 16 },
  backHit: { marginLeft: 10, marginTop: 6, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backChip: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.22)', alignItems: 'center', justifyContent: 'center' },
  listBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 10, paddingRight: 12, height: 36, marginTop: 6, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.22)' },
  listCount: { color: '#fff', fontFamily: F.medium, fontSize: 13, lineHeight: 16, flexShrink: 0, fontVariant: ['tabular-nums'] },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, paddingBottom: 48 },
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
