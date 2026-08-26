// question_guiding_layout.xml + QuizQuestionNavigationViewHolder.kt
//   reward row: count (12sp) + ic_jumbocoin_new with a 4dp gap, INVISIBLE when the reward is 0
//   circle: ic_unmarked_question (white, #A5A5A5 stroke) / ic_correct_answer_bg (#D6EFC4) /
//           ic_wrong_answer_bg (#FFCCCC), with "Q1" 16sp Medium centred
//   below: ic_green_tick_flat_edge (14x10 #387E2A) or ic_red_cross (10x10 #D55D3B)
//   right: a 40x4 connector in light_greyish_white, hidden on the last chip
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { JUMBOCOIN_NEW } from './coinIcon';
import { L12, L16 } from '../textMetrics';

function CoinNew({ size = 16 }) {
  return (
    <Svg width={(size * 17) / 16} height={size} viewBox={JUMBOCOIN_NEW.viewBox}>
      <Defs>
        {/* outer disc: #FFC800 -> #FFC900 -> #FFBD00 across the width */}
        <LinearGradient id="coinOuter" x1="16.191" y1="8" x2="0.191" y2="8" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#FFC800" />
          <Stop offset="0.497" stopColor="#FFC900" />
          <Stop offset="1" stopColor="#FFBD00" />
        </LinearGradient>
        {/* inner disc: #FF8C00 -> #FF9B00 -> #FFAC00 on the diagonal */}
        <LinearGradient id="coinInner" x1="3.86" y1="3.668" x2="12.521" y2="12.33" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#FF8C00" />
          <Stop offset="0.497" stopColor="#FF9B00" />
          <Stop offset="1" stopColor="#FFAC00" />
        </LinearGradient>
      </Defs>
      <Path d={JUMBOCOIN_NEW.outer} fill="url(#coinOuter)" />
      <Path d={JUMBOCOIN_NEW.inner} fill="url(#coinInner)" />
      <Path d={JUMBOCOIN_NEW.mark} fill="#ffffff" />
    </Svg>
  );
}

export default function QuestionChip({ index, reward, state, isLast, onPress }) {
  const circle = state === 'correct' ? '#D6EFC4' : state === 'wrong' ? '#FFCCCC' : '#ffffff';
  const stroke = state === 'unmarked' ? '#A5A5A5' : 'transparent';
  const textColor = state === 'correct' ? '#30523B' : state === 'wrong' ? '#9F1D1D' : '#7A7A7A';

  return (
    <View style={styles.row}>
      <View style={styles.chip}>
        <View style={[styles.rewardRow, reward === 0 && { opacity: 0 }]}>
          <Text style={[styles.rewardCount, state === 'wrong' && { color: '#A5A5A5' }]} allowFontScaling={false}>
            {reward}
          </Text>
          <View style={{ marginLeft: 4 }}>
            <CoinNew size={16} />
          </View>
        </View>

        <Pressable onPress={onPress} style={styles.circleWrap}>
          <Svg width={35} height={34} viewBox="0 0 35 34" style={StyleSheet.absoluteFill}>
            <Circle cx="17.229" cy="17" r="16.5" fill={circle} stroke={stroke} strokeWidth="1" />
          </Svg>
          <Text style={[styles.position, { color: textColor }]} allowFontScaling={false}>Q{index + 1}</Text>
        </Pressable>

        <View style={styles.indication}>
          {state === 'correct' ? (
            <Svg width={14} height={10} viewBox="0 0 14 10">
              <Path fill="#387E2A" d="M13.601,1.051L4.652,10L0.551,5.899L1.602,4.847L4.652,7.89L12.549,0L13.601,1.051Z" />
            </Svg>
          ) : state === 'wrong' ? (
            <Svg width={10} height={10} viewBox="0 0 10 10">
              <Path fill="#D55D3B" d="M9.229,0L5,4.229L0.771,0L0,0.771L4.228,5L0,9.229L0.771,10L5,5.771L9.229,10L10,9.229L5.771,5L10,0.771L9.229,0Z" />
            </Svg>
          ) : null}
        </View>
      </View>
      {!isLast ? <View style={styles.line} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  chip: { alignItems: 'center' },
  rewardRow: { flexDirection: 'row', alignItems: 'center' },
  rewardCount: { color: '#222222', fontSize: 12, lineHeight: L12, fontFamily: 'Roboto-Medium' },
  circleWrap: { width: 35, height: 34, marginTop: 8, alignItems: 'center', justifyContent: 'center' },
  position: { fontSize: 16, lineHeight: L16, fontFamily: 'Roboto-Medium' },
  indication: { height: 10, marginTop: 6, justifyContent: 'center' },
  line: { width: 40, height: 4, backgroundColor: '#efefef', marginTop: 8 },
});
