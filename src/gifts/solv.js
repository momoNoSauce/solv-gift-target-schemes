// Solv app scheme-card system.
//
// One card anatomy for every scheme, so the list reads as one page:
//   [festive header band]  only a themed scheme wears it (crafted scene, motif)
//   [plain title row]      the default scheme's title + days chip
//   gift row               the gift won (YOU WON) or the top gift (TOP GIFT)
//   one sentence           what to do, or what happened
//   the bar                current leg, next gift's photo on the bar's end
//   the gift strip         "8 gifts • up to the iPhone 17" with mini photos
// The card BODY is always white; a theme paints the band and the bar's fill.
// Body text accents stay Solv blue on every card so the list reads as one page.
//
// SOLV.blue is an assumption: replace with the real Solv brand tokens at build.
//
// The bar carries a scale. A fill with no numbers on it cannot be read: the card
// names where the buying is (value above the fill, with a knob on the fill's
// end), what the leg costs (values under each end) and the gift next up (photo
// at the bar's end). The bar measures the CURRENT LEG (slab won to slab next),
// the distance the customer can act on.
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
  green: '#1E8E3E',
  greenBg: '#E9F5EC',
  red: '#C2410C',
};

// A 1px outline on photos, pure black at low alpha so it reads as the image's
// edge on any surface (never a tinted grey).
const PHOTO_EDGE = 'rgba(0,0,0,0.08)';
const TABULAR = { fontVariant: ['tabular-nums'] };

const BAR_END_W = 32;   // the reward medallion sitting on the bar's end
const BAR_GAP = 10;     // clear space between the track and that medallion

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

// Headless capture (navigator.webdriver) renders the final state directly: the
// screenshot pipeline must not race the entrance and fill animations.
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
//   theme, title, line, lineTone: 'default'|'accent'|'good'|'urgent'|'muted'
//   chip: { text, tone: 'time'|'good'|'muted' }
//   giftRow: { caption, gift, tone } | null    the won gift, or the top gift
//   reward:  { name, short, image?, voucher? } the gift the bar is heading to
//   leg:     { from, to, current, fmt }        the current leg
//   strip:   { count, topShort, gifts } | null the whole-ladder summary
//   dim: true for terminal cards in the Completed tab
export function SchemeCard({ card, onPress, index = 0 }) {
  const th = themeOf(card.theme);
  const festive = Boolean(th.motif);
  const [barW, setBarW] = useState(0);
  const press = usePressScale(0.98);

  const accentText = SOLV.blue;
  const fill = festive ? th.stage.accent : SOLV.blue;

  const lineColor = {
    default: SOLV.sub,
    accent: accentText,
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
  const trackW = Math.max(0, barW - BAR_END_W - BAR_GAP);

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

  const knobLeft = fillAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-5, Math.max(-5, pct * trackW - 5)],
  });

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
        <View style={[styles.card, card.dim && { opacity: 0.72 }]}>
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
            {card.giftRow ? (
              <View style={styles.giftRow}>
                <View style={styles.thumb}>
                  <GiftThumb gift={card.giftRow.gift} size={38} accent={accentText} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.giftCaption, { color: card.giftRow.tone === 'good' ? SOLV.green : accentText }]}
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

            <Text style={[styles.line, TABULAR, { color: lineColor }]} numberOfLines={2} allowFontScaling={false}>
              {card.line}
            </Text>

            {leg ? (
              <View onLayout={(e) => setBarW(e.nativeEvent.layout.width)}>
                {/* Where the buying stands, on the fill's end, clamped to the track. */}
                <View style={styles.currentRow}>
                  {barW > 0 && leg.current > leg.from ? (
                    <Text
                      style={[styles.currentValue, TABULAR, { color: accentText, left: clamp(pct * trackW - 18, 0, Math.max(0, trackW - 44)) }]}
                      allowFontScaling={false}
                    >
                      {leg.fmt(leg.current)}
                    </Text>
                  ) : null}
                </View>

                <View style={styles.barZone}>
                  <View style={styles.barTrack}>
                    <Animated.View
                      style={[
                        styles.barFill,
                        {
                          backgroundColor: fill,
                          width: fillAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', `${pct * 100}%`] }),
                        },
                      ]}
                    />
                  </View>
                  {/* The knob marks the fill's end so the floating value has an anchor. */}
                  {barW > 0 && leg.current > leg.from ? (
                    <Animated.View style={[styles.knob, { borderColor: fill, left: knobLeft }]} />
                  ) : null}
                  <View style={styles.barEnd}>
                    <GiftThumb gift={card.reward} size={26} accent={accentText} />
                  </View>
                </View>

                {/* What the leg costs, and the gift waiting at the far end. */}
                <View style={[styles.legRow, { marginRight: BAR_END_W + BAR_GAP }]}>
                  <Text style={[styles.legValue, TABULAR]} allowFontScaling={false}>{leg.fmt(leg.from)}</Text>
                  <View style={styles.legRight}>
                    <Text style={[styles.legValue, TABULAR]} allowFontScaling={false}>{leg.fmt(leg.to)}</Text>
                    <Text style={styles.legNext} numberOfLines={1} allowFontScaling={false}>
                      {card.reward?.short || card.reward?.name}
                    </Text>
                  </View>
                </View>
              </View>
            ) : null}

            {card.strip ? (
              <View style={styles.strip}>
                <View style={styles.stripThumbs}>
                  {card.strip.gifts.slice(0, 5).map((g, i) => (
                    <View key={g.at} style={[styles.stripThumb, i > 0 && { marginLeft: -6 }]}>
                      {g.voucher ? (
                        <Text style={{ color: SOLV.blue, fontFamily: F.bold, fontSize: 10 }} allowFontScaling={false}>₹</Text>
                      ) : g.image ? (
                        <Image source={g.image} style={{ width: 16, height: 16 }} resizeMode="contain" />
                      ) : (
                        <GiftGlyph kind={g.icon || 'gift'} size={13} color={SOLV.sub} strokeWidth={1.7} />
                      )}
                    </View>
                  ))}
                  {card.strip.count > 5 ? (
                    <View style={[styles.stripThumb, styles.stripMore, { marginLeft: -6 }]}>
                      <Text style={[styles.stripMoreText, TABULAR]} allowFontScaling={false}>+{card.strip.count - 5}</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={[styles.stripText, TABULAR]} numberOfLines={1} allowFontScaling={false}>
                  {card.strip.count} gifts • up to the {card.strip.topShort}
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
  band: { height: 44, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, overflow: 'hidden' },
  bandTitle: { flex: 1, color: '#fff', fontFamily: F.bold, fontSize: 14, lineHeight: 18, letterSpacing: 0.1 },
  titleRow: { height: 44, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingTop: 6 },
  title: { flex: 1, color: SOLV.ink, fontFamily: F.bold, fontSize: 14, lineHeight: 18, letterSpacing: 0.1 },
  chip: { height: 22, borderRadius: 11, paddingHorizontal: 9, alignItems: 'center', justifyContent: 'center' },
  chipText: { fontFamily: F.bold, fontSize: 10, lineHeight: 13, letterSpacing: 0.4 },

  body: { paddingHorizontal: 14, paddingBottom: 14 },
  giftRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  thumb: { width: 46, height: 46, borderRadius: 10, backgroundColor: SOLV.paper, borderWidth: 1, borderColor: PHOTO_EDGE, alignItems: 'center', justifyContent: 'center' },
  giftCaption: { fontFamily: F.bold, fontSize: 10, lineHeight: 13, letterSpacing: 0.6 },
  giftName: { marginTop: 1, color: SOLV.ink, fontFamily: F.medium, fontSize: 13, lineHeight: 17 },
  line: { marginTop: 10, fontFamily: F.medium, fontSize: 13, lineHeight: 18 },

  currentRow: { height: 16, marginTop: 10 },
  currentValue: { position: 'absolute', fontFamily: F.bold, fontSize: 11, lineHeight: 14 },
  barZone: { height: BAR_END_W, justifyContent: 'center' },
  barTrack: { height: 6, borderRadius: 3, backgroundColor: '#EEF0F3', marginRight: BAR_END_W + BAR_GAP, overflow: 'hidden' },
  barFill: { height: 6, borderRadius: 3 },
  knob: {
    position: 'absolute',
    top: BAR_END_W / 2 - 5,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    borderWidth: 2.5,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  barEnd: {
    position: 'absolute',
    right: 0,
    width: BAR_END_W,
    height: BAR_END_W,
    borderRadius: 11,
    backgroundColor: SOLV.paper,
    borderWidth: 1,
    borderColor: PHOTO_EDGE,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  legRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 2 },
  legRight: { alignItems: 'flex-end' },
  legValue: { color: SOLV.sub, fontFamily: F.medium, fontSize: 11, lineHeight: 14 },
  legNext: { color: SOLV.sub, fontFamily: F.bold, fontSize: 11, lineHeight: 14 },

  strip: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F2F3F5' },
  stripThumbs: { flexDirection: 'row', alignItems: 'center' },
  stripThumb: {
    width: 22,
    height: 22,
    borderRadius: 7,
    backgroundColor: SOLV.paper,
    borderWidth: 1,
    borderColor: PHOTO_EDGE,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  stripMore: { backgroundColor: '#F4F5F7' },
  stripMoreText: { color: SOLV.sub, fontFamily: F.bold, fontSize: 8.5, lineHeight: 11 },
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
  const wonRow = held ? { caption: 'YOU WON', gift: held, tone: 'good' } : null;
  // The whole-ladder summary: without it a card shows at most two gifts and the
  // customer cannot tell the scheme holds eight.
  const strip = !s.ended && s.ladder.length > 1
    ? { count: s.ladder.length, topShort: s.top.shortName, gifts: s.ladder.map(gift) }
    : null;
  const base = { theme, title, giftRow: wonRow, reward: next || top, strip };

  if (s.state === STATE.SCHEDULED) {
    return {
      ...base,
      giftRow: { caption: 'TOP GIFT', gift: top, tone: 'accent' },
      reward: top,
      line: `First gift at ${fmt(s.ladder[0].at)}.`,
      chip: { text: 'STARTS ' + s.startLabel.replace(/ \d{4}$/, '').toUpperCase(), tone: 'muted' },
    };
  }
  if (s.state === STATE.ENDED_MISSED) {
    return { ...base, giftRow: null, reward: top, line: 'Scheme ended below the first slab.', lineTone: 'muted', chip: { text: 'ENDED', tone: 'muted' }, dim: true };
  }
  if (s.state === STATE.ENDED_PENDING) {
    return { ...base, reward: held, line: 'Scheme ended. We are confirming your gift.', chip: { text: 'ENDED', tone: 'muted' } };
  }
  if (s.state === STATE.GIFT_ORDERED) {
    return { ...base, reward: held, line: 'On the way to your shop.', lineTone: 'accent', chip: { text: 'ON THE WAY', tone: 'time' } };
  }
  if (s.state === STATE.DELIVERED) {
    return { ...base, dim: true, reward: held, line: 'Delivered to your shop.', lineTone: 'good', chip: { text: 'DELIVERED', tone: 'good' } };
  }
  if (s.state === STATE.TOP_REACHED) {
    return { ...base, reward: held, line: 'The top gift. Nothing is left to win.', lineTone: 'good', chip: { text: `${s.daysLeft} DAYS LEFT`, tone: 'time' } };
  }

  // LIVE, EARNED, NEAR_SLAB: the bar runs from the slab won to the slab next.
  // Urgency reads s.nearSlab, not the state: the flag also fires on the leg to the
  // FIRST slab (state LIVE), which is the whole ladder of a single-slab scheme.
  const line = s.nearSlab
    ? `Only ${money(s.remaining)} left for the ${s.next.shortName}`
    : !held
    ? s.currentValue > 0
      ? `${money(s.remaining)} more and the ${s.next.shortName} is yours`
      : `Buy for ${money(s.next.at)} and the ${s.next.shortName} is yours`
    : `${money(s.remaining)} more and the ${s.next.shortName} replaces the ${s.secured.shortName}`;

  return {
    ...base,
    line,
    lineTone: s.nearSlab ? 'urgent' : 'accent',
    chip: { text: `${s.daysLeft} DAYS LEFT`, tone: 'time' },
    leg: {
      from: s.secured ? s.secured.at : 0,
      to: s.next.at,
      current: s.currentValue,
      fmt,
    },
  };
}
