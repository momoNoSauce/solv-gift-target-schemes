// quiz_disabled_layout.xml + QuizDisabledBottomSheetFragment.kt — shown instead of the quiz
// once the day's quiz is done. Handle uses black_10pc here, unlike the quiz sheet.
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Sheet from '../../src/components/Sheet';
import { IconJumboCoins } from '../../src/icons';
import { Q, QM } from '../../src/coins/theme';
import { L12, L18, L20 } from '../../src/textMetrics';

export default function QuizDisabledSheet() {
  return (
    <Sheet>
      <View style={{ paddingTop: 16 }}>
        <View style={styles.handle} />
        <Text style={styles.title} allowFontScaling={false}>Today's quiz is done</Text>
        <View style={styles.card}>
          <Text style={styles.heading} allowFontScaling={false}>Come back tomorrow</Text>
          <View style={styles.rewardRow}>
            <Text style={styles.subHeading} allowFontScaling={false}>Win up to</Text>
            <Text style={styles.rewardValue} allowFontScaling={false}>15</Text>
            <View style={{ marginLeft: 8 }}>
              <IconJumboCoins size={20} />
            </View>
          </View>
        </View>
        <Text style={styles.close} allowFontScaling={false}>{QM._continue_text}</Text>
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  // roundedLineLayout: 50x4 on black_10pc, 4dp corners
  handle: { width: 50, height: 4, borderRadius: 4, backgroundColor: Q.black10, alignSelf: 'center' },
  title: { marginHorizontal: 40, marginVertical: 26, textAlign: 'center', color: Q.black, fontSize: 20, lineHeight: L20, fontFamily: 'Roboto-Bold' },
  // midLayout: CardView radius 8, no elevation, 16dp margins, 16dp top / 50dp bottom padding
  card: { margin: 16, borderRadius: 8, backgroundColor: Q.white, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 50 },
  heading: { marginTop: 20, textAlign: 'center', color: Q.brandGreen, fontSize: 20, lineHeight: L20, fontFamily: 'Roboto-Bold' },
  rewardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  subHeading: { color: Q.brandGreen, fontSize: 18, lineHeight: L18, fontFamily: 'Roboto-Medium' },
  rewardValue: { marginLeft: 6, color: Q.brandGreen, fontSize: 18, lineHeight: L18, fontFamily: 'Roboto-Bold' },
  close: { margin: 16, padding: 8, textAlign: 'center', color: Q.textBlue, fontSize: 16, lineHeight: 19.2, fontFamily: 'Roboto-Regular' },
});
