// Fork of components/TargetSchemeCard (browse card TSWP) for payoutMode GIFT.
// The paradigm is unchanged: same card frame, same title row, same expiry chip, same
// meter geometry, same milestone markers. What changes is what the card guarantees.
//
// Deltas against the current app, each one a change the real card would need:
//   1. The static "₹" TextView is gone. The layout hardcodes it today, so every payout
//      mode shows a rupee sign; a gift payout cannot.
//   2. The reward slot shows a gift glyph and the gift short name, not a numeric value.
//   3. Milestone labels are placed in priority order and a label that would collide is
//      dropped. A 4-slab ladder puts the low slabs close together, and 100dp marker
//      boxes then overlap. See placeLabels() below.
//   4. A footer row states the gift in hand and the gift next up. Bar labels are
//      best-effort; these two facts are the ones a customer asks for, so they are
//      never allowed to depend on how the slabs happen to fall.
//   5. After the window closes the meter is replaced by the outcome. A frozen bar
//      reads as "keep buying" on a scheme that can no longer move.
//   6. Nothing positioned draws until the card width is measured, so the card never
//      paints as a pile at x=0 on first layout or after a resize.
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import HtmlText from '../components/HtmlText';
import { C, F } from '../theme';
import { IconTargetSchemeFlag, IconStandingMan } from '../icons';
import GiftGlyph from './icons';
import GiftMilestoneMarker, { MARKER_W, MARKER_H, GLYPH_W, GLYPH_GAP } from './GiftMilestoneMarker';
import { measure, MEDIUM_ADV, MEDIUM_UPEM, BOLD_ADV, BOLD_UPEM } from '../fontWidths';
import { L12, L14 } from '../textMetrics';
import { schemeState, isTerminal, STATE } from './state';
import { lakh } from './data';

const T14 = L14;
const T12 = L12;
const CV_H = T14 + 8;
const MAN_W = 32;
const MAN_H = 28;
const BAR_H = 4;
const BAR_START = 16;
const BAR_END = 20;
const FLAG_W = 15;
const FLAG_H = 24;
const LABEL_GAP = 4;        // clear space a marker label needs beside its neighbour

const w12m = (t) => measure(String(t), 12, MEDIUM_ADV, MEDIUM_UPEM);
const w12b = (t) => measure(String(t), 12, BOLD_ADV, BOLD_UPEM);

// A marker's ink inside its 100dp box: the value line is centred, and the glyph +
// short-name row ends on the value's right edge, so the row hangs to the left. The
// span returned is measured from the box's left edge.
function markerInk(tier) {
  const limitW = w12m(lakh(tier.at));
  const rowW = GLYPH_W + GLYPH_GAP + w12b(tier.shortName);
  const right = MARKER_W / 2 + limitW / 2;
  return { from: Math.min(MARKER_W / 2 - limitW / 2, right - rowW), to: right };
}

// Milestone labels are placed in priority order: the slab already held, then the slab
// next up, then the rest from the left. A label whose ink would touch a label already
// placed is dropped, and the footer row still carries the two facts that matter.
function placeLabels({ tiers, secured, next, top, cardW }) {
  const occupied = [];
  const fits = (from, to) => occupied.every((o) => to + LABEL_GAP <= o.from || from >= o.to + LABEL_GAP);

  // The top slab is drawn right-aligned by the card itself, so it is always on screen
  // and always claims its space first.
  const topInk = Math.max(w12m(lakh(top.at)), 18 + 4 + w12m(top.shortName));
  occupied.push({ from: cardW - 5 - topInk, to: cardW - 5 });

  const mids = tiers.filter((t) => t.at !== top.at);
  const order = [];
  const push = (t) => { if (t && t.at !== top.at && !order.includes(t)) order.push(t); };
  push(secured);
  push(next);
  mids.forEach(push);

  const shown = new Set();
  order.forEach((t) => {
    const boxLeft = (cardW - MARKER_W) * (t.at / top.at);
    const ink = markerInk(t);
    const from = boxLeft + ink.from;
    const to = boxLeft + ink.to;
    if (fits(from, to)) {
      occupied.push({ from, to });
      shown.add(t.at);
    }
  });
  return shown;
}

export default function GiftSchemeCard({ node, onPress }) {
  const d = node.entityData;
  const [w, setW] = useState(0);
  const [titleBox, setTitleBox] = useState({ y: 0, h: T14 });

  const s = schemeState(node.gift);
  const terminal = isTerminal(s.state);
  const showMeter = s.started && !terminal;
  const barW = Math.max(0, w - BAR_START - BAR_END);
  const ready = w > 0;

  const progress = s.progressPct;
  const manX = (progress / 100) * barW;
  const cvLabel = lakh(node.gift.currentValue);
  const cvW = measure(cvLabel, 14, MEDIUM_ADV, MEDIUM_UPEM) + 8;
  const cvX = manX + (MAN_W - cvW) * (progress / 100);

  const barY = CV_H + 4 + MAN_H;
  const labelY = barY + BAR_H;
  const rewardY = labelY + T12 + 8;
  const mids = s.ladder.filter((t) => t.at !== s.top.at);
  const blockH = Math.max(rewardY + T12, mids.length ? CV_H + MARKER_H : 0);

  const shown = ready ? placeLabels({ tiers: s.ladder, secured: s.secured, next: s.next, top: s.top, cardW: w }) : new Set();
  const topRewardW = w12m(s.top.shortName);

  return (
    <Pressable onPress={onPress}>
      <View style={styles.card}>
        <View style={styles.content} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
          <View>
            <View
              style={styles.titleWrap}
              onLayout={(e) => setTitleBox({ y: e.nativeEvent.layout.y, h: e.nativeEvent.layout.height })}
            >
              <HtmlText
                html={d.localizedTitle}
                style={styles.title}
                boldFamily={F.bold}
                numberOfLines={1}
                allowFontScaling={false}
              />
            </View>
            {d.localizedSubText ? (
              <HtmlText
                html={d.localizedSubText}
                style={[styles.desc, s.state === STATE.NEAR_SLAB && styles.descUrgent]}
                boldFamily={F.bold}
                numberOfLines={2}
                allowFontScaling={false}
              />
            ) : null}
            {d.localizedLabel ? (
              <View style={[styles.expiryWrap, { top: titleBox.y, height: titleBox.h }]}>
                <View style={[styles.expiry, { borderColor: d.labelBgColor }]}>
                  <HtmlText html={d.localizedLabel} style={[styles.expiryText, { color: d.labelBgColor }]} boldFamily={F.bold} allowFontScaling={false} />
                </View>
              </View>
            ) : null}
          </View>

          {showMeter ? (
            <View style={[styles.block, { height: blockH }]}>
              {/* Nothing below is positioned until the width is known. */}
              {ready ? (
                <>
                  {/* current_value: the app hides it at zero, so a fresh member sees
                      the ₹0 start label and nothing stacked on top of it. */}
                  {node.gift.currentValue > 0 ? (
                    <View style={[styles.cv, { left: cvX }]}>
                      <Text style={styles.cvText} allowFontScaling={false}>{cvLabel}</Text>
                    </View>
                  ) : null}

                  <View style={[styles.man, { left: manX, top: CV_H + 4 }]}>
                    <IconStandingMan height={MAN_H} color={d.progressColor} />
                  </View>

                  <View style={[styles.track, { top: barY, left: BAR_START, width: barW }]}>
                    <View
                      style={[styles.fill, { width: (progress / 100) * barW, backgroundColor: d.progressColor }]}
                    />
                  </View>

                  <View style={{ position: 'absolute', left: w - BAR_END, top: labelY - FLAG_H }}>
                    <IconTargetSchemeFlag
                      width={FLAG_W}
                      height={FLAG_H}
                      color={progress >= 100 ? C.lightGreen : C.greyishWhite}
                    />
                  </View>

                  <Text style={[styles.startValue, { top: labelY, left: BAR_START }]} allowFontScaling={false}>₹0</Text>

                  <Text style={[styles.lastLimit, { top: labelY }]} allowFontScaling={false}>
                    {lakh(s.top.at)}
                  </Text>

                  {/* reward slot: [gift glyph][gift short name], right edge on the flag */}
                  <Text style={[styles.reward, { top: rewardY }]} allowFontScaling={false}>{s.top.shortName}</Text>
                  <View style={{ position: 'absolute', top: rewardY - 2, right: 5 + topRewardW + 4 }}>
                    <GiftGlyph kind={s.top.icon} size={18} color={C.green} strokeWidth={1.8} />
                  </View>

                  {mids.map((t) => (
                    <View
                      key={t.at}
                      style={{
                        position: 'absolute',
                        top: CV_H,
                        left: (w - MARKER_W) * (t.at / s.top.at),
                      }}
                    >
                      <GiftMilestoneMarker
                        milestone={{
                          milestoneDisplayValue: lakh(t.at),
                          payoutValue: t.shortName,
                          payoutIcon: t.icon,
                        }}
                        achieved={node.gift.currentValue >= t.at}
                        labelled={shown.has(t.at)}
                      />
                    </View>
                  ))}
                </>
              ) : null}
            </View>
          ) : null}

          <View style={styles.footerDivider} />
          <View style={styles.footer}>
            <Outcome state={s} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

// The guaranteed row. Whatever the slabs do to the bar labels, the card still names the
// gift in hand and the gift next up, in the customer's own terms.
function Outcome({ state: s }) {
  const held = s.secured ? s.secured.shortName : 'None yet';
  switch (s.state) {
    case STATE.SCHEDULED:
      return (
        <Fact label="Starts" value={s.startLabel || 'Soon'} icon={null} wide
          right={{ label: 'Top gift', value: s.top.shortName, icon: s.top.icon }} />
      );
    case STATE.TOP_REACHED:
      return (
        <Fact label="Yours" value={s.secured.shortName} icon={s.secured.icon}
          right={{ label: 'Top gift reached', value: null }} />
      );
    case STATE.ENDED_MISSED:
      return <Fact label="Scheme closed" value="No slab crossed" icon={null} />;
    case STATE.ENDED_PENDING:
      return <Fact label="You won" value={s.secured.name} icon={s.secured.icon} wrap />;
    case STATE.GIFT_ORDERED:
      return <Fact label="On the way" value={s.secured.name} icon={s.secured.icon} wrap />;
    case STATE.DELIVERED:
      return <Fact label="Delivered" value={s.secured.name} icon={s.secured.icon} wrap />;
    default:
      // LIVE, EARNED, NEAR_SLAB
      return (
        <Fact
          label="Yours"
          value={held}
          icon={s.secured ? s.secured.icon : null}
          right={s.next ? { label: 'Next', value: s.next.shortName, icon: s.next.icon } : null}
        />
      );
  }
}

function Fact({ label, value, icon, right, wrap }) {
  return (
    <>
      <View style={[styles.fact, wrap && { flex: 1 }]}>
        <Text style={styles.factLabel} allowFontScaling={false}>{label}</Text>
        {icon ? <GiftGlyph kind={icon} size={14} color={C.greyTextDark} strokeWidth={1.9} /> : null}
        <Text
          style={[styles.factValue, icon && { marginLeft: 4 }]}
          numberOfLines={1}
          allowFontScaling={false}
        >
          {value}
        </Text>
      </View>
      {right ? (
        <View style={styles.fact}>
          <Text style={styles.factLabel} allowFontScaling={false}>{right.label}</Text>
          {right.icon ? <GiftGlyph kind={right.icon} size={14} color={C.greyTextDark} strokeWidth={1.9} /> : null}
          {right.value ? (
            <Text style={[styles.factValue, right.icon && { marginLeft: 4 }]} numberOfLines={1} allowFontScaling={false}>
              {right.value}
            </Text>
          ) : null}
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: -3,
    backgroundColor: C.white,
    borderRadius: 2,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 1.5,
    shadowOffset: { width: 0, height: 1 },
    overflow: 'hidden',
  },
  content: { backgroundColor: C.white, borderWidth: 1, borderColor: C.grey3, paddingVertical: 6 },
  titleWrap: { marginLeft: 16, marginTop: 10, marginRight: 100 },
  title: { fontFamily: F.bold, fontSize: 14, lineHeight: T14, color: C.black },
  desc: { marginLeft: 16, marginTop: 4, marginRight: 100, fontFamily: F.regular, fontSize: 12, lineHeight: T12, color: C.black },
  descUrgent: { color: C.anotherRed },
  expiryWrap: { position: 'absolute', right: 16, justifyContent: 'center' },
  expiry: { borderWidth: StyleSheet.hairlineWidth, padding: 4 },
  expiryText: { fontFamily: F.bold, fontSize: 14, lineHeight: T14 },
  block: { marginTop: 12 },
  cv: { position: 'absolute', top: 0, padding: 4 },
  cvText: { fontFamily: F.medium, fontSize: 14, lineHeight: T14, color: C.textPrimary },
  man: { position: 'absolute', width: MAN_W, height: MAN_H, alignItems: 'center', justifyContent: 'flex-end' },
  track: { position: 'absolute', height: BAR_H, backgroundColor: C.greyishWhite },
  fill: { height: BAR_H, borderRadius: 4 },
  startValue: { position: 'absolute', fontFamily: F.bold, fontSize: 12, lineHeight: T12, color: C.mediumGrey },
  lastLimit: { position: 'absolute', right: 5, fontFamily: F.medium, fontSize: 12, lineHeight: T12, color: C.mediumGrey },
  reward: { position: 'absolute', right: 5, fontFamily: F.medium, fontSize: 12, lineHeight: T12, color: C.green },
  footerDivider: { height: StyleSheet.hairlineWidth, marginTop: 10, marginHorizontal: 16, backgroundColor: C.grey3 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, marginHorizontal: 16, marginBottom: 4 },
  fact: { flexDirection: 'row', alignItems: 'center' },
  factLabel: { marginRight: 6, fontFamily: F.regular, fontSize: 12, lineHeight: T12, color: C.mediumGrey },
  factValue: { fontFamily: F.bold, fontSize: 12, lineHeight: T12, color: C.greyTextDark },
});
