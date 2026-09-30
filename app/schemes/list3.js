// The scheme list, eligible sellers: /schemes/list with the rules
// card drawn as the one eligible seller, no ineligible group (ProductRules.js SellerRules). Same params.
import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import SchemesList from '../../src/schemes/SchemesList';
import { VIEWS } from '../../src/schemes/registry';

export default function ListSellersRoute() {
  const params = useLocalSearchParams();
  const viewKey = VIEWS[params.view] ? params.view : 'typical';
  const brand = params.brand === 'jt' ? 'jt' : 'solv';
  const compare = params.compare === '1';
  const theme = params.theme === 'b' ? 'b' : 'a';
  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" />
      <SchemesList viewKey={viewKey} brand={brand} theme={theme} compare={compare} rulesStyle="sellers" />
    </View>
  );
}
