// Shippable My Targets: the current UI (toolbar, two tabs, card list) with the gift
// card that shows product photos on the rail. Per the business cut, the member sees
// only the schemes their BG inclusion targets, so the running tab holds two schemes.
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, ScrollView, FlatList, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toolbar from '../../src/components/Toolbar';
import EmptyState from '../../src/components/EmptyState';
import TabLabel from '../../src/components/TabLabel';
import ShipSchemeCard from '../../src/ship/ShipSchemeCard';
import { C, D, F } from '../../src/theme';
import { SOLV } from '../../src/gifts/solv';
import { M } from '../../src/data';
import { SHIP_COHORTS, DEFAULT_COHORT } from '../../src/ship/data';

export default function ShipTargets() {
  const pager = useRef(null);
  const params = useLocalSearchParams();
  // One customer sees one scheme; ?cohort= picks whose view the demo renders.
  // The cohort never appears inside the screen itself.
  const cohort = SHIP_COHORTS[params.cohort] ? params.cohort : DEFAULT_COHORT;
  const { running, completed } = SHIP_COHORTS[cohort];
  const initialTab = Number(params.tab) === 1 ? 1 : 0;
  const [tab, setTab] = useState(initialTab);
  const [pageW, setPageW] = useState(0);
  const router = useRouter();

  // ?tab=1 deep-links the Completed tab; the pager can only honour it once measured.
  useEffect(() => {
    if (pageW > 0 && initialTab === 1) {
      pager.current?.scrollTo({ x: pageW, animated: false });
    }
  }, [pageW, initialTab]);

  const goToTab = (i) => {
    setTab(i);
    pager.current?.scrollTo({ x: i * pageW, animated: true });
  };

  const renderList = (data, withStatesLink) => (
    <View style={{ width: pageW, flex: 1 }}>
      {data.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(x) => x.node.entityId}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: D.cardGap }} />}
          renderItem={({ item }) => (
            <ShipSchemeCard node={item.node} onPress={() => router.push(`/ship/${item.node.entityId}`)} />
          )}
          ListFooterComponent={
            withStatesLink ? (
              <>
                <Pressable style={styles.protoLink} onPress={() => router.push('/ship/states')}>
                  <Text style={styles.protoText} allowFontScaling={false}>Prototype: card states, start to end</Text>
                </Pressable>
                {/* Demo chrome only: switch whose view renders. Never ships. */}
                <View style={styles.cohortRow}>
                  <Text style={styles.cohortLabel} allowFontScaling={false}>View as:</Text>
                  {Object.keys(SHIP_COHORTS).map((k) => (
                    <Pressable key={k} hitSlop={8} onPress={() => router.replace(`/ship?cohort=${k}`)}>
                      <Text
                        style={[styles.cohortText, k === cohort && styles.cohortActive]}
                        allowFontScaling={false}
                      >
                        {k}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </>
            ) : null
          }
        />
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Toolbar title={M._target_scheme || 'My Targets'} color={SOLV.blue} />
      <View style={styles.tabBar}>
        {[M._running_schemes, M._completed_schemes].map((t, i) => (
          <Pressable key={t} style={styles.tab} onPress={() => goToTab(i)} android_ripple={{ color: '#ffffff26' }}>
            <TabLabel label={t.toUpperCase()} />
            {tab === i ? <View style={styles.indicator} /> : null}
          </Pressable>
        ))}
      </View>
      <ScrollView
        ref={pager}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onLayout={(e) => setPageW(e.nativeEvent.layout.width)}
        onMomentumScrollEnd={(e) => (pageW ? setTab(Math.round(e.nativeEvent.contentOffset.x / pageW)) : null)}
        style={{ flex: 1 }}
      >
        {renderList(running, true)}
        {renderList(completed)}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.white },
  tabBar: { height: D.tabHeight, backgroundColor: SOLV.blue, flexDirection: 'row' },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  indicator: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, backgroundColor: C.white },
  list: { paddingHorizontal: D.listPaddingH, paddingTop: D.cardGap, paddingBottom: D.cardGap },
  protoLink: { marginTop: 20, alignItems: 'center' },
  protoText: { fontFamily: F.medium, fontSize: 12, lineHeight: 14.4, color: C.mediumGrey, textDecorationLine: 'underline' },
  cohortRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 12, gap: 12 },
  cohortLabel: { fontFamily: F.regular, fontSize: 12, lineHeight: 14.4, color: C.mediumGrey },
  cohortText: { fontFamily: F.medium, fontSize: 12, lineHeight: 14.4, color: C.mediumGrey, textDecorationLine: 'underline' },
  cohortActive: { color: SOLV.blue, textDecorationLine: 'none' },
});
