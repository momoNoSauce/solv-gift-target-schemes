import React from 'react';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { Platform, View, StyleSheet, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { C } from '../src/theme';

// Phone frame for the web build: a modern Android viewport (Pixel-class, 412 x 915
// dp). In a larger browser window the app centers inside the frame on a neutral
// backdrop; in a smaller window it fills what is available. Native is untouched.
const PHONE_W = 412;
const PHONE_H = 915;

// Capture aid, web only. A hidden tab (a background preview pane, a headless
// capture) pauses requestAnimationFrame, which freezes every JS-driven Animated
// value at its first frame. While the document is hidden, frames tick on a
// 16ms timer instead, so a capture sees the same frames a visible tab would.
// A visible tab is untouched.
if (Platform.OS === 'web' && typeof window !== 'undefined' && !window.__rafShim) {
  window.__rafShim = true;
  const raf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = (cb) =>
    typeof document !== 'undefined' && document.hidden ? setTimeout(() => cb(performance.now()), 16) : raf(cb);
}

// Error aid, web only, in dev or with ?errtitle=1: an uncaught error is copied into
// the document title so a browser without a console (Safari driven by AppleScript)
// reveals it.
if (Platform.OS === 'web' && typeof window !== 'undefined' && (__DEV__ || /errtitle/.test(window.location.search)) && !window.__errToTitle) {
  window.__errToTitle = true;
  const report = (m) => {
    window.__lastError = m;
    try { document.title = 'ERR: ' + String(m).slice(0, 600); } catch (e) {}
  };
  window.addEventListener('error', (e) => report((e.message || e.error) + ' @ ' + (e.filename || '') + ':' + e.lineno + ' ' + (e.error && e.error.stack ? e.error.stack.slice(0, 400) : '')));
  window.addEventListener('unhandledrejection', (e) => report('rejection: ' + (e.reason && (e.reason.stack || e.reason.message || e.reason))));
}

// Crisper text on macOS browsers; native ignores this.
if (Platform.OS === 'web' && typeof document !== 'undefined' && !document.getElementById('font-smoothing')) {
  const s = document.createElement('style');
  s.id = 'font-smoothing';
  s.textContent = 'body{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;}';
  document.head.appendChild(s);
}

function PhoneFrame({ children }) {
  const { width, height } = useWindowDimensions();
  if (Platform.OS !== 'web') return children;
  // Round the corners only when the frame floats on the backdrop; a window at
  // phone size or smaller gets the full rectangle.
  const floats = width > PHONE_W && height > PHONE_H;
  return (
    <View style={styles.backdrop}>
      <View style={[styles.phone, !floats && { borderRadius: 0 }]}>{children}</View>
    </View>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    'Roboto-Regular': require('../assets/fonts/Roboto-Regular.ttf'),
    'Roboto-Medium': require('../assets/fonts/Roboto-Medium.ttf'),
    'Roboto-Bold': require('../assets/fonts/Roboto-Bold.ttf'),
  });
  if (!loaded) return <View style={{ flex: 1, backgroundColor: C.white }} />;
  return (
    <PhoneFrame>
      <StatusBar style="light" backgroundColor="#1f3d20" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.defaultBg } }} />
    </PhoneFrame>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: '#26262B', alignItems: 'center', justifyContent: 'center' },
  phone: {
    width: '100%',
    height: '100%',
    maxWidth: PHONE_W,
    maxHeight: PHONE_H,
    backgroundColor: C.white,
    overflow: 'hidden',
    borderRadius: 24,
  },
});
