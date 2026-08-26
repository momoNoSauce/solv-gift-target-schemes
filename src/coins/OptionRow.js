// option_viewholder_binding.xml, shared by the Jix survey (JixSurveyOptionAdapter) and the
// Jix quiz (QuizOptionViewHolder).
//   optionLayout: marginVertical 6dp; survey uses jix_option_unselected/selected (white,
//     radius 8, 1dp light_grey / light_green); the quiz uses outline_grey_cornered_border
//     (radius 8, 1dp light_grey_5) and swaps to outline_green_cornered_border (correct_green
//     fill, 2dp) or outline_red_cornered_border (pale_red_5 fill, 2dp pale_red)
//   selectionIndicator: 20dp radio at marginStart 12
//   optionText: marginStart 10, marginEnd 12, paddingVertical 12, 16sp Regular black
//   guidingIcon: 21dp, visible on quiz rows only
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { L16 } from '../textMetrics';

function Radio({ selected }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20">
      <Circle cx="10" cy="10" r="9.5" fill="transparent" stroke={selected ? '#58a159' : '#8f8f8f'} strokeWidth="1" />
      {selected ? <Circle cx="10" cy="10" r="5" fill="#58a159" /> : null}
    </Svg>
  );
}

function GuidingIcon({ state }) {
  if (state === 'correct') {
    return (
      <Svg width={21} height={20} viewBox="0 0 21 20">
        <Path fill="#78C93C" d="M10.5,0a10,10 0,1 0,0.001 20A10,10 0,0 0,10.5 0zM9,15l-4,-4l1.4,-1.4L9,12.2l5.6,-5.6L16,8L9,15z" />
      </Svg>
    );
  }
  if (state === 'wrong') {
    return (
      <Svg width={21} height={21} viewBox="0 0 21 21">
        <Path fill="#D55D3B" d="M10.5,0.5a10,10 0,1 0,0.001 20A10,10 0,0 0,10.5 0.5zM15,13.6L13.6,15L10.5,11.9L7.4,15L6,13.6l3.1,-3.1L6,7.4L7.4,6l3.1,3.1L13.6,6L15,7.4l-3.1,3.1L15,13.6z" />
      </Svg>
    );
  }
  return (
    <Svg width={21} height={21} viewBox="0 0 21 21">
      <Path fill="#222222" d="M10.5,0.5a10,10 0,1 0,0.001 20A10,10 0,0 0,10.5 0.5zM10.5,18.5a8,8 0,1 1,0 -16a8,8 0,0 1,0 16z" />
    </Svg>
  );
}

export default function OptionRow({ text, selected, state = 'plain', showGuiding = false, onPress }) {
  const bg =
    state === 'correct' ? '#D6EFC4' : state === 'wrong' ? '#FFF8F5' : '#ffffff';
  const border =
    state === 'correct'
      ? { borderWidth: 2, borderColor: 'rgba(34,34,34,0.13)', borderRadius: 4 }
      : state === 'wrong'
      ? { borderWidth: 2, borderColor: '#d55d3b', borderRadius: 4 }
      : { borderWidth: 1, borderColor: selected ? '#58a159' : showGuiding ? 'rgba(34,34,34,0.13)' : '#dadada', borderRadius: 8 };

  return (
    <Pressable style={[styles.row, border, { backgroundColor: bg }]} onPress={onPress}>
      <View style={styles.indicator}>
        <Radio selected={!!selected} />
      </View>
      <Text style={styles.text} allowFontScaling={false}>{text}</Text>
      {showGuiding ? (
        <View style={styles.guiding}>
          <GuidingIcon state={state} />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
  indicator: { width: 20, height: 20, marginLeft: 12 },
  text: { flex: 1, marginLeft: 10, marginRight: 12, paddingVertical: 12, color: '#000000', fontSize: 16, lineHeight: L16, fontFamily: 'Roboto-Regular' },
  guiding: { marginRight: 10 },
});
