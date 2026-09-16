// The target-scheme sheet on the product page. A tap on a scheme row opens
// it for that one scheme: a bottom sheet over the page with the same card the
// Target schemes list shows (src/schemes/SchemesList.js Card: the stage with
// the meter, the footer with the gifts). A tap on the card leaves for the
// scheme's detail page.
//
// The sheet is drawn inside the screen (an absolute overlay), not as a
// window-level modal, so it stays inside the phone frame on a desktop.
//
// Anatomy (Material bottom sheet, as the app's own sheets):
//   scrim      black at 32 %, fades with the sheet
//   sheet      the list's ground, 16 px top radius, a 36 x 4 handle, slides up
//              on a spring (stiffness 260, damping 30, no bounce), drags down
//              to close
//   header     "Target scheme" (16 bold), "Buying this product counts toward
//              it" (13 sub), a close disc on the right
//   body       the card; scrolls only when the frame is shorter than the card
//   bottom     the safe-area inset
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Animated, Easing, PanResponder } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { F } from '../theme';
import { SOLV } from '../gifts/solv';
import { Card, CHROME } from '../schemes/SchemesList';
import { T } from '../schemes/copy';
import { SETTLED } from '../schemes/motion';

export default function SchemeSheet({ scheme, indexOf, onClose, brand = 'solv' }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const open = Boolean(scheme);
  const [shown, setShown] = useState(scheme);
  const [mounted, setMounted] = useState(open);
  const y = useRef(new Animated.Value(1)).current;        // 1: off screen, 0: in place
  const t = T.en;
  const chrome = CHROME[brand] || CHROME.solv;

  useEffect(() => {
    if (open) {
      setShown(scheme);
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

  if (!mounted || !shown) return null;
  const translateY = Animated.add(y.interpolate({ inputRange: [0, 1], outputRange: [0, 760] }), drag);
  const scrim = y.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });

  const goTo = () => {
    onClose();
    router.push(`/schemes?i=${indexOf(shown)}`);
  };

  return (
    <View style={styles.root} pointerEvents="box-none">
        <Animated.View style={[styles.scrim, { opacity: scrim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
        </Animated.View>
        <Animated.View style={[styles.sheet, { maxHeight: '92%', paddingBottom: insets.bottom + 8, transform: [{ translateY }] }]}>
          <View {...pan.panHandlers} dataSet={{ touch: 'pan-y' }}>
            <View style={styles.handle} />
            <View style={styles.header}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title} allowFontScaling={false}>Target scheme</Text>
                <Text style={styles.sub} allowFontScaling={false}>Buying this product counts toward it</Text>
              </View>
              <Pressable onPress={onClose} style={styles.close} hitSlop={8} accessibilityRole="button" accessibilityLabel="Close">
                <Svg width={18} height={18} viewBox="0 0 24 24">
                  <Path d="M6 6l12 12M18 6L6 18" stroke={SOLV.ink} strokeWidth={2.2} strokeLinecap="round" />
                </Svg>
              </Pressable>
            </View>
          </View>
          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false} bounces={false}>
            <Card scheme={shown} t={t} chrome={chrome} onPress={goTo} />
          </ScrollView>
        </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', zIndex: 50 },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.32)' },
  sheet: { backgroundColor: SOLV.listBg, borderTopLeftRadius: 16, borderTopRightRadius: 16, overflow: 'hidden' },
  handle: { alignSelf: 'center', width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(17,24,39,0.18)', marginTop: 8 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 6 },
  title: { color: SOLV.ink, fontFamily: F.bold, fontSize: 16, lineHeight: 20 },
  sub: { color: SOLV.sub, fontFamily: F.regular, fontSize: 13, lineHeight: 17, marginTop: 2 },
  close: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  body: { paddingTop: 10, paddingBottom: 8 },
});
