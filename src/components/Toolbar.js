// androidx.appcompat.widget.Toolbar inside AppBarLayout:
// height toolbar_height (48dp), background brand_green, navigationIcon default_nav_icon_back,
// contentInsetStartWithNavigation 0dp, titleMarginStart 12dp, AppBarOverlay = Dark.ActionBar (white title).
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { C, F, D } from '../theme';
import { IconBack } from '../icons';

export default function Toolbar({ title, elevation = 0, color }) {
  const router = useRouter();
  return (
    <View style={[styles.appBar, color ? { backgroundColor: color } : null, elevation > 0 && styles.elevated]}>
      <Pressable style={styles.nav} onPress={() => router.back()} android_ripple={{ color: '#ffffff33', borderless: true }}>
        <IconBack size={24} color={C.white} />
      </Pressable>
      <Text style={styles.title} numberOfLines={1} allowFontScaling={false}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  appBar: {
    height: D.toolbarHeight,
    backgroundColor: C.brandGreen,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
  },
  elevated: {
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  nav: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  // TextAppearance.Widget.AppCompat.Toolbar.Title: 20sp, sans-serif-medium
  title: { marginLeft: 12, color: C.white, fontFamily: F.medium, fontSize: 20, lineHeight: 24.0, flex: 1 },
});
