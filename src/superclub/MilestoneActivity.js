// /partials/milestone-activity.html + MilestoneActivityCtrl + /partials/time-bar.html.
// The web layout stacks floats and absolutely positioned boxes inside a
// .milestone-outer of fixed height 165px, so the offsets below are the resolved
// positions of that stack (title line 16px, .top-fourty-eight 48px, bar 2px, ...).
import React, { useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { SC, F } from './theme';
import { IMG } from './assets';
import { ScSvg } from './ScSvg';
import { rupees, daysLeft } from './data';

const TITLE_H = 16;      // .milestone-title line-height
const TOP_48 = 48;       // .top-fourty-eight
const BAR_H = 2;         // .back-bar / .inner-bar
const STONE_LH = 15;     // .values-and-points line-height
const FLAG = 24;         // grey flag.svg / green flag.svg intrinsic size
const IND_H = 22.46;     // .current-indicator: 10px text inheriting body line-height 1.846, plus 2px padding
const OUTER_H = 165;     // .milestone-outer height

const BAR_Y = TITLE_H + TOP_48;
const VALUES_Y = BAR_Y + BAR_H + 5;      // .values-and-points margin-top 5
const HR_Y = VALUES_Y + 38;              // .view-product-hr margin-top 38
const CTA_Y = HR_Y + 5 + 4;              // margin-bottom 5, .view-products margin-top 4

export default function MilestoneActivity({ target, onViewProducts }) {
  const [w, setW] = useState(0);
  const current = target.customerTargetBO ? target.customerTargetBO.currentValue : 0;
  const max = target.maxValue;
  const currentPosition = (current / max) * 100;
  const miles = [...target.milestones].sort((a, b) => a.atValue - b.atValue);
  const achieved = current >= max;

  const label = (value) =>
    target.targetType === 'AMOUNT' ? rupees(value) : `${value} Orders`;

  return (
    <View style={styles.outer}>
      {/* title row */}
      <View style={styles.titleRow}>
        <Text style={styles.title} numberOfLines={1} allowFontScaling={false}>{target.title}</Text>
        <Text style={styles.leftTime} allowFontScaling={false}>{daysLeft(target.applicableTo)} Days Left</Text>
      </View>

      {achieved ? (
        <View style={styles.achievedWrap} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
          <View style={styles.congratulations}>
            <Text style={styles.congratsText} allowFontScaling={false}>Congratulations!!</Text>
            <Text style={styles.congratsText} allowFontScaling={false}>
              You have won <Text style={styles.points}>{target.maxPoints} Jumbocoins</Text>
            </Text>
          </View>
          <Image source={IMG.achieved} style={[styles.achievedImg, { height: (w * 55) / 282 }]} resizeMode="contain" />
        </View>
      ) : (
        <View style={styles.progressWrap} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
          {/* progress bar: .back-bar with .inner-bar on top */}
          <View style={[styles.backBar, { top: BAR_Y }]} />
          <View style={[styles.innerBar, { top: BAR_Y, width: (Math.min(1, current / max) * w) || 0 }]} />

          {/* milestone flags, bottom-aligned with the bar */}
          {miles.map((m, i) => (
            <View
              key={`f${i}`}
              style={{ position: 'absolute', top: BAR_Y + BAR_H - FLAG, left: (m.atValue / max) * w - 8 }}
            >
              <ScSvg name={m.atValue <= current ? 'green_flag' : 'grey_flag'} width={FLAG} height={FLAG} />
            </View>
          ))}

          {/* current value pill and the dashed drop line */}
          {current > 0 ? (
            <>
              <View style={[styles.indicator, { top: BAR_Y - 25 - IND_H, left: (currentPosition / 100) * w - 30 }]}>
                <Text style={styles.indicatorText} allowFontScaling={false}>
                  {target.targetType === 'AMOUNT' ? rupees(current) : `${current} Orders`}
                </Text>
              </View>
              <View style={[styles.dashedStair, { top: BAR_Y - 25, left: (currentPosition / 100) * w - 1 }]} />
            </>
          ) : null}

          {/* start value */}
          <Text style={[styles.stone, { position: 'absolute', top: VALUES_Y, left: 0 }]} allowFontScaling={false}>
            {target.targetType === 'AMOUNT' ? rupees(0) : '0 Order'}
          </Text>

          {/* intermediate milestone value + points, skipping the last one */}
          {miles.map((m, i) =>
            i === miles.length - 1 ? null : (
              <View
                key={`v${i}`}
                style={{ position: 'absolute', top: VALUES_Y, left: (m.atValue / max) * w - 24 }}
              >
                <Text style={styles.stone} allowFontScaling={false}>{label(m.atValue)}</Text>
                <View style={styles.coinRow}>
                  <ScSvg name="coin_small" width={14} height={14} />
                  <Text style={[styles.stone, m.atValue <= current && styles.achievedPoints]} allowFontScaling={false}>
                    {' '}{m.totalPoints}
                  </Text>
                </View>
              </View>
            )
          )}

          {/* max value + max points, right aligned */}
          <View style={{ position: 'absolute', top: VALUES_Y, right: 0, alignItems: 'flex-end' }}>
            <Text style={styles.stone} allowFontScaling={false}>{label(max)}</Text>
            <View style={styles.coinRow}>
              <ScSvg name="coin_small" width={14} height={14} />
              <Text style={styles.stone} allowFontScaling={false}> {target.maxPoints}</Text>
            </View>
          </View>

          {target.applicableOn ? (
            <>
              <View style={[styles.hr, { top: HR_Y }]} />
              <Pressable style={[styles.viewProductsWrap, { top: CTA_Y }]} onPress={onViewProducts}>
                <Text style={styles.viewProducts} allowFontScaling={false}>VIEW PRODUCTS</Text>
              </Pressable>
            </>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // .milestone-outer
  outer: {
    backgroundColor: SC.white,
    padding: 15,
    height: OUTER_H,
    shadowColor: 'rgba(176,176,176,0.5)',
    shadowOpacity: 1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start' },
  title: { flex: 1, fontSize: 14, color: SC.black, fontFamily: F.medium, lineHeight: TITLE_H, letterSpacing: 0.1 },
  leftTime: { fontSize: 11, color: SC.orange, fontFamily: F.medium, lineHeight: 13, marginTop: 3, marginLeft: 4, letterSpacing: 0.1 },
  // .top-fourty-eight { margin-top:48px } with margin-right:8px, and the stack inside it
  progressWrap: { position: 'relative', marginRight: 8, flex: 1 },
  backBar: { position: 'absolute', left: 0, right: 0, height: BAR_H, backgroundColor: SC.grey },
  innerBar: { position: 'absolute', left: 0, height: BAR_H, backgroundColor: SC.green, borderRadius: 2 },
  indicator: {
    position: 'absolute',
    width: 60,
    paddingVertical: 2,
    backgroundColor: SC.navGreen,
    borderRadius: 2,
    alignItems: 'center',
  },
  indicatorText: { color: SC.white, fontSize: 10, fontFamily: F.medium, lineHeight: 18.46, letterSpacing: 0.1 },
  dashedStair: { position: 'absolute', height: 25, borderLeftWidth: 1, borderLeftColor: SC.navGreen, borderStyle: 'dashed' },
  stone: { fontSize: 11, color: SC.stone, fontFamily: F.bold, lineHeight: STONE_LH, letterSpacing: 0.1 },
  achievedPoints: { color: SC.green },
  coinRow: { flexDirection: 'row', alignItems: 'center' },
  hr: { position: 'absolute', left: 0, right: 0, borderTopWidth: 1, borderTopColor: '#eeeeee' },
  viewProductsWrap: { position: 'absolute', right: 0 },
  viewProducts: {
    borderWidth: 1,
    borderColor: SC.hr,
    color: SC.hr,
    paddingHorizontal: 5,
    paddingVertical: 2,
    fontSize: 12,
    lineHeight: 14,
    fontFamily: F.medium, letterSpacing: 0.1 },
  // achieved state: .top-fourty + .congratulations over achieved.png
  achievedWrap: { marginTop: 40, flex: 1 },
  congratulations: { position: 'absolute', zIndex: 2 },
  congratsText: { fontSize: 12, lineHeight: 16, color: SC.black, fontFamily: F.regular, letterSpacing: 0.1 },
  points: { fontFamily: F.bold, color: SC.green },
  // .full-wide on achieved.png (282x55): width 100%, height from the bitmap ratio
  achievedImg: { width: '100%', minHeight: 0 },
});
