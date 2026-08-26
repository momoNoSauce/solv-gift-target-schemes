// fragment_jumbocash_ledger.xml + JumboCashLedgerFragment.kt
//   toolbar title @string/_jumbocash, OTP card, balance header card with the
//   Description / Before Balance / Amount / After Balance column headers, and the
//   transaction list (jumbocash_ledger_item.xml).
import React, { useState } from 'react';
import { View, Text, Pressable, FlatList, Modal, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toolbar from '../../src/components/Toolbar';
import StatusChip from '../../src/jumbocash/StatusChip';
import { C, F } from '../../src/theme';
import { IconJumboCash } from '../../src/icons';
import { Image } from 'react-native';
import { REMOTE } from '../../src/remoteAssets';
import { JC_DETAILS, JC_OTP, JC_OTP_VALID_TEXT, JC_TRANSACTIONS, JM } from '../../src/jumbocash/data';

export default function JumbocashLedger() {
  const router = useRouter();
  const [tooltip, setTooltip] = useState(false);
  const otp = JC_OTP;
  const active = otp.activeOtpExists;
  const av = otp.otpAvailableLayout;
  const un = otp.otpUnavailableLayout;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Toolbar title={JM._jumbocash} />
      <FlatList
        data={JC_TRANSACTIONS}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={{ paddingBottom: 10 }}
        ListHeaderComponent={() => (
          <>
            {/* jumbocash_ledger_otp_layout.xml */}
            <View style={styles.otpCard}>
              {/* otp_icon: the API sends otpAvailableIconUrl / otpUnAvailableIconUrl; the
                  unavailable art is @string customer-app/OTP+UnAvailable.png */}
              <View style={styles.otpIcon}>
                {active ? (
                  <IconJumboCash width={40} />
                ) : (
                  <Image source={REMOTE.otpUnavailable} style={{ width: 40, height: 40 }} resizeMode="contain" />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.otpTitle} allowFontScaling={false}>
                  {active ? av.title : un.title}
                </Text>
                <Text style={styles.otpPayAmount} allowFontScaling={false}>
                  {active ? av.otpText : un.headerDescription}
                </Text>
                <Text style={styles.otpDescription} numberOfLines={5} allowFontScaling={false}>
                  {active ? av.description : un.headerText}
                </Text>
              </View>
              <View style={styles.otpRight}>
                {active ? (
                  <>
                    <Text style={styles.otpValue} allowFontScaling={false}>{av.otpValue}</Text>
                    <Text style={styles.otpValid} allowFontScaling={false}>{JC_OTP_VALID_TEXT}</Text>
                  </>
                ) : null}
                {(active ? av.showRefreshButton : un.showRefreshButton) ? (
                  <Pressable style={styles.refreshButton}>
                    <Text style={styles.refreshText} allowFontScaling={false}>
                      {active ? av.refreshButtonText : un.refreshButtonText}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            </View>

            {/* jumbocash_header_details card */}
            <View style={styles.headerCard}>
              <Text style={styles.dateText} allowFontScaling={false}>{JC_DETAILS.dateTimeText}</Text>
              <View style={styles.totalRow}>
                <View style={{ marginRight: 4 }}>
                  <IconJumboCash width={24} />
                </View>
                <Text style={styles.totalText} allowFontScaling={false}>{JC_DETAILS.totalBalance}</Text>
              </View>

              {/* pending_total_tv + pending_ledger_icon_iv form a packed chain across the
                  balance's own width, so the pair is centred; pending_status_chip is
                  end-aligned to that pair */}
              {JC_DETAILS.pendingTotalAmount ? (
                <View style={styles.pendingGroup}>
                  <View style={styles.pendingRow}>
                    <Text style={styles.pendingText} allowFontScaling={false}>
                      {JC_DETAILS.pendingTotalAmount}
                    </Text>
                    <Pressable onPress={() => setTooltip(true)} hitSlop={8} style={styles.pendingInfoIcon}>
                      <Text style={styles.pendingInfoGlyph} allowFontScaling={false}>i</Text>
                    </Pressable>
                  </View>
                  {JC_DETAILS.status ? (
                    <View style={styles.pendingChipWrap}>
                      <StatusChip status={JC_DETAILS.status} size="large" />
                    </View>
                  ) : null}
                </View>
              ) : null}

              <View style={styles.divider} />
              {/* jumbocash_conversion_tv is one HTML TextView; the whole line is the tap
                  target for the policies screen and the server embeds the know-more span */}
              <Pressable onPress={() => router.push('/jumbocash/about')}>
                <Text style={styles.conversionText} allowFontScaling={false}>
                  {JC_DETAILS.conversionInfo}
                  {JC_DETAILS.knowMoreInfo?.isVisible ? (
                    <Text style={{ color: JC_DETAILS.knowMoreInfo.color, fontFamily: F.bold }}>
                      {' '}{JC_DETAILS.knowMoreInfo.text}
                    </Text>
                  ) : null}
                </Text>
              </Pressable>

              <Text style={styles.historyTitle} allowFontScaling={false}>{JM._transaction_history}</Text>
              <View style={styles.divider1} />

              {/* header_layout: four columns split by 1dp vertical dividers */}
              <View style={styles.columnHeader}>
                <Text style={[styles.colHeaderText, styles.colDescription]} allowFontScaling={false}>{JM._description}</Text>
                <View style={styles.vDivider} />
                <Text style={[styles.colHeaderText, styles.colNarrow]} allowFontScaling={false}>{JM._before_balance}</Text>
                <View style={styles.vDivider} />
                <Text style={[styles.colHeaderText, styles.colNarrow]} allowFontScaling={false}>{JM._amount}</Text>
                <View style={styles.vDivider} />
                <Text style={[styles.colHeaderText, styles.colNarrow]} allowFontScaling={false}>{JM._after_balance}</Text>
              </View>
            </View>
          </>
        )}
        renderItem={({ item }) => (
          <View style={styles.rowCard}>
            <View style={styles.rowLeft}>
              {/* jumbocash_ledger_icon_iv: srcCompat product_image_placeholder until the API
                  supplies cardIconUrl */}
              <Image source={REMOTE.productPlaceholder} style={styles.rowIcon} resizeMode="contain" />
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle} allowFontScaling={false}>{item.cardTitle}</Text>
                <Text style={styles.rowTime} allowFontScaling={false}>{item.date} {item.time}</Text>
              </View>
            </View>
            <Text style={styles.rowBefore} allowFontScaling={false}>{item.beforeBalance}</Text>
            <View style={styles.rowAmountCol}>
              <Text style={[styles.rowAmount, { color: item.amount.color }]} allowFontScaling={false}>
                {item.amount.value}
              </Text>
              <StatusChip status={item.status} size="small" />
            </View>
            <Text style={styles.rowAfter} allowFontScaling={false}>{item.afterBalance}</Text>
          </View>
        )}
      />

      {/* PendingTooltipPopup.kt */}
      <Modal visible={tooltip} transparent animationType="fade" onRequestClose={() => setTooltip(false)}>
        <Pressable style={styles.tooltipScrim} onPress={() => setTooltip(false)}>
          <View style={styles.tooltip}>
            <Text style={styles.tooltipText} allowFontScaling={false}>{JC_DETAILS.pendingInfo}</Text>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.defaultBg },
  // jumbocash_ledger_otp_layout.xml: CardView elevation 5, background_green_border
  otpCard: {
    flexDirection: 'row',
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.lightGreen,
    borderRadius: 4,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    paddingVertical: 8,
  },
  otpIcon: { width: 40, height: 40, marginLeft: 12, marginRight: 4, justifyContent: 'center' },
  otpTitle: { marginTop: 8, color: C.black, fontSize: 12, lineHeight: 14.4, fontFamily: F.bold },
  otpPayAmount: { marginTop: 4, color: '#000000', fontSize: 12, lineHeight: 14.4, fontFamily: F.regular },
  otpDescription: { marginTop: 4, color: '#6E6E6E', fontSize: 12, lineHeight: 14.4, fontFamily: F.regular, paddingRight: 5 },
  otpRight: { width: 100, alignItems: 'center', marginRight: 8 },
  otpValue: { marginTop: 8, color: '#000000', fontSize: 16, lineHeight: 19.2, fontFamily: F.bold },
  otpValid: { marginTop: 4, width: 90, textAlign: 'center', color: '#000000', fontSize: 10, lineHeight: 12.0, fontFamily: F.regular },
  // refresh_button_background
  refreshButton: { marginTop: 8, borderWidth: 1, borderColor: '#58A159', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 4 },
  refreshText: { color: '#58A159', fontSize: 10, lineHeight: 12.0, fontFamily: F.regular, textAlign: 'center' },
  headerCard: { backgroundColor: C.white, paddingHorizontal: 16, paddingBottom: 8, elevation: 1 },
  // jumbocash_ledger_date_tv is start+end constrained -> centred
  dateText: { marginTop: 20, color: C.black, fontSize: 14, lineHeight: 16.8, fontFamily: F.regular, textAlign: 'center' },
  totalRow: { marginTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  totalText: { color: C.black, fontSize: 24, lineHeight: 28.8, fontFamily: F.bold },
  pendingGroup: { alignSelf: 'center', alignItems: 'flex-end' },
  pendingRow: { marginTop: 4, flexDirection: 'row', alignItems: 'center' },
  pendingChipWrap: { marginTop: 4 },
  pendingText: { color: C.black, fontSize: 14, lineHeight: 16.8, fontFamily: F.bold },
  pendingInfoIcon: {
    width: 14,
    height: 14,
    marginLeft: 4,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: C.mediumGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingInfoGlyph: { fontSize: 9, lineHeight: 10.8, color: C.mediumGrey, fontFamily: F.bold },
  divider: { height: 1, marginTop: 12, backgroundColor: C.greyishWhite },
  // jumbocash_conversion_tv is start+end constrained with 16dp side margins -> centred
  conversionText: { marginTop: 12, marginHorizontal: 16, textAlign: 'center', color: C.black, fontSize: 12, lineHeight: 14.4, fontFamily: F.regular },
  historyTitle: { marginTop: 16, color: C.black, fontSize: 16, lineHeight: 19.2, fontFamily: F.medium },
  divider1: { height: 1, marginTop: 12, backgroundColor: C.greyishWhite },
  // header_layout: minHeight 50dp, percent columns .4 / .17 / .17 / .17
  columnHeader: { flexDirection: 'row', minHeight: 50, paddingTop: 8 },
  colHeaderText: { color: C.black, fontSize: 14, lineHeight: 16.8, fontFamily: F.medium },
  colDescription: { width: '40%', marginLeft: 16 },
  colNarrow: { width: '17%', marginLeft: 8 },
  vDivider: { width: 1, backgroundColor: C.greyishWhite },
  // jumbocash_ledger_item.xml
  rowCard: {
    flexDirection: 'row',
    backgroundColor: C.white,
    marginHorizontal: 12,
    marginTop: 4,
    marginBottom: 4,
    borderRadius: 2,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    paddingBottom: 8,
  },
  // constraintLayout9 is percent .4 with a 14dp start margin
  rowLeft: { width: '40%', flexDirection: 'row', marginLeft: 14 },
  rowIcon: { width: 14, height: 14, marginTop: 20 },
  rowTitle: { marginLeft: 8, marginTop: 16, marginRight: 8, color: C.black, fontSize: 14, lineHeight: 16.8, fontFamily: F.bold },
  rowTime: { marginLeft: 8, marginTop: 6, marginBottom: 16, color: C.black, fontSize: 10, lineHeight: 12.0, fontFamily: F.regular },
  // before / amount / after are percent .18 with paddingLeft 8 / 4 / 8, all 14sp
  rowBefore: { width: '18%', marginTop: 16, paddingLeft: 8, color: '#000000', fontSize: 14, lineHeight: 16.8, fontFamily: F.regular },
  rowAfter: { width: '18%', marginTop: 16, paddingLeft: 8, color: '#000000', fontSize: 14, lineHeight: 16.8, fontFamily: F.bold },
  rowAmountCol: { width: '18%', marginTop: 16, paddingLeft: 4 },
  rowAmount: { fontSize: 14, lineHeight: 16.8, fontFamily: F.bold },
  tooltipScrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
  tooltip: { backgroundColor: '#333333', borderRadius: 4, padding: 12, maxWidth: '80%' },
  tooltipText: { color: C.white, fontSize: 12, lineHeight: 14.4, fontFamily: F.regular },
});
