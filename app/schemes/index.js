// Option B, the detail: full-screen pages and the glass dock. See
// src/schemes/DockScreen.js. ?view=, ?i=, ?pos=, ?static=1, ?demo=1.
import React, { useMemo } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import DockScreen from '../../src/schemes/DockScreen';
import { schemesFor, VIEWS } from '../../src/schemes/registry';

export default function DockRoute() {
  const params = useLocalSearchParams();
  const viewKey = VIEWS[params.view] ? params.view : 'typical';
  // ?brand=jt paints default schemes in the Jumbotail theme (?theme=b for Meadow).
  const defaultTheme = params.brand === 'jt' ? (params.theme === 'b' ? 'jtB' : 'jtA') : 'default';
  const schemes = useMemo(() => schemesFor(viewKey, { defaultTheme }), [viewKey, defaultTheme]);
  const n = schemes.length;
  const initial = Math.min(Math.max(0, Number(params.i) || 0), Math.max(0, n - 1));
  const pinned = params.pos != null && params.pos !== '' && Number.isFinite(Number(params.pos)) ? Number(params.pos) : null;
  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" />
      <DockScreen schemes={schemes} viewKey={viewKey} initialIndex={initial} pinned={pinned} demo={params.demo === '1'} />
    </View>
  );
}
