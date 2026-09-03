// Solv app scheme-card system.
//
// Hierarchy: the TITLE is the largest text on the card; the ask reads as one
// sentence under it ("₹3,60,000 more to win the Soundbar", amount in bold).
// Progress speaks the app's own language: a RUNNING MAN on the fill, a FLAG
// planted at the target, the next gift as a small medallion above the flag,
// and the bought amount as a value tag riding the runner.
//
// One anatomy for every scheme, so the list reads as one page:
//   [festive header band]  only a themed scheme wears it (scene + motif)
//   [plain title row]      the default scheme's title + days chip
//   the ask sentence, the rail (runner, flag, medallion), the slab values,
//   the "You won" line BELOW the progress, the whole-ladder strip
// The card BODY is always white; a theme paints the band and the rail's fill.
//
// SOLV.blue is an assumption: replace with the real Solv brand tokens at build.
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { F } from '../theme';
import { IconRunningMan, IconTargetFlag } from '../icons';
import GiftGlyph from './icons';
import { STATE } from './state';
import { themeOf } from './themes';
import { BandScene } from './Scene';

export const SOLV = {
  blue: '#0A66E8',        // assumption: Solv primary
  blueDark: '#0847A6',
  blueBg: '#EAF2FF',
  ink: '#1A1A1A',
  sub: '#6B6B6B',
  line: '#ECECEC',
  paper: '#FFFFFF',
  bg: '#F5F7FA',
  green: '#177E36',
  greenBg: '#E9F5EC',
  red: '#C2410C',
};

// A 1px outline on photos, pure black at low alpha so it reads as the image's
// edge on any surface (never a tinted grey).
const PHOTO_EDGE = 'rgba(0,0,0,0.08)';
const TABULAR = { fontVariant: ['tabular-nums'] };

// Rail geometry: the flag (the target) plants RAIL_END px in from the right so
// the medallion above it stays inside the card.
const RAIL_END = 18;
const MEDAL = 36;

// A voucher has no product photo; it renders as a small voucher card, never as a
// line glyph. `gift.voucher` carries the amount label.
export function VoucherThumb({ amount, size = 40 }) {
  const w = size * 0.96;
  const h = size * 0.66;
  return (
    <LinearGradient
      colors={[SOLV.blue, SOLV.blueDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ width: w, height: h, borderRadius: size * 0.13, alignItems: 'center', justifyContent: 'center' }}
    >
      <Text style={[{ color: '#fff', fontFamily: F.bold, fontSize: size * 0.26, lineHeight: size * 0.32 }, TABULAR]} allowFontScaling={false}>
        {amount}
      </Text>
      <Text
        style={{ color: '#BBD4FF', fontFamily: F.bold, fontSize: size * 0.13, lineHeight: size * 0.17, letterSpacing: 1 }}
        allowFontScaling={false}
      >
        VOUCHER
      </Text>
    </LinearGradient>
  );
}

// The content inside a gift tile: photo first, voucher card for vouchers, and the
// glyph only as a last-resort fallback for a gift with no verified photo yet.
export function GiftThumb({ gift, size = 40, accent = SOLV.blue }) {
  if (!gift) return null;
  if (gift.voucher && size < 30) {
    // Below 30px the amount cannot be read; a ₹ disc says "money" at a glance.
    return (
      <LinearGradient
        colors={[SOLV.blue, SOLV.blueDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ width: size * 0.8, height: size * 0.8, borderRadius: size * 0.4, alignItems: 'center', justifyContent: 'center' }}
      >
        <Text style={{ color: '#fff', fontFamily: F.bold, fontSize: size * 0.42 }} allowFontScaling={false}>₹</Text>
      </LinearGradient>
    );
  }
  if (gift.voucher) return <VoucherThumb amount={gift.voucher} size={size} />;
  if (gift.image) return <Image source={gift.image} style={{ width: size, height: size }} resizeMode="contain" />;
  return <GiftGlyph kind={gift.icon || 'gift'} size={Math.round(size * 0.62)} color={accent} strokeWidth={1.6} />;
}

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// Headless capture renders the final state directly: the screenshot pipeline
// must not race the entrance and fill animations.
const STATIC =
  typeof navigator !== 'undefined' &&
  (navigator.webdriver === true || /HeadlessChrome/.test(navigator.userAgent || ''));

// A spring-driven press scale. A style swap snaps between frames; the spring
// makes both the press and the release read as one continuous motion.
export function usePressScale(to = 0.98) {
  const scale = useRef(new Animated.Value(1)).current;
  const pressIn = () => Animated.spring(scale, { toValue: to, speed: 40, bounciness: 0, useNativeDriver: false }).start();
  const pressOut = () => Animated.spring(scale, { toValue: 1, speed: 24, bounciness: 5, useNativeDriver: false }).start();
  return { scale, pressIn, pressOut };
}

// One scheme card. `card` comes from solvSchemeCard():
//   theme, title, chip: { text, tone: 'time'|'good'|'muted' }
//   sentence: { pre?, val, post?, tail?, tone? }   the ask, one line of copy
//   giftRow: { caption, gift } | null              terminal/scheduled gift row
//   line: string | null, lineTone                  status line
//   reward: the gift on the rail's medallion; won: { short } | null
//   leg: { from, to, current, fmt } | null         the rail
//   strip: { count, topShort, gifts, short? } | null
//   dim: true for terminal cards in the Completed tab
export function SchemeCard({ card, onPress, index = 0 }) {
  const th = themeOf(card.theme);
  const festive = Boolean(th.motif);
  const [barW, setBarW] = useState(0);
  const [tagW, setTagW] = useState(96);
  const press = usePressScale(0.98);

  const fill = festive ? th.stage.accent : SOLV.blue;
  const capColor = th.stage.accentDeep;

  const lineColor = {
    default: SOLV.sub,
    accent: SOLV.blue,
    good: SOLV.green,
    urgent: SOLV.red,
    muted: SOLV.sub,
  }[card.lineTone || 'default'];

  const chipStyle = {
    time: festive
      ? { bg: th.stage.accent, fg: th.stage.accentInk }
      : { bg: SOLV.blueBg, fg: SOLV.blueDark },
    good: { bg: SOLV.greenBg, fg: SOLV.green },
    muted: festive ? { bg: 'rgba(255,255,255,0.16)', fg: '#fff' } : { bg: '#F0F0F0', fg: SOLV.sub },
  }[card.chip?.tone || 'time'];

  const leg = card.leg;
  const span = leg ? Math.max(1, leg.to - leg.from) : 1;
  const pct = leg ? clamp((leg.current - leg.from) / span, 0, 1) : 0;
  const targetX = Math.max(0, barW - RAIL_END);

  // Motion: the card fades in with a small rise; the fill sweeps to its value
  // and the runner runs with it.
  const enter = useRef(new Animated.Value(STATIC ? 1 : 0)).current;
  const fillAnim = useRef(new Animated.Value(STATIC ? 1 : 0)).current;
  useEffect(() => {
    if (STATIC) return;
    Animated.timing(enter, { toValue: 1, duration: 320, delay: index * 70, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [enter, index]);
  useEffect(() => {
    if (STATIC) return;
    if (barW > 0) {
      Animated.timing(fillAnim, { toValue: 1, duration: 650, delay: index * 70 + 150, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
    }
  }, [barW, pct, fillAnim, index]);

  const chip = card.chip ? (
    <View style={[styles.chip, { backgroundColor: chipStyle.bg }]}>
      <Text style={[styles.chipText, TABULAR, { color: chipStyle.fg }]} allowFontScaling={false}>
        {card.chip.text}
      </Text>
    </View>
  ) : null;

  // A tappable card must SAY it opens (Norman: perceivable signifier); a card
  // with no detail page shows nothing and does not pretend. The View wrapper is
  // positioned (RN default), so the glyph paints above the band's absolute scene.
  const chevron = onPress ? (
    <View>
      <Svg width={18} height={18} viewBox="0 0 24 24">
        <Path fill={festive ? 'rgba(255,255,255,0.75)' : '#A9AEB8'} d="M8.59,16.58L13.17,12L8.59,7.41L10,6l6,6l-6,6L8.59,16.58z" />
      </Svg>
    </View>
  ) : null;

  const sen = card.sentence;
  const runnerX = clamp(pct * targetX - 10, 0, Math.max(0, targetX - 14));

  return (
    <Animated.View
      style={{
        opacity: enter,
        transform: [
          { translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) },
          { scale: press.scale },
        ],
      }}
    >
      <Pressable onPress={onPress} onPressIn={onPress ? press.pressIn : undefined} onPressOut={onPress ? press.pressOut : undefined}>
        <View style={[styles.card, card.dim && { opacity: 0.86 }]}>
          {festive ? (
            <View style={styles.band}>
              <BandScene stage={th.stage} />
              {/* The wrapper View is positioned (RN default), so the glyph paints
                  ABOVE the absolutely-positioned scene; a bare svg is static and
                  would paint underneath it. */}
              <View>
                <GiftGlyph kind={th.motif} size={16} color={th.stage.accent} strokeWidth={1.7} />
              </View>
              <Text style={styles.bandTitle} numberOfLines={1} allowFontScaling={false}>{card.title}</Text>
              {chip}
              {chevron}
            </View>
          ) : (
            <View style={styles.titleRow}>
              <Text style={styles.title} numberOfLines={1} allowFontScaling={false}>{card.title}</Text>
              {chip}
              {chevron}
            </View>
          )}

          <View style={styles.body}>
            {sen ? (
              <Text style={styles.sentence} numberOfLines={2} allowFontScaling={false}>
                {sen.pre || ''}
                <Text style={[styles.sentenceVal, TABULAR, sen.tone === 'urgent' && { color: SOLV.red }]}>{sen.val}</Text>
                {(sen.post || '') + (sen.tail ? ` ${sen.tail}` : '')}
              </Text>
            ) : null}

            {card.giftRow ? (
              <View style={styles.giftRow}>
                <View style={styles.thumb}>
                  <GiftThumb gift={card.giftRow.gift} size={38} accent={capColor} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.giftCaption, { color: card.giftRow.caption === 'YOU WON' ? SOLV.green : capColor }]}
                    allowFontScaling={false}
                  >
                    {card.giftRow.caption}
                  </Text>
                  <Text style={styles.giftName} numberOfLines={1} allowFontScaling={false}>
                    {card.giftRow.gift.name}
                  </Text>
                </View>
              </View>
            ) : null}

            {card.line ? (
              <Text style={[styles.line, { color: lineColor }]} numberOfLines={2} allowFontScaling={false}>
                {card.line}
              </Text>
            ) : null}

            {leg ? (
              <View style={styles.rail} onLayout={(e) => setBarW(e.nativeEvent.layout.width)}>
                {/* Above the rail: the bought tag rides the runner; the next gift
                    waits above the flag. */}
                <View style={styles.railTop}>
                  {barW > 0 && leg.current > leg.from ? (
                    <Animated.View
                      style={[
                        styles.tagWrap,
                        { opacity: fillAnim, left: clamp(pct * targetX - tagW / 2, 0, Math.max(0, barW - MEDAL - tagW - 6)) },
                      ]}
                      onLayout={(e) => setTagW(e.nativeEvent.layout.width)}
                    >
                      <View style={styles.tag}>
                        <Text style={[styles.tagText, TABULAR]} numberOfLines={1} allowFontScaling={false}>
                          {leg.fmt(leg.current)}
                        </Text>
                      </View>
                      <View style={styles.tagCaret} />
                    </Animated.View>
                  ) : null}
                  {card.reward ? (
                    <View style={styles.railMedallion}>
                      <GiftThumb gift={card.reward} size={28} accent={capColor} />
                    </View>
                  ) : null}
                </View>

                {/* The rail: fill sweeps, the runner runs on it, the flag marks
                    the target (grey until crossed, the app's own rule). */}
                <View style={styles.railBar}>
                  <View style={styles.railTrack}>
                    <Animated.View
                      style={[
                        styles.railFill,
                        { backgroundColor: fill, width: fillAnim.interpolate({ inputRange: [0, 1], outputRange: [0, pct * targetX] }) },
                      ]}
                    />
                  </View>
                  {barW > 0 ? (
                    <View style={[styles.flag, { left: targetX - 1 }]}>
                      <IconTargetFlag width={11} height={20} color="#C7CCD4" />
                    </View>
                  ) : null}
                  {barW > 0 ? (
                    <Animated.View
                      style={[
                        styles.runner,
                        { left: fillAnim.interpolate({ inputRange: [0, 1], outputRange: [0, runnerX] }) },
                      ]}
                    >
                      <IconRunningMan height={20} color={fill} />
                    </Animated.View>
                  ) : null}
                </View>
                <View style={styles.legRow}>
                  <Text style={[styles.legValue, TABULAR]} allowFontScaling={false}>{leg.fmt(leg.from)}</Text>
                  <Text style={[styles.legValue, TABULAR]} allowFontScaling={false}>{leg.fmt(leg.to)}</Text>
                </View>
              </View>
            ) : null}

            {/* The won gift sits BELOW the progress: a settled fact under the
                rail, next to the slab where it was won. */}
            {card.won ? (
              <View style={styles.wonRow}>
                <GiftGlyph kind="check" size={14} color={SOLV.green} strokeWidth={2} />
                <Text style={styles.wonText} numberOfLines={1} allowFontScaling={false}>
                  You've qualified for the {card.won.short}
                </Text>
              </View>
            ) : null}

            {card.strip ? (
              <View style={styles.strip}>
                <View style={styles.stripThumbs}>
                  {card.strip.gifts.slice(0, 5).map((g) => (
                    <View key={g.at} style={styles.stripThumb}>
                      {g.voucher ? (
                        <Text style={{ color: SOLV.blue, fontFamily: F.bold, fontSize: 11 }} allowFontScaling={false}>₹</Text>
                      ) : g.image ? (
                        <Image source={g.image} style={{ width: 18, height: 18 }} resizeMode="contain" />
                      ) : (
                        <GiftGlyph kind={g.icon || 'gift'} size={14} color={SOLV.sub} strokeWidth={1.7} />
                      )}
                    </View>
                  ))}
                  {card.strip.count > 5 ? (
                    <View style={[styles.stripThumb, styles.stripMore]}>
                      <Text style={[styles.stripMoreText, TABULAR]} allowFontScaling={false}>+{card.strip.count - 5}</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={[styles.stripText, TABULAR]} numberOfLines={1} allowFontScaling={false}>
                  {card.strip.short ? `${card.strip.count} gifts` : `${card.strip.count} gifts • up to the ${card.strip.topShort}`}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    backgroundColor: SOLV.paper,
    borderWidth: 1,
    borderColor: 'rgba(17,24,39,0.06)',
    overflow: 'hidden',
    shadowColor: '#0B1B33',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  band: { height: 44, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, overflow: 'hidden' },
  bandTitle: { flex: 1, color: '#fff', fontFamily: F.bold, fontSize: 14, lineHeight: 18, letterSpacing: 0.1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingTop: 14 },
  title: { flex: 1, color: SOLV.ink, fontFamily: F.bold, fontSize: 14, lineHeight: 18, letterSpacing: 0.1 },
  chip: { height: 22, borderRadius: 11, paddingHorizontal: 9, alignItems: 'center', justifyContent: 'center' },
  chipText: { fontFamily: F.bold, fontSize: 10, lineHeight: 13, letterSpacing: 0.4 },

  body: { paddingHorizontal: 16, paddingBottom: 14 },

  sentence: { marginTop: 10, color: SOLV.sub, fontFamily: F.medium, fontSize: 13, lineHeight: 18 },
  sentenceVal: { color: SOLV.ink, fontFamily: F.bold, fontSize: 14 },

  giftRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  thumb: { width: 46, height: 46, borderRadius: 10, backgroundColor: SOLV.paper, borderWidth: 1, borderColor: PHOTO_EDGE, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  giftCaption: { fontFamily: F.bold, fontSize: 10, lineHeight: 13, letterSpacing: 0.6 },
  giftName: { marginTop: 1, color: SOLV.ink, fontFamily: F.medium, fontSize: 13, lineHeight: 17 },
  line: { marginTop: 8, fontFamily: F.medium, fontSize: 13, lineHeight: 18 },

  rail: { marginTop: 6 },
  railTop: { height: 38, marginBottom: 4 },
  railMedallion: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: MEDAL,
    height: MEDAL,
    borderRadius: 12,
    backgroundColor: SOLV.paper,
    borderWidth: 1,
    borderColor: PHOTO_EDGE,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  tagWrap: { position: 'absolute', bottom: 0, alignItems: 'center' },
  tag: { backgroundColor: '#1F2430', borderRadius: 7, paddingHorizontal: 8, height: 22, justifyContent: 'center' },
  tagText: { color: '#fff', fontFamily: F.bold, fontSize: 10.5, lineHeight: 13 },
  tagCaret: { width: 8, height: 8, marginTop: -5, backgroundColor: '#1F2430', transform: [{ rotate: '45deg' }] },

  railBar: { height: 26, justifyContent: 'flex-end' },
  railTrack: { height: 6, borderRadius: 3, backgroundColor: '#EEF0F3', overflow: 'hidden' },
  railFill: { height: 6, borderRadius: 3 },
  runner: { position: 'absolute', bottom: 5 },
  flag: { position: 'absolute', bottom: 5 },
  legRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  legValue: { color: SOLV.sub, fontFamily: F.medium, fontSize: 11, lineHeight: 14 },

  wonRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10 },
  wonText: { color: SOLV.green, fontFamily: F.medium, fontSize: 12, lineHeight: 15 },

  strip: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F2F3F5' },
  stripThumbs: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stripThumb: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: SOLV.paper,
    borderWidth: 1,
    borderColor: PHOTO_EDGE,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  stripMore: { backgroundColor: '#F4F5F7' },
  stripMoreText: { color: SOLV.sub, fontFamily: F.bold, fontSize: 9, lineHeight: 12 },
  stripText: { flex: 1, color: SOLV.sub, fontFamily: F.medium, fontSize: 11.5, lineHeight: 15 },
});

const gift = (t) => (t ? { at: t.at, name: t.name, short: t.shortName, image: t.image, icon: t.icon, voucher: t.voucher } : null);

// Map a schemeState() result onto a card. The list and the states page both call this,
// so a state can never be drawn two different ways in the same app.
// `fmt` formats the scheme's unit; `money` formats a gap in words the customer reads.
export function solvSchemeCard(s, { title, theme = 'default', fmt, money }) {
  const held = gift(s.secured);
  const next = gift(s.next);
  const top = gift(s.top);
  // The whole-ladder summary: without it a card shows at most two gifts and the
  // customer cannot tell the scheme holds eight.
  const strip = !s.ended && s.ladder.length > 1
    ? { count: s.ladder.length, topShort: s.top.shortName, gifts: s.ladder.map(gift) }
    : null;
  const base = { theme, title, strip };

  if (s.state === STATE.SCHEDULED) {
    return {
      ...base,
      // The gift row already names the top gift, so the strip says only the count.
      strip: strip ? { ...strip, short: true } : null,
      giftRow: { caption: 'TOP GIFT', gift: top },
      line: `First gift at ${fmt(s.ladder[0].at)}.`,
      chip: { text: 'STARTS ' + s.startLabel.replace(/ \d{4}$/, '').toUpperCase(), tone: 'muted' },
    };
  }
  if (s.state === STATE.ENDED_MISSED) {
    return {
      ...base,
      strip: null,
      line: 'Scheme ended below the first slab.',
      lineTone: 'muted',
      chip: { text: 'ENDED', tone: 'muted' },
      dim: true,
    };
  }
  // The ended-with-a-win states: the won gift is the story.
  const wonBase = held
    ? { ...base, strip: null, giftRow: { caption: 'YOU WON', gift: held } }
    : base;
  if (s.state === STATE.ENDED_PENDING) {
    return { ...wonBase, line: 'Scheme ended. We are confirming your gift.', chip: { text: 'ENDED', tone: 'muted' } };
  }
  if (s.state === STATE.GIFT_ORDERED) {
    return { ...wonBase, line: 'On the way to your shop.', lineTone: 'accent', chip: { text: 'ON THE WAY', tone: 'time' } };
  }
  if (s.state === STATE.DELIVERED) {
    return { ...wonBase, line: 'Delivered to your shop.', lineTone: 'good', dim: true, chip: { text: 'DELIVERED', tone: 'good' } };
  }
  if (s.state === STATE.TOP_REACHED) {
    return {
      ...wonBase,
      strip: null,
      line: 'The top gift. Nothing is left to win.',
      lineTone: 'good',
      chip: { text: `${s.daysLeft} DAYS LEFT`, tone: 'time' },
    };
  }

  // LIVE, EARNED, NEAR_SLAB: one sentence carries the ask; the rail carries the
  // runner, the flag and the next gift. Urgency reads s.nearSlab, not the state:
  // the flag also fires on the leg to the FIRST slab (state LIVE), which is the
  // whole ladder of a single-slab scheme.
  const tail = `to win the ${s.next.shortName}`;
  const sentence = s.nearSlab
    ? { pre: 'Buy just ', val: money(s.remaining), post: ' more', tail, tone: 'urgent' }
    : s.currentValue > 0
    ? { pre: 'Buy ', val: money(s.remaining), post: ' more', tail }
    : { pre: 'Buy for ', val: money(s.next.at), tail };

  return {
    ...base,
    won: held ? { short: s.secured.shortName } : null,
    sentence,
    reward: next,
    chip: { text: `${s.daysLeft} DAYS LEFT`, tone: 'time' },
    leg: {
      from: s.secured ? s.secured.at : 0,
      to: s.next.at,
      current: s.currentValue,
      fmt,
    },
  };
}
