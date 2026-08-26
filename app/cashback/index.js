// The cashback cards are browse cards (COC / CAOC) rendered by CashbackCardLayout inside a
// browse page — cashback_layout.xml is just a RecyclerView, so there is no toolbar here.
import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CashbackCard from '../../src/cashback/CashbackCard';
import { CASHBACK_NODE, CASHBACK_APPLIED_NODE } from '../../src/cashback/data';
import { C } from '../../src/theme';

export default function CashbackScreen() {
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingVertical: 8 }}>
        <CashbackCard node={CASHBACK_NODE} />
        <View style={{ height: 12 }} />
        <CashbackCard node={CASHBACK_APPLIED_NODE} onViewAll={() => {}} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: C.defaultBg } });
