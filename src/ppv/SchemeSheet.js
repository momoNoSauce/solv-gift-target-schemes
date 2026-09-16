// The target-scheme sheet on the product page. A tap on the small scheme card
// opens it: a bottom sheet over the page with the same card the Target schemes
// list shows (src/schemes/SchemesList.js Card: the stage with the meter, the
// footer with the gifts), one per scheme this product counts toward. A tap on
// a card leaves for that scheme's detail page.
//
// Anatomy (Material bottom sheet, as the app's own sheets):
//   scrim      black at 32 %, fades in 200 ms
//   sheet      white, 16 px top radius, a 36 x 4 handle, slides up on a spring
//              (stiffness 260, damping 30, no bounce), drags down to close
//   header     "Target schemes" (16 bold), "This product counts toward 2
//              schemes" (13 sub), a close disc on the right
//   body       the cards, 16 px apart, scrollable when two do not fit
//   bottom     the safe-area inset
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Modal, ScrollView, StyleSheet, Animated, Easing, PanResponder, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { F } from '../theme';
import { SOLV } from '../gifts/solv';
import { Card, CHROME } from '../schemes/SchemesList';
import { T } from '../schemes/copy';
import { SETTLED } from '../schemes/motion';

export default function SchemeSheet({ open, schemes, indexOf, onClose, brand = 'solv' }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height: screenH } = useWindowDimensions();
  const [mounted, setMounted] = useState(open);
  const y = useRef(new Animated.Value(1)).current;        // 1: off screen, 0: in place
  const t = T.en;
  const chrome = CHROME[brand] || CHROME.solv;

  useEffect(() => {
    if (open) {
      setMounted(true);
      y.setValue(SETTLED ? 0 : 1);
      if (!SETTLED) Animated.spring(y, { toValue: 0, stiffness: 260, damping: 30, mass: 1, useNativeDriver: false }).start();
    } else if (mounted) {
      Animated.timing(y, { toValue: 1, duration: SETTLED ? 0 : 220, easing: Easing.in(Easing.cubic), useNativeDriver: false }).start(() => setMounted(false));
    }
  }, [open]);

  // Drag the handle or header down to close: past 90 px or a fast flick.
  const drag = useRef(new Animated.Value(0)).current;
  const pan = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => g.dy > 4 && Math.abs(g.dy) > Math.abs(g.dx),
    onPanResponderMove: (_, g) => drag.setValue(Math.max(0, g.dy)),
    onPanResponderRelease: (_, g) => {
      if (g.dy > 90 || g.vy > 0.8) { drag.setValue(0); onClose(); }
      else Animated.spring(drag, { toValue: 0, stiffness: 300, damping: 30, useNativeDriver: false }).start();
    },
  })).current;

  if (!mounted) return null;
  const sheetH = Math.min(screenH * 0.92, 120 + schemes.length * 620);
  const translateY = Animated.add(y.interpolate({ inputRange: [0, 1], outputRange: [0, sheetH] }), drag);
  const scrim = y.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });

  const goTo = (scheme) => {
    onClose();
    router.push(`/schemes?i=${indexOf(scheme)}`);
  };

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.root}>
        <Animated.View style={[styles.scrim, { opacity: scrim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
        </Animated.View>
        <Animated.View style={[styles.sheet, { maxHeight: sheetH, paddingBottom: insets.bottom + 8, transform: [{ translateY }] }]}>
          <View {...pan.panHandlers} dataSet={{ touch: 'pan-y' }}>
            <View style={styles.handle} />
            <View style={styles.header}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title} allowFontScaling={false}>Target schemes</Text>
                <Text style={styles.sub} allowFontScaling={false}>
                  {schemes.length === 1 ? 'This product counts toward 1 scheme' : `This product counts toward ${schemes.length} schemes`}
                </Text>
              </View>
              <Pressable onPress={onClose} style={styles.close} hitSlop={8} accessibilityRole="button" accessibilityLabel="Close">
                <Svg width={18} height={18} viewBox="0 0 24 24">
                  <Path d="M6 6l12 12M18 6L6 18" stroke={SOLV.ink} strokeWidth={2.2} strokeLinecap="round" />
                </Svg>
              </Pressable>
            </View>
          </View>
          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false} bounces={false}>
            {schemes.map((sc) => (
              <Card key={sc.id} scheme={sc} t={t} chrome={chrome} onPress={() => goTo(sc)} />
            ))}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.32)' },
  sheet: { backgroundColor: SOLV.listBg, borderTopLeftRadius: 16, borderTopRightRadius: 16, overflow: 'hidden' },
  handle: { alignSelf: 'center', width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(17,24,39,0.18)', marginTop: 8 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 6 },
  title: { color: SOLV.ink, fontFamily: F.bold, fontSize: 16, lineHeight: 20 },
  sub: { color: SOLV.sub, fontFamily: F.regular, fontSize: 13, lineHeight: 17, marginTop: 2 },
  close: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  body: { paddingTop: 10, paddingBottom: 8 },
});
