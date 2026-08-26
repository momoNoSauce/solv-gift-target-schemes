// Fork of components/MilestoneMarker for payoutMode GIFT.
// Deltas against the current app:
//   - the reward row shows a gift glyph and the gift short name instead of the
//     Jumbocash/Jumbocoin icon and a numeric value;
//   - `labelled` can drop the two text lines and keep the flag. The card decides,
//     because only the card knows where the neighbouring labels landed. The flag
//     still marks the slab, so the ladder keeps all of its steps.
// Flag, geometry, type scale and the reward's end-alignment with the limit
// (app:layout_constraintEnd_toEndOf="@id/milestone_limit") are unchanged.
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { C, F } from '../theme';
import { L12 } from '../textMetrics';
import { IconTargetFlag } from '../icons';
import GiftGlyph from './icons';
import { rewardInset } from '../components/MilestoneMarker';

export const MARKER_W = 100;
export const MARKER_H = 12 + 28 + L12 + 8 + L12;
// milestone_reward_logo is 16x12 with marginEnd 4.
export const GLYPH_W = 16;
export const GLYPH_GAP = 4;

export default function GiftMilestoneMarker({ milestone, achieved, textColor = C.greyText, subtext, labelled = true }) {
  const inset = rewardInset(milestone.milestoneDisplayValue);
  return (
    <View style={styles.box}>
      <View style={styles.flagBox}>
        <IconTargetFlag width={15.5} height={28} achieved={achieved} />
      </View>
      {labelled ? (
        <>
          <Text style={[styles.limit, { color: textColor }]} allowFontScaling={false}>
            {milestone.milestoneDisplayValue}
          </Text>
          <View style={[styles.rewardRow, { marginRight: inset }]}>
            <View style={styles.glyph}>
              <GiftGlyph kind={milestone.payoutIcon} size={GLYPH_W} color={textColor} strokeWidth={1.9} />
            </View>
            <Text style={[styles.reward, { color: textColor }]} numberOfLines={1} allowFontScaling={false}>
              {milestone.payoutValue}
            </Text>
          </View>
          {subtext ? (
            <Text style={[styles.subtext, { color: textColor, marginRight: inset }]} allowFontScaling={false}>
              {subtext}
            </Text>
          ) : null}
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { width: MARKER_W, alignItems: 'center' },
  flagBox: { width: 31, height: 28, marginTop: 12, paddingLeft: 15.5 },
  limit: { fontFamily: F.medium, fontSize: 12, lineHeight: L12 },
  // wrap_content with only an End constraint: the row overflows the 100dp box to the
  // left rather than wrapping, so it must not shrink and the text must not break.
  rewardRow: { marginTop: 8, flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', flexShrink: 0 },
  glyph: { marginRight: GLYPH_GAP },
  reward: { fontFamily: F.bold, fontSize: 12, lineHeight: L12 },
  subtext: { marginTop: 2, alignSelf: 'flex-end', flexShrink: 0, fontFamily: F.bold, fontSize: 12, lineHeight: L12 },
});
