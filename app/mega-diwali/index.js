// Flow B: the scheme detail page.
//
// Reference-grounded (Mobbin, Aug 2026): Shopee Lucky Prize (prize on a lit
// pedestal in a dark room), Grab VIP (the hero is one giant sentence), Shopee
// Member (the next tier sits on the end of the progress bar), Temu (rules behind
// a link), foodpanda Kongsi Rezeki (one headline, days-left urgency).
//
// Structure of the stage, top to bottom:
//   1. The hero: the largest object is the gift the customer WON (label "YOU WON").
//      Certainty first: retailers doubt that schemes pay out, and the won gift is
//      the one fact that cannot be taken away. Before the first slab the hero is
//      the FIRST gift on a dashed tile: the goal, marked as not yet won.
//   2. The action cluster: the bar, the next gift on the bar's end, the slab
//      values, and the "₹X more" line DIRECTLY UNDER the bar. Proximity groups
//      the amount with the next gift it buys, not with the won gift above.
//   3. The close: one CTA into the eligible catalog.
//
// The page renders every lifecycle state from schemeState() (?state=...), in any
// theme from src/gifts/themes.js (?theme=..., set at scheme creation). The ended
// states carry the delivery stepper and the shop address inline.
//
// Language: the audience is Hindi-first, so every string lives in the T map in
// both languages and the layout must survive translation. The app picks the
// language from the account setting; no toggle renders on this page.
//
// Prototype controls are hidden: LONG-PRESS THE SCHEME TITLE to open the state
// and theme panel. ?state= and ?theme= in the URL work as well.
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, Pressable, ScrollView, StyleSheet, Animated, Easing } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, RadialGradient, Stop, Rect, Ellipse } from 'react-native-svg';
import { F } from '../../src/theme';
import { IconBack } from '../../src/icons';
import GiftGlyph from '../../src/gifts/icons';
import { LADDERS, lakh } from '../../src/gifts/data';
import { schemeState, STATE } from '../../src/gifts/state';
import { themeOf, THEMES } from '../../src/gifts/themes';
import { RIMG } from '../../src/rewards/assets';
import { indianPrice } from '../../src/data';

const N = {
  ink: '#1A1A1A',
  sub: '#6B6B6B',
  line: '#ECECEC',
  paper: '#FFFFFF',
  bg: '#F7F7F7',
  green: '#1E8E3E',
};

const L = 100000;
const LIFESTYLE = LADDERS[0];
const D = (m, d, y = 2026) => Date.UTC(y, m - 1, d);
const START = D(10, 1);
const END = D(11, 9);

// Lifecycle scenarios: value bought + the clock. The page derives everything else.
const SCEN = {
  scheduled: { v: 0, now: D(9, 20) },
  live: { v: 0.4 * L, now: D(10, 2) },
  earned: { v: 6.4 * L, now: D(10, 19) },
  near: { v: 9.2 * L, now: D(11, 3) },
  top: { v: 125 * L, now: D(10, 25) },
  missed: { v: 1.1 * L, now: D(11, 12) },
  pending: { v: 11.4 * L, now: D(11, 12) },
  ordered: { v: 11.4 * L, now: D(11, 14), f: { orderedAt: D(11, 13) } },
  delivered: { v: 11.4 * L, now: D(11, 20), f: { orderedAt: D(11, 13), deliveredAt: D(11, 18) } },
};
const SCEN_LABELS = {
  scheduled: 'Scheduled', live: 'Live', earned: 'Earned', near: 'Near slab', top: 'Top reached',
  missed: 'Missed', pending: 'Pending', ordered: 'Ordered', delivered: 'Delivered',
};

// The scheme's name is scheme data, not theme data; the map below only feeds the
// theme demo so a repainted page does not say "Diwali" in Onam colors.
const DEMO_TITLES = { default: 'Solv Growth Scheme', diwali: 'Mega Diwali Scheme', onam: 'Onam Mega Scheme', holi: 'Holi Bumper Scheme' };

const DELIVER_BY = '21 Nov 2026';
const ADDRESS = { shop: 'Sri Lakshmi Stores', line: '12, Gandhi Bazaar Main Road, Basavanagudi, Bengaluru 560004' };
const ORDER_NO = 'Amazon order 408-5561234-7789045';

// Slab labels the trade way: ₹2L … ₹40L, then ₹1.2Cr.
const slab = (v) => lakh(v);

// UI strings, both languages. Product and brand names stay Latin.
const T = {
  en: {
    rules: 'Rules',
    langToggle: 'हिंदी',
    startsLine: (d) => `Starts ${d}`,
    endsLine: (d, days) => `Ends ${d} • `,
    daysLeft: (days) => `${days} days left`,
    endedLine: (d) => `Ended ${d}`,
    youWon: 'YOU WON',
    firstGift: 'FIRST GIFT',
    topGift: 'TOP GIFT',
    wonTop: 'YOU WON THE TOP GIFT',
    more: (amt) => `${amt} more`,
    onlyLeft: (amt) => `Only ${amt} left`,
    rest: (next, cur) => (cur ? `and the ${next} is yours instead` : `and the ${next} is yours`),
    bought: (amt, ladder) => `Bought so far: ${amt} • ${ladder} products`,
    cta: (ladder) => `Shop ${ladder} products`,
    ctaEnded: 'See running schemes',
    startsNote: (d, ladder) => `Buy ${ladder} products from ${d}. The highest slab you cross is your gift.`,
    topNote: (d) => `Nothing is left to win. We order your gift after ${d}.`,
    missedTitle: 'The scheme ended',
    missedNote: 'No slab was crossed this time. New schemes show in My Schemes.',
    pendingNote: 'We place your Amazon order in a few days.',
    orderedNote: (by) => `On the way to your shop. Arrives by ${by}.`,
    deliveredNote: (d) => `Delivered to your shop on ${d}.`,
    giftList: 'GIFT LIST',
    next: 'next',
    steps: ['Won', 'Ordered', 'On the way', 'Delivered'],
    shipsHere: 'Your gift ships here',
    confirm: 'Confirm address',
    change: 'Change',
    confirmed: 'Address confirmed',
    facts: (ladder, deliverBy) => [
      ['gift', 'One gift per shop: the highest slab you cross'],
      ['check', `Only ${ladder} products count`],
      ['truck', `Amazon delivers to your shop by ${deliverBy}`],
    ],
  },
  hi: {
    rules: 'नियम',
    langToggle: 'English',
    startsLine: (d) => `${d} से शुरू`,
    endsLine: (d) => `${d} तक • `,
    daysLeft: (days) => `${days} दिन बाक़ी`,
    endedLine: (d) => `${d} को ख़त्म`,
    youWon: 'आपने जीता',
    firstGift: 'पहला गिफ़्ट',
    topGift: 'टॉप गिफ़्ट',
    wonTop: 'आपने टॉप गिफ़्ट जीता',
    more: (amt) => `${amt} और चाहिए`,
    onlyLeft: (amt) => `सिर्फ़ ${amt} और`,
    rest: (next, cur) => (cur ? `फिर ${next} मिलेगा, ${cur} की जगह` : `फिर ${next} आपका`),
    bought: (amt, ladder) => `अब तक की ख़रीदारी: ${amt} • ${ladder}`,
    cta: (ladder) => `${ladder} प्रोडक्ट ख़रीदें`,
    ctaEnded: 'चल रही स्कीमें देखें',
    startsNote: (d, ladder) => `${d} से ${ladder} प्रोडक्ट ख़रीदें। जो सबसे ऊँचा स्लैब पार करें, वही गिफ़्ट आपका।`,
    topNote: (d) => `जीतने को और कुछ नहीं बचा। ${d} के बाद हम आपका ऑर्डर करेंगे।`,
    missedTitle: 'स्कीम ख़त्म हो गई',
    missedNote: 'इस बार कोई स्लैब पार नहीं हुआ। नई स्कीमें My Schemes में दिखेंगी।',
    pendingNote: 'कुछ दिनों में हम आपका Amazon ऑर्डर करेंगे।',
    orderedNote: (by) => `आपकी दुकान की ओर रवाना। ${by} तक पहुँचेगा।`,
    deliveredNote: (d) => `${d} को आपकी दुकान पर डिलीवर हुआ।`,
    giftList: 'गिफ़्ट लिस्ट',
    next: 'अगला',
    steps: ['जीता', 'ऑर्डर हुआ', 'रास्ते में', 'डिलीवर'],
    shipsHere: 'आपका गिफ़्ट यहाँ आएगा',
    confirm: 'पता सही है',
    change: 'बदलें',
    confirmed: 'पता कन्फ़र्म हो गया',
    facts: (ladder, deliverBy) => [
      ['gift', '1 दुकान, 1 गिफ़्ट: जो सबसे ऊँचा स्लैब पार करें'],
      ['check', `सिर्फ़ ${ladder} प्रोडक्ट गिने जाएँगे`],
      ['truck', `Amazon से डिलीवरी, ${deliverBy} तक`],
    ],
  },
};

// Delivery stepper per ended state.
function stepsFor(state) {
  if (state === STATE.ENDED_PENDING) return ['done', 'now', 'todo', 'todo'];
  if (state === STATE.GIFT_ORDERED) return ['done', 'done', 'now', 'todo'];
  return ['done', 'done', 'done', 'done'];
}
const STEP_DATES = {
  [STATE.ENDED_PENDING]: ['10 Nov', '', '', ''],
  [STATE.GIFT_ORDERED]: ['10 Nov', '12 Nov', 'by 21 Nov', ''],
  [STATE.DELIVERED]: ['10 Nov', '12 Nov', '', '18 Nov'],
};

export default function SchemeDetail() {
  const router = useRouter();
  const params = useLocalSearchParams();
  // The account's language; the prototype renders English. T.hi proves the fit.
  const t = T.en;
  const [addressConfirmed, setAddressConfirmed] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);

  const stateKey = SCEN[params.state] ? params.state : 'earned';
  const scen = SCEN[stateKey];
  const th = themeOf(params.theme || 'diwali');
  const st = th.stage;
  const title = DEMO_TITLES[th.key] || DEMO_TITLES.diwali;
  const festive = Boolean(th.motif);

  const s = schemeState({
    tiers: LIFESTYLE.tiers,
    currentValue: scen.v,
    startTime: START,
    endTime: END,
    now: scen.now,
    fulfilment: scen.f || {},
    startLabel: '1 Oct 2026',
    endLabel: '9 Nov 2026',
  });

  const running = s.started && !s.ended;
  const withDelivery = s.state === STATE.ENDED_PENDING || s.state === STATE.GIFT_ORDERED || s.state === STATE.DELIVERED;
  const missed = s.state === STATE.ENDED_MISSED;

  // The hero: the won gift once one exists; the first gift (dashed) before that;
  // the top gift while the scheme is only announced.
  const hero = missed
    ? null
    : s.state === STATE.SCHEDULED
    ? { gift: s.top, label: t.topGift, dashed: false }
    : !s.earned
    ? { gift: s.next, label: t.firstGift, dashed: true }
    : { gift: s.secured, label: s.state === STATE.TOP_REACHED ? t.wonTop : t.youWon, dashed: false };

  const showBar = running && s.next;
  const prevAt = s.secured ? s.secured.at : 0;
  const localPct = s.next ? Math.min(100, Math.round(((s.currentValue - prevAt) / (s.next.at - prevAt)) * 100)) : 100;

  // The one line under the hero for the states with no bar.
  const heroNote =
    s.state === STATE.SCHEDULED ? t.startsNote(s.startLabel, LIFESTYLE.label)
    : s.state === STATE.TOP_REACHED ? t.topNote(s.endLabel)
    : s.state === STATE.ENDED_PENDING ? t.pendingNote
    : s.state === STATE.GIFT_ORDERED ? t.orderedNote(DELIVER_BY)
    : s.state === STATE.DELIVERED ? t.deliveredNote('18 Nov')
    : null;

  // Entrance motion, re-run when the scenario changes.
  const tileAnim = useRef(new Animated.Value(0)).current;
  const barAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    tileAnim.setValue(0);
    barAnim.setValue(0);
    Animated.spring(tileAnim, { toValue: 1, friction: 6, tension: 50, useNativeDriver: true }).start();
    Animated.timing(barAnim, { toValue: 1, duration: 900, delay: 450, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [stateKey, th.key, tileAnim, barAnim]);
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(sparkleAnim, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, [sparkleAnim]);
  const sparkleOpacity = sparkleAnim.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] });

  const h2 = s.state === STATE.SCHEDULED
    ? <Text style={[styles.h2, { color: st.sub }]} allowFontScaling={false}>{t.startsLine(s.startLabel)}</Text>
    : s.ended
    ? <Text style={[styles.h2, { color: st.sub }]} allowFontScaling={false}>{t.endedLine(s.endLabel)}</Text>
    : (
      <Text style={[styles.h2, { color: st.sub }]} allowFontScaling={false}>
        {t.endsLine(s.endLabel)}
        <Text style={{ color: st.accent, fontFamily: F.medium }} allowFontScaling={false}>{t.daysLeft(s.daysLeft)}</Text>
      </Text>
    );

  const stepStates = withDelivery ? stepsFor(s.state) : null;
  const stepDates = withDelivery ? STEP_DATES[s.state] : null;

  // Delight: a short confetti burst greets a page that holds a won gift. It plays
  // once and stops; a loop would turn celebration into noise.
  const celebrate = s.earned && !s.ended;
  const [confetti, setConfetti] = useState(false);
  useEffect(() => {
    if (celebrate) {
      setConfetti(true);
      const id = setTimeout(() => setConfetti(false), 4500);
      return () => clearTimeout(id);
    }
    setConfetti(false);
  }, [stateKey, celebrate]);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView>
        {/* ——— The stage ——— */}
        <LinearGradient colors={st.grad} start={{ x: 0, y: 0 }} end={{ x: 0.8, y: 1 }} style={styles.stage}>
          <View style={styles.topBar}>
            <Pressable onPress={() => router.back()} android_ripple={{ color: '#ffffff33', borderless: true }}>
              <IconBack size={24} color="#fff" />
            </Pressable>
          </View>

          {/* Long-press the title for the prototype's state/theme panel. */}
          <Pressable onLongPress={() => setDemoOpen((v) => !v)} delayLongPress={450}>
            <View style={styles.titleRow}>
              {th.motif ? <GiftGlyph kind={th.motif} size={22} color={st.accent} strokeWidth={1.5} /> : null}
              <Text style={[styles.h1, { color: st.ink }]} allowFontScaling={false}>{title}</Text>
            </View>
            {h2}
          </Pressable>

          {missed ? (
            <View style={styles.missedBlock}>
              <Text style={[styles.missedTitle, { color: st.ink }]} allowFontScaling={false}>{t.missedTitle}</Text>
              <Text style={[styles.missedNote, { color: st.sub }]} allowFontScaling={false}>{t.missedNote}</Text>
              <Pressable
                style={({ pressed }) => [styles.cta, { backgroundColor: st.accent }, pressed && styles.ctaPressed]}
                android_ripple={{ color: '#00000022' }}
                onPress={() => router.push('/solv-schemes')}
              >
                <Text style={[styles.ctaText, { color: st.accentInk }]} allowFontScaling={false}>{t.ctaEnded}</Text>
              </Pressable>
            </View>
          ) : (
            <>
              {/* The hero pedestal */}
              <View style={styles.pedestal}>
                {festive ? (
                  <Svg width={320} height={250} style={StyleSheet.absoluteFill}>
                    <Defs>
                      <RadialGradient id="glow" cx="50%" cy="52%" r="52%">
                        <Stop offset="0%" stopColor={st.accent} stopOpacity="0.42" />
                        <Stop offset="60%" stopColor={st.accent} stopOpacity="0.12" />
                        <Stop offset="100%" stopColor={st.accent} stopOpacity="0" />
                      </RadialGradient>
                    </Defs>
                    <Rect x="0" y="0" width="320" height="250" fill="url(#glow)" />
                    <Ellipse cx="160" cy="232" rx="78" ry="10" fill="#000" opacity="0.35" />
                  </Svg>
                ) : null}
                {festive ? (
                  <>
                    <Animated.View style={[styles.sparkleL, { opacity: sparkleOpacity }]}>
                      <GiftGlyph kind="sparkle" size={16} color={st.accent} />
                    </Animated.View>
                    <Animated.View style={[styles.sparkleR, { opacity: sparkleOpacity }]}>
                      <GiftGlyph kind="sparkle" size={12} color={st.accent} />
                    </Animated.View>
                  </>
                ) : null}
                <Text style={[styles.heroLabel, { color: st.accent }]} allowFontScaling={false}>{hero.label}</Text>
                <Animated.View
                  style={[
                    styles.tile,
                    hero.dashed && [styles.tileNotYet, { borderColor: st.accent }],
                    { opacity: tileAnim, transform: [{ scale: tileAnim.interpolate({ inputRange: [0, 1], outputRange: [0.82, 1] }) }] },
                  ]}
                >
                  {hero.gift.image ? (
                    <Image source={hero.gift.image} style={styles.tileImg} resizeMode="contain" />
                  ) : (
                    <GiftGlyph kind={hero.gift.icon} size={80} color={st.accentDeep} strokeWidth={1.2} />
                  )}
                </Animated.View>
              </View>
              <Text style={[styles.giftName, { color: st.ink }]} allowFontScaling={false}>{hero.gift.name}</Text>

              {showBar ? (
                <>
                  {/* The action cluster: bar, next gift on its end, slab values, and the
                      amount UNDER the bar so it groups with the next gift, not the hero. */}
                  <View style={styles.barZone}>
                    <View style={[styles.barTrack, { backgroundColor: st.track }]}>
                      <Animated.View
                        style={[
                          styles.barFill,
                          { backgroundColor: st.accent, width: barAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', `${localPct}%`] }) },
                        ]}
                      />
                    </View>
                    <View style={[styles.barGift, { borderColor: st.accent }]}>
                      {s.next.image ? (
                        <Image source={s.next.image} style={{ width: 34, height: 34 }} resizeMode="contain" />
                      ) : (
                        <GiftGlyph kind={s.next.icon} size={24} color={st.accentDeep} strokeWidth={1.6} />
                      )}
                    </View>
                  </View>
                  <View style={styles.barEnds}>
                    <Text style={[styles.barEnd, { color: st.sub }]} allowFontScaling={false}>{slab(prevAt)}</Text>
                    <Text style={[styles.barEnd, { color: st.sub }]} allowFontScaling={false}>{slab(s.next.at)}</Text>
                  </View>

                  <Text style={[styles.bigMore, { color: s.nearSlab ? st.urgent : st.accent }]} allowFontScaling={false}>
                    {s.nearSlab ? t.onlyLeft(indianPrice(s.remaining)) : t.more(indianPrice(s.remaining))}
                  </Text>
                  <Text style={[styles.bigRest, { color: st.sub }]} allowFontScaling={false}>
                    {t.rest(s.next.shortName, s.secured ? s.secured.shortName : null)}
                  </Text>

                  <Text style={[styles.bought, { color: st.sub }]} allowFontScaling={false}>
                    {t.bought(indianPrice(s.currentValue), LIFESTYLE.label)}
                  </Text>

                  {/* The close: into the eligible catalog */}
                  <Pressable
                    style={({ pressed }) => [
                      styles.cta,
                      { backgroundColor: st.accent, shadowColor: st.accent },
                      styles.ctaGlow,
                      pressed && styles.ctaPressed,
                    ]}
                    android_ripple={{ color: '#00000022' }}
                  >
                    <Text style={[styles.ctaText, { color: st.accentInk }]} allowFontScaling={false}>{t.cta(LIFESTYLE.label)}</Text>
                  </Pressable>
                </>
              ) : heroNote ? (
                <Text style={[styles.heroNote, { color: st.sub }]} allowFontScaling={false}>{heroNote}</Text>
              ) : null}
            </>
          )}
        </LinearGradient>

        {/* ——— Delivery, for the ended-with-win states ——— */}
        {withDelivery ? (
          <>
            <View style={styles.card}>
              <View style={styles.stepper}>
                {t.steps.map((label, i) => (
                  <React.Fragment key={label}>
                    {i > 0 ? (
                      <View style={[styles.connector, stepStates[i] !== 'todo' && styles.connectorDone]} />
                    ) : null}
                    <View style={styles.step}>
                      <View
                        style={[
                          styles.stepDot,
                          stepStates[i] === 'done' && styles.stepDone,
                          stepStates[i] === 'now' && [styles.stepNow, { borderColor: st.accentDeep }],
                        ]}
                      >
                        <GiftGlyph
                          kind={['check', 'gift', 'truck', 'check'][i]}
                          size={15}
                          color={stepStates[i] === 'done' ? '#fff' : stepStates[i] === 'now' ? st.accentDeep : '#C9C9C9'}
                          strokeWidth={2}
                        />
                      </View>
                      <Text style={[styles.stepTitle, stepStates[i] === 'todo' && { color: '#B5B5B5' }]} allowFontScaling={false}>
                        {label}
                      </Text>
                      {stepDates[i] ? <Text style={styles.stepDate} allowFontScaling={false}>{stepDates[i]}</Text> : null}
                    </View>
                  </React.Fragment>
                ))}
              </View>
              {s.state !== STATE.ENDED_PENDING ? (
                <Text style={styles.orderNo} allowFontScaling={false}>{ORDER_NO}</Text>
              ) : null}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle} allowFontScaling={false}>{t.shipsHere}</Text>
              <Text style={styles.shopName} allowFontScaling={false}>{ADDRESS.shop}</Text>
              <Text style={styles.addressLine} allowFontScaling={false}>{ADDRESS.line}</Text>
              {s.state === STATE.DELIVERED ? null : addressConfirmed ? (
                <View style={styles.confirmedRow}>
                  <GiftGlyph kind="check" size={18} color={N.green} strokeWidth={1.8} />
                  <Text style={styles.confirmedText} allowFontScaling={false}>{t.confirmed}</Text>
                </View>
              ) : (
                <View style={styles.addressActions}>
                  <Pressable style={[styles.confirmBtn, { backgroundColor: st.grad[0] }]} onPress={() => setAddressConfirmed(true)} android_ripple={{ color: '#ffffff33' }}>
                    <Text style={styles.confirmBtnText} allowFontScaling={false}>{t.confirm}</Text>
                  </Pressable>
                  <Pressable style={styles.changeBtn}>
                    <Text style={[styles.changeBtnText, { color: st.accentDeep }]} allowFontScaling={false}>{t.change}</Text>
                  </Pressable>
                </View>
              )}
            </View>
          </>
        ) : null}

        {/* ——— The gift list ——— */}
        <Text style={styles.listLabel} allowFontScaling={false}>{t.giftList}</Text>
        <View style={[styles.list, missed && { opacity: 0.6 }]}>
          {s.ladder.map((tier, i) => {
            const isTop = tier.at === s.top.at;
            const isWon = s.secured && tier.at === s.secured.at;
            const isPassed = s.secured && tier.at < s.secured.at;
            const isNext = running && s.next && tier.at === s.next.at;

            if (isTop && !isWon) {
              return (
                <LinearGradient
                  key={tier.at}
                  colors={st.grad}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.topCard}
                >
                  <View style={styles.topLabelRow}>
                    {festive ? <GiftGlyph kind="sparkle" size={14} color={st.accent} /> : null}
                    <Text style={[styles.topLabel, { color: st.accent }]} allowFontScaling={false}>{t.topGift}</Text>
                    {festive ? <GiftGlyph kind="sparkle" size={14} color={st.accent} /> : null}
                  </View>
                  <View style={styles.topStage}>
                    {tier.image ? (
                      <Image source={tier.image} style={styles.topImage} resizeMode="contain" />
                    ) : (
                      <GiftGlyph kind={tier.icon} size={64} color={st.accentDeep} strokeWidth={1.3} />
                    )}
                  </View>
                  <Text style={[styles.topName, { color: st.ink }]} allowFontScaling={false}>{tier.name}</Text>
                  <Text style={[styles.topAt, { color: st.accent }]} allowFontScaling={false}>{slab(tier.at)}</Text>
                </LinearGradient>
              );
            }

            return (
              <View key={tier.at} style={[styles.row, i > 0 && styles.rowDivider, isPassed && { opacity: 0.35 }]}>
                <Text style={[styles.rowAt, isNext && { color: st.accentDeep }]} allowFontScaling={false}>
                  {slab(tier.at)}
                </Text>
                <View style={styles.rowThumb}>
                  {tier.image ? (
                    <Image source={tier.image} style={{ width: 40, height: 40 }} resizeMode="contain" />
                  ) : (
                    <GiftGlyph kind={tier.icon} size={26} color={N.sub} strokeWidth={1.6} />
                  )}
                </View>
                <Text style={styles.rowName} numberOfLines={2} allowFontScaling={false}>{tier.name}</Text>
                {isWon ? (
                  // The list card is white, so the chip wears the CARD accent tokens:
                  // the stage accent can be white (default theme) and would vanish here.
                  <View style={[styles.wonChip, { backgroundColor: th.card.accent }]}>
                    <Text style={[styles.wonChipText, { color: th.card.accentInk }]} allowFontScaling={false}>{t.youWon}</Text>
                  </View>
                ) : isNext ? (
                  <Text style={[styles.nextText, { color: st.accentDeep }]} allowFontScaling={false}>{t.next}</Text>
                ) : null}
              </View>
            );
          })}
        </View>

        {/* Three facts. The whole rulebook on this page. */}
        {!s.ended ? (
          <View style={styles.facts}>
            {t.facts(LIFESTYLE.label, DELIVER_BY).map(([icon, text], i) => (
              <View key={icon} style={[styles.factRow, i > 0 && styles.rowDivider]}>
                <GiftGlyph kind={icon} size={18} color={N.sub} strokeWidth={1.6} />
                <Text style={styles.factText} allowFontScaling={false}>{text}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={{ height: 20 }} />
      </ScrollView>

      {confetti ? (
        <View style={styles.confetti} pointerEvents="none">
          <LottieView source={RIMG.ribbon} autoPlay loop={false} style={{ flex: 1 }} />
        </View>
      ) : null}

      {/* Prototype panel, hidden behind a long-press on the scheme title. */}
      {demoOpen ? (
        <View style={styles.demoBar}>
          <View style={styles.demoRow}>
            <Text style={styles.demoLabel} allowFontScaling={false}>State:</Text>
            {Object.keys(SCEN).map((k) => (
              <Pressable key={k} onPress={() => router.replace(`/mega-diwali?state=${k}&theme=${th.key}`)} hitSlop={6}>
                <Text style={[styles.demoChip, stateKey === k && styles.demoChipActive]} allowFontScaling={false}>
                  {SCEN_LABELS[k]}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.demoRow}>
            <Text style={styles.demoLabel} allowFontScaling={false}>Theme:</Text>
            {Object.values(THEMES).map((tm) => (
              <Pressable key={tm.key} onPress={() => router.replace(`/mega-diwali?state=${stateKey}&theme=${tm.key}`)} hitSlop={6}>
                <Text style={[styles.demoChip, th.key === tm.key && styles.demoChipActive]} allowFontScaling={false}>
                  {tm.label}
                </Text>
              </Pressable>
            ))}
            <Pressable onPress={() => router.push('/mega-diwali/entries')} hitSlop={6}>
              <Text style={styles.demoLink} allowFontScaling={false}>Entry points</Text>
            </Pressable>
            <Pressable onPress={() => setDemoOpen(false)} hitSlop={6}>
              <Text style={styles.demoLink} allowFontScaling={false}>Hide</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: N.bg },

  stage: { paddingBottom: 24 },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 14 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 },
  h1: { fontFamily: F.bold, fontSize: 21, lineHeight: 26 },
  h2: { marginTop: 3, textAlign: 'center', fontFamily: F.regular, fontSize: 13, lineHeight: 17 },

  pedestal: { height: 250, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  sparkleL: { position: 'absolute', left: '20%', top: 64 },
  sparkleR: { position: 'absolute', right: '22%', top: 148 },
  heroLabel: { position: 'absolute', top: 18, fontFamily: F.bold, fontSize: 11, lineHeight: 15, letterSpacing: 0.6 },
  tile: {
    width: 168,
    height: 168,
    marginTop: 16,
    borderRadius: 22,
    backgroundColor: N.paper,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  tileNotYet: { borderWidth: 2, borderStyle: 'dashed', backgroundColor: '#FFFDF7' },
  tileImg: { width: 136, height: 136 },
  giftName: { marginTop: 2, textAlign: 'center', fontFamily: F.bold, fontSize: 17, lineHeight: 22, paddingHorizontal: 24 },
  heroNote: { marginTop: 12, textAlign: 'center', fontFamily: F.regular, fontSize: 13, lineHeight: 19, paddingHorizontal: 40 },

  barZone: { marginTop: 20, marginHorizontal: 32, height: 44, justifyContent: 'center' },
  barTrack: { height: 10, borderRadius: 5, marginRight: 22, overflow: 'hidden' },
  barFill: { height: 10, borderRadius: 5 },
  barGift: {
    position: 'absolute',
    right: 0,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: N.paper,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  barEnds: { marginTop: 6, marginHorizontal: 32, marginRight: 54, flexDirection: 'row', justifyContent: 'space-between' },
  barEnd: { fontFamily: F.medium, fontSize: 11, lineHeight: 15 },

  bigMore: { marginTop: 14, textAlign: 'center', fontFamily: F.bold, fontSize: 26, lineHeight: 32 },
  bigRest: { marginTop: 2, textAlign: 'center', fontFamily: F.medium, fontSize: 14, lineHeight: 19, paddingHorizontal: 24 },
  bought: { marginTop: 12, textAlign: 'center', fontFamily: F.regular, fontSize: 11, lineHeight: 15 },

  cta: {
    marginTop: 18,
    marginHorizontal: 32,
    height: 52,
    borderRadius: 26,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaGlow: {
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  ctaPressed: { transform: [{ scale: 0.98 }], opacity: 0.92 },
  ctaText: { fontFamily: F.bold, fontSize: 15, lineHeight: 19, letterSpacing: 0.2 },

  missedBlock: { alignItems: 'center', paddingTop: 28, paddingBottom: 4, alignSelf: 'stretch' },
  missedTitle: { fontFamily: F.bold, fontSize: 17, lineHeight: 22 },
  missedNote: { marginTop: 6, textAlign: 'center', fontFamily: F.regular, fontSize: 13, lineHeight: 19, paddingHorizontal: 40 },

  listLabel: { marginTop: 20, marginHorizontal: 16, fontFamily: F.bold, fontSize: 11, lineHeight: 15, color: N.sub, letterSpacing: 0.6 },
  list: { marginTop: 8, marginHorizontal: 16, backgroundColor: N.paper, borderRadius: 14, borderWidth: 1, borderColor: N.line, paddingHorizontal: 14, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12 },
  rowDivider: { borderTopWidth: 1, borderTopColor: N.line },
  rowAt: { width: 52, fontFamily: F.bold, fontSize: 15, lineHeight: 19, color: N.ink },
  rowThumb: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  rowName: { flex: 1, fontFamily: F.regular, fontSize: 13, lineHeight: 17, color: N.ink },
  wonChip: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  wonChipText: { fontFamily: F.bold, fontSize: 10, lineHeight: 13 },
  nextText: { fontFamily: F.medium, fontSize: 12, lineHeight: 16 },

  topCard: { marginVertical: 10, marginHorizontal: -14, paddingHorizontal: 14, paddingVertical: 16, alignItems: 'center' },
  topLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  topLabel: { fontFamily: F.bold, fontSize: 11, lineHeight: 15, letterSpacing: 0.6 },
  topStage: { marginTop: 12, alignSelf: 'stretch', height: 132, borderRadius: 10, backgroundColor: N.paper, alignItems: 'center', justifyContent: 'center' },
  topImage: { width: 150, height: 114 },
  topName: { marginTop: 10, textAlign: 'center', fontFamily: F.bold, fontSize: 15, lineHeight: 19 },
  topAt: { marginTop: 2, fontFamily: F.bold, fontSize: 13, lineHeight: 17 },

  facts: { marginTop: 12, marginHorizontal: 16, backgroundColor: N.paper, borderRadius: 14, borderWidth: 1, borderColor: N.line, paddingHorizontal: 14 },
  factRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11 },
  factText: { flex: 1, fontFamily: F.regular, fontSize: 13, lineHeight: 18, color: N.ink },

  card: { marginHorizontal: 16, marginTop: 12, backgroundColor: N.paper, borderRadius: 14, borderWidth: 1, borderColor: N.line, padding: 16 },
  cardTitle: { fontFamily: F.bold, fontSize: 14, lineHeight: 18, color: N.ink, marginBottom: 8 },
  stepper: { flexDirection: 'row', alignItems: 'flex-start' },
  step: { alignItems: 'center', width: 66 },
  stepDot: { width: 30, height: 30, borderRadius: 15, borderWidth: 1.5, borderColor: '#DDD', backgroundColor: N.paper, alignItems: 'center', justifyContent: 'center' },
  stepDone: { backgroundColor: N.green, borderColor: N.green },
  stepNow: { backgroundColor: '#FDF3E0' },
  stepTitle: { marginTop: 6, fontFamily: F.medium, fontSize: 11, lineHeight: 14, color: N.ink, textAlign: 'center' },
  stepDate: { marginTop: 1, fontFamily: F.regular, fontSize: 10, lineHeight: 13, color: N.sub },
  connector: { flex: 1, height: 2, backgroundColor: '#E4E4E4', marginTop: 14 },
  connectorDone: { backgroundColor: N.green },
  orderNo: { marginTop: 12, textAlign: 'center', fontFamily: F.regular, fontSize: 11, lineHeight: 14, color: N.sub },
  shopName: { fontFamily: F.medium, fontSize: 14, lineHeight: 18, color: N.ink },
  addressLine: { marginTop: 2, fontFamily: F.regular, fontSize: 13, lineHeight: 18, color: N.sub },
  addressActions: { flexDirection: 'row', alignItems: 'center', marginTop: 14, gap: 12 },
  confirmBtn: { height: 44, borderRadius: 22, paddingHorizontal: 22, alignItems: 'center', justifyContent: 'center' },
  confirmBtnText: { color: '#fff', fontFamily: F.bold, fontSize: 13, lineHeight: 16 },
  changeBtn: { height: 44, justifyContent: 'center', paddingHorizontal: 6 },
  changeBtnText: { fontFamily: F.medium, fontSize: 13, lineHeight: 16 },
  confirmedRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14 },
  confirmedText: { fontFamily: F.medium, fontSize: 13, lineHeight: 16, color: N.green },

  confetti: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  demoBar: { borderTopWidth: 1, borderTopColor: N.line, backgroundColor: '#fff', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 10, gap: 6 },
  demoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  demoLabel: { fontFamily: F.medium, fontSize: 11, lineHeight: 14, color: N.sub },
  demoChip: { fontFamily: F.medium, fontSize: 12, lineHeight: 15, color: N.sub },
  demoChipActive: { color: '#0A66E8', fontFamily: F.bold },
  demoLink: { marginLeft: 'auto', fontFamily: F.medium, fontSize: 11, lineHeight: 14, color: N.sub, textDecorationLine: 'underline' },
});
