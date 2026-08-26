// Flow B: entry points. A scheme page nobody reaches wins nothing, so every surface
// that can carry the scheme is mocked here with its trigger moment:
//   1. Home banner: launch state (top prize) and personal state (gap to next gift).
//   2. Product page strip on eligible items: this purchase counts.
//   3. Cart nudge: what this order adds, and the celebration when an order crosses
//      a slab. The cart is the highest-leverage moment; the gap math is live there.
//   4. Push notifications: launch, near-a-slab, and delivery updates.
//   5. WhatsApp card: the Sales Officer forwards it; retailers forward it onward.
// Grey captions describe the trigger; the white mocks are the surfaces themselves.
import React from 'react';
import { View, Text, Image, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { F } from '../../src/theme';
import { IconBack, IconChevronRight } from '../../src/icons';
import GiftGlyph from '../../src/gifts/icons';

const K = {
  night: '#1B1240',
  night2: '#31205E',
  gold: '#F2B84B',
  goldDeep: '#B4700F',
  ink: '#1A1A1A',
  sub: '#6B6B6B',
  line: '#E5E7EB',
  paper: '#FFFFFF',
  bg: '#F7F7F7',
  green: '#1E8E3E',
  greenBg: '#E9F5EC',
  amberBg: '#FDF3E0',
  nightSub: '#CDC3EA',
  waBg: '#E7FFDB',
};

const IMG = {
  soundbar: require('../../assets/gifts/soundbar.jpg'),
  iphone17: require('../../assets/gifts/iphone17.jpg'),
  airfryer: require('../../assets/gifts/airfryer.jpg'),
  mixer: require('../../assets/gifts/mixer.jpg'),
};

function Caption({ children }) {
  return <Text style={styles.caption} allowFontScaling={false}>{children}</Text>;
}

export default function MegaDiwaliEntries() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.toolbar}>
        <Pressable style={styles.back} onPress={() => router.back()} android_ripple={{ color: '#00000022', borderless: true }}>
          <IconBack size={24} color={K.ink} />
        </Pressable>
        <Text style={styles.toolbarTitle} allowFontScaling={false}>Entry points</Text>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>

        {/* 1. Home banner */}
        <Caption>Solv home banner (in the blue app home) • from launch day</Caption>
        <LinearGradient colors={[K.night, K.night2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.banner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle} allowFontScaling={false}>Mega Diwali Gifts</Text>
            <Text style={styles.bannerSub} allowFontScaling={false}>Buy more, win up to an iPhone 17</Text>
            <View style={styles.bannerCta}>
              <Text style={styles.bannerCtaText} allowFontScaling={false}>See gifts</Text>
            </View>
          </View>
          <View style={styles.bannerStage}>
            <Image source={IMG.iphone17} style={styles.bannerImage} resizeMode="contain" />
          </View>
        </LinearGradient>

        <Caption>Same banner after the first slab • personal, shows the gap</Caption>
        <LinearGradient colors={[K.night, K.night2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.banner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle} allowFontScaling={false}>₹3,60,000 to the Soundbar</Text>
            <Text style={styles.bannerSub} allowFontScaling={false}>Your gift now: Air Fryer</Text>
            <View style={styles.bannerCta}>
              <Text style={styles.bannerCtaText} allowFontScaling={false}>See my gift</Text>
            </View>
          </View>
          <View style={styles.bannerStage}>
            <Image source={IMG.soundbar} style={styles.bannerImage} resizeMode="contain" />
          </View>
        </LinearGradient>

        {/* 2. PDP strip */}
        <Caption>Product page strip • on every eligible item • below the price</Caption>
        <View style={styles.mockCard}>
          <View style={styles.pdpRow}>
            <GiftGlyph kind="gift" size={20} color={K.goldDeep} strokeWidth={1.7} />
            <View style={{ flex: 1 }}>
              <Text style={styles.pdpTitle} allowFontScaling={false}>Counts toward your Diwali gift</Text>
              <Text style={styles.pdpSub} allowFontScaling={false}>₹3,60,000 to go for the Soundbar</Text>
            </View>
            <IconChevronRight size={18} color={K.sub} />
          </View>
        </View>

        {/* 3. Cart nudge */}
        <Caption>Cart • every order • shows what this order adds</Caption>
        <View style={styles.mockCard}>
          <View style={styles.cartRow}>
            <GiftGlyph kind="gift" size={20} color={K.goldDeep} strokeWidth={1.7} />
            <View style={{ flex: 1 }}>
              <Text style={styles.cartTitle} allowFontScaling={false}>
                This order adds ₹42,000 toward your gift
              </Text>
              <View style={styles.cartBarTrack}>
                <View style={[styles.cartBarFill, { width: '35%' }]} />
              </View>
              <Text style={styles.cartSub} allowFontScaling={false}>₹3,18,000 more for the Soundbar</Text>
            </View>
          </View>
        </View>

        <Caption>Cart • when the order crosses a slab • the celebration moment</Caption>
        <View style={[styles.mockCard, { backgroundColor: K.greenBg, borderColor: '#BBDFC4' }]}>
          <View style={styles.cartRow}>
            <View style={styles.cartWinThumb}>
              <Image source={IMG.soundbar} style={{ width: 40, height: 40 }} resizeMode="contain" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cartTitle, { color: K.green }]} allowFontScaling={false}>
                This order wins you the Soundbar!
              </Text>
              <Text style={styles.cartSub} allowFontScaling={false}>Yours instead of the Air Fryer</Text>
            </View>
            <GiftGlyph kind="check" size={22} color={K.green} strokeWidth={1.8} />
          </View>
        </View>

        {/* 4. Notifications */}
        <Caption>Push notifications • launch, near a slab, delivery</Caption>
        {[
          ['Mega Diwali Gifts is live', 'Buy on Solv from 1 Oct to 9 Nov. Win gifts up to an iPhone 17.', '1 Oct'],
          ['Only ₹40,000 to the Soundbar', 'Cross ₹10,00,000 before 9 Nov and it is yours.', '2 Nov'],
          ['Your Soundbar is on the way', 'Ordered on Amazon. It reaches your shop by 21 Nov.', '12 Nov'],
        ].map(([title, body, when]) => (
          <View key={title} style={styles.notif}>
            <View style={styles.notifIcon}>
              <GiftGlyph kind="gift" size={16} color="#fff" strokeWidth={1.8} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.notifHead}>
                <Text style={styles.notifApp} allowFontScaling={false}>Solv</Text>
                <Text style={styles.notifWhen} allowFontScaling={false}>{when}</Text>
              </View>
              <Text style={styles.notifTitle} allowFontScaling={false}>{title}</Text>
              <Text style={styles.notifBody} allowFontScaling={false}>{body}</Text>
            </View>
          </View>
        ))}

        {/* 5. WhatsApp card */}
        <Caption>WhatsApp • the Sales Officer sends it • retailers forward it</Caption>
        <View style={styles.waWrap}>
          <View style={styles.waBubble}>
            <LinearGradient colors={[K.night, K.night2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.waCard}>
              <View style={styles.waArt}>
                <GiftGlyph kind="sparkle" size={12} color={K.gold} />
                <GiftGlyph kind="diya" size={26} color={K.gold} strokeWidth={1.4} />
                <GiftGlyph kind="sparkle" size={12} color={K.gold} />
              </View>
              <Text style={styles.waTitle} allowFontScaling={false}>Mega Diwali Gifts</Text>
              <Text style={styles.waSub} allowFontScaling={false}>1 Oct to 9 Nov • on Solv</Text>
              <View style={styles.waGifts}>
                {[IMG.mixer, IMG.airfryer, IMG.soundbar, IMG.iphone17].map((img, i) => (
                  <View key={i} style={styles.waGift}>
                    <Image source={img} style={{ width: 40, height: 40 }} resizeMode="contain" />
                  </View>
                ))}
              </View>
              <Text style={styles.waFoot} allowFontScaling={false}>Buy more, win up to an iPhone 17</Text>
            </LinearGradient>
            <Text style={styles.waMsg} allowFontScaling={false}>
              Namaste! The Diwali scheme is live. Open Solv to see your gift. 🪔
            </Text>
            <Text style={styles.waTime} allowFontScaling={false}>10:12 AM</Text>
          </View>
        </View>

        <Text style={styles.footNote} allowFontScaling={false}>
          Every surface opens the scheme page. The banner, the strip, and the cart nudge
          show the customer's own gap; the gap math comes from the same slab data.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: K.bg },
  toolbar: { height: 48, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, backgroundColor: K.paper, borderBottomWidth: 1, borderBottomColor: K.line },
  back: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  toolbarTitle: { marginLeft: 12, fontFamily: F.medium, fontSize: 17, lineHeight: 21, color: K.ink },

  caption: { marginTop: 20, marginBottom: 6, marginHorizontal: 16, fontFamily: F.medium, fontSize: 11, lineHeight: 14, color: K.sub, letterSpacing: 0.3 },

  banner: { marginHorizontal: 16, marginBottom: 10, borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  bannerTitle: { fontFamily: F.bold, fontSize: 16, lineHeight: 20, color: '#fff' },
  bannerSub: { marginTop: 2, fontFamily: F.regular, fontSize: 12, lineHeight: 15, color: K.nightSub },
  bannerCta: { alignSelf: 'flex-start', marginTop: 10, backgroundColor: K.gold, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 5 },
  bannerCtaText: { fontFamily: F.bold, fontSize: 12, lineHeight: 15, color: K.night },
  bannerStage: { width: 76, height: 76, borderRadius: 10, backgroundColor: K.paper, alignItems: 'center', justifyContent: 'center' },
  bannerImage: { width: 62, height: 62 },

  mockCard: { marginHorizontal: 16, backgroundColor: K.paper, borderRadius: 10, borderWidth: 1, borderColor: K.line, padding: 12 },
  pdpRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pdpTitle: { fontFamily: F.medium, fontSize: 13, lineHeight: 16, color: K.ink },
  pdpSub: { marginTop: 2, fontFamily: F.regular, fontSize: 11, lineHeight: 14, color: K.goldDeep },

  cartRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cartTitle: { fontFamily: F.medium, fontSize: 13, lineHeight: 16, color: K.ink },
  cartBarTrack: { marginTop: 6, height: 6, borderRadius: 3, backgroundColor: '#EFEAF9', overflow: 'hidden' },
  cartBarFill: { height: 6, borderRadius: 3, backgroundColor: K.gold },
  cartSub: { marginTop: 4, fontFamily: F.regular, fontSize: 11, lineHeight: 14, color: K.sub },
  cartWinThumb: { width: 48, height: 48, borderRadius: 8, backgroundColor: K.paper, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: K.line },

  notif: { marginHorizontal: 16, marginBottom: 8, flexDirection: 'row', gap: 10, backgroundColor: K.paper, borderRadius: 10, borderWidth: 1, borderColor: K.line, padding: 12 },
  notifIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: K.night, alignItems: 'center', justifyContent: 'center' },
  notifHead: { flexDirection: 'row', justifyContent: 'space-between' },
  notifApp: { fontFamily: F.medium, fontSize: 11, lineHeight: 14, color: K.sub },
  notifWhen: { fontFamily: F.regular, fontSize: 11, lineHeight: 14, color: K.sub },
  notifTitle: { marginTop: 2, fontFamily: F.bold, fontSize: 13, lineHeight: 16, color: K.ink },
  notifBody: { marginTop: 1, fontFamily: F.regular, fontSize: 12, lineHeight: 16, color: K.sub },

  waWrap: { marginHorizontal: 16, borderRadius: 10, backgroundColor: K.waBg, padding: 12 },
  waBubble: { alignSelf: 'flex-start', maxWidth: 300, backgroundColor: K.paper, borderRadius: 10, padding: 6 },
  waCard: { borderRadius: 8, padding: 12, alignItems: 'center' },
  waArt: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  waTitle: { marginTop: 6, fontFamily: F.bold, fontSize: 15, lineHeight: 19, color: '#fff' },
  waSub: { marginTop: 1, fontFamily: F.regular, fontSize: 11, lineHeight: 14, color: K.nightSub },
  waGifts: { flexDirection: 'row', gap: 6, marginTop: 10 },
  waGift: { width: 48, height: 48, borderRadius: 6, backgroundColor: K.paper, alignItems: 'center', justifyContent: 'center' },
  waFoot: { marginTop: 8, fontFamily: F.medium, fontSize: 11, lineHeight: 14, color: K.gold },
  waMsg: { marginTop: 6, marginHorizontal: 4, fontFamily: F.regular, fontSize: 13, lineHeight: 17, color: K.ink },
  waTime: { alignSelf: 'flex-end', margin: 4, fontFamily: F.regular, fontSize: 10, lineHeight: 12, color: K.sub },

  footNote: { marginTop: 20, marginHorizontal: 16, fontFamily: F.regular, fontSize: 12, lineHeight: 17, color: K.sub },
});
