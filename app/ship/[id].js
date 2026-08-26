// Shippable Scheme Details, Solv skin. Division of labour, so nothing repeats:
//   - Hero (Solv blue): title, one state sentence, validity, then the app's COMPACT
//     progress block — man, bar, flags, slab values. The map: where am I.
//   - Gift ladder card: a vertical timeline through the gift photos. The catalogue:
//     what do I get at each step, and where each step stands. Reference: courier
//     order-tracking timelines, which the target users read daily; Crypto.com's
//     station list for the locked/unlocked node pattern.
//   - Transaction history, Scheme Rules and Top items keep the app's own components.
//
// One colour, one meaning: blue is progress and ownership (fill, man, crossed flags,
// rings, "₹X more", "Yours"); green appears only on check badges and delivery
// success; grey is not-yet or past tense.
//
// Ladder row vocabulary, kept to what a shopkeeper says. One shape for distance,
// present or past:
//   You won                  the highest crossed slab, running or ended (row tinted
//                            blue); the sub line carries the delivery timing while
//                            the window is open and the delivery status after
//   ₹3,60,000 more           the distance to a gift still open
//   Needed ₹4,40,000 more    an ended scheme's unreached slab, same shape, past tense
// A crossed-but-superseded row keeps its check and dims: the check says crossed, the
// highlight on the row above says which gift goes home. No verdict words.
import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toolbar from '../../src/components/Toolbar';
import MedallionRail from '../../src/ship/MedallionRail';
import GiftMedallion from '../../src/ship/GiftMedallion';
import { C, F } from '../../src/theme';
import { SOLV } from '../../src/gifts/solv';
import { L12, L14 } from '../../src/textMetrics';
import { IconChevronRight } from '../../src/icons';
import { M, indianPrice } from '../../src/data';
import { schemeState, STATE } from '../../src/gifts/state';
import { lakh } from '../../src/gifts/data';
import { SHIP_BY_ID } from '../../src/ship/data';

const ROW_PAD_V = 8;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const ddMMM = (ms) => {
  const d = new Date(ms);
  return `${String(d.getUTCDate()).padStart(2, '0')} ${MONTHS[d.getUTCMonth()]}`;
};

// The header sentence follows the state so a closed scheme never asks for more buying.
function heroLine(s) {
  switch (s.state) {
    case STATE.SCHEDULED:
      return `Starts ${s.startLabel}. Gifts up to the ${s.top.name}.`;
    case STATE.ENDED_MISSED:
      return 'The scheme ended below the first slab. No gift was won.';
    case STATE.ENDED_PENDING:
    case STATE.GIFT_ORDERED:
    case STATE.DELIVERED:
      return `You won the ${s.secured.name}`;
    case STATE.TOP_REACHED:
      return `You won the ${s.top.name}, the top gift`;
    case STATE.NEAR_SLAB:
      return `Only ${indianPrice(s.remaining)} more for the ${s.next.name}`;
    default:
      return `Buy ${indianPrice(s.remaining)} more and the ${s.next.name} is yours`;
  }
}

// One ladder row. The medallion sits on a continuous timeline the card draws behind
// the rows, so the line never breaks at row boundaries.
function LadderRow({ s, tier, fulfilment, onCenter }) {
  const crossed = s.started && s.currentValue >= tier.at;
  const held = s.started && s.secured && tier.at === s.secured.at;
  const superseded = crossed && !held;
  const isNext = s.next && tier.at === s.next.at;

  let right = null;
  let sub = null;
  if (held) {
    // One event, one phrase: crossing the slab WINS the gift, whether the window is
    // still open or closed. The sub line carries what changes: delivery status after
    // the window closes, the delivery timing before it.
    right = { text: 'You won', color: SOLV.green };
    sub = !s.ended
      ? { text: `You get it after the scheme ends, ${s.endLabel}`, color: C.mediumGrey }
      : s.state === STATE.DELIVERED
      ? { text: `Delivered ${ddMMM(fulfilment.deliveredAt)}`, color: SOLV.green }
      : s.state === STATE.GIFT_ORDERED
      ? { text: `On the way. Ordered ${ddMMM(fulfilment.orderedAt)}.`, color: C.mediumGrey }
      : { text: 'Your gift order will be placed soon', color: C.mediumGrey };
  } else if (!s.started) {
    right = null;
  } else if (!crossed && !s.ended) {
    right = { text: `${indianPrice(tier.at - s.currentValue)} more`, color: SOLV.blue };
  } else if (!crossed && s.ended) {
    right = { text: `Needed ${indianPrice(tier.at - s.currentValue)} more`, color: C.mediumGrey };
  }

  return (
    <View
      style={[styles.row, held && styles.rowHeld]}
      onLayout={(e) => onCenter(e.nativeEvent.layout.y + ROW_PAD_V + 24)}
    >
      <View style={styles.timelineCol}>
        <GiftMedallion tier={tier} state={held ? 'won' : superseded ? 'passed' : 'open'} size={48} />
      </View>
      <View style={styles.rowText}>
        <Text style={[styles.rowName, superseded && { color: C.mediumGrey }]} numberOfLines={2} allowFontScaling={false}>
          {tier.name}
        </Text>
        <Text style={styles.rowAt} allowFontScaling={false}>At {lakh(tier.at)}</Text>
        {sub ? (
          <Text style={[styles.rowSub, { color: sub.color }]} allowFontScaling={false}>{sub.text}</Text>
        ) : null}
      </View>
      {right ? (
        <Text style={[styles.rowRight, { color: right.color }]} allowFontScaling={false}>
          {right.text}
        </Text>
      ) : null}
    </View>
  );
}

export default function ShipSchemeDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const entry = SHIP_BY_ID[id];
  const [midY, setMidY] = useState(0);
  const [centers, setCenters] = useState([]);

  if (!entry) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <Toolbar title={M._scheme_details} elevation={2} color={SOLV.blue} />
      </SafeAreaView>
    );
  }

  const { node, included, excluded } = entry;
  const s = schemeState(node.gift);
  const heldIdx = s.secured ? s.ladder.findIndex((t) => t.at === s.secured.at) : -1;
  const lastIdx = s.ladder.length - 1;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Toolbar title={M._scheme_details} elevation={2} color={SOLV.blue} />
      <ScrollView style={{ flex: 1 }}>
        <View>
          <View style={[styles.blueBg, { height: midY }]} />

          <Text style={styles.title} allowFontScaling={false}>{stripHtml(node.entityData.localizedTitle)}</Text>
          <Text style={styles.heroLine} allowFontScaling={false}>{heroLine(s)}</Text>
          <Text style={styles.time} allowFontScaling={false}>
            {M._valid_from_time_to_time
              .replace('%$', ddMMM(node.gift.startTime))
              .replace('%$', ddMMM(node.gift.endTime))}
          </Text>

          {/* The map: the app's own compact progress block. Photos live in the ladder. */}
          <View style={styles.railHost}>
            <MedallionRail s={s} currentValue={node.gift.currentValue} dark medallions={false} />
          </View>

          {/* The ladder: one continuous timeline through the gift photos. Blue up to
              the gift in hand, grey beyond, drawn behind the medallions. */}
          <View
            style={styles.card}
            onLayout={(e) => setMidY(e.nativeEvent.layout.y + e.nativeEvent.layout.height / 2)}
          >
            <View style={styles.ladderBody}>
              {s.ladder.every((_, i) => typeof centers[i] === 'number') ? (
                <>
                  {heldIdx > 0 ? (
                    <View style={[styles.timeline, { top: centers[0], height: centers[heldIdx] - centers[0], backgroundColor: SOLV.blue }]} />
                  ) : null}
                  {lastIdx > Math.max(heldIdx, 0) ? (
                    <View
                      style={[
                        styles.timeline,
                        {
                          top: centers[Math.max(heldIdx, 0)],
                          height: centers[lastIdx] - centers[Math.max(heldIdx, 0)],
                          backgroundColor: '#E2E2E2',
                        },
                      ]}
                    />
                  ) : null}
                </>
              ) : null}
              {s.ladder.map((t, i) => (
                <LadderRow
                  key={t.at}
                  s={s}
                  tier={t}
                  fulfilment={node.gift.fulfilment}
                  onCenter={(y) => setCenters((prev) => (prev[i] === y ? prev : Object.assign([...prev], { [i]: y })))}
                />
              ))}
            </View>
          </View>

          {/* Transaction history */}
          {node.gift.currentValue > 0 ? (
            <Pressable style={styles.card} onPress={() => router.push('/history/SMT-800045121')} android_ripple={{ color: '#0000000d' }}>
              <View style={styles.historyRow}>
                <Text style={styles.historyLabel} allowFontScaling={false}>{M._transaction_history}</Text>
                <View style={styles.historyRight}>
                  <Text style={styles.viewLink} allowFontScaling={false}>{M._view}</Text>
                  <IconChevronRight size={18} color={SOLV.blue} />
                </View>
              </View>
            </Pressable>
          ) : null}

          {/* Scheme rules */}
          <View style={styles.card}>
            <View style={styles.rulesBody}>
              <Text style={styles.rulesTitle} allowFontScaling={false}>{M._scheme_rules}</Text>
              <Text style={styles.rulesDesc} allowFontScaling={false}>{M._scheme_rules_desc}</Text>
              {included.map((r) => (
                <View key={r} style={styles.ruleRow}>
                  <View style={styles.ruleCellLeft}><Text style={styles.ruleText} allowFontScaling={false}>{r}</Text></View>
                  <View style={styles.ruleCellRight}><Text style={[styles.ruleText, { color: SOLV.green }]} allowFontScaling={false}>{M._eligible}</Text></View>
                </View>
              ))}
              {excluded.length ? <Text style={styles.exceptText} allowFontScaling={false}>{M._except}</Text> : null}
              {excluded.map((r) => (
                <View key={r} style={styles.ruleRow}>
                  <View style={styles.ruleCellLeft}><Text style={styles.ruleText} allowFontScaling={false}>{r}</Text></View>
                  <View style={styles.ruleCellRight}><Text style={[styles.ruleText, { color: C.red }]} allowFontScaling={false}>{M._not_eligible}</Text></View>
                </View>
              ))}
              <Text style={styles.ruleNote} allowFontScaling={false}>
                One gift per scheme. The highest slab you cross decides the gift.
                {s.ended ? '' : ` Gift delivery starts after ${node.gift.endLabel}.`}
              </Text>
            </View>
          </View>

          {/* Top items */}
          {!s.ended ? (
            <View style={styles.card}>
              <View style={styles.topItemsRow}>
                <Text style={styles.topItemsLabel} allowFontScaling={false}>{M._top_items_target}</Text>
                <Pressable style={styles.viewBtn} onPress={() => router.push('/jumbocash/labels')} android_ripple={{ color: '#ffffff33' }}>
                  <Text style={styles.viewBtnText} allowFontScaling={false}>{M._view.toUpperCase()}</Text>
                  <IconChevronRight size={18} color={C.white} />
                </Pressable>
              </View>
            </View>
          ) : null}

          <View style={{ height: 24 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const stripHtml = (v) => String(v ?? '').replace(/<[^>]*>/g, '');

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: SOLV.bg },
  blueBg: { position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: SOLV.blue },
  title: { marginTop: 16, paddingHorizontal: 16, textAlign: 'center', fontFamily: F.medium, fontSize: 14, lineHeight: L14, color: C.white },
  heroLine: { marginTop: 8, paddingHorizontal: 24, textAlign: 'center', fontFamily: F.regular, fontSize: 12, lineHeight: L12 + 2, color: C.white },
  time: { marginTop: 8, paddingHorizontal: 16, textAlign: 'center', fontFamily: F.regular, fontSize: 12, lineHeight: L12, color: 'rgba(255,255,255,0.85)' },
  railHost: { marginTop: 4, marginHorizontal: 8 },
  card: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: C.white,
    borderRadius: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 2.5,
    shadowOffset: { width: 0, height: 1 },
  },
  ladderBody: { paddingHorizontal: 16, paddingVertical: 8 },
  // every row carries the same vertical padding, so the medallion centre is always
  // rowY + ROW_PAD_V + 24 and the timeline can be drawn from measured centres
  row: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 8, borderRadius: 8 },
  rowHeld: { backgroundColor: SOLV.blueBg, marginHorizontal: -8, paddingHorizontal: 8 },
  timeline: { position: 'absolute', left: 16 + 24 - 1, width: 2, borderRadius: 1 },
  timelineCol: { alignItems: 'center', width: 48 },
  rowText: { flex: 1, marginLeft: 14, marginRight: 10, paddingTop: 4 },
  rowName: { fontFamily: F.bold, fontSize: 14, lineHeight: L14, color: C.black },
  rowAt: { marginTop: 2, fontFamily: F.regular, fontSize: 12, lineHeight: L12, color: C.greyText, fontVariant: ['tabular-nums'] },
  rowSub: { marginTop: 3, fontFamily: F.regular, fontSize: 12, lineHeight: L12 + 2 },
  // Emphasis by size and colour, never by bolding small text: the right column is
  // the row's one fact, so it reads at 13 Medium.
  rowRight: { paddingTop: 4, fontFamily: F.medium, fontSize: 13, lineHeight: 16, textAlign: 'right', fontVariant: ['tabular-nums'] },
  historyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16 },
  historyLabel: { fontFamily: F.regular, fontSize: 15, lineHeight: 18, color: C.black },
  historyRight: { flexDirection: 'row', alignItems: 'center' },
  viewLink: { fontFamily: F.regular, fontSize: 15, lineHeight: 18, color: SOLV.blue },
  rulesBody: { paddingHorizontal: 16, paddingVertical: 16 },
  rulesTitle: { fontFamily: F.medium, fontSize: 15, lineHeight: 18, color: C.black },
  rulesDesc: { marginTop: 8, fontFamily: F.regular, fontSize: 12, lineHeight: L12, color: C.black },
  ruleRow: { flexDirection: 'row', marginTop: 8 },
  ruleCellLeft: { flex: 1, borderWidth: 1, borderColor: C.black, padding: 10 },
  ruleCellRight: { flex: 0.85, borderWidth: 1, borderColor: C.black, borderLeftWidth: 0, padding: 10 },
  ruleText: { fontFamily: F.regular, fontSize: 14, lineHeight: L14, color: C.black },
  ruleNote: { marginTop: 12, fontFamily: F.regular, fontSize: 12, lineHeight: L12 + 3, color: C.mediumGrey },
  exceptText: { marginTop: 10, fontFamily: F.regular, fontSize: 12, lineHeight: L12, color: C.black },
  topItemsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  topItemsLabel: { fontFamily: F.medium, fontSize: 15, lineHeight: 18, color: C.black },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SOLV.blue,
    borderRadius: 4,
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 9,
  },
  viewBtnText: { fontFamily: F.medium, fontSize: 14, lineHeight: L14, color: C.white },
});
