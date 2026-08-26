// Touchpoint: the cart's target-scheme surfaces, built from the app's OWN layouts:
//   cart_suggestion_target_scheme.xml   the suggestion strip in the cart
//     (CartDetailsFragment.getView: icon, all-caps title, arrow, suggestion sentence)
//   dialog_target_schemes.xml           the dialog it opens (TargetSchemesDialog.java),
//     listing target_scheme_view_holder_list.xml cards with the progress block
// Deltas from the JT original, both sanctioned: Solv blue chrome, and the gift
// MedallionRail in place of the coin progress block. The suggestion sentence keeps the
// app's own copy shape ("Add ₹X more of Y to earn Z"), with the gift as the payout.
import React, { useState } from 'react';
import { View, Text, Image, Pressable, Modal, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import Toolbar from '../../src/components/Toolbar';
import MedallionRail from '../../src/ship/MedallionRail';
import { C, F } from '../../src/theme';
import { SOLV } from '../../src/gifts/solv';
import { IconTruckOutline } from '../../src/icons';
import { schemeState } from '../../src/gifts/state';
import { indianPrice } from '../../src/data';
import { SHIP_COHORTS } from '../../src/ship/data';

// One customer, one scheme: the dialog lists exactly the member's scheme.
const node = SHIP_COHORTS.growth.running[0].node;

export default function ShipCartTargetScheme() {
  const [dialog, setDialog] = useState(false);
  const router = useRouter();
  const s = schemeState(node.gift);
  const scope = node.entityData.localizedTitle.includes('Electronics') ? 'Electronics' : 'Lifestyle';

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {/* CartDetailsFragment: @string/_cart_items_msg = "Your Cart Items (%$)" */}
      <Toolbar title="Your Cart Items (3)" elevation={4} color={SOLV.blue} />
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
            Add {indianPrice(s.remaining)} more of {scope} products to earn the {s.next.name}
          </Text>
          <View style={styles.divider} />
        </Pressable>
      </ScrollView>

      {/* dialog_target_schemes.xml */}
      <Modal visible={dialog} transparent animationType="slide" onRequestClose={() => setDialog(false)}>
        <Pressable style={styles.scrim} onPress={() => setDialog(false)} />
        <View style={styles.dialog}>
          <View style={styles.dialogHeader}>
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
            {/* target_scheme_view_holder_list.xml */}
            <Pressable
              style={styles.listCard}
              onPress={() => { setDialog(false); router.push(`/ship/${node.entityId}`); }}
            >
              <View style={styles.listCardHead}>
                <Text style={styles.listTitle} numberOfLines={1} allowFontScaling={false}>
                  {node.entityData.localizedTitle}
                </Text>
                <Text style={styles.listTime} allowFontScaling={false}>Valid till {node.gift.endLabel}</Text>
              </View>
              <Text style={styles.listDescription} numberOfLines={2} allowFontScaling={false}>
                Buy {indianPrice(s.remaining)} more and the {s.next.name} is yours
              </Text>
              <MedallionRail s={s} currentValue={node.gift.currentValue} size={44} showNames />
            </Pressable>
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
  listTime: { paddingHorizontal: 10, paddingVertical: 4, color: SOLV.blueDark, fontSize: 13, lineHeight: 15.6, fontFamily: F.medium },
  listDescription: { marginTop: 14, marginHorizontal: 14, marginBottom: 4, color: C.textPrimary, fontSize: 15, lineHeight: 18.0, fontFamily: F.regular },
});
