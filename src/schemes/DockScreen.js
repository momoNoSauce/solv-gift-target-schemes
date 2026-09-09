// The detail: full-screen pages, one per scheme of the group the card came
// from, paged by a horizontal swipe. The dock and the arc are gone (4 Sep 2026):
// the list of cards is the place to choose a scheme, and the detail keeps only
// the lateral swipe, told by two quiet things. Page dots sit at the foot of the
// stage (SchemePage draws them, so they scroll with the page they describe and
// never cover the list below), the focused one stretched to a bar. And the
// first time a detail opens in a session, the page peeks: it slides 14 px
// toward the next page and springs back, the way a carousel shows there is
// more to the side. A component, not a route, so the list can grow a card into
// it in place; the route (app/schemes/index.js) wraps it.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Platform, Easing } from 'react-native';
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
import AllSchemesSheet from './AllSchemesSheet';
import { T } from './copy';
import { backToEntry } from './nav';
import { SETTLED } from './motion';

// The scheme picker (the "N schemes" button and its sheet) stays hidden.
const SHOW_PICKER = false;

// Web styles RN-web does not compile, picked up by data attributes. Native
// ignores them. (These lived in the dock before it went.)
if (Platform.OS === 'web' && typeof document !== 'undefined' && !document.getElementById('dock-glass')) {
  const st = document.createElement('style');
  st.id = 'dock-glass';
  st.textContent =
    '[data-glass]{backdrop-filter:blur(22px) saturate(1.35);-webkit-backdrop-filter:blur(22px) saturate(1.35);}' +
    '[data-noselect]{user-select:none;-webkit-user-select:none;}' +
    '[data-noselect] img{-webkit-user-drag:none;pointer-events:none;}' +
    // Who owns a touch: the page strip keeps vertical scroll for the browser and
    // hands horizontal to the pager.
    '[data-touch="pan-y"]{touch-action:pan-y;overscroll-behavior:contain;}[data-touch="none"]{touch-action:none;}';
  document.head.appendChild(st);
}

// The peek plays once per session.
let peeked = false;

export default function DockScreen({ schemes, viewKey = 'typical', initialIndex = 0, pinned = null, demo = false, still = false, embedded = false, onBack, onIndexChange, dismiss = null, arrival = null }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const n = schemes.length;
  const firstIndex = useRef(pinned != null ? Math.round(pinned) : initialIndex).current;

  const [pageW, setPageW] = useState(0);
  const [screenH, setScreenH] = useState(0);
  const pager = usePager({ count: n, initial: firstIndex });
  const { pos, index, goTo, pagePan, setPageUnit } = pager;
  // The peek: once per session, after the card has finished becoming the page.
  const peek = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (SETTLED || peeked || n < 2 || firstIndex >= n - 1) return;
    peeked = true;
    const t = setTimeout(() => {
      Animated.sequence([
        Animated.timing(peek, { toValue: -14, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
        Animated.spring(peek, { toValue: 0, stiffness: 220, damping: 22, mass: 1, useNativeDriver: false }),
      ]).start();
    }, embedded ? 900 : 500);
    return () => clearTimeout(t);
  }, []);
  // Embedded in the list, the chrome arrives on the move's own clock: the back
  // chip and the page dots fade in over the last stretch, after the page has
  // settled under them. Standalone, both are simply there.
  const chromeIn = arrival ? { opacity: arrival.interpolate({ inputRange: [0.75, 1], outputRange: [0, 1], extrapolate: 'clamp' }) } : null;
  const barIn = arrival ? { opacity: arrival.interpolate({ inputRange: [0.8, 1], outputRange: [0, 1], extrapolate: 'clamp' }) } : null;
  useEffect(() => setPageUnit(pageW), [pageW]);
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

  const bottomPad = insets.bottom + 44;
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
          style={[styles.strip, { width: pageW * n, transform: [{ translateX: Animated.add(Animated.multiply(pos, -pageW), peek) }] }]}
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
                  dismiss={embedded && index === i ? dismiss : null}
                  pageIndex={i}
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
        <Animated.View style={[styles.chromeRow, chromeIn]} pointerEvents="box-none">
          <Pressable onPress={back} style={styles.backHit} android_ripple={{ color: '#ffffff33', borderless: true }} accessibilityLabel="Back">
            <View style={styles.backChip}>
              <IconBack size={22} color="#fff" />
            </View>
          </Pressable>
          {SHOW_PICKER && n > 1 ? (
            <Pressable onPress={() => setListOpen(true)} style={styles.listBtn} accessibilityLabel="All schemes" android_ripple={{ color: '#ffffff33', borderless: true }}>
              <Svg width={18} height={18} viewBox="0 0 24 24">
                <Path d="M4 7h16M4 12h16M4 17h10" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
              </Svg>
              <Text style={styles.listCount} numberOfLines={1} allowFontScaling={false}>{n} schemes</Text>
            </Pressable>
          ) : null}
        </Animated.View>
      </SafeAreaView>

      <AllSchemesSheet open={SHOW_PICKER && listOpen} schemes={schemes} index={index} onSelect={goTo} onClose={() => setListOpen(false)} height={screenH} bottomInset={insets.bottom} />

      {demoOpen && !embedded ? (
        <View style={[styles.demo, { bottom: insets.bottom + 48 }]}>
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
