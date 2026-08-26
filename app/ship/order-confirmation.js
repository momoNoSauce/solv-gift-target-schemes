// Touchpoint: the Solv order confirmation carrying the running scheme. Two moments:
//   default   the quiet nudge: what this order added, and the distance left
//   ?win=1    the celebration: the order crossed a slab, so the card leads with the
//             won gift at full size. This is the one place the journey celebrates.
// The added amount is the cart's ELIGIBLE total, so the confirmation continues the
// exact number the cart promised.
import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, F } from '../../src/theme';
import { SOLV } from '../../src/gifts/solv';
import { L12, L14 } from '../../src/textMetrics';
import { indianPrice } from '../../src/data';
import { SHIP_COHORTS } from '../../src/ship/data';
import { ConfirmationSchemeCard } from '../../src/ship/SchemeStrip';
import { CART } from './cart';

const node = SHIP_COHORTS.growth.running[0].node;

export default function ShipOrderConfirmation() {
  const router = useRouter();
  const params = useLocalSearchParams();
  // The win variant models a bigger order that crosses the ₹10L slab.
  const win = Number(params.win) === 1;
  const added = win ? 370000 : CART.eligibleTotal;
  const orderTotal = win ? 371150 : CART.itemTotal;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.tick}>
          <Svg width={72} height={72} viewBox="0 0 72 72">
            <Circle cx="36" cy="36" r="34" fill={SOLV.greenBg} />
            <Circle cx="36" cy="36" r="26" fill={SOLV.green} />
            <Path d="M24 37l8 8 16-17" stroke="#fff" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </Svg>
        </View>
        <Text style={styles.title} allowFontScaling={false}>Order placed</Text>
        <Text style={styles.sub} allowFontScaling={false}>
          Order SLV-88231904 · {indianPrice(orderTotal)} · Delivery by tomorrow, 7 PM
        </Text>

        {/* The scheme touchpoint */}
        <View style={styles.cardHost}>
          <ConfirmationSchemeCard
            node={node}
            addedAmount={added}
            onPress={() => router.push(`/ship/${node.entityId}`)}
          />
        </View>

        <Pressable style={styles.continueBtn} onPress={() => router.push('/ship')} android_ripple={{ color: '#0000000d' }}>
          <Text style={styles.continueText} allowFontScaling={false}>CONTINUE SHOPPING</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.white },
  body: { alignItems: 'center', paddingTop: 48, paddingHorizontal: 16 },
  tick: { marginBottom: 16 },
  title: { fontFamily: F.bold, fontSize: 20, lineHeight: 25, color: C.black },
  sub: { marginTop: 6, fontFamily: F.regular, fontSize: 12, lineHeight: L12 + 2, color: C.mediumGrey, textAlign: 'center', fontVariant: ['tabular-nums'] },
  cardHost: { alignSelf: 'stretch', marginTop: 24 },
  continueBtn: { marginTop: 24, borderWidth: 1, borderColor: SOLV.blue, borderRadius: 8, paddingVertical: 12, paddingHorizontal: 28 },
  continueText: { fontFamily: F.medium, fontSize: 14, lineHeight: L14, color: SOLV.blue },
});
