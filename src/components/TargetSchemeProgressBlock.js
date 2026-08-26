// The shared progress block used by the PDP offer row (target_scheme_view_holder.xml) and
// by SchemeMemberTarget.getDialogView() (dialog_view_holder_target_scheme.xml).
// Both place the runner at `originalMargin + progress% * barWidth`; the PDP row uses
// 37.2dp (44 - 6.8) and the dialog uses 25.2dp (44 - 6.8 with 32dp bar insets).
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { C, F } from '../theme';
import { L12, L14 } from '../textMetrics';
import { IconTargetSchemeFlag, IconStandingMan } from '../icons';
import PayoutIcon from './PayoutIcon';
import MilestoneMarker, { MARKER_W } from './MilestoneMarker';
import { indianPrice, payoutText, payoutIconName } from '../data';
import { measure, MEDIUM_ADV, MEDIUM_UPEM } from '../fontWidths';

const T14 = L14;
const T12 = L12;
const CV_H = T14 + 8;
const MAN_H = 32;
const MAN_W = 13.6;
const BAR_H = 4;
const FLAG_W = 15;
const FLAG_H = 24;

export default function TargetSchemeProgressBlock({
  milestones,
  current,
  payoutIcon = true,
  milestoneSubtext = '',
  barStart,
  barEnd,
  manBaseMargin,
  textColor = C.greyText,
  startValueColor = C.lightGreen,
  currentValuePill = true,
}) {
  const [w, setW] = useState(0);
  const last = milestones.reduce((a, b) => (b.atValue > a.atValue ? b : a), milestones[0]);
  const mids = milestones.filter((m) => m.atValue !== last.atValue);
  const progress = Math.round((current / last.atValue) * 100);
  const barW = Math.max(0, w - barStart - barEnd);
  const manX = manBaseMargin + (progress / 100) * barW;
  const bias = Math.round(progress / 100);   // getDialogView / TargetSchemeViewHolder use an int bias
  // current_value: 14sp Medium inside background_light_green (4dp side padding)
  const cvW = measure(indianPrice(current), 14, MEDIUM_ADV, MEDIUM_UPEM) + 8;
  const cvX = manX + (MAN_W - cvW) * bias;

  const barY = CV_H + 4 + MAN_H;
  const labelY = barY + BAR_H;
  const rewardY = labelY + T12 + 8;
  const subtextY = rewardY + T12 + 2;
  const blockH = subtextY + T12 + 8;

  const showMan = progress < 100;
  const showCv = current > 0 && progress < 100;

  return (
    <View style={{ height: blockH }} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      {/* Nothing below is positioned until the width is measured. Drawing at w=0
          throws the flag and the markers to negative x for a frame. */}
      {w > 0 ? (
        <>
        {showCv ? (
          <View style={[currentValuePill ? styles.cvPill : styles.cvPlain, { left: cvX }]}>
            <Text
              style={[styles.cvText, !currentValuePill && { color: C.textPrimary }]}
              allowFontScaling={false}
            >
              {indianPrice(current)}
            </Text>
          </View>
        ) : null}

        {showMan ? (
          <View style={{ position: 'absolute', left: manX, top: CV_H + 4 }}>
            <IconStandingMan height={MAN_H} color={C.targetSchemeNative} />
          </View>
        ) : null}

        <View style={[styles.track, { top: barY, left: barStart, width: barW }]}>
          <View style={[styles.fill, { width: (Math.min(100, progress) / 100) * barW }]} />
        </View>

        <View style={{ position: 'absolute', left: w - barEnd, top: labelY - FLAG_H }}>
          <IconTargetSchemeFlag
            width={FLAG_W}
            height={FLAG_H}
            color={progress >= 100 ? C.lightGreen : C.greyishWhite}
          />
        </View>

        <Text style={[styles.startValue, { top: labelY, left: barStart, color: startValueColor }]} allowFontScaling={false}>
          ₹0
        </Text>

        <Text style={[styles.limit, { top: labelY, right: barEnd - FLAG_W, color: textColor }]} allowFontScaling={false}>
          {indianPrice(last.atValue)}
        </Text>

        <Text style={[styles.reward, { top: rewardY, right: barEnd - FLAG_W, color: textColor }]} allowFontScaling={false}>
          {payoutText(last.payout)}
        </Text>
        {payoutIcon ? (
          <View style={{ position: 'absolute', top: rewardY + 2, right: barEnd - FLAG_W + String(payoutText(last.payout)).length * 6.7 + 4 }}>
            <PayoutIcon name={payoutIconName(last.payout)} width={16} />
          </View>
        ) : null}
        {milestoneSubtext ? (
          <Text style={[styles.subtext, { top: subtextY, right: barEnd - FLAG_W, color: textColor }]} allowFontScaling={false}>
            {milestoneSubtext}
          </Text>
        ) : null}

        {mids.map((m, i) => {
          const margin = barStart + (m.atValue / last.atValue) * barW;
          const left = w > 0 ? (w - MARKER_W) * (margin / w) : 0;
          return (
            <View key={i} style={{ position: 'absolute', top: CV_H, left }}>
              <MilestoneMarker
                milestone={{
                  milestoneDisplayValue: indianPrice(m.atValue),
                  payoutValue: payoutText(m.payout),
                  payoutIcon: payoutIconName(m.payout),
                }}
                achieved={m.atValue < current}
                textColor={textColor}
                subtext={milestoneSubtext}
              />
            </View>
          );
        })}
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  // background_light_green pill (dialog) vs plain text (card)
  cvPill: { position: 'absolute', top: 0, backgroundColor: C.lightGreen, borderRadius: 2, paddingHorizontal: 4, paddingVertical: 4 },
  cvPlain: { position: 'absolute', top: 0, padding: 4 },
  cvText: { fontFamily: F.medium, fontSize: 14, lineHeight: T14, color: C.white },
  track: { position: 'absolute', height: BAR_H, backgroundColor: C.greyishWhite },
  fill: { height: BAR_H, borderRadius: 4, backgroundColor: C.targetSchemeNative },
  startValue: { position: 'absolute', fontFamily: F.medium, fontSize: 12, lineHeight: T12 },
  limit: { position: 'absolute', fontFamily: F.medium, fontSize: 12, lineHeight: T12 },
  reward: { position: 'absolute', fontFamily: F.medium, fontSize: 12, lineHeight: T12 },
  subtext: { position: 'absolute', fontFamily: F.bold, fontSize: 12, lineHeight: T12 },
});
