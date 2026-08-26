// browse_card_target_scheme_with_progress.xml + TargetSchemeWithProgress.kt (card layout "TSWP").
// Geometry, margins, sizes, fonts and colours are taken from those two files.
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import HtmlText from './HtmlText';
import { C, F } from '../theme';
import { IconTargetSchemeFlag, IconStandingMan, IconGoldExclusive } from '../icons';
import PayoutIcon from './PayoutIcon';
import MilestoneMarker, { MARKER_W, MARKER_H } from './MilestoneMarker';
import { lastMilestone, intermediateMilestones } from '../data';
import { measure, MEDIUM_ADV, MEDIUM_UPEM } from '../fontWidths';

import { L12, L14 } from '../textMetrics';

// Line boxes measured from Roboto (see textMetrics.js), so the absolute layout matches the
// ConstraintLayout chain dp for dp.
const T14 = L14;  // 16.8
const T12 = L12;  // 14.4
const CV_H = T14 + 8;      // current_value: 14sp text + padding 4dp
const MAN_W = 32;          // target_scheme_user width  (_32sdp)
const MAN_H = 28;          // target_scheme_user height (_28sdp)
const BAR_H = 4;
const BAR_START = 16;      // progress_bar marginStart _16sdp
const BAR_END = 20;        // progress_bar marginEnd  _20sdp
const FLAG_W = 15;
const FLAG_H = 24;

export default function TargetSchemeCard({ node, onPress }) {
  const d = node.entityData;
  const [w, setW] = useState(0);          // inner width of the card

  const milestones = d.mileStoneDisplayBOList;
  const last = lastMilestone(milestones);
  const mids = intermediateMilestones(milestones);
  const progress = d.progressPercentage;
  const barW = Math.max(0, w - BAR_START - BAR_END);

  // TargetSchemeWithProgress.adjustUserPosition(): marginStart = progress% of the bar width
  const manX = (progress / 100) * barW;
  // updateCurrentValueIndicator(): ConstraintSet.setHorizontalBias(current_value, progress/100).
  // current_value is constrained start-to-start and end-to-end of target_scheme_user, so the
  // free space is (32dp - its own width). The label is wider than 32dp, so the space is
  // negative and the label drifts left as the progress grows. That is what the app does.
  const cvW = measure(stripHtml(d.currentValueLabel), 14, MEDIUM_ADV, MEDIUM_UPEM) + 8;
  const cvX = manX + (MAN_W - cvW) * (progress / 100);

  const barY = CV_H + 4 + MAN_H;
  const labelY = barY + BAR_H;
  const rewardY = labelY + T12 + 8;
  const blockH = Math.max(rewardY + T12, mids.length ? CV_H + MARKER_H : 0);

  const [titleBox, setTitleBox] = useState({ y: 0, h: T14 });

  // The card background is background_grey_border_without_radius, so the row has no ripple.
  return (
    <Pressable onPress={onPress}>
      <View style={styles.card}>
        <View style={styles.content} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
          {/* header */}
          <View>
            {d.logo ? (
              <View style={styles.goldTag}>
                <IconGoldExclusive height={28} />
              </View>
            ) : null}
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
                style={styles.desc}
                boldFamily={F.bold}
                numberOfLines={2}
                allowFontScaling={false}
              />
            ) : null}
            {d.localizedLabel ? (
              <View style={[styles.expiryWrap, { top: titleBox.y, height: titleBox.h }]}>
                <View style={[styles.expiry, { borderColor: d.labelBgColor }]}>
                  <HtmlText html={d.localizedLabel} style={styles.expiryText} boldFamily={F.bold} allowFontScaling={false} />
                </View>
              </View>
            ) : null}
          </View>

          {/* progress block (test_constraint_layout, marginTop _12sdp) */}
          <View style={[styles.block, { height: blockH }]}>
            {/* current value label */}
            <View style={[styles.cv, { left: cvX }]}>
              <HtmlText
                html={d.currentValueLabel}
                style={styles.cvText}
                boldFamily={F.bold}
                allowFontScaling={false}
              />
            </View>

            {/* standing man */}
            <View style={[styles.man, { left: manX, top: CV_H + 4 }]}>
              <IconStandingMan height={MAN_H} color={d.progressColor} />
            </View>

            {/* progress bar: track greyish_white, fill progressColor with 4dp radius */}
            <View style={[styles.track, { top: barY, left: BAR_START, width: barW }]}>
              <View
                style={[
                  styles.fill,
                  { width: (Math.min(100, progress) / 100) * barW, backgroundColor: d.progressColor },
                ]}
              />
            </View>

            {/* last milestone flag, bottom-aligned with the bar */}
            <View style={{ position: 'absolute', left: w - BAR_END, top: labelY - FLAG_H }}>
              <IconTargetSchemeFlag
                width={FLAG_W}
                height={FLAG_H}
                color={progress >= 100 ? C.lightGreen : C.greyishWhite}
              />
            </View>

            {/* ₹0 start value */}
            <Text style={[styles.startValue, { top: labelY, left: BAR_START }]} allowFontScaling={false}>₹0</Text>

            {/* last milestone value, right edge aligned with the flag */}
            <HtmlText
              html={last.milestoneDisplayValue}
              style={[styles.lastLimit, { top: labelY }]}
              boldFamily={F.bold}
              allowFontScaling={false}
            />

            {/* reward: [payout icon][₹][value] on the same right edge. rupeeLogo is a static
                TextView in the layout that the view holder never touches, so the ₹ shows for
                every payout mode — Jumbocoin schemes included. */}
            <Text style={[styles.reward, { top: rewardY }]} allowFontScaling={false}>{last.payoutValue}</Text>
            <Text style={[styles.rupee, { top: rewardY, right: 5 + rewardWidth(last.payoutValue) }]} allowFontScaling={false}>₹</Text>
            {last.payoutIcon ? (
              <View style={{ position: 'absolute', top: rewardY - 2, right: 5 + rewardWidth(last.payoutValue) + 8 }}>
                <PayoutIcon name={last.payoutIcon} width={20} />
              </View>
            ) : null}

            {/* intermediate milestones */}
            {mids.map((m, i) => (
              <View
                key={i}
                style={{
                  position: 'absolute',
                  top: CV_H,
                  left: (w - MARKER_W) * (m.milestoneValue / last.milestoneValue),
                }}
              >
                <MilestoneMarker
                  milestone={m}
                  achieved={m.milestoneValue < d.currentAchievedValue}
                />
              </View>
            ))}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

// last_milestone_reward is a RobotoMediumTextView at 12sp: measure it from the font's own
// advance widths so the ₹ glyph and the payout icon land exactly where Android puts them.
function rewardWidth(text) {
  return measure(stripHtml(text), 12, MEDIUM_ADV, MEDIUM_UPEM);
}

function stripHtml(v) {
  return String(v ?? '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&#8377;/g, '₹');
}

const styles = StyleSheet.create({
  // CardView, layout_marginHorizontal -3dp; inner ConstraintLayout has
  // background_grey_border_without_radius (white fill, 1dp grey_3 stroke) and paddingVertical 6dp
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
  content: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.grey3,
    paddingVertical: 6,
  },
  goldTag: { marginLeft: 16, marginTop: 10, height: 28, alignSelf: 'flex-start' },
  titleWrap: { marginLeft: 16, marginTop: 10, marginRight: 100 },
  title: { fontFamily: F.bold, fontSize: 14, lineHeight: T14, color: C.black },
  desc: { marginLeft: 16, marginTop: 4, marginRight: 100, fontFamily: F.regular, fontSize: 12, lineHeight: T12, color: C.black },
  expiryWrap: { position: 'absolute', right: 16, justifyContent: 'center' },
  // GradientDrawable.setStroke(1, colour): the width is 1 pixel, not 1dp
  expiry: { borderWidth: StyleSheet.hairlineWidth, padding: 4 },
  expiryText: { fontFamily: F.bold, fontSize: 14, lineHeight: T14, color: C.brown3 },
  block: { marginTop: 12 },
  cv: { position: 'absolute', top: 0, padding: 4 },
  cvText: { fontFamily: F.medium, fontSize: 14, lineHeight: T14, color: C.textPrimary },
  man: { position: 'absolute', width: MAN_W, height: MAN_H, alignItems: 'center', justifyContent: 'flex-end' },
  track: { position: 'absolute', height: BAR_H, backgroundColor: C.greyishWhite },
  fill: { height: BAR_H, borderRadius: 4 },
  startValue: { position: 'absolute', fontFamily: F.bold, fontSize: 12, lineHeight: T12, color: C.mediumGrey },
  lastLimit: { position: 'absolute', right: 5, fontFamily: F.medium, fontSize: 12, lineHeight: T12, color: C.mediumGrey },
  reward: { position: 'absolute', right: 5, fontFamily: F.medium, fontSize: 12, lineHeight: T12, color: C.green },
  rupee: { position: 'absolute', fontFamily: F.medium, fontSize: 12, lineHeight: T12, color: C.green },
});
