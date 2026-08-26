// Touchpoint: the order confirmation, built from the app's OWN layout:
//   fragment_cart_order_confirmation.xml — toolbar "Order Confirmed", the gamification
//   block (scratch_card_status_msg + _subtitle over a shadowed 300x300 won-layout).
// The JT app hands out a scratch card in that slot; the gift variant puts the member's
// OWN scheme card there (ShipSchemeCard, the existing TSWP-based card), projected past
// this order's eligible amount so the status line and the card agree.
//   default   the quiet nudge: what this order added
//   ?win=1    the order crossed a slab: the same slot, the card now showing the won
//             gift's green check, and the subtitle naming it
import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toolbar from '../../src/components/Toolbar';
import ShipSchemeCard from '../../src/ship/ShipSchemeCard';
import { C, F } from '../../src/theme';
import { SOLV } from '../../src/gifts/solv';
import { schemeState } from '../../src/gifts/state';
import { indianPrice } from '../../src/data';
import { giftSchemeNode } from '../../src/gifts/data';
import { SHIP_COHORTS } from '../../src/ship/data';

const base = SHIP_COHORTS.growth.running[0].node;

export default function ShipOrderConfirmation() {
  const router = useRouter();
  const params = useLocalSearchParams();
  // The win variant models a bigger order that crosses the ₹10L slab.
  const win = Number(params.win) === 1;
  const added = win ? 370000 : 18000;

  // The member's scheme, projected past this order: rebuilt through the same node
  // builder, so the card's copy and meter re-derive rather than being hand-edited.
  const node = giftSchemeNode({
    id: base.entityId,
    name: base.schemeName,
    windowLabel: '1st Oct - 9th Nov, 26',
    ladder: { key: base.ladderKey, label: 'Lifestyle', tiers: base.gift.tiers },
    slabsInLakhs: base.gift.tiers.map((t) => t.at / 100000),
    currentValue: base.gift.currentValue + added,
  });
  const s = schemeState(node.gift);
  const statusSubtitle = win
    ? `This order won you the ${s.secured.name}`
    : `This order added ${indianPrice(added)} toward ${base.schemeName}`;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {/* OrderConfirmationFragment: collapsingToolbarLayout title @string/_order_confirmed */}
      <Toolbar title="Order Confirmed" elevation={4} color={SOLV.blue} />
      <ScrollView>
        <View style={styles.gamification}>
          <Text style={styles.statusMsg} allowFontScaling={false}>Congratulations!</Text>
          <Text style={styles.statusSubtitle} allowFontScaling={false}>{statusSubtitle}</Text>

          {/* scratch_card_won_layout, holding the scheme card instead of a scratch card */}
          <View style={styles.wonLayout}>
            <View style={styles.cardHost}>
              <ShipSchemeCard node={node} onPress={() => router.push(`/ship/${base.entityId}`)} />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.defaultBg },
  gamification: { backgroundColor: C.white, alignItems: 'center', paddingBottom: 16 },
  statusMsg: { marginTop: 8, marginHorizontal: 16, paddingHorizontal: 8, color: C.black, fontSize: 16, lineHeight: 19.2, fontFamily: F.bold },
  statusSubtitle: { marginTop: 4, marginHorizontal: 16, paddingHorizontal: 8, color: C.black, fontSize: 12, lineHeight: 14.4, fontFamily: F.regular },
  // scratch_card_won_layout: scratch_card_bg_with_shadow, min 300x300
  wonLayout: {
    marginTop: 8,
    marginBottom: 16,
    alignSelf: 'stretch',
    marginHorizontal: 16,
    minHeight: 300,
    justifyContent: 'center',
    backgroundColor: C.white,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHost: { paddingHorizontal: 10 },
});
