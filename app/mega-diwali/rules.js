// Flow B: scheme rules. Everything the campaign page deliberately does not say.
// This page is also where the honesty lives: returns reduce the total, gifts have
// no cash exchange, out-of-stock gifts are substituted.
import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { F } from '../../src/theme';
import { IconBack } from '../../src/icons';

const K = {
  night: '#160E33',
  night2: '#2C1D57',
  gold: '#F2B84B',
  ink: '#1A1A1A',
  sub: '#6B6B6B',
  line: '#ECECEC',
  paper: '#FFFFFF',
  bg: '#F7F7F7',
};

const RULES = [
  ['Window', 'Buy on Solv from 1 Oct to 9 Nov 2026. Orders outside the window do not count.'],
  ['What counts', 'Lifestyle products only. Electronics run as a separate scheme.'],
  ['Returns', 'Returned or cancelled orders reduce your total.'],
  ['One gift', 'You receive one gift: the gift at the highest amount you cross.'],
  ['No cash', 'Gifts have no cash or credit exchange.'],
  ['Delivery', 'We order your gift on Amazon to your confirmed shop address. It reaches you by 21 Nov 2026.'],
  ['Stock', 'If a gift is out of stock, we send one of equal or higher value.'],
  ['Help', 'For any dispute, call support before 30 Nov 2026.'],
];

export default function MegaDiwaliRules() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <LinearGradient colors={[K.night, K.night2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
        <Pressable onPress={() => router.back()} android_ripple={{ color: '#ffffff33', borderless: true }}>
          <IconBack size={24} color="#fff" />
        </Pressable>
        <Text style={styles.title} allowFontScaling={false}>Scheme rules</Text>
      </LinearGradient>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.card}>
          {RULES.map(([name, body], i) => (
            <View key={name} style={[styles.row, i > 0 && styles.divider]}>
              <Text style={styles.name} allowFontScaling={false}>{name}</Text>
              <Text style={styles.body} allowFontScaling={false}>{body}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: K.bg },
  header: { height: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  title: { marginLeft: 12, color: '#fff', fontFamily: F.medium, fontSize: 18, lineHeight: 22 },
  card: { marginHorizontal: 16, marginTop: 16, backgroundColor: K.paper, borderRadius: 14, borderWidth: 1, borderColor: K.line, paddingHorizontal: 16 },
  row: { paddingVertical: 12 },
  divider: { borderTopWidth: 1, borderTopColor: K.line },
  name: { fontFamily: F.bold, fontSize: 13, lineHeight: 17, color: K.ink },
  body: { marginTop: 2, fontFamily: F.regular, fontSize: 13, lineHeight: 18, color: K.sub },
});
