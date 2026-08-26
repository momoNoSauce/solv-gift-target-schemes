// fragment_super_club.xml + SuperClubFragment.java: the native wrapper the SuperClub
// web app runs inside. Toolbar is brand_green with cross_button_white and the title
// _super_club ("SuperClub"); the progress_bar_large shows until the page finishes loading.
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { C, F, D } from '../theme';

function IconCross({ size = 24, color = C.white }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill={color}
        d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
      />
    </Svg>
  );
}

export default function WebViewShell({ title, children }) {
  const router = useRouter();
  return (
    <View style={styles.root}>
      <View style={styles.toolbar}>
        <Pressable onPress={() => router.replace('/')} hitSlop={8} style={styles.nav}>
          <IconCross />
        </Pressable>
        <Text style={styles.title} numberOfLines={1} allowFontScaling={false}>{title}</Text>
      </View>
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.white },
  toolbar: {
    minHeight: D.toolbarHeight,
    backgroundColor: C.brandGreen,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
  },
  nav: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  title: { marginLeft: 12, color: C.white, fontFamily: F.medium, fontSize: 20, lineHeight: 24.0, flex: 1 },
});
