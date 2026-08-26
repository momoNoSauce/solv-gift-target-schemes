// The cart target-scheme touchpoints:
//   cart_suggestion_target_scheme.xml — the suggestion strip in the cart
//     (CartDetailsFragment.getView: icon, all-caps title, red arrow, HTML suggestion text)
//   dialog_target_schemes.xml — the dialog it opens (TargetSchemesDialog.java), listing
//     target_scheme_view_holder_list.xml cards, each with the getDialogView progress block.
import React, { useState } from 'react';
import { View, Text, Pressable, Modal, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import Toolbar from '../../src/components/Toolbar';
import TargetSchemeProgressBlock from '../../src/components/TargetSchemeProgressBlock';
import { C, F } from '../../src/theme';
import { IconTruckOutline } from '../../src/icons';
import { Image } from 'react-native';
import { SCHEME_DETAILS } from '../../src/data';

const SCHEMES = [SCHEME_DETAILS['TS-100023451'], SCHEME_DETAILS['TS-100023452']];

export default function CartTargetSchemes() {
  const [dialog, setDialog] = useState(false);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {/* CartDetailsFragment: @string/_cart_items_msg = "Your Cart Items (%$)" */}
      <Toolbar title="Your Cart Items (3)" elevation={4} />
      <ScrollView>
        {/* cart_suggestion_target_scheme.xml */}
        <Pressable style={styles.suggestion} onPress={() => setDialog(true)}>
          <View style={styles.suggestionTopRow}>
            <View style={styles.icon}>
              <IconTruckOutline size={24} />
            </View>
            <Text style={styles.title} allowFontScaling={false}>TARGET SCHEME</Text>
            <Svg width={24} height={24} viewBox="0 0 24 24">
              <Path fill="#d55d3b" d="M8.59,16.58L13.17,12L8.59,7.41L10,6l6,6l-6,6L8.59,16.58z" />
            </Svg>
          </View>
          <Text style={styles.suggestionText} allowFontScaling={false}>
            Add ₹1,200 more of Garnier Men's products to earn ₹50 Jumbocash
          </Text>
          <View style={styles.divider} />
        </Pressable>
      </ScrollView>

      <Modal visible={dialog} transparent animationType="slide" onRequestClose={() => setDialog(false)}>
        <Pressable style={styles.scrim} onPress={() => setDialog(false)} />
        <View style={styles.dialog}>
          <View style={styles.dialogHeader}>
            {/* TargetSchemesDialog loads @string/_target_offer_logo_disabled */}
            <Image source={require('../../assets/remote/target_offer_disabled.png')} style={styles.dialogLogo} resizeMode="contain" />
            <Text style={styles.dialogTitle} allowFontScaling={false}>TARGET SCHEME</Text>
            <Pressable onPress={() => setDialog(false)} hitSlop={8}>
              <Svg width={24} height={24} viewBox="0 0 24 24">
                <Path fill={C.black} d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
              </Svg>
            </Pressable>
          </View>
          <View style={styles.dialogDivider} />
          <ScrollView>
            {SCHEMES.map((smt) => {
              const bo = smt.schemeMemberTargetBO;
              const dd = smt.displayData;
              return (
                <View key={bo.targetSchemeId} style={styles.listCard}>
                  <View style={styles.listCardHead}>
                    <Text style={styles.listTitle} numberOfLines={1} allowFontScaling={false}>{dd.title}</Text>
                    <Text style={styles.listTime} allowFontScaling={false}>{dd.subtitle}</Text>
                  </View>
                  <Text style={styles.listDescription} numberOfLines={2} allowFontScaling={false}>
                    {dd.description}
                  </Text>
                  <TargetSchemeProgressBlock
                    milestones={bo.milestoneBOs}
                    current={bo.currentValue}
                    milestoneSubtext={dd.milestoneSubtext}
                    barStart={32}
                    barEnd={32}
                    manBaseMargin={25.2}
                    textColor={C.greyText}
                    startValueColor={C.lightGreen}
                  />
                </View>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.white },
  suggestion: { backgroundColor: C.white },
  suggestionTopRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  icon: { width: 24, height: 24, marginLeft: 16, justifyContent: 'center' },
  title: { flex: 1, marginHorizontal: 16, color: C.greyTextDark, fontSize: 12, lineHeight: 14.4, fontFamily: F.medium },
  suggestionText: { marginLeft: 56, marginRight: 56, marginTop: 8, marginBottom: 12, color: C.textPrimary, fontSize: 12, lineHeight: 14.4, fontFamily: F.medium },
  divider: { height: 1, backgroundColor: C.greyishWhite },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  // dialog_target_schemes.xml: match_parent width, wrap height, anchored to the bottom
  dialog: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: C.white, maxHeight: '80%' },
  dialogHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16 },
  dialogLogo: { width: 20, height: 20 },
  dialogTitle: { flex: 1, marginLeft: 16, color: C.greyTextDark, fontSize: 14, lineHeight: 16.8, fontFamily: F.medium },
  dialogDivider: { height: 1, marginTop: 16, backgroundColor: C.greyishWhite },
  // target_scheme_view_holder_list.xml
  listCard: {
    marginHorizontal: 10,
    marginVertical: 4,
    borderRadius: 4,
    backgroundColor: C.white,
    paddingBottom: 14,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  listCardHead: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 14, paddingTop: 14 },
  listTitle: { flex: 1, marginRight: 30, color: C.black, fontSize: 15, lineHeight: 18.0, fontFamily: F.medium },
  listTime: { paddingHorizontal: 10, paddingVertical: 4, color: C.brown3, fontSize: 13, lineHeight: 15.6, fontFamily: F.medium },
  listDescription: { marginTop: 14, marginHorizontal: 14, color: C.textPrimary, fontSize: 15, lineHeight: 18.0, fontFamily: F.regular },
});
