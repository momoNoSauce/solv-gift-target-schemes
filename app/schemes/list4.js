// The scheme list, eligible products as a table with photos: /schemes/list with
// a photo on each rules row (ProductRules.js RulesTable). Same params.
import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import SchemesList from '../../src/schemes/SchemesList';
import { VIEWS } from '../../src/schemes/registry';

export default function ListTableRoute() {
  const params = useLocalSearchParams();
  const viewKey = VIEWS[params.view] ? params.view : 'typical';
  const brand = params.brand === 'jt' ? 'jt' : 'solv';
  const compare = params.compare === '1';
  const theme = params.theme === 'b' ? 'b' : 'a';
  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" />
      <SchemesList viewKey={viewKey} brand={brand} theme={theme} compare={compare} rulesStyle="table" />
    </View>
  );
}
