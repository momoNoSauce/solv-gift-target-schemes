// Touchpoint: the Solv product page (PPV) carrying the running scheme. The strip sits
// in the offers position under the price block and answers one question: does this
// product count, and toward what? An ineligible product would render no strip at all.
// The demo member is the growth cohort (holds the Air Fryer, Soundbar next).
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
import { PpvSchemeStrip } from '../../src/ship/SchemeStrip';

const node = SHIP_COHORTS.growth.running[0].node;

// A Lifestyle SKU, so it genuinely falls inside the scheme's included category.
const PRODUCT = {
  name: 'Prestige Svachh Dry Iron, case of 12',
  mrp: 14400,
  price: 10800,
  caseSize: 'Case of 12 · ₹900 a piece',
};

export default function ShipPpv() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Toolbar title="Product details" color={SOLV.blue} />
      <ScrollView>
        <View style={styles.imageBox}>
          <Image source={REMOTE.productPlaceholder} style={styles.image} resizeMode="contain" />
        </View>

        <View style={styles.body}>
          <Text style={styles.name} allowFontScaling={false}>{PRODUCT.name}</Text>
          <Text style={styles.caseSize} allowFontScaling={false}>{PRODUCT.caseSize}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price} allowFontScaling={false}>{indianPrice(PRODUCT.price)}</Text>
            <Text style={styles.mrp} allowFontScaling={false}>MRP {indianPrice(PRODUCT.mrp)}</Text>
          </View>

          {/* The scheme touchpoint, in the offers position */}
          <View style={styles.offers}>
            <Text style={styles.offersHead} allowFontScaling={false}>Offers</Text>
            <PpvSchemeStrip node={node} onPress={() => router.push(`/ship/${node.entityId}`)} />
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Pressable style={styles.addBtn} onPress={() => router.push('/ship/cart')} android_ripple={{ color: '#ffffff33' }}>
          <Text style={styles.addText} allowFontScaling={false}>ADD TO CART</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.white },
  imageBox: { alignItems: 'center', paddingVertical: 24, backgroundColor: C.white },
  image: { width: 180, height: 180 },
  body: { paddingHorizontal: 16 },
  name: { fontFamily: F.bold, fontSize: 16, lineHeight: 20, color: C.black },
  caseSize: { marginTop: 4, fontFamily: F.regular, fontSize: 12, lineHeight: L12, color: C.greyText },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 10, marginTop: 10 },
  price: { fontFamily: F.bold, fontSize: 18, lineHeight: 22, color: C.black, fontVariant: ['tabular-nums'] },
  mrp: { fontFamily: F.regular, fontSize: 12, lineHeight: L12, color: C.greyText, textDecorationLine: 'line-through' },
  offers: { marginTop: 18 },
  offersHead: { fontFamily: F.medium, fontSize: 14, lineHeight: L14, color: C.black, marginBottom: 8 },
  bottomBar: { padding: 12, borderTopWidth: 1, borderTopColor: SOLV.line, backgroundColor: C.white },
  addBtn: { backgroundColor: SOLV.blue, borderRadius: 8, alignItems: 'center', paddingVertical: 14 },
  addText: { fontFamily: F.medium, fontSize: 14, lineHeight: L14, color: C.white },
});
