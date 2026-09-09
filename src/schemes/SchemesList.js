// The scheme list, and the move from a card to its detail.
//
// The list is a screen of the Solv app, pushed from Home, so it has the app's
// chrome: the blue toolbar with a back arrow and the title, the RUNNING and
// COMPLETED tabs with the orange indicator (the app's
// indicator_background_color), and the app's ground. No bottom navigation
// (removed 9 Sep 2026; the tab-of-the-nav framing went with it).
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
import GiftGlyph from '../gifts/icons';
import { SOLV, usePressScale } from '../gifts/solv';

// The card form of every stage in the list (see Stage's cardAnim).
const ZERO = new Animated.Value(0);
import { C, F } from '../theme';
import { schemesFor } from './registry';
import { usePager } from './usePager';
import Stage, { N } from './Stage';
import SchemePage from './SchemePage';
import DockScreen from './DockScreen';
import { useRouter } from 'expo-router';
import { IconBack } from '../icons';
import { backToEntry } from './nav';
import { T } from './copy';
import { SETTLED } from './motion';

// Depth, web only. A card on the app's near-white ground (#F5F8FF) cannot lean
// on a flat 1px outline: one hairline reads as a drawn border, two layered
// shadows read as a surface lifted off the ground. A tight ambient layer holds
// the edge (where a soft shadow is weakest), a mid layer gives the card body,
// and a wide key layer carries the lift. Deepened 9 Sep 2026 so the cards read
// as clickable at a glance. Native keeps elevation, which Android draws itself.
if (Platform.OS === 'web' && typeof document !== 'undefined' && !document.getElementById('scheme-card-depth')) {
  const st = document.createElement('style');
  st.id = 'scheme-card-depth';
  st.textContent =
    '[data-card="scheme"]{box-shadow:0 1px 2px rgba(16,24,40,0.10),0 6px 14px -4px rgba(16,24,40,0.16),0 22px 44px -12px rgba(16,24,40,0.32)!important;}';
  document.head.appendChild(st);
}

// The card's anatomy is the App Store Today card's: the art runs to the card's
// own edges and top corners, and a white footer strip sits under it. The white
// frame around the art (4 Sep 2026) is gone at the founder's ask: it made the
// card a card, but it also made it a framed picture, smaller and cooler than
// the scheme deserves. The footer strip, the shadow and the corner radius do
// the card's work now.
const CARD_RADIUS = 22;
const ART_RADIUS = CARD_RADIUS;
const FRAME = 0;
const CARD_MARGIN = 16;
const GAP = 14;
const TOOLBAR_H = 48;
const TAB_H = 44;

// The affordance. A stage on its own reads as a graphic; the same stage inside a
// white card with a border, a shadow and a paper footer row reads as a card to
// tap. The footer shows the scheme's gifts as small thumbnails with a count
// ("8 gifts to win", "2 of 8 gifts won") and a round chevron on the right: the
// card has more inside, without a text link saying so. The footer is the first
// strip of the detail's paper body, so the card grows into the page without a
// seam: the footer fades as the body arrives.
export const FOOTER_H = 56;

// The footer carries the window. The offer ("Targets ₹2L to ₹1.2Cr · 8 gifts")
// sits under the title on the stage (see Stage's offerLine), where the eye lands
// first; the dates belong with the small print.
function footerDate(scheme, t) {
  const s = scheme.s;
  if (s.state === STATE.SCHEDULED) return [t.startsLine(s.startLabel), null];
  if (s.ended) return [t.endedLine(s.endLabel), null];
  return [t.endsLine(s.endLabel), t.daysLeft(s.daysLeft)];
}

// One row under the art: the window on the left, the chevron on the right. No
// gift thumbnails (founder review, 4 Sep 2026). The card already has one gift
// photo, the hero tile; a row of 22 px discs was a second, weaker one, showing
// the same product again on a single-gift scheme, and the subtitle already
// counts the gifts in words. The full list with photos lives in the detail.
export function CardFooter({ scheme, t, style, accent = SOLV.blue, accentBg = SOLV.blueBg }) {
  return (
    <View style={[styles.footer, style]} pointerEvents="none">
      <Text style={styles.footerLine} numberOfLines={1} allowFontScaling={false}>
        {footerDate(scheme, t)[0]}
        {footerDate(scheme, t)[1] ? <Text style={styles.footerDays} allowFontScaling={false}>{footerDate(scheme, t)[1]}</Text> : null}
      </Text>
      <View style={[styles.chev, { backgroundColor: accentBg }]}>
        <Svg width={18} height={18} viewBox="0 0 24 24">
          <Path d="M9.29 6.71a1 1 0 0 0 0 1.41L13.17 12l-3.88 3.88a1 1 0 1 0 1.42 1.41l4.59-4.59a1 1 0 0 0 0-1.41L10.71 6.7a1 1 0 0 0-1.42.01z" fill={accent} />
        </Svg>
      </View>
    </View>
  );
}

function Card({ scheme, compact, onPress, onLayout, cardRef, dim, t, chrome }) {
  const press = usePressScale(0.96);
  return (
    <Animated.View ref={cardRef} onLayout={onLayout} dataSet={{ card: 'scheme' }} style={[styles.card, { transform: [{ scale: press.scale }] }, dim && { opacity: 0 }]}>
      <Pressable onPress={onPress} onPressIn={press.pressIn} onPressOut={press.pressOut} accessibilityRole="button" accessibilityLabel={scheme.title}>
        {/* The art sits inside the card, not across it: the white frame is what
            makes the card a card and the stage its picture. */}
        <View style={styles.art}>
          <Stage scheme={scheme} compact={compact} card cardAnim={ZERO} />
        </View>
        <CardFooter scheme={scheme} t={t} accent={chrome.navAccent} accentBg={chrome.accentBg} />
      </Pressable>
      <View pointerEvents="none" style={styles.cardEdge} />
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

// The chrome, per app flavour. Solv is the default (src/gifts/solv.js). The
// Jumbotail flavour takes the tokens of mainandroidapp's jumbotail values:
// brand_green toolbar and tabs, target_scheme_native for the tab indicator and
// the active nav item, default_bg_color for the ground.
const CHROME = {
  solv: { bar: SOLV.blue, indicator: SOLV.orange, ground: SOLV.listBg, navAccent: SOLV.blue, accentBg: SOLV.blueBg },
  jt: { bar: C.brandGreen, indicator: C.targetSchemeNative, ground: '#EEEEEE', navAccent: C.targetSchemeNative, accentBg: '#E8F4E8' },
};

export default function SchemesList({ viewKey = 'typical', brand = 'solv' }) {
  const chrome = CHROME[brand] || CHROME.solv;
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const schemes = useMemo(() => schemesFor(viewKey), [viewKey]);
  const compact = false;   // one detail now, full screen; the arc's sheet is gone
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

  const target = () => ({ x: 0, y: 0, w: size.w, h: size.h, radius: 0 });

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

  // The close, in three steps, so a finger can drive it as well as a tap.
  // prepareClose brings the card into view and mounts the layer at 1 (the
  // detail still showing through it); finishClose springs it down into the
  // card; cancelClose springs it back up. The tap runs prepare then finish. The
  // drag runs prepare, then sets progress from the finger, then finish or
  // cancel on release. Interruptible either way: a new touch stops the spring.
  const prepareClose = async (atIndex) => {
    if (phase !== 'open' && phase !== 'opening') return false;
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
      const viewH = size.h - insets.top - TOOLBAR_H - TAB_H - insets.bottom;
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
    return true;
  };
  const finishClose = () => {
    spring(0, () => {
      setPhase('list');
      setOpen(null);
    });
  };
  const cancelClose = () => spring(1, () => setPhase('open'));

  const closeDetail = async (atIndex) => {
    if (await prepareClose(atIndex)) finishClose();
  };

  // The drag: the page is pushed back into its card by the finger, the way an
  // App Store card is. While the finger is down the page FOLLOWS it (dragY, at
  // 0.6 of the finger's travel, the resistance of a thing with mass) and
  // shrinks a little (progress 1 -> 0.7 over DISMISS_TRAVEL px) with its corners
  // rounding, but it does not fly to its slot: that is the release's decision.
  // Past the point of no return (a third of the travel) or with a downward flick it lands, on
  // one spring that carries the finger's velocity; otherwise it springs back.
  const DISMISS_TRAVEL = 420;
  const dragY = useRef(new Animated.Value(0)).current;
  const dragging = useRef(false);
  // While a finger holds the page there is ONE page on screen: the layer. The
  // detail under it hides the instant the drag takes over (the two are pixel-
  // identical at that moment, the seam audit holds them to 0) and comes back
  // only when the layer is identical again, at the end of a cancelled drag.
  // Without this the static detail shows through beside the moving layer and
  // every element doubles.
  const dragMode = useRef(new Animated.Value(0)).current;
  const dragged = useRef(0);       // the finger's travel, as the moves reported it
  const dragAnim = useRef(null);
  const settleDrag = (toY, velocity) => {
    dragAnim.current?.stop();
    dragAnim.current = Animated.spring(dragY, { toValue: toY, stiffness: 190, damping: 26, mass: 1, velocity, restDisplacementThreshold: 0.2, restSpeedThreshold: 0.2, useNativeDriver: false });
    dragAnim.current.start();
  };
  const dismiss = {
    begin: async (i) => {
      if (dragging.current) return;
      dragAnim.current?.stop();
      dragging.current = await prepareClose(i);
      if (dragging.current) dragMode.setValue(1);
    },
    move: (dy) => {
      if (!dragging.current) return;
      const d = Math.max(0, dy);
      dragged.current = d;
      dragY.setValue(d * 0.6);
      progress.setValue(1 - Math.min(1, d / DISMISS_TRAVEL) * 0.3);
    },
    end: (dy, vy) => {
      if (!dragging.current) return;
      dragging.current = false;
      const d = Math.max(0, dy, dragged.current);
      dragged.current = 0;
      // The point of no return: a third of the travel, or a downward flick.
      settleDrag(0, vy * 1000 * 0.6);
      if (d > DISMISS_TRAVEL * 0.32 || vy > 0.9) {
        finishClose();
      } else {
        // Back to the page: the layer springs to 1 and, once identical to the
        // detail under it, hands over in a single frame.
        spring(1, () => {
          dragMode.setValue(0);
          setPhase('open');
        });
      }
    },
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
  // The detail's dock (or arc) holds only the group the card came from: a card
  // opened from RUNNING pages through the running schemes, one from COMPLETED
  // through the completed ones. `rows` maps the detail's own indexes back to
  // the list's, for the arrival and for the way back.
  const rows = open ? groups[groupOf(open.index)] : [];
  const detailSchemes = rows.map(([sc]) => sc);
  const detailIndex = Math.max(0, rows.findIndex(([, i]) => i === open?.index));
  const toListIndex = (i) => (rows[i] ? rows[i][1] : current.current);

  // The list recedes as soon as the card lifts: most of the dim and the scale
  // happen in the first half, so nothing behind competes with the growing page.
  const listDim = {
    opacity: progress.interpolate({ inputRange: [0, 0.3, 1], outputRange: [1, 0.55, 0.45], extrapolate: 'clamp' }),
    transform: [{ scale: progress.interpolate({ inputRange: [0, 0.6, 1], outputRange: [1, 0.955, 0.94], extrapolate: 'clamp' }) }],
  };
  const detailFade = progress.interpolate({ inputRange: [0.55, 1], outputRange: [0, 1], extrapolate: 'clamp' });
  // The white frame's inset, shared by the art panel and the footer over it.
  const frameInset = progress.interpolate({ inputRange: [0, 0.34], outputRange: [FRAME, 0], extrapolate: 'clamp' });
  const layerFadeTap = progress.interpolate({ inputRange: [0.92, 1], outputRange: [1, 0], extrapolate: 'clamp' });
  // In drag mode the layer stays fully opaque and the detail fully hidden.
  const layerFade = Animated.add(layerFadeTap, Animated.multiply(dragMode, Animated.subtract(1, layerFadeTap)));
  const detailShow = Animated.multiply(detailFade, Animated.subtract(1, dragMode));
  const Detail = DockScreen;

  const w = size.w;
  const half = w / 2;
  const emptyCopy = [[t.emptyTitle, t.emptyLine], [t.emptyDoneTitle, t.emptyDoneLine]];

  return (
    <View ref={rootRef} style={[styles.root, { backgroundColor: chrome.ground }]} onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      <Animated.View style={[styles.listWrap, listDim]}>
        {/* The app bar: toolbar and tabs, on the app's blue. */}
        <View style={[styles.appBar, { paddingTop: insets.top, backgroundColor: chrome.bar }]}>
          <View style={styles.toolbar}>
            <Pressable onPress={() => backToEntry(router)} style={styles.backHit} android_ripple={{ color: '#ffffff33', borderless: true }} accessibilityRole="button" accessibilityLabel="Back" hitSlop={4}>
              <IconBack size={24} color="#fff" />
            </Pressable>
            <Text style={styles.toolbarTitle} allowFontScaling={false}>Target schemes</Text>
          </View>
          <View style={styles.tabBar}>
            {[t.running, t.completed].map((label, i) => (
              <Pressable key={label} style={styles.tab} onPress={() => goTab(i)} android_ripple={{ color: '#ffffff26' }} accessibilityRole="tab" accessibilityState={{ selected: tab === i }}>
                <Animated.View style={[styles.tabInner, { opacity: tabPos.interpolate({ inputRange: [i - 1, i, i + 1], outputRange: [0.64, 1, 0.64], extrapolate: 'clamp' }) }]}>
                  <Text style={styles.tabLabel} numberOfLines={1} allowFontScaling={false}>{label}</Text>
                  {groups[i].length ? (
                    <View style={styles.tabCount}>
                      <Text style={styles.tabCountText} allowFontScaling={false}>{groups[i].length}</Text>
                    </View>
                  ) : null}
                </Animated.View>
              </Pressable>
            ))}
            {w > 0 ? <Animated.View style={[styles.indicator, { width: half, backgroundColor: chrome.indicator, transform: [{ translateX: Animated.multiply(tabPos, half) }] }]} /> : null}
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
                    contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 + insets.bottom }}
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
                        chrome={chrome}
                      />
                    ))}
                  </ScrollView>
                )}
              </View>
            ))}
          </Animated.View>
        ) : null}

      </Animated.View>

      {/* The detail, mounted under the layer from the first frame of the move. */}
      {open ? (
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: detailShow }]} pointerEvents={phase === 'open' ? 'auto' : 'none'}>
          <Detail schemes={detailSchemes} viewKey={viewKey} initialIndex={detailIndex} still embedded arrival={progress} onBack={(i) => closeDetail(toListIndex(i))} dismiss={{ begin: (i) => dismiss.begin(toListIndex(i)), move: dismiss.move, end: dismiss.end }} onIndexChange={(i) => (current.current = toListIndex(i))} />
        </Animated.View>
      ) : null}

      {/* The layer: the card, growing into the detail's frame. */}
      {open && phase !== 'open' ? (
        <Animated.View pointerEvents="none" style={[styles.layer, compact && styles.layerSheet, layer, { opacity: layerFade, transform: [{ translateY: dragY }] }]}>
          {/* The page lays out at the layer's live width, so its centred stage
              stays centred while the frame grows. */}
          {/* The frame opens as the card grows: the inset goes to 0 and the
              art's corners ease to the detail frame's own. */}
          <Animated.View
            style={{
              flex: 1,
              overflow: 'hidden',
              // The frame paints the page's own paper: while the stage is still
              // card-sized, the band under it belongs to the page, not to the
              // dimmed list showing through.
              backgroundColor: N.bg,
              margin: frameInset,
              borderRadius: progress.interpolate({ inputRange: [0, 0.34], outputRange: [ART_RADIUS, open.to.radius], extrapolate: 'clamp' }),
            }}
          >
            <SchemePage scheme={schemes[open.index]} active still compact={compact} edge={compact} bottomPad={24} bodyAnim={progress} cardAnim={progress} />
          </Animated.View>
          <Animated.View pointerEvents="none" style={[styles.layerEdge, { borderRadius: layer.borderRadius, opacity: progress.interpolate({ inputRange: [0, 0.34], outputRange: [1, 0], extrapolate: 'clamp' }) }]} />
          {/* The card's footer, on the layer's bottom edge, which is where the
              card's own footer sits; it fades as the body arrives. Anchoring it
              to a fixed offset from the top instead let the growing stage pass
              under it, and its half-faded white cut a grey strip across the art. */}
          <Animated.View style={[styles.layerFooter, { left: frameInset, right: frameInset, opacity: progress.interpolate({ inputRange: [0, 0.3], outputRange: [1, 0], extrapolate: 'clamp' }) }]} pointerEvents="none">
            <CardFooter scheme={schemes[open.index]} t={t} accent={chrome.navAccent} accentBg={chrome.accentBg} />
          </Animated.View>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: SOLV.listBg, overflow: 'hidden' },
  listWrap: { flex: 1 },
  appBar: { backgroundColor: SOLV.blue },
  // Material app bar: the arrow's edge at 16, the title at 72 (8 + 40 + 24).
  toolbar: { height: TOOLBAR_H, flexDirection: 'row', alignItems: 'center', paddingLeft: 8, paddingRight: 16 },
  backHit: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  toolbarTitle: { color: '#fff', fontFamily: F.medium, fontSize: 18, lineHeight: 22, marginLeft: 24 },
  tabBar: { height: TAB_H, flexDirection: 'row' },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  tabInner: { flexDirection: 'row', alignItems: 'center' },
  // TabLayout's label: 14sp Roboto Medium, 0.0892857em tracking, white.
  tabLabel: { color: '#fff', fontFamily: F.medium, fontSize: 14, lineHeight: 17, letterSpacing: 1.25, textAlign: 'center' },
  // The count rides the label: a hug-width pill, tuned so single and double
  // digits both sit centred (min width 18, 5 px of side padding).
  tabCount: { marginLeft: 7, minWidth: 18, height: 18, borderRadius: 9, paddingHorizontal: 5, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' },
  tabCountText: { color: '#fff', fontFamily: F.bold, fontSize: 11, lineHeight: 14, fontVariant: ['tabular-nums'] },
  indicator: { position: 'absolute', bottom: 0, left: 0, height: 3, backgroundColor: SOLV.orange },
  pages: { flex: 1, flexDirection: 'row' },
  card: {
    marginHorizontal: CARD_MARGIN,
    marginBottom: GAP,
    borderRadius: CARD_RADIUS,
    // The frame runs on three sides; the footer owns the whole band below the
    // art, so its content centres in that band instead of sitting a frame's
    // width high in it. overflow keeps the footer's square corners inside the
    // card's radius (a box-shadow is drawn outside and is not clipped by it).
    padding: FRAME,
    paddingBottom: 0,
    overflow: 'hidden',
    backgroundColor: SOLV.paper,
    shadowColor: '#101828',
    shadowOpacity: 0.2,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  art: { overflow: 'hidden' },
  // The card's hairline, as an overlay: a border on the box would inset the
  // content by 1 px and break the seam with the page it becomes.
  cardEdge: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, borderRadius: CARD_RADIUS, borderWidth: 1, borderColor: 'rgba(16,24,40,0.06)' },
  // The footer's own edges line up with the art above it, not with the card.
  // The art is full-bleed (FRAME = 0), so the footer sets its own inset: 18 px
  // before the text, 13 px after the chevron (the same 13 px it has above and
  // below, so the disc sits in an even corner). 56 - 18 px of text = 19 px
  // above and below the line.
  footer: { height: FOOTER_H, flexDirection: 'row', alignItems: 'center', backgroundColor: SOLV.paper, paddingLeft: 18, paddingRight: 13 },
  footerLine: { flex: 1, color: SOLV.sub, fontFamily: F.regular, fontSize: 14, lineHeight: 18, marginRight: 12, fontVariant: ['tabular-nums'] },
  footerDays: { color: SOLV.ink, fontFamily: F.medium },
  chev: { width: 30, height: 30, borderRadius: 15, backgroundColor: SOLV.blueBg, alignItems: 'center', justifyContent: 'center' },
  layerFooter: { position: 'absolute', bottom: 0, height: FOOTER_H },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyBadge: { width: 64, height: 64, borderRadius: 32, backgroundColor: SOLV.blueBg, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { marginTop: 14, fontFamily: F.bold, fontSize: 15, lineHeight: 19, color: SOLV.ink },
  emptyLine: { marginTop: 4, textAlign: 'center', fontFamily: F.regular, fontSize: 13, lineHeight: 18, color: SOLV.sub },
  layer: { position: 'absolute', overflow: 'hidden', backgroundColor: SOLV.paper, zIndex: 20, shadowColor: '#101828', shadowOpacity: 0.28, shadowRadius: 28, shadowOffset: { width: 0, height: 14 } },
  // The card's hairline, drawn over the layer so it never moves the content: a
  // border on the layer itself put every element 1 px down and right of the
  // page it becomes, and the title doubled at the end of the move.
  layerEdge: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)' },
  layerSheet: { shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 24, shadowOffset: { width: 0, height: 10 } },
});
