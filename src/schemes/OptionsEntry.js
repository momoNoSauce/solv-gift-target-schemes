// The review entry: two options, two rows. Option A opens the arc version,
// Option B the dock version. Nothing else.
import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { F } from '../theme';
import { usePressScale } from '../gifts/solv';
import { SETTLED } from './motion';

const INK = '#0B0A14';

// EXPO_PUBLIC_ENTRY=detail keeps the first review build's rows, which open the
// detail screens directly. The default opens the scheme list.
const DETAIL = process.env.EXPO_PUBLIC_ENTRY === 'detail';
const OPTIONS = [
  { key: 'A', name: 'Solv', href: DETAIL ? '/schemes' : '/schemes/list' },
  { key: 'B', name: 'Jumbotail', href: DETAIL ? '/schemes' : '/schemes/list?brand=jt' },
  { key: 'C', name: 'Footer variants', href: '/schemes/list?compare=1' },
  { key: 'D', name: 'Product page', href: '/ppv' },
];

function Row({ option, anim, onPress }) {
  const press = usePressScale(0.98);
  return (
    <Animated.View style={{ opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }, { scale: press.scale }] }}>
      <Pressable onPress={onPress} onPressIn={press.pressIn} onPressOut={press.pressOut} style={styles.row} accessibilityRole="button" accessibilityLabel={`Option ${option.key}, ${option.name}`}>
        <Text style={styles.option} allowFontScaling={false}>Option {option.key}</Text>
        <Text style={styles.name} allowFontScaling={false}>{option.name}</Text>
        <Svg width={18} height={18} viewBox="0 0 24 24">
          <Path fill="rgba(255,255,255,0.4)" d="M8.59,16.58L13.17,12L8.59,7.41L10,6l6,6l-6,6L8.59,16.58z" />
        </Svg>
      </Pressable>
    </Animated.View>
  );
}

export default function OptionsEntry() {
  const router = useRouter();
  // One value for the title and one per row, so a new row never outruns the array.
  const a = useRef(Array.from({ length: OPTIONS.length + 1 }, () => new Animated.Value(SETTLED ? 1 : 0))).current;
  useEffect(() => {
    if (SETTLED) return;
    const out = (v) => Animated.timing(v, { toValue: 1, duration: 240, easing: Easing.out(Easing.cubic), useNativeDriver: false });
    Animated.stagger(50, a.map(out)).start();
  }, []);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.column}>
        <Animated.Text style={[styles.title, { opacity: a[0] }]} allowFontScaling={false}>Target schemes</Animated.Text>
        {OPTIONS.map((o, i) => (
          <Row key={o.key} option={o} anim={a[i + 1]} onPress={() => router.push(o.href)} />
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: INK, alignItems: 'center', justifyContent: 'center' },
  column: { width: '100%', maxWidth: 412, paddingHorizontal: 20, gap: 10, marginTop: -40 },
  title: { color: 'rgba(255,255,255,0.6)', fontFamily: F.medium, fontSize: 15, lineHeight: 20, marginBottom: 6, paddingHorizontal: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  option: { flex: 1, color: '#fff', fontFamily: F.medium, fontSize: 17, lineHeight: 22 },
  name: { marginRight: 10, color: 'rgba(255,255,255,0.6)', fontFamily: F.regular, fontSize: 15, lineHeight: 20 },
});
