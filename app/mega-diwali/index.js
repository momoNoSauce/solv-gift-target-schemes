// Flow B: Mega Diwali Gifts.
//
// Reference-grounded (Mobbin, Aug 2026): Shopee Lucky Prize (prize on a lit
// pedestal in a dark room), Grab VIP (the hero is one giant sentence), Shopee
// Member (the next tier sits on the end of the progress bar), Temu (rules behind
// a link), foodpanda Kongsi Rezeki (one headline, days-left urgency).
//
// This pass adds:
//   - A primary CTA into the eligible catalog. A campaign page must close.
//   - A working Rules link (/mega-diwali/rules) carrying the fine print the page
//     deliberately does not say (returns reduce the total, no cash exchange).
//   - An EN / Hindi toggle. The audience is Hindi-first; the design must survive
//     translation, and the toggle proves it.
//   - Entrance motion: the pedestal gift springs in, the progress bar fills to
//     its value, the sparkles pulse. Nothing loops except the sparkles.
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, Pressable, ScrollView, StyleSheet, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, RadialGradient, Stop, Rect, Ellipse } from 'react-native-svg';
import { F } from '../../src/theme';
import { IconBack } from '../../src/icons';
import GiftGlyph from '../../src/gifts/icons';
import { CAMPAIGN, LADDERS, MEMBER, ladderState } from '../../src/gifts/data';
import { indianPrice } from '../../src/data';

const K = {
  night: '#160E33',
  night2: '#2C1D57',
  gold: '#F2B84B',
  goldDeep: '#B4700F',
  ink: '#1A1A1A',
  sub: '#6B6B6B',
  line: '#ECECEC',
  paper: '#FFFFFF',
  bg: '#F7F7F7',
  green: '#1E8E3E',
  nightSub: '#B9ACDF',
  amber: '#FDF3E0',
};

// Slab labels the trade way: ₹2L … ₹40L, then ₹1.2Cr.
function slab(v) {
  if (v >= 10000000) {
    const n = Math.round((v / 10000000) * 10) / 10;
    return '₹' + n + 'Cr';
  }
  const n = Math.round((v / 100000) * 100) / 100;
  return '₹' + n + 'L';
}

// UI strings, both languages. Product and brand names stay Latin.
const T = {
  en: {
    rules: 'Rules',
    langToggle: 'हिंदी',
    ends: (d, days) => `Ends ${d} • `,
    daysLeft: (days) => `${days} days left`,
    yourGift: 'YOUR GIFT',
    yourFirstGift: 'YOUR FIRST GIFT',
    more: (amt) => `${amt} more`,
    rest: (next, cur) => (cur ? `and the ${next} is yours instead` : `and the ${next} is yours`),
    bought: (amt, ladder) => `Your buying: ${amt} • ${ladder}`,
    cta: (ladder) => `Shop ${ladder} products`,
    giftList: 'GIFT LIST',
    yours: 'YOURS',
    next: 'next',
    topPrize: 'TOP PRIZE',
    facts: (ladder, deliverBy) => [
      ['gift', '1 gift per shop, the highest you reach'],
      ['check', `${ladder} products count`],
      ['truck', `Delivered by Amazon by ${deliverBy}`],
    ],
  },
  hi: {
    rules: 'नियम',
    langToggle: 'English',
    ends: (d) => `${d} तक • `,
    daysLeft: (days) => `${days} दिन बाक़ी`,
    yourGift: 'आपका गिफ़्ट',
    yourFirstGift: 'आपका पहला गिफ़्ट',
    more: (amt) => `${amt} और चाहिए`,
    rest: (next, cur) => (cur ? `फिर ${next} आपका, ${cur} की जगह` : `फिर ${next} आपका`),
    bought: (amt, ladder) => `आपकी ख़रीदारी: ${amt} • ${ladder}`,
    cta: (ladder) => `${ladder} प्रोडक्ट ख़रीदें`,
    giftList: 'गिफ़्ट लिस्ट',
    yours: 'आपका',
    next: 'अगला',
    topPrize: 'टॉप प्राइज़',
    facts: (ladder, deliverBy) => [
      ['gift', '1 दुकान, 1 गिफ़्ट: जो सबसे ऊँचा पार करें'],
      ['check', `सिर्फ़ ${ladder} प्रोडक्ट गिने जाएँगे`],
      ['truck', `Amazon से डिलीवरी, ${deliverBy} तक`],
    ],
  },
};

export default function MegaDiwaliHub() {
  const router = useRouter();
  const [lang, setLang] = useState('en');
  const t = T[lang];

  const ladder = LADDERS.find((l) => l.key === MEMBER.ladderKey);
  const { secured, next, remaining } = ladderState(ladder);

  const tiers = ladder.tiers;
  const top = tiers[tiers.length - 1];
  const shown = secured || tiers[0];
  const prevAt = next ? (tiers[tiers.indexOf(next) - 1]?.at || 0) : 0;
  const localPct = next ? Math.min(100, Math.round(((ladder.currentValue - prevAt) / (next.at - prevAt)) * 100)) : 100;

  // Entrance motion.
  const tileAnim = useRef(new Animated.Value(0)).current;
  const barAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(tileAnim, { toValue: 1, friction: 6, tension: 50, useNativeDriver: true }).start();
    Animated.timing(barAnim, { toValue: 1, duration: 900, delay: 450, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(sparkleAnim, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, [tileAnim, barAnim, sparkleAnim]);

  const sparkleOpacity = sparkleAnim.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] });

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView>
        {/* ——— Night: the stage ——— */}
        <LinearGradient colors={[K.night, K.night2]} start={{ x: 0, y: 0 }} end={{ x: 0.8, y: 1 }} style={styles.stage}>
          <View style={styles.topBar}>
            <Pressable onPress={() => router.back()} android_ripple={{ color: '#ffffff33', borderless: true }}>
              <IconBack size={24} color="#fff" />
            </Pressable>
            <View style={styles.topRight}>
              <Pressable hitSlop={8} onPress={() => setLang(lang === 'en' ? 'hi' : 'en')}>
                <Text style={styles.langLink} allowFontScaling={false}>{t.langToggle}</Text>
              </Pressable>
              <Pressable hitSlop={8} onPress={() => router.push('/mega-diwali/rules')}>
                <Text style={styles.rulesLink} allowFontScaling={false}>{t.rules}</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.titleRow}>
            <GiftGlyph kind="diya" size={22} color={K.gold} strokeWidth={1.5} />
            <Text style={styles.h1} allowFontScaling={false}>{CAMPAIGN.title}</Text>
          </View>
          <Text style={styles.h2} allowFontScaling={false}>
            {t.ends(CAMPAIGN.endLabel)}
            <Text style={styles.h2Gold} allowFontScaling={false}>{t.daysLeft(CAMPAIGN.daysLeft)}</Text>
          </Text>

          {/* Pedestal */}
          <View style={styles.pedestal}>
            <Svg width={320} height={250} style={StyleSheet.absoluteFill}>
              <Defs>
                <RadialGradient id="glow" cx="50%" cy="52%" r="52%">
                  <Stop offset="0%" stopColor={K.gold} stopOpacity="0.42" />
                  <Stop offset="60%" stopColor={K.gold} stopOpacity="0.12" />
                  <Stop offset="100%" stopColor={K.gold} stopOpacity="0" />
                </RadialGradient>
              </Defs>
              <Rect x="0" y="0" width="320" height="250" fill="url(#glow)" />
              <Ellipse cx="160" cy="232" rx="78" ry="10" fill="#000" opacity="0.35" />
            </Svg>
            <Animated.View style={[styles.sparkleL, { opacity: sparkleOpacity }]}>
              <GiftGlyph kind="sparkle" size={16} color={K.gold} />
            </Animated.View>
            <Animated.View style={[styles.sparkleR, { opacity: sparkleOpacity }]}>
              <GiftGlyph kind="sparkle" size={12} color={K.gold} />
            </Animated.View>
            <Text style={styles.yourGift} allowFontScaling={false}>
              {secured ? t.yourGift : t.yourFirstGift}
            </Text>
            <Animated.View
              style={[
                styles.tile,
                !secured && styles.tileNotYet,
                { opacity: tileAnim, transform: [{ scale: tileAnim.interpolate({ inputRange: [0, 1], outputRange: [0.82, 1] }) }] },
              ]}
            >
              {shown.image ? (
                <Image source={shown.image} style={styles.tileImg} resizeMode="contain" />
              ) : (
                <GiftGlyph kind={shown.icon} size={80} color={K.goldDeep} strokeWidth={1.2} />
              )}
            </Animated.View>
          </View>
          <Text style={styles.giftName} allowFontScaling={false}>{shown.name}</Text>

          {next ? (
            <>
              <Text style={styles.bigMore} allowFontScaling={false}>{t.more(indianPrice(remaining))}</Text>
              <Text style={styles.bigRest} allowFontScaling={false}>
                {t.rest(next.shortName, secured ? secured.shortName : null)}
              </Text>

              <View style={styles.barZone}>
                <View style={styles.barTrack}>
                  <Animated.View
                    style={[
                      styles.barFill,
                      { width: barAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', `${localPct}%`] }) },
                    ]}
                  />
                </View>
                <View style={styles.barGift}>
                  {next.image ? (
                    <Image source={next.image} style={{ width: 34, height: 34 }} resizeMode="contain" />
                  ) : (
                    <GiftGlyph kind={next.icon} size={24} color={K.goldDeep} strokeWidth={1.6} />
                  )}
                </View>
              </View>
              <View style={styles.barEnds}>
                <Text style={styles.barEnd} allowFontScaling={false}>{slab(prevAt)}</Text>
                <Text style={styles.barEnd} allowFontScaling={false}>{slab(next.at)}</Text>
              </View>
              <Text style={styles.bought} allowFontScaling={false}>
                {t.bought(indianPrice(ladder.currentValue), ladder.label)}
              </Text>

              {/* The close: into the eligible catalog */}
              <Pressable style={styles.cta} android_ripple={{ color: '#00000022' }}>
                <Text style={styles.ctaText} allowFontScaling={false}>{t.cta(ladder.label)}</Text>
              </Pressable>
            </>
          ) : null}
        </LinearGradient>

        {/* ——— Light: the leaflet table ——— */}
        <Text style={styles.listLabel} allowFontScaling={false}>{t.giftList}</Text>
        <View style={styles.list}>
          {tiers.map((tier, i) => {
            const isTop = tier.at === top.at;
            const isYours = secured && tier.at === secured.at;
            const isPassed = secured && tier.at < secured.at;
            const isNext = next && tier.at === next.at;

            if (isTop) {
              return (
                <LinearGradient
                  key={tier.at}
                  colors={[K.night, K.night2]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.topCard}
                >
                  <View style={styles.topLabelRow}>
                    <GiftGlyph kind="sparkle" size={14} color={K.gold} />
                    <Text style={styles.topLabel} allowFontScaling={false}>{t.topPrize}</Text>
                    <GiftGlyph kind="sparkle" size={14} color={K.gold} />
                  </View>
                  <View style={styles.topStage}>
                    {tier.image ? (
                      <Image source={tier.image} style={styles.topImage} resizeMode="contain" />
                    ) : (
                      <GiftGlyph kind={tier.icon} size={64} color={K.goldDeep} strokeWidth={1.3} />
                    )}
                  </View>
                  <Text style={styles.topName} allowFontScaling={false}>{tier.name}</Text>
                  <Text style={styles.topAt} allowFontScaling={false}>{slab(tier.at)}</Text>
                </LinearGradient>
              );
            }

            return (
              <View key={tier.at} style={[styles.row, i > 0 && styles.rowDivider, isPassed && { opacity: 0.35 }]}>
                <Text style={[styles.rowAt, isNext && { color: K.goldDeep }]} allowFontScaling={false}>
                  {slab(tier.at)}
                </Text>
                <View style={styles.rowThumb}>
                  {tier.image ? (
                    <Image source={tier.image} style={{ width: 40, height: 40 }} resizeMode="contain" />
                  ) : (
                    <GiftGlyph kind={tier.icon} size={26} color={K.sub} strokeWidth={1.6} />
                  )}
                </View>
                <Text style={styles.rowName} numberOfLines={2} allowFontScaling={false}>{tier.name}</Text>
                {isYours ? (
                  <View style={styles.yoursChip}>
                    <Text style={styles.yoursChipText} allowFontScaling={false}>{t.yours}</Text>
                  </View>
                ) : isNext ? (
                  <Text style={styles.nextText} allowFontScaling={false}>{t.next}</Text>
                ) : null}
              </View>
            );
          })}
        </View>

        {/* Three facts. The whole rulebook on this page. */}
        <View style={styles.facts}>
          {t.facts(ladder.label, CAMPAIGN.deliverByLabel).map(([icon, text], i) => (
            <View key={icon} style={[styles.factRow, i > 0 && styles.rowDivider]}>
              <GiftGlyph kind={icon} size={18} color={K.sub} strokeWidth={1.6} />
              <Text style={styles.factText} allowFontScaling={false}>{text}</Text>
            </View>
          ))}
        </View>

        <Pressable style={styles.protoLink} onPress={() => router.push('/mega-diwali/claim')}>
          <Text style={styles.protoText} allowFontScaling={false}>Prototype: end-of-scheme state</Text>
        </Pressable>
        <Pressable style={styles.protoLink} onPress={() => router.push('/mega-diwali/entries')}>
          <Text style={styles.protoText} allowFontScaling={false}>Prototype: entry points</Text>
        </Pressable>
        <Pressable style={styles.protoLink} onPress={() => router.push('/mega-diwali/stacked')}>
          <Text style={styles.protoText} allowFontScaling={false}>Prototype: stacked variant (backup)</Text>
        </Pressable>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: K.bg },

  stage: { paddingBottom: 24 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 14 },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  langLink: { color: K.gold, fontFamily: F.medium, fontSize: 13, lineHeight: 17 },
  rulesLink: { color: K.nightSub, fontFamily: F.medium, fontSize: 13, lineHeight: 17 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 },
  h1: { color: '#fff', fontFamily: F.bold, fontSize: 21, lineHeight: 26 },
  h2: { marginTop: 3, textAlign: 'center', color: K.nightSub, fontFamily: F.regular, fontSize: 13, lineHeight: 17 },
  h2Gold: { color: K.gold, fontFamily: F.medium },

  pedestal: { height: 250, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  sparkleL: { position: 'absolute', left: '20%', top: 64 },
  sparkleR: { position: 'absolute', right: '22%', top: 148 },
  yourGift: { position: 'absolute', top: 18, color: K.gold, fontFamily: F.bold, fontSize: 11, lineHeight: 15 },
  tile: {
    width: 168,
    height: 168,
    marginTop: 16,
    borderRadius: 22,
    backgroundColor: K.paper,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  tileNotYet: { borderWidth: 2, borderStyle: 'dashed', borderColor: K.gold, backgroundColor: '#FFFDF7' },
  tileImg: { width: 136, height: 136 },
  giftName: { marginTop: 2, textAlign: 'center', color: '#fff', fontFamily: F.bold, fontSize: 17, lineHeight: 22, paddingHorizontal: 24 },

  bigMore: { marginTop: 20, textAlign: 'center', color: K.gold, fontFamily: F.bold, fontSize: 28, lineHeight: 34 },
  bigRest: { marginTop: 2, textAlign: 'center', color: K.nightSub, fontFamily: F.medium, fontSize: 14, lineHeight: 19, paddingHorizontal: 24 },

  barZone: { marginTop: 18, marginHorizontal: 32, height: 44, justifyContent: 'center' },
  barTrack: { height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.16)', marginRight: 22, overflow: 'hidden' },
  barFill: { height: 10, borderRadius: 5, backgroundColor: K.gold },
  barGift: {
    position: 'absolute',
    right: 0,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: K.paper,
    borderWidth: 2,
    borderColor: K.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barEnds: { marginTop: 6, marginHorizontal: 32, marginRight: 54, flexDirection: 'row', justifyContent: 'space-between' },
  barEnd: { color: K.nightSub, fontFamily: F.medium, fontSize: 11, lineHeight: 15 },
  bought: { marginTop: 14, textAlign: 'center', color: K.nightSub, fontFamily: F.regular, fontSize: 11, lineHeight: 15 },

  cta: {
    marginTop: 16,
    marginHorizontal: 32,
    height: 48,
    borderRadius: 12,
    backgroundColor: K.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { color: K.night, fontFamily: F.bold, fontSize: 15, lineHeight: 19 },

  listLabel: { marginTop: 20, marginHorizontal: 16, fontFamily: F.bold, fontSize: 11, lineHeight: 15, color: K.sub },
  list: { marginTop: 8, marginHorizontal: 16, backgroundColor: K.paper, borderRadius: 14, borderWidth: 1, borderColor: K.line, paddingHorizontal: 14, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12 },
  rowDivider: { borderTopWidth: 1, borderTopColor: K.line },
  rowAt: { width: 52, fontFamily: F.bold, fontSize: 15, lineHeight: 19, color: K.ink },
  rowThumb: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  rowName: { flex: 1, fontFamily: F.regular, fontSize: 13, lineHeight: 17, color: K.ink },
  yoursChip: { backgroundColor: K.gold, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  yoursChipText: { color: K.night, fontFamily: F.bold, fontSize: 10, lineHeight: 13 },
  nextText: { color: K.goldDeep, fontFamily: F.medium, fontSize: 12, lineHeight: 16 },

  topCard: { marginVertical: 10, marginHorizontal: -14, paddingHorizontal: 14, paddingVertical: 16, alignItems: 'center' },
  topLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  topLabel: { fontFamily: F.bold, fontSize: 11, lineHeight: 15, color: K.gold },
  topStage: { marginTop: 12, alignSelf: 'stretch', height: 132, borderRadius: 10, backgroundColor: K.paper, alignItems: 'center', justifyContent: 'center' },
  topImage: { width: 150, height: 114 },
  topName: { marginTop: 10, textAlign: 'center', fontFamily: F.bold, fontSize: 15, lineHeight: 19, color: '#fff' },
  topAt: { marginTop: 2, fontFamily: F.bold, fontSize: 13, lineHeight: 17, color: K.gold },

  facts: { marginTop: 12, marginHorizontal: 16, backgroundColor: K.paper, borderRadius: 14, borderWidth: 1, borderColor: K.line, paddingHorizontal: 14 },
  factRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11 },
  factText: { flex: 1, fontFamily: F.regular, fontSize: 13, lineHeight: 18, color: K.ink },

  protoLink: { marginTop: 14, alignItems: 'center' },
  protoText: { fontFamily: F.medium, fontSize: 12, lineHeight: 16, color: K.sub, textDecorationLine: 'underline' },
});
