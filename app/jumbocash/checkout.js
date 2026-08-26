// item_payment_method.xml + PaymentMethodAdapter.kt + item_payment_breakdown.xml
// (PaymentBreakdownAdapter.kt) — where Jumbocash is applied to an order, plus
// @string/_full_amount_covered_using_jumbocash from fragment_checkout.xml.
import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toolbar from '../../src/components/Toolbar';
import { C, F } from '../../src/theme';
import { IconJumboCash } from '../../src/icons';

const METHODS = [
  {
    id: 'jumbocash',
    label: 'Pay using Jumbocash',
    reward: { title: '₹1,875 Jumbocash available', bgColor: '#EAF4E9' },
    detailTitle: 'Payment breakdown',
    breakdown: [
      { title: 'Order amount', amount: '₹4,250' },
      { title: 'Jumbocash applied', amount: '- ₹500' },
      { title: 'Amount payable', amount: '₹3,750' },
    ],
  },
  { id: 'upi', label: 'UPI', reward: null, breakdown: [] },
  { id: 'cod', label: 'Cash on delivery', reward: null, breakdown: [] },
];

export default function JumbocashCheckout() {
  const [selected, setSelected] = useState('jumbocash');

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Toolbar title="Checkout" elevation={4} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* fragment_checkout.xml: _full_amount_covered_using_jumbocash, green #1F6F2C */}
        <Text style={styles.fullAmount} allowFontScaling={false}>Full amount covered using JumboCash</Text>

        {METHODS.map((m) => {
          const on = selected === m.id;
          return (
            <View key={m.id} style={styles.methodBlock}>
              <Pressable style={styles.methodRow} onPress={() => setSelected(m.id)}>
                <View style={styles.radioOuter}>{on ? <View style={styles.radioInner} /> : null}</View>
                <Text style={styles.methodLabel} allowFontScaling={false}>{m.label}</Text>
                {m.reward ? (
                  <View style={[styles.rewardCard, { backgroundColor: m.reward.bgColor }]}>
                    <IconJumboCash width={20} />
                    <Text style={styles.rewardText} allowFontScaling={false}>{m.reward.title}</Text>
                  </View>
                ) : null}
              </Pressable>

              {on && m.breakdown.length ? (
                <View style={styles.detailsBlock}>
                  <Text style={styles.detailTitle} allowFontScaling={false}>{m.detailTitle}</Text>
                  <View style={styles.detailDivider} />
                  {m.breakdown.map((b, i) => (
                    <View key={i} style={styles.breakdownRow}>
                      <Text style={styles.breakdownTitle} allowFontScaling={false}>{b.title}</Text>
                      <Text style={styles.breakdownAmount} allowFontScaling={false}>{b.amount}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.white },
  fullAmount: { color: '#1F6F2C', fontSize: 13, lineHeight: 15.6, fontFamily: F.regular, marginBottom: 16 },
  methodBlock: { marginBottom: 8 },
  methodRow: { flexDirection: 'row', alignItems: 'center' },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: C.brandGreen, alignItems: 'center', justifyContent: 'center' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.brandGreen },
  methodLabel: { flex: 1, marginLeft: 8, color: C.brandGreen, fontSize: 14, lineHeight: 16.8, fontFamily: F.regular },
  // cardReward: CardView with 8dp corners, background colour from the API
  rewardCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 8, paddingHorizontal: 2, paddingVertical: 4 },
  rewardText: { marginLeft: 8, color: C.black, fontSize: 12, lineHeight: 14.4, fontFamily: F.medium },
  // bg_payment_details: #F5F5F5 fill, 1dp #E0E0E0 stroke, 8dp radius
  detailsBlock: { marginTop: 8, padding: 16, borderRadius: 8, backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: '#E0E0E0' },
  detailTitle: { marginBottom: 12, color: C.black, fontSize: 12, lineHeight: 14.4, fontFamily: F.bold },
  detailDivider: { height: 0.5, backgroundColor: '#666666' },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  breakdownTitle: { color: '#666666', fontSize: 12, lineHeight: 14.4, fontFamily: F.regular },
  breakdownAmount: { color: C.black, fontSize: 12, lineHeight: 14.4, fontFamily: F.regular },
});
