// fragment_target_scheme_detail.xml + TargetSchemeDetailFragment.kt
import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toolbar from '../../src/components/Toolbar';
import DetailProgress from '../../src/components/DetailProgress';
import { C, F } from '../../src/theme';
import { IconChevronRight } from '../../src/icons';
import PayoutIcon from '../../src/components/PayoutIcon';
import { M, SCHEME_DETAILS, payoutText, payoutIconName } from '../../src/data';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
// SimpleDateFormat("dd MMM")
const ddMMM = (ms) => {
  const d = new Date(ms);
  return `${String(d.getUTCDate()).padStart(2, '0')} ${MONTHS[d.getUTCMonth()]}`;
};

export default function SchemeDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const smt = SCHEME_DETAILS[id];
  const [midY, setMidY] = useState(0);

  if (!smt) return <SafeAreaView style={{ flex: 1 }} edges={['top']}><Toolbar title={M._scheme_details} elevation={2} /></SafeAreaView>;

  const bo = smt.schemeMemberTargetBO;
  const dd = smt.displayData;
  const rules = bo.targetSchemeBO.schemeItemRules;
  const included = flatten(rules.includedEntries);
  const excluded = flatten(rules.excludedEntries);
  const last = bo.milestoneBOs.reduce((a, b) => (b.atValue > a.atValue ? b : a), bo.milestoneBOs[0]);
  const showHistory = bo.currentValue > 0;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Toolbar title={M._scheme_details} elevation={2} />
      <ScrollView style={{ flex: 1 }}>
        <View>
          {/* green_bg_view: parent top down to the vertical centre of the first card */}
          <View style={[styles.greenBg, { height: midY }]} />

          <Text style={styles.title} allowFontScaling={false}>{dd.title}</Text>
          <Text style={styles.desc} allowFontScaling={false}>{dd.description}</Text>
          <Text style={styles.time} allowFontScaling={false}>
            {M._valid_from_time_to_time
              .replace('%$', ddMMM(bo.targetSchemeBO.startTime))
              .replace('%$', ddMMM(bo.targetSchemeBO.endTime))}
          </Text>

          <View style={styles.progressHost}>
            <DetailProgress smt={smt} />
          </View>

          {/* Maximum reward card */}
          <View
            style={styles.card}
            onLayout={(e) => setMidY(e.nativeEvent.layout.y + e.nativeEvent.layout.height / 2)}
          >
            {dd.footerLabel ? (
              <Text style={styles.footerLabel} allowFontScaling={false}>{dd.footerLabel}</Text>
            ) : (
              <View style={styles.maxRewardRow}>
                <Text style={styles.maxRewardText} allowFontScaling={false}>{M._maximum_reward}</Text>
                {/* footer_label_ll_view_iv: the layout ships ic_jumbo_coins, and
                    setValuesToTheViews() replaces it with displayData.payoutModeIcon */}
                <View style={styles.coins}><PayoutIcon name={payoutIconName(last.payout)} width={17} /></View>
                <Text style={styles.maxRewardText} allowFontScaling={false}>{payoutText(last.payout)}</Text>
              </View>
            )}
          </View>

          {/* Transaction history row: visible only when currentValue > 0 */}
          {showHistory ? (
            <Pressable
              style={styles.card}
              onPress={() => router.push(`/history/${bo.schemeMemberTargetId}`)}
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

          {/* Scheme rules */}
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

          {/* Top items */}
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

// target_scheme_rule.xml: two 50% cells, each with a 1dp black stroke and 8dp padding
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

// createTable(): all, brand, manufacturer, category, jpin, productVertical — in that order
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
  maxRewardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 20 },
  maxRewardText: { fontFamily: F.regular, fontSize: 14, lineHeight: 16.8, color: C.black },
  coins: { marginHorizontal: 5 },
  footerLabel: { fontFamily: F.bold, fontSize: 14, lineHeight: 16.8, color: C.textPrimary, textAlign: 'center', paddingHorizontal: 16, paddingVertical: 2, minHeight: 56.8, textAlignVertical: 'center' },
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
  // AppCompatButton with backgroundTint light_green: abc_btn_default_mtrl_shape has 2dp
  // corners inside 6dp vertical / 4dp horizontal insets, so the painted box is 36dp tall.
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
