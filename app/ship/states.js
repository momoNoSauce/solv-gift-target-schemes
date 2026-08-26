// The shippable card in every lifecycle state, one card per state, plus the layout
// stress cases the QA pass must not skip: crowded slabs, a missing photo, and a
// two-line title. Every card is built by the same state machine the list uses.
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toolbar from '../../src/components/Toolbar';
import ShipSchemeCard from '../../src/ship/ShipSchemeCard';
import { C, D, F } from '../../src/theme';
import { SOLV } from '../../src/gifts/solv';
import { L12 } from '../../src/textMetrics';
import { giftSchemeNode, LADDERS } from '../../src/gifts/data';

const L = 100000;
const LIFESTYLE = LADDERS[0];
const APPL = { key: 'lifestyle', label: 'Appliances', tiers: LIFESTYLE.tiers };
// The electronics ladder holds tiers without photos (kettle, watch, microwave).
const ELEC = { key: 'electronics', label: 'Electronics', tiers: LADDERS[1].tiers };

const base = (id, currentValue, extra = {}) =>
  giftSchemeNode({
    id,
    name: 'Diwali Gifts',
    windowLabel: '1st Oct - 9th Nov, 26',
    ladder: APPL,
    slabsInLakhs: [2, 5, 10],
    currentValue,
    ...extra,
  });

const CASES = [
  { caption: 'SCHEDULED. Before 1 Oct. The top gift and the start date; no meter yet.',
    node: base('SS-SCHEDULED', 0, { now: Date.UTC(2026, 8, 20) }) },
  { caption: 'LIVE. Window open, nothing crossed. The value pill is hidden at zero.',
    node: base('SS-LIVE', 0) },
  { caption: 'EARNED. One slab crossed: check badge on the Mixer, the rest stay locked.',
    node: base('SS-EARNED', 2.9 * L) },
  { caption: 'EARNED, second slab. Two checks; the sentence sells the Soundbar.',
    node: base('SS-EARNED2', 6.4 * L) },
  { caption: 'NEAR SLAB. Gap 20% or less of the step: the sentence turns red, the chip stays calm.',
    node: base('SS-NEAR', 9.4 * L) },
  { caption: 'EXPIRING. Three days or fewer: the chip turns red.',
    node: base('SS-EXPIRING', 6.4 * L, { now: Date.UTC(2026, 10, 7) }) },
  { caption: 'TOP REACHED. All three checked; the man stands at the end.',
    node: base('SS-TOP', 10.5 * L) },
  { caption: 'ENDED PENDING. Closed with a slab crossed; the outcome replaces the meter.',
    node: base('SS-PENDING', 6.4 * L, { now: Date.UTC(2026, 10, 12) }) },
  { caption: 'GIFT ORDERED.',
    node: base('SS-ORDERED', 6.4 * L, { now: Date.UTC(2026, 10, 12), fulfilment: { orderedAt: Date.UTC(2026, 10, 11) } }) },
  { caption: 'DELIVERED. Terminal.',
    node: base('SS-DELIVERED', 6.4 * L, { now: Date.UTC(2026, 10, 20), fulfilment: { orderedAt: Date.UTC(2026, 10, 11), deliveredAt: Date.UTC(2026, 10, 18) } }) },
  { caption: 'ENDED MISSED. Closed below the first slab. Terminal.',
    node: base('SS-MISSED', 0.8 * L, { now: Date.UTC(2026, 10, 12) }) },
  { caption: 'STRESS: crowded slabs (10L/15L/20L). Medallions push apart instead of overlapping.',
    node: giftSchemeNode({ id: 'SS-CROWD', name: 'Diwali Bumper', windowLabel: '1st Oct - 9th Nov, 26', ladder: APPL, slabsInLakhs: [10, 15, 20], currentValue: 11.2 * L }) },
  { caption: 'STRESS: a gift with no photo (kettle) falls back to its line glyph.',
    node: giftSchemeNode({ id: 'SS-NOPHOTO', name: 'Diwali Gifts', windowLabel: '1st Oct - 9th Nov, 26', ladder: ELEC, slabsInLakhs: [1, 5, 10], currentValue: 2.2 * L }) },
];

export default function ShipCardStates() {
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Toolbar title="Card states" color={SOLV.blue} />
      <ScrollView contentContainerStyle={styles.list}>
        {CASES.map((c) => (
          <View key={c.node.entityId}>
            <Text style={styles.caption} allowFontScaling={false}>{c.caption}</Text>
            <ShipSchemeCard node={c.node} />
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
  caption: { marginTop: 20, marginBottom: 8, fontFamily: F.regular, fontSize: 12, lineHeight: L12, color: C.mediumGrey },
});
