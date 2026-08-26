// cashback_card_layout.xml + CashbackCardLayout.kt
//   COC: available offers row visible, VIEW ALL hidden, green_rays_background behind the header
//   CAOC: available offers hidden, VIEW ALL (underlined) + arrow visible, no header background
import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import Svg, { Path, Defs, RadialGradient, Stop, G } from 'react-native-svg';
import { C, F } from '../theme';
import { IconJumboCash } from '../icons';
import CashbackItemCard, { DottedLine } from './CashbackItemCard';
import { GREEN_RAYS } from './greenRays';
import { VIEW_ALL_TEXT } from './data';
import { GoldExclusiveTag } from '../rewards/GoldTag';

function GreenRays() {
  return (
    <Svg width="100%" height={180} viewBox={GREEN_RAYS.viewBox} style={StyleSheet.absoluteFill} preserveAspectRatio="none">
      <Defs>
        <RadialGradient id="ray" cx="0.5" cy="1" r="0.5">
          <Stop offset="0" stopColor="#ECF7EB" />
          <Stop offset="1" stopColor="#F6FBF5" />
        </RadialGradient>
      </Defs>
      <G>
        {GREEN_RAYS.paths.map((d, i) => (
          <Path key={i} d={d} fill="url(#ray)" />
        ))}
      </G>
    </Svg>
  );
}

function ClaimedRow({ item }) {
  return (
    <View style={styles.claimedRow}>
      {/* textWithGoldContainer is wrap_content and start-aligned: the label and the gold tag
          hug the left edge, the amount and tick sit at the end */}
      <View style={styles.claimedTextGroup}>
        {/* claimedText has android:maxLength="25" as well as maxLines 1 + ellipsize end */}
        <Text style={styles.claimedText} numberOfLines={1} allowFontScaling={false}>
          {String(item.text).slice(0, 25)}
        </Text>
        {item.gold ? (
          <View style={styles.goldTagWrap}>
            <GoldExclusiveTag height={30} />
          </View>
        ) : null}
      </View>
      <View style={{ flex: 1 }} />
      <Text style={styles.claimedAmount} allowFontScaling={false}>{item.value}</Text>
      <Svg width={16} height={16} viewBox="0 0 12 12">
        <Path
          fill="#2EB674"
          d="M5.456,0.673C5.736,0.327 6.264,0.327 6.544,0.673L7.104,1.366C7.278,1.581 7.563,1.674 7.83,1.602L8.69,1.371C9.121,1.255 9.548,1.566 9.571,2.011L9.617,2.9C9.631,3.177 9.807,3.419 10.066,3.518L10.898,3.836C11.314,3.996 11.477,4.498 11.234,4.872L10.748,5.618C10.597,5.85 10.597,6.15 10.748,6.382L11.234,7.128C11.477,7.502 11.314,8.004 10.898,8.164L10.066,8.482C9.807,8.581 9.631,8.823 9.617,9.1L9.571,9.989C9.548,10.434 9.121,10.745 8.69,10.629L7.83,10.398C7.563,10.326 7.278,10.419 7.104,10.634L6.544,11.327C6.264,11.673 5.736,11.673 5.456,11.327L4.896,10.634C4.722,10.419 4.437,10.326 4.17,10.398L3.31,10.629C2.879,10.745 2.452,10.434 2.429,9.989L2.383,9.1C2.369,8.823 2.193,8.581 1.934,8.482L1.102,8.164C0.686,8.004 0.523,7.502 0.766,7.128L1.252,6.382C1.403,6.15 1.403,5.85 1.252,5.618L0.766,4.872C0.523,4.498 0.686,3.996 1.102,3.836L1.934,3.518C2.193,3.419 2.369,3.177 2.383,2.9L2.429,2.011C2.452,1.566 2.879,1.255 3.31,1.371L4.17,1.602C4.437,1.674 4.722,1.581 4.896,1.366L5.456,0.673Z"
        />
        <Path
          d="M3.75,6L5.25,7.5L8.25,4.5"
          stroke="#ffffff"
          strokeWidth={1}
          fill="none"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}

export default function CashbackCard({ node, onViewAll }) {
  const d = node.entityData;
  const available = node.layoutType === 'COC';
  const [cards, setCards] = useState(d.availableOfferSection.cards);
  const [claimed, setClaimed] = useState(d.appliedOfferSection.offerItemViews);
  const [total, setTotal] = useState(d.appliedOfferSection.totalClaimedValues);

  const onClaimed = (card) => {
    const next = [...claimed, { text: card.claimedOfferText, value: `₹${card.claimedOfferValue}`, numericValue: card.offerNumericValue, gold: false }];
    setClaimed(next);
    setCards((cs) => cs.filter((c) => c.offerId !== card.offerId));
    // updateTotalClaimedAmount(): "Total ₹<sum>"
    setTotal(`Total ₹${next.reduce((a, b) => a + b.numericValue, 0)}`);
  };

  return (
    <View style={styles.cardOuter}>
      <View style={styles.card}>
        <View style={styles.topLayout}>
          {available ? <GreenRays /> : null}
          <View style={styles.headerLayout}>
            {/* 60x60 ImageView, fitCenter: the 2:1 banknote paints 60x30 centred */}
            <View style={styles.headerIcon}>
              <IconJumboCash width={60} />
            </View>
            <Text style={styles.title} allowFontScaling={false}>{d.headerText}</Text>
          </View>
          <DottedLine style={{ marginTop: 8 }} />
          <View style={styles.claimedHeader}>
            <Text style={styles.claimedTitle} allowFontScaling={false}>
              {d.appliedOfferSection.claimedSectionTitle}
            </Text>
            <Text style={styles.totalClaimed} allowFontScaling={false}>{total}</Text>
          </View>
          <View style={styles.claimedList}>
            {claimed.map((item, i) => (
              <ClaimedRow key={i} item={item} />
            ))}
          </View>
        </View>

        {available ? (
          <View>
            {/* #dottedLine: 2dp tall, full width */}
            <DottedLine style={{ height: 2 }} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardsList}>
              {cards.map((c) => (
                <CashbackItemCard key={c.offerId} card={c} onClaimed={onClaimed} />
              ))}
            </ScrollView>
          </View>
        ) : (
          <Pressable style={styles.viewAllLayout} onPress={onViewAll}>
            <Text style={styles.viewAll} allowFontScaling={false}>{VIEW_ALL_TEXT}</Text>
            {/* ic_new_arrow_right: 24dp, fill grey_text */}
            <Svg width={24} height={24} viewBox="0 0 24 24">
              <Path fill="#7F7F7F" d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
            </Svg>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardOuter: { padding: 4 },
  // CardView elevation 1, radius 8 + outline_grey_cornered_border
  card: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(34,34,34,0.13)',
    backgroundColor: C.white,
    paddingHorizontal: 8,
    paddingBottom: 16,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 1,
    shadowOffset: { width: 0, height: 1 },
  },
  topLayout: { overflow: 'hidden' },
  headerLayout: { flexDirection: 'row', alignItems: 'center' },
  headerIcon: { width: 60, height: 60, alignItems: 'center', justifyContent: 'center' },
  title: { marginLeft: 8, color: C.black, fontSize: 18, lineHeight: 21.6, fontFamily: F.bold },
  claimedHeader: {
    marginVertical: 8,
    marginLeft: 12,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  claimedTitle: { color: C.black, fontSize: 16, lineHeight: 19.2, fontFamily: F.bold },
  totalClaimed: { color: C.black, fontSize: 16, lineHeight: 19.2, fontFamily: F.bold },
  claimedList: { marginLeft: 12, paddingVertical: 8 },
  claimedRow: { flexDirection: 'row', alignItems: 'center', padding: 8 },
  claimedTextGroup: { flexDirection: 'row', alignItems: 'center', flexShrink: 1 },
  claimedText: { marginRight: 4, color: C.black, fontSize: 14, lineHeight: 16.8, fontFamily: F.regular, flexShrink: 1 },
  // goldTag ImageView: 70x30, scaleType fitStart — the API sends the tag image URL
  goldTagWrap: { width: 70, height: 30, marginHorizontal: 4, overflow: 'hidden', justifyContent: 'center' },
  claimedAmount: { marginHorizontal: 4, color: C.black, fontSize: 14, lineHeight: 16.8, fontFamily: F.bold },
  cardsList: { marginTop: 16, marginLeft: 12, paddingVertical: 8 },
  viewAllLayout: { marginHorizontal: 16, marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
  viewAll: { color: C.black, fontSize: 14, lineHeight: 16.8, fontFamily: F.bold, textDecorationLine: 'underline' },
});
