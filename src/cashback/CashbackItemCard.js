// cashback_card_item.xml (186x250) + CashbackCardAdapter.CashbackCardViewHolder.
// Claiming shows the offer_applied.json animation and the nowClaimedLayout, then the card
// scales to 0.5, moves to (0,-12), fades out over 1s and is appended to the claimed list.
import React, { useRef, useState } from 'react';
import { View, Text, Pressable, Animated, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import LottieView from 'lottie-react-native';
import { C, F } from '../theme';
import { IconJumboCash } from '../icons';
import { TICKET } from './ticketPath';
import ProductImage from '../superclub/ProductImage';

const W = 186;
const H = 250;

function Ticket() {
  return (
    <Svg width={W} height={H} viewBox={TICKET.viewBox} preserveAspectRatio="none" style={StyleSheet.absoluteFill}>
      <Path d={TICKET.fill} fill="#ffffff" />
      <Path d={TICKET.outline} fill="#599B14" />
    </Svg>
  );
}

// dotted_line: 1dp line, 4px dashes with 10px gaps, light_grey
export function DottedLine({ style }) {
  // @drawable/dotted_line inside a 10dp-tall View: 1dp dashes (4px on, 10px gap), light_grey
  return (
    <View style={[styles.dottedBox, style]}>
      <View style={styles.dottedRule} />
    </View>
  );
}

export default function CashbackItemCard({ card, onClaimed }) {
  const [claimed, setClaimed] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  const claim = () => {
    setClaimed(true);
    Animated.timing(anim, { toValue: 1, duration: 1000, useNativeDriver: true }).start(() => {
      onClaimed?.(card);
    });
  };

  return (
    <Animated.View
      style={[
        styles.card,
        {
          opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
          transform: [
            { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.5] }) },
            { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -12] }) },
          ],
        },
      ]}
    >
      <Ticket />
      {claimed ? (
        <View style={styles.claimedLayout}>
          {card.labelUrl ? <View style={styles.badge} /> : null}
          <View style={styles.claimedInner}>
          <View style={styles.amountRow}>
            <IconJumboCash width={40} />
            <Text style={styles.rupee} allowFontScaling={false}>₹</Text>
            <Text style={styles.amount} allowFontScaling={false}>{card.claimedOfferValue}</Text>
          </View>
          <Text style={styles.claimedText} allowFontScaling={false}>Cashback Claimed</Text>
          </View>
          <View style={styles.lottie} pointerEvents="none">
            <LottieView
              source={require('../../assets/rewards/offer_applied.json')}
              autoPlay
              loop
              style={{ flex: 1 }}
            />
          </View>
        </View>
      ) : (
        <>
          <View style={styles.productLayout}>
            <View style={[styles.badge, !card.labelUrl && { opacity: 0 }]} />
            <View style={styles.productImage}>
              <ProductImage url={card.offerImageUrl} width={154} height={64} />
            </View>
            <Text style={styles.subheader} numberOfLines={3} allowFontScaling={false}>
              {card.offerDescription}
            </Text>
          </View>
          <View style={styles.buttonLayout}>
            <DottedLine style={{ marginHorizontal: 16, marginBottom: 12 }} />
            <Pressable style={styles.claimButton} onPress={claim}>
              <Text style={styles.claimText} allowFontScaling={false}>{card.ctaText}</Text>
            </Pressable>
          </View>
        </>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { width: W, height: H, margin: 4 },
  productLayout: { paddingTop: 8, alignItems: 'center' },
  badge: { width: 120, height: 30, backgroundColor: '#EAF4E9', borderRadius: 4 },
  productImage: { marginTop: 8 },
  subheader: {
    marginTop: 4,
    marginHorizontal: 16,
    textAlign: 'center',
    color: C.black,
    fontSize: 12, lineHeight: 14.4,
    fontFamily: F.medium,
  },
  buttonLayout: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  dottedBox: { height: 10, justifyContent: 'center' },
  dottedRule: { height: 1, borderBottomWidth: 1, borderStyle: 'dashed', borderColor: '#dadada' },
  // green_rounded_button_with_backgroud: light_green fill, 25dp corners
  claimButton: {
    height: 36,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 25,
    backgroundColor: C.lightGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  claimText: { color: C.white, fontSize: 14, lineHeight: 16.8, fontFamily: F.bold },
  claimedLayout: { flex: 1, alignItems: 'center' },
  // the inner block is 140dp tall, centred in the card with a 16dp top margin
  claimedInner: { height: 140, marginTop: 16, alignItems: 'center', alignSelf: 'stretch' },
  amountRow: { flexDirection: 'row', alignItems: 'center' },
  rupee: { color: C.green, fontSize: 24, lineHeight: 28.8, fontFamily: F.bold },
  amount: { color: C.green, fontSize: 24, lineHeight: 28.8, fontFamily: F.bold },
  claimedText: { marginTop: 16, color: C.black, fontSize: 16, lineHeight: 19.2, fontFamily: F.medium, textAlign: 'center' },
  lottie: { ...StyleSheet.absoluteFillObject },
});
