// The goal rail: the card's bottom section as a swipable row of the scheme's
// targets, each a gift picture with its slab. Three drawings of the same idea,
// for the 10 Sep 2026 comparison against the fixed footer (gift discs and a
// count line):
//
//   chips   one item per target: a 38 px disc, the slab in bold and a status
//           word under it (Next, Qualified, Won, Missed). 76 px tall.
//   shelf   square tiles, one per target, the slab as a caption under each.
//           86 px tall.
//   ladder  the shelf with a track behind the tiles, filled in the accent up
//           to the shop's buying, a dot at the point reached. 86 px tall.
//
// The rail opens scrolled so the next target is the first full item, with
// 16 px of the one before it showing: the qualified targets are one swipe to
// the left, the rest of the ladder to the right. A fade on the right edge says
// there is more. On an ended scheme the rail shows won and missed targets.
//
// Nothing in the rail is a control, so nothing may look selected: no borders
// on items, no tint behind the next target. The next target is said in words
// (Next) and in the accent colour of its slab; qualified and won targets get a
// check on the picture; missed targets dim. (Review of 10 Sep 2026: an accent
// ring and tint on the next target read as a selection that a tap would move.)
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { F } from '../theme';
import { SOLV, GiftThumb } from '../gifts/solv';
import { STATE } from '../gifts/state';

export const RAIL_H = { chips: 76, shelf: 86, ladder: 86 };

const PAD = 14;                 // the rail's own inset
const CHIP_W = 132;             // chips: fixed, so the rail can scroll to a target; ₹1,50,000 fits
const CHIP_GAP = 8;
const TILE = 44;                // shelf and ladder: the tile
const ITEM_W = 60;              // the tile's column, caption included
const ITEM_GAP = 10;
const PITCH = ITEM_W + ITEM_GAP;

function statusOf(s, tier) {
  if (s.ended) return s.currentValue >= tier.at ? 'won' : 'missed';
  if (s.currentValue >= tier.at) return 'done';
  if (s.next && tier.at === s.next.at) return 'next';
  return 'later';
}

const WORD = { done: 'Qualified', next: 'Next', later: '', won: 'Won', missed: 'Missed' };

function Check({ size = 14 }) {
  return (
    <View style={[styles.check, { width: size, height: size, borderRadius: size / 2 }]}>
      <Svg width={size * 0.64} height={size * 0.64} viewBox="0 0 24 24">
        <Path d="M5 12.5l4.5 4.5L19 7.5" stroke="#fff" strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </Svg>
    </View>
  );
}

// The scroll offset that puts the next target first, with 16 px of the one
// before it showing under the left fade (its rounded end, never its words).
// Nothing to scroll to when the next target is the first.
function startX(s, pitch) {
  const idx = s.ended ? Math.max(0, s.ladder.findIndex((t) => s.currentValue < t.at) - 1) : s.next ? s.ladder.findIndex((t) => t.at === s.next.at) : 0;
  return Math.max(0, idx * pitch - 16);
}

export default function GoalRail({ scheme, variant = 'chips', accent = SOLV.blue, accentBg = SOLV.blueBg }) {
  const s = scheme.s;
  const slab = scheme.fmt;
  const ref = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  const pitch = variant === 'chips' ? CHIP_W + CHIP_GAP : PITCH;
  const x0 = startX(s, pitch);
  useEffect(() => {
    if (x0 > 0 && ref.current) ref.current.scrollTo({ x: x0, animated: false });
    setScrolled(x0 > 0);
  }, [x0]);

  const tiers = s.ladder.map((tier, k) => ({ tier, k, status: statusOf(s, tier) }));
  const scheduled = s.state === STATE.SCHEDULED;

  // The ladder's track: from the first tile's centre to the last's, filled to
  // the point the shop has reached. Centres sit at PAD + ITEM_W / 2 + k * PITCH.
  const centre = (k) => PAD + ITEM_W / 2 + k * PITCH;
  const done = tiers.filter((x) => x.status === 'done' || x.status === 'won').length;
  const prevAt = done ? s.ladder[done - 1].at : 0;
  const frac = s.next ? Math.min(1, Math.max(0, (s.currentValue - prevAt) / (s.next.at - prevAt))) : 1;
  const trackFrom = centre(0);
  const trackTo = centre(tiers.length - 1);
  // The point reached sits in the gap between the last qualified tile and the
  // next one (a point under a tile would be hidden). Before the first target
  // the gap is the run from the track's start to the first tile's edge.
  const gapFrom = done === 0 ? trackFrom : centre(done - 1) + TILE / 2;
  const gapTo = done === 0 ? centre(0) - TILE / 2 : centre(done) - TILE / 2;
  const reach = s.ended || !s.next ? centre(Math.max(0, done - 1)) : gapFrom + 6 + frac * Math.max(0, gapTo - gapFrom - 12);

  return (
    <View style={[styles.rail, { height: RAIL_H[variant] }]}>
      <ScrollView
        ref={ref}
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={32}
        onScroll={(e) => setScrolled(e.nativeEvent.contentOffset.x > 2)}
        dataSet={{ touch: 'pan-x' }}
        contentContainerStyle={[styles.content, variant === 'chips' ? { gap: CHIP_GAP, paddingVertical: (RAIL_H.chips - 48) / 2 } : { gap: ITEM_GAP, paddingVertical: 12 }]}
      >
        {variant === 'ladder' && tiers.length > 1 ? (
          <>
            <View pointerEvents="none" style={[styles.track, { left: trackFrom, width: trackTo - trackFrom }]} />
            <View pointerEvents="none" style={[styles.track, { left: trackFrom, width: Math.max(0, Math.min(trackTo, reach) - trackFrom), backgroundColor: accent }]} />
            {!s.ended && s.next && !scheduled ? <View pointerEvents="none" style={[styles.reachDot, { left: reach - 5, backgroundColor: accent }]} /> : null}
          </>
        ) : null}

        {tiers.map(({ tier, k, status }) => {
          const isNext = status === 'next';
          const isDone = status === 'done' || status === 'won';
          const dim = status === 'missed';
          if (variant === 'chips') {
            return (
              <View key={tier.at} style={[styles.chip, dim && { opacity: 0.5 }]}>
                <View style={styles.chipThumb}>
                  <GiftThumb gift={tier} size={26} />
                  {isDone ? <Check size={14} /> : null}
                </View>
                <View style={styles.chipText}>
                  <Text style={[styles.chipSlab, TAB, isNext && { color: accent }]} numberOfLines={1} allowFontScaling={false}>{slab(tier.at)}</Text>
                  {WORD[status] ? (
                    <Text style={[styles.chipWord, isNext && { color: accent }, isDone && { color: SOLV.green }]} numberOfLines={1} allowFontScaling={false}>{WORD[status]}</Text>
                  ) : null}
                </View>
              </View>
            );
          }
          return (
            <View key={tier.at} style={[styles.item, dim && { opacity: 0.45 }]}>
              <View style={styles.tile}>
                <GiftThumb gift={tier} size={30} />
                {isDone ? <Check size={14} /> : null}
              </View>
              <Text style={[styles.caption, TAB, isNext && { color: accent, fontFamily: F.bold }, isDone && { color: SOLV.sub }]} numberOfLines={1} allowFontScaling={false}>{slab(tier.at)}</Text>
            </View>
          );
        })}
      </ScrollView>
      <LinearGradient pointerEvents="none" colors={['rgba(255,255,255,0)', SOLV.paper]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.fade} />
      {scrolled ? <LinearGradient pointerEvents="none" colors={[SOLV.paper, 'rgba(255,255,255,0)']} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.fadeLeft} /> : null}
    </View>
  );
}

const TAB = { fontVariant: ['tabular-nums'] };

const styles = StyleSheet.create({
  rail: { backgroundColor: SOLV.paper, justifyContent: 'center' },
  content: { paddingHorizontal: PAD, flexDirection: 'row', alignItems: 'center' },
  fade: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 36 },
  fadeLeft: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 36 },

  chip: { width: CHIP_W, height: 48, flexDirection: 'row', alignItems: 'center', paddingLeft: 4, paddingRight: 8 },
  chipThumb: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', overflow: 'visible' },
  chipText: { flex: 1, marginLeft: 8 },
  chipSlab: { color: SOLV.ink, fontFamily: F.bold, fontSize: 13, lineHeight: 16 },
  chipWord: { color: SOLV.sub, fontFamily: F.medium, fontSize: 11, lineHeight: 13, marginTop: 1 },

  item: { width: ITEM_W, alignItems: 'center' },
  tile: { width: TILE, height: TILE, borderRadius: 12, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  caption: { marginTop: 4, color: SOLV.ink, fontFamily: F.medium, fontSize: 11, lineHeight: 14 },

  // The ladder's track sits at the tiles' mid-height: 12 px padding + 22.
  track: { position: 'absolute', top: 12 + TILE / 2 - 1, height: 2, borderRadius: 1, backgroundColor: '#E5E7EB' },
  reachDot: { position: 'absolute', top: 12 + TILE / 2 - 5, width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: SOLV.paper },

  check: { position: 'absolute', right: -3, bottom: -3, backgroundColor: SOLV.green, borderWidth: 1.5, borderColor: SOLV.paper, alignItems: 'center', justifyContent: 'center' },
});
