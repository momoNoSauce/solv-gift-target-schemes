// SuperClub route "/customers" -> /partials/deals.html + DealsCtrl.
// Runs inside the native SuperClubFragment shell (green toolbar + cross icon).
import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import WebViewShell from '../../src/components/WebViewShell';
import NavBar from '../../src/superclub/NavBar';
import Loading from '../../src/superclub/Loading';
import TouchCarousel from '../../src/superclub/TouchCarousel';
import ShowProductDialog from '../../src/superclub/ShowProductDialog';
import ProductListDialog from '../../src/superclub/ProductListDialog';
import ProductImage from '../../src/superclub/ProductImage';
import { Row, Col } from '../../src/superclub/grid';
import { SC, F } from '../../src/superclub/theme';
import { IMG } from '../../src/superclub/assets';
import { ScSvg } from '../../src/superclub/ScSvg';
import {
  ROOT, MESSAGE, TARGETS, GOLD_REWARDS, PRODUCTS, TARGET_PRODUCTS, ddMMMyyyy,
} from '../../src/superclub/data';

export default function SuperClubDeals() {
  // DealsCtrl runs fetchPointsForBzid / getRewards / message / target-milestone, so the page paints after the first response
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(t);
  }, []);

  const [product, setProduct] = useState(null);
  const [targetProducts, setTargetProducts] = useState(null);
  const [msgImgW, setMsgImgW] = useState(0);
  const [logoW, setLogoW] = useState(0);
  const isGold = ROOT.customerType === 'GOLD';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: SC.pageBg }} edges={['top']}>
      <WebViewShell title="SuperClub">
        <NavBar pageTitle={null} />
        <ScrollView style={{ flex: 1, backgroundColor: SC.pageBg }}>
          {/* .{{customerType}}-deal .deal-page-head */}
          {/* linear-gradient(186deg, ...) from .GOLD-deal / .SILVER-deal */}
          <LinearGradient
            colors={isGold ? ['#2d1e30', '#59305f', '#2f1f32'] : ['#326633', '#57923c', '#09360a']}
            locations={[0, 0.47, 1]}
            start={{ x: 0.55, y: 0 }}
            end={{ x: 0.45, y: 1 }}
            style={styles.dealHead}
          >
            <View style={styles.centralize}>
              <View style={styles.logoDiv} onLayout={(e) => setLogoW(e.nativeEvent.layout.width)}>
                {isGold ? (
                  <>
                    <Image source={IMG.goldLogo} style={[styles.fullWide, { height: (logoW * 60) / 360 }]} resizeMode="contain" />
                    <View style={{ alignItems: 'center', marginBottom: 15 }}>
                      <Image source={IMG.gold} style={{ width: 70, height: 23 }} resizeMode="contain" />
                    </View>
                  </>
                ) : (
                  <Image source={IMG.greenLogo} style={[styles.fullWide, { height: (logoW * 57) / 360 }]} resizeMode="contain" />
                )}
              </View>
              <Text style={styles.welcome} allowFontScaling={false}>Welcome {ROOT.businessName}</Text>
              <View style={styles.dottedSeperator} />
            </View>

            {isGold && ROOT.subscriptionStartDate ? (
              <View style={styles.subsDate}>
                <Row style={styles.subsBox}>
                  <Col n={6} noPadding style={styles.subsCellLeft}>
                    <Text style={styles.subsLbl} allowFontScaling={false}>Started on</Text>
                    <Text style={styles.subsValue} allowFontScaling={false}>{ddMMMyyyy(ROOT.subscriptionStartDate)}</Text>
                  </Col>
                  <Col n={6} noPadding style={styles.subsCell}>
                    <Text style={styles.subsLbl} allowFontScaling={false}>Ends on</Text>
                    <Text style={styles.subsValue} allowFontScaling={false}>{ddMMMyyyy(ROOT.subscriptionEndDate)}</Text>
                  </Col>
                </Row>
              </View>
            ) : null}
          </LinearGradient>

          {/* .point-box */}
          <View style={styles.pointBox}>
            <Text style={styles.totalLabel} allowFontScaling={false}>Your Total</Text>
            <Row>
              <Col n={3} />
              <Col n={6} noPadding>
                <Row>
                  <Col n={1} />
                  <Col n={9} noPadding>
                    <View style={styles.availablePoints}>
                      <Row style={{ paddingVertical: 10, paddingHorizontal: 15 }}>
                        <Col n={3} style={{ marginTop: 4 }}>
                          <ScSvg name="coin_banner" width={38} height={38} />
                        </Col>
                        <Col n={9}>
                          <Text style={styles.pointsValue} allowFontScaling={false}>{ROOT.availablePoints}</Text>
                          <Text style={styles.pointsLabel} allowFontScaling={false}>Jumbocoins</Text>
                        </Col>
                      </Row>
                    </View>
                  </Col>
                  <Col n={1} />
                </Row>
              </Col>
              <Col n={3} />
            </Row>
          </View>

          {/* message box */}
          {MESSAGE && MESSAGE.title ? (
            <View style={styles.messageBoxOuter}>
              <View style={styles.messageBox}>
                {/* background-image: two linear gradients at 0 0 and 0 100%, size 100% 3px */}
                <LinearGradient
                  colors={['#e59529', '#f6cf37']}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.messageRailTop}
                />
                <LinearGradient
                  colors={['#e59529', '#f6cf37']}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.messageRailBottom}
                />
                <Row>
                  <Col n={4} onLayout={(e) => setMsgImgW(e.nativeEvent.layout.width - 30)}>
                    {/* <img class="full-wide" src="assets/img/{{messageType}}.png"> is width:100%
                        with height:auto, so the height follows the 162x156 bitmap. */}
                    <Image
                      source={MESSAGE.showImage ? { uri: MESSAGE.imageUrl } : IMG.msgInfo}
                      style={[styles.messageImage, { height: (msgImgW * 156) / 162 }]}
                      resizeMode="contain"
                    />
                  </Col>
                  <Col n={8} noLeftPadding>
                    <Text style={styles.messageTitle} allowFontScaling={false}>{MESSAGE.title}</Text>
                    <Text style={styles.messageDescription} allowFontScaling={false}>
                      {MESSAGE.description.replace(/<[^>]+>/g, '')}
                    </Text>
                  </Col>
                </Row>
              </View>
            </View>
          ) : null}

          {/* Your Activity */}
          {TARGETS.length > 0 ? (
            <TouchCarousel
              targets={TARGETS}
              onViewProducts={(t) => setTargetProducts(TARGET_PRODUCTS[t.targetId] ?? [])}
            />
          ) : null}

          {/* gold benefits */}
          {isGold ? (
            <View style={styles.goldRewardWrapper}>
              {GOLD_REWARDS.map((r) => (
                <View key={r.image} style={styles.goldReward}>
                  <Row flex>
                    <Col n={3} style={{ justifyContent: 'center' }}>
                      <ScSvg name={r.image} width={r.image === 'free_target' ? 40 : 31} height={r.image === 'free_delivery' ? 35 : 29} />
                    </Col>
                    <Col n={9}>
                      <Text style={styles.rewardText} allowFontScaling={false}>{r.text}</Text>
                      <Text style={styles.rewardSubtext} allowFontScaling={false}>{r.subText}</Text>
                    </Col>
                  </Row>
                </View>
              ))}
            </View>
          ) : null}

          <Text style={styles.pageName} allowFontScaling={false}>Rewards Catalogue</Text>

          {/* .rewards-section */}
          <View style={styles.rewardsSection}>
            {PRODUCTS.map((p) => (
              <View key={p.id} style={styles.rewardItemBox}>
                <Pressable style={styles.rewardItem} onPress={() => setProduct(p)}>
                  <View style={styles.rewardImgBox}>
                    <ProductImage url={p.imageURL} width="100%" height={70} />
                  </View>
                  <Text style={styles.rewardProductTitle} numberOfLines={2} allowFontScaling={false}>{p.title}</Text>
                  <View style={styles.productBefHr} />
                  {/* <span class="product-points-value">&nbsp;<img coin_small> {{points}}</span> */}
                  <View style={styles.productPointsBox}>
                    <Text style={styles.productPointsValue} allowFontScaling={false}>{'\u00a0'}</Text>
                    <ScSvg name="coin_small" width={14} height={14} />
                    <Text style={styles.productPointsValue} allowFontScaling={false}> {p.points}</Text>
                  </View>
                </Pressable>
              </View>
            ))}
          </View>
        </ScrollView>

        {product ? (
          <ShowProductDialog
            product={product}
            available={ROOT.availablePoints}
            onClose={() => setProduct(null)}
          />
        ) : null}
        {targetProducts ? (
          <ProductListDialog products={targetProducts} onClose={() => setTargetProducts(null)} />
        ) : null}
        {loading ? <Loading /> : null}
      </WebViewShell>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // .deal-page-head { padding:55px 18px 59px; font-weight:500; margin-top:-55px; color:#fff }
  // .deal-page-head: padding 55/18/59, margin-top -55, box-shadow 0 4px 4px rgba(0,0,0,.24)
  dealHead: {
    paddingTop: 55,
    paddingHorizontal: 18,
    paddingBottom: 59,
    marginTop: -55,
    shadowColor: '#000',
    shadowOpacity: 0.24,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  centralize: { alignItems: 'stretch' },
  logoDiv: { marginLeft: -18, marginRight: -18, paddingTop: 20 },
  // .full-wide { width:100% } on an <img>: the height follows the bitmap, so it has to be
  // measured. aspectRatio loses to the flex min-height:auto of the bitmap itself.
  fullWide: { width: '100%', minHeight: 0 },
  welcome: { fontSize: 14, color: SC.white, fontFamily: F.medium, textAlign: 'center', letterSpacing: 0.1 },
  dottedSeperator: { width: '70%', marginLeft: '15%', marginTop: 10, marginBottom: 10 },
  subsDate: { paddingHorizontal: 38, marginBottom: 20 },
  subsBox: { borderWidth: 1, borderColor: SC.white, borderRadius: 4, marginLeft: 0, marginRight: 0 },
  subsCell: { padding: 9, alignItems: 'center' },
  subsCellLeft: { padding: 9, alignItems: 'center', borderRightWidth: 1, borderRightColor: SC.white },
  subsLbl: { fontSize: 10, lineHeight: 11, color: SC.white, fontFamily: F.regular, letterSpacing: 0.1 },
  subsValue: { color: SC.white, fontFamily: F.medium, fontSize: 13, letterSpacing: 0.1 },
  // .point-box
  pointBox: {
    backgroundColor: SC.white,
    padding: 13,
    marginTop: -59,
    marginHorizontal: 15,
    borderRadius: 4,
    shadowColor: 'rgba(156,154,154,0.5)',
    shadowOpacity: 1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  totalLabel: { fontSize: 13, fontFamily: F.medium, textAlign: 'center', color: SC.darkGrey, letterSpacing: 0.1 },
  // .available-customer-points
  availablePoints: { borderWidth: 1, borderStyle: 'dashed', borderColor: SC.greenDash, borderRadius: 2 },
  pointsValue: { fontSize: 28, lineHeight: 32, fontFamily: F.medium, color: '#111111', letterSpacing: 0.1 },
  pointsLabel: { fontSize: 12, lineHeight: 14, fontFamily: F.medium, color: '#111111', letterSpacing: 0.1 },
  messageBoxOuter: { paddingHorizontal: 15, paddingTop: 15, paddingBottom: 5 },
  // .message-box: white with orange gradient rails left and right
  messageBox: {
    backgroundColor: SC.white,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#e59529',
    borderRightWidth: 3,
    borderRightColor: '#f6cf37',
    shadowColor: 'rgba(142,142,142,0.5)',
    shadowOpacity: 1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  // .full-wide on the message image: width 100%, natural aspect
  messageImage: { width: '100%', minHeight: 0 },
  messageRailTop: { position: 'absolute', left: 0, right: 0, top: 0, height: 3 },
  messageRailBottom: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 3 },
  messageTitle: { fontSize: 16, lineHeight: 18, fontFamily: F.medium, color: SC.messageTitle, letterSpacing: 0.1 },
  messageDescription: { fontSize: 12, lineHeight: 15, marginTop: 8, color: SC.black, fontFamily: F.regular, letterSpacing: 0.1 },
  // .gold-reward-wrapper / .gold-reward
  goldRewardWrapper: {
    backgroundColor: SC.white,
    paddingTop: 10,
    paddingHorizontal: 26,
    paddingBottom: 15,
    marginTop: 18,
    shadowColor: 'rgba(164,164,164,0.5)',
    shadowOpacity: 1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  goldReward: {
    borderRadius: 4,
    borderWidth: 1,
    borderColor: SC.goldBorder,
    marginTop: 5,
    padding: 13,
    shadowColor: 'rgba(223,223,223,0.5)',
    shadowOpacity: 1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  rewardText: { fontSize: 15, fontFamily: F.medium, letterSpacing: 0.1, color: SC.rewardText },
  rewardSubtext: { fontSize: 10, letterSpacing: 0.1, color: SC.darkGrey, lineHeight: 13, fontFamily: F.regular },
  // .page-name-new
  pageName: { fontSize: 16, lineHeight: 24, color: SC.pageName, fontFamily: F.bold, padding: 14, textAlign: 'center', letterSpacing: 0.1 },
  // .rewards-section { padding:0 5px 30px; margin:0 }
  rewardsSection: { paddingHorizontal: 5, paddingBottom: 30, flexDirection: 'row', flexWrap: 'wrap' },
  // .reward-item-box { padding:0 10px 20px }
  rewardItemBox: { width: '50%', paddingHorizontal: 10, paddingBottom: 20 },
  // .reward-item
  rewardItem: {
    backgroundColor: SC.white,
    shadowColor: 'rgba(142,142,142,0.5)',
    shadowOpacity: 1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  rewardImgBox: { padding: 13, alignItems: 'center' },
  rewardProductTitle: { paddingHorizontal: 8, fontSize: 12, color: SC.black, lineHeight: 14, fontFamily: F.medium, height: 30, letterSpacing: 0.1 },
  productBefHr: { borderTopWidth: 1, borderTopColor: SC.hr, opacity: 0.28, marginHorizontal: 8 },
  productPointsBox: { padding: 8, flexDirection: 'row', alignItems: 'center' },
  productPointsValue: { fontSize: 14, color: SC.green, fontFamily: F.medium, lineHeight: 16, letterSpacing: 0.1 },
});
