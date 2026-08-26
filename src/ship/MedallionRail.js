// The progress rail with gift medallions where the flags used to be. Shared by the
// list card (size 44, light) and the detail hero (size 52, dark), so the two surfaces
// cannot draw the same scheme differently.
//
// Geometry above the bar is the app's own TSWP block: current-value label biased by
// progress, the standing man walking the track, the 4dp bar, and the app's own
// milestone FLAG planted at every slab. Below the bar each slab reads top-down in
// the order a shopkeeper asks: the SLAB VALUE right against the line, then the gift
// photo, then its name. A "₹0" start label anchors the left end, as the app's own
// card does. The bar's scale ends at the LAST medallion's centre, so flag, value,
// photo and name share one exact x for every slab, including the last. The fill
// animates in once, 600ms ease-out.
//
// Edge cases handled here, because the data will hit all of them:
//   - nothing positioned draws before the width is measured
//   - the value pill hides at zero so a fresh member sees a clean start
//   - medallion centres are clamped inside the card and pushed apart pairwise, so a
//     ladder like 8L/9L/10L cannot overlap two photos
//   - each name gets only the width its neighbours leave it, then ellipsises
//   - values render with tabular figures so 5 and 10 lakh tick labels align
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, Easing, StyleSheet } from 'react-native';
import { C, F } from '../theme';
import { SOLV } from '../gifts/solv';
import { L12 } from '../textMetrics';
import { IconRunningMan, IconTargetFlag } from '../icons';
import { measure, MEDIUM_ADV, MEDIUM_UPEM } from '../fontWidths';
import { lakh } from '../gifts/data';
import GiftMedallion from './GiftMedallion';

const T14 = 16.8;
const CV_H = T14 + 8;
const MAN_W = 32;
const MAN_H = 28;
const BAR_H = 4;
const BAR_START = 16;
const BAR_END = 20;
const NAME_H = 14;

export function railHeight(size, showNames) {
  return CV_H + 4 + MAN_H + BAR_H + 4 + L12 + 4 + size + 3 + (showNames ? NAME_H : 0) + 4;
}

// Compact mode: flags and slab values only. The detail hero uses it so the photos
// live once, in the ladder card below.
export function compactRailHeight() {
  return CV_H + 4 + MAN_H + BAR_H + 4 + L12 + 2;
}

export default function MedallionRail({ s, currentValue, size = 44, dark = false, showNames = true, medallions = true }) {
  const [w, setW] = useState(0);
  const progress = s.progressPct;

  // The scale ends at the last medallion's centre, so the top slab's flag, value,
  // photo and name all sit on one x with nothing clamped or shifted.
  const half = size / 2;
  const railEnd = medallions ? w - 4 - half : w - BAR_END;
  const railW = Math.max(0, railEnd - BAR_START);

  const fill = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (w > 0) {
      fill.setValue(0);
      Animated.timing(fill, {
        toValue: 1,
        duration: 600,
        delay: 120,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    }
  }, [w, fill]);

  const manX = (progress / 100) * railW;
  const cvLabel = lakh(currentValue);
  const cvW = measure(cvLabel, 14, MEDIUM_ADV, MEDIUM_UPEM) + 8;
  const cvX = manX + (MAN_W - cvW) * (progress / 100);

  const barY = CV_H + 4 + MAN_H;
  const valueY = barY + BAR_H + 4;
  const compactValueY = valueY;
  const medY = valueY + L12 + 4;
  const nameY = medY + size + 3;

  const centers = s.ladder.map((t) =>
    Math.max(half + 4, BAR_START + (t.at / s.top.at) * railW)
  );
  // Crowded slabs push apart pairwise; the flags follow the pushed centres so the
  // flag-to-gift mapping stays exact even then.
  for (let i = centers.length - 2; i >= 0; i--) {
    centers[i] = Math.min(centers[i], centers[i + 1] - (size + 6));
  }

  // Each label may use the space its actual neighbours leave. At the card's edges the
  // box shifts inward instead of shrinking (optical over geometric): the text centre
  // drifts a few px off the medallion rather than ellipsising "Soundbar" to "Soundb…".
  const last = s.ladder.length - 1;
  const labelW = centers.map((c, i) => {
    const leftGap = i === 0 ? Infinity : c - centers[i - 1];
    const rightGap = i === last ? Infinity : centers[i + 1] - c;
    return Math.min(96, Math.min(leftGap, rightGap) - 6);
  });
  // The last column right-aligns to its medallion's right edge instead of drifting
  // off-axis when a centred box would overflow the card.
  const labelX = centers.map((c, i) =>
    i === last ? Math.min(c + half, w - 4) - labelW[i] : Math.min(Math.max(c - labelW[i] / 2, 4), w - 6 - labelW[i])
  );
  const labelAlign = (i) => (i === last ? 'right' : 'center');

  const subColor = dark ? 'rgba(255,255,255,0.78)' : C.greyText;
  const inkColor = dark ? '#fff' : C.greyTextDark;

  return (
    <View style={{ height: medallions ? railHeight(size, showNames) : compactRailHeight() }} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      {w > 0 ? (
        <>
          {currentValue > 0 && progress < 100 ? (
            <View style={[styles.cv, { left: cvX }]}>
              <Text style={[styles.cvText, dark && { color: '#fff' }]} allowFontScaling={false}>
                {cvLabel}
              </Text>
            </View>
          ) : null}

          <View style={{ position: 'absolute', left: manX, top: CV_H + 4, width: MAN_W, alignItems: 'center', justifyContent: 'flex-end', height: MAN_H }}>
            <IconRunningMan height={MAN_H} color={dark ? '#fff' : SOLV.blue} />
          </View>

          <View style={[styles.track, { top: barY, left: BAR_START, width: railW }, dark && { backgroundColor: 'rgba(255,255,255,0.22)' }]}>
            <Animated.View
              style={[
                styles.fill,
                dark && { backgroundColor: '#fff' },
                { width: fill.interpolate({ inputRange: [0, 1], outputRange: [0, (Math.min(100, progress) / 100) * railW] }) },
              ]}
            />
          </View>

          {/* The start of the scale, as the app's own card writes it. Hidden only when
              the first slab crowds the left edge. */}
          {centers[0] - 24 > BAR_START + 24 ? (
            <Text
              style={[styles.value, { left: BAR_START, width: 60, textAlign: 'left', top: medallions ? valueY : compactValueY }, { color: subColor }]}
              allowFontScaling={false}
            >
              {lakh(0)}
            </Text>
          ) : null}

          {s.ladder.map((t, i) => {
            const achieved = currentValue >= t.at;
            const giftState = !achieved ? 'open' : s.secured && t.at === s.secured.at ? 'won' : 'passed';
            // The flag's pole plants exactly on the slab's centre: the same x carries
            // the flag, the value, the photo and the name.
            const flagX = centers[i] - 1;
            if (!medallions) {
              return (
                <React.Fragment key={t.at}>
                  <View style={{ position: 'absolute', left: flagX, top: barY + BAR_H - 24 }}>
                    <IconTargetFlag width={15.5} height={24} achieved={achieved} color={achieved ? (dark ? '#fff' : SOLV.blue) : dark ? 'rgba(255,255,255,0.45)' : C.greyishWhite} />
                  </View>
                  <Text
                    style={[
                      styles.value,
                      { left: labelX[i], width: labelW[i], top: compactValueY, textAlign: labelAlign(i) },
                      { color: achieved ? (dark ? '#fff' : SOLV.blue) : subColor },
                    ]}
                    numberOfLines={1}
                    allowFontScaling={false}
                  >
                    {lakh(t.at)}
                  </Text>
                </React.Fragment>
              );
            }
            return (
              <React.Fragment key={t.at}>
                <View style={{ position: 'absolute', left: flagX, top: barY + BAR_H - 24 }}>
                  <IconTargetFlag width={15.5} height={24} achieved={achieved} color={achieved ? (dark ? '#fff' : SOLV.blue) : dark ? 'rgba(255,255,255,0.45)' : C.greyishWhite} />
                </View>
                <View style={{ position: 'absolute', left: centers[i] - half, top: medY }}>
                  <GiftMedallion tier={t} state={giftState} size={size} dark={dark} />
                </View>
                <Text
                  style={[
                    styles.value,
                    { left: labelX[i], width: labelW[i], top: valueY, textAlign: labelAlign(i) },
                    { color: giftState === 'won' ? (dark ? '#fff' : SOLV.blue) : subColor },
                  ]}
                  numberOfLines={1}
                  allowFontScaling={false}
                >
                  {lakh(t.at)}
                </Text>
                {showNames ? (
                  <Text
                    style={[
                      styles.name,
                      { left: labelX[i], width: labelW[i], top: nameY, textAlign: labelAlign(i) },
                      { color: giftState === 'won' ? inkColor : subColor },
                    ]}
                    numberOfLines={1}
                    allowFontScaling={false}
                  >
                    {t.shortName}
                  </Text>
                ) : null}
              </React.Fragment>
            );
          })}
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  cv: { position: 'absolute', top: 0, padding: 4 },
  cvText: { fontFamily: F.medium, fontSize: 14, lineHeight: T14, color: C.textPrimary, fontVariant: ['tabular-nums'] },
  track: { position: 'absolute', height: BAR_H, backgroundColor: C.greyishWhite },
  fill: { height: BAR_H, borderRadius: 4, backgroundColor: SOLV.blue },
  value: { position: 'absolute', textAlign: 'center', fontFamily: F.medium, fontSize: 12, lineHeight: L12, fontVariant: ['tabular-nums'] },
  name: { position: 'absolute', textAlign: 'center', fontFamily: F.regular, fontSize: 11, lineHeight: NAME_H },
});
