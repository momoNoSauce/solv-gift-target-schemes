// TabLayout.TabView.onMeasure keeps tabTextSize (14sp) while the label fits on one line and
// drops to tabTextMultiLineSize (design_tab_text_size_2line = 12sp) when it would wrap.
// The label is measured with Roboto Medium's own advance widths, so the decision matches.
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { C, F } from '../theme';
import { L12, L14 } from '../textMetrics';
import { measure, MEDIUM_ADV, MEDIUM_UPEM } from '../fontWidths';

const TRACKING = 1.25; // TextAppearance.MaterialComponents.Button: 0.0892857em at 14sp

export default function TabLabel({ label }) {
  const [available, setAvailable] = useState(0);
  const width14 = measure(label, 14, MEDIUM_ADV, MEDIUM_UPEM, TRACKING);
  const shrink = available > 0 && width14 > available;

  return (
    <View style={styles.host} onLayout={(e) => setAvailable(e.nativeEvent.layout.width)}>
      <Text
        style={[styles.label, shrink && styles.labelSmall]}
        numberOfLines={shrink ? 2 : 1}
        allowFontScaling={false}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  host: { alignItems: 'center', justifyContent: 'center', alignSelf: 'stretch' },
  label: {
    fontFamily: F.medium,
    fontSize: 14,
    lineHeight: L14,
    letterSpacing: TRACKING,
    color: C.white,
    textAlign: 'center',
  },
  labelSmall: { fontSize: 12, lineHeight: L12, letterSpacing: 1.07 },
});
