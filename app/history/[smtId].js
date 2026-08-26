// fragment_target_scheme_history.xml + TargetSchemeHistoryFragment.kt
// + view_holder_target_scheme_history.xml / TargetSchemeHistoryViewHolder.kt
//   CREDIT -> light_green amount, DEBIT -> another_red amount.
import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toolbar from '../../src/components/Toolbar';
import VoiceFab from '../../src/components/VoiceFab';
import { C, F } from '../../src/theme';
import { M, SCHEME_HISTORY, indianPrice } from '../../src/data';

export default function TransactionHistory() {
  const { smtId } = useLocalSearchParams();
  const rows = SCHEME_HISTORY[smtId]?.dailyTransactionResponseList ?? [];

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Toolbar title={M._transaction_history} />
      <Text style={styles.title} allowFontScaling={false}>{M._amount_contributed}</Text>
      <FlatList
        data={rows}
        keyExtractor={(item) => String(item.date)}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.rowTitle} allowFontScaling={false}>{item.labelString}</Text>
            <Text
              style={[styles.rowAmount, { color: item.transactionType === 'DEBIT' ? C.anotherRed : C.lightGreen }]}
              allowFontScaling={false}
            >
              {indianPrice(item.value)}
            </Text>
          </View>
        )}
      />
      <VoiceFab />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.white },
  title: {
    marginHorizontal: 10,
    marginVertical: 20,
    paddingBottom: 20,
    fontFamily: F.regular,
    fontSize: 14, lineHeight: 16.8,
    color: C.black,
  },
  row: {
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: C.greyText,
    paddingHorizontal: 15,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowTitle: { flex: 1, fontFamily: F.medium, fontSize: 14, lineHeight: 16.8, color: C.textPrimary },
  rowAmount: { fontFamily: F.medium, fontSize: 14, lineHeight: 16.8 },
});
