// retry_page.xml + error_illustration.xml as configured by setEmptyState():
// warning illustration, tv_problem_description = _no_targets_available,
// bt_retry text = _go_to_home, assistance_call_bar hidden.
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { WARNING_GREY } from '../warningIcon';
import { useRouter } from 'expo-router';
import { C, F } from '../theme';
import { M } from '../data';

export default function EmptyState() {
  const router = useRouter();
  return (
    <View style={styles.page}>
      <View style={styles.illustration}>
        <View style={styles.warning}>
          <Svg width={90} height={80} viewBox={WARNING_GREY.viewBox}>
            {WARNING_GREY.paths.map((d, i) => (
              <Path key={i} d={d} fill="#000000" fillOpacity={0.5} />
            ))}
          </Svg>
        </View>
        <Text style={styles.desc} allowFontScaling={false}>{M._no_targets_available}</Text>
      </View>
      <View style={styles.action}>
        <Pressable style={styles.retry} onPress={() => router.replace('/')}>
          <Text style={styles.retryText} allowFontScaling={false}>{M._go_to_home}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: C.lightGreyishWhite },
  illustration: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  warning: { width: 90, height: 80, alignItems: 'center', justifyContent: 'center' },
  desc: { marginTop: 16, marginBottom: 8, paddingHorizontal: 8, textAlign: 'center', fontFamily: F.regular, fontSize: 16, lineHeight: 19.2, color: C.black50 },
  action: { flex: 1, paddingTop: 60, alignItems: 'center' },
  // selector_black: almost_black, pressed state dark_grey
  retry: { width: 162, height: 42, backgroundColor: '#2c2c2c', alignItems: 'center', justifyContent: 'center' },
  retryText: { fontFamily: F.regular, fontSize: 14, lineHeight: 16.8, color: C.white, textTransform: 'uppercase' },
});
