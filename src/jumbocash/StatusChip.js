// StatusChipBinder.kt: rounded 6dp chip, background + 1dp border from the API colours,
// optional icon, 10sp text in the ledger row and 12sp in the header.
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { F } from '../theme';

export default function StatusChip({ status, size = 'small' }) {
  if (!status || !status.text) return null;
  const small = size === 'small';
  return (
    <View
      style={[
        styles.chip,
        small ? styles.chipSmall : styles.chipLarge,
        { backgroundColor: status.backgroundColor || 'transparent', borderColor: status.borderColor || 'transparent' },
      ]}
    >
      <Text style={[styles.text, { fontSize: small ? 10 : 12 }]} allowFontScaling={false}>
        {status.text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center', borderRadius: 6, borderWidth: 1, alignSelf: 'flex-start' },
  chipSmall: { paddingHorizontal: 4, paddingVertical: 2 },
  chipLarge: { paddingHorizontal: 6, paddingVertical: 2 },
  text: { color: '#000000', fontFamily: F.regular },
});
