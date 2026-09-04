// The scheme list, and the move from a card to its detail.
//
// The list is a tab of the Solv app's bottom navigation (it takes the place of
// All Brands), so it has the app's chrome and no back action: the blue toolbar,
// the RUNNING and COMPLETED tabs with the orange indicator (the app's
// indicator_background_color), the app's ground, and the bottom navigation
// itself (src/schemes/SolvBottomNav.js) with Target Schemes selected.
//
// The two tabs are pages of one pager (src/schemes/usePager.js), so a
// swipe moves them and the indicator together. Each page lists big cards, one
// and a half to two per fold, each the exact stage of the detail it opens
// (src/schemes/Stage.js draws both).
//
// The move, the App Store's card-to-detail: on tap the card's rectangle is
// measured; a transition layer showing the detail page appears in that exact
// rectangle and springs to the detail's frame (the arc option's sheet, or the
// full screen for the dock option) while its corner radius eases to the frame's.
// The detail body below the stage fades and lifts in as the card grows; the
// list behind scales to 0.96 and dims. Underneath, the real detail screen mounts
// on the opening scheme with its stage settled ("still") and fades in over the
// last stretch, so when the layer lifts, nothing moves: the same stage, same
// pixels. Back reverses it into the card of the scheme on screen, switching to
// that scheme's tab and scrolling its card into view first.
//
// One spring (stiffness 190, damping 26, ratio 0.94) drives every part of the
// move and can be reversed mid-flight.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Animated, Platform } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { STATE } from '../gifts/state';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TabLabel from '../components/TabLabel';
import GiftGlyph from '../gifts/icons';
import { SOLV, usePressScale } from '../gifts/solv';
import { F } from '../theme';
import { schemesFor } from './registry';
import { usePager } from './usePager';
import Stage from './Stage';
import SchemePage from './SchemePage';
import ArcScreen, { arcSheetRect } from './ArcScreen';
import DockScreen from './DockScreen';
import SolvBottomNav, { NAV_H } from './SolvBottomNav';
import { T } from './copy';
import { SETTLED } from './motion';

const CARD_RADIUS = 20;
const CARD_MARGIN = 16;
const GAP = 14;
const TOOLBAR_H = 48;
const TAB_H = 44;

// The affordance. A stage on its own reads as a graphic; the same stage inside a
// white card with a border and a paper footer row (a summary, and "View details"
// with a chevron in the brand colour) reads as a card to tap. The footer is the
// first strip of the detail's paper body, so the card grows into the page
// without a seam: the footer's words fade as the body's arrive.
export const FOOTER_H = 52;

function footerLine(scheme, t) {
  const s = scheme.s;
  if (s.state === STATE.SCHEDULED) return t.cardStarts(s.startLabel);
  const n = s.ladder.length;
  if (s.state === STATE.ENDED_MISSED) return t.cardMissed(n);
  if (s.ended && s.earned) return t.cardWon(s.ladder.filter((g) => s.currentValue >= g.at).length, n);
  return t.cardGifts(n);
}

export function CardFooter({ scheme, t, style }) {
  return (
    <View style={[styles.footer, style]} pointerEvents="none">
      <Text style={styles.footerLine} numberOfLines={1} allowFontScaling={false}>{footerLine(scheme, t)}</Text>
      <View style={styles.footerCta}>
        <Text style={styles.footerCtaText} allowFontScaling={false}>{t.viewDetails}</Text>
        <Svg width={16} height={16} viewBox="0 0 24 24">
          <Path d="M9.29 6.71a1 1 0 0 0 0 1.41L13.17 12l-3.88 3.88a1 1 0 1 0 1.42 1.41l4.59-4.59a1 1 0 0 0 0-1.41L10.71 6.7a1 1 0 0 0-1.42.01z" fill={SOLV.blue} />
        </Svg>
      </View>
    </View>
  );
}

function Card({ scheme, compact, onPress, onLayout, cardRef, dim, t }) {
  const press = usePressScale(0.97);
  return (
    <Animated.View ref={cardRef} onLayout={onLayout} style={[styles.card, { transform: [{ scale: press.scale }] }, dim && { opacity: 0 }]}>
      <Pressable onPress={onPress} onPressIn={press.pressIn} onPressOut={press.pressOut} accessibilityRole="button" accessibilityLabel={`${scheme.title}, ${t.viewDetails}`}>
        <Stage scheme={scheme} compact={compact} card />
        <CardFooter scheme={scheme} t={t} />
      </Pressable>
    </Animated.View>
  );
}

function Empty({ title, line, bottom }) {
  return (
    <View style={[styles.empty, { paddingBottom: bottom }]}>
      <View style={styles.emptyBadge}>
        <GiftGlyph kind="gift" size={30} color={SOLV.blue} strokeWidth={1.5} />
      </View>
      <Text style={styles.emptyTitle} allowFontScaling={false}>{title}</Text>
      <Text style={styles.emptyLine} allowFontScaling={false}>{line}</Text>
    </View>
  );
}

export default function SchemesList({ opt = 'a', viewKey = 'typical' }) {
  const insets = useSafeAreaInsets();
  const schemes = useMemo(() => schemesFor(viewKey), [viewKey]);
  const compact = opt === 'a';
  const t = T.en;

  const rootRef = useRef(null);
  const scrollRefs = useRef([null, null]);
  const cardRefs = useRef([]);
  const cardLayouts = useRef([]);      // y and height inside its page's scroll content
  const scrollY = useRef([0, 0]);
  const [size, setSize] = useState({ w: 0, h: 0 });

  // The two tabs, as pages of one pager. No arrow keys here: the detail's own
  // pager takes them.
  const tabs = usePager({ count: 2, initial: 0, keys: false });
  const { pos: tabPos, index: tab, goTo: goTab, pagePan: tabPan, setPageUnit } = tabs;
  useEffect(() => setPageUnit(size.w), [size.w]);

  const groups = useMemo(() => {
    const rows = schemes.map((s, i) => [s, i]);
    return [rows.filter(([s]) => s.group === 'running'), rows.filter(([s]) => s.group === 'completed')];
  }, [schemes]);
  const groupOf = (i) => (schemes[i].group === 'completed' ? 1 : 0);

  // The move.
  const progress = useRef(new Animated.Value(0)).current;
  const [open, setOpen] = useState(null);           // { index, from: rect, to: rect } while moving or open
  const [phase, setPhase] = useState('list');       // list | opening | open | closing
  const current = useRef(0);                        // the scheme on screen in the detail
  const anim = useRef(null);

  const target = () => (compact ? arcSheetRect(size.w, size.h, insets) : { x: 0, y: 0, w: size.w, h: size.h, radius: 0 });

  const measureCard = (i) =>
    new Promise((resolve) => {
      const card = cardRefs.current[i];
      const root = rootRef.current;
      if (!card || !root) return resolve(null);
      root.measureInWindow((rx, ry) => {
        card.measureInWindow((x, y, w, h) => resolve({ x: x - rx, y: y - ry, w, h, radius: CARD_RADIUS }));
      });
    });

  const spring = (to, done) => {
    anim.current?.stop();
    anim.current = Animated.spring(progress, { toValue: to, stiffness: 190, damping: 26, mass: 1, restDisplacementThreshold: 0.001, restSpeedThreshold: 0.001, useNativeDriver: false });
    anim.current.start(({ finished }) => finished && done && done());
  };

  const openCard = async (i) => {
    if (phase !== 'list') return;
    const from = await measureCard(i);
    if (!from) return;
    current.current = i;
    setOpen({ index: i, from, to: target() });
    setPhase('opening');
    progress.setValue(0);
    if (SETTLED) {
      progress.setValue(1);
      setPhase('open');
      return;
    }
    spring(1, () => setPhase('open'));
  };

  const closeDetail = async (atIndex) => {
    if (phase !== 'open' && phase !== 'opening') return;
    const i = atIndex ?? current.current;
    current.current = i;
    // The card's tab, then the card into view, then its rectangle.
    const g = groupOf(i);
    if (g !== tab) {
      goTab(g);
      tabs._setPos(g);
    }
    const lay = cardLayouts.current[i];
    const sv = scrollRefs.current[g];
    if (lay && sv) {
      const viewH = size.h - insets.top - TOOLBAR_H - TAB_H - NAV_H - insets.bottom;
      const want = Math.max(0, lay.y - Math.max(GAP, (viewH - lay.h) / 2));
      if (Math.abs(want - scrollY.current[g]) > 2) {
        sv.scrollTo({ y: want, animated: false });
        scrollY.current[g] = want;
      }
    }
    await new Promise((r) => setTimeout(r, 40));
    const from = await measureCard(i);
    setOpen((o) => ({ index: i, from: from || o.from, to: target() }));
    setPhase('closing');
    spring(0, () => {
      setPhase('list');
      setOpen(null);
    });
  };

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.__list = {
        open: openCard,
        close: closeDetail,
        tab: goTab,
        phase,
        // frame audit: stop the spring and hold the move at a fraction
        freeze: (v) => {
          anim.current?.stop();
          progress.setValue(v);
        },
      };
    }
  });

  // The layer's frame, from the card's rectangle to the detail's.
  const layer = open
    ? {
        left: progress.interpolate({ inputRange: [0, 1], outputRange: [open.from.x, open.to.x] }),
        top: progress.interpolate({ inputRange: [0, 1], outputRange: [open.from.y, open.to.y] }),
        width: progress.interpolate({ inputRange: [0, 1], outputRange: [open.from.w, open.to.w] }),
        height: progress.interpolate({ inputRange: [0, 1], outputRange: [open.from.h, open.to.h] }),
        borderRadius: progress.interpolate({ inputRange: [0, 1], outputRange: [open.from.radius, open.to.radius] }),
      }
    : null;
  const listDim = { opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0.5] }), transform: [{ scale: progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0.96] }) }] };
  const detailFade = progress.interpolate({ inputRange: [0.55, 1], outputRange: [0, 1], extrapolate: 'clamp' });
  const layerFade = progress.interpolate({ inputRange: [0.92, 1], outputRange: [1, 0], extrapolate: 'clamp' });
  const Detail = compact ? ArcScreen : DockScreen;

  const w = size.w;
  const half = w / 2;
  const emptyCopy = [[t.emptyTitle, t.emptyLine], [t.emptyDoneTitle, t.emptyDoneLine]];

  return (
    <View ref={rootRef} style={styles.root} onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      <Animated.View style={[styles.listWrap, listDim]}>
        {/* The app bar: toolbar and tabs, on the app's blue. */}
        <View style={[styles.appBar, { paddingTop: insets.top }]}>
          <View style={styles.toolbar}>
            <Text style={styles.toolbarTitle} allowFontScaling={false}>Target schemes</Text>
          </View>
          <View style={styles.tabBar}>
            {[t.running, t.completed].map((label, i) => (
              <Pressable key={label} style={styles.tab} onPress={() => goTab(i)} android_ripple={{ color: '#ffffff26' }} accessibilityRole="tab" accessibilityState={{ selected: tab === i }}>
                <Animated.View style={{ opacity: tabPos.interpolate({ inputRange: [i - 1, i, i + 1], outputRange: [0.64, 1, 0.64], extrapolate: 'clamp' }) }}>
                  <TabLabel label={label} />
                </Animated.View>
              </Pressable>
            ))}
            {w > 0 ? <Animated.View style={[styles.indicator, { width: half, transform: [{ translateX: Animated.multiply(tabPos, half) }] }]} /> : null}
          </View>
        </View>

        {/* The two pages. A horizontal drag moves them; a vertical one scrolls. */}
        {w > 0 ? (
          <Animated.View
            {...tabPan}
            dataSet={{ noselect: 'true', touch: 'pan-y' }}
            style={[styles.pages, { width: w * 2, transform: [{ translateX: Animated.multiply(tabPos, -w) }] }]}
          >
            {groups.map((rows, g) => (
              <View key={g} style={{ width: w, flex: 1 }}>
                {rows.length === 0 ? (
                  <Empty title={emptyCopy[g][0]} line={emptyCopy[g][1]} bottom={48} />
                ) : (
                  <ScrollView
                    ref={(r) => (scrollRefs.current[g] = r)}
                    contentContainerStyle={{ paddingTop: GAP, paddingBottom: 24 }}
                    scrollEventThrottle={16}
                    onScroll={(e) => {
                      scrollY.current[g] = e.nativeEvent.contentOffset.y;
                    }}
                    showsVerticalScrollIndicator={false}
                  >
                    {rows.map(([sc, i]) => (
                      <Card
                        key={sc.id}
                        scheme={sc}
                        compact={compact}
                        cardRef={(r) => (cardRefs.current[i] = r)}
                        onLayout={(e) => (cardLayouts.current[i] = { y: e.nativeEvent.layout.y, h: e.nativeEvent.layout.height })}
                        onPress={() => openCard(i)}
                        dim={open && open.index === i && phase !== 'list'}
                        t={t}
                      />
                    ))}
                  </ScrollView>
                )}
              </View>
            ))}
          </Animated.View>
        ) : null}

        <SolvBottomNav selected="schemes" bottomInset={insets.bottom} />
      </Animated.View>

      {/* The detail, mounted under the layer from the first frame of the move. */}
      {open ? (
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: detailFade }]} pointerEvents={phase === 'open' ? 'auto' : 'none'}>
          <Detail schemes={schemes} viewKey={viewKey} initialIndex={open.index} still embedded onBack={(i) => closeDetail(i)} onIndexChange={(i) => (current.current = i)} />
        </Animated.View>
      ) : null}

      {/* The layer: the card, growing into the detail's frame. */}
      {open && phase !== 'open' ? (
        <Animated.View pointerEvents="none" style={[styles.layer, compact && styles.layerSheet, layer, { opacity: layerFade }]}>
          {/* The page lays out at the layer's live width, so its centred stage
              stays centred while the frame grows. */}
          <View style={{ width: '100%', flex: 1 }}>
            <SchemePage scheme={schemes[open.index]} active still compact={compact} edge={compact} bottomPad={24} bodyAnim={progress} eyebrowAnim={progress} />
          </View>
          {/* The card's footer, where it was, fading as the body arrives. */}
          <Animated.View style={[styles.layerFooter, { top: open.from.h - FOOTER_H, opacity: progress.interpolate({ inputRange: [0, 0.3], outputRange: [1, 0], extrapolate: 'clamp' }) }]} pointerEvents="none">
            <CardFooter scheme={schemes[open.index]} t={t} />
          </Animated.View>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: SOLV.bg, overflow: 'hidden' },
  listWrap: { flex: 1 },
  appBar: { backgroundColor: SOLV.blue },
  toolbar: { height: TOOLBAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  toolbarTitle: { color: '#fff', fontFamily: F.medium, fontSize: 18, lineHeight: 22 },
  tabBar: { height: TAB_H, flexDirection: 'row' },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  indicator: { position: 'absolute', bottom: 0, left: 0, height: 3, backgroundColor: SOLV.orange },
  pages: { flex: 1, flexDirection: 'row' },
  card: {
    marginHorizontal: CARD_MARGIN,
    marginBottom: GAP,
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
    backgroundColor: SOLV.paper,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.10)',
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  footer: { height: FOOTER_H, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 18, paddingRight: 12, backgroundColor: SOLV.paper },
  footerLine: { flex: 1, color: SOLV.sub, fontFamily: F.regular, fontSize: 14, lineHeight: 18, marginRight: 12 },
  footerCta: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  footerCtaText: { color: SOLV.blue, fontFamily: F.medium, fontSize: 14, lineHeight: 18 },
  layerFooter: { position: 'absolute', left: 0, right: 0, height: FOOTER_H },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyBadge: { width: 64, height: 64, borderRadius: 32, backgroundColor: SOLV.blueBg, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { marginTop: 14, fontFamily: F.bold, fontSize: 15, lineHeight: 19, color: SOLV.ink },
  emptyLine: { marginTop: 4, textAlign: 'center', fontFamily: F.regular, fontSize: 13, lineHeight: 18, color: SOLV.sub },
  layer: { position: 'absolute', overflow: 'hidden', backgroundColor: '#F7F7F7', zIndex: 20, borderWidth: 1, borderColor: 'rgba(0,0,0,0.10)' },
  layerSheet: { shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 24, shadowOffset: { width: 0, height: 10 } },
});
