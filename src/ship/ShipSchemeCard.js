// The shippable gift-scheme card: the app's own TSWP card with gift PHOTOS where the
// flags were. Title row, sentence, expiry chip, standing man, 4dp bar — all unchanged
// from the current UI, so it drops into the existing My Targets list.
//
// What the card does by state:
//   SCHEDULED                    no meter yet; announces the window and the top gift
//   LIVE / EARNED / NEAR_SLAB    the medallion rail (see MedallionRail)
//   ended states                 the meter is replaced by the outcome, because a
//                                frozen bar on a closed scheme reads as "keep buying"
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import HtmlText from '../components/HtmlText';
import { C, F } from '../theme';
import { SOLV } from '../gifts/solv';
import { L12, L14 } from '../textMetrics';
import { schemeState, isTerminal, STATE } from '../gifts/state';
import { measure, BOLD_ADV, BOLD_UPEM } from '../fontWidths';
import MedallionRail from './MedallionRail';
import GiftMedallion from './GiftMedallion';

const T14 = L14;
const T12 = L12;

// The title may take two lines. When the natural wrap would strand one word on the
// second line (an orphan), the last two words are joined with a non-breaking space so
// they wrap together — but only when the pair still fits on one line.
function balanceTitle(title, availW) {
  if (availW <= 0) return title;
  const width = (t) => measure(t, 14, BOLD_ADV, BOLD_UPEM);
  if (width(title) <= availW) return title;
  const words = title.split(' ');
  if (words.length < 3) return title;
  // Greedy wrap to find what lands on the second line.
  let line = '';
  let broke = 0;
  for (let i = 0; i < words.length; i++) {
    const tryLine = line ? line + ' ' + words[i] : words[i];
    if (width(tryLine) > availW && line) {
      broke = i;
      break;
    }
    line = tryLine;
  }
  const secondLine = words.slice(broke).join(' ');
  if (broke === words.length - 1 && width(words[words.length - 2] + ' ' + secondLine) <= availW) {
    return words.slice(0, -2).join(' ') + ' ' + words.slice(-2).join('\u00A0');
  }
  return title;
}

export default function ShipSchemeCard({ node, onPress }) {
  const d = node.entityData;
  const [titleBox, setTitleBox] = useState({ y: 0, h: T14 });
  const [cardW, setCardW] = useState(0);
  // tv_scheme_title: marginStart 16, the chip reserves 100 on the right.
  const title = balanceTitle(String(d.localizedTitle), cardW - 16 - 100);

  const s = schemeState(node.gift);
  const terminal = isTerminal(s.state);
  const showMeter = s.started && !terminal;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && onPress ? styles.pressed : null}>
      <View style={styles.card}>
        <View style={styles.content} onLayout={(e) => setCardW(e.nativeEvent.layout.width)}>
          <View>
            <View
              style={styles.titleWrap}
              onLayout={(e) => setTitleBox({ y: e.nativeEvent.layout.y, h: e.nativeEvent.layout.height })}
            >
              <HtmlText html={title} style={styles.title} boldFamily={F.bold} numberOfLines={2} allowFontScaling={false} />
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
            <View style={styles.railWrap}>
              <MedallionRail s={s} currentValue={node.gift.currentValue} size={44} showNames />
            </View>
          ) : null}

          {terminal ? <Outcome s={s} /> : null}

          {s.state === STATE.SCHEDULED ? (
            <View style={styles.scheduledRow}>
              <GiftMedallion tier={s.top} state="open" size={44} />
              <View style={styles.scheduledText}>
                <Text style={styles.outcomeName} numberOfLines={1} allowFontScaling={false}>
                  Top gift: {s.top.name}
                </Text>
                <Text style={styles.outcomeSub} allowFontScaling={false}>Starts {s.startLabel}</Text>
              </View>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

// The closed scheme states the outcome with the won gift's photo, not a meter.
function Outcome({ s }) {
  const line = {
    [STATE.ENDED_MISSED]: null,
    [STATE.ENDED_PENDING]: 'You won',
    [STATE.GIFT_ORDERED]: 'On the way',
    [STATE.DELIVERED]: 'Delivered',
  }[s.state];

  // With no gift won, the card's sentence already says so; a second line repeating
  // it would say the same fact twice on one card.
  if (!s.secured) return null;
  return (
    <View style={styles.outcomeRow}>
      <GiftMedallion tier={s.secured} state="won" size={44} />
      <View style={styles.outcomeText}>
        <Text style={styles.outcomeLabel} allowFontScaling={false}>{line}</Text>
        <Text style={styles.outcomeName} numberOfLines={1} allowFontScaling={false}>{s.secured.name}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pressed: { transform: [{ scale: 0.98 }] },
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
  descUrgent: { color: SOLV.red },
  expiryWrap: { position: 'absolute', right: 16, justifyContent: 'center' },
  expiry: { borderWidth: StyleSheet.hairlineWidth, padding: 4 },
  expiryText: { fontFamily: F.bold, fontSize: 14, lineHeight: T14 },
  railWrap: { marginTop: 12 },
  outcomeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, marginHorizontal: 16, marginBottom: 6 },
  outcomeText: { flex: 1, marginLeft: 12 },
  outcomeLabel: { fontFamily: F.regular, fontSize: 12, lineHeight: T12, color: C.mediumGrey },
  outcomeName: { marginTop: 1, fontFamily: F.medium, fontSize: 13, lineHeight: 16, color: C.greyTextDark },
  outcomeSub: { flex: 1, fontFamily: F.regular, fontSize: 12, lineHeight: T12, color: C.mediumGrey },
  scheduledRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, marginHorizontal: 16, marginBottom: 6 },
  scheduledText: { flex: 1, marginLeft: 12 },
});
