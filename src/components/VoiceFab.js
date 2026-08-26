// ic_voice_fab_button.xml: FloatingActionButton 48x48, backgroundTint blue_1,
// borderWidth 2dp, elevation 4dp, margins from fab_btn_margin dimens.
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { C } from '../theme';
import { IconAudioBlue2 } from '../icons';

export default function VoiceFab() {
  return (
    <Pressable style={styles.fab} android_ripple={{ color: '#ffffff33', borderless: true }}>
      <IconAudioBlue2 />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    // include margins: fab_btn_margin_from_other_three_sides = 16dp,
    // minimum_fab_btn_margin_from_bottom_bars = 56dp
    position: 'absolute',
    right: 16,
    bottom: 56,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: C.blue1,
    borderWidth: 2,
    borderColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
});
