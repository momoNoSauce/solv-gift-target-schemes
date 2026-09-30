// One scheme's page inside the pager: the stage (src/schemes/Stage.js) and,
// below it, the delivery cards, the gift list, the rules, the CTA and the facts.
//
// Motion contract with the pager:
//   - The page that opens first plays the full staged intro (label, tile, name,
//     bar sweep, amount, CTA), 90ms apart.
//   - A neighbouring page renders its stage settled but its METER EMPTY. When
//     the pager lands on it the fill sweeps and the ask rises: the page reads as
//     arriving, and the swipe never shows a full bar that then resets.
//   - Each page plays its arrival once.
//   - `still` renders everything settled with no arrival and no confetti: the
//     page a card has just grown into must not move again.
//   - `bodyAnim` (0..1) fades and lifts everything below the stage: the detail
//     content arriving as the card opens.
//   - While the pager moves, the pedestal lags the page by 36px per page of
//     travel (parallax).
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, Pressable, ScrollView, StyleSheet, Animated, Easing, Platform, PanResponder } from 'react-native';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { F } from '../theme';
import GiftGlyph from '../gifts/icons';
import { GiftThumb } from '../gifts/solv';
import StageScene from '../gifts/Scene';
import { STATE } from '../gifts/state';
import { RIMG } from '../rewards/assets';
import { T } from './copy';
import { SETTLED } from './motion';
import { ddMMM, SHOP_ADDRESS } from './registry';
import Stage, { deriveStage, CtaButton, rise, N, TABULAR } from './Stage';
import ProductRules, { SellerRules, RulesTable, ruleRows, useFold, FoldRow } from './ProductRules';

const PHOTO_EDGE = 'rgba(0,0,0,0.08)';
const STATIC = SETTLED;

function stepsFor(state) {
  if (state === STATE.ENDED_PENDING) return ['done', 'now', 'todo', 'todo'];
  if (state === STATE.GIFT_ORDERED) return ['done', 'done', 'now', 'todo'];
  return ['done', 'done', 'done', 'done'];
}

export default function SchemePage({ scheme, active, near = true, first, still = false, bodyAnim = null, cardAnim = null, offset, bottomPad, onTitlePress, onSeeRunning, lang = 'en', compact = false, edge = false, dismiss = null, pageIndex = 0, rulesStyle = 'list' }) {
  const t = T[lang] || T.en;
  const d = deriveStage(scheme, t);
  const { th, st, s, missed, withDelivery, showBar, reached, multiGift, running, festive } = d;
  const slab = scheme.fmt;
  const money = scheme.money;
  const [addressConfirmed, setAddressConfirmed] = useState(false);
  // A long rules list folds after five rows (ProductRules.js useFold).
  const ruleFold = useFold(ruleRows(scheme.rules));

  // The fold. scrollY drives the edge band; the sizes tell where the end is.
  const scrollRef = useRef(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const [scrollMax, setScrollMax] = useState(0);
  const sizes = useRef({ content: 0, view: 0 });
  const onSizes = () => setScrollMax(Math.max(0, sizes.current.content - sizes.current.view));
  const scrollTop = useRef(0);
  // Push the page back into its card. A downward drag that begins on the stage
  // while the page is scrolled to the top is not a scroll (there is nothing
  // above to scroll to), so it is the dismiss: the layer follows the finger,
  // the release lands it or springs it back. Upward drags scroll as always;
  // horizontal ones stay with the pager. This is the move the card taught on
  // arrival, run in reverse by hand, the way a photo is pushed back into its
  // grid in Photos or a story is pulled down to close.
  const dismissRef = useRef(dismiss);
  dismissRef.current = dismiss;
  const dismissPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponderCapture: (_, g) => Boolean(dismissRef.current) && scrollTop.current <= 0 && g.dy > 8 && g.dy > Math.abs(g.dx) * 1.4,
      onMoveShouldSetPanResponder: (_, g) => Boolean(dismissRef.current) && scrollTop.current <= 0 && g.dy > 8 && g.dy > Math.abs(g.dx) * 1.4,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => dismissRef.current && dismissRef.current.begin(pageIndex),
      onPanResponderMove: (_, g) => dismissRef.current && dismissRef.current.move(g.dy),
      onPanResponderRelease: (_, g) => dismissRef.current && dismissRef.current.end(g.dy, g.vy),
      onPanResponderTerminate: (_, g) => dismissRef.current && dismissRef.current.end(g.dy, 0),
    })
  ).current;
  const edgeOpacity = scrollMax > 8
    ? scrollY.interpolate({ inputRange: [Math.max(0, scrollMax - 48), scrollMax], outputRange: [1, 0], extrapolate: 'clamp' })
    : 0;
  useEffect(() => {
    if (active && !still && Platform.OS !== 'web') {
      const id = setTimeout(() => scrollRef.current?.flashScrollIndicators?.(), 350);
      return () => clearTimeout(id);
    }
  }, [active]);

  // Entrance values. The first page starts everything at 0 and stages it in.
  // Any other page starts its stage settled (1) and its meter empty (0), then
  // sweeps the meter on arrival. A still page is settled throughout.
  const settled = STATIC || still || !first;
  const intro = useRef([...Array(6)].map((_, i) => new Animated.Value(STATIC || still ? 1 : settled && (i === 0 || i === 1 || i === 2 || i === 5) ? 1 : 0))).current;
  const [labelA, tileA, nameA, barA, amountA, ctaA] = intro;
  const arrived = useRef(still);
  useEffect(() => {
    if (STATIC || still || !active || arrived.current) return;
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
      Animated.stagger(120, [out(barA, 640), out(amountA, 300)]).start();
    }
  }, [active]);

  // Delight: a short confetti burst greets the arrival on a page that holds a
  // won gift. Once per page; it fades out and never loops. Never on a still page.
  const celebrate = !STATIC && !still && active && ((s.earned && !s.ended) || s.state === STATE.DELIVERED);
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

  const stepStates = withDelivery ? stepsFor(s.state) : null;
  const stepDates = withDelivery
    ? [
        ddMMM(scheme.endTime + 24 * 60 * 60 * 1000),
        scheme.fulfilment.orderedAt ? ddMMM(scheme.fulfilment.orderedAt) : '',
        s.state === STATE.GIFT_ORDERED ? `by ${ddMMM(scheme.endTime + 12 * 24 * 60 * 60 * 1000)}` : '',
        scheme.fulfilment.deliveredAt ? ddMMM(scheme.fulfilment.deliveredAt) : '',
      ]
    : null;

  const lag = offset
    ? { transform: [{ translateX: offset.interpolate({ inputRange: [-1, 0, 1], outputRange: [-36, 0, 36], extrapolate: 'clamp' }) }] }
    : null;

  const bodyStyle = bodyAnim
    ? { opacity: bodyAnim.interpolate({ inputRange: [0.18, 0.62], outputRange: [0, 1], extrapolate: 'clamp' }), transform: [{ translateY: bodyAnim.interpolate({ inputRange: [0.18, 0.85], outputRange: [28, 0], extrapolate: 'clamp' }) }] }
    : null;

  // The page's ground is the paper from the first frame of the move. An earlier
  // version ramped it up from the stage's night over the first fifth, from when
  // a card had no white of its own; the card now carries a white footer band, so
  // paper from frame 0 is what matches it. Anything in between reads as a grey
  // flash under the stage.
  // A missed scheme reads like every other completed page: paper body, the
  // gift list it offered, the rules and the facts (11 Sep 2026).
  const pageBg = N.bg;

  return (
    <View style={[styles.page, { backgroundColor: pageBg }]}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={Platform.OS !== 'web'}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false, listener: (e) => { scrollTop.current = e.nativeEvent.contentOffset.y; } })}
        onContentSizeChange={(_, h) => {
          sizes.current.content = h;
          onSizes();
        }}
        onLayout={(e) => {
          sizes.current.view = e.nativeEvent.layout.height;
          onSizes();
        }}
      >
        <View {...(dismiss ? dismissPan.panHandlers : {})} dataSet={dismiss ? { touch: 'pan-y' } : undefined}>
          <Stage scheme={scheme} compact={compact} anim={{ labelA, tileA, nameA, barA, amountA, ctaA }} lag={lag} near={near} onTitlePress={onTitlePress} onSeeRunning={onSeeRunning} lang={lang} cardAnim={cardAnim} />
        </View>

        <Animated.View style={bodyStyle}>
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

            {s.state === STATE.DELIVERED ? null : (
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
            )}
          </>
        ) : null}

        {/* ——— The gift list. Only a ladder needs one: a one-gift scheme already
            shows its gift on the pedestal. A missed scheme does not end on a
            page of lost gifts (peak-end). ——— */}
        {/* A one-gift scheme shows its gift on the stage; a missed one shows
            nothing there, so its list says what was on offer. */}
        {!multiGift && !missed ? null : (
          <>
            <Text style={styles.listLabel} allowFontScaling={false}>{s.ladder.every((g) => g.cash) ? t.cashList : t.giftList}</Text>
            <View style={styles.list}>
              {s.ladder.map((tier, i) => {
                const isTop = tier.at === s.top.at;
                const isWon = s.secured && tier.at === s.secured.at;
                const isPassed = s.secured && tier.at < s.secured.at;
                const isNext = running && s.next && tier.at === s.next.at;

                // The top gift is a row like every other gift. Its rank shows as
                // emphasis inside the same anatomy: the theme's tint behind the row,
                // the slab value and label in the accent, a sparkle on a festive
                // scheme. One component, one rhythm, no card inside the card.
                // No open target once the scheme has ended: an ended list badges only the won row.
                const isTopOpen = isTop && !isWon && !s.ended;
                return (
                  <View
                    key={tier.at}
                    style={[styles.row, i > 0 && styles.rowDivider, isWon && styles.rowWon, isTopOpen && [styles.rowTop, { backgroundColor: th.card.tint }], isPassed && { opacity: 0.45 }]}
                  >
                    <Text style={[styles.rowAt, TABULAR, (isNext || isTopOpen) && { color: st.accentDeep }]} allowFontScaling={false}>{slab(tier.at)}</Text>
                    <View style={styles.rowThumb}>
                      {tier.cash ? (
                        <GiftThumb gift={tier} size={30} />
                      ) : tier.image ? (
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
                    ) : isTopOpen ? (
                      <View style={styles.topLabelRow}>
                        {festive ? <GiftGlyph kind="sparkle" size={12} color={st.accentDeep} /> : null}
                        <Text style={[styles.nextText, { color: st.accentDeep }]} allowFontScaling={false}>{tier.cash ? t.topCash : t.topGift}</Text>
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* The CTA follows the gift list: the member has just seen what is on
            offer and the next question is what to buy. The rules answer it. */}
        {/* No ask once the top is reached: buying more changes nothing. */}
        {showBar && !reached ? (
          <Animated.View style={rise(ctaA, 10)}>
            <CtaButton label={t.cta()} bg={th.card.accent} fg={th.card.accentInk} glow containerStyle={styles.bottomCta} />
          </Animated.View>
        ) : null}

        {/* Eligible products: the app's target_scheme_rule table, restyled.
            Sits right under the CTA so the ask and the answer read together. */}
        {/* `rulesStyle` 'images' (/schemes/list2): the same rules as photo
            tiles; 'sellers' (/schemes/list3): the eligible seller instead;
            'table' (/schemes/list4): the list's table with photos.
            See ProductRules.js. */}
        {rulesStyle === 'table' ? (
          <>
            <Text style={styles.listLabel} allowFontScaling={false}>{t.rulesTitle}</Text>
            <RulesTable rules={scheme.rules} t={t} accent={st.accentDeep} />
          </>
        ) : rulesStyle === 'sellers' ? (
          <>
            <Text style={styles.listLabel} allowFontScaling={false}>{t.sellersTitle}</Text>
            <SellerRules scheme={scheme} t={t} />
          </>
        ) : rulesStyle === 'images' ? (
          <>
            <Text style={styles.listLabel} allowFontScaling={false}>{t.rulesTitle}</Text>
            <ProductRules rules={scheme.rules} t={t} />
          </>
        ) : (
          <>
            <Text style={styles.listLabel} allowFontScaling={false}>{t.rulesTitle}</Text>
            <View style={styles.rulesCard}>
              {ruleFold.shown.map(([name, ok], i) => (
                <View key={name} style={[styles.ruleRow, i === 0 && styles.ruleRowFirst]}>
                  <Text style={styles.ruleName} allowFontScaling={false}>{name}</Text>
                  <Text style={[styles.ruleStatus, { color: ok ? N.green : '#C2410C' }]} allowFontScaling={false}>{ok ? t.eligible : t.notEligible}</Text>
                </View>
              ))}
              <FoldRow fold={ruleFold} t={t} accent={st.accentDeep} />
            </View>
          </>
        )}

        {/* The purchases counted: the order list can't be served on this page,
            so a single card points to it instead. */}
        {scheme.orders.length ? (
          <View style={styles.ordersCard}>
            <Text style={styles.ordersTitle} allowFontScaling={false}>{t.ordersTitle(scheme.orders.length)}</Text>
            <Pressable style={[styles.ordersKnowMore, { borderColor: st.accentDeep }]} accessibilityRole="button">
              <Text style={[styles.ordersKnowMoreText, { color: st.accentDeep }]} allowFontScaling={false}>{t.ordersKnowMore}</Text>
            </Pressable>
          </View>
        ) : null}

        {/* Terms: free text on the scheme master, one or more paragraphs. */}
        {scheme.terms && scheme.terms.length ? (
          <>
            <Text style={styles.listLabel} allowFontScaling={false}>{t.termsTitle}</Text>
            <View style={styles.termsCard}>
              {scheme.terms.map((para, i) => (
                <Text key={i} style={[styles.termsPara, i > 0 && { marginTop: 10 }]} allowFontScaling={false}>{para}</Text>
              ))}
            </View>
          </>
        ) : null}

        {(
          <View style={styles.facts}>
            {t.facts(scheme.deliverBy, `${scheme.startLabel} to ${scheme.endLabel}`, s.ended).map(([icon, text], i) => (
              <View key={icon} style={[styles.factRow, i > 0 && styles.rowDivider]}>
                <GiftGlyph kind={icon} size={18} color={N.sub} strokeWidth={1.6} />
                <Text style={styles.factText} allowFontScaling={false}>{text}</Text>
              </View>
            ))}
          </View>
        )}
        </Animated.View>
      </ScrollView>

      {edge ? (
        <Animated.View pointerEvents="none" style={[styles.edge, { opacity: edgeOpacity }]}>
          <LinearGradient
            colors={['rgba(247,247,247,0)', 'rgba(247,247,247,0.12)', 'rgba(247,247,247,0.42)', 'rgba(247,247,247,0.78)', 'rgba(247,247,247,0.97)', N.bg]}
            locations={[0, 0.2, 0.42, 0.64, 0.86, 1]}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      ) : null}

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
  bottomCta: { marginTop: 16, marginHorizontal: 16 },
  listLabel: { marginTop: 20, marginHorizontal: 16, fontFamily: F.bold, fontSize: 11, lineHeight: 15, color: N.sub, letterSpacing: 1 },
  list: { ...CARD, marginTop: 8, paddingHorizontal: 14, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 62, paddingVertical: 8, gap: 12 },
  rowDivider: { borderTopWidth: 1, borderTopColor: '#F2F3F5' },
  rowWon: { backgroundColor: '#F3FAF5', marginHorizontal: -14, paddingHorizontal: 14 },
  // Hugs the slab ("₹5L", "₹1,20,000"), never wraps it; 54 keeps short slabs aligned.
  rowAt: { width: 78, flexShrink: 0, fontFamily: F.bold, fontSize: 15, lineHeight: 19, color: N.ink },
  rowThumb: { width: 44, height: 44, borderRadius: 10, backgroundColor: N.paper, borderWidth: 1, borderColor: PHOTO_EDGE, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  rowName: { flex: 1, fontFamily: F.regular, fontSize: 13, lineHeight: 17, color: N.ink },
  wonChip: { height: 22, borderRadius: 11, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center' },
  wonChipText: { fontFamily: F.bold, fontSize: 10, lineHeight: 13, letterSpacing: 0.4 },
  nextText: { fontFamily: F.bold, fontSize: 10, lineHeight: 13, letterSpacing: 0.6 },

  // The top gift's row: the theme's tint, full-bleed inside the card like the won row.
  rowTop: { marginHorizontal: -14, paddingHorizontal: 14 },
  topLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },

  rulesCard: { ...CARD, marginTop: 8, paddingHorizontal: 14 },
  ruleRow: { flexDirection: 'row', alignItems: 'center', minHeight: 44, gap: 12, borderTopWidth: 1, borderTopColor: '#F2F3F5' },
  ruleRowFirst: { borderTopWidth: 0 },
  ruleName: { flex: 1, fontFamily: F.medium, fontSize: 13, lineHeight: 17, color: N.ink },
  ruleStatus: { fontFamily: F.medium, fontSize: 13, lineHeight: 17 },

  // Purchases counted: the head (total 15 bold, count 12 sub), rows of 40 px
  // (date 13 ink, amount 13 bold tabular), the unfold line at 44 px.
  ordersCard: { ...CARD, marginTop: 20, paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ordersTitle: { flex: 1, fontFamily: F.medium, fontSize: 14, lineHeight: 18, color: N.ink },
  ordersKnowMore: { marginLeft: 12, minHeight: 36, paddingHorizontal: 16, borderRadius: 18, borderWidth: 1, justifyContent: 'center' },
  ordersKnowMoreText: { fontFamily: F.bold, fontSize: 13, lineHeight: 17 },
  // Terms: paragraphs at 12/17 in the sub colour, 10 px apart.
  termsCard: { ...CARD, marginTop: 8, paddingHorizontal: 14, paddingVertical: 12 },
  termsPara: { fontFamily: F.regular, fontSize: 12, lineHeight: 17, color: N.sub },
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
  // The dots sit in the stage's own bottom padding, over the art, 10 px up.
  // The fold as a material: content fades into the card over 88 px.
  edge: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 88 },
});
