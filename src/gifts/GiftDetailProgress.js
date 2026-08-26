// Fork of components/DetailProgress for payoutMode GIFT.
// Deltas against the current app:
//   1. The top-slab reward line shows a gift glyph + gift short name, not "₹75".
//   2. Milestone markers render GiftMilestoneMarker.
// Geometry follows dialog_view_holder_target_scheme.xml unchanged.
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { C, F } from '../theme';
import { L12, L14 } from '../textMetrics';
import { IconTargetSchemeFlag, IconStandingMan } from '../icons';
import GiftGlyph from './icons';
import GiftMilestoneMarker, { MARKER_W } from './GiftMilestoneMarker';
import { indianPrice } from '../data';
import { lakh } from './data';
import { measure, BOLD_ADV, BOLD_UPEM, MEDIUM_ADV, MEDIUM_UPEM } from '../fontWidths';

const T14 = L14;
const T12 = L12;
const CV_H = T14 + 8;
const MAN_H = 32;
const MAN_W = 13.6;
const BAR_H = 4;
const BAR_INSET = 32;
const FLAG_W = 15;
const FLAG_H = 24;
const MAN_BASE_MARGIN = 25.2;

export default function GiftDetailProgress({ smt }) {
  const [w, setW] = useState(0);
  const bo = smt.schemeMemberTargetBO;
  const dd = smt.displayData;

  const milestones = bo.milestoneBOs;
  const last = milestones.reduce((a, b) => (b.atValue > a.atValue ? b : a), milestones[0]);
  const mids = milestones.filter((m) => m.atValue !== last.atValue);
  const current = bo.currentValue;
  const progress = Math.round((current / last.atValue) * 100);
  const barW = Math.max(0, w - BAR_INSET * 2);

  const manX = MAN_BASE_MARGIN + (progress / 100) * barW;
  const bias = Math.round(progress / 100);
  const cvW = measure(indianPrice(current), 14, MEDIUM_ADV, MEDIUM_UPEM) + 8;
  const cvX = manX + (MAN_W - cvW) * bias;

  const barY = CV_H + 4 + MAN_H;
  const labelY = barY + BAR_H;
  const rewardY = labelY + T12 + 8;
  const subtextY = rewardY + T12 + 2;
  const blockH = subtextY + T12 + 8;

  const showMan = progress < 100;
  const showCv = current > 0 && progress < 100;
  const lastName = last.payout.gift.shortName;

  return (
    <View style={[styles.block, { height: blockH }]} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      {/* Nothing below is positioned until the width is measured. Drawing at w=0
          throws the flag and the markers to negative x for a frame. */}
      {w > 0 ? (
        <>
        {showCv ? (
          <View style={[styles.cv, { left: cvX }]}>
            <Text style={styles.cvText} allowFontScaling={false}>{indianPrice(current)}</Text>
          </View>
        ) : null}

        {showMan ? (
          <View style={{ position: 'absolute', left: manX, top: CV_H + 4 }}>
            <IconStandingMan height={MAN_H} color={C.targetSchemeNative} />
          </View>
        ) : null}

        <View style={[styles.track, { top: barY, left: BAR_INSET, width: barW }]}>
          <View style={[styles.fill, { width: (Math.min(100, progress) / 100) * barW }]} />
        </View>

        <View style={{ position: 'absolute', left: w - BAR_INSET, top: labelY - FLAG_H }}>
          <IconTargetSchemeFlag width={FLAG_W} height={FLAG_H} color={progress >= 100 ? C.lightGreen : C.greyishWhite} />
        </View>

        <Text style={[styles.startValue, { top: labelY, left: BAR_INSET }]} allowFontScaling={false}>₹0</Text>

        {/* milestoneDisplayValue arrives preformatted from the server; the gift scheme
            sends compact lakh labels because full rupee values collide at these slabs */}
        <Text style={[styles.lastLimit, { top: labelY }]} allowFontScaling={false}>
          {lakh(last.atValue)}
        </Text>

        <Text style={[styles.reward, { top: rewardY }]} allowFontScaling={false}>{lastName}</Text>
        <View
          style={{
            position: 'absolute',
            top: rewardY - 1,
            right: BAR_INSET - FLAG_W + measure(lastName, 12, BOLD_ADV, BOLD_UPEM) + 4,
          }}
        >
          <GiftGlyph kind={last.payout.gift.icon} size={15} color={C.white} strokeWidth={1.9} />
        </View>
        {dd.milestoneSubtext ? (
          <Text style={[styles.subtext, { top: subtextY }]} allowFontScaling={false}>{dd.milestoneSubtext}</Text>
        ) : null}

        {mids.map((m, i) => {
          const margin = BAR_INSET + (m.atValue / last.atValue) * barW;
          const left = w > 0 ? (w - MARKER_W) * (margin / w) : 0;
          return (
            <View key={i} style={{ position: 'absolute', top: CV_H, left }}>
              <GiftMilestoneMarker
                milestone={{
                  milestoneDisplayValue: lakh(m.atValue),
                  payoutValue: m.payout.gift.shortName,
                  payoutIcon: m.payout.gift.icon,
                }}
                achieved={m.atValue < current}
                textColor={C.white}
                subtext={dd.milestoneSubtext}
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
  block: { width: '100%' },
  cv: { position: 'absolute', top: 0, backgroundColor: C.lightGreen, borderRadius: 2, paddingHorizontal: 4, paddingVertical: 4 },
  cvText: { fontFamily: F.medium, fontSize: 14, lineHeight: T14, color: C.white },
  track: { position: 'absolute', height: BAR_H, backgroundColor: C.greyishWhite },
  fill: { height: BAR_H, borderRadius: 4, backgroundColor: C.targetSchemeNative },
  startValue: { position: 'absolute', fontFamily: F.medium, fontSize: 12, lineHeight: T12, color: C.white },
  lastLimit: { position: 'absolute', right: BAR_INSET - FLAG_W, fontFamily: F.medium, fontSize: 12, lineHeight: T12, color: C.white },
  reward: { position: 'absolute', right: BAR_INSET - FLAG_W, fontFamily: F.bold, fontSize: 12, lineHeight: T12, color: C.white },
  subtext: { position: 'absolute', right: BAR_INSET - FLAG_W, fontFamily: F.bold, fontSize: 12, lineHeight: T12, color: C.white },
});
