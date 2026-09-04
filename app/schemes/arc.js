// Option A, the detail: the sheet and the arc. See src/schemes/ArcScreen.js.
// ?view=typical|start|over|many|empty, ?i=, ?pos=, ?static=1, ?demo=1.
import React, { useMemo } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import ArcScreen from '../../src/schemes/ArcScreen';
import { schemesFor, VIEWS } from '../../src/schemes/registry';

export default function ArcRoute() {
  const params = useLocalSearchParams();
  const viewKey = VIEWS[params.view] ? params.view : 'typical';
  const schemes = useMemo(() => schemesFor(viewKey), [viewKey]);
  const n = schemes.length;
  const initial = Math.min(Math.max(0, Number(params.i) || 0), Math.max(0, n - 1));
  const pinned = params.pos != null && params.pos !== '' && Number.isFinite(Number(params.pos)) ? Number(params.pos) : null;
  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" />
      <ArcScreen schemes={schemes} viewKey={viewKey} initialIndex={initial} pinned={pinned} demo={params.demo === '1'} />
    </View>
  );
}
