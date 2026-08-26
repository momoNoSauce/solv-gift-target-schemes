// SuperClub route "/rewards-claimed" -> /partials/reward-claimed.html + RewardClaimedCtrl,
// rows rendered by /partials/claimed-product.html.
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import WebViewShell from '../../src/components/WebViewShell';
import NavBar from '../../src/superclub/NavBar';
import Loading from '../../src/superclub/Loading';
import TimeLine from '../../src/superclub/TimeLine';
import ProductImage from '../../src/superclub/ProductImage';
import { Row, Col } from '../../src/superclub/grid';
import { SC, F } from '../../src/superclub/theme';
import { ScSvg } from '../../src/superclub/ScSvg';
import { CLAIMED, ddMMMyyyy } from '../../src/superclub/data';

export default function RewardsClaimed() {
  // RewardClaimedCtrl runs fetchClaimedForBzid, so the page paints after the first response
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(t);
  }, []);

  // orderBy '-createdTime'
  const rows = [...CLAIMED].sort((a, b) => b.createdTime - a.createdTime);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: SC.pageBg }} edges={['top']}>
      <WebViewShell title="SuperClub">
        <NavBar pageTitle="Rewards Claimed" />
        <ScrollView style={{ flex: 1, backgroundColor: SC.pageBg }} contentContainerStyle={{ padding: 15 }}>
          {rows.map((claimed, i) => (
            <View key={i} style={styles.card}>
              <Row>
                <Col n={4} noRightPadding>
                  <ProductImage url={claimed.rewardsBO.imageURL} width="100%" height={80} />
                </Col>
                <Col n={8}>
                  <Text style={styles.title} allowFontScaling={false}>{claimed.rewardsBO.title}</Text>
                  <Text style={styles.date} allowFontScaling={false}>{ddMMMyyyy(claimed.createdTime, true)}</Text>
                  <View style={styles.pointsRow}>
                    <Text style={styles.muted} allowFontScaling={false}>Jumbocoins:</Text>
                    <View style={styles.coinRow}>
                      <ScSvg name="coin_small" width={14} height={14} />
                      <Text style={styles.points} allowFontScaling={false}> {claimed.pointsRedeemed}</Text>
                    </View>
                  </View>
                </Col>
              </Row>
              <View style={styles.dashed} />
              <TimeLine current={claimed.transactionType} />
            </View>
          ))}
        </ScrollView>
        {loading ? <Loading /> : null}
      </WebViewShell>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // .redeemed-card-wrapper
  card: {
    backgroundColor: SC.white,
    paddingVertical: 14,
    paddingHorizontal: 19,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: SC.cardBorder,
  },
  title: { fontSize: 14, color: SC.black, fontFamily: F.medium, letterSpacing: 0.1 },
  date: { fontSize: 12, color: SC.greyText, fontFamily: F.regular, letterSpacing: 0.1 },
  pointsRow: { flexDirection: 'row', alignItems: 'center' },
  muted: { color: SC.greyText, fontSize: 13, fontFamily: F.regular, letterSpacing: 0.1 },
  coinRow: { flexDirection: 'row', alignItems: 'center', marginLeft: 4 },
  points: { fontSize: 14, color: SC.green, fontFamily: F.medium, letterSpacing: 0.1 },
  dashed: { borderTopWidth: 1, borderStyle: 'dashed', borderTopColor: SC.hr, opacity: 0.28, marginVertical: 10 },
});
