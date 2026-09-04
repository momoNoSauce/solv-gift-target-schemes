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
import { View, Text, Image, Pressable, StyleSheet, Animated, Easing } from 'react-native';
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
const ONE = new Animated.Value(1);
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
  const hero = missed
    ? null
    : s.state === STATE.SCHEDULED
    ? { gift: s.top, label: t.topGift, tone: 'goal' }
    : runningWithNext
    ? { gift: s.next, label: t.nextGift, tone: 'goal' }
    : { gift: s.secured, label: s.state === STATE.TOP_REACHED ? t.wonTop : t.youWon, tone: 'won' };
  const securedCapsule = runningWithNext && s.earned ? s.secured : null;
  const showBar = Boolean(running && s.next);
  const prevAt = s.secured ? s.secured.at : 0;
  const localPct = s.next ? Math.min(1, (s.currentValue - prevAt) / (s.next.at - prevAt)) : 1;
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
  return { th, st, s, festive: Boolean(th.motif), running, withDelivery, missed, hero, securedCapsule, showBar, prevAt, localPct, heroNote, stampWord, stampDate, wonStatus, amountParts, multiGift: s.ladder.length > 1 };
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

export const rise = (v, d = 10) => ({
  opacity: v,
  transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [d, 0] }) }],
});

export default function Stage({ scheme, compact = false, anim = SETTLED_ANIM, lag = null, near = true, onTitlePress, onSeeRunning, card = false, eyebrowAnim = null, lang = 'en', fill = false }) {
  const t = T[lang] || T.en;
  const d = deriveStage(scheme, t);
  const { th, st, s, festive, missed, hero, securedCapsule, showBar, prevAt, localPct, heroNote, stampWord, stampDate, wonStatus, amountParts } = d;
  const { labelA, tileA, nameA, barA, amountA, ctaA } = anim;
  const slab = scheme.fmt;
  const money = scheme.money;
  const [trackW, setTrackW] = useState(0);
  const [dTagW, setDTagW] = useState(84);

  const sparkleAnim = useRef(new Animated.Value(0.5)).current;
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
      {/* Everything on the stage sits above the canvas by explicit order: a
          WebGL layer in Safari can otherwise paint over unordered siblings. */}
      <View style={styles.stageContent}>
        <View style={styles.topBar}>
          {card || eyebrowAnim ? (
            // Where the detail's chrome will sit, the card says where the scheme
            // stands. As the card grows into the detail the eyebrow fades over the
            // first third of the move, and the chrome fades in over the last.
            <Animated.Text
              style={[styles.eyebrow, TABULAR, { color: s.ended ? st.sub : st.accent }, eyebrowAnim && { opacity: eyebrowAnim.interpolate({ inputRange: [0, 0.3], outputRange: [1, 0], extrapolate: 'clamp' }) }]}
              allowFontScaling={false}
            >
              {statusLine(scheme).toUpperCase()}
            </Animated.Text>
          ) : null}
        </View>

        {card ? <View>{title}</View> : <Pressable onPress={onTitlePress}>{title}</Pressable>}

        {missed ? (
          <View style={styles.missedBlock}>
            <Text style={[styles.missedTitle, { color: st.ink }]} allowFontScaling={false}>{t.missedTitle}</Text>
            <Text style={[styles.missedNote, { color: st.sub }]} allowFontScaling={false}>{t.missedNote}</Text>
            {onSeeRunning ? (
              <View style={styles.missedCta}>
                <CtaButton label={t.ctaEnded} bg={st.accent} fg={st.accentInk} onPress={onSeeRunning} />
              </View>
            ) : null}
          </View>
        ) : (
          <>
            <Animated.View style={[styles.pedestal, compact && styles.pedestalCompact, lag]}>
              {/* The contact shadow sits 11 px under the tile's bottom edge in both
                  stage sizes: 236/168 (full) and 204/148 (compact). */}
              <Svg width="100%" height="100%" viewBox={compact ? '0 0 412 204' : '0 0 412 250'} preserveAspectRatio="xMidYMid slice" style={StyleSheet.absoluteFill} pointerEvents="none">
                {compact ? <Ellipse cx="206" cy="194" rx="68" ry="8" fill="#000" opacity="0.3" /> : <Ellipse cx="206" cy="234" rx="76" ry="9" fill="#000" opacity="0.3" />}
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
              {hero.tone === 'won' ? null : (
                <Animated.Text style={[styles.heroLabel, { color: st.accent, opacity: labelA }]} allowFontScaling={false}>
                  {hero.label}
                </Animated.Text>
              )}
              <View style={[styles.tileWrap, compact && styles.tileWrapCompact]}>
                <Animated.View
                  style={[
                    styles.tile,
                    compact && styles.tileCompact,
                    hero.tone === 'won' && (compact ? styles.tileWonCompact : styles.tileWon),
                    { opacity: tileA, transform: [{ scale: tileA.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }] },
                  ]}
                >
                  {hero.gift.voucher ? (
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
                <Text style={[styles.wonHeadline, { color: st.ink }]} allowFontScaling={false}>{t.wonHeadline(hero.gift.shortName || hero.gift.name)}</Text>
                <View style={styles.wonStatusRow}>
                  <GiftGlyph kind={wonStatus.icon} size={16} color={wonStatus.color} strokeWidth={2} />
                  <Text style={[styles.wonStatus, { color: wonStatus.color }]} allowFontScaling={false}>{wonStatus.text}</Text>
                </View>
              </Animated.View>
            ) : (
              <Animated.Text style={[styles.giftName, { color: st.ink }, rise(nameA, 8), lag]} allowFontScaling={false}>
                {hero.gift.name}
              </Animated.Text>
            )}

            {showBar ? (
              <>
                {trackW > 0 && localPct > 0 ? (
                  <View style={[styles.dTagRow, compact && { marginTop: 8 }]}>
                    <Animated.View
                      style={[
                        styles.tagWrap,
                        {
                          opacity: barA,
                          left: barA.interpolate({
                            inputRange: [0, 1],
                            outputRange: [32 + Math.min(Math.max(0 - dTagW / 2, 0), Math.max(0, trackW - dTagW)), 32 + Math.min(Math.max(localPct * trackW - dTagW / 2, 0), Math.max(0, trackW - dTagW))],
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
                  </View>
                ) : (
                  <View style={[styles.dTagRow, compact && { marginTop: 8 }]} />
                )}

                <View style={styles.barZone}>
                  <View style={[styles.barTrack, { backgroundColor: st.track }]} onLayout={(e) => setTrackW(e.nativeEvent.layout.width)}>
                    <Animated.View style={[styles.barFill, { backgroundColor: st.accent, width: barA.interpolate({ inputRange: [0, 1], outputRange: ['0%', `${localPct * 100}%`] }) }]} />
                  </View>
                  {trackW > 0 ? (
                    <View style={[styles.flagD, { left: trackW - 14 }]}>
                      <IconTargetFlag width={12} height={22} color={st.accent} />
                    </View>
                  ) : null}
                  {trackW > 0 && localPct > 0 ? (
                    <Animated.View style={[styles.runnerD, { left: barA.interpolate({ inputRange: [0, 1], outputRange: [0, Math.min(Math.max(localPct * trackW - 11, 0), trackW - 26)] }) }]}>
                      <IconRunningMan height={22} color="#fff" />
                    </Animated.View>
                  ) : null}
                </View>
                <View style={styles.barEnds}>
                  <Text style={[styles.barEnd, TABULAR, { color: st.sub }]} allowFontScaling={false}>{slab(prevAt)}</Text>
                  <Text style={[styles.barEnd, TABULAR, { color: st.sub }]} allowFontScaling={false}>
                    {t.targetWord} <Text style={{ color: st.ink, fontFamily: F.bold }}>{slab(s.next.at)}</Text>
                  </Text>
                </View>

                <Animated.View style={rise(amountA, 10)}>
                  <Text style={[styles.bigMore, TABULAR, { color: amountParts.color }]} allowFontScaling={false}>
                    {amountParts.pre ? <Text style={styles.bigMoreWord}>{amountParts.pre}</Text> : null}
                    {amountParts.amt}
                    <Text style={styles.bigMoreWord}>{amountParts.post}</Text>
                  </Text>
                  <Text style={[styles.bigRest, { color: st.sub }]} allowFontScaling={false}>{t.rest(s.next.shortName)}</Text>
                </Animated.View>

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
                      <Text style={[styles.securedText, { color: st.ink }]} allowFontScaling={false}>{t.securedRow(securedCapsule.shortName)}</Text>
                      <GiftGlyph kind="check" size={15} color={st.good} strokeWidth={2} />
                    </View>
                  </Animated.View>
                ) : null}
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
  topBar: { height: 14 + 44 - 10, justifyContent: 'center', paddingHorizontal: 20 },
  eyebrow: { fontFamily: F.bold, fontSize: 11, lineHeight: 14, letterSpacing: 1.2 },
  titleRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 0 },
  motifHang: { position: 'absolute', right: '100%', marginRight: 8, top: 3 },
  h1: { fontFamily: F.bold, fontSize: 22, lineHeight: 27, letterSpacing: 0.2, textAlign: 'center', paddingHorizontal: 8 },
  h2: { marginTop: 4, textAlign: 'center', fontFamily: F.regular, fontSize: 13, lineHeight: 17 },

  secured: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.10)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)', borderRadius: 20, paddingLeft: 6, paddingRight: 12, height: 40 },
  securedThumb: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  securedText: { fontFamily: F.medium, fontSize: 13, lineHeight: 17 },
  securedWrap: { alignItems: 'center', marginTop: 22 },

  pedestal: { height: 236, alignItems: 'center', justifyContent: 'center', marginTop: 0 },
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

  barZone: { marginTop: 0, marginHorizontal: 32, height: 34, justifyContent: 'flex-end' },
  barTrack: { height: 10, borderRadius: 5, overflow: 'hidden' },
  barFill: { height: 10, borderRadius: 5 },
  runnerD: { position: 'absolute', bottom: 8 },
  flagD: { position: 'absolute', bottom: 8 },
  barEnds: { marginTop: 6, marginHorizontal: 32, flexDirection: 'row', justifyContent: 'space-between' },
  barEnd: { fontFamily: F.medium, fontSize: 12, lineHeight: 16 },

  bigMore: { marginTop: 12, textAlign: 'center', fontFamily: F.bold, fontSize: 26, lineHeight: 32 },
  bigMoreWord: { fontFamily: F.medium, fontSize: 16, lineHeight: 32 },
  bigRest: { marginTop: 2, textAlign: 'center', fontFamily: F.medium, fontSize: 14, lineHeight: 19, paddingHorizontal: 24 },

  cta: { marginTop: 10, marginHorizontal: 32, height: 52, borderRadius: 26, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  ctaSheen: { position: 'absolute', left: 0, right: 0, top: 0, height: 26 },
  ctaGlow: { shadowOpacity: 0.35, shadowRadius: 14, shadowOffset: { width: 0, height: 5 }, elevation: 6 },
  ctaText: { fontFamily: F.bold, fontSize: 15, lineHeight: 19, letterSpacing: 0.2 },

  missedBlock: { alignItems: 'center', paddingTop: 30, paddingBottom: 6, alignSelf: 'stretch' },
  missedTitle: { fontFamily: F.bold, fontSize: 17, lineHeight: 22 },
  missedNote: { marginTop: 6, textAlign: 'center', fontFamily: F.regular, fontSize: 13, lineHeight: 19, paddingHorizontal: 44 },
  missedCta: { alignSelf: 'stretch', marginTop: 4 },
});
