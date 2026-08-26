// fragment_cart_order_confirmation.xml — the rewards part of the order confirmation screen:
//   scratch_card_status_msg / _subtitle, the 300x300 scratch_card_won_layout holding the
//   260x260 reward_item_layout_large_with_cta under a ScratchCardOverlayUi, then the
//   already_earned_rewards_layout strip.
import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import Toolbar from '../../src/components/Toolbar';
import RewardCard from '../../src/rewards/RewardCard';
import ScratchOverlay from '../../src/rewards/ScratchOverlay';
import ScratchCardItem from '../../src/rewards/ScratchCardItem';
import { RIMG } from '../../src/rewards/assets';
import { R, RD } from '../../src/rewards/theme';
import { REWARDS, markScratched, cardStatus } from '../../src/rewards/data';

export default function OrderConfirmationRewards() {
  const router = useRouter();
  const postOrderCard = REWARDS[0];              // the card handed out with this order
  const earned = REWARDS.filter((c) => cardStatus(c) === 'REVEALED' || cardStatus(c) === 'DISABLED');
  const [revealed, setRevealed] = useState(cardStatus(postOrderCard) !== 'UNSCRATCHED');
  const [confetti, setConfetti] = useState(false);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {/* OrderConfirmationFragment: collapsingToolbarLayout title @string/_order_confirmed */}
      <Toolbar title="Order Confirmed" elevation={4} />
      <ScrollView>
        <View style={styles.gamification}>
          <Text style={styles.statusMsg} allowFontScaling={false}>Congratulations!</Text>
          <Text style={styles.statusSubtitle} allowFontScaling={false}>You have earned a reward</Text>

          <View style={styles.wonLayout}>
            <View style={styles.cardWrap}>
              <RewardCard card={postOrderCard} size="cta" />
              {!revealed ? (
                <ScratchOverlay
                  size={RD.cardPostOrder}
                  texture={RIMG.scratchOverlay}
                  onRevealed={() => {
                    markScratched(postOrderCard.scratchCardId);
                    setRevealed(true);
                    setConfetti(true);
                    setTimeout(() => setConfetti(false), 5000);
                  }}
                />
              ) : null}
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.earnedLayout}>
          <View style={styles.earnedHeader}>
            <Text style={styles.earnedTitle} allowFontScaling={false}>Rewards Earned</Text>
            <Pressable onPress={() => router.push('/rewards')}>
              {/* @string/_view_all */}
              <Text style={styles.viewAll} allowFontScaling={false}>View All ></Text>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {earned.map((c) => (
              <ScratchCardItem key={c.scratchCardId} card={c} onPress={() => router.push(`/rewards/${c.scratchCardId}`)} />
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {confetti ? (
        <View style={styles.confetti} pointerEvents="none">
          <LottieView source={RIMG.ribbon} autoPlay loop style={{ flex: 1 }} />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: R.defaultBg },
  gamification: { backgroundColor: R.white, alignItems: 'center', paddingBottom: 16 },
  statusMsg: { marginTop: 8, marginHorizontal: 16, paddingHorizontal: 8, color: R.black, fontSize: 16, lineHeight: 19.2, fontFamily: 'Roboto-Bold' },
  statusSubtitle: { marginTop: 4, marginHorizontal: 16, paddingHorizontal: 8, color: R.black, fontSize: 12, lineHeight: 14.4, fontFamily: 'Roboto-Regular' },
  // scratch_card_won_layout: scratch_card_bg_with_shadow, min 300x300
  wonLayout: {
    marginTop: 8,
    marginBottom: 16,
    minWidth: 300,
    minHeight: 300,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: R.white,
    borderRadius: RD.cornerLarge,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cardWrap: { width: RD.cardPostOrder, height: RD.cardPostOrder, elevation: 4 },
  divider: { height: 1, marginHorizontal: 16, backgroundColor: '#CCCCCC' },
  earnedLayout: { backgroundColor: R.white, paddingHorizontal: 8, paddingVertical: 16 },
  earnedHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  earnedTitle: { marginLeft: 4, color: R.black, fontSize: 14, lineHeight: 16.8, fontFamily: 'Roboto-Bold' },
  viewAll: { marginRight: 8, color: '#d55d3b', fontSize: 13, lineHeight: 15.6, fontFamily: 'Roboto-Bold' },
  confetti: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
});
