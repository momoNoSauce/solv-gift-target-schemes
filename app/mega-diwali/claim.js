// Flow B: end of scheme. The won gift on the same spotlight pedestal as the hub,
// then a horizontal delivery stepper, then the address.
// References (Mobbin, Aug 2026): Fi and Instacart close delivered orders with a
// compact horizontal icon stepper ("Order Placed / Shipped / Delivered"), not a
// long vertical timeline. Fulfillment runs through Amazon: the team places the
// order to the shop address; the order number shows once, on the active step.
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, Pressable, ScrollView, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, RadialGradient, Stop, Rect, Ellipse } from 'react-native-svg';
import { F } from '../../src/theme';
import { IconBack } from '../../src/icons';
import GiftGlyph from '../../src/gifts/icons';
import { indianPrice } from '../../src/data';

const K = {
  night: '#160E33',
  night2: '#2C1D57',
  gold: '#F2B84B',
  goldDeep: '#B4700F',
  ink: '#1A1A1A',
  sub: '#6B6B6B',
  line: '#ECECEC',
  paper: '#FFFFFF',
  bg: '#F7F7F7',
  green: '#1E8E3E',
  nightSub: '#B9ACDF',
};

const RESULT = {
  gift: { name: 'boAt Aavante Bar Soundbar', image: require('../../assets/gifts/soundbar.jpg') },
  wonAt: 1000000,
  finishedAt: 1020000,
};

const ADDRESS = {
  shop: 'Sri Lakshmi Stores',
  line: '12, Gandhi Bazaar Main Road, Basavanagudi, Bengaluru 560004',
};

// state: 'done' | 'now' | 'todo'
const STEPS = [
  { key: 'won', icon: 'check', title: 'Won', date: '10 Nov', state: 'done' },
  { key: 'ordered', icon: 'gift', title: 'Ordered', date: '12 Nov', state: 'done' },
  { key: 'transit', icon: 'truck', title: 'On the way', date: 'by 21 Nov', state: 'now' },
  { key: 'delivered', icon: 'check', title: 'Delivered', date: '', state: 'todo' },
];

export default function MegaDiwaliClaim() {
  const router = useRouter();
  const [addressConfirmed, setAddressConfirmed] = useState(false);

  // The win springs in; the sparkles pulse.
  const tileAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(tileAnim, { toValue: 1, friction: 5, tension: 45, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(sparkleAnim, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, [tileAnim, sparkleAnim]);
  const sparkleOpacity = sparkleAnim.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] });

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView>
        {/* Night: the won gift on the pedestal */}
        <LinearGradient colors={[K.night, K.night2]} start={{ x: 0, y: 0 }} end={{ x: 0.8, y: 1 }} style={styles.stage}>
          <View style={styles.topBar}>
            <Pressable onPress={() => router.back()} android_ripple={{ color: '#ffffff33', borderless: true }}>
              <IconBack size={24} color="#fff" />
            </Pressable>
          </View>

          <View style={styles.pedestal}>
            <Svg width={320} height={230} style={StyleSheet.absoluteFill}>
              <Defs>
                <RadialGradient id="glowc" cx="50%" cy="52%" r="52%">
                  <Stop offset="0%" stopColor={K.gold} stopOpacity="0.42" />
                  <Stop offset="60%" stopColor={K.gold} stopOpacity="0.12" />
                  <Stop offset="100%" stopColor={K.gold} stopOpacity="0" />
                </RadialGradient>
              </Defs>
              <Rect x="0" y="0" width="320" height="230" fill="url(#glowc)" />
              <Ellipse cx="160" cy="212" rx="78" ry="10" fill="#000" opacity="0.35" />
            </Svg>
            <Animated.View style={[styles.sparkleL, { opacity: sparkleOpacity }]}>
              <GiftGlyph kind="sparkle" size={16} color={K.gold} />
            </Animated.View>
            <Animated.View style={[styles.sparkleR, { opacity: sparkleOpacity }]}>
              <GiftGlyph kind="sparkle" size={12} color={K.gold} />
            </Animated.View>
            <Text style={styles.wonLabel} allowFontScaling={false}>YOU WON</Text>
            <Animated.View
              style={[
                styles.tile,
                { opacity: tileAnim, transform: [{ scale: tileAnim.interpolate({ inputRange: [0, 1], outputRange: [0.78, 1] }) }] },
              ]}
            >
              <Image source={RESULT.gift.image} style={styles.tileImg} resizeMode="contain" />
            </Animated.View>
          </View>
          <Text style={styles.giftName} allowFontScaling={false}>{RESULT.gift.name}</Text>
          <Text style={styles.wonMeta} allowFontScaling={false}>
            At the {indianPrice(RESULT.wonAt)} slab • you finished at {indianPrice(RESULT.finishedAt)}
          </Text>

          {/* Retailers show their wins around: the share is the campaign's viral loop */}
          <Pressable style={styles.shareBtn} android_ripple={{ color: '#ffffff22' }}>
            <GiftGlyph kind="sparkle" size={14} color={K.gold} />
            <Text style={styles.shareText} allowFontScaling={false}>Share your win on WhatsApp</Text>
          </Pressable>
        </LinearGradient>

        {/* Delivery: horizontal stepper */}
        <View style={styles.card}>
          <View style={styles.stepper}>
            {STEPS.map((s, i) => (
              <React.Fragment key={s.key}>
                {i > 0 ? (
                  <View style={[styles.connector, STEPS[i].state !== 'todo' && styles.connectorDone]} />
                ) : null}
                <View style={styles.step}>
                  <View
                    style={[
                      styles.stepDot,
                      s.state === 'done' && styles.stepDone,
                      s.state === 'now' && styles.stepNow,
                    ]}
                  >
                    <GiftGlyph
                      kind={s.icon}
                      size={15}
                      color={s.state === 'done' ? '#fff' : s.state === 'now' ? K.goldDeep : '#C9C9C9'}
                      strokeWidth={2}
                    />
                  </View>
                  <Text style={[styles.stepTitle, s.state === 'todo' && { color: '#B5B5B5' }]} allowFontScaling={false}>
                    {s.title}
                  </Text>
                  {s.date ? <Text style={styles.stepDate} allowFontScaling={false}>{s.date}</Text> : null}
                </View>
              </React.Fragment>
            ))}
          </View>
          <Text style={styles.orderNo} allowFontScaling={false}>Amazon order 408-5561234-7789045</Text>
        </View>

        {/* Address */}
        <View style={styles.card}>
          <Text style={styles.cardTitle} allowFontScaling={false}>Your gift ships here</Text>
          <Text style={styles.shopName} allowFontScaling={false}>{ADDRESS.shop}</Text>
          <Text style={styles.addressLine} allowFontScaling={false}>{ADDRESS.line}</Text>
          {addressConfirmed ? (
            <View style={styles.confirmedRow}>
              <GiftGlyph kind="check" size={18} color={K.green} strokeWidth={1.8} />
              <Text style={styles.confirmedText} allowFontScaling={false}>Address confirmed</Text>
            </View>
          ) : (
            <View style={styles.addressActions}>
              <Pressable style={styles.confirmBtn} onPress={() => setAddressConfirmed(true)} android_ripple={{ color: '#ffffff33' }}>
                <Text style={styles.confirmBtnText} allowFontScaling={false}>Confirm address</Text>
              </Pressable>
              <Pressable style={styles.changeBtn}>
                <Text style={styles.changeBtnText} allowFontScaling={false}>Change</Text>
              </Pressable>
            </View>
          )}
        </View>

        <Text style={styles.support} allowFontScaling={false}>
          Questions? Call support with the order number.
        </Text>

        <Pressable style={styles.protoLink} onPress={() => router.back()}>
          <Text style={styles.protoText} allowFontScaling={false}>Prototype: back to the running state</Text>
        </Pressable>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: K.bg },
  stage: { paddingBottom: 24 },
  topBar: { paddingHorizontal: 16, paddingTop: 14 },
  pedestal: { height: 230, alignItems: 'center', justifyContent: 'center' },
  sparkleL: { position: 'absolute', left: '20%', top: 50 },
  sparkleR: { position: 'absolute', right: '22%', top: 134 },
  wonLabel: { position: 'absolute', top: 8, color: K.gold, fontFamily: F.bold, fontSize: 11, lineHeight: 14 },
  tile: {
    width: 160,
    height: 160,
    marginTop: 12,
    borderRadius: 22,
    backgroundColor: K.paper,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  tileImg: { width: 130, height: 130 },
  giftName: { textAlign: 'center', color: '#fff', fontFamily: F.bold, fontSize: 18, lineHeight: 23, paddingHorizontal: 24 },
  wonMeta: { marginTop: 4, textAlign: 'center', color: K.nightSub, fontFamily: F.regular, fontSize: 12, lineHeight: 15 },
  shareBtn: {
    alignSelf: 'center',
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: K.gold,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  shareText: { color: K.gold, fontFamily: F.medium, fontSize: 13, lineHeight: 17 },

  card: { marginHorizontal: 16, marginTop: 12, backgroundColor: K.paper, borderRadius: 14, borderWidth: 1, borderColor: K.line, padding: 16 },
  cardTitle: { fontFamily: F.bold, fontSize: 14, lineHeight: 18, color: K.ink, marginBottom: 8 },

  stepper: { flexDirection: 'row', alignItems: 'flex-start' },
  step: { alignItems: 'center', width: 66 },
  stepDot: { width: 30, height: 30, borderRadius: 15, borderWidth: 1.5, borderColor: '#DDD', backgroundColor: K.paper, alignItems: 'center', justifyContent: 'center' },
  stepDone: { backgroundColor: K.green, borderColor: K.green },
  stepNow: { borderColor: K.gold, backgroundColor: '#FDF3E0' },
  stepTitle: { marginTop: 6, fontFamily: F.medium, fontSize: 11, lineHeight: 14, color: K.ink, textAlign: 'center' },
  stepDate: { marginTop: 1, fontFamily: F.regular, fontSize: 10, lineHeight: 13, color: K.sub },
  connector: { flex: 1, height: 2, backgroundColor: '#E4E4E4', marginTop: 14 },
  connectorDone: { backgroundColor: K.green },
  orderNo: { marginTop: 12, textAlign: 'center', fontFamily: F.regular, fontSize: 11, lineHeight: 14, color: K.sub },

  shopName: { fontFamily: F.medium, fontSize: 14, lineHeight: 18, color: K.ink },
  addressLine: { marginTop: 2, fontFamily: F.regular, fontSize: 13, lineHeight: 18, color: K.sub },
  addressActions: { flexDirection: 'row', alignItems: 'center', marginTop: 14, gap: 12 },
  confirmBtn: { backgroundColor: K.night, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 },
  confirmBtnText: { color: '#fff', fontFamily: F.medium, fontSize: 13, lineHeight: 16 },
  changeBtn: { paddingVertical: 10 },
  changeBtnText: { color: K.goldDeep, fontFamily: F.medium, fontSize: 13, lineHeight: 16 },
  confirmedRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14 },
  confirmedText: { fontFamily: F.medium, fontSize: 13, lineHeight: 16, color: K.green },

  support: { marginTop: 14, textAlign: 'center', fontFamily: F.regular, fontSize: 12, lineHeight: 16, color: K.sub },

  protoLink: { marginTop: 14, alignItems: 'center' },
  protoText: { fontFamily: F.medium, fontSize: 12, lineHeight: 15, color: K.sub, textDecorationLine: 'underline' },
});
