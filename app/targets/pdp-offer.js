// The product page offer list: offers_header_view_holder.xml + target_scheme_view_holder.xml
// (OfferAdapter.Type.TARGET_SCHEME -> TargetSchemeViewHolder.java), and the offers bottom
// sheet the row opens (dialog_product_offers.xml with dialog_view_holder_target_scheme.xml).
import React, { useState } from 'react';
import { View, Text, Pressable, Modal, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import TargetSchemeProgressBlock from '../../src/components/TargetSchemeProgressBlock';
import { C, F } from '../../src/theme';
import { Image } from 'react-native';
import { SCHEME_DETAILS, M } from '../../src/data';

const SMT = SCHEME_DETAILS['TS-100023451'];

function ArrowRed({ size = 20 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path fill="#d55d3b" d="M8.59,16.58L13.17,12L8.59,7.41L10,6l6,6l-6,6L8.59,16.58z" />
    </Svg>
  );
}

export default function PdpOfferRow() {
  const [sheet, setSheet] = useState(false);
  const bo = SMT.schemeMemberTargetBO;
  const dd = SMT.displayData;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* offers_header_view_holder.xml */}
        <View style={styles.headerCard}>
          <Text style={styles.headerText} allowFontScaling={false}>OFFERS</Text>
          <Text style={styles.showMore} allowFontScaling={false}>+1 more offer</Text>
        </View>

        {/* target_scheme_view_holder.xml */}
        <Pressable style={styles.offerCard} onPress={() => setSheet(true)}>
          {/* jt_offers_common_view.xml */}
          <View style={styles.offerView}>
            <View style={styles.offerApplied} />
            {/* getLogoUrl(): @string/_target_offer_small_logo_green */}
            <Image source={require('../../assets/remote/target_offer_small.png')} style={styles.offerLogo} resizeMode="contain" />
            <Text style={styles.offerTitle} allowFontScaling={false}>TARGET SCHEME</Text>
            <ArrowRed />
          </View>

          <Text style={styles.tsTitle} allowFontScaling={false}>{dd.title}</Text>
          <View style={styles.progressHost}>
            <TargetSchemeProgressBlock
              milestones={bo.milestoneBOs}
              current={bo.currentValue}
              milestoneSubtext={dd.milestoneSubtext}
              barStart={44}
              barEnd={32}
              manBaseMargin={37.2}
              textColor={C.greyText}
              startValueColor={C.lightGreen}
            />
          </View>
        </Pressable>
      </ScrollView>

      {/* dialog_product_offers.xml — the offers bottom sheet */}
      <Modal visible={sheet} transparent animationType="slide" onRequestClose={() => setSheet(false)}>
        <Pressable style={styles.scrim} onPress={() => setSheet(false)} />
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Image source={require('../../assets/remote/target_offer_small.png')} style={styles.offerLogo} resizeMode="contain" />
            <Text style={styles.sheetTitle} allowFontScaling={false}>TARGET SCHEME</Text>
            <Pressable onPress={() => setSheet(false)} hitSlop={8}>
              <Svg width={24} height={24} viewBox="0 0 24 24">
                <Path fill={C.black} d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
              </Svg>
            </Pressable>
          </View>
          <View style={styles.sheetDivider} />
          <ScrollView>
            {/* dialog_view_holder_target_scheme.xml in full: title, validity, progress,
                VIEW MORE DETAILS and the bottom border */}
            <View style={styles.dialogCard}>
              <Text style={styles.dialogTitle} allowFontScaling={false}>{dd.title}</Text>
              <Text style={styles.dialogValidity} allowFontScaling={false}>{dd.subtitle}</Text>
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
              <Text style={styles.moreDetails} allowFontScaling={false}>VIEW MORE DETAILS  ›</Text>
              <View style={styles.bottomBorder} />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.defaultBg },
  // offers_header_view_holder.xml: rectangular_border_1px card
  headerCard: {
    marginTop: 4,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.grey3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  headerText: { color: C.greyTextDark, fontSize: 14, lineHeight: 16.8, fontFamily: F.medium },
  showMore: { color: '#d55d3b', fontSize: 13, lineHeight: 15.6, fontFamily: F.medium },
  offerCard: { backgroundColor: C.white, borderWidth: 1, borderColor: C.grey3, paddingBottom: 8 },
  offerView: { flexDirection: 'row', alignItems: 'center', padding: 8 },
  offerApplied: { width: 20, height: 20 },
  offerLogo: { width: 20, height: 20, marginLeft: 16 },
  offerTitle: { flex: 1, marginLeft: 16, color: C.lightGreen, fontSize: 14, lineHeight: 16.8, fontFamily: F.medium },
  tsTitle: { marginLeft: 44, marginTop: 8, marginRight: 8, color: '#5f5f5f', fontSize: 12, lineHeight: 14.4, fontFamily: F.medium },
  progressHost: { marginTop: 4 },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: C.white, maxHeight: '70%' },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16 },
  sheetTitle: { flex: 1, marginLeft: 16, color: C.greyTextDark, fontSize: 14, lineHeight: 16.8, fontFamily: F.medium },
  sheetDivider: { height: 1, marginTop: 16, backgroundColor: C.greyishWhite },
  dialogCard: { paddingBottom: 8 },
  dialogTitle: { marginHorizontal: 16, marginTop: 8, color: C.greyTextDark, fontSize: 13, lineHeight: 15.6, fontFamily: F.medium },
  dialogValidity: { marginHorizontal: 16, color: C.textPrimary, fontSize: 13, lineHeight: 15.6, fontFamily: F.medium },
  moreDetails: { marginTop: 16, marginBottom: 16, textAlign: 'center', color: '#d55d3b', fontSize: 13, lineHeight: 15.6, fontFamily: F.medium },
  bottomBorder: { height: 1, backgroundColor: C.greyText },
});
