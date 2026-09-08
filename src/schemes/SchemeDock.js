// The scheme dock. A floating glass pill near the thumb that holds every
// scheme as a circular gift photo with its short name. It reads the pager's
// `pos` directly, so it moves in the same frame as the page.
//
// Geometry, content-aware:
//   - The pill hugs its thumbs and centres itself (like a dock), up to the
//     screen width minus the margins.
//   - When every thumb fits, the row stands still and ONE RING glides along it
//     from thumb to thumb, one PITCH per page of swipe.
//   - When the thumbs overflow, the row scrolls to keep the focused thumb
//     centred, clamped at both ends so the pill never shows empty glass; the
//     ring then holds the centre while the row moves under it. This is the
//     reference behaviour (the B2C grocery pager) for long lists, and a tab bar
//     for short ones, with no mode switch the eye can see: both are the same
//     piecewise-linear map of pos.
//   - Each thumb scales from 42 to 52 as pos approaches its index; its label
//     fades from 55% to 100% white.
//   - The ring's colour is the ACTIVE THEME'S ACCENT, blending across pages.
//
// All. The leftmost circle is always "All": the way back to the list of cards,
// the way the Finder is the first icon in the Dock and "Your story" the first
// circle in the tray. It is of the thumbs' family (a circle, the resting size,
// a label on the same baseline) so the bar reads as one row, and it is told
// apart by what a thumb never has: a glyph instead of art, glass instead of a
// photo, a hairline after it, and no ring, ever. Tapping it does not glide the
// ring; the whole page folds back into its card.
//
// Groups: running schemes first, then completed ones behind a hairline. A
// completed thumb dims its art to 70% and carries the green check when a gift
// was won (the medallion system's one badge). The thumb is the SCHEME'S OWN
// ART (a festival illustration, a brand mark), never a gift photo, so "Diwali"
// is recognisable before the label is read.
import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { F } from '../theme';
import GiftGlyph from '../gifts/icons';
import { themeOf } from '../gifts/themes';
import SchemeArt from './SchemeArt';
import { usePressScale } from '../gifts/solv';
import { IconGrid } from '../icons';
import { SETTLED } from './motion';

export const PITCH = 64;
const LIST_W = 58;         // the pinned All cell, left of the scheme row
const PAD = 10;            // glass around the row, left and right
const THUMB = 52;          // focused photo circle
const THUMB_MIN = 42;      // resting photo circle
const RING = THUMB + 8;    // 2px gap + 2px ring, concentric with the thumb
const LABEL_H = 14;
const ROW_TOP = 8;
export const DOCK_H = ROW_TOP + RING + 3 + LABEL_H + 9;   // 94
export const DOCK_MARGIN = 12;

const GLASS = 'rgba(16,13,30,0.84)';
const GLASS_EDGE = 'rgba(16,13,30,0)';

// Backdrop blur is a web style RN-web does not compile; a data attribute picks
// up the rule injected below. Native ignores both.
if (Platform.OS === 'web' && typeof document !== 'undefined' && !document.getElementById('dock-glass')) {
  const s = document.createElement('style');
  s.id = 'dock-glass';
  s.textContent =
    '[data-glass]{backdrop-filter:blur(22px) saturate(1.35);-webkit-backdrop-filter:blur(22px) saturate(1.35);}' +
    '[data-noselect]{user-select:none;-webkit-user-select:none;}' +
    '[data-noselect] img{-webkit-user-drag:none;pointer-events:none;}' +
    // Who owns a touch: the page strip keeps vertical scroll for the browser and
    // hands horizontal to the pager; the dock and the arc hand over everything.
    '[data-touch="pan-y"]{touch-action:pan-y;overscroll-behavior:contain;}[data-touch="none"]{touch-action:none;}';
  document.head.appendChild(s);
}

function Thumb({ scheme, i, pos, onPress, first, selected }) {
  const done = scheme.group === 'completed';
  const won = done && Boolean(scheme.s.secured);
  const range = [i - 1, i, i + 1];
  const scale = pos.interpolate({ inputRange: range, outputRange: [THUMB_MIN / THUMB, 1, THUMB_MIN / THUMB], extrapolate: 'clamp' });
  // The focused thumb rises 2 px as it grows: the lift separates it from its neighbours.
  const lift = pos.interpolate({ inputRange: range, outputRange: [0, -2, 0], extrapolate: 'clamp' });
  const label = pos.interpolate({ inputRange: range, outputRange: [0.55, 1, 0.55], extrapolate: 'clamp' });
  const press = usePressScale(0.96);

  return (
    <View style={styles.col}>
      {first ? <View style={styles.groupLine} /> : null}
      <Pressable onPress={onPress} onPressIn={press.pressIn} onPressOut={press.pressOut} accessibilityRole="button" accessibilityLabel={scheme.title} accessibilityState={{ selected }} style={styles.hit}>
        <Animated.View style={[styles.ringBox, { transform: [{ translateY: lift }, { scale: Animated.multiply(scale, press.scale) }] }]}>
          <View style={styles.thumb}>
            <SchemeArt scheme={scheme} size={THUMB} dim={done} />
            <View pointerEvents="none" style={styles.photoEdge} />
          </View>
          {won ? (
            <View style={[styles.badge, { backgroundColor: '#177E36' }]}>
              <GiftGlyph kind="check" size={9} color="#fff" strokeWidth={2.4} />
            </View>
          ) : null}
        </Animated.View>
        <Animated.Text style={[styles.label, { opacity: label }]} numberOfLines={1} allowFontScaling={false}>
          {scheme.dockName}
        </Animated.Text>
      </Pressable>
    </View>
  );
}

function AllCell({ onPress, label, hint }) {
  const press = usePressScale(0.96);
  return (
    <View style={styles.allCell}>
      <Pressable onPress={onPress} onPressIn={press.pressIn} onPressOut={press.pressOut} accessibilityRole="button" accessibilityLabel={hint} style={styles.allHit}>
        <Animated.View style={[styles.allDisc, { transform: [{ scale: press.scale }] }]}>
          <IconGrid size={20} color="#fff" />
        </Animated.View>
        <Text style={styles.allLabel} numberOfLines={1} allowFontScaling={false}>{label}</Text>
      </Pressable>
      <View style={styles.allLine} pointerEvents="none" />
    </View>
  );
}

export default function SchemeDock({ schemes, pos, index = 0, onSelect, onAll, panHandlers, width, bottomInset = 0, allLabel = 'All', allHint = 'All schemes' }) {
  const n = schemes.length;
  const rowW = n * PITCH;
  const home = Boolean(onAll) ? LIST_W : 0;
  const pillW = Math.min(width - DOCK_MARGIN * 2, rowW + PAD * 2 + home);
  const inner = pillW - PAD * 2 - home;

  // rowX(pos) = clamp(centre - pos * PITCH, lo, hi), a piecewise-linear map.
  // When the row fits, lo >= hi and the row stands still, centred.
  const { rowX, ringX } = useMemo(() => {
    let rx;
    const left = PAD + home;
    if (rowW <= inner) {
      rx = new Animated.Value(left + (inner - rowW) / 2);
    } else {
      const centre = left + inner / 2 - PITCH / 2;
      const hi = left;
      const lo = pillW - PAD - rowW;
      const p1 = (centre - hi) / PITCH;
      const p2 = (centre - lo) / PITCH;
      rx = pos.interpolate({ inputRange: [p1, p2], outputRange: [hi, lo], extrapolate: 'clamp' });
    }
    // The ring sits over thumb `pos`: it glides when the row is still, and
    // holds the centre while the row scrolls under it. It belongs to the
    // schemes alone: past either end (the rubber band, the pull to the list) it
    // stays on the end thumb rather than sliding into the list cell.
    const ringPos = n > 1
      ? pos.interpolate({ inputRange: [0, n - 1], outputRange: [0, (n - 1) * PITCH], extrapolate: 'clamp' })
      : new Animated.Value(0);
    return { rowX: rx, ringX: Animated.add(Animated.add(rx, ringPos), (PITCH - RING) / 2) };
  }, [pos, rowW, inner, pillW, home, n]);

  const accents = schemes.map((x) => themeOf(x.theme).stage.accent);
  const accent = n > 1
    ? pos.interpolate({ inputRange: schemes.map((_, i) => i), outputRange: accents, extrapolate: 'clamp' })
    : accents[0] || '#fff';

  const firstDone = schemes.findIndex((x) => x.group === 'completed');

  // The pill lifts in once, with the page.
  const enter = useRef(new Animated.Value(SETTLED ? 1 : 0)).current;
  useEffect(() => {
    if (SETTLED) return;
    Animated.spring(enter, { toValue: 1, stiffness: 200, damping: 26, mass: 1, delay: 140, useNativeDriver: false }).start();
  }, [enter]);

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.host,
        { bottom: DOCK_MARGIN + bottomInset, opacity: enter, transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }] },
      ]}
    >
      <View style={[styles.pill, { width: pillW }]} dataSet={{ glass: 'true', noselect: 'true', touch: 'none' }} {...panHandlers}>
        <View style={styles.hairline} pointerEvents="none" />
        {onAll ? <AllCell onPress={onAll} label={allLabel} hint={allHint} /> : null}
        <Animated.View pointerEvents="none" style={[styles.ring, { borderColor: accent, transform: [{ translateX: ringX }] }]} />
        <Animated.View style={[styles.row, { width: rowW, transform: [{ translateX: rowX }] }]}>
          {schemes.map((sc, i) => (
            <Thumb key={sc.id} scheme={sc} i={i} pos={pos} first={i === firstDone && firstDone > 0} selected={i === index} onPress={() => onSelect(i)} />
          ))}
        </Animated.View>
        {rowW > inner ? (
          <>
            <LinearGradient colors={[GLASS, GLASS_EDGE]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={[styles.fade, { left: home }]} pointerEvents="none" />
            <LinearGradient colors={[GLASS_EDGE, GLASS]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={[styles.fade, { right: 0 }]} pointerEvents="none" />
          </>
        ) : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  host: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  pill: {
    height: DOCK_H,
    borderRadius: DOCK_H / 2,
    backgroundColor: GLASS,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  // A 1px light along the top edge: the refraction line a glass surface shows.
  hairline: { position: 'absolute', left: 0, right: 0, top: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.10)' },
  ring: { position: 'absolute', left: 0, top: ROW_TOP, width: RING, height: RING, borderRadius: RING / 2, borderWidth: 2 },
  row: { position: 'absolute', left: 0, top: ROW_TOP, flexDirection: 'row' },
  col: { width: PITCH, alignItems: 'center' },
  hit: { alignItems: 'center', width: PITCH },
  ringBox: { width: RING, height: RING, alignItems: 'center', justifyContent: 'center' },
  thumb: { width: THUMB, height: THUMB, borderRadius: THUMB / 2, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  // The image's own edge: pure black at low alpha, never a tinted grey.
  photoEdge: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, borderRadius: THUMB / 2, borderWidth: 1, borderColor: 'rgba(0,0,0,0.10)' },
  badge: {
    position: 'absolute',
    right: 1,
    top: 1,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: 'rgba(16,13,30,1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { marginTop: 3, color: '#fff', fontFamily: F.medium, fontSize: 11, lineHeight: LABEL_H, letterSpacing: 0.1, maxWidth: PITCH - 4, textAlign: 'center' },
  groupLine: { position: 'absolute', left: 0, top: 14, width: 1, height: RING - 14, backgroundColor: 'rgba(255,255,255,0.16)' },
  // The pinned All cell: a glass disc the size of a resting thumb, its label
  // on the thumbs' own baseline, a hairline between it and the schemes.
  allCell: { position: 'absolute', left: PAD, top: ROW_TOP, width: LIST_W, zIndex: 2 },
  allHit: { width: LIST_W, alignItems: 'center' },
  allDisc: { width: THUMB_MIN, height: THUMB_MIN, marginTop: (RING - THUMB_MIN) / 2, borderRadius: THUMB_MIN / 2, backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' },
  allLabel: { marginTop: 3 + (RING - THUMB_MIN) / 2, color: '#fff', opacity: 0.72, fontFamily: F.medium, fontSize: 11, lineHeight: LABEL_H, letterSpacing: 0.1, maxWidth: LIST_W - 4, textAlign: 'center' },
  allLine: { position: 'absolute', right: -1, top: 14, width: 1, height: RING - 14, backgroundColor: 'rgba(255,255,255,0.16)' },
  fade: { position: 'absolute', top: 0, bottom: 0, width: 26 },
});
