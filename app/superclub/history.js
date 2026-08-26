// SuperClub route "/transaction-history" -> /partials/transaction-history.html +
// TransactionHistoryCtrl, rows rendered by /partials/transaction.html.
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import WebViewShell from '../../src/components/WebViewShell';
import NavBar from '../../src/superclub/NavBar';
import Loading from '../../src/superclub/Loading';
import { Row, Col } from '../../src/superclub/grid';
import { SC, F } from '../../src/superclub/theme';
import { ScSvg } from '../../src/superclub/ScSvg';
import Svg, { Path } from 'react-native-svg';
import { ROOT, TRANSACTIONS, ddMMMyyyy } from '../../src/superclub/data';

export default function TransactionHistory() {
  // TransactionHistoryCtrl runs fetchTransactionsForBzid, so the page paints after the first response
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(t);
  }, []);

  const rows = [...TRANSACTIONS].sort((a, b) => b.createdTime - a.createdTime);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: SC.pageBg }} edges={['top']}>
      <WebViewShell title="SuperClub">
        <NavBar pageTitle="Transaction History" />
        <ScrollView style={{ flex: 1, backgroundColor: SC.pageBg }}>
          {/* .trnx-page-head */}
          <View style={styles.head}>
            <View style={styles.headRow}>
              <Text style={styles.headText} allowFontScaling={false}>You have earned </Text>
              <View style={styles.balanceBox}>
                <ScSvg name="coin_banner" width={28} height={28} />
                <Text style={styles.balanceValue} allowFontScaling={false}> {ROOT.availablePoints}</Text>
              </View>
              <Text style={styles.headText} allowFontScaling={false}> Jumbocoins</Text>
            </View>
          </View>

          <View style={{ padding: 15 }}>
            {rows.map((t, i) => (
              <TransactionRow key={i} transaction={t} />
            ))}
          </View>
        </ScrollView>
        {loading ? <Loading /> : null}
      </WebViewShell>
    </SafeAreaView>
  );
}

function TransactionRow({ transaction }) {
  const [less, setLess] = useState(true); // TransactionCtrl: e.less = true
  const credit = transaction.transactionType === 'CREDIT';
  return (
    <View style={styles.card}>
      <Row>
        <Col n={9}>
          <Text style={styles.title} allowFontScaling={false}>{transaction.pointsTitle}</Text>
          <Text style={styles.date} allowFontScaling={false}>{ddMMMyyyy(transaction.createdTime, true)}</Text>
        </Col>
        <Col n={3} noLeftPadding style={{ alignItems: 'flex-end' }}>
          <View style={styles.coinRow}>
            <ScSvg name="coin_small" width={14} height={14} />
            <Text style={[styles.amount, { color: credit ? SC.green : SC.orange }]} allowFontScaling={false}>
              {' '}{credit ? '+' : '-'}{transaction.points}
            </Text>
          </View>
        </Col>
      </Row>

      {!less ? (
        <Text style={styles.description} allowFontScaling={false}>{transaction.description}</Text>
      ) : null}

      {transaction.description ? (
        <>
          <View style={styles.divider} />
          <Pressable onPress={() => setLess(!less)} style={{ alignSelf: 'flex-end' }}>
            <View style={styles.showMoreRow}>
              <Text style={styles.showMore} allowFontScaling={false}>
                {less ? 'SHOW MORE' : 'SHOW LESS'}
              </Text>
              {/* fa fa-chevron-down / fa-chevron-up */}
              <Svg width={10} height={10} viewBox="0 0 448 512" style={{ marginLeft: 4 }}>
                <Path
                  fill={SC.greyText}
                  d={less
                    ? 'M207 381L12 186c-9-9-9-24 0-33l19-19c9-9 24-9 33 0l161 160 161-160c9-9 24-9 33 0l19 19c9 9 9 24 0 33L241 381c-9 9-24 9-34 0z'
                    : 'M241 131l195 195c9 9 9 24 0 33l-19 19c-9 9-24 9-33 0L223 218 62 378c-9 9-24 9-33 0l-19-19c-9-9-9-24 0-33l195-195c9-9 24-9 34 0z'}
                />
              </Svg>
            </View>
          </Pressable>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  // .trnx-page-head { background:#2c552d; padding:0 18px 20px 46px; color:#fff }
  head: { backgroundColor: SC.navGreen, paddingTop: 0, paddingRight: 18, paddingBottom: 20, paddingLeft: 46 },
  // inline flow in the web: at 360dp the label, the dashed box and "Jumbocoins" fit on one line
  headRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'nowrap' },
  headText: { color: SC.white, fontSize: 12, fontFamily: F.regular, letterSpacing: 0.1, flexShrink: 1 },
  // <span style="border:1px dashed #fff; padding:3px 19px; border-radius:2px; font-size:28px; margin-right:5px">
  balanceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: SC.white,
    borderRadius: 2,
    paddingVertical: 3,
    paddingHorizontal: 19,
    marginRight: 5,
  },
  balanceValue: { fontSize: 28, color: SC.white, fontFamily: F.regular, lineHeight: 34, letterSpacing: 0.1 },
  card: {
    backgroundColor: SC.white,
    paddingVertical: 19,
    paddingHorizontal: 14,
    marginBottom: 15,
    shadowColor: 'rgba(176,176,176,0.5)',
    shadowOpacity: 1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  title: { fontSize: 14, color: SC.black, fontFamily: F.medium, letterSpacing: 0.1 },
  date: { color: SC.greyText, fontSize: 12, fontFamily: F.regular, letterSpacing: 0.1 },
  coinRow: { flexDirection: 'row', alignItems: 'center' },
  amount: { fontSize: 14, fontFamily: F.medium, letterSpacing: 0.1 },
  description: { color: SC.black, fontSize: 14, fontFamily: F.medium, marginTop: 8, letterSpacing: 0.1 },
  divider: { borderTopWidth: 1, borderTopColor: SC.hr, opacity: 0.28, marginVertical: 10 },
  showMoreRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end' },
  showMore: { fontSize: 12, color: SC.greyText, fontFamily: F.regular, letterSpacing: 0.1 },
});
