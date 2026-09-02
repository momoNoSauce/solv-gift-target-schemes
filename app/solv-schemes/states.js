// Scheme card states, start to end, then the same card in every theme.
// Grey captions name the state and its trigger; the cards are the design.
//
// Every card here is built by solvSchemeCard() from schemeState(), the same pair the
// My Schemes list uses. Hand-written strings would drift from the list within a week.
//
// Backend mapping (gift variant of target_scheme) lives in src/gifts/state.js.
// Themes live in src/gifts/themes.js; the scheme's theme key is set at creation.
import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconBack } from '../../src/icons';
import { F } from '../../src/theme';
import { SchemeCard, solvSchemeCard, SOLV } from '../../src/gifts/solv';
import { schemeState } from '../../src/gifts/state';
import { THEMES } from '../../src/gifts/themes';
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

const card = (s, theme = 'diwali', title = 'Mega Diwali Scheme') =>
  solvSchemeCard(s, { title, theme, fmt: lakh, money: indianPrice });

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
    caption: 'EARNED. A slab is crossed. The bar runs from the gift won to the gift next.',
    card: card(at(6.4 * L, Date.UTC(2026, 9, 19))),
  },
  {
    caption: 'NEAR SLAB. The gap is 20% or less of the slab step. The sentence turns urgent.',
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

// The same EARNED state rendered in every theme. A theme changes paint only:
// layout, copy and state stay identical.
const EARNED = at(6.4 * L, Date.UTC(2026, 9, 19));
const THEME_TITLES = {
  default: 'Solv Growth Scheme',
  diwali: 'Mega Diwali Scheme',
  onam: 'Onam Mega Scheme',
  holi: 'Holi Bumper Scheme',
};
const THEME_ROWS = Object.values(THEMES).map((th) => ({
  caption: `Theme "${th.key}". Set at scheme creation; unknown keys fall back to default.`,
  card: card(EARNED, th.key, THEME_TITLES[th.key] || 'Solv Growth Scheme'),
}));

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
        <Text style={styles.groupTitle} allowFontScaling={false}>Lifecycle, start to end</Text>
        {STATES.map((s) => (
          <View key={s.caption}>
            <Text style={styles.caption} allowFontScaling={false}>{s.caption}</Text>
            <View style={styles.cardHost}>
              <SchemeCard card={s.card} />
            </View>
          </View>
        ))}

        <Text style={[styles.groupTitle, { marginTop: 28 }]} allowFontScaling={false}>Themes, one per scheme</Text>
        {THEME_ROWS.map((s) => (
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
  groupTitle: { marginTop: 18, marginHorizontal: 16, fontFamily: F.bold, fontSize: 14, lineHeight: 18, color: SOLV.ink },
  caption: { marginTop: 14, marginBottom: 6, marginHorizontal: 16, fontFamily: F.medium, fontSize: 11, lineHeight: 14, color: SOLV.sub },
  cardHost: { marginHorizontal: 16 },
});
