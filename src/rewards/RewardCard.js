// reward_item_layout_small.xml (160x172) and reward_item_layout_large.xml (240x240).
// Bound by ScratchedCardViewHolder.updateRewardWonDetails() / ScratchCardRevealFragment.setInfoDetails().
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GoldTag } from './GoldTag';
import { GoldCardBg } from './GoldBackground';
import { R, RD, RM } from './theme';
import { IconJumboCash, IconJumboCoins } from '../icons';
import { rewardExpiry, cardStatus, RewardType } from './data';
import ProductImage from '../superclub/ProductImage';

export default function RewardCard({ card, size = 'small' }) {
  const cta = size === 'cta';           // reward_item_layout_large_with_cta (260x260)
  const large = size === 'large' || cta;
  const status = cardStatus(card);
  const gold = card.isRewardGold;
  const showStatusLabel = status === 'DISABLED';
  const showImage = true; // info_image_iv keeps its slot; the API sends an image URL
  // Jumbocoins and Jumbocash are different currencies with different artwork.
  const isCoins = card.rewardType === RewardType.JUMBO_COINS;
  const isCash = card.rewardType === RewardType.JUMBO_CASH;

  return (
    <View
      style={[
        styles.card,
        cta ? styles.cardCta : large ? styles.cardLarge : styles.cardSmall,
        gold ? styles.goldBg : styles.plainBg,
      ]}
    >
      {gold ? <GoldCardBg /> : null}
      {/* prefixIcon: gold_exclusive_tag, INVISIBLE unless the reward is gold */}
      <View style={[styles.topRow, large ? styles.topRowLarge : styles.topRowSmall]}>
        <View style={{ opacity: gold ? 1 : 0 }}>
          <GoldTag height={large ? 24 : 20} large={large} />
        </View>
        {card.showExpiry ? (
          <View style={[styles.expiryLabel, large && styles.expiryLabelLarge]}>
            <Text style={styles.expiryText} numberOfLines={1} allowFontScaling={false}>
              {rewardExpiry(card)}
            </Text>
          </View>
        ) : null}
      </View>

      {/* info_image_iv */}
      <View
        style={[
          styles.imageWrap,
          cta ? styles.imageWrapCta : large ? styles.imageWrapLarge : styles.imageWrapSmall,
        ]}
      >
        {isCoins ? (
          <IconJumboCoins size={cta ? 80 : large ? 92 : 60} />
        ) : isCash ? (
          <IconJumboCash width={cta ? 160 : large ? 184 : 120} />
        ) : (
          <ProductImage
            url={card.image}
            width={cta ? 180 : large ? 208 : 140}
            height={cta ? 80 : large ? 92 : 60}
          />
        )}
      </View>

      <Text
        style={[styles.title, cta ? styles.titleCta : large ? styles.titleLarge : styles.titleSmall]}
        numberOfLines={1}
        allowFontScaling={false}
      >
        {card.title}
      </Text>
      <Text
        style={[styles.subtitle, large ? styles.subtitleLarge : styles.subtitleSmall]}
        numberOfLines={large ? 2 : 1}
        allowFontScaling={false}
      >
        {card.subTitle}
      </Text>

      {/* next_action_layout: small card and the with-CTA card */}
      {(!large || cta) && card.nextCtaPresent ? (
        <View style={styles.nextAction}>
          <Text
            style={[styles.nextActionText, cta && { fontSize: 12, lineHeight: 14.4 }]}
            numberOfLines={1}
            allowFontScaling={false}
          >
            {cta ? card.nextCtaLabel : `${RM._see_details} >`}
          </Text>
        </View>
      ) : null}

      {/* details_status_label, centred over the card when the reward is disabled */}
      {showStatusLabel ? (
        <View style={[styles.statusWrap, { paddingBottom: large ? 8 : 12 }]} pointerEvents="none">
          <Text
            style={[styles.statusLabel, { color: card.statusLabelColor, backgroundColor: card.statusLabelBg }]}
            allowFontScaling={false}
          >
            {card.statusLabel}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { overflow: 'hidden', justifyContent: 'flex-start' },
  // info_layout background is reward_shadow_large_bg on every size: white, radius _20sdp
  cardSmall: { width: RD.cardSmallW, height: RD.cardSmallH, borderRadius: RD.cornerLarge },
  cardLarge: { width: RD.cardLarge, height: RD.cardLarge, borderRadius: RD.cornerLarge },
  cardCta: { width: RD.cardPostOrder, height: RD.cardPostOrder, borderRadius: RD.cornerLarge },
  // reward_shadow_large_bg (white, radius 20) vs bg_gold_all_rounded (gold pattern)
  plainBg: { backgroundColor: R.white },
  // bg_gold_all_rounded.xml is drawn by <GoldCardBg />
  goldBg: { backgroundColor: '#F7DDA5' },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  topRowSmall: { marginTop: 8, marginLeft: 4, marginRight: 4 },
  topRowLarge: { marginTop: 8, marginLeft: 8, marginRight: 8 },
  // expiry_label_bg: green_9 fill, radius 16
  expiryLabel: {
    height: 20,
    backgroundColor: R.green9,
    borderRadius: 16,
    paddingHorizontal: 4,
    justifyContent: 'center',
  },
  expiryLabelLarge: { height: 24, paddingHorizontal: 8 },
  expiryText: { color: R.green6, fontSize: 8, lineHeight: 9.6, fontFamily: 'Roboto-Medium' },
  imageWrap: { alignItems: 'center', justifyContent: 'center' },
  imageWrapSmall: { height: 60 },
  imageWrapLarge: { height: 92, marginTop: 16 },
  imageWrapCta: { height: 80, marginTop: 24 },
  title: { textAlign: 'center', fontFamily: 'Roboto-Bold' },
  titleSmall: { marginTop: 16, marginHorizontal: 8, fontSize: 12, lineHeight: 14.4, color: R.black },
  titleLarge: { marginTop: 16, marginHorizontal: 16, fontSize: 16, lineHeight: 19.2, color: R.darkerGrey },
  titleCta: { marginTop: 32, marginHorizontal: 16, fontSize: 16, lineHeight: 19.2, color: R.darkerGrey },
  subtitle: { textAlign: 'center', fontFamily: 'Roboto-Regular' },
  subtitleSmall: { marginHorizontal: 6, fontSize: 12, lineHeight: 14.4, color: R.black },
  subtitleLarge: { marginHorizontal: 16, fontSize: 14, lineHeight: 16.8, color: R.black },
  nextAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 8,
    paddingTop: 2,
    paddingBottom: 6,
  },
  nextActionText: { textAlign: 'center', fontSize: 10, lineHeight: 12.0, color: R.grey4, fontFamily: 'Roboto-Regular' },
  // details_status_label: full width band, vertically centred inside the card
  statusWrap: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center' },
  statusLabel: {
    width: '100%',
    textAlign: 'center',
    fontFamily: 'Roboto-Bold',
    fontSize: 12, lineHeight: 14.4,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
});
