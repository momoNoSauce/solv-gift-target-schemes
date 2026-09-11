// The stage: the top of a scheme page, and the whole of a scheme card. One
// component draws both, so a card in the list and the header of the detail it
// opens into are the same pixels; the App Store card-to-detail move depends on
// that identity.
//
// What it draws: the theme's night (SVG scene, and the living shader on the
// web), the title with its motif or brand mark, the dates line, the pedestal
// with the gift tile (goal) or the stamped tile (won), the meter with the tag,
// the ask, the qualified capsule; or the missed room; or the won headline and
// status line.
//
// `anim` carries the six entrance values (label, tile, name, bar, amount, cta);
// without it every value is settled at 1. `card` renders for the list: the
// title is not a control, and a status eyebrow sits where the detail's chrome
// will be.
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet, Animated, Easing, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Ellipse, Path, Circle, Defs, Text as SvgText, TextPath } from 'react-native-svg';
import { F } from '../theme';
import { IconRunningMan, IconTargetFlag } from '../icons';
import GiftGlyph from '../gifts/icons';
import StageScene from '../gifts/Scene';
import ShaderStage from './ShaderStage';
import { usePressScale, GiftThumb } from '../gifts/solv';
import { STATE } from '../gifts/state';
import { themeOf } from '../gifts/themes';
import { T } from './copy';
import { SETTLED } from './motion';
import SchemeArt from './SchemeArt';
import { ddMMM, statusLine } from './registry';

export const N = {
  ink: '#1A1A1A',
  sub: '#6B6B6B',
  line: '#ECECEC',
  paper: '#FFFFFF',
  bg: '#F7F7F7',
  green: '#177E36',
};
export const TABULAR = { fontVariant: ['tabular-nums'] };
// The check on the meter's green disc: dark ink on a light green (the dark
// stages), white on a deep green (the light stages).
function checkInk(hex) {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex || '');
  if (!m) return '#fff';
  const [r, g, b] = [1, 2, 3].map((i) => parseInt(m[i], 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.55 ? '#0B2A12' : '#fff';
}
const ONE = new Animated.Value(1);
// Room for the detail's fixed chrome (44px hit, 14px from the top).
const TOPBAR_H = 14 + 44 - 10;
export const SETTLED_ANIM = { labelA: ONE, tileA: ONE, nameA: ONE, barA: ONE, amountA: ONE, ctaA: ONE };

// Everything a stage or a page derives from a scheme, in one place.
export function deriveStage(scheme, t) {
  const th = themeOf(scheme.theme);
  const st = th.stage;
  const s = scheme.s;
  const running = s.started && !s.ended;
  const withDelivery = s.state === STATE.ENDED_PENDING || s.state === STATE.GIFT_ORDERED || s.state === STATE.DELIVERED;
  const missed = s.state === STATE.ENDED_MISSED;
  const runningWithNext = running && s.next;
  // The eyebrow over the tile names what the slab pays: a gift, or JumboCash.
  const cashTop = Boolean(s.top && s.top.cash);
  const cashNext = Boolean(s.next && s.next.cash);
  const hero = missed
    ? null
    : s.state === STATE.SCHEDULED
    ? { gift: s.top, label: cashTop ? t.topCash : t.topGift, tone: 'goal' }
    : runningWithNext
    ? { gift: s.next, label: cashNext ? t.nextCash : t.nextGift, tone: 'goal' }
    : { gift: s.secured, label: s.state === STATE.TOP_REACHED ? (cashTop ? t.wonTopCash : t.wonTop) : t.youWon, tone: 'won' };
  const showBar = Boolean(running && s.next);
  const prevAt = s.secured ? s.secured.at : 0;
  const localPct = s.next ? Math.min(1, (s.currentValue - prevAt) / (s.next.at - prevAt)) : 1;
  // The meter. A ladder of three or more shows the current step: a short green
  // segment for what is qualified (with a check where it ends and the gift
  // under it), then the step to the next target. One or two targets fit on one
  // track from zero to the top, a flag at each target; a crossed flag becomes
  // the check. One gift per scheme: the check and the gift are the highest
  // target crossed, never a row of them.
  const top = s.ladder[s.ladder.length - 1];
  const crossed = s.ladder.filter((g) => s.currentValue >= g.at).length;
  const simple = s.ladder.length <= 2;
  const meter = {
    simple,
    crossed,
    // The fill within the step: from the last crossed target (or zero) to the next.
    pct: localPct,
    marks: simple ? s.ladder.map((g) => ({ gift: g, x: g.at / top.at, done: s.currentValue >= g.at })) : [],
  };
  const deliveredLabel = scheme.fulfilment.deliveredAt ? ddMMM(scheme.fulfilment.deliveredAt) : '';
  const heroNote = s.state === STATE.SCHEDULED ? t.startsNote(s.startLabel) : null;
  const stampWord = s.state === STATE.DELIVERED ? t.stampDelivered : s.state === STATE.GIFT_ORDERED ? t.stampOnTheWay : t.stampWon;
  const stampDate = (
    s.state === STATE.DELIVERED && scheme.fulfilment.deliveredAt ? ddMMM(scheme.fulfilment.deliveredAt)
    : s.state === STATE.GIFT_ORDERED && scheme.fulfilment.orderedAt ? ddMMM(scheme.fulfilment.orderedAt)
    : s.ended ? ddMMM(scheme.endTime + 24 * 60 * 60 * 1000)
    : ddMMM(scheme.now)
  ).toUpperCase() + ' ' + new Date(scheme.endTime).getUTCFullYear();
  const wonStatus =
    s.state === STATE.DELIVERED ? { text: t.wonStatusDelivered(deliveredLabel), color: st.good, icon: 'check' }
    : s.state === STATE.GIFT_ORDERED ? { text: t.wonStatusOnTheWay(scheme.deliverBy), color: st.accent, icon: 'truck' }
    : s.state === STATE.TOP_REACHED ? { text: t.wonStatusTop(s.endLabel), color: st.sub, icon: 'gift' }
    : { text: t.wonStatusPending, color: st.sub, icon: 'gift' };
  const amountParts = s.next
    ? s.nearSlab
      ? { pre: t.onlyPrefix, amt: scheme.money(s.remaining), post: t.onlySuffix, color: st.urgent }
      : { pre: t.morePrefix, amt: scheme.money(s.remaining), post: t.moreSuffix, color: st.accent }
    : null;
  return { th, st, s, festive: Boolean(th.motif), running, withDelivery, missed, hero, showBar, prevAt, localPct, meter, heroNote, stampWord, stampDate, wonStatus, amountParts, multiGift: s.ladder.length > 1 };
}

// The primary pill: a top sheen for depth, a soft glow in its own color, and a
// spring press to 0.96 that can be interrupted mid-motion.
export function CtaButton({ label, bg, fg, glow = false, onPress, containerStyle }) {
  const p = usePressScale(0.96);
  return (
    <Animated.View style={{ transform: [{ scale: p.scale }] }}>
      <Pressable onPress={onPress} onPressIn={p.pressIn} onPressOut={p.pressOut} android_ripple={{ color: '#00000022' }} style={[styles.cta, containerStyle, { backgroundColor: bg }, glow && [styles.ctaGlow, { shadowColor: bg }]]}>
        <LinearGradient colors={['rgba(255,255,255,0.30)', 'rgba(255,255,255,0)']} style={styles.ctaSheen} pointerEvents="none" />
        <Text style={[styles.ctaText, { color: fg }]} allowFontScaling={false}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

// The stamp on a won gift. A seal, the way a real one is cut: a heavy outer
// ring with its ink slightly uneven, a hairline inner ring, the word on the top
// arc and the date on the bottom arc in letterspaced caps (both read upright),
// a heavy check at the centre. Set 12 degrees off square, pressed onto the
// tile's corner, it lands with the tile and settles from 1.3 to 1.
const STAMP_INK = '#2BB05B';
// The meter's done green: the seal's own ink, saturated enough to hold against
// every stage's night; the theme's pastel `good` was too soft there.
const METER_GREEN = STAMP_INK;
// The stage content's own compositing layer, WebKit only (Safari, and every
// browser on iOS). z-index alone orders the layers for Chrome; WebKit's
// compositor also needs the sibling of a WebGL canvas to be composited, or it
// paints the canvas over it and the stage shows the night with nothing on it.
// Chrome must not get this rule: a promoted layer inside the list's clipped,
// scaled cards drops their images and icons.
if (Platform.OS === 'web' && typeof document !== 'undefined' && typeof navigator !== 'undefined' && !document.getElementById('stage-layer')) {
  const ua = navigator.userAgent || '';
  const webkit = /AppleWebKit/.test(ua) && !/Chrome\/|Chromium|Edg\//.test(ua);
  if (webkit) {
    const st = document.createElement('style');
    st.id = 'stage-layer';
    st.textContent = '[data-layer="stage-content"]{position:relative;isolation:isolate;will-change:transform;-webkit-transform:translateZ(0);transform:translateZ(0);}';
    document.head.appendChild(st);
  }
}

export function WonStamp({ word, date, anim }) {
  const id = React.useRef(`st${Math.random().toString(36).slice(2, 7)}`).current;
  return (
    <Animated.View pointerEvents="none" style={[styles.stamp, { opacity: anim, transform: [{ rotate: '-12deg' }, { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1.3, 1] }) }] }]}>
      <Svg width={96} height={96} viewBox="0 0 100 100">
        <Defs>
          <Path id={`${id}top`} d="M 14 50 A 36 36 0 0 1 86 50" />
          <Path id={`${id}bot`} d="M 14 50 A 36 36 0 0 0 86 50" />
        </Defs>
        <Circle cx="50" cy="50" r="48" fill="#FFFFFF" opacity="0.10" />
        <Circle cx="50" cy="50" r="46" stroke={STAMP_INK} strokeWidth="3.2" fill="none" opacity="0.92" />
        <Circle cx="50" cy="50" r="46" stroke="#FFFFFF" strokeWidth="1.2" fill="none" opacity="0.35" strokeDasharray="1 27 2 41 1 33 2 52 1 38" />
        <Circle cx="50" cy="50" r="28" stroke={STAMP_INK} strokeWidth="1.4" fill="none" opacity="0.9" />
        <SvgText fill={STAMP_INK} fontFamily={F.bold} fontSize="9.5" letterSpacing="2.2" textAnchor="middle">
          <TextPath href={`#${id}top`} startOffset="50%">{word}</TextPath>
        </SvgText>
        <SvgText fill={STAMP_INK} fontFamily={F.bold} fontSize="8" letterSpacing="1.6" textAnchor="middle">
          <TextPath href={`#${id}bot`} startOffset="50%">{date}</TextPath>
        </SvgText>
        <Circle cx="12" cy="50" r="1.6" fill={STAMP_INK} />
        <Circle cx="88" cy="50" r="1.6" fill={STAMP_INK} />
        <Path d="M38 51.5l8.5 8.5L63 41" stroke={STAMP_INK} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.94" />
      </Svg>
    </Animated.View>
  );
}

// What the scheme offers, in the app's own word for a slab. This is the card's
// subtitle: on a card the offer matters more than the dates, which the card's
// footer carries instead. The detail keeps the dates under the title, and the
// two crossfade as a card grows into the page.
export function offerLine(scheme, t) {
  const s = scheme.s;
  const n = s.ladder.length;
  const slab = scheme.fmt;
  // A scheme whose whole ladder pays JumboCash names the cash, not a gift count.
  const cash = s.ladder.every((g) => g.cash);
  const reward = !cash ? null : n === 1 ? t.cardCash(s.ladder[0].cash) : t.cardCashMany(n);
  if (s.state === STATE.SCHEDULED) return t.cardStarts(s.startLabel, n, reward);
  if (s.state === STATE.ENDED_MISSED) return t.cardMissed;
  if (s.ended && s.earned) return t.cardWon(slab(s.secured.at));
  return t.cardTargets(slab(s.ladder[0].at), slab(s.ladder[n - 1].at), n, reward);
}

export const rise = (v, d = 10) => ({
  opacity: v,
  transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [d, 0] }) }],
});

// `cardAnim` (0..1) is the card-to-detail dial: at 0 the stage is a list card,
// at 1 the top of the detail page. On a running stage the card form hides the
// ask ("Buy ₹X more"), keeps the amount tag over the bar (the current buying is
// the card's signal) and the secured chip (closer to the bar), shrinks the
// pedestal and the tile to the won size, and shortens the top bar, so a running
// card without a secured gift stands the same height as a completed one; the
// chip adds its own height where a gift is secured. The move drives the dial from
// 0 to 1 and every part grows back in place. null means the detail (1).
export default function Stage({ scheme, compact = false, anim = SETTLED_ANIM, lag = null, near = true, onTitlePress, onSeeRunning, card = false, cardAnim = null, lang = 'en', fill = false }) {
  const t = T[lang] || T.en;
  const d = deriveStage(scheme, t);
  const { th, st, s, festive, missed, hero, showBar, prevAt, localPct, meter, heroNote, stampWord, stampDate, wonStatus, amountParts } = d;
  const { labelA, tileA, nameA, barA, amountA, ctaA } = anim;
  const k = cardAnim || ONE;
  const dial = (lo, hi) => k.interpolate({ inputRange: [0, 1], outputRange: [lo, hi], extrapolate: 'clamp' });
  const slab = scheme.fmt;
  const money = scheme.money;
  const top = s.ladder[s.ladder.length - 1];
  const [trackW, setTrackW] = useState(0);
  const [dTagW, setDTagW] = useState(84);

  // Meter geometry, in the bar zone's width W. One anatomy for both meters:
  // when a target is crossed, a green segment runs from the start to the check
  // disc at xD, a 6 px gap follows the disc, and the step to the next target
  // takes the rest. On a ladder of three or more xD is 28 % of W (the earlier
  // slabs compressed); on a one- or two-target bar xD is the crossed target's
  // own position, so the whole bar stays to scale. With nothing crossed the
  // step runs the full width. The fill ends at fillX; the tag, the runner and
  // the entrance animation key on it. One flag, at the finish.
  const W = trackW;
  const DISC_R = 10;
  const SEG_GAP = 6;
  const crossedMark = meter.simple && meter.crossed > 0 ? meter.marks[meter.crossed - 1] : null;
  const xD = meter.crossed > 0 ? (meter.simple ? crossedMark.x * W : Math.round(W * 0.28)) : null;
  const segX = xD !== null ? xD + DISC_R + SEG_GAP : 0;
  const segW = Math.max(0, W - segX);
  const fillX = segX + meter.pct * segW;
  const hasFill = meter.pct > 0;
  const ticks = meter.simple ? meter.marks.slice(0, -1).filter((m) => !m.done) : [];

  const sparkleAnim = useRef(new Animated.Value(0.5)).current;
  // The runner runs: a 520 ms stride, bob 2.5 px and a 5 deg rock, while the
  // page is near. Still on a card (the list would run four loops) and when
  // motion is settled.
  const runA = useRef(new Animated.Value(0)).current;
  const runnerOn = !SETTLED && !card && near && trackW > 0 && hasFill && !s.ended;
  useEffect(() => {
    if (!runnerOn) return undefined;
    const stride = (to) => Animated.timing(runA, { toValue: to, duration: 260, easing: Easing.inOut(Easing.sin), useNativeDriver: false });
    const loop = Animated.loop(Animated.sequence([stride(1), stride(0)]));
    loop.start();
    return () => { loop.stop(); runA.setValue(0); };
  }, [runnerOn]);
  const runStyle = { transform: [
    { translateY: runA.interpolate({ inputRange: [0, 1], outputRange: [0, -2.5] }) },
    { rotate: runA.interpolate({ inputRange: [0, 1], outputRange: ['-2deg', '3deg'] }) },
  ] };
  useEffect(() => {
    if (SETTLED || !festive) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
        Animated.timing(sparkleAnim, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [sparkleAnim, festive]);
  const sparkleOpacity = sparkleAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.9] });

  // Pedestal geometry. On the dial (see cardAnim) a running stage's pedestal is
  // shorter and its tile at the won size; the contact shadow under the tile
  // follows, smaller and closer on the card so it stays inside the pedestal.
  const pedH = compact ? 204 : 236;
  const pedCardH = compact ? 162 : 188;
  // hero is null on a missed scheme, which draws no pedestal at all.
  const tileLayout = hero && hero.tone === 'won' ? (compact ? 128 : 136) : compact ? 148 : 168;
  const tileCardScale = showBar ? (compact ? 128 / 148 : 136 / 168) : 1;
  const tileTopMargin = compact ? 14 : 16;
  const shadow = { rx: compact ? 68 : 76, ry: compact ? 8 : 9, gap: 10 };
  const shadowCard = { rx: compact ? 54 : 60, ry: compact ? 5 : 6, gap: compact ? 4 : 6 };
  const tileMid = (ped) => ped / 2 + tileTopMargin / 2;
  const contactTopDetail = tileMid(pedH) + tileLayout / 2 + shadow.gap - shadow.ry;
  const contactTopCard = tileMid(pedCardH) + (tileLayout / 2) * tileCardScale + shadowCard.gap - shadowCard.ry;
  const contact = showBar
    ? { top: dial(contactTopCard, contactTopDetail), width: dial(2 * shadowCard.rx, 2 * shadow.rx), height: dial(2 * shadowCard.ry, 2 * shadow.ry), marginLeft: dial(-shadowCard.rx, -shadow.rx) }
    : { top: contactTopDetail, width: 2 * shadow.rx, height: 2 * shadow.ry, marginLeft: -shadow.rx };

  const dates = s.state === STATE.SCHEDULED
    ? <Text style={[styles.h2, TABULAR, { color: st.sub }]} numberOfLines={1} allowFontScaling={false}>{t.startsLine(s.startLabel)}</Text>
    : s.ended
    ? <Text style={[styles.h2, TABULAR, { color: st.sub }]} numberOfLines={1} allowFontScaling={false}>{t.endedLine(s.endLabel)}</Text>
    : (
      <Text style={[styles.h2, TABULAR, { color: st.sub }]} numberOfLines={1} allowFontScaling={false}>
        {t.endsLine(s.endLabel)}
        <Text style={{ color: st.accent, fontFamily: F.medium }} allowFontScaling={false}>{t.daysLeft(s.daysLeft)}</Text>
      </Text>
    );

  // Under the title, card and page alike: when the scheme ends. The card's
  // footer carries the targets and the gift count (10 Sep 2026), so the
  // subtitle no longer crosses over during the move.
  const h2 = dates;

  const title = (
    <>
      <View style={styles.titleRow}>
        <View>
          {th.motif ? (
            <View style={styles.motifHang}>
              <GiftGlyph kind={th.motif} size={22} color={st.accent} strokeWidth={1.5} />
            </View>
          ) : scheme.art?.logo ? (
            <View style={[styles.motifHang, { top: 0 }]}>
              <SchemeArt scheme={scheme} size={26} />
            </View>
          ) : null}
          <Text style={[styles.h1, { color: st.ink }]} allowFontScaling={false}>{scheme.title}</Text>
        </View>
      </View>
      {h2}
    </>
  );

  return (
    <View style={[styles.stage, compact && styles.stageCompact, fill && { flex: 1 }, card && styles.stageCard]}>
      <StageScene stage={st} festive={festive} focusY={missed ? 0.2 : 0.44} />
      {festive && !missed ? <ShaderStage theme={th.key} stage={st} near={near} /> : null}
      {/* Everything on the stage sits above the canvas by explicit order, and
          on its own compositing layer (data-layer, CSS below): Safari's
          compositor otherwise paints the WebGL canvas over siblings it has not
          promoted, and the stage shows the night with nothing on it. */}
      <View style={styles.stageContent} dataSet={{ layer: 'stage-content' }}>
        <Animated.View style={[styles.topBar, { height: dial(20, TOPBAR_H) }]} />

        {card ? <View>{title}</View> : <Pressable onPress={onTitlePress}>{title}</Pressable>}

        {missed ? (
          <View style={styles.missedBlock}>
            <Text style={[styles.missedTitle, { color: st.ink }]} allowFontScaling={false}>{t.missedTitle}</Text>
            <Text style={[styles.missedNote, { color: st.sub }]} allowFontScaling={false}>{t.missedNote}</Text>
            {s.currentValue > 0 ? (
              <Text style={[styles.finalBought, TABULAR, { color: st.ink }]} allowFontScaling={false}>{t.finalBought(money(s.currentValue))}</Text>
            ) : null}
            {onSeeRunning ? (
              <View style={styles.missedCta}>
                <CtaButton label={t.ctaEnded} bg={st.accent} fg={st.accentInk} onPress={onSeeRunning} />
              </View>
            ) : null}
          </View>
        ) : (
          <>
            <Animated.View style={[styles.pedestal, compact && styles.pedestalCompact, lag, showBar && { height: dial(pedCardH, pedH) }]}>
              {/* The contact shadow: an ellipse 10 px under the tile's visible bottom
                  edge, following the pedestal height and the tile scale on the dial. */}
              <Animated.View pointerEvents="none" style={[styles.contact, contact]}>
                <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <Ellipse cx="50" cy="50" rx="50" ry="50" fill="#000" opacity="0.3" />
                </Svg>
              </Animated.View>
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
              {hero.tone === 'won' ? null : (
                <Animated.Text style={[styles.heroLabel, { color: st.accent, opacity: showBar ? Animated.multiply(labelA, k.interpolate({ inputRange: [0.45, 0.9], outputRange: [0, 1], extrapolate: 'clamp' })) : labelA }]} allowFontScaling={false}>
                  {hero.label}
                </Animated.Text>
              )}
              <View style={[styles.tileWrap, compact && styles.tileWrapCompact]}>
                <Animated.View
                  style={[
                    styles.tile,
                    compact && styles.tileCompact,
                    hero.tone === 'won' && (compact ? styles.tileWonCompact : styles.tileWon),
                    {
                      opacity: tileA,
                      transform: [{
                        scale: showBar
                          ? Animated.multiply(tileA.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }), dial(tileCardScale, 1))
                          : tileA.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }),
                      }],
                    },
                  ]}
                >
                  {hero.gift.cash || hero.gift.voucher ? (
                    <GiftThumb gift={hero.gift} size={hero.tone === 'won' ? (compact ? 92 : 104) : compact ? 112 : 128} />
                  ) : hero.gift.image ? (
                    <Image source={hero.gift.image} style={[styles.tileImg, compact && styles.tileImgCompact, hero.tone === 'won' && (compact ? styles.tileImgWonCompact : styles.tileImgWon)]} resizeMode="contain" />
                  ) : (
                    <GiftGlyph kind={hero.gift.icon} size={80} color={st.accentDeep} strokeWidth={1.2} />
                  )}
                </Animated.View>
                {hero.tone === 'won' ? <WonStamp word={stampWord} date={stampDate} anim={tileA} /> : null}
              </View>
            </Animated.View>

            {hero.tone === 'won' ? (
              <Animated.View style={[rise(nameA, 8), lag]}>
                <Text style={[styles.wonHeadline, { color: st.ink }]} allowFontScaling={false}>{(hero.gift.cash ? t.wonHeadlineCash : t.wonHeadline)(hero.gift.shortName || hero.gift.name)}</Text>
                <View style={styles.wonStatusRow}>
                  <GiftGlyph kind={wonStatus.icon} size={16} color={wonStatus.color} strokeWidth={2} />
                  <Text style={[styles.wonStatus, { color: wonStatus.color }]} allowFontScaling={false}>{wonStatus.text}</Text>
                </View>
              </Animated.View>
            ) : hero.gift.cash ? null : (
              // A cashback tile already says the amount and the word; no name line.
              <Animated.Text style={[styles.giftName, { color: st.ink }, rise(nameA, 8), lag]} allowFontScaling={false}>
                {hero.gift.name}
              </Animated.Text>
            )}

            {showBar ? (
              <>
                <View style={[styles.dTagRow, compact && { marginTop: 8 }]}>
                  {W > 0 && hasFill ? (
                    <Animated.View
                      style={[
                        styles.tagWrap,
                        {
                          opacity: barA,
                          left: barA.interpolate({
                            inputRange: [0, 1],
                            outputRange: [32 + Math.min(Math.max(segX - dTagW / 2, 0), Math.max(0, W - dTagW)), 32 + Math.min(Math.max(fillX - dTagW / 2, 0), Math.max(0, W - dTagW))],
                          }),
                        },
                      ]}
                      onLayout={(e) => setDTagW(e.nativeEvent.layout.width)}
                    >
                      <View style={styles.dTag}>
                        <Text style={[styles.dTagText, TABULAR]} numberOfLines={1} allowFontScaling={false}>{money(s.currentValue)}</Text>
                      </View>
                      <View style={styles.dTagCaret} />
                    </Animated.View>
                  ) : null}
                </View>

                <View style={styles.barZone} onLayout={(e) => setTrackW(e.nativeEvent.layout.width)}>
                  {/* Crossed: the green run to the check disc, then the gap. */}
                  {xD !== null ? <View style={[styles.seg, { left: 0, width: Math.max(0, xD), backgroundColor: METER_GREEN }]} /> : null}
                  {/* The step to the next target (the whole bar with nothing crossed). */}
                  <View style={[styles.seg, { left: segX, width: segW, backgroundColor: st.track }]}>
                    <Animated.View style={[styles.barFill, { backgroundColor: st.accent, width: barA.interpolate({ inputRange: [0, 1], outputRange: ['0%', `${meter.pct * 100}%`] }) }]} />
                  </View>
                  {W > 0 && xD !== null ? (
                    <View style={[styles.checkDisc, { left: xD - DISC_R, backgroundColor: METER_GREEN }]}>
                      <Svg width={11} height={11} viewBox="0 0 24 24">
                        <Path d="M5 12.5l4.5 4.5L19 7.5" stroke="#fff" strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                      </Svg>
                    </View>
                  ) : null}
                  {/* An uncrossed target before the finish: a tick on the track. */}
                  {W > 0 ? ticks.map((m) => <View key={m.gift.at} style={[styles.tick, { left: m.x * W - 1, backgroundColor: st.ink }]} />) : null}
                  {W > 0 ? (
                    <View style={[styles.flagD, { left: W - 14 }]}>
                      <IconTargetFlag width={12} height={22} color={st.accent} />
                    </View>
                  ) : null}
                  {W > 0 && hasFill ? (
                    <Animated.View style={[styles.runnerD, { left: barA.interpolate({ inputRange: [0, 1], outputRange: [segX, Math.min(Math.max(fillX - 11, segX), W - 26)] }) }]}>
                      <Animated.View style={runStyle}>
                        <IconRunningMan height={22} color="#fff" />
                      </Animated.View>
                    </Animated.View>
                  ) : null}
                </View>

                {/* Under the meter, two groups that mirror each other. Left, under
                    the start: the won gift's picture as a tile with a check badge,
                    its name in bold, "Qualified at ₹5L" beneath (or "₹0" when
                    nothing is crossed). Right, under the flag: the next target in
                    bold over the word Target. An uncrossed tick on a two-target
                    bar gets its number under the tick. */}
                <View style={styles.meterRow}>
                  {s.secured ? (
                    <View style={styles.qualGroup}>
                      <View style={styles.qualTile}>
                        <GiftThumb gift={s.secured} size={22} />
                        <View style={[styles.qualBadge, { backgroundColor: METER_GREEN }]}>
                          <Svg width={8} height={8} viewBox="0 0 24 24">
                            <Path d="M5 12.5l4.5 4.5L19 7.5" stroke="#fff" strokeWidth={3.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                          </Svg>
                        </View>
                      </View>
                      <View style={{ flexShrink: 1 }}>
                        <Text style={[styles.groupBig, { color: st.ink }]} numberOfLines={1} allowFontScaling={false}>{s.secured.cash ? `${s.secured.cash} ${t.cashbackWord}` : s.secured.shortName}</Text>
                        <Text style={[styles.groupSmall, TABULAR, { color: st.sub }]} numberOfLines={1} allowFontScaling={false}>{t.qualifiedAt(slab(s.secured.at))}</Text>
                      </View>
                    </View>
                  ) : (
                    <Text style={[styles.groupBig, TABULAR, { color: st.sub }]} allowFontScaling={false}>{slab(0)}</Text>
                  )}
                  {W > 0 ? ticks.map((m) => (
                    <Text key={m.gift.at} style={[styles.tickLabel, TABULAR, { color: st.sub, left: m.x * W }]} allowFontScaling={false}>{slab(m.gift.at)}</Text>
                  )) : null}
                  <View style={styles.targetGroup}>
                    <Text style={[styles.groupBig, TABULAR, { color: st.ink }]} allowFontScaling={false}>{slab(s.next.at)}</Text>
                    <Text style={[styles.groupSmall, { color: st.sub }]} allowFontScaling={false}>{t.targetWord}</Text>
                  </View>
                </View>

                <Animated.View style={[rise(amountA, 10), { opacity: Animated.multiply(amountA, k.interpolate({ inputRange: [0.5, 0.9], outputRange: [0, 1], extrapolate: 'clamp' })), height: dial(0, 65), overflow: 'hidden' }]}>
                  <Text style={[styles.bigMore, TABULAR, { color: amountParts.color }]} allowFontScaling={false}>
                    {amountParts.pre ? <Text style={styles.bigMoreWord}>{amountParts.pre}</Text> : null}
                    {amountParts.amt}
                    <Text style={styles.bigMoreWord}>{amountParts.post}</Text>
                  </Text>
                  <Text style={[styles.bigRest, { color: st.sub }]} allowFontScaling={false}>{t.rest(s.next.shortName)}</Text>
                </Animated.View>
              </>
            ) : heroNote || s.earned ? (
              <Animated.View style={rise(nameA, 8)}>
                {heroNote ? <Text style={[styles.heroNote, { color: st.sub }]} allowFontScaling={false}>{heroNote}</Text> : null}
                {s.earned ? (
                  <Text style={[styles.finalBought, TABULAR, { color: heroNote ? st.ink : st.sub }, !heroNote && { marginTop: 10, fontSize: 13, lineHeight: 17 }]} allowFontScaling={false}>
                    {t.finalBought(money(s.currentValue))}
                  </Text>
                ) : null}
              </Animated.View>
            ) : null}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: { paddingBottom: 28, overflow: 'hidden' },
  stageCard: { paddingBottom: 24 },
  stageContent: { zIndex: 2 },
  stageCompact: { paddingBottom: 20 },
  // Room for the detail's fixed chrome (44px hit, 14px from the top).
  topBar: { height: TOPBAR_H },
  titleRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 0 },
  motifHang: { position: 'absolute', right: '100%', marginRight: 8, top: 3 },
  h1: { fontFamily: F.bold, fontSize: 22, lineHeight: 27, letterSpacing: 0.2, textAlign: 'center', paddingHorizontal: 8 },
  h2: { marginTop: 4, textAlign: 'center', fontFamily: F.regular, fontSize: 13, lineHeight: 17 },
  // The subtitle's own box, so the offer and the dates can cross in place.

  // The dial collapses the ask block to 0 on the card.

  pedestal: { height: 236, alignItems: 'center', justifyContent: 'center', marginTop: 0 },
  contact: { position: 'absolute', left: '50%' },
  pedestalCompact: { height: 204 },
  sparkleL: { position: 'absolute', left: '20%', top: 64 },
  sparkleR: { position: 'absolute', right: '22%', top: 148 },
  heroLabel: { position: 'absolute', top: 18, fontFamily: F.bold, fontSize: 11, lineHeight: 15, letterSpacing: 1.2 },
  tileWrap: { marginTop: 16 },
  tileWrapCompact: { marginTop: 14 },
  tile: { width: 168, height: 168, borderRadius: 24, backgroundColor: N.paper, alignItems: 'center', justifyContent: 'center', elevation: 10, shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 20, shadowOffset: { width: 0, height: 12 } },
  tileCompact: { width: 148, height: 148, borderRadius: 22 },
  tileWon: { width: 136, height: 136, borderRadius: 24 },
  tileWonCompact: { width: 128, height: 128, borderRadius: 24 },
  tileImg: { width: 128, height: 128, borderRadius: 12 },
  tileImgCompact: { width: 112, height: 112 },
  tileImgWon: { width: 104, height: 104 },
  tileImgWonCompact: { width: 98, height: 98 },
  stamp: { position: 'absolute', right: -54, top: -34, width: 96, height: 96 },
  wonHeadline: { marginTop: 6, textAlign: 'center', fontFamily: F.bold, fontSize: 22, lineHeight: 28, paddingHorizontal: 24, letterSpacing: 0.1 },
  wonStatusRow: { marginTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 24 },
  wonStatus: { fontFamily: F.medium, fontSize: 14, lineHeight: 18, fontVariant: ['tabular-nums'] },
  giftName: { marginTop: 2, textAlign: 'center', fontFamily: F.bold, fontSize: 17, lineHeight: 22, paddingHorizontal: 24, letterSpacing: 0.1 },
  heroNote: { marginTop: 12, textAlign: 'center', fontFamily: F.regular, fontSize: 13, lineHeight: 19, paddingHorizontal: 44 },
  finalBought: { marginTop: 8, textAlign: 'center', fontFamily: F.medium, fontSize: 15, lineHeight: 19 },

  dTagRow: { height: 38, marginTop: 14 },
  tagWrap: { position: 'absolute', alignItems: 'center' },
  dTag: { backgroundColor: '#fff', borderRadius: 9, paddingHorizontal: 11, height: 30, justifyContent: 'center' },
  dTagText: { color: N.ink, fontFamily: F.bold, fontSize: 15, lineHeight: 18 },
  dTagCaret: { width: 9, height: 9, marginTop: -6, backgroundColor: '#fff', transform: [{ rotate: '45deg' }] },

  // The meter: 34 px zone, the 10 px track on its floor (y 24..34). The check
  // disc (18 px) sits on the track's centre line; the flag's base on the track.
  barZone: { marginTop: 0, marginHorizontal: 32, height: 34 },
  seg: { position: 'absolute', bottom: 0, height: 10, borderRadius: 5, overflow: 'hidden' },
  barFill: { height: 10, borderRadius: 5 },
  runnerD: { position: 'absolute', bottom: 8 },
  flagD: { position: 'absolute', bottom: 8 },
  // The check disc: 20 px, a 2 px white ring, on the track's centre line.
  checkDisc: { position: 'absolute', bottom: -5, width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  tick: { position: 'absolute', bottom: -2, width: 2, height: 14, borderRadius: 1, opacity: 0.7 },
  // Under the meter: two mirrored groups on one row, 8 px below the track.
  meterRow: { marginTop: 8, marginHorizontal: 32, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  qualGroup: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1, marginRight: 12 },
  qualTile: { width: 30, height: 30, borderRadius: 8, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  qualBadge: { position: 'absolute', right: -4, bottom: -4, width: 14, height: 14, borderRadius: 7, borderWidth: 1.5, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  targetGroup: { alignItems: 'flex-end' },
  groupBig: { fontFamily: F.bold, fontSize: 13, lineHeight: 17 },
  groupSmall: { fontFamily: F.medium, fontSize: 11, lineHeight: 14 },
  tickLabel: { position: 'absolute', top: 0, width: 96, marginLeft: -48, textAlign: 'center', fontFamily: F.medium, fontSize: 11, lineHeight: 14 },

  bigMore: { marginTop: 12, textAlign: 'center', fontFamily: F.bold, fontSize: 26, lineHeight: 32 },
  bigMoreWord: { fontFamily: F.medium, fontSize: 16, lineHeight: 32 },
  bigRest: { marginTop: 2, textAlign: 'center', fontFamily: F.medium, fontSize: 14, lineHeight: 19, paddingHorizontal: 24 },

  cta: { marginTop: 10, marginHorizontal: 32, height: 52, borderRadius: 26, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  ctaSheen: { position: 'absolute', left: 0, right: 0, top: 0, height: 26 },
  ctaGlow: { shadowOpacity: 0.35, shadowRadius: 14, shadowOffset: { width: 0, height: 5 }, elevation: 6 },
  ctaText: { fontFamily: F.bold, fontSize: 15, lineHeight: 19, letterSpacing: 0.2 },

  missedBlock: { alignItems: 'center', paddingTop: 30, paddingBottom: 6, alignSelf: 'stretch' },
  // (finalBought is shared with the won stage's final line.)
  missedTitle: { fontFamily: F.bold, fontSize: 17, lineHeight: 22 },
  missedNote: { marginTop: 6, textAlign: 'center', fontFamily: F.regular, fontSize: 13, lineHeight: 19, paddingHorizontal: 44 },
  missedCta: { alignSelf: 'stretch', marginTop: 4 },
});
