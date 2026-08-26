// Flow A: the gift card in every state of the lifecycle, one card per state.
// The running list can only ever hold the scheme the member is enrolled in, so the
// running states cannot all be shown there without inventing enrolments. They are
// shown here instead, against the same card component the list uses.
//
// Grey captions name the state and its trigger. The cards are the design.
// State definitions live in src/gifts/state.js.
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toolbar from '../../src/components/Toolbar';
import GiftSchemeCard from '../../src/gifts/GiftSchemeCard';
import { C, D, F } from '../../src/theme';
import { L12 } from '../../src/textMetrics';
import { giftSchemeNode, LADDERS } from '../../src/gifts/data';

const L = 100000;
const LIFESTYLE = LADDERS[0];
const SLABS = [2, 5, 10, 20];

const base = (id, currentValue, extra = {}) =>
  giftSchemeNode({ id, ladder: LIFESTYLE, slabsInLakhs: SLABS, currentValue, ...extra });

const CASES = [
  {
    caption: 'SCHEDULED. Before 1 Oct. Announce the ladder, no meter yet.',
    node: base('ST-SCHEDULED', 0, { now: Date.UTC(2026, 8, 20) }),
  },
  {
    caption: 'LIVE. Window open, no slab crossed. The meter starts at ₹0 and the value pill is hidden.',
    node: base('ST-LIVE', 0),
  },
  {
    caption: 'EARNED. A slab is crossed. The card names the gift in hand and the gift next up.',
    node: base('ST-EARNED', 6.4 * L),
  },
  {
    caption: 'NEAR SLAB. The gap is 20% or less of the slab step. The sentence turns red.',
    node: base('ST-NEAR', 9.2 * L),
  },
  {
    caption: 'EXPIRING. Three days or fewer left. The chip turns red.',
    node: base('ST-EXPIRING', 6.4 * L, { now: Date.UTC(2026, 10, 7) }),
  },
  {
    caption: 'TOP REACHED. The top slab is crossed. Nothing is left to win.',
    node: base('ST-TOP', 21 * L),
  },
  {
    caption: 'ENDED PENDING. The window closed with a slab crossed. The order is not placed.',
    node: base('ST-PENDING', 11.4 * L, { now: Date.UTC(2026, 10, 12) }),
  },
  {
    caption: 'GIFT ORDERED. The Amazon order is placed.',
    node: base('ST-ORDERED', 11.4 * L, {
      now: Date.UTC(2026, 10, 12),
      fulfilment: { orderedAt: Date.UTC(2026, 10, 11) },
    }),
  },
  {
    caption: 'DELIVERED. The gift reached the shop. Terminal.',
    node: base('ST-DELIVERED', 11.4 * L, {
      now: Date.UTC(2026, 10, 20),
      fulfilment: { orderedAt: Date.UTC(2026, 10, 11), deliveredAt: Date.UTC(2026, 10, 18) },
    }),
  },
  {
    caption: 'ENDED MISSED. The window closed below the first slab. Terminal.',
    node: base('ST-MISSED', 1.1 * L, { now: Date.UTC(2026, 10, 12) }),
  },
];

export default function GiftCardStates() {
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Toolbar title="Card states" />
      <ScrollView contentContainerStyle={styles.list}>
        {CASES.map((c) => (
          <View key={c.node.entityId}>
            <Text style={styles.caption} allowFontScaling={false}>{c.caption}</Text>
            <GiftSchemeCard node={c.node} />
          </View>
        ))}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.white },
  list: { paddingHorizontal: D.listPaddingH, paddingTop: D.cardGap },
  caption: {
    marginTop: 20,
    marginBottom: 8,
    fontFamily: F.regular,
    fontSize: 12,
    lineHeight: L12,
    color: C.mediumGrey,
  },
});
