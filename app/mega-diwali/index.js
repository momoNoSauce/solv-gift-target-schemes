// Flow B: the scheme detail page.
//
// Reference-grounded (Mobbin, Aug 2026): Shopee Lucky Prize (prize on a lit
// pedestal in a dark room), Grab VIP (the hero is one giant sentence), Shopee
// Member (the next tier sits on the end of the progress bar), Temu (rules behind
// a link), foodpanda Kongsi Rezeki (one headline, days-left urgency).
//
// Structure of the stage, top to bottom, a timeline the customer reads down:
//   1. The pedestal holds the NEXT gift: the goal, large and lit. When nothing
//      is left to chase (top reached, ended) it holds the WON gift instead.
//   2. The meter: BOUGHT SO FAR label at the track's left, the bought amount as
//      a value tag riding the knob, slab values at the ends.
//   3. Below the progress: the secured capsule ("You won the X", green check),
//      a settled receipt, never dressed as a prize.
//   4. The ask in the accent: "₹X more / to win the Y", then one CTA.
// Color roles are strict: white/ink = measured, accent = the ask, green = won.
//
// The stage surface is a lit scene (src/gifts/Scene.js), not a plain gradient:
// a solid ground with vertical falloff, a key glow behind the pedestal, an
// ambient glow at the top, a corner vignette, and fixed light specks.
//
// Motion: the stage content enters as a staged sequence (label, tile, name,
// bar sweep, amount, CTA), 90ms apart, once per state. Confetti greets a won
// gift, fades out, and never loops.
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
import Svg, { Ellipse } from 'react-native-svg';
import { F } from '../../src/theme';
import { IconBack, IconRunningMan, IconTargetFlag } from '../../src/icons';
import GiftGlyph from '../../src/gifts/icons';
import StageScene from '../../src/gifts/Scene';
import { usePressScale } from '../../src/gifts/solv';
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
  green: '#177E36',
};
const PHOTO_EDGE = 'rgba(0,0,0,0.08)';
const TABULAR = { fontVariant: ['tabular-nums'] };

const L = 100000;
const LIFESTYLE = LADDERS[0];
const D = (m, d, y = 2026) => Date.UTC(y, m - 1, d);
const START = D(10, 1);
const END = D(11, 9);

// Headless capture (navigator.webdriver) renders the final state directly.
const STATIC =
  typeof navigator !== 'undefined' &&
  (navigator.webdriver === true || /HeadlessChrome/.test(navigator.userAgent || ''));

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

// SchemeItemRules for the demo scheme, the shape the app's createTable()
// flattens. All rows are one type (trade categories); the exclusions follow
// the app's own real pattern ("All Products excluding Sugar & Edible Oil").
const RULES = {
  included: ['Packaged Foods', 'Beverages', 'Personal Care', 'Home Care'],
  excluded: ['Sugar', 'Edible Oil'],
};

const DELIVER_BY = '21 Nov 2026';
const ADDRESS = { shop: 'Sri Lakshmi Stores', line: '12, Gandhi Bazaar Main Road, Basavanagudi, Bengaluru 560004' };
const ORDER_NO = 'Amazon order 408-5561234-7789045';

// Slab labels the trade way: ₹2L … ₹40L, then ₹1.2Cr.
const slab = (v) => lakh(v);

// UI strings, both languages. Product and brand names stay Latin. The big amount
// renders from parts (prefix, amount, suffix) so the number can be set larger
// than the words around it in both languages.
const T = {
  en: {
    startsLine: (d) => `Starts ${d}`,
    endsLine: (d) => `Ends ${d} • `,
    daysLeft: (days) => `${days} days left`,
    endedLine: (d) => `Ended ${d}`,
    youWon: 'YOU WON',
    qualified: 'QUALIFIED',
    nextGift: 'NEXT GIFT',
    topGift: 'TOP GIFT',
    wonTop: 'YOU WON THE TOP GIFT',
    securedRow: (name) => `You've qualified for the ${name}`,
    morePrefix: 'Buy ', moreSuffix: ' more',
    onlyPrefix: 'Buy just ', onlySuffix: ' more',
    rest: (next) => `to win the ${next}`,
    finalBought: (amt) => `Final buying: ${amt}`,
    cta: () => 'View Eligible Products',
    ctaEnded: 'See running schemes',
    startsNote: (d) => `Buy eligible products from ${d}. The highest slab you cross is your gift.`,
    topNote: (d) => `Nothing is left to win. We order your gift after ${d}.`,
    missedTitle: 'The scheme ended',
    missedNote: 'No slab was crossed this time. New schemes show in My Schemes.',
    pendingNote: 'We place your Amazon order in a few days.',
    orderedNote: (by) => `On the way to your shop. Arrives by ${by}.`,
    deliveredNote: (d) => `Delivered to your shop on ${d}.`,
    giftList: 'GIFT LIST',
    rulesTitle: 'ELIGIBLE PRODUCTS',
    rulesDesc: 'Following company/brand/category/products are eligible',
    eligible: 'Eligible',
    notEligible: 'Not eligible',
    next: 'NEXT',
    steps: ['Won', 'Ordered', 'On the way', 'Delivered'],
    shipsHere: 'Your gift ships here',
    confirm: 'Confirm address',
    change: 'Change',
    confirmed: 'Address confirmed',
    facts: (ladder, deliverBy) => [
      ['gift', 'One gift per shop: the highest slab you cross'],
      ['truck', `Amazon delivers to your shop by ${deliverBy}`],
    ],
  },
  hi: {
    startsLine: (d) => `${d} से शुरू`,
    endsLine: (d) => `${d} तक • `,
    daysLeft: (days) => `${days} दिन बाक़ी`,
    endedLine: (d) => `${d} को ख़त्म`,
    youWon: 'आपने जीता',
    qualified: 'क्वालिफ़ाइड',
    nextGift: 'अगला गिफ़्ट',
    topGift: 'टॉप गिफ़्ट',
    wonTop: 'आपने टॉप गिफ़्ट जीता',
    securedRow: (name) => `आपने ${name} के लिए क्वालिफ़ाई किया`,
    morePrefix: '', moreSuffix: ' और ख़रीदें',
    onlyPrefix: 'बस ', onlySuffix: ' और ख़रीदें',
    rest: (next) => `और ${next} जीतें`,
    finalBought: (amt) => `कुल ख़रीदारी: ${amt}`,
    cta: () => 'एलिजिबल प्रोडक्ट देखें',
    ctaEnded: 'चल रही स्कीमें देखें',
    startsNote: (d) => `${d} से एलिजिबल प्रोडक्ट ख़रीदें। जो सबसे ऊँचा स्लैब पार करें, वही गिफ़्ट आपका।`,
    topNote: (d) => `जीतने को और कुछ नहीं बचा। ${d} के बाद हम आपका ऑर्डर करेंगे।`,
    missedTitle: 'स्कीम ख़त्म हो गई',
    missedNote: 'इस बार कोई स्लैब पार नहीं हुआ। नई स्कीमें My Schemes में दिखेंगी।',
    pendingNote: 'कुछ दिनों में हम आपका Amazon ऑर्डर करेंगे।',
    orderedNote: (by) => `आपकी दुकान की ओर रवाना। ${by} तक पहुँचेगा।`,
    deliveredNote: (d) => `${d} को आपकी दुकान पर डिलीवर हुआ।`,
    giftList: 'गिफ़्ट लिस्ट',
    rulesTitle: 'एलिजिबल प्रोडक्ट',
    rulesDesc: 'ये कंपनी/ब्रांड/कैटेगरी/प्रोडक्ट एलिजिबल हैं',
    eligible: 'एलिजिबल',
    notEligible: 'एलिजिबल नहीं',
    next: 'अगला',
    steps: ['जीता', 'ऑर्डर हुआ', 'रास्ते में', 'डिलीवर'],
    shipsHere: 'आपका गिफ़्ट यहाँ आएगा',
    confirm: 'पता सही है',
    change: 'बदलें',
    confirmed: 'पता कन्फ़र्म हो गया',
    facts: (ladder, deliverBy) => [
      ['gift', '1 दुकान, 1 गिफ़्ट: जो सबसे ऊँचा स्लैब पार करें'],
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

// The primary pill: a top sheen for depth, a soft glow in its own color, and a
// spring press to 0.96 that can be interrupted mid-motion.
function CtaButton({ label, bg, fg, glow = false, onPress, containerStyle }) {
  const p = usePressScale(0.96);
  return (
    <Animated.View style={{ transform: [{ scale: p.scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={p.pressIn}
        onPressOut={p.pressOut}
        android_ripple={{ color: '#00000022' }}
        style={[styles.cta, containerStyle, { backgroundColor: bg }, glow && [styles.ctaGlow, { shadowColor: bg }]]}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.30)', 'rgba(255,255,255,0)']}
          style={styles.ctaSheen}
          pointerEvents="none"
        />
        <Text style={[styles.ctaText, { color: fg }]} allowFontScaling={false}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

// One staged entrance value: opacity + a small rise.
const rise = (v, d = 10) => ({
  opacity: v,
  transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [d, 0] }) }],
});

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

  // The pedestal holds the gift the page is ABOUT: the NEXT gift while the
  // scheme runs (the object of desire, the reason to buy), the TOP gift while
  // it is only announced, and the WON gift when nothing is left to chase.
  // The won gift during a running scheme is a settled fact, not a goal, so it
  // moves to the secured capsule above the pedestal: small, green-checked,
  // banked. Two categories, two treatments.
  // One term per concept: the goal on the pedestal is always NEXT GIFT (the
  // gift list marks the same tier NEXT). Won labels are green; goal labels
  // wear the accent.
  const runningWithNext = s.started && !s.ended && s.next;
  const hero = missed
    ? null
    : s.state === STATE.SCHEDULED
    ? { gift: s.top, label: t.topGift, tone: 'goal' }
    : runningWithNext
    ? { gift: s.next, label: t.nextGift, tone: 'goal' }
    : { gift: s.secured, label: s.state === STATE.TOP_REACHED ? t.wonTop : t.youWon, tone: 'won' };
  const securedCapsule = runningWithNext && s.earned ? s.secured : null;

  const showBar = running && s.next;
  const prevAt = s.secured ? s.secured.at : 0;
  const localPct = s.next ? Math.min(1, (s.currentValue - prevAt) / (s.next.at - prevAt)) : 1;
  const [trackW, setTrackW] = useState(0);
  const [dTagW, setDTagW] = useState(84);

  // The one line under the hero for the states with no bar.
  const heroNote =
    s.state === STATE.SCHEDULED ? t.startsNote(s.startLabel)
    : s.state === STATE.TOP_REACHED ? t.topNote(s.endLabel)
    : s.state === STATE.ENDED_PENDING ? t.pendingNote
    : s.state === STATE.GIFT_ORDERED ? t.orderedNote(DELIVER_BY)
    : s.state === STATE.DELIVERED ? t.deliveredNote('18 Nov')
    : null;

  // Staged entrance: label, tile, name, bar sweep, amount, CTA. 90ms apart,
  // re-run when the scenario or the theme changes.
  const intro = useRef([...Array(6)].map(() => new Animated.Value(STATIC ? 1 : 0))).current;
  const [labelA, tileA, nameA, barA, amountA, ctaA] = intro;
  useEffect(() => {
    if (STATIC) return;
    intro.forEach((v) => v.setValue(0));
    Animated.stagger(90, [
      Animated.timing(labelA, { toValue: 1, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
      Animated.spring(tileA, { toValue: 1, friction: 7, tension: 60, useNativeDriver: false }),
      Animated.timing(nameA, { toValue: 1, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
      Animated.timing(barA, { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
      Animated.timing(amountA, { toValue: 1, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
      Animated.timing(ctaA, { toValue: 1, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
    ]).start();
  }, [stateKey, th.key]);

  const sparkleAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (STATIC) return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
        Animated.timing(sparkleAnim, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
      ])
    ).start();
  }, [sparkleAnim]);
  const sparkleOpacity = sparkleAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.9] });

  const h2 = s.state === STATE.SCHEDULED
    ? <Text style={[styles.h2, TABULAR, { color: st.sub }]} allowFontScaling={false}>{t.startsLine(s.startLabel)}</Text>
    : s.ended
    ? <Text style={[styles.h2, TABULAR, { color: st.sub }]} allowFontScaling={false}>{t.endedLine(s.endLabel)}</Text>
    : (
      <Text style={[styles.h2, TABULAR, { color: st.sub }]} allowFontScaling={false}>
        {t.endsLine(s.endLabel)}
        <Text style={{ color: st.accent, fontFamily: F.medium }} allowFontScaling={false}>{t.daysLeft(s.daysLeft)}</Text>
      </Text>
    );

  const stepStates = withDelivery ? stepsFor(s.state) : null;
  const stepDates = withDelivery ? STEP_DATES[s.state] : null;

  // Delight: a short confetti burst greets a page that holds a won gift. It
  // fades out; it never loops or cuts.
  const celebrate = (s.earned && !s.ended && !STATIC) || (s.state === STATE.DELIVERED && !STATIC);
  const [confetti, setConfetti] = useState(false);
  const confettiA = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!celebrate) {
      setConfetti(false);
      return;
    }
    setConfetti(true);
    confettiA.setValue(0);
    Animated.timing(confettiA, { toValue: 1, duration: 250, useNativeDriver: false }).start();
    const id = setTimeout(() => {
      Animated.timing(confettiA, { toValue: 0, duration: 700, useNativeDriver: false }).start(() => setConfetti(false));
    }, 3800);
    return () => clearTimeout(id);
  }, [stateKey, celebrate]);

  const amountParts = s.nearSlab
    ? { pre: t.onlyPrefix, amt: indianPrice(s.remaining), post: t.onlySuffix, color: st.urgent }
    : { pre: t.morePrefix, amt: indianPrice(s.remaining), post: t.moreSuffix, color: st.accent };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView>
        {/* ——— The stage ——— */}
        <View style={styles.stage}>
          <StageScene stage={st} festive={festive} focusY={missed ? 0.2 : 0.44} />
          <View style={styles.topBar}>
            {/* hitSlop is unreliable on RN-web; padding+negative margin gives a
                real 44px target without moving the icon. */}
            <Pressable
              onPress={() => router.back()}
              style={styles.backHit}
              android_ripple={{ color: '#ffffff33', borderless: true }}
            >
              <IconBack size={24} color="#fff" />
            </Pressable>
          </View>

          {/* Long-press the title for the prototype's state/theme panel. */}
          <Pressable onLongPress={() => setDemoOpen((v) => !v)} delayLongPress={450}>
            <View style={styles.titleRow}>
              {/* The motif hangs OUTSIDE the centered text, so the title shares
                  one axis with every centered block below it. */}
              <View>
                {th.motif ? (
                  <View style={styles.motifHang}>
                    <GiftGlyph kind={th.motif} size={22} color={st.accent} strokeWidth={1.5} />
                  </View>
                ) : null}
                <Text style={[styles.h1, { color: st.ink }]} allowFontScaling={false}>{title}</Text>
              </View>
            </View>
            {h2}
          </Pressable>

          {missed ? (
            <View style={styles.missedBlock}>
              <Text style={[styles.missedTitle, { color: st.ink }]} allowFontScaling={false}>{t.missedTitle}</Text>
              <Text style={[styles.missedNote, { color: st.sub }]} allowFontScaling={false}>{t.missedNote}</Text>
              <View style={styles.missedCta}>
                <CtaButton label={t.ctaEnded} bg={st.accent} fg={st.accentInk} onPress={() => router.push('/solv-schemes')} />
              </View>
            </View>
          ) : (
            <>
              {/* The hero pedestal. The key light comes from the scene; the tile
                  keeps only its contact shadow. */}
              <View style={styles.pedestal}>
                <Svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 412 250"
                  preserveAspectRatio="xMidYMid slice"
                  style={StyleSheet.absoluteFill}
                  pointerEvents="none"
                >
                  <Ellipse cx="206" cy="234" rx="76" ry="9" fill="#000" opacity="0.3" />
                </Svg>
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
                <Animated.Text
                  style={[styles.heroLabel, { color: hero.tone === 'won' ? st.good : st.accent, opacity: labelA }]}
                  allowFontScaling={false}
                >
                  {hero.label}
                </Animated.Text>
                <Animated.View
                  style={[
                    styles.tile,
                    { opacity: tileA, transform: [{ scale: tileA.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }] },
                  ]}
                >
                  {hero.gift.image ? (
                    <Image source={hero.gift.image} style={styles.tileImg} resizeMode="contain" />
                  ) : (
                    <GiftGlyph kind={hero.gift.icon} size={80} color={st.accentDeep} strokeWidth={1.2} />
                  )}
                </Animated.View>
              </View>
              <Animated.Text style={[styles.giftName, { color: st.ink }, rise(nameA, 8)]} allowFontScaling={false}>
                {hero.gift.name}
              </Animated.Text>

              {showBar ? (
                <>
                  {/* The measured fact: the bought amount rides the runner as a
                      value tag; the number and its position read as one object. */}
                  {trackW > 0 && localPct > 0 ? (
                    <View style={styles.dTagRow}>
                      <Animated.View
                        style={[
                          styles.tagWrap,
                          {
                            opacity: barA,
                            left: 32 + Math.min(Math.max(localPct * trackW - dTagW / 2, 0), Math.max(0, trackW - dTagW)),
                          },
                        ]}
                        onLayout={(e) => setDTagW(e.nativeEvent.layout.width)}
                      >
                        <View style={styles.dTag}>
                          <Text style={[styles.dTagText, TABULAR]} numberOfLines={1} allowFontScaling={false}>
                            {indianPrice(s.currentValue)}
                          </Text>
                        </View>
                        <View style={styles.dTagCaret} />
                      </Animated.View>
                    </View>
                  ) : null}

                  {/* The rail speaks the app's language: the runner is the shop
                      (white: measured), the flag is the target (accent: the ask). */}
                  <View style={styles.barZone}>
                    <View
                      style={[styles.barTrack, { backgroundColor: st.track }]}
                      onLayout={(e) => setTrackW(e.nativeEvent.layout.width)}
                    >
                      <Animated.View
                        style={[
                          styles.barFill,
                          { backgroundColor: st.accent, width: barA.interpolate({ inputRange: [0, 1], outputRange: ['0%', `${localPct * 100}%`] }) },
                        ]}
                      />
                    </View>
                    {trackW > 0 ? (
                      <View style={[styles.flagD, { left: trackW - 14 }]}>
                        <IconTargetFlag width={12} height={22} color={st.accent} />
                      </View>
                    ) : null}
                    {trackW > 0 && localPct > 0 ? (
                      <Animated.View
                        style={[
                          styles.runnerD,
                          {
                            opacity: barA,
                            left: barA.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, Math.min(Math.max(localPct * trackW - 11, 0), trackW - 26)],
                            }),
                          },
                        ]}
                      >
                        <IconRunningMan height={22} color="#fff" />
                      </Animated.View>
                    ) : null}
                  </View>
                  <Animated.View style={[styles.barEnds, { opacity: barA }]}>
                    <Text style={[styles.barEnd, TABULAR, { color: st.sub }]} allowFontScaling={false}>{slab(prevAt)}</Text>
                    <Text style={[styles.barEnd, TABULAR, { color: st.sub }]} allowFontScaling={false}>{slab(s.next.at)}</Text>
                  </Animated.View>

                  {/* The ask, in the accent: what is left, and what it wins. */}
                  <Animated.View style={rise(amountA, 10)}>
                    <Text style={[styles.bigMore, TABULAR, { color: amountParts.color }]} allowFontScaling={false}>
                      {amountParts.pre ? <Text style={styles.bigMoreWord}>{amountParts.pre}</Text> : null}
                      {amountParts.amt}
                      <Text style={styles.bigMoreWord}>{amountParts.post}</Text>
                    </Text>
                    <Text style={[styles.bigRest, { color: st.sub }]} allowFontScaling={false}>
                      {t.rest(s.next.shortName)}
                    </Text>
                  </Animated.View>

                  {/* Below the ask: what is already qualified, a settled receipt,
                      never dressed as a prize. */}
                  {securedCapsule ? (
                    <Animated.View style={[styles.securedWrap, rise(ctaA, 6)]}>
                      <View style={styles.secured}>
                        <View style={styles.securedThumb}>
                          {securedCapsule.image ? (
                            <Image source={securedCapsule.image} style={{ width: 22, height: 22 }} resizeMode="contain" />
                          ) : (
                            <GiftGlyph kind={securedCapsule.icon} size={16} color={st.accentDeep} strokeWidth={1.7} />
                          )}
                        </View>
                        <Text style={[styles.securedText, { color: st.ink }]} allowFontScaling={false}>
                          {t.securedRow(securedCapsule.shortName)}
                        </Text>
                        <GiftGlyph kind="check" size={15} color={st.good} strokeWidth={2} />
                      </View>
                    </Animated.View>
                  ) : null}
                </>
              ) : heroNote ? (
                <Animated.View style={rise(nameA, 8)}>
                  <Text style={[styles.heroNote, { color: st.sub }]} allowFontScaling={false}>{heroNote}</Text>
                  {/* The meter is gone once nothing is next, but the retailer still
                      reconciles the counted total against their own books. */}
                  {s.earned ? (
                    <Text style={[styles.finalBought, TABULAR, { color: st.ink }]} allowFontScaling={false}>
                      {t.finalBought(indianPrice(s.currentValue))}
                    </Text>
                  ) : null}
                </Animated.View>
              ) : null}
            </>
          )}
        </View>

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
                          stepStates[i] === 'now' && [styles.stepNow, { borderColor: st.accentDeep, backgroundColor: th.card.tint }],
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
                      {stepDates[i] ? <Text style={[styles.stepDate, TABULAR]} allowFontScaling={false}>{stepDates[i]}</Text> : null}
                    </View>
                  </React.Fragment>
                ))}
              </View>
              {s.state !== STATE.ENDED_PENDING ? (
                <Text style={[styles.orderNo, TABULAR]} allowFontScaling={false}>{ORDER_NO}</Text>
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
                  <Pressable
                    style={({ pressed }) => [styles.confirmBtn, { backgroundColor: st.ground2 }, pressed && { transform: [{ scale: 0.96 }] }]}
                    onPress={() => setAddressConfirmed(true)}
                    android_ripple={{ color: '#ffffff33' }}
                  >
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

        {/* ——— The gift list. A missed scheme does not end on a page of lost
            gifts (peak-end); the stage's redirect to running schemes closes it. */}
        {missed ? null : (
        <>
        <Text style={styles.listLabel} allowFontScaling={false}>{t.giftList}</Text>
        <View style={styles.list}>
          {s.ladder.map((tier, i) => {
            const isTop = tier.at === s.top.at;
            const isWon = s.secured && tier.at === s.secured.at;
            const isPassed = s.secured && tier.at < s.secured.at;
            const isNext = running && s.next && tier.at === s.next.at;

            if (isTop && !isWon) {
              return (
                <View key={tier.at} style={styles.topCard}>
                  <StageScene stage={st} festive={festive} focusY={0.55} />
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
                  <Text style={[styles.topAt, TABULAR, { color: st.accent }]} allowFontScaling={false}>{slab(tier.at)}</Text>
                </View>
              );
            }

            return (
              <View
                key={tier.at}
                style={[styles.row, i > 0 && styles.rowDivider, isWon && styles.rowWon, isPassed && { opacity: 0.45 }]}
              >
                <Text style={[styles.rowAt, TABULAR, isNext && { color: st.accentDeep }]} allowFontScaling={false}>
                  {slab(tier.at)}
                </Text>
                <View style={styles.rowThumb}>
                  {tier.image ? (
                    <Image source={tier.image} style={{ width: 34, height: 34 }} resizeMode="contain" />
                  ) : (
                    <GiftGlyph kind={tier.icon} size={24} color={N.sub} strokeWidth={1.6} />
                  )}
                </View>
                <Text style={styles.rowName} numberOfLines={2} allowFontScaling={false}>{tier.name}</Text>
                {isWon ? (
                  // One meaning per color: won is always green, in every theme.
                  // Mid-scheme a higher slab can still replace this tier, so the
                  // chip says QUALIFIED while running and YOU WON once it is final.
                  <View style={[styles.wonChip, { backgroundColor: N.green }]}>
                    <Text style={[styles.wonChipText, { color: '#fff' }]} allowFontScaling={false}>
                      {running ? t.qualified : t.youWon}
                    </Text>
                  </View>
                ) : isNext ? (
                  <Text style={[styles.nextText, { color: st.accentDeep }]} allowFontScaling={false}>{t.next}</Text>
                ) : null}
              </View>
            );
          })}
        </View>
        </>
        )}

        {/* Eligible products: the app's target_scheme_rule table (name |
            Eligible / Not eligible), restyled to this page's card language. */}
        {missed ? null : (
          <>
            <Text style={styles.listLabel} allowFontScaling={false}>{t.rulesTitle}</Text>
            <View style={styles.rulesCard}>
              <Text style={styles.rulesDesc} allowFontScaling={false}>{t.rulesDesc}</Text>
              {RULES.included.map((name) => (
                <View key={name} style={styles.ruleRow}>
                  <Text style={styles.ruleName} allowFontScaling={false}>{name}</Text>
                  <Text style={[styles.ruleStatus, { color: N.green }]} allowFontScaling={false}>{t.eligible}</Text>
                </View>
              ))}
              {RULES.excluded.map((name) => (
                <View key={name} style={styles.ruleRow}>
                  <Text style={styles.ruleName} allowFontScaling={false}>{name}</Text>
                  <Text style={[styles.ruleStatus, { color: '#C2410C' }]} allowFontScaling={false}>{t.notEligible}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* The close, at the page's end: under the top gift, above the terms.
            The light zone uses the CARD accent tokens (the stage accent can be
            white on the default theme and would vanish here). */}
        {showBar ? (
          <Animated.View style={rise(ctaA, 10)}>
            <CtaButton
              label={t.cta()}
              bg={th.card.accent}
              fg={th.card.accentInk}
              glow
              containerStyle={styles.bottomCta}
            />
          </Animated.View>
        ) : null}

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
        <Animated.View style={[styles.confetti, { opacity: confettiA }]} pointerEvents="none">
          <LottieView source={RIMG.ribbon} autoPlay loop={false} style={{ flex: 1 }} />
        </Animated.View>
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

  stage: { paddingBottom: 28, overflow: 'hidden' },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 14 },
  backHit: { padding: 10, margin: -10 },
  titleRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
  motifHang: { position: 'absolute', right: '100%', marginRight: 8, top: 3 },
  h1: { fontFamily: F.bold, fontSize: 22, lineHeight: 27, letterSpacing: 0.2 },
  h2: { marginTop: 4, textAlign: 'center', fontFamily: F.regular, fontSize: 13, lineHeight: 17 },

  secured: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    borderRadius: 20,
    paddingLeft: 6,
    paddingRight: 12,
    height: 40,
  },
  securedThumb: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  securedText: { fontFamily: F.medium, fontSize: 13, lineHeight: 17 },

  pedestal: { height: 236, alignItems: 'center', justifyContent: 'center', marginTop: 0 },
  sparkleL: { position: 'absolute', left: '20%', top: 64 },
  sparkleR: { position: 'absolute', right: '22%', top: 148 },
  heroLabel: { position: 'absolute', top: 18, fontFamily: F.bold, fontSize: 11, lineHeight: 15, letterSpacing: 1.2 },
  tile: {
    width: 168,
    height: 168,
    marginTop: 16,
    borderRadius: 24,
    backgroundColor: N.paper,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
  },
  tileImg: { width: 128, height: 128, borderRadius: 12 },
  giftName: { marginTop: 2, textAlign: 'center', fontFamily: F.bold, fontSize: 17, lineHeight: 22, paddingHorizontal: 24, letterSpacing: 0.1 },
  heroNote: { marginTop: 12, textAlign: 'center', fontFamily: F.regular, fontSize: 13, lineHeight: 19, paddingHorizontal: 44 },
  finalBought: { marginTop: 8, textAlign: 'center', fontFamily: F.medium, fontSize: 13, lineHeight: 17 },

  // The label belongs to the meter, so it anchors at the track's left edge and
  // holds still while the value tag moves with the knob.
  dTagRow: { height: 34, marginTop: 14 },
  tagWrap: { position: 'absolute', alignItems: 'center' },
  dTag: { backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 10, height: 26, justifyContent: 'center' },
  dTagText: { color: N.ink, fontFamily: F.bold, fontSize: 13, lineHeight: 16 },
  dTagCaret: { width: 9, height: 9, marginTop: -6, backgroundColor: '#fff', transform: [{ rotate: '45deg' }] },

  securedWrap: { alignItems: 'center', marginTop: 22 },

  barZone: { marginTop: 0, marginHorizontal: 32, height: 34, justifyContent: 'flex-end' },
  barTrack: { height: 10, borderRadius: 5, overflow: 'hidden' },
  barFill: { height: 10, borderRadius: 5 },
  runnerD: { position: 'absolute', bottom: 8 },
  flagD: { position: 'absolute', bottom: 8 },
  barEnds: { marginTop: 6, marginHorizontal: 32, flexDirection: 'row', justifyContent: 'space-between' },
  barEnd: { fontFamily: F.medium, fontSize: 11, lineHeight: 15 },

  bigMore: { marginTop: 12, textAlign: 'center', fontFamily: F.bold, fontSize: 30, lineHeight: 36 },
  bigMoreWord: { fontFamily: F.medium, fontSize: 17, lineHeight: 36 },
  bigRest: { marginTop: 2, textAlign: 'center', fontFamily: F.medium, fontSize: 14, lineHeight: 19, paddingHorizontal: 24 },

  cta: {
    marginTop: 10,
    marginHorizontal: 32,
    height: 52,
    borderRadius: 26,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  ctaSheen: { position: 'absolute', left: 0, right: 0, top: 0, height: 26 },
  ctaGlow: {
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  ctaText: { fontFamily: F.bold, fontSize: 15, lineHeight: 19, letterSpacing: 0.2 },

  missedBlock: { alignItems: 'center', paddingTop: 30, paddingBottom: 6, alignSelf: 'stretch' },
  missedTitle: { fontFamily: F.bold, fontSize: 17, lineHeight: 22 },
  missedNote: { marginTop: 6, textAlign: 'center', fontFamily: F.regular, fontSize: 13, lineHeight: 19, paddingHorizontal: 44 },
  missedCta: { alignSelf: 'stretch', marginTop: 4 },
  bottomCta: { marginTop: 16, marginHorizontal: 16 },

  listLabel: { marginTop: 20, marginHorizontal: 16, fontFamily: F.bold, fontSize: 11, lineHeight: 15, color: N.sub, letterSpacing: 1 },
  list: {
    marginTop: 8,
    marginHorizontal: 16,
    backgroundColor: N.paper,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(17,24,39,0.06)',
    paddingHorizontal: 14,
    overflow: 'hidden',
    shadowColor: '#0B1B33',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 62, paddingVertical: 8, gap: 12 },
  rowDivider: { borderTopWidth: 1, borderTopColor: '#F2F3F5' },
  rowWon: { backgroundColor: '#F3FAF5', marginHorizontal: -14, paddingHorizontal: 14 },
  rowAt: { width: 54, fontFamily: F.bold, fontSize: 15, lineHeight: 19, color: N.ink },
  rowThumb: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: N.paper,
    borderWidth: 1,
    borderColor: PHOTO_EDGE,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  rowName: { flex: 1, fontFamily: F.regular, fontSize: 13, lineHeight: 17, color: N.ink },
  wonChip: { height: 22, borderRadius: 11, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center' },
  wonChipText: { fontFamily: F.bold, fontSize: 10, lineHeight: 13, letterSpacing: 0.4 },
  nextText: { fontFamily: F.bold, fontSize: 10, lineHeight: 13, letterSpacing: 0.6 },

  topCard: { marginVertical: 10, marginHorizontal: -14, paddingHorizontal: 14, paddingVertical: 16, alignItems: 'center', overflow: 'hidden' },
  topLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  topLabel: { fontFamily: F.bold, fontSize: 11, lineHeight: 15, letterSpacing: 1.2 },
  topStage: { marginTop: 12, alignSelf: 'stretch', height: 132, borderRadius: 12, backgroundColor: N.paper, alignItems: 'center', justifyContent: 'center' },
  topImage: { width: 150, height: 114 },
  topName: { marginTop: 10, textAlign: 'center', fontFamily: F.bold, fontSize: 15, lineHeight: 19 },
  topAt: { marginTop: 2, fontFamily: F.bold, fontSize: 13, lineHeight: 17 },

  rulesCard: {
    marginTop: 8,
    marginHorizontal: 16,
    backgroundColor: N.paper,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(17,24,39,0.06)',
    paddingHorizontal: 14,
    shadowColor: '#0B1B33',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  rulesDesc: { paddingVertical: 11, fontFamily: F.regular, fontSize: 12, lineHeight: 16, color: N.sub },
  ruleRow: { flexDirection: 'row', alignItems: 'center', minHeight: 44, gap: 12, borderTopWidth: 1, borderTopColor: '#F2F3F5' },
  ruleName: { flex: 1, fontFamily: F.medium, fontSize: 13, lineHeight: 17, color: N.ink },
  ruleStatus: { fontFamily: F.medium, fontSize: 13, lineHeight: 17 },

  facts: {
    marginTop: 12,
    marginHorizontal: 16,
    backgroundColor: N.paper,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(17,24,39,0.06)',
    paddingHorizontal: 14,
    shadowColor: '#0B1B33',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  factRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11 },
  factText: { flex: 1, fontFamily: F.regular, fontSize: 13, lineHeight: 18, color: N.ink },

  card: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: N.paper,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(17,24,39,0.06)',
    padding: 16,
    shadowColor: '#0B1B33',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  cardTitle: { fontFamily: F.bold, fontSize: 14, lineHeight: 18, color: N.ink, marginBottom: 8 },
  stepper: { flexDirection: 'row', alignItems: 'flex-start' },
  step: { alignItems: 'center', width: 66 },
  stepDot: { width: 32, height: 32, borderRadius: 16, borderWidth: 1.5, borderColor: '#DDDFE3', backgroundColor: N.paper, alignItems: 'center', justifyContent: 'center' },
  stepDone: { backgroundColor: N.green, borderColor: N.green },
  stepNow: {},
  stepTitle: { marginTop: 6, fontFamily: F.medium, fontSize: 11, lineHeight: 14, color: N.ink, textAlign: 'center' },
  stepDate: { marginTop: 1, fontFamily: F.regular, fontSize: 10, lineHeight: 13, color: N.sub },
  connector: { flex: 1, height: 2, borderRadius: 1, backgroundColor: '#E7E9EC', marginTop: 15 },
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
