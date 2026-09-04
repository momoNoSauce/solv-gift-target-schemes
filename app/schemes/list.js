// The scheme list: ?opt=a (arc detail) or ?opt=b (dock detail), ?view= scenario.
import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import SchemesList from '../../src/schemes/SchemesList';
import { VIEWS } from '../../src/schemes/registry';

export default function ListRoute() {
  const params = useLocalSearchParams();
  const opt = params.opt === 'b' ? 'b' : 'a';
  const viewKey = VIEWS[params.view] ? params.view : 'typical';
  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" />
      <SchemesList opt={opt} viewKey={viewKey} />
    </View>
  );
}
