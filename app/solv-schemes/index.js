// Solv "My Schemes": several schemes run in parallel, each as one card.
// Reference (Mobbin, Aug 2026): Grab Challenges (Current/Past tabs, days-left per
// card), Wolt Rewards (row anatomy: icon, one condition line, reward, slim bar).
//
// The screen is Solv app chrome (blue). Only the Mega Diwali card wears the
// festival skin; regular schemes wear the default skin. Scheme types shown:
//   - Festival gift ladder (Mega Diwali): campaign skin, gift photos, several slabs.
//   - Single-gift trade scheme (oil): the commonest slab-scheme shape, 1 slab.
//   - Brand-funded voucher scheme: the payout is a Solv voucher, not a gift.
//   - An ended scheme, terminal state, in the Ended section.
//
// The Mega Diwali card is built from schemeState(), the same derivation the My Targets
// cards use, so the two flows cannot report different gifts for the same member.
// Single-slab schemes have no ladder, so their leg runs from ₹0 to the one slab.
import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconBack } from '../../src/icons';
import { F } from '../../src/theme';
import { SchemeCard, solvSchemeCard, SOLV } from '../../src/gifts/solv';
import { schemeState } from '../../src/gifts/state';
import { LADDERS, lakh, NOW } from '../../src/gifts/data';
import { indianPrice } from '../../src/data';

const LIFESTYLE = LADDERS[0];

// The Mega Diwali member state, read once and rendered by the card.
const diwali = schemeState({
  tiers: LIFESTYLE.tiers,
  currentValue: LIFESTYLE.currentValue,
  startTime: Date.UTC(2026, 9, 1),
  endTime: Date.UTC(2026, 10, 9),
  now: NOW,
});

const diwaliCard = solvSchemeCard(diwali, {
  title: 'Mega Diwali Gifts',
  fmt: lakh,
  money: indianPrice,
});

// A single-slab scheme: nothing is secured until the one slab is crossed, so the leg
// runs from zero and the left thumb shows the reward the customer is working towards.
function singleSlab({ title, rewardName, rewardShort, icon, target, current, days, tone = 'accent' }) {
  return {
    skin: 'light',
    title,
    held: null,
    reward: { name: rewardName, short: rewardShort, icon },
    line: `${indianPrice(target - current)} more and the ${rewardShort.toLowerCase()} is yours`,
    lineTone: tone,
    chip: { text: `${days} DAYS LEFT` },
    leg: { from: 0, to: target, current, fmt: indianPrice },
  };
}

const RUNNING = [
  diwaliCard,
  singleSlab({
    title: 'Sunflower Oil Scheme',
    rewardName: 'Steel dinner set, 24 pieces',
    rewardShort: 'Dinner set',
    icon: 'dinnerset',
    target: 50000,
    current: 31200,
    days: 9,
  }),
  singleSlab({
    title: 'Britannia Diwali Scheme',
    rewardName: '₹2,000 Solv voucher',
    rewardShort: '₹2,000 voucher',
    icon: 'voucher',
    target: 80000,
    current: 16000,
    days: 21,
  }),
];

const ENDED = [
  {
    skin: 'light',
    dim: true,
    title: 'September Oil Scheme',
    held: { name: 'Steel dinner set, 24 pieces', short: 'Dinner set', icon: 'dinnerset' },
    reward: { name: 'Steel dinner set, 24 pieces', short: 'Dinner set', icon: 'dinnerset' },
    line: 'Delivered on 6 Oct',
    lineTone: 'good',
    chip: { text: 'DONE', tone: 'good' },
  },
];

export default function SolvSchemes() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.toolbar}>
        <Pressable onPress={() => router.back()} android_ripple={{ color: '#ffffff33', borderless: true }}>
          <IconBack size={24} color="#fff" />
        </Pressable>
        <Text style={styles.toolbarTitle} allowFontScaling={false}>My Schemes</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <Text style={styles.section} allowFontScaling={false}>RUNNING</Text>
        {RUNNING.map((c) => (
          <View key={c.title} style={styles.cardHost}>
            <SchemeCard card={c} onPress={c.title === 'Mega Diwali Gifts' ? () => router.push('/mega-diwali') : undefined} />
          </View>
        ))}

        <Text style={styles.section} allowFontScaling={false}>ENDED</Text>
        {ENDED.map((c) => (
          <View key={c.title} style={styles.cardHost}>
            <SchemeCard card={c} />
          </View>
        ))}

        <Pressable style={styles.protoLink} onPress={() => router.push('/solv-schemes/states')}>
          <Text style={styles.protoText} allowFontScaling={false}>Prototype: card states, start to end</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: SOLV.bg },
  toolbar: { height: 48, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, backgroundColor: SOLV.blue },
  toolbarTitle: { marginLeft: 12, color: '#fff', fontFamily: F.medium, fontSize: 18, lineHeight: 22 },
  section: { marginTop: 18, marginBottom: 8, marginHorizontal: 16, fontFamily: F.bold, fontSize: 11, lineHeight: 14, color: SOLV.sub },
  cardHost: { marginHorizontal: 16, marginBottom: 10 },
  protoLink: { marginTop: 16, alignItems: 'center' },
  protoText: { fontFamily: F.medium, fontSize: 12, lineHeight: 15, color: SOLV.sub, textDecorationLine: 'underline' },
});
