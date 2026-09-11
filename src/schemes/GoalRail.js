// The goal rail: the card's bottom section as a swipable row of the scheme's
// targets, each a gift picture with its slab. Two drawings of the same idea,
// for the 10 Sep 2026 comparison against the fixed footer (gift discs and a
// count line). A chips drawing (pills with a status word) was dropped the same
// day.
//
//   shelf   square tiles, one per target, the slab as a caption under each.
//           86 px tall.
//   ladder  the shelf with a track behind the tiles, filled in the accent up
//           to the shop's buying, a dot at the point reached. 86 px tall.
//   rewards a row of white product cards (picture, name, slab) for the
//           targets above the next one, and a full-width tinted button ("View
//           all N reward levels"). From the 10 Sep 2026 mockup, less its header
//           row (the button says what the row is). 198 px.
//
// The rail opens scrolled so the next target is the first full item, with
// 16 px of the one before it showing: the qualified targets are one swipe to
// the left, the rest of the ladder to the right. A fade on the right edge says
// there is more. On an ended scheme the rail shows won and missed targets.
//
// Nothing in the rail is a control, so nothing may look selected: no borders
// on items, no tint behind the next target. The next target's slab is in the
// accent colour; qualified and won targets get a check on the picture; missed
// targets dim. (Review of 10 Sep 2026: an accent
// ring and tint on the next target read as a selection that a tap would move.)
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { F } from '../theme';
import { SOLV, GiftThumb } from '../gifts/solv';
import { STATE } from '../gifts/state';

export const RAIL_H = { shelf: 86, ladder: 86, rewards: 198 };

const PAD = 14;                 // the rail's own inset
const TILE = 44;                // shelf and ladder: the tile
const ITEM_W = 60;              // the tile's column, caption included
const ITEM_GAP = 10;
const PITCH = ITEM_W + ITEM_GAP;
const RCARD_W = 100;            // rewards: the product card
const RCARD_GAP = 10;

// One gift per scheme: only the highest target crossed is done (or won); the
// targets under it are passed, and read dimmer with no check.
function statusOf(s, tier) {
  const secured = s.secured && tier.at === s.secured.at;
  if (s.ended) return secured ? 'won' : s.currentValue >= tier.at ? 'passed' : 'missed';
  if (secured) return 'done';
  if (s.currentValue >= tier.at) return 'passed';
  if (s.next && tier.at === s.next.at) return 'next';
  return 'later';
}

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
function startX(s) {
  const idx = s.ended ? Math.max(0, s.ladder.findIndex((t) => s.currentValue < t.at) - 1) : s.next ? s.ladder.findIndex((t) => t.at === s.next.at) : 0;
  return Math.max(0, idx * PITCH - 16);
}

export default function GoalRail({ scheme, variant = 'shelf', accent = SOLV.blue, accentBg = SOLV.blueBg }) {
  const s = scheme.s;
  const slab = scheme.fmt;
  const ref = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  const x0 = startX(s);
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

  if (variant === 'rewards') {
    // The targets above the next one; when there are none (the next is the top,
    // a single target, an ended scheme), every target.
    const above = s.next && !s.ended ? tiers.filter((x) => x.tier.at > s.next.at) : [];
    const items = above.length ? above : tiers;
    const n = s.ladder.length;
    return (
      <View style={[styles.rail, styles.rewards, { height: RAIL_H.rewards }]}>
        <View style={styles.rRow}>
          <ScrollView horizontal nestedScrollEnabled showsHorizontalScrollIndicator={false} dataSet={{ touch: 'pan-x' }} contentContainerStyle={styles.rContent}>
            {items.map(({ tier, status }) => (
              <View key={tier.at} style={[styles.rCard, (status === 'missed' || status === 'passed') && { opacity: 0.45 }]}>
                <View style={styles.rPic}>
                  <GiftThumb gift={tier} size={56} />
                  {status === 'done' || status === 'won' ? <Check size={16} /> : null}
                </View>
                <Text style={styles.rName} numberOfLines={1} allowFontScaling={false}>{tier.shortName || tier.name}</Text>
                <Text style={[styles.rSlab, TAB]} numberOfLines={1} allowFontScaling={false}>{slab(tier.at)}</Text>
              </View>
            ))}
          </ScrollView>
          <LinearGradient pointerEvents="none" colors={['rgba(255,255,255,0)', SOLV.paper]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.fade} />
        </View>
        <View style={[styles.rButton, { backgroundColor: accentBg }]}>
          <Text style={[styles.rButtonText, { color: accent }]} allowFontScaling={false}>{n === 1 ? 'View the reward' : `View all ${n} reward levels`}</Text>
          <Svg width={16} height={16} viewBox="0 0 24 24" style={{ marginLeft: 6 }}>
            <Path d="M4 12h14M12 5l7 7-7 7" stroke={accent} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </Svg>
        </View>
      </View>
    );
  }

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
        contentContainerStyle={[styles.content, { gap: ITEM_GAP, paddingVertical: 12 }]}
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
          const dim = status === 'missed' || status === 'passed';
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

  item: { width: ITEM_W, alignItems: 'center' },
  tile: { width: TILE, height: TILE, borderRadius: 12, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  caption: { marginTop: 4, color: SOLV.ink, fontFamily: F.medium, fontSize: 11, lineHeight: 14 },

  // The ladder's track sits at the tiles' mid-height: 12 px padding + 22.
  track: { position: 'absolute', top: 12 + TILE / 2 - 1, height: 2, borderRadius: 1, backgroundColor: '#E5E7EB' },
  reachDot: { position: 'absolute', top: 12 + TILE / 2 - 5, width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: SOLV.paper },

  // rewards: 14 pad, 114 card, 12, 44 button, 14 pad = 198.
  rewards: { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 14, justifyContent: 'flex-start' },
  rRow: { height: 114, marginHorizontal: -14 },
  rContent: { paddingHorizontal: 14, flexDirection: 'row', gap: RCARD_GAP },
  rCard: { width: RCARD_W, height: 114, borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: SOLV.paper, alignItems: 'center', paddingTop: 8 },
  rPic: { width: 60, height: 60, alignItems: 'center', justifyContent: 'center' },
  rName: { marginTop: 6, color: SOLV.ink, fontFamily: F.regular, fontSize: 11, lineHeight: 14, paddingHorizontal: 6 },
  rSlab: { color: SOLV.ink, fontFamily: F.bold, fontSize: 14, lineHeight: 18 },
  rButton: { height: 44, marginTop: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  rButtonText: { fontFamily: F.bold, fontSize: 14, lineHeight: 18 },

  check: { position: 'absolute', right: -3, bottom: -3, backgroundColor: SOLV.green, borderWidth: 1.5, borderColor: SOLV.paper, alignItems: 'center', justifyContent: 'center' },
});
