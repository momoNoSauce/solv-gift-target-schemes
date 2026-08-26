// Scheme card states, start to end. One card design, nine lifecycle states.
// Grey captions name the state and its trigger; the cards are the design.
//
// Every card here is built by solvSchemeCard() from schemeState(), the same pair the
// My Schemes list uses. Hand-written strings would drift from the list within a week.
//
// Backend mapping (gift variant of target_scheme) lives in src/gifts/state.js.
import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconBack } from '../../src/icons';
import { F } from '../../src/theme';
import { SchemeCard, solvSchemeCard, SOLV } from '../../src/gifts/solv';
import { schemeState } from '../../src/gifts/state';
import { LADDERS, lakh } from '../../src/gifts/data';
import { indianPrice } from '../../src/data';

const L = 100000;
const LIFESTYLE = LADDERS[0];
const START = Date.UTC(2026, 9, 1);
const END = Date.UTC(2026, 10, 9);

const at = (currentValue, now, fulfilment = {}) =>
  schemeState({
    tiers: LIFESTYLE.tiers,
    currentValue,
    startTime: START,
    endTime: END,
    now,
    fulfilment,
    startLabel: '1 Oct 2026',
    endLabel: '9 Nov 2026',
  });

const card = (s) => solvSchemeCard(s, { title: 'Mega Diwali Gifts', fmt: lakh, money: indianPrice });

const STATES = [
  {
    caption: 'SCHEDULED. Before 1 Oct. Announce the ladder, no meter yet.',
    card: card(at(0, Date.UTC(2026, 8, 20))),
  },
  {
    caption: 'LIVE. Window open, no slab crossed. The bar runs from ₹0 to the first gift.',
    card: card(at(0.4 * L, Date.UTC(2026, 9, 2))),
  },
  {
    caption: 'EARNED. A slab is crossed. The bar runs from the gift held to the gift next.',
    card: card(at(6.4 * L, Date.UTC(2026, 9, 19))),
  },
  {
    caption: 'NEAR SLAB. The gap is 20% or less of the slab step. The sentence turns red.',
    card: card(at(9.2 * L, Date.UTC(2026, 10, 3))),
  },
  {
    caption: 'TOP REACHED. The top slab is crossed. Nothing is left to win.',
    card: card(at(125 * L, Date.UTC(2026, 9, 25))),
  },
  {
    caption: 'ENDED PENDING. The window closed with a slab crossed. The order is not placed.',
    card: card(at(11.4 * L, Date.UTC(2026, 10, 12))),
  },
  {
    caption: 'GIFT ORDERED. The Amazon order is placed.',
    card: card(at(11.4 * L, Date.UTC(2026, 10, 14), { orderedAt: Date.UTC(2026, 10, 13) })),
  },
  {
    caption: 'DELIVERED. Terminal. The card moves to the Ended section.',
    card: card(at(11.4 * L, Date.UTC(2026, 10, 20), { orderedAt: Date.UTC(2026, 10, 13), deliveredAt: Date.UTC(2026, 10, 18) })),
  },
  {
    caption: 'ENDED MISSED. The window closed below the first slab. Terminal.',
    card: card(at(1.1 * L, Date.UTC(2026, 10, 12))),
  },
];

export default function CardStates() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.toolbar}>
        <Pressable onPress={() => router.back()} android_ripple={{ color: '#ffffff33', borderless: true }}>
          <IconBack size={24} color="#fff" />
        </Pressable>
        <Text style={styles.toolbarTitle} allowFontScaling={false}>Card states</Text>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {STATES.map((s) => (
          <View key={s.caption}>
            <Text style={styles.caption} allowFontScaling={false}>{s.caption}</Text>
            <View style={styles.cardHost}>
              <SchemeCard card={s.card} />
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: SOLV.bg },
  toolbar: { height: 48, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, backgroundColor: SOLV.blue },
  toolbarTitle: { marginLeft: 12, color: '#fff', fontFamily: F.medium, fontSize: 18, lineHeight: 22 },
  caption: { marginTop: 18, marginBottom: 6, marginHorizontal: 16, fontFamily: F.medium, fontSize: 11, lineHeight: 14, color: SOLV.sub },
  cardHost: { marginHorizontal: 16 },
});
