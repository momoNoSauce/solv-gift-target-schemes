// One scheme's page inside the pager. The stage, the meter, the ask, the gift
// list, the rules, the CTA and the facts: the Mega Diwali detail page, made to
// render ANY scheme (a full ladder, a one-gift trade scheme, a voucher scheme,
// and every ended state).
//
// Motion contract with the pager:
//   - The page that opens first plays the full staged intro (label, tile, name,
//     bar sweep, amount, CTA), 90ms apart.
//   - A neighbouring page renders its stage settled but its METER EMPTY. When
//     the pager lands on it the fill sweeps and the ask rises: the page reads as
//     arriving, and the swipe never shows a full bar that then resets.
//   - Each page plays its arrival once.
//   - While the pager moves, the pedestal lags the page by 36px per page of
//     travel (parallax), so the hero has depth against the sliding chrome.
//
// The page draws no back button; the pager owns the fixed one. Tapping the
// scheme title calls `onTitlePress` (the prototype's demo panel).
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, Pressable, ScrollView, StyleSheet, Animated, Easing } from 'react-native';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Ellipse } from 'react-native-svg';
import { F } from '../theme';
import { IconRunningMan, IconTargetFlag } from '../icons';
import GiftGlyph from '../gifts/icons';
import StageScene from '../gifts/Scene';
import { usePressScale, GiftThumb } from '../gifts/solv';
import { STATE } from '../gifts/state';
import { themeOf } from '../gifts/themes';
import { RIMG } from '../rewards/assets';
import { T } from './copy';
import { SETTLED } from './motion';
import { ddMMM, SHOP_ADDRESS } from './registry';

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

// Capture and reduced motion render the settled state directly.
const STATIC = SETTLED;

function stepsFor(state) {
  if (state === STATE.ENDED_PENDING) return ['done', 'now', 'todo', 'todo'];
  if (state === STATE.GIFT_ORDERED) return ['done', 'done', 'now', 'todo'];
  return ['done', 'done', 'done', 'done'];
}

// The primary pill: a top sheen for depth, a soft glow in its own color, and a
// spring press to 0.96 that can be interrupted mid-motion.
export function CtaButton({ label, bg, fg, glow = false, onPress, containerStyle }) {
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
        <LinearGradient colors={['rgba(255,255,255,0.30)', 'rgba(255,255,255,0)']} style={styles.ctaSheen} pointerEvents="none" />
        <Text style={[styles.ctaText, { color: fg }]} allowFontScaling={false}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

const rise = (v, d = 10) => ({
  opacity: v,
  transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [d, 0] }) }],
});

export default function SchemePage({ scheme, active, first, offset, bottomPad, onTitlePress, onSeeRunning, lang = 'en' }) {
  const t = T[lang] || T.en;
  const th = themeOf(scheme.theme);
  const st = th.stage;
  const festive = Boolean(th.motif);
  const s = scheme.s;
  const slab = scheme.fmt;
  const money = scheme.money;
  const [addressConfirmed, setAddressConfirmed] = useState(false);

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

  const showBar = running && s.next;
  const prevAt = s.secured ? s.secured.at : 0;
  const localPct = s.next ? Math.min(1, (s.currentValue - prevAt) / (s.next.at - prevAt)) : 1;
  const [trackW, setTrackW] = useState(0);
  const [dTagW, setDTagW] = useState(84);

  const deliveredLabel = scheme.fulfilment.deliveredAt ? ddMMM(scheme.fulfilment.deliveredAt) : '';
  const heroNote =
    s.state === STATE.SCHEDULED ? t.startsNote(s.startLabel)
    : s.state === STATE.TOP_REACHED ? t.topNote(s.endLabel)
    : s.state === STATE.ENDED_PENDING ? t.pendingNote
    : s.state === STATE.GIFT_ORDERED ? t.orderedNote(scheme.deliverBy)
    : s.state === STATE.DELIVERED ? t.deliveredNote(deliveredLabel)
    : null;

  // Entrance values. The first page starts everything at 0 and stages it in.
  // Any other page starts its stage settled (1) and its meter empty (0), then
  // sweeps the meter on arrival.
  const settled = STATIC || !first;
  const intro = useRef([...Array(6)].map((_, i) => new Animated.Value(STATIC ? 1 : settled && (i === 0 || i === 1 || i === 2 || i === 5) ? 1 : 0))).current;
  const [labelA, tileA, nameA, barA, amountA, ctaA] = intro;
  const arrived = useRef(false);
  useEffect(() => {
    if (STATIC || !active || arrived.current) return;
    arrived.current = true;
    const out = (v, duration) => Animated.timing(v, { toValue: 1, duration, easing: Easing.out(Easing.cubic), useNativeDriver: false });
    if (first) {
      Animated.stagger(90, [
        out(labelA, 260),
        Animated.spring(tileA, { toValue: 1, friction: 7, tension: 60, useNativeDriver: false }),
        out(nameA, 300),
        out(barA, 700),
        out(amountA, 320),
        out(ctaA, 320),
      ]).start();
    } else {
      // Arrival: the meter sweeps as the spring lands; the ask follows.
      Animated.stagger(120, [out(barA, 640), out(amountA, 300)]).start();
    }
  }, [active]);

  const sparkleAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (STATIC || !festive) return;
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

  // Delight: a short confetti burst greets the arrival on a page that holds a
  // won gift. Once per page; it fades out and never loops.
  const celebrate = !STATIC && active && ((s.earned && !s.ended) || s.state === STATE.DELIVERED);
  const [confetti, setConfetti] = useState(false);
  const confettiA = useRef(new Animated.Value(0)).current;
  const celebrated = useRef(false);
  useEffect(() => {
    if (!celebrate || celebrated.current) return;
    celebrated.current = true;
    setConfetti(true);
    confettiA.setValue(0);
    Animated.timing(confettiA, { toValue: 1, duration: 250, useNativeDriver: false }).start();
    const id = setTimeout(() => {
      Animated.timing(confettiA, { toValue: 0, duration: 700, useNativeDriver: false }).start(() => setConfetti(false));
    }, 3800);
    return () => clearTimeout(id);
  }, [celebrate]);

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
  const stepDates = withDelivery
    ? [
        ddMMM(scheme.endTime + 24 * 60 * 60 * 1000),
        scheme.fulfilment.orderedAt ? ddMMM(scheme.fulfilment.orderedAt) : '',
        s.state === STATE.GIFT_ORDERED ? `by ${ddMMM(scheme.endTime + 12 * 24 * 60 * 60 * 1000)}` : '',
        scheme.fulfilment.deliveredAt ? ddMMM(scheme.fulfilment.deliveredAt) : '',
      ]
    : null;

  const amountParts = s.next
    ? s.nearSlab
      ? { pre: t.onlyPrefix, amt: money(s.remaining), post: t.onlySuffix, color: st.urgent }
      : { pre: t.morePrefix, amt: money(s.remaining), post: t.moreSuffix, color: st.accent }
    : null;

  // Parallax: the pedestal lags the page as the pager moves.
  const lag = offset
    ? { transform: [{ translateX: offset.interpolate({ inputRange: [-1, 0, 1], outputRange: [-36, 0, 36], extrapolate: 'clamp' }) }] }
    : null;

  const multiGift = s.ladder.length > 1;

  return (
    <View style={[styles.page, missed && { backgroundColor: st.ground2 }]}>
      <ScrollView contentContainerStyle={[{ paddingBottom: missed ? 0 : bottomPad }, missed && { flexGrow: 1 }]} showsVerticalScrollIndicator={false}>
        {/* ——— The stage. A missed scheme has nothing below it, so its stage
            fills the page: one dark room, one line, one way out. ——— */}
        <View style={[styles.stage, missed && { flex: 1 }]}>
          <StageScene stage={st} festive={festive} focusY={missed ? 0.2 : 0.44} />
          <View style={styles.topBar} />

          <Pressable onPress={onTitlePress}>
            <View style={styles.titleRow}>
              <View>
                {th.motif ? (
                  <View style={styles.motifHang}>
                    <GiftGlyph kind={th.motif} size={22} color={st.accent} strokeWidth={1.5} />
                  </View>
                ) : null}
                <Text style={[styles.h1, { color: st.ink }]} allowFontScaling={false}>{scheme.title}</Text>
              </View>
            </View>
            {h2}
          </Pressable>

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
              <Animated.View style={[styles.pedestal, lag]}>
                <Svg width="100%" height="100%" viewBox="0 0 412 250" preserveAspectRatio="xMidYMid slice" style={StyleSheet.absoluteFill} pointerEvents="none">
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
                <Animated.Text style={[styles.heroLabel, { color: hero.tone === 'won' ? st.good : st.accent, opacity: labelA }]} allowFontScaling={false}>
                  {hero.label}
                </Animated.Text>
                <Animated.View
                  style={[styles.tile, { opacity: tileA, transform: [{ scale: tileA.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }] }]}
                >
                  {hero.gift.voucher ? (
                    <GiftThumb gift={hero.gift} size={128} />
                  ) : hero.gift.image ? (
                    <Image source={hero.gift.image} style={styles.tileImg} resizeMode="contain" />
                  ) : (
                    <GiftGlyph kind={hero.gift.icon} size={80} color={st.accentDeep} strokeWidth={1.2} />
                  )}
                </Animated.View>
              </Animated.View>
              <Animated.Text style={[styles.giftName, { color: st.ink }, rise(nameA, 8), lag]} allowFontScaling={false}>
                {hero.gift.name}
              </Animated.Text>

              {showBar ? (
                <>
                  {trackW > 0 && localPct > 0 ? (
                    <View style={styles.dTagRow}>
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
                          <Text style={[styles.dTagText, TABULAR]} numberOfLines={1} allowFontScaling={false}>
                            {money(s.currentValue)}
                          </Text>
                        </View>
                        <View style={styles.dTagCaret} />
                      </Animated.View>
                    </View>
                  ) : (
                    <View style={styles.dTagRow} />
                  )}

                  <View style={styles.barZone}>
                    <View style={[styles.barTrack, { backgroundColor: st.track }]} onLayout={(e) => setTrackW(e.nativeEvent.layout.width)}>
                      <Animated.View
                        style={[styles.barFill, { backgroundColor: st.accent, width: barA.interpolate({ inputRange: [0, 1], outputRange: ['0%', `${localPct * 100}%`] }) }]}
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
                          { left: barA.interpolate({ inputRange: [0, 1], outputRange: [0, Math.min(Math.max(localPct * trackW - 11, 0), trackW - 26)] }) },
                        ]}
                      >
                        <IconRunningMan height={22} color="#fff" />
                      </Animated.View>
                    ) : null}
                  </View>
                  <View style={styles.barEnds}>
                    <Text style={[styles.barEnd, TABULAR, { color: st.sub }]} allowFontScaling={false}>{slab(prevAt)}</Text>
                    <Text style={[styles.barEnd, TABULAR, { color: st.sub }]} allowFontScaling={false}>{slab(s.next.at)}</Text>
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
              ) : heroNote ? (
                <Animated.View style={rise(nameA, 8)}>
                  <Text style={[styles.heroNote, { color: st.sub }]} allowFontScaling={false}>{heroNote}</Text>
                  {s.earned ? (
                    <Text style={[styles.finalBought, TABULAR, { color: st.ink }]} allowFontScaling={false}>{t.finalBought(money(s.currentValue))}</Text>
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
                    {i > 0 ? <View style={[styles.connector, stepStates[i] !== 'todo' && styles.connectorDone]} /> : null}
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
                      <Text style={[styles.stepTitle, stepStates[i] === 'todo' && { color: '#B5B5B5' }]} allowFontScaling={false}>{label}</Text>
                      {stepDates[i] ? <Text style={[styles.stepDate, TABULAR]} allowFontScaling={false}>{stepDates[i]}</Text> : null}
                    </View>
                  </React.Fragment>
                ))}
              </View>
              {s.state !== STATE.ENDED_PENDING ? <Text style={[styles.orderNo, TABULAR]} allowFontScaling={false}>{scheme.orderNo}</Text> : null}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle} allowFontScaling={false}>{t.shipsHere}</Text>
              <Text style={styles.shopName} allowFontScaling={false}>{SHOP_ADDRESS.shop}</Text>
              <Text style={styles.addressLine} allowFontScaling={false}>{SHOP_ADDRESS.line}</Text>
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

        {/* ——— The gift list. Only a ladder needs one: a one-gift scheme already
            shows its gift on the pedestal. A missed scheme does not end on a
            page of lost gifts (peak-end). ——— */}
        {missed || !multiGift ? null : (
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
                  <View key={tier.at} style={[styles.row, i > 0 && styles.rowDivider, isWon && styles.rowWon, isPassed && { opacity: 0.45 }]}>
                    <Text style={[styles.rowAt, TABULAR, isNext && { color: st.accentDeep }]} allowFontScaling={false}>{slab(tier.at)}</Text>
                    <View style={styles.rowThumb}>
                      {tier.image ? (
                        <Image source={tier.image} style={{ width: 34, height: 34 }} resizeMode="contain" />
                      ) : (
                        <GiftGlyph kind={tier.icon} size={24} color={N.sub} strokeWidth={1.6} />
                      )}
                    </View>
                    <Text style={styles.rowName} numberOfLines={2} allowFontScaling={false}>{tier.name}</Text>
                    {isWon ? (
                      <View style={[styles.wonChip, { backgroundColor: N.green }]}>
                        <Text style={[styles.wonChipText, { color: '#fff' }]} allowFontScaling={false}>{running ? t.qualified : t.youWon}</Text>
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

        {/* Eligible products: the app's target_scheme_rule table, restyled. */}
        {missed ? null : (
          <>
            <Text style={styles.listLabel} allowFontScaling={false}>{t.rulesTitle}</Text>
            <View style={styles.rulesCard}>
              <Text style={styles.rulesDesc} allowFontScaling={false}>{t.rulesDesc}</Text>
              {scheme.rules.included.map((name) => (
                <View key={name} style={styles.ruleRow}>
                  <Text style={styles.ruleName} allowFontScaling={false}>{name}</Text>
                  <Text style={[styles.ruleStatus, { color: N.green }]} allowFontScaling={false}>{t.eligible}</Text>
                </View>
              ))}
              {scheme.rules.excluded.map((name) => (
                <View key={name} style={styles.ruleRow}>
                  <Text style={styles.ruleName} allowFontScaling={false}>{name}</Text>
                  <Text style={[styles.ruleStatus, { color: '#C2410C' }]} allowFontScaling={false}>{t.notEligible}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {showBar ? (
          <Animated.View style={rise(ctaA, 10)}>
            <CtaButton label={t.cta()} bg={th.card.accent} fg={th.card.accentInk} glow containerStyle={styles.bottomCta} />
          </Animated.View>
        ) : null}

        {!s.ended ? (
          <View style={styles.facts}>
            {t.facts(scheme.deliverBy).map(([icon, text], i) => (
              <View key={icon} style={[styles.factRow, i > 0 && styles.rowDivider]}>
                <GiftGlyph kind={icon} size={18} color={N.sub} strokeWidth={1.6} />
                <Text style={styles.factText} allowFontScaling={false}>{text}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>

      {confetti ? (
        <Animated.View style={[styles.confetti, { opacity: confettiA }]} pointerEvents="none">
          <LottieView source={RIMG.ribbon} autoPlay loop={false} style={{ flex: 1 }} />
        </Animated.View>
      ) : null}
    </View>
  );
}

const CARD = {
  marginHorizontal: 16,
  backgroundColor: N.paper,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: 'rgba(17,24,39,0.06)',
  shadowColor: '#0B1B33',
  shadowOpacity: 0.05,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 3 },
  elevation: 1,
};

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: N.bg },

  stage: { paddingBottom: 28, overflow: 'hidden' },
  // Room for the pager's fixed back button (44px hit, 14px from the top).
  topBar: { height: 14 + 44 - 10 },
  titleRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 0 },
  motifHang: { position: 'absolute', right: '100%', marginRight: 8, top: 3 },
  h1: { fontFamily: F.bold, fontSize: 22, lineHeight: 27, letterSpacing: 0.2, textAlign: 'center', paddingHorizontal: 8 },
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
  securedThumb: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
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

  cta: { marginTop: 10, marginHorizontal: 32, height: 52, borderRadius: 26, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  ctaSheen: { position: 'absolute', left: 0, right: 0, top: 0, height: 26 },
  ctaGlow: { shadowOpacity: 0.35, shadowRadius: 14, shadowOffset: { width: 0, height: 5 }, elevation: 6 },
  ctaText: { fontFamily: F.bold, fontSize: 15, lineHeight: 19, letterSpacing: 0.2 },

  missedBlock: { alignItems: 'center', paddingTop: 30, paddingBottom: 6, alignSelf: 'stretch' },
  missedTitle: { fontFamily: F.bold, fontSize: 17, lineHeight: 22 },
  missedNote: { marginTop: 6, textAlign: 'center', fontFamily: F.regular, fontSize: 13, lineHeight: 19, paddingHorizontal: 44 },
  missedCta: { alignSelf: 'stretch', marginTop: 4 },
  bottomCta: { marginTop: 16, marginHorizontal: 16 },

  listLabel: { marginTop: 20, marginHorizontal: 16, fontFamily: F.bold, fontSize: 11, lineHeight: 15, color: N.sub, letterSpacing: 1 },
  list: { ...CARD, marginTop: 8, paddingHorizontal: 14, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 62, paddingVertical: 8, gap: 12 },
  rowDivider: { borderTopWidth: 1, borderTopColor: '#F2F3F5' },
  rowWon: { backgroundColor: '#F3FAF5', marginHorizontal: -14, paddingHorizontal: 14 },
  rowAt: { width: 54, fontFamily: F.bold, fontSize: 15, lineHeight: 19, color: N.ink },
  rowThumb: { width: 44, height: 44, borderRadius: 10, backgroundColor: N.paper, borderWidth: 1, borderColor: PHOTO_EDGE, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
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

  rulesCard: { ...CARD, marginTop: 8, paddingHorizontal: 14 },
  rulesDesc: { paddingVertical: 11, fontFamily: F.regular, fontSize: 12, lineHeight: 16, color: N.sub },
  ruleRow: { flexDirection: 'row', alignItems: 'center', minHeight: 44, gap: 12, borderTopWidth: 1, borderTopColor: '#F2F3F5' },
  ruleName: { flex: 1, fontFamily: F.medium, fontSize: 13, lineHeight: 17, color: N.ink },
  ruleStatus: { fontFamily: F.medium, fontSize: 13, lineHeight: 17 },

  facts: { ...CARD, marginTop: 12, paddingHorizontal: 14 },
  factRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11 },
  factText: { flex: 1, fontFamily: F.regular, fontSize: 13, lineHeight: 18, color: N.ink },

  card: { ...CARD, marginTop: 12, padding: 16 },
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
});
