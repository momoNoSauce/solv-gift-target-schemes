// fragment_jumbocash_ledger_details.xml + JumboCashPolicyFragment.kt +
// jumbocash_policy_item.xml (accordion rows, expand arrow toggles the body).
import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import Toolbar from '../../src/components/Toolbar';
import { C, F } from '../../src/theme';
import { JC_DETAILS, JC_POLICIES, JM } from '../../src/jumbocash/data';

// handleCreditPolicyViewState(): ic_arrow_right_smoothened when collapsed,
// ic_up_arrow_smoothened when expanded
function Chevron({ open }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path
        fill="#2C552D"
        d={open ? 'M7.41,15.41L12,10.83l4.59,4.58L18,14l-6,-6l-6,6z' : 'M8.59,16.58L13.17,12L8.59,7.41L10,6l6,6l-6,6L8.59,16.58z'}
      />
    </Svg>
  );
}

export default function AboutJumbocash() {
  const [open, setOpen] = useState(0);
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Toolbar title={JM._jumbocash_tnc_title} />
      <ScrollView>
        <View style={styles.headerRow}>
          <Text style={styles.headerLabel} allowFontScaling={false}>Total Jumbocash</Text>
          <Text style={styles.headerAmount} allowFontScaling={false}>₹{JC_DETAILS.totalBalance}</Text>
        </View>
        <View style={styles.headerDivider} />
        <Text style={styles.sectionTitle} allowFontScaling={false}>{JM.about_jumbocash}</Text>

        {JC_POLICIES.map((p, i) => (
          <Pressable key={i} style={styles.policyCard} onPress={() => setOpen(open === i ? -1 : i)}>
            <View style={styles.policyHeaderRow}>
              <Text style={styles.policyHeader} allowFontScaling={false}>{p.header}</Text>
              <Chevron open={open === i} />
            </View>
            {open === i ? (
              <Text style={styles.policyBody} allowFontScaling={false}>{p.body}</Text>
            ) : null}
          </Pressable>
        ))}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.white },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, marginLeft: 16, marginRight: 16 },
  headerLabel: { color: '#999999', fontSize: 16, lineHeight: 19.2, fontFamily: F.regular },
  headerAmount: { color: '#1C1B1F', fontSize: 24, lineHeight: 28.8, fontFamily: F.bold },
  headerDivider: { height: 1, marginTop: 16, backgroundColor: 'rgba(0,0,0,0.3)' },
  sectionTitle: { marginLeft: 14, marginTop: 21, color: '#2C552D', fontSize: 18, lineHeight: 21.6, fontFamily: F.bold },
  // jumbocash_policy_item.xml: background_need_more_credit card, 14dp vertical padding
  policyCard: {
    marginHorizontal: 16,
    marginTop: 14,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.greyishWhite,
    backgroundColor: C.white,
  },
  policyHeaderRow: { flexDirection: 'row', alignItems: 'center' },
  // @color/brand_color on the jumbotail flavour
  policyHeader: { flex: 1, paddingHorizontal: 20, color: '#4CAF50', fontSize: 16, lineHeight: 19.2, fontFamily: F.bold },
  policyBody: { marginTop: 14, marginHorizontal: 20, color: '#000000', fontSize: 12, lineHeight: 14.4, fontFamily: F.regular },
});
