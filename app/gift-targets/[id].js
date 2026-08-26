// Flow A: Scheme Details for a gift scheme, in the current detail layout.
// Same structure as app/scheme/[id].js. Deltas the paradigm needs:
//   - GiftDetailProgress renders gift names on the milestone markers.
//   - The reward card lists the gift ladder (the "Maximum reward" row cannot say
//     "₹" + value for a gift).
//   - The footer copy says "delivered", never "credited".
//   - Transaction history stays as-is: GTV contributions are still rupee amounts.
import React, { useState } from 'react';
import { View, Text, Image, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toolbar from '../../src/components/Toolbar';
import GiftDetailProgress from '../../src/gifts/GiftDetailProgress';
import { C, F } from '../../src/theme';
import { IconChevronRight } from '../../src/icons';
import GiftGlyph from '../../src/gifts/icons';
import { M, indianPrice } from '../../src/data';
import { GIFT_SCHEME_DETAILS, GM } from '../../src/gifts/data';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const ddMMM = (ms) => {
  const d = new Date(ms);
  return `${String(d.getUTCDate()).padStart(2, '0')} ${MONTHS[d.getUTCMonth()]}`;
};

export default function GiftSchemeDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const smt = GIFT_SCHEME_DETAILS[id];
  const [midY, setMidY] = useState(0);

  if (!smt) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <Toolbar title={GM._gift_scheme_details} elevation={2} />
      </SafeAreaView>
    );
  }

  const bo = smt.schemeMemberTargetBO;
  const dd = smt.displayData;
  const rules = bo.targetSchemeBO.schemeItemRules;
  const included = flatten(rules.includedEntries);
  const excluded = flatten(rules.excludedEntries);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Toolbar title={GM._gift_scheme_details} elevation={2} />
      <ScrollView style={{ flex: 1 }}>
        <View>
          <View style={[styles.greenBg, { height: midY }]} />

          <Text style={styles.title} allowFontScaling={false}>{dd.title}</Text>
          <Text style={styles.desc} allowFontScaling={false}>{dd.description}</Text>
          <Text style={styles.time} allowFontScaling={false}>
            {M._valid_from_time_to_time
              .replace('%$', ddMMM(bo.targetSchemeBO.startTime))
              .replace('%$', ddMMM(bo.targetSchemeBO.endTime))}
          </Text>

          <View style={styles.progressHost}>
            <GiftDetailProgress smt={smt} />
          </View>

          {/* Gift ladder card: replaces the "Maximum reward" row */}
          <View
            style={styles.card}
            onLayout={(e) => setMidY(e.nativeEvent.layout.y + e.nativeEvent.layout.height / 2)}
          >
            <View style={styles.ladderBody}>
              {bo.milestoneBOs.map((m, i) => {
                const achieved = bo.currentValue >= m.atValue;
                // One gift only: the highest crossed slab is "Yours today", crossed
                // slabs below it are "Replaced".
                const highestAchieved = bo.milestoneBOs.filter((x) => bo.currentValue >= x.atValue).pop();
                const isCurrent = achieved && highestAchieved && m.atValue === highestAchieved.atValue;
                return (
                  <View key={m.milestoneId} style={[styles.ladderRow, i > 0 && styles.ladderRowDivider]}>
                    {/* payoutIcon is a URL on the wire, so the current stack can serve
                        product thumbnails here without a client change */}
                    {m.payout.gift.image ? (
                      <View style={[styles.ladderThumb, !achieved && { opacity: 0.5 }]}>
                        <Image source={m.payout.gift.image} style={styles.ladderThumbImg} resizeMode="contain" />
                      </View>
                    ) : (
                      <GiftGlyph kind={m.payout.gift.icon} size={22} color={achieved ? C.lightGreen : C.greyTextDark} />
                    )}
                    <View style={styles.ladderText}>
                      <Text style={styles.ladderGift} allowFontScaling={false}>{m.payout.gift.name}</Text>
                      <Text style={styles.ladderAt} allowFontScaling={false}>
                        Buy for {indianPrice(m.atValue)}
                      </Text>
                    </View>
                    <Text
                      style={[styles.ladderState, { color: isCurrent ? C.lightGreen : C.mediumGrey }]}
                      allowFontScaling={false}
                    >
                      {isCurrent ? 'Your gift now' : achieved ? 'Crossed' : ''}
                    </Text>
                  </View>
                );
              })}
              <Text style={styles.footerNote} allowFontScaling={false}>{dd.footerLabel}</Text>
            </View>
          </View>

          {/* Transaction history: unchanged from the current paradigm */}
          {bo.currentValue > 0 ? (
            <Pressable
              style={styles.card}
              onPress={() => router.push(`/history/SMT-800045121`)}
              android_ripple={{ color: '#0000000d' }}
            >
              <View style={styles.historyRow}>
                <Text style={styles.historyLabel} allowFontScaling={false}>{M._transaction_history}</Text>
                <View style={styles.historyRight}>
                  <Text style={styles.viewLink} allowFontScaling={false}>{M._view}</Text>
                  <IconChevronRight size={18} color={C.yellowPale6} />
                </View>
              </View>
            </Pressable>
          ) : null}

          {/* Scheme rules: unchanged */}
          <View style={styles.card}>
            <View style={styles.rulesBody}>
              <Text style={styles.rulesTitle} allowFontScaling={false}>{M._scheme_rules}</Text>
              <Text style={styles.rulesDesc} allowFontScaling={false}>{M._scheme_rules_desc}</Text>
              {included.map((name, i) => (
                <RuleRow key={`in-${i}`} name={name} eligible />
              ))}
              {excluded.length ? (
                <Text style={styles.exceptLabel} allowFontScaling={false}>{M._except}</Text>
              ) : null}
              {excluded.map((name, i) => (
                <RuleRow key={`ex-${i}`} name={name} eligible={false} />
              ))}
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.topItemsRow}>
              <Text style={styles.topItemsLabel} allowFontScaling={false}>{M._top_items_target}</Text>
              <Pressable style={styles.viewButton} android_ripple={{ color: '#ffffff33' }}>
                <Text style={styles.viewButtonText} allowFontScaling={false}>{M._view.toUpperCase()}</Text>
                <IconChevronRight size={24} color={C.white} />
              </Pressable>
            </View>
          </View>
          <View style={{ height: 10 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function RuleRow({ name, eligible }) {
  return (
    <View style={styles.ruleRow}>
      <View style={styles.ruleCell}>
        <Text style={styles.ruleName} allowFontScaling={false}>{name}</Text>
      </View>
      <View style={styles.ruleCell}>
        <Text style={[styles.ruleEligibility, { color: eligible ? C.lightGreen : C.red }]} allowFontScaling={false}>
          {eligible ? M._eligible : M._not_eligible}
        </Text>
      </View>
    </View>
  );
}

function flatten(entries) {
  if (!entries) return [];
  const order = ['all', 'brand', 'manufacturer', 'category', 'jpin', 'productVertical'];
  return order.flatMap((k) => entries[k] || []);
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.defaultBg },
  greenBg: { position: 'absolute', left: 0, right: 0, top: 0, backgroundColor: C.brandGreen },
  title: { marginTop: 16, paddingHorizontal: 16, textAlign: 'center', fontFamily: F.medium, fontSize: 14, lineHeight: 16.8, color: C.white },
  desc: { marginTop: 8, paddingHorizontal: 16, textAlign: 'center', fontFamily: F.regular, fontSize: 12, lineHeight: 14.4, color: C.white },
  time: { marginTop: 8, paddingHorizontal: 16, textAlign: 'center', fontFamily: F.regular, fontSize: 12, lineHeight: 14.4, color: C.white },
  progressHost: { marginRight: 8 },
  card: {
    marginVertical: 10,
    marginHorizontal: 10,
    borderRadius: 5,
    backgroundColor: C.white,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 1.5,
    shadowOffset: { width: 0, height: 1 },
    overflow: 'hidden',
  },
  ladderBody: { paddingHorizontal: 16, paddingVertical: 8 },
  ladderThumb: { width: 44, height: 44, borderRadius: 4, borderWidth: 1, borderColor: C.lightGreyishWhite, alignItems: 'center', justifyContent: 'center' },
  ladderThumbImg: { width: 38, height: 38 },
  ladderRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  ladderRowDivider: { borderTopWidth: 1, borderTopColor: C.lightGreyishWhite },
  ladderText: { flex: 1, marginLeft: 12, marginRight: 8 },
  ladderGift: { fontFamily: F.medium, fontSize: 14, lineHeight: 16.8, color: C.textPrimary },
  ladderAt: { marginTop: 2, fontFamily: F.regular, fontSize: 12, lineHeight: 14.4, color: C.mediumGrey },
  ladderState: { fontFamily: F.bold, fontSize: 12, lineHeight: 14.4 },
  footerNote: { paddingVertical: 12, borderTopWidth: 1, borderTopColor: C.lightGreyishWhite, fontFamily: F.regular, fontSize: 12, lineHeight: 14.4, color: C.greyTextDark },
  historyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 20 },
  historyLabel: { marginLeft: 20, flex: 1, fontFamily: F.regular, fontSize: 15, lineHeight: 18.0, color: C.black },
  historyRight: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  viewLink: { fontFamily: F.regular, fontSize: 15, lineHeight: 18.0, color: C.yellowPale6 },
  rulesBody: { padding: 20 },
  rulesTitle: { marginBottom: 10, fontFamily: F.medium, fontSize: 15, lineHeight: 18.0, color: C.textPrimary },
  rulesDesc: { marginTop: 8, marginBottom: 10, fontFamily: F.regular, fontSize: 12, lineHeight: 14.4, color: C.textPrimary },
  exceptLabel: { marginTop: 8, marginBottom: 10, fontFamily: F.regular, fontSize: 12, lineHeight: 14.4, color: C.textPrimary },
  ruleRow: { flexDirection: 'row' },
  ruleCell: { flex: 1, borderWidth: 1, borderColor: C.black, padding: 8, justifyContent: 'center' },
  ruleName: { fontFamily: F.regular, fontSize: 14, lineHeight: 16.8, color: C.textPrimary },
  ruleEligibility: { fontFamily: F.regular, fontSize: 14, lineHeight: 16.8 },
  topItemsRow: { flexDirection: 'row', alignItems: 'center', padding: 10 },
  topItemsLabel: { flex: 1, fontFamily: F.medium, fontSize: 15, lineHeight: 18.0, color: C.textPrimary },
  viewButton: {
    minWidth: 80,
    height: 36,
    marginVertical: 6,
    marginHorizontal: 4,
    borderRadius: 2,
    backgroundColor: C.lightGreen,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  viewButtonText: { fontFamily: F.medium, fontSize: 14, lineHeight: 16.8, color: C.white },
});
