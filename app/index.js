// layout_configurable_hamburger_menu.xml + viewholder_hamburger_menu_item.xml +
// MenuItemEnum.kt — the current nav drawer. The header is brand_green with the 52dp
// jumbotail mark, a bold welcome line, the store name and the membership row; each menu row
// is a 24dp remote icon (marginStart 24, marginEnd 16) beside a 14dp Medium label, with 12dp
// vertical padding. Icons and labels come from MenuItemEnum.
import React from 'react';
import { View, Text, Image, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, F } from '../src/theme';
import { REMOTE } from '../src/remoteAssets';
import { L12, L14, L16 } from '../src/textMetrics';

const MENU = [
  { key: 'orders', icon: REMOTE.hbMyOrders, label: 'My Orders' },
  { key: 'deliveries', icon: REMOTE.hbMyDeliveries, label: 'My Deliveries' },
  { key: 'payments', icon: REMOTE.hbMyPayments, label: 'My Payments' },
  { key: 'credit', icon: REMOTE.hbCredit, label: 'Credit' },
  { key: 'targets', icon: REMOTE.hbMyTargets, label: 'My Targets', href: '/targets' },
  { key: 'rewards', icon: REMOTE.hbMyRewards, label: 'My Rewards', href: '/rewards' },
  { key: 'jumbocash', icon: REMOTE.hbJumbocash, label: 'Jumbocash', href: '/jumbocash' },
  { key: 'superclub', icon: REMOTE.hbSuperclub, label: 'SuperClub', href: '/superclub' },
  { key: 'language', icon: REMOTE.hbLanguage, label: 'Language' },
  { key: 'profile', icon: REMOTE.hbMyProfile, label: 'My Profile' },
  { key: 'privacy', icon: REMOTE.hbPrivacy, label: 'Privacy Policy' },
];

// Screens and sheets that the drawer cannot reach in the app; listed by their own titles.
const OTHER = [
  ['Product details', '/targets/pdp-offer'],
  ['Your Cart Items', '/targets/cart'],
  ['Checkout', '/jumbocash/checkout'],
  ['Order Confirmed', '/rewards/order-confirmation'],
  ['Cashbacks', '/cashback'],
  ['Product listing', '/jumbocash/labels'],
  ['Jix quiz', '/coins/quiz'],
  ['Jix quiz, done for today', '/coins/quiz-disabled'],
  ['Jix survey', '/coins/survey'],
];

// Design flows for the Solv gift schemes (Mega Diwali). Two explorations:
// A fits the gift into the current target scheme UI; B is a new experience.
// Each flow starts at its scheme list, the way the customer reaches it. The scheme
// page opens from a card on that list:
//   A. /gift-targets     -> tap the card -> /gift-targets/[id]
//   B. /solv-schemes     -> tap the Mega Diwali card -> /mega-diwali
//                           -> /mega-diwali/stacked, /rules, /claim
//                        -> /solv-schemes/states
// The entry-point mocks stay a separate row because they sit outside both lists.
const GIFT_FLOWS = [
  ['SHIP view: Starter cohort, ₹1L to ₹5L', '/ship?cohort=starter'],
  ['SHIP view: Growth cohort, ₹2L to ₹10L', '/ship?cohort=growth'],
  ['SHIP view: Established cohort, ₹15L to ₹30L', '/ship?cohort=established'],
  ['SHIP view: Bumper cohort, ₹40L to ₹1.2Cr', '/ship?cohort=bumper'],
  ['SHIP: card states gallery, start to end', '/ship/states'],
  ['SHIP touchpoint: product page (PPV)', '/ship/ppv'],
  ['SHIP touchpoint: cart', '/ship/cart'],
  ['SHIP touchpoint: order confirmed', '/ship/order-confirmation'],
  ['SHIP touchpoint: order confirmed, slab crossed', '/ship/order-confirmation?win=1'],
  ['D. My Schemes: scheme pager with the dock (new direction)', '/schemes'],
  ['A. Gift scheme in the current paradigm', '/gift-targets'],
  ['B. Solv My Schemes, Mega Diwali and parallel schemes', '/solv-schemes'],
  ['C. Entry points (banner, PDP, cart, push, WhatsApp)', '/mega-diwali/entries'],
];

export default function Drawer() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView>
        <View style={styles.header}>
          <Image source={REMOTE.hamburgerLogo} style={styles.logo} resizeMode="contain" />
          <View style={styles.headerText}>
            <Text style={styles.welcome} allowFontScaling={false}>Welcome</Text>
            <Text style={styles.storeName} allowFontScaling={false}>Sri Lakshmi Stores</Text>
          </View>
          <View style={styles.membershipRow}>
            <Image source={REMOTE.goldLogo} style={styles.membershipIcon} resizeMode="contain" />
            <Text style={styles.prefixText} allowFontScaling={false}>valid till</Text>
            <Text style={styles.validityText} allowFontScaling={false}>11 May 2027</Text>
          </View>
        </View>

        {MENU.map((m) => (
          <Pressable
            key={m.key}
            style={styles.row}
            onPress={() => (m.href ? router.push(m.href) : null)}
            android_ripple={{ color: '#0000000d' }}
          >
            <Image source={m.icon} style={styles.icon} resizeMode="contain" />
            <Text style={styles.label} allowFontScaling={false}>{m.label}</Text>
          </Pressable>
        ))}

        <View style={styles.divider} />
        {OTHER.map(([label, href]) => (
          <Pressable key={href} style={styles.row} onPress={() => router.push(href)} android_ripple={{ color: '#0000000d' }}>
            <View style={styles.icon} />
            <Text style={styles.label} allowFontScaling={false}>{label}</Text>
          </Pressable>
        ))}

        <View style={styles.insideHeader}>
          <Text style={styles.insideTitle} allowFontScaling={false}>
            Solv gift schemes: design flows
          </Text>
        </View>
        {GIFT_FLOWS.map(([label, href]) => (
          <Pressable key={href} style={styles.row} onPress={() => router.push(href)} android_ripple={{ color: '#0000000d' }}>
            <View style={styles.icon} />
            <Text style={styles.label} allowFontScaling={false}>{label}</Text>
          </Pressable>
        ))}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.white },
  header: { backgroundColor: C.brandGreen, paddingBottom: 8 },
  logo: { width: 52, height: 52, margin: 16, marginEnd: 12 },
  headerText: { marginTop: 8, marginHorizontal: 16 },
  welcome: { color: C.white, fontSize: 16, lineHeight: L16, fontFamily: F.bold },
  storeName: { marginTop: 2, color: C.white, fontSize: 14, lineHeight: L14, fontFamily: F.regular },
  membershipRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginHorizontal: 16, paddingBottom: 4 },
  membershipIcon: { width: 56, height: 20 },
  prefixText: { marginLeft: 4, color: C.white, fontSize: 12, lineHeight: L12, fontFamily: F.regular },
  validityText: { marginLeft: 4, color: C.white, fontSize: 14, lineHeight: L14, fontFamily: F.bold },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  icon: { width: 24, height: 24, marginLeft: 24, marginRight: 16 },
  label: { marginRight: 16, color: C.black, fontSize: 14, lineHeight: L14, fontFamily: F.medium },
  insideHeader: { paddingTop: 16, paddingBottom: 4, paddingHorizontal: 24, borderTopWidth: 1, borderTopColor: C.greyishWhite, marginTop: 8 },
});
