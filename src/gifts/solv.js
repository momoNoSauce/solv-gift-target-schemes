// Solv app scheme-card system.
//
// The card is composed around two objects, because the scheme is about them:
//   1. the AMOUNT, the largest text on the card (what the shop must still buy),
//   2. the GIFT, a large photo on a tinted showcase tile (what they get for it).
// Everything else supports those two: a one-line payoff under the amount, a
// meter with a knob, the slab values, a "You won" confirmation once a slab is
// crossed, and a strip that shows the whole ladder at a glance.
//
// One anatomy for every scheme, so the list reads as one page:
//   [festive header band]  only a themed scheme wears it (scene + motif)
//   [plain title row]      the default scheme's title + days chip
//   left: won row, amount, payoff   right: the gift showcase
//   the meter, the slab values, the gift strip
// The card BODY is always white; a theme paints the band, the meter's fill and
// the showcase tint. Body text stays ink and grey on every card.
//
// SOLV.blue is an assumption: replace with the real Solv brand tokens at build.
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { F } from '../theme';
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
//   won: { short } | null                      running confirmation row
//   headline: { pre?, val, post?, tone? } or { text }   the big line
//   context: string | null, contextTone: 'default'|'accent'|'good'|'urgent'|'muted'
//   showcase: { gift, caption } | null         the large gift tile
//   leg: { from, to, current, fmt } | null     the meter
//   strip: { count, topShort, gifts } | null   the whole-ladder summary
//   dim: true for terminal cards in the Completed tab
export function SchemeCard({ card, onPress, index = 0 }) {
  const th = themeOf(card.theme);
  const festive = Boolean(th.motif);
  const [barW, setBarW] = useState(0);
  const [tagW, setTagW] = useState(96);
  const press = usePressScale(0.98);

  const fill = festive ? th.stage.accent : SOLV.blue;
  const capColor = th.stage.accentDeep;

  const contextColor = {
    default: SOLV.sub,
    accent: SOLV.blue,
    good: SOLV.green,
    urgent: SOLV.red,
    muted: SOLV.sub,
  }[card.contextTone || 'default'];

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

  // Motion: the card fades in with a small rise; the fill sweeps to its value.
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

  const h = card.headline;

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
            </View>
          ) : (
            <View style={styles.titleRow}>
              <Text style={styles.title} numberOfLines={1} allowFontScaling={false}>{card.title}</Text>
              {chip}
            </View>
          )}

          <View style={styles.body}>
            <View style={styles.contentRow}>
              <View style={styles.leftCol}>
                {h ? (
                  h.text ? (
                    <Text style={styles.headlineText} numberOfLines={2} allowFontScaling={false}>{h.text}</Text>
                  ) : (
                    <Text
                      style={[styles.headlineVal, TABULAR, h.tone === 'urgent' && { color: SOLV.red }]}
                      numberOfLines={1}
                      allowFontScaling={false}
                    >
                      {h.pre ? <Text style={styles.headlineWord}>{h.pre}</Text> : null}
                      {h.val}
                      {h.post ? <Text style={styles.headlineWord}>{h.post}</Text> : null}
                    </Text>
                  )
                ) : null}

                {card.context ? (
                  <Text style={[styles.context, { color: contextColor }]} numberOfLines={2} allowFontScaling={false}>
                    {card.context}
                  </Text>
                ) : null}
              </View>

              {card.showcase ? (
                <View style={styles.showcaseCol}>
                  <View style={[styles.showcase, { backgroundColor: th.card.tint }]}>
                    {card.showcase.gift?.image ? (
                      // Product photos come on white; an unframed one reads as a
                      // white hole in the tint. A deliberate white frame with its
                      // own radius turns it into a product shot.
                      <View style={styles.showcaseFrame}>
                        <GiftThumb gift={card.showcase.gift} size={62} accent={capColor} />
                      </View>
                    ) : (
                      <GiftThumb gift={card.showcase.gift} size={72} accent={capColor} />
                    )}
                  </View>
                  {card.showcase.caption ? (
                    // One meaning per color: a won caption is green, a goal caption
                    // wears the theme's deep accent.
                    <Text
                      style={[styles.showcaseCaption, { color: card.showcase.caption === 'YOU WON' ? SOLV.green : capColor }]}
                      allowFontScaling={false}
                    >
                      {card.showcase.caption}
                    </Text>
                  ) : null}
                </View>
              ) : null}
            </View>

            {leg ? (
              <View style={styles.meter} onLayout={(e) => setBarW(e.nativeEvent.layout.width)}>
                {/* The bought amount rides the knob as a value tag: the number and
                    its position on the journey are one object. */}
                {barW > 0 && leg.current > leg.from ? (
                  <View style={styles.tagRow}>
                    <Animated.View
                      style={[
                        styles.tagWrap,
                        { opacity: fillAnim, left: clamp(pct * barW - tagW / 2, 0, Math.max(0, barW - tagW)) },
                      ]}
                      onLayout={(e) => setTagW(e.nativeEvent.layout.width)}
                    >
                      <View style={styles.tag}>
                        <Text style={[styles.tagText, TABULAR]} numberOfLines={1} allowFontScaling={false}>
                          {leg.fmt(leg.current)} bought
                        </Text>
                      </View>
                      <View style={styles.tagCaret} />
                    </Animated.View>
                  </View>
                ) : null}
                <View style={styles.meterZone}>
                  <View style={styles.meterTrack}>
                    <Animated.View
                      style={[
                        styles.meterFill,
                        {
                          backgroundColor: fill,
                          width: fillAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', `${pct * 100}%`] }),
                        },
                      ]}
                    />
                  </View>
                  {barW > 0 && leg.current > leg.from ? (
                    <Animated.View
                      style={[
                        styles.knob,
                        {
                          borderColor: fill,
                          left: fillAnim.interpolate({ inputRange: [0, 1], outputRange: [-6, Math.max(-6, pct * barW - 6)] }),
                        },
                      ]}
                    />
                  ) : null}
                </View>
                <View style={styles.legRow}>
                  <Text style={[styles.legValue, TABULAR]} allowFontScaling={false}>{leg.fmt(leg.from)}</Text>
                  <Text style={[styles.legValue, TABULAR]} allowFontScaling={false}>{leg.fmt(leg.to)}</Text>
                </View>
              </View>
            ) : null}

            {/* The won gift sits BELOW the progress: a settled fact under the
                meter, anchored at the slab where it was won. */}
            {card.won ? (
              <View style={styles.wonRow}>
                <GiftGlyph kind="check" size={14} color={SOLV.green} strokeWidth={2} />
                <Text style={styles.wonText} numberOfLines={1} allowFontScaling={false}>
                  You won the {card.won.short}
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
  contentRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 12 },
  leftCol: { flex: 1, justifyContent: 'center' },

  wonRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10 },
  wonText: { color: SOLV.green, fontFamily: F.medium, fontSize: 12, lineHeight: 15 },

  tagRow: { height: 30, marginBottom: 2 },
  tagWrap: { position: 'absolute', alignItems: 'center' },
  tag: { backgroundColor: '#1F2430', borderRadius: 7, paddingHorizontal: 8, height: 22, justifyContent: 'center' },
  tagText: { color: '#fff', fontFamily: F.bold, fontSize: 10.5, lineHeight: 13 },
  tagCaret: { width: 8, height: 8, marginTop: -5, backgroundColor: '#1F2430', transform: [{ rotate: '45deg' }] },

  headlineVal: { color: SOLV.ink, fontFamily: F.bold, fontSize: 22, lineHeight: 28 },
  headlineWord: { color: SOLV.sub, fontFamily: F.medium, fontSize: 14, lineHeight: 28 },
  headlineText: { color: SOLV.ink, fontFamily: F.bold, fontSize: 16, lineHeight: 21 },
  context: { marginTop: 3, fontFamily: F.medium, fontSize: 13, lineHeight: 18 },

  showcaseCol: { alignItems: 'center', width: 92 },
  showcase: {
    width: 92,
    height: 92,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: PHOTO_EDGE,
    overflow: 'hidden',
  },
  showcaseCaption: { marginTop: 6, fontFamily: F.bold, fontSize: 10, lineHeight: 13, letterSpacing: 0.8 },
  showcaseFrame: {
    width: 74,
    height: 74,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: PHOTO_EDGE,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },

  meter: { marginTop: 14 },
  meterZone: { height: 16, justifyContent: 'center' },
  meterTrack: { height: 8, borderRadius: 4, backgroundColor: '#ECEEF1', overflow: 'hidden' },
  meterFill: { height: 8, borderRadius: 4 },
  knob: {
    position: 'absolute',
    top: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
    borderWidth: 2.5,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  legRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  legValue: { color: SOLV.sub, fontFamily: F.medium, fontSize: 11, lineHeight: 14 },
  legCurrent: { color: SOLV.ink, fontFamily: F.bold },

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
      // The headline already names the top gift, so the strip says only the count.
      strip: strip ? { ...strip, short: true } : null,
      headline: { text: s.ladder.length > 1 ? `Gifts up to the ${s.top.shortName}` : `Win a ${s.top.shortName}` },
      context: `First gift at ${fmt(s.ladder[0].at)}.`,
      showcase: { gift: top, caption: 'TOP GIFT' },
      chip: { text: 'STARTS ' + s.startLabel.replace(/ \d{4}$/, '').toUpperCase(), tone: 'muted' },
    };
  }
  if (s.state === STATE.ENDED_MISSED) {
    return {
      ...base,
      strip: null,
      context: 'Scheme ended below the first slab.',
      contextTone: 'muted',
      chip: { text: 'ENDED', tone: 'muted' },
      dim: true,
    };
  }
  // The ended-with-a-win states: the won gift is the story.
  const wonBase = held
    ? { ...base, strip: null, headline: { text: held.name }, showcase: { gift: held, caption: 'YOU WON' } }
    : base;
  if (s.state === STATE.ENDED_PENDING) {
    return { ...wonBase, context: 'Scheme ended. We are confirming your gift.', chip: { text: 'ENDED', tone: 'muted' } };
  }
  if (s.state === STATE.GIFT_ORDERED) {
    return { ...wonBase, context: 'On the way to your shop.', contextTone: 'accent', chip: { text: 'ON THE WAY', tone: 'time' } };
  }
  if (s.state === STATE.DELIVERED) {
    return { ...wonBase, context: 'Delivered to your shop.', contextTone: 'good', dim: true, chip: { text: 'DELIVERED', tone: 'good' } };
  }
  if (s.state === STATE.TOP_REACHED) {
    return {
      ...wonBase,
      strip: null,
      context: 'The top gift. Nothing is left to win.',
      contextTone: 'good',
      chip: { text: `${s.daysLeft} DAYS LEFT`, tone: 'time' },
    };
  }

  // LIVE, EARNED, NEAR_SLAB: the amount is the headline, the next gift is the
  // showcase, and the meter runs over the slab won to the slab next.
  // Urgency reads s.nearSlab, not the state: the flag also fires on the leg to the
  // FIRST slab (state LIVE), which is the whole ladder of a single-slab scheme.
  const headline = s.nearSlab
    ? { pre: 'Only ', val: money(s.remaining), post: ' left', tone: 'urgent' }
    : { val: money(s.remaining), post: s.currentValue > 0 ? ' more' : ' to go' };
  // One frame for every running state: the amount, then what it wins. The
  // one-gift replacement rule lives in the facts and the rules, not here.
  const context = `to win the ${s.next.shortName}`;

  return {
    ...base,
    won: held ? { short: s.secured.shortName } : null,
    headline,
    context,
    showcase: { gift: next, caption: 'NEXT GIFT' },
    chip: { text: `${s.daysLeft} DAYS LEFT`, tone: 'time' },
    leg: {
      from: s.secured ? s.secured.at : 0,
      to: s.next.at,
      current: s.currentValue,
      fmt,
    },
  };
}
