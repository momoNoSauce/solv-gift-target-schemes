// Solv "My Schemes": the app's own list paradigm — blue toolbar, RUNNING and
// COMPLETED tabs, a swipeable pager — with one coherent card anatomy for every
// scheme. A festive scheme differs only by its header band (theme set at scheme
// creation, src/gifts/themes.js); every card body is the same white layout.
//
// Every card is built by solvSchemeCard() from schemeState(), including the
// single-slab trade schemes (a single-slab scheme is a one-tier ladder), so no
// card can drift from the state machine.
//
// The page has view scenarios (?view=) so every list state can be inspected:
//   typical   mid-season: three running schemes, two completed
//   start     season opening: one scheduled, one just live, nothing completed
//   over      after the festival closes: gift on the way, one missed
//   empty     no schemes for this member
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Animated } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconBack } from '../../src/icons';
import TabLabel from '../../src/components/TabLabel';
import { F } from '../../src/theme';
import GiftGlyph from '../../src/gifts/icons';
import { SchemeCard, solvSchemeCard, SOLV } from '../../src/gifts/solv';
import { schemeState } from '../../src/gifts/state';
import { LADDERS, lakh } from '../../src/gifts/data';
import { indianPrice } from '../../src/data';

const L = 100000;
const LIFESTYLE = LADDERS[0];
const IMG_MIXER = require('../../assets/gifts/mixer.jpg');
const IMG_KETTLE = require('../../assets/gifts/kettle.jpg');

// One-tier ladders for the trade schemes. Rewards carry real photos; the voucher
// renders as a voucher card (VoucherThumb), never as a line glyph.
const OIL_TIER = [{ at: 50000, name: 'NutriPro Juicer Mixer Grinder', shortName: 'Mixer', icon: 'mixer', image: IMG_MIXER }];
const KETTLE_TIER = [{ at: 40000, name: 'Pigeon Amaze Plus Electric Kettle', shortName: 'Kettle', icon: 'kettle', image: IMG_KETTLE }];
const VOUCHER_TIER = [{ at: 80000, name: '₹2,000 Solv voucher', shortName: '₹2,000 voucher', icon: 'voucher', voucher: '₹2,000' }];

const D = (m, d, y = 2026) => Date.UTC(y, m - 1, d);

function mk({ tiers, cur, start, end, now, fulfilment, startLabel, endLabel }) {
  return schemeState({ tiers, currentValue: cur, startTime: start, endTime: end, now, fulfilment, startLabel, endLabel });
}

// Card builders per scheme. `now` is the scenario's clock.
const diwali = (now, cur, fulfilment) =>
  solvSchemeCard(
    mk({ tiers: LIFESTYLE.tiers, cur, start: D(10, 1), end: D(11, 9), now, fulfilment, startLabel: '1 Oct 2026', endLabel: '9 Nov 2026' }),
    { title: 'Mega Diwali Scheme', theme: 'diwali', fmt: lakh, money: indianPrice }
  );

const oil = (now, cur, { start = D(9, 20), end = D(10, 28) } = {}) =>
  solvSchemeCard(
    mk({ tiers: OIL_TIER, cur, start, end, now, startLabel: '20 Sep 2026', endLabel: '28 Oct 2026' }),
    { title: 'Fortune Sunflower Oil Scheme', theme: 'default', fmt: indianPrice, money: indianPrice }
  );

const voucher = (now, cur, { end = D(11, 9) } = {}) =>
  solvSchemeCard(
    mk({ tiers: VOUCHER_TIER, cur, start: D(10, 1), end, now, startLabel: '1 Oct 2026', endLabel: '9 Nov 2026' }),
    { title: 'Britannia Diwali Stock-Up', theme: 'default', fmt: indianPrice, money: indianPrice }
  );

const onam = (now, fulfilment) =>
  solvSchemeCard(
    mk({ tiers: LIFESTYLE.tiers, cur: 7.1 * L, start: D(8, 15), end: D(9, 12), now, fulfilment, startLabel: '15 Aug 2026', endLabel: '12 Sep 2026' }),
    { title: 'Onam Mega Scheme', theme: 'onam', fmt: lakh, money: indianPrice }
  );

const kettleSept = (now) =>
  solvSchemeCard(
    mk({ tiers: KETTLE_TIER, cur: 47000, start: D(8, 20), end: D(9, 20), now, fulfilment: { orderedAt: D(9, 24), deliveredAt: D(10, 6) }, startLabel: '20 Aug 2026', endLabel: '20 Sep 2026' }),
    { title: 'Saffola September Scheme', theme: 'default', fmt: indianPrice, money: indianPrice }
  );

// The Mega Diwali card opens the detail page in the matching state and theme.
const open = (state) => `/mega-diwali?state=${state}&theme=diwali`;

const VIEWS = {
  typical: {
    label: 'Typical',
    running: [
      { card: diwali(D(10, 19), 6.4 * L), href: open('earned') },
      { card: oil(D(10, 19), 31200) },
      { card: voucher(D(10, 19), 16000) },
    ],
    completed: [
      { card: onam(D(10, 19), { orderedAt: D(9, 16), deliveredAt: D(9, 24) }) },
      { card: kettleSept(D(10, 19)) },
    ],
  },
  start: {
    label: 'Season start',
    running: [
      { card: diwali(D(9, 26), 0), href: open('scheduled') },
      { card: oil(D(9, 26), 0) },
    ],
    completed: [],
  },
  over: {
    label: 'Season over',
    running: [{ card: voucher(D(11, 14), 76000, { end: D(11, 20) }) }],
    completed: [
      { card: diwali(D(11, 14), 11.4 * L, { orderedAt: D(11, 12) }), href: open('ordered') },
      { card: oil(D(11, 14), 22000) },
      { card: kettleSept(D(11, 14)) },
    ],
  },
  empty: { label: 'Empty', running: [], completed: [] },
};

function Empty({ label }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyBadge}>
        <GiftGlyph kind="gift" size={30} color={SOLV.blue} strokeWidth={1.5} />
      </View>
      <Text style={styles.emptyTitle} allowFontScaling={false}>{label}</Text>
      <Text style={styles.emptyLine} allowFontScaling={false}>
        When a scheme starts for your shop, it shows here.
      </Text>
    </View>
  );
}

export default function SolvSchemes() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const viewKey = VIEWS[params.view] ? params.view : 'typical';
  const view = VIEWS[viewKey];

  const pager = useRef(null);
  const initialTab = Number(params.tab) === 1 ? 1 : 0;
  const [tab, setTab] = useState(initialTab);
  const [pageW, setPageW] = useState(0);
  // The tab indicator glides to the active tab with a spring. Programmatic
  // scrolls do not emit onScroll on RN-web, so the indicator tracks `tab`, which
  // both a tap (goToTab) and a swipe (onMomentumScrollEnd) update.
  const indA = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (pageW > 0) {
      Animated.spring(indA, { toValue: tab * (pageW / 2), speed: 16, bounciness: 4, useNativeDriver: false }).start();
    }
  }, [tab, pageW, indA]);
  const goToTab = (i) => {
    setTab(i);
    pager.current?.scrollTo({ x: i * pageW, animated: true });
  };

  // ?tab=1 deep-links the Completed tab; the pager can only honour it once measured.
  useEffect(() => {
    if (pageW > 0 && initialTab === 1) {
      pager.current?.scrollTo({ x: pageW, animated: false });
      indA.setValue(pageW / 2);
    }
  }, [pageW, initialTab]);

  // A view change re-renders the pager content; snap back to the Running tab.
  useEffect(() => {
    setTab(initialTab);
    pager.current?.scrollTo({ x: initialTab * pageW, animated: false });
  }, [viewKey]);

  const renderList = (rows, emptyLabel) => (
    <View style={{ width: pageW, flex: 1 }}>
      {rows.length === 0 ? (
        <Empty label={emptyLabel} />
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {rows.map(({ card, href }, i) => (
            <View key={card.title} style={{ marginBottom: 12 }}>
              <SchemeCard card={card} index={i} onPress={href ? () => router.push(href) : undefined} />
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.toolbar}>
        <Pressable
          onPress={() => router.back()}
          style={{ padding: 10, margin: -10 }}
          android_ripple={{ color: '#ffffff33', borderless: true }}
        >
          <IconBack size={24} color="#fff" />
        </Pressable>
        <Text style={styles.toolbarTitle} allowFontScaling={false}>My Schemes</Text>
      </View>
      <View style={styles.tabBar}>
        {['RUNNING', 'COMPLETED'].map((t, i) => (
          <Pressable key={t} style={styles.tab} onPress={() => goToTab(i)} android_ripple={{ color: '#ffffff26' }}>
            <TabLabel label={t} />
          </Pressable>
        ))}
        {pageW > 0 ? (
          <Animated.View
            style={[
              styles.indicator,
              {
                width: pageW / 2,
                transform: [{ translateX: indA }],
              },
            ]}
          />
        ) : null}
      </View>

      <ScrollView
        ref={pager}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onLayout={(e) => setPageW(e.nativeEvent.layout.width)}
        onMomentumScrollEnd={(e) => (pageW ? setTab(Math.round(e.nativeEvent.contentOffset.x / pageW)) : null)}
        style={{ flex: 1 }}
      >
        {renderList(view.running, 'No running schemes')}
        {renderList(view.completed, 'No completed schemes')}
      </ScrollView>

      {/* Prototype chrome: view scenarios and the states gallery. Not app UI. */}
      <View style={styles.demoBar}>
        <View style={styles.demoRow}>
          <Text style={styles.demoLabel} allowFontScaling={false}>View as:</Text>
          {Object.entries(VIEWS).map(([key, v]) => (
            <Pressable key={key} onPress={() => router.replace(`/solv-schemes?view=${key}`)} hitSlop={6}>
              <Text style={[styles.demoChip, viewKey === key && styles.demoChipActive]} allowFontScaling={false}>{v.label}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.demoRow}>
          <Pressable onPress={() => router.push('/solv-schemes/states')} hitSlop={6}>
            <Text style={styles.demoLink} allowFontScaling={false}>Card states and themes gallery</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/mega-diwali?state=earned&theme=diwali&demo=1')} hitSlop={6}>
            <Text style={styles.demoLink} allowFontScaling={false}>Detail states and themes</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: SOLV.bg },
  toolbar: { height: 48, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, backgroundColor: SOLV.blue },
  toolbarTitle: { marginLeft: 12, color: '#fff', fontFamily: F.medium, fontSize: 18, lineHeight: 22 },
  tabBar: { height: 44, backgroundColor: SOLV.blue, flexDirection: 'row' },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  indicator: { position: 'absolute', bottom: 0, left: 0, height: 3, borderTopLeftRadius: 2, borderTopRightRadius: 2, backgroundColor: '#fff' },

  list: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 20 },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, paddingBottom: 48 },
  emptyBadge: { width: 64, height: 64, borderRadius: 32, backgroundColor: SOLV.blueBg, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { marginTop: 14, fontFamily: F.bold, fontSize: 15, lineHeight: 19, color: SOLV.ink },
  emptyLine: { marginTop: 4, textAlign: 'center', fontFamily: F.regular, fontSize: 13, lineHeight: 18, color: SOLV.sub },

  demoBar: { borderTopWidth: 1, borderTopColor: SOLV.line, backgroundColor: '#fff', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 10, gap: 6 },
  demoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  demoLabel: { fontFamily: F.medium, fontSize: 11, lineHeight: 14, color: SOLV.sub },
  demoChip: { fontFamily: F.medium, fontSize: 12, lineHeight: 15, color: SOLV.sub },
  demoChipActive: { color: SOLV.blue, fontFamily: F.bold },
  demoLink: { fontFamily: F.medium, fontSize: 11, lineHeight: 14, color: SOLV.sub, textDecorationLine: 'underline' },
});
