// Touchpoint: the Solv cart carrying the running scheme. The strip answers: what does
// THIS order add, and where does it land me? The projected bar draws today's fill
// solid and this cart's contribution lighter, so the landing point is a picture.
//
// Honesty rule: only ELIGIBLE items count. The strip states the eligible amount, and
// an out-of-scope line item (grocery here) visibly does not move the number.
import React from 'react';
import { View, Text, Image, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toolbar from '../../src/components/Toolbar';
import { C, F } from '../../src/theme';
import { SOLV } from '../../src/gifts/solv';
import { L12, L14 } from '../../src/textMetrics';
import { REMOTE } from '../../src/remoteAssets';
import { indianPrice } from '../../src/data';
import { SHIP_COHORTS } from '../../src/ship/data';
import { CartSchemeStrip } from '../../src/ship/SchemeStrip';

const node = SHIP_COHORTS.growth.running[0].node;

export const CART = {
  items: [
    { name: 'Prestige Svachh Dry Iron, case of 12', qty: 1, price: 10800, eligible: true },
    { name: 'Milton Thermosteel Flask 1 L, case of 24', qty: 1, price: 7200, eligible: true },
    { name: 'Tata Salt 1 kg, bale of 50', qty: 1, price: 1150, eligible: false },
  ],
  get itemTotal() { return this.items.reduce((a, i) => a + i.price * i.qty, 0); },
  get eligibleTotal() { return this.items.filter((i) => i.eligible).reduce((a, i) => a + i.price * i.qty, 0); },
};

export default function ShipCart() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Toolbar title={`My Cart (${CART.items.length})`} color={SOLV.blue} />
      <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
        {CART.items.map((it) => (
          <View key={it.name} style={styles.item}>
            <Image source={REMOTE.productPlaceholder} style={styles.thumb} resizeMode="contain" />
            <View style={styles.itemText}>
              <Text style={styles.itemName} numberOfLines={2} allowFontScaling={false}>{it.name}</Text>
              <Text style={styles.itemQty} allowFontScaling={false}>Qty {it.qty}</Text>
            </View>
            <Text style={styles.itemPrice} allowFontScaling={false}>{indianPrice(it.price * it.qty)}</Text>
          </View>
        ))}

        {/* The scheme touchpoint, above the bill */}
        <View style={styles.stripHost}>
          <CartSchemeStrip
            node={node}
            eligibleAmount={CART.eligibleTotal}
            onPress={() => router.push(`/ship/${node.entityId}`)}
          />
          <Text style={styles.eligibleNote} allowFontScaling={false}>
            {indianPrice(CART.eligibleTotal)} of this cart counts: Lifestyle products only
          </Text>
        </View>

        <View style={styles.bill}>
          <View style={styles.billRow}>
            <Text style={styles.billLabel} allowFontScaling={false}>Item total</Text>
            <Text style={styles.billValue} allowFontScaling={false}>{indianPrice(CART.itemTotal)}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel} allowFontScaling={false}>Delivery</Text>
            <Text style={[styles.billValue, { color: SOLV.green }]} allowFontScaling={false}>Free</Text>
          </View>
          <View style={[styles.billRow, styles.billTotalRow]}>
            <Text style={styles.billTotal} allowFontScaling={false}>To pay</Text>
            <Text style={styles.billTotal} allowFontScaling={false}>{indianPrice(CART.itemTotal)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Pressable style={styles.placeBtn} onPress={() => router.push('/ship/order-confirmation')} android_ripple={{ color: '#ffffff33' }}>
          <Text style={styles.placeText} allowFontScaling={false}>PLACE ORDER</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: SOLV.bg },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.white, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: SOLV.line },
  thumb: { width: 48, height: 48 },
  itemText: { flex: 1 },
  itemName: { fontFamily: F.medium, fontSize: 13, lineHeight: 17, color: C.black },
  itemQty: { marginTop: 2, fontFamily: F.regular, fontSize: 12, lineHeight: L12, color: C.greyText },
  itemPrice: { fontFamily: F.medium, fontSize: 13, lineHeight: 17, color: C.black, fontVariant: ['tabular-nums'] },
  stripHost: { marginHorizontal: 12, marginTop: 12 },
  eligibleNote: { marginTop: 6, marginHorizontal: 4, fontFamily: F.regular, fontSize: 11, lineHeight: 14, color: C.mediumGrey, fontVariant: ['tabular-nums'] },
  bill: { marginHorizontal: 12, marginTop: 12, backgroundColor: C.white, borderRadius: 8, borderWidth: 1, borderColor: SOLV.line, padding: 12 },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  billLabel: { fontFamily: F.regular, fontSize: 13, lineHeight: 17, color: C.greyText },
  billValue: { fontFamily: F.regular, fontSize: 13, lineHeight: 17, color: C.black, fontVariant: ['tabular-nums'] },
  billTotalRow: { borderTopWidth: 1, borderTopColor: SOLV.line, marginTop: 6, paddingTop: 10 },
  billTotal: { fontFamily: F.bold, fontSize: 14, lineHeight: L14, color: C.black, fontVariant: ['tabular-nums'] },
  bottomBar: { padding: 12, borderTopWidth: 1, borderTopColor: SOLV.line, backgroundColor: C.white },
  placeBtn: { backgroundColor: SOLV.blue, borderRadius: 8, alignItems: 'center', paddingVertical: 14 },
  placeText: { fontFamily: F.medium, fontSize: 14, lineHeight: L14, color: C.white },
});
