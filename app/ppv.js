// The product page (PPV). ?as=prod shows the production offer chip in place
// of the scheme card.
import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import PpvScreen from '../src/ppv/PpvScreen';

export default function PpvRoute() {
  const params = useLocalSearchParams();
  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" />
      <PpvScreen as={params.as === 'prod' ? 'prod' : 'design'} />
    </View>
  );
}
