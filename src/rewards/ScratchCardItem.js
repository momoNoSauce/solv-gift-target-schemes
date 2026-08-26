// card_scratched_card_item.xml + ScratchedCardViewHolder.kt
//   outer margins 6/8dp, card 160x172 on a dummy_shadow_rect (white, radius 10, elevation 2),
//   overlay_layout on top for LOCKED and UNSCRATCHED (scratch_bg_rect / gold_scratch_bg_rect),
//   lock_iv (48dp) centred over the card when LOCKED.
import React from 'react';
import { View, Image, Pressable, StyleSheet } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import RewardCard from './RewardCard';
import { RIMG } from './assets';
import { R, RD } from './theme';
import { cardStatus } from './data';

// ic_scratch_card_lock.xml = ic_lock_circle (48dp, #FF5E5E, white stroke) + ic_outline_lock_24 (white)
export function LockBadge({ size = 48 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Circle cx="24" cy="24" r="23" fill="#FF5E5E" stroke="#ffffff" strokeWidth="2" />
      <Path
        fill="#ffffff"
        transform="translate(12 12)"
        d="M18,8h-1L17,6c0,-2.76 -2.24,-5 -5,-5S7,3.24 7,6v2L6,8c-1.1,0 -2,0.9 -2,2v10c0,1.1 0.9,2 2,2h12c1.1,0 2,-0.9 2,-2L20,10c0,-1.1 -0.9,-2 -2,-2zM9,6c0,-1.66 1.34,-3 3,-3s3,1.34 3,3v2L9,8L9,6zM18,20L6,20L6,10h12v10zM12,17c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2z"
      />
    </Svg>
  );
}

export default function ScratchCardItem({ card, onPress }) {
  const status = cardStatus(card);
  const covered = status === 'LOCKED' || status === 'UNSCRATCHED';

  return (
    <Pressable style={styles.outer} onPress={onPress} android_ripple={{ color: '#0000000d' }}>
      <View style={styles.shadowRect}>
        <RewardCard card={card} size="small" />
        {covered ? (
          <Image
            source={card.isRewardGold ? RIMG.goldScratchBg : RIMG.scratchBg}
            style={styles.overlay}
            resizeMode="cover"
          />
        ) : null}
        {status === 'LOCKED' ? (
          <View style={styles.lock} pointerEvents="none">
            <LockBadge size={48} />
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  outer: { marginHorizontal: 6, marginVertical: 8 },
  // main_scratch_card_layout: 2dp margin, dummy_shadow_rect (white, radius 10), elevation 2
  shadowRect: {
    margin: 2,
    width: RD.cardSmallW,
    height: RD.cardSmallH,
    borderRadius: RD.cornerSmall,
    backgroundColor: R.white,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  // Explicit size, not insets: React Native Web falls back to the bitmap's intrinsic
  // 1102x1232 when an Image is sized only by left/top/right/bottom.
  overlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: RD.cardSmallW,
    height: RD.cardSmallH,
    borderRadius: RD.cornerSmall,
  },
  lock: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
});
