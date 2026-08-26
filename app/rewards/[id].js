// fragment_scratch_card_details_3.xml + ScratchCardRevealFragment.kt
import React, { useState } from 'react';
import { View, Text, Image, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import Svg, { Path } from 'react-native-svg';
import RewardCard from '../../src/rewards/RewardCard';
import ScratchOverlay from '../../src/rewards/ScratchOverlay';
import { LockBadge } from '../../src/rewards/ScratchCardItem';
import { RIMG } from '../../src/rewards/assets';
import { GoldSheetTop } from '../../src/rewards/GoldBackground';
import { JUMBOTAIL_GREEN } from '../../src/jumbotailLogo';
import { R, RD, RM } from '../../src/rewards/theme';
import { getReward, markScratched, cardStatus, RewardStatus, RewardType } from '../../src/rewards/data';

function IconCloseWhite({ size = 24 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path fill="#ffffff" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
    </Svg>
  );
}

export default function ScratchCardReveal() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const card = getReward(id);
  const [, force] = useState(0);
  const [confetti, setConfetti] = useState(false);
  if (!card) return <View style={styles.root} />;

  const status = cardStatus(card);
  const gold = card.isRewardGold;
  const coin = card.rewardType === RewardType.JUMBO_COINS || card.rewardType === RewardType.JUMBO_CASH;

  // setupObservers(): visiblePercent > 0.3 -> scratchCardRevealed + won animation
  const onRevealed = () => {
    markScratched(card.scratchCardId);
    setConfetti(true);
    force((n) => n + 1);
    setTimeout(() => setConfetti(false), 5000);
  };

  const showDetailsInfo = status === 'UNSCRATCHED';        // details_info_layout
  const showBottomSheet = status !== 'UNSCRATCHED';       // scratch_card_details_layout

  // setUpScratchCardDetailsData()
  const levels = infoLevels(card, coin);

  return (
    <View style={styles.root}>
      <Pressable style={styles.close} onPress={() => router.back()} hitSlop={8}>
        <IconCloseWhite size={24} />
      </Pressable>

      <View style={styles.middle}>
        <View style={styles.cardWrap}>
          <RewardCard card={card} size="large" />
          {status === 'UNSCRATCHED' ? (
            <ScratchOverlay size={RD.cardLarge} gold={gold} onRevealed={onRevealed} />
          ) : null}
          {status === 'LOCKED' ? (
            <>
              <Image source={RIMG.scratchOverlay} style={styles.mockOverlay} resizeMode="cover" />
              <View style={styles.lock} pointerEvents="none">
                <LockBadge size={48} />
              </View>
            </>
          ) : null}
        </View>

        {showDetailsInfo ? (
          <View style={styles.detailsInfo}>
            <Text style={styles.detailsTitle} allowFontScaling={false}>{RM._unscratched_card_title}</Text>
            <Text style={styles.detailsSubtitle} allowFontScaling={false}>{RM._scratch_card_detail_subtitle}</Text>
          </View>
        ) : null}
      </View>

      {showBottomSheet ? (
        <View style={[styles.sheet, gold && styles.sheetGold]}>
          {gold ? <GoldSheetTop /> : null}
          <ScrollView>
            <View style={styles.sheetRow}>
              {/* details_company_logo: jumbotail_green until the API sends a company logo */}
              <Svg width={24} height={24} viewBox={JUMBOTAIL_GREEN.viewBox} style={styles.companyLogo}>
                {JUMBOTAIL_GREEN.paths.map((d, i) => (
                  <Path key={i} d={d} fill="#2c552d" />
                ))}
              </Svg>
              <Text style={styles.companyName} numberOfLines={1} allowFontScaling={false}>
                {card.detailsCompanyTitle}
              </Text>
            </View>
            <Text style={styles.congrats} allowFontScaling={false}>{card.detailsTitle}</Text>
            {card.detailsSubtitle ? (
              <Text style={styles.description} allowFontScaling={false}>{card.detailsSubtitle}</Text>
            ) : null}

            {levels.l1 ? (
              <View style={styles.level}>
                <Text style={styles.levelLabel} numberOfLines={1} allowFontScaling={false}>{levels.l1.label}</Text>
                <Text
                  style={[styles.levelValue, levels.l1.highlight && { color: R.brown2 }]}
                  numberOfLines={1}
                  allowFontScaling={false}
                >
                  {levels.l1.value}
                </Text>
              </View>
            ) : null}

            {levels.l2 || levels.l3 ? (
              <View style={styles.levelRow}>
                <View style={{ width: '50%' }}>
                  {levels.l2 ? (
                    <>
                      <Text style={styles.levelLabel} numberOfLines={1} allowFontScaling={false}>{levels.l2.label}</Text>
                      <Text style={styles.levelValue} numberOfLines={1} allowFontScaling={false}>{levels.l2.value}</Text>
                    </>
                  ) : null}
                </View>
                <View style={{ width: '50%', paddingLeft: 4 }}>
                  {levels.l3 ? (
                    levels.l3.linkOnly ? (
                      <Text style={styles.levelLink} numberOfLines={2} allowFontScaling={false}>{levels.l3.value}</Text>
                    ) : (
                      <>
                        <Text style={styles.levelLabel} numberOfLines={2} allowFontScaling={false}>{levels.l3.label}</Text>
                        <Text style={styles.levelValue} numberOfLines={2} allowFontScaling={false}>{levels.l3.value}</Text>
                      </>
                    )
                  ) : null}
                </View>
              </View>
            ) : null}
            <View style={{ height: 16 }} />
          </ScrollView>

          {card.nextCtaPresent ? (
            <Pressable onPress={() => router.replace('/')}>
              <Text style={styles.cta} allowFontScaling={false}>{card.nextCtaLabel.toUpperCase()}</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {confetti ? (
        <View style={styles.confetti} pointerEvents="none">
          <LottieView source={RIMG.ribbon} autoPlay loop style={{ flex: 1 }} />
        </View>
      ) : null}
    </View>
  );
}

// getInfoLevel1/2/3Label + Value, and setUpScratchCardDetailsData()
function infoLevels(card, coin) {
  if (card.rewardStatus === RewardStatus.UNREVEALED) return {};
  const credited = card.rewardStatus === RewardStatus.CREDITED;
  const expired = card.rewardStatus === RewardStatus.EXPIRED;
  const availed = card.rewardStatus === RewardStatus.AVAILED;

  const l1 = {
    label: coin || credited ? card.applicabilityLabel : RM._added_on,
    value: coin || credited ? card.applicabilityValue : card.addedOn,
    highlight: coin || credited,
  };

  const l2 = coin
    ? { label: RM._added_on, value: card.addedOn }
    : credited
    ? { label: RM._start_date, value: card.detailsStartDate }
    : expired
    ? { label: RM._expired_on, value: card.detailsEndDate }
    : availed
    ? { label: RM._used_on_date, value: card.detailsUsedOn }
    : null;

  const l3 = coin
    ? { label: RM._expires_on, value: RM._never_expires }
    : credited
    ? { label: RM._expires_on, value: card.detailsEndDate }
    : availed
    ? { label: '', value: card.rewardSeeDetailsLabel, linkOnly: true }
    : null;

  if (credited) return { l1, l2, l3 };
  if (expired) return coin ? { l1, l2, l3 } : { l1 };
  if (availed) return { l1, l2, l3 };
  return { l1 };
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: R.grey11 },
  close: { position: 'absolute', right: 16, top: 24, width: 44, height: 44, padding: 6, alignItems: 'center', justifyContent: 'center', zIndex: 3 },
  middle: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cardWrap: { width: RD.cardLarge, height: RD.cardLarge, marginHorizontal: 28, marginVertical: 16 },
  mockOverlay: { position: 'absolute', left: 0, top: 0, width: RD.cardLarge, height: RD.cardLarge, borderRadius: RD.cornerLarge },
  lock: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  detailsInfo: { marginHorizontal: 64, marginTop: 16, alignItems: 'center' },
  detailsTitle: { color: R.white, fontSize: 18, lineHeight: 21.6, fontFamily: 'Roboto-Bold', textAlign: 'center' },
  detailsSubtitle: { marginTop: 8, color: R.white, fontSize: 16, lineHeight: 19.2, fontFamily: 'Roboto-Regular', textAlign: 'center' },
  // scratch_card_details_layout_bg: white, top corners 16
  sheet: { backgroundColor: R.white, borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '55%' },
  // bg_gold_pattern_rounded_top.xml is drawn by <GoldSheetTop />
  sheetGold: { backgroundColor: '#F7DDA5', overflow: 'hidden' },
  sheetRow: { flexDirection: 'row', alignItems: 'center', marginTop: 24, marginHorizontal: 16 },
  companyLogo: { width: 24, height: 24 },
  companyName: { marginLeft: 8, marginRight: 16, flex: 1, color: R.black, fontSize: 18, lineHeight: 21.6, fontFamily: 'Roboto-Bold' },
  congrats: { marginTop: 16, marginHorizontal: 16, color: R.black2, fontSize: 16, lineHeight: 19.2, fontFamily: 'Roboto-Medium' },
  description: { marginTop: 4, marginHorizontal: 16, color: R.black, fontSize: 14, lineHeight: 16.8, fontFamily: 'Roboto-Regular' },
  level: { marginTop: 16, marginHorizontal: 16 },
  levelRow: { marginTop: 16, marginHorizontal: 16, flexDirection: 'row' },
  levelLabel: { color: R.black2, fontSize: 12, lineHeight: 14.4, fontFamily: 'Roboto-Medium' },
  levelValue: { marginTop: 4, color: R.black, fontSize: 14, lineHeight: 16.8, fontFamily: 'Roboto-Regular' },
  levelLink: { marginTop: 4, color: R.green13, fontSize: 14, lineHeight: 16.8, fontFamily: 'Roboto-Regular', textDecorationLine: 'underline' },
  cta: {
    marginTop: 16,
    backgroundColor: R.lightGreen,
    textAlign: 'center',
    paddingVertical: 16,
    color: R.white,
    fontSize: 16, lineHeight: 19.2,
    fontFamily: 'Roboto-Bold',
  },
  confetti: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
});
