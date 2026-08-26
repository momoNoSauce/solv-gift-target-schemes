// Solv app scheme-card system.
//
// Theming answer, encoded here: the night-purple + gold is the MEGA DIWALI
// CAMPAIGN SKIN, not the scheme system's color. The scheme framework renders in
// Solv app chrome (blue); a festival campaign carries its own skin token set,
// applied to its card and its pages. Regular schemes stay on the default skin.
//
// SOLV.blue is an assumption: replace with the real Solv brand tokens at build.
//
// Card anatomy (reference: Wolt Rewards challenge rows, Grab Challenges cards —
// Mobbin, Aug 2026): thumb | title + one status line | right meta chip, then a slim
// progress bar with the reward's photo at the bar's end (the hub's bar-end pattern,
// from Shopee Member).
//
// The bar carries a scale. A fill with no numbers on it cannot be read: the customer
// cannot tell where they are, what the leg costs, or which gift the far end is. So the
// card names four things and never fewer:
//   1. the gift in hand      the left thumb, captioned YOURS
//   2. where the buying is   the value above the fill's end
//   3. what the leg costs    the slab values under each end of the bar
//   4. the gift next up      the thumb at the bar's end, captioned NEXT
// The bar measures the CURRENT LEG (slab held to slab next), not the whole ladder,
// because the leg is the distance the sentence talks about and the one the customer
// can act on today.
import React, { useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { F } from '../theme';
import GiftGlyph from './icons';
import { STATE } from './state';

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

export const FESTIVAL = {
  night: '#160E33',
  night2: '#2C1D57',
  gold: '#F2B84B',
  goldDeep: '#B4700F',
  nightSub: '#B9ACDF',
  alert: '#FF8A5B',      // urgency on the night skin; gold is already the accent
};

const BAR_END_W = 28;   // the reward thumb sitting on the bar's end
const BAR_GAP = 10;     // clear space between the track and that thumb

// One scheme card. `card`:
//   skin: 'light' | 'festival'
//   title, line, lineTone: 'default'|'accent'|'good'|'urgent'|'muted'
//   chip: { text, tone: 'default'|'gold'|'good'|'muted' }
//   held:   { name, image?, icon? }   the gift already secured, or null
//   reward: { name, image?, icon? }   the gift the bar is heading to
//   leg:    { from, to, current, fmt } the current leg, in the scheme's own unit
//   dim: true for terminal cards in the Ended section
export function SchemeCard({ card, onPress }) {
  const fest = card.skin === 'festival';
  const [barW, setBarW] = useState(0);

  const lineColor = {
    default: fest ? FESTIVAL.nightSub : SOLV.sub,
    accent: fest ? FESTIVAL.gold : SOLV.blue,
    good: fest ? '#6FDB9B' : SOLV.green,
    urgent: fest ? FESTIVAL.alert : SOLV.red,
    muted: fest ? FESTIVAL.nightSub : SOLV.sub,
  }[card.lineTone || 'default'];

  const chipStyle = {
    default: { bg: SOLV.blueBg, fg: SOLV.blueDark },
    gold: { bg: FESTIVAL.gold, fg: FESTIVAL.night },
    good: { bg: SOLV.greenBg, fg: SOLV.green },
    muted: { bg: fest ? 'rgba(255,255,255,0.14)' : '#F0F0F0', fg: fest ? '#fff' : SOLV.sub },
  }[card.chip?.tone || 'default'];

  const subColor = fest ? FESTIVAL.nightSub : SOLV.sub;
  const inkColor = fest ? '#fff' : SOLV.ink;
  const accent = fest ? FESTIVAL.gold : SOLV.blue;

  // The left thumb is the gift in hand. With nothing secured and a bar on the card the
  // column is dropped rather than filled with the reward: the reward already sits at
  // the bar's end with its slab value, and the same product twice says nothing. With no
  // bar there is nothing to duplicate, so the thumb carries the reward instead.
  const leftGift = card.held || (card.leg ? null : card.reward);

  const leg = card.leg;
  const span = leg ? Math.max(1, leg.to - leg.from) : 1;
  const pct = leg ? Math.max(0, Math.min(1, (leg.current - leg.from) / span)) : 0;
  const trackW = Math.max(0, barW - BAR_END_W - BAR_GAP);

  const body = (
    <>
      <View style={styles.row}>
        {leftGift ? (
          <View style={styles.thumbCol}>
            <View style={[styles.thumb, fest && styles.thumbFest, card.dim && { opacity: 0.5 }]}>
              {leftGift.image ? (
                <Image source={leftGift.image} style={styles.thumbImg} resizeMode="contain" />
              ) : (
                <GiftGlyph kind={leftGift.icon || 'gift'} size={26} color={fest ? FESTIVAL.goldDeep : SOLV.blue} strokeWidth={1.6} />
              )}
            </View>
            {card.held ? (
              <Text style={[styles.thumbCaption, { color: fest ? FESTIVAL.gold : SOLV.green }]} allowFontScaling={false}>
                YOURS
              </Text>
            ) : null}
          </View>
        ) : null}

        <View style={styles.mid}>
          <Text style={[styles.title, { color: inkColor }, card.dim && { color: SOLV.sub }]} numberOfLines={1} allowFontScaling={false}>
            {card.title}
          </Text>
          {card.held ? (
            <Text style={[styles.heldName, { color: subColor }]} numberOfLines={1} allowFontScaling={false}>
              {card.held.name}
            </Text>
          ) : null}
          <Text style={[styles.line, { color: lineColor }]} numberOfLines={2} allowFontScaling={false}>
            {card.line}
          </Text>
        </View>

        {card.chip ? (
          <View style={[styles.chip, { backgroundColor: chipStyle.bg }]}>
            <Text style={[styles.chipText, { color: chipStyle.fg }]} allowFontScaling={false}>{card.chip.text}</Text>
          </View>
        ) : null}
      </View>

      {leg ? (
        <View onLayout={(e) => setBarW(e.nativeEvent.layout.width)}>
          {/* Where the buying stands. Positioned on the fill's end once the bar is
              measured, and clamped so it never runs off either side. */}
          <View style={styles.currentRow}>
            {barW > 0 ? (
              <Text
                style={[
                  styles.currentValue,
                  { color: accent, left: clamp(pct * trackW - 18, 0, Math.max(0, trackW - 44)) },
                ]}
                allowFontScaling={false}
              >
                {leg.fmt(leg.current)}
              </Text>
            ) : null}
          </View>

          <View style={styles.barZone}>
            <View style={[styles.barTrack, fest && { backgroundColor: 'rgba(255,255,255,0.16)' }]}>
              <View style={[styles.barFill, { width: `${pct * 100}%`, backgroundColor: accent }]} />
            </View>
            <View style={[styles.barEnd, fest && { borderColor: FESTIVAL.gold }]}>
              {card.reward?.image ? (
                <Image source={card.reward.image} style={{ width: 22, height: 22 }} resizeMode="contain" />
              ) : (
                <GiftGlyph kind={card.reward?.icon || 'gift'} size={16} color={fest ? FESTIVAL.goldDeep : SOLV.blue} strokeWidth={1.7} />
              )}
            </View>
          </View>

          {/* What the leg costs, and the gift waiting at the far end. */}
          <View style={[styles.legRow, { marginRight: BAR_END_W + BAR_GAP }]}>
            <Text style={[styles.legValue, { color: subColor }]} allowFontScaling={false}>
              {leg.fmt(leg.from)}
            </Text>
            <View style={styles.legRight}>
              <Text style={[styles.legValue, { color: subColor }]} allowFontScaling={false}>
                {leg.fmt(leg.to)}
              </Text>
              <Text style={[styles.legNext, { color: subColor }]} numberOfLines={1} allowFontScaling={false}>
                {card.reward?.short || card.reward?.name}
              </Text>
            </View>
          </View>
        </View>
      ) : null}
    </>
  );

  if (fest) {
    return (
      <Pressable onPress={onPress}>
        <LinearGradient colors={[FESTIVAL.night, FESTIVAL.night2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
          {body}
        </LinearGradient>
      </Pressable>
    );
  }
  return (
    <Pressable onPress={onPress}>
      <View style={[styles.card, styles.cardLight, card.dim && { opacity: 0.75 }]}>{body}</View>
    </Pressable>
  );
}

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

const styles = StyleSheet.create({
  card: { borderRadius: 14, padding: 14 },
  cardLight: { backgroundColor: SOLV.paper, borderWidth: 1, borderColor: SOLV.line },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  thumbCol: { alignItems: 'center', width: 48 },
  thumb: { width: 48, height: 48, borderRadius: 10, backgroundColor: SOLV.paper, borderWidth: 1, borderColor: SOLV.line, alignItems: 'center', justifyContent: 'center' },
  thumbFest: { borderColor: 'transparent' },
  thumbImg: { width: 40, height: 40 },
  thumbCaption: { marginTop: 4, fontFamily: F.bold, fontSize: 9, lineHeight: 12 },
  mid: { flex: 1 },
  title: { fontFamily: F.bold, fontSize: 14, lineHeight: 18 },
  heldName: { marginTop: 1, fontFamily: F.medium, fontSize: 11, lineHeight: 14 },
  line: { marginTop: 4, fontFamily: F.medium, fontSize: 12, lineHeight: 16 },
  chip: { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start' },
  chipText: { fontFamily: F.bold, fontSize: 10, lineHeight: 13 },
  currentRow: { height: 16, marginTop: 12 },
  currentValue: { position: 'absolute', fontFamily: F.bold, fontSize: 11, lineHeight: 14 },
  barZone: { height: BAR_END_W, justifyContent: 'center' },
  barTrack: { height: 6, borderRadius: 3, backgroundColor: '#EDEDED', marginRight: BAR_END_W + BAR_GAP, overflow: 'hidden' },
  barFill: { height: 6, borderRadius: 3 },
  barEnd: {
    position: 'absolute',
    right: 0,
    width: BAR_END_W,
    height: BAR_END_W,
    borderRadius: BAR_END_W / 2,
    backgroundColor: SOLV.paper,
    borderWidth: 1.5,
    borderColor: SOLV.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 2 },
  legRight: { alignItems: 'flex-end' },
  legValue: { fontFamily: F.medium, fontSize: 11, lineHeight: 14 },
  legNext: { fontFamily: F.bold, fontSize: 11, lineHeight: 14 },
});

const gift = (t) => (t ? { name: t.name, short: t.shortName, image: t.image, icon: t.icon } : null);

// Map a schemeState() result onto a card. The list and the states page both call this,
// so a state can never be drawn two different ways in the same app.
// `fmt` formats the scheme's unit; `money` formats a gap in words the customer reads.
export function solvSchemeCard(s, { title, skin = 'festival', fmt, money }) {
  const held = gift(s.secured);
  const next = gift(s.next);
  const top = gift(s.top);
  const base = { skin, title, held, reward: next || top };

  if (s.state === STATE.SCHEDULED) {
    return {
      ...base,
      held: null,
      reward: top,
      line: `Gifts up to the ${s.top.shortName}. Starts ${s.startLabel}.`,
      chip: { text: 'STARTS ' + s.startLabel.replace(/ \d{4}$/, '').toUpperCase(), tone: 'muted' },
    };
  }
  if (s.state === STATE.ENDED_MISSED) {
    return { ...base, held: null, reward: top, line: 'Scheme ended below the first slab.', lineTone: 'muted', chip: { text: 'ENDED', tone: 'muted' }, dim: true };
  }
  if (s.state === STATE.ENDED_PENDING) {
    return { ...base, reward: held, line: `Scheme ended. We are confirming your ${s.secured.shortName}.`, chip: { text: 'ENDED', tone: 'muted' } };
  }
  if (s.state === STATE.GIFT_ORDERED) {
    return { ...base, reward: held, line: `${s.secured.shortName} on the way to your shop.`, lineTone: 'accent', chip: { text: 'ON THE WAY', tone: 'gold' } };
  }
  if (s.state === STATE.DELIVERED) {
    return { ...base, skin: 'light', dim: true, reward: held, line: `${s.secured.shortName} delivered`, lineTone: 'good', chip: { text: 'DONE', tone: 'good' } };
  }
  if (s.state === STATE.TOP_REACHED) {
    return { ...base, reward: held, line: `The ${s.secured.shortName} is yours. Highest gift reached.`, lineTone: 'good', chip: { text: `${s.daysLeft} DAYS LEFT`, tone: 'gold' } };
  }

  // LIVE, EARNED, NEAR_SLAB: the bar runs from the slab held to the slab next.
  const line = !held
    ? `Buy for ${money(s.next.at)} and the ${s.next.shortName} is yours`
    : s.state === STATE.NEAR_SLAB
    ? `Only ${money(s.remaining)} left for the ${s.next.shortName}`
    : `${money(s.remaining)} more and the ${s.next.shortName} replaces the ${s.secured.shortName}`;

  return {
    ...base,
    line,
    lineTone: s.state === STATE.NEAR_SLAB ? 'urgent' : 'accent',
    chip: { text: `${s.daysLeft} DAYS LEFT`, tone: 'gold' },
    leg: {
      from: s.secured ? s.secured.at : 0,
      to: s.next.at,
      current: s.currentValue,
      fmt,
    },
  };
}
