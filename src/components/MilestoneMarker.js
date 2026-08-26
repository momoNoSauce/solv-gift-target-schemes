// mile_stone_layout.xml — width 100dp, wrap height.
// flag 31x28 marginTop 12 paddingStart 15.5, centred horizontally;
// milestone_limit 12sp grey_text under the flag, centred;
// milestone_reward bold 12sp under the limit (marginTop 8). Its constraint is
//   app:layout_constraintEnd_toEndOf="@id/milestone_limit"
// so the reward's right edge sits on the limit's right edge. The reward is not
// centred, and the logo hangs off to the left of it;
// milestone_reward_logo 16x12 marginEnd 4 to the left of the reward;
// milestone_subtext End_toEndOf the reward, hidden on the card, shown on the detail.
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import HtmlText from './HtmlText';
import { C, F } from '../theme';
import { L12 } from '../textMetrics';
import { IconTargetFlag } from '../icons';
import PayoutIcon from './PayoutIcon';
import { measure, MEDIUM_ADV, MEDIUM_UPEM } from '../fontWidths';

export const MARKER_W = 100;
// 12dp top margin + 28dp flag + 12sp limit + 8dp gap + 12sp reward
export const MARKER_H = 12 + 28 + L12 + 8 + L12;

const stripHtml = (v) => String(v ?? '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&#8377;/g, '₹');

// The limit is centred in the 100dp box, so its right edge is at 50 + width/2.
// Pushing the reward row that far off the box's right edge reproduces the constraint.
export function rewardInset(limitText) {
  const limitW = measure(stripHtml(limitText), 12, MEDIUM_ADV, MEDIUM_UPEM);
  return MARKER_W / 2 - limitW / 2;
}

export default function MilestoneMarker({ milestone, achieved, textColor = C.greyText, subtext }) {
  const inset = rewardInset(milestone.milestoneDisplayValue);
  return (
    <View style={styles.box}>
      <View style={styles.flagBox}>
        <IconTargetFlag width={15.5} height={28} achieved={achieved} />
      </View>
      <HtmlText
        html={milestone.milestoneDisplayValue}
        style={[styles.limit, { color: textColor }]}
        boldFamily={F.bold}
        allowFontScaling={false}
      />
      <View style={[styles.rewardRow, { marginRight: inset }]}>
        {milestone.payoutIcon ? (
          <View style={styles.coin}>
            <PayoutIcon name={milestone.payoutIcon} width={16} />
          </View>
        ) : null}
        <Text style={[styles.reward, { color: textColor }]} numberOfLines={1} allowFontScaling={false}>
          {milestone.payoutValue}
        </Text>
      </View>
      {subtext ? (
        <Text style={[styles.subtext, { color: textColor, marginRight: inset }]} allowFontScaling={false}>
          {subtext}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { width: MARKER_W, alignItems: 'center' },
  // 31dp wide box with 15.5dp start padding: the flag sits in the right half
  flagBox: { width: 31, height: 28, marginTop: 12, paddingLeft: 15.5 },
  limit: { fontFamily: F.medium, fontSize: 12, lineHeight: L12 },
  // wrap_content with only an End constraint: the row overflows the 100dp box to the
  // left rather than wrapping, so it must not shrink and the text must not break.
  rewardRow: { marginTop: 8, flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', flexShrink: 0 },
  coin: { marginRight: 4 },
  reward: { fontFamily: F.bold, fontSize: 12, lineHeight: L12 },
  subtext: { marginTop: 2, alignSelf: 'flex-end', flexShrink: 0, fontFamily: F.bold, fontSize: 12, lineHeight: L12 },
});
