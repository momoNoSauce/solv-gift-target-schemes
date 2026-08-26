// QuizBottomSheetFragment, QuizDisabledBottomSheetFragment and JixSurveyBottomSheetFragment
// are BottomSheetDialogFragments: the sheet sits over whatever screen you were on, behind the
// standard scrim, with no toolbar of its own.
import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function Sheet({ children, style }) {
  const router = useRouter();
  return (
    <View style={styles.root}>
      <Pressable style={styles.scrim} onPress={() => router.back()} />
      <View style={[styles.sheet, style]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  // Widget.MaterialComponents.BottomSheet scrim: black at 32%
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.32)' },
  sheet: { backgroundColor: '#ffffff', borderTopLeftRadius: 12, borderTopRightRadius: 12, maxHeight: '92%' },
});
