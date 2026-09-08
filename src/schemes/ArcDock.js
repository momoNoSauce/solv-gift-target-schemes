// The arc dock (version B). The scheme thumbs sit on a circle arc under the
// sheet, the way the reference video arranges them: the focused thumb at the
// apex, the neighbours stepping down and away along the arc the thumb of a hand
// draws when it swings from the wrist. The whole arc rotates with the pager,
// so a swipe on the sheet and a swipe on the arc are one motion.
//
// Measured from the reference (592 px wide): pitch 122 px, first drop 10 px,
// second 35 px, sizes 1.0 / 0.76 / 0.68, the far thumb fading. Scaled to 412:
//   radius R = 520 px (1.26 screen widths), pitch angle 0.1654 rad (86 px at
//   the apex), drops 7 and 24 px, sizes 76 / 58 / 50 px.
//
// Every thumb's x, y, scale and opacity are functions of its angular distance
// from `pos`, sampled every quarter page so the piecewise-linear Animated
// interpolation follows the circle to within half a pixel.
//
// The list pill. The leftmost control always goes back to the list of scheme
// cards. It is a labelled pill, not a disc: leaving the page is a different
// move from changing the scheme, and a disc in the corner read as one more
// thumb that had fallen off the arc. It lights up in the theme's accent as the
// arc is pulled past the first scheme, the gesture that also reaches it. It
// cannot ride the arc: the arc's
// own nodes sweep the whole curve as the pager turns, so a node pinned on the
// curve would be run over at the last page. It sits in the zone's bottom-left
// corner instead, below the lowest point the arc's left tail reaches (measured:
// the tail's visible edge stops at 867 px on a 915 px screen, the pill starts at
// 875, and a bottom inset widens the gap), so the two never tangle. The house mark carries it: the corner has no
// room for a label under the disc, and the dock version's label does that work.
//
// Recognition: the thumb is the SCHEME'S OWN ART (festival illustration or
// brand mark), never a gift photo. The focused scheme's full name and its
// status line sit under the apex and cross-fade as the arc turns.
import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { F } from '../theme';
import GiftGlyph from '../gifts/icons';
import { themeOf } from '../gifts/themes';
import SchemeArt from './SchemeArt';
import { usePressScale } from '../gifts/solv';
import { statusLine } from './registry';
import { IconList } from '../icons';

export const ARC_PITCH = 86;          // apex spacing, px per page
const LIST_H = 32;                    // the list pill
const LIST_X = 16;                    // its left margin
const LIST_BOTTOM = 8;                // clear of the arc's lowest left node
const R = 520;                        // arc radius
const THETA = ARC_PITCH / R;          // rad per page
const APEX = 76;                      // focused thumb
const RING_GAP = 3;
const RING_W = 2;
const RING = APEX + 2 * (RING_GAP + RING_W);   // 86
const APEX_TOP = 22;                  // apex thumb top, from the zone's top
const NAME_TOP = APEX_TOP + APEX + 12;
export const ZONE_H = NAME_TOP + 19 + 2 + 16 + 14;   // 161
const VISIBLE = 3.2;                  // thumbs past this distance are not drawn

// Size and opacity by distance from the apex (linear between the samples).
const sizeAt = (d) => (d <= 1 ? APEX - (APEX - 58) * d : d <= 2 ? 58 - 8 * (d - 1) : 50);
const alphaAt = (d) => (d <= 1 ? 1 - 0.15 * d : d <= 2 ? 0.85 - 0.35 * (d - 1) : Math.max(0, 0.5 - 0.5 * (d - 2)));

function samples(i, cx) {
  const input = [];
  const x = [];
  const y = [];
  const sc = [];
  const op = [];
  for (let k = -VISIBLE * 4; k <= VISIBLE * 4; k++) {
    const p = i - k / 4;            // pos value at which this thumb is k/4 pages from the apex
    const a = (k / 4) * THETA;      // its angle, positive to the right
    input.push(p);
    x.push(cx + R * Math.sin(a));
    y.push(APEX_TOP + APEX / 2 + R * (1 - Math.cos(a)));
    const d = Math.abs(k / 4);
    sc.push(sizeAt(d) / APEX);
    op.push(alphaAt(d));
  }
  // inputRange must ascend: the loop above descends in p.
  return { input: input.reverse(), x: x.reverse(), y: y.reverse(), sc: sc.reverse(), op: op.reverse() };
}

function Thumb({ scheme, i, pos, cx, onPress }) {
  const s = useMemo(() => samples(i, cx), [i, cx]);
  const done = scheme.group === 'completed';
  const won = done && Boolean(scheme.s.secured);
  const tx = pos.interpolate({ inputRange: s.input, outputRange: s.x.map((v) => v - RING / 2), extrapolate: 'clamp' });
  const ty = pos.interpolate({ inputRange: s.input, outputRange: s.y.map((v) => v - RING / 2), extrapolate: 'clamp' });
  const scale = pos.interpolate({ inputRange: s.input, outputRange: s.sc, extrapolate: 'clamp' });
  const opacity = pos.interpolate({ inputRange: s.input, outputRange: s.op, extrapolate: 'clamp' });
  // The ring and the full-colour art belong to the apex only.
  const focus = pos.interpolate({ inputRange: [i - 0.5, i, i + 0.5], outputRange: [0, 1, 0], extrapolate: 'clamp' });
  const dimmed = pos.interpolate({ inputRange: [i - 0.5, i, i + 0.5], outputRange: [0.4, 0, 0.4], extrapolate: 'clamp' });
  // Press feedback: a spring to 0.96 that the release reverses mid-motion.
  const press = usePressScale(0.96);

  return (
    <Animated.View style={[styles.thumbBox, { opacity, transform: [{ translateX: tx }, { translateY: ty }, { scale: Animated.multiply(scale, press.scale) }] }]}>
      <Pressable onPress={onPress} onPressIn={press.pressIn} onPressOut={press.pressOut} accessibilityRole="button" accessibilityLabel={scheme.title} style={styles.thumbHit}>
        <Animated.View style={[styles.ring, { opacity: focus }]} />
        <View style={styles.disc}>
          <SchemeArt scheme={scheme} size={APEX} dim={done} />
          {/* a veil that lifts at the apex: the focused scheme is the only one in full colour */}
          <Animated.View pointerEvents="none" style={[styles.veil, { opacity: dimmed }]} />
          <View pointerEvents="none" style={styles.edge} />
        </View>
        {won ? (
          <View style={styles.badge}>
            <GiftGlyph kind="check" size={10} color="#fff" strokeWidth={2.4} />
          </View>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

function ListPill({ onPress, label, hint, bottomInset, over, accent }) {
  const press = usePressScale(0.94);
  const lift = over ? over.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] }) : 1;
  return (
    <Pressable
      onPress={onPress}
      onPressIn={press.pressIn}
      onPressOut={press.pressOut}
      accessibilityRole="button"
      accessibilityLabel={hint}
      style={[styles.listHit, { bottom: bottomInset + LIST_BOTTOM }]}
    >
      <Animated.View style={[styles.listPill, { transform: [{ scale: Animated.multiply(press.scale, lift) }] }]}>
        <Animated.View pointerEvents="none" style={[styles.listFill, { backgroundColor: accent, opacity: over || 0 }]} />
        <IconList size={18} color="#fff" strokeWidth={2} />
        <Text style={styles.listText} numberOfLines={1} allowFontScaling={false}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

export default function ArcDock({ schemes, pos, over = null, onSelect, onList, panHandlers, width, bottomInset = 0, listLabel = 'Schemes', listHint = 'All schemes' }) {
  const cx = width / 2;
  const n = schemes.length;
  const accents = schemes.map((x) => themeOf(x.theme).stage.accent);
  const accent = n > 1 ? pos.interpolate({ inputRange: schemes.map((_, i) => i), outputRange: accents, extrapolate: 'clamp' }) : accents[0] || '#fff';
  return (
    <View style={[styles.zone, { height: ZONE_H + bottomInset }]} dataSet={{ touch: 'none' }} {...panHandlers}>
      {onList ? <ListPill onPress={onList} label={listLabel} hint={listHint} bottomInset={bottomInset} over={over} accent={accent} /> : null}
      {schemes.map((sc, i) => (
        <Thumb key={sc.id} scheme={sc} i={i} pos={pos} cx={cx} onPress={() => onSelect(i)} />
      ))}
      {/* The focused scheme's name and status, cross-fading as the arc turns. */}
      <View pointerEvents="none" style={styles.labels}>
        {schemes.map((sc, i) => {
          // The label holds until 0.3 of a page, then commits to the neighbour by 0.5.
          const o = n > 1 ? pos.interpolate({ inputRange: [i - 0.5, i - 0.3, i, i + 0.3, i + 0.5], outputRange: [0, 1, 1, 1, 0], extrapolate: 'clamp' }) : 1;
          const rise = n > 1 ? pos.interpolate({ inputRange: [i - 0.5, i - 0.3, i, i + 0.3, i + 0.5], outputRange: [5, 0, 0, 0, 5], extrapolate: 'clamp' }) : 0;
          const th = themeOf(sc.theme);
          return (
            <Animated.View key={sc.id} style={[styles.label, { opacity: o, transform: [{ translateY: rise }] }]}>
              <Text style={styles.name} numberOfLines={1} allowFontScaling={false}>{sc.title}</Text>
              <Text style={[styles.status, sc.group === 'running' && !sc.s.ended && { color: th.stage.accent === '#FFFFFF' ? 'rgba(255,255,255,0.72)' : th.stage.accent }]} numberOfLines={1} allowFontScaling={false}>
                {statusLine(sc)}
              </Text>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  zone: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  thumbBox: { position: 'absolute', left: 0, top: 0, width: RING, height: RING },
  thumbHit: { width: RING, height: RING, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', left: 0, top: 0, width: RING, height: RING, borderRadius: RING / 2, borderWidth: RING_W, borderColor: '#FFFFFF' },
  disc: { width: APEX, height: APEX, borderRadius: APEX / 2, overflow: 'hidden', backgroundColor: '#FFFFFF' },
  veil: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: '#1A1730' },
  // The disc's edge: pure black at low alpha, so a white brand disc still has a rim on the dark ground.
  edge: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, borderRadius: APEX / 2, borderWidth: 1, borderColor: 'rgba(0,0,0,0.12)' },
  badge: { position: 'absolute', right: 2, top: 2, width: 22, height: 22, borderRadius: 11, backgroundColor: '#177E36', borderWidth: 2, borderColor: '#1A1730', alignItems: 'center', justifyContent: 'center' },
  listHit: { position: 'absolute', left: LIST_X, zIndex: 3 },
  listPill: { height: LIST_H, borderRadius: LIST_H / 2, paddingLeft: 10, paddingRight: 13, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)', overflow: 'hidden' },
  listFill: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 },
  listText: { color: '#fff', fontFamily: F.medium, fontSize: 12, lineHeight: 15, letterSpacing: 0.1 },
  labels: { position: 'absolute', left: 0, right: 0, top: NAME_TOP, alignItems: 'center' },
  label: { position: 'absolute', left: 120, right: 120, top: 0, alignItems: 'center' },
  name: { color: '#FFFFFF', fontFamily: F.medium, fontSize: 15, lineHeight: 19, letterSpacing: 0.1 },
  status: { marginTop: 2, color: 'rgba(255,255,255,0.72)', fontFamily: F.regular, fontSize: 12, lineHeight: 16, fontVariant: ['tabular-nums'] },
});
