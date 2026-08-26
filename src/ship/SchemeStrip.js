// In-journey scheme touchpoints: the strips that carry the running scheme onto the
// product page, the cart and the order confirmation. All three read the SAME
// schemeState() the My Targets card reads, so no surface can disagree about what the
// customer holds or needs.
//
// Each strip answers exactly one question:
//   PPV           does this product count, and toward what?
//   Cart          what does THIS order add, and where does it land me? (projected bar)
//   Confirmation  what did the placed order move — or win? Crossing a slab is the
//                 celebration moment; adding progress is the quiet nudge.
//
// Copy discipline is the ship's: one bold amount per sentence, "₹X more" for distance,
// "You won" for a crossed slab, blue action, green won, grey secondary.
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { C, F } from '../theme';
import { SOLV } from '../gifts/solv';
import { L12, L14 } from '../textMetrics';
import { IconChevronRight } from '../icons';
import { schemeState } from '../gifts/state';
import { indianPrice } from '../data';
import { lakh } from '../gifts/data';
import GiftMedallion from './GiftMedallion';

// The projection: the same scheme, after this cart's eligible amount lands.
export function project(gift, addedAmount) {
  const before = schemeState(gift);
  const after = schemeState({ ...gift, currentValue: gift.currentValue + addedAmount });
  const wins = after.secured && (!before.secured || after.secured.at !== before.secured.at);
  return { before, after, wins };
}

// PPV: one line under the price block. The product either counts or the strip does
// not render at all — an ineligible product must never carry the scheme.
export function PpvSchemeStrip({ node, onPress }) {
  const s = schemeState(node.gift);
  if (s.ended || !s.next) return null;
  return (
    <Pressable style={styles.strip} onPress={onPress} android_ripple={{ color: '#0000000d' }}>
      <GiftMedallion tier={s.next} state="open" size={40} />
      <View style={styles.stripText}>
        <Text style={styles.stripLine} allowFontScaling={false}>
          Buy <Text style={styles.bold}>{indianPrice(s.remaining)}</Text> more and the {s.next.shortName} is yours
        </Text>
        <Text style={styles.stripSub} allowFontScaling={false}>
          This product counts toward {node.schemeName}
        </Text>
      </View>
      <IconChevronRight size={18} color={SOLV.blue} />
    </Pressable>
  );
}

// Cart: what this order adds, and the projected position. The bar shows today's fill
// solid and this cart's contribution as a lighter segment, so "after this order" is a
// picture, not only a number.
export function CartSchemeStrip({ node, eligibleAmount, onPress }) {
  const [w, setW] = useState(0);
  const { before, after, wins } = project(node.gift, eligibleAmount);
  if (before.ended || eligibleAmount <= 0) return null;

  const top = before.top.at;
  const solid = Math.min(1, node.gift.currentValue / top);
  const projected = Math.min(1, (node.gift.currentValue + eligibleAmount) / top);
  const target = wins ? after.secured : before.next;

  return (
    <Pressable style={styles.card} onPress={onPress} android_ripple={{ color: '#0000000d' }}>
      <View style={styles.cartRow}>
        <GiftMedallion tier={target} state="open" size={40} />
        <View style={styles.stripText}>
          <Text style={styles.stripLine} allowFontScaling={false}>
            This order adds <Text style={styles.bold}>{indianPrice(eligibleAmount)}</Text> toward {node.schemeName}
          </Text>
          <Text style={[styles.stripSub, wins && styles.stripWin]} allowFontScaling={false}>
            {wins
              ? `It crosses ${lakh(after.secured.at)}: the ${after.secured.shortName} becomes yours`
              : `After this order: ${lakh(node.gift.currentValue + eligibleAmount)} · ${indianPrice(after.remaining)} more for the ${before.next.shortName}`}
          </Text>
        </View>
      </View>
      <View style={styles.miniTrack} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
        {w > 0 ? (
          <>
            <View style={[styles.miniProjected, { width: projected * w }]} />
            <View style={[styles.miniFill, { width: solid * w }]} />
          </>
        ) : null}
      </View>
      <View style={styles.miniLabels}>
        <Text style={styles.miniLabel} allowFontScaling={false}>{lakh(0)}</Text>
        <Text style={styles.miniLabel} allowFontScaling={false}>{lakh(top)}</Text>
      </View>
    </Pressable>
  );
}

// Order confirmation: the quiet nudge, or the win. Crossing a slab is the one moment
// the journey celebrates, so the win variant leads with the gift, full size.
export function ConfirmationSchemeCard({ node, addedAmount, onPress }) {
  const { before, after, wins } = project(node.gift, addedAmount);
  if (before.ended || addedAmount <= 0) return null;

  if (wins) {
    return (
      <Pressable style={[styles.card, styles.winCard]} onPress={onPress} android_ripple={{ color: '#0000000d' }}>
        <View style={styles.winMedallion}>
          <GiftMedallion tier={after.secured} state="won" size={64} />
        </View>
        <Text style={styles.winTitle} allowFontScaling={false}>You won the {after.secured.name}</Text>
        <Text style={styles.stripSub} allowFontScaling={false}>
          This order took {node.schemeName} past {lakh(after.secured.at)}. You get it after the
          scheme ends, {node.gift.endLabel}.
        </Text>
        <Text style={styles.viewScheme} allowFontScaling={false}>View scheme</Text>
      </Pressable>
    );
  }

  return (
    <Pressable style={styles.card} onPress={onPress} android_ripple={{ color: '#0000000d' }}>
      <View style={styles.cartRow}>
        <GiftMedallion tier={before.next} state="open" size={40} />
        <View style={styles.stripText}>
          <Text style={styles.stripLine} allowFontScaling={false}>
            This order added <Text style={styles.bold}>{indianPrice(addedAmount)}</Text> toward {node.schemeName}
          </Text>
          <Text style={styles.stripSub} allowFontScaling={false}>
            {indianPrice(after.remaining)} more and the {before.next.shortName} is yours
          </Text>
        </View>
        <IconChevronRight size={18} color={SOLV.blue} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: SOLV.blueBg,
    borderRadius: 8,
  },
  card: {
    backgroundColor: C.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: SOLV.line,
    padding: 12,
  },
  winCard: { alignItems: 'center', paddingVertical: 18 },
  winMedallion: { marginBottom: 10 },
  winTitle: { fontFamily: F.bold, fontSize: 15, lineHeight: 19, color: SOLV.green, textAlign: 'center' },
  cartRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stripText: { flex: 1 },
  stripLine: { fontFamily: F.regular, fontSize: 12, lineHeight: L12 + 2, color: C.black },
  bold: { fontFamily: F.bold, fontVariant: ['tabular-nums'] },
  stripSub: { marginTop: 2, fontFamily: F.regular, fontSize: 12, lineHeight: L12 + 2, color: C.mediumGrey, textAlign: 'left' },
  stripWin: { color: SOLV.green, fontFamily: F.medium },
  viewScheme: { marginTop: 10, fontFamily: F.medium, fontSize: 13, lineHeight: 16, color: SOLV.blue },
  miniTrack: { height: 4, borderRadius: 2, backgroundColor: C.greyishWhite, marginTop: 12, overflow: 'hidden' },
  miniFill: { position: 'absolute', left: 0, top: 0, height: 4, borderRadius: 2, backgroundColor: SOLV.blue },
  // the projected segment sits under the solid fill in a lighter blue
  miniProjected: { position: 'absolute', left: 0, top: 0, height: 4, borderRadius: 2, backgroundColor: '#9DC2F7' },
  miniLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  miniLabel: { fontFamily: F.regular, fontSize: 11, lineHeight: 14, color: C.mediumGrey, fontVariant: ['tabular-nums'] },
});
