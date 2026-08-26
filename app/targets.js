// fragment_target_scheme_new.xml + TargetSchemeFragmentNew.kt
//   AppBarLayout(elevation 0) + Toolbar(brand_green, title _target_scheme)
//   TabLayout(brand_green, indicator white 3dp, tabTextColor white) with 2 tabs
//   ViewPager2 -> TargetSchemeRunningFragment (uiNode running_target_scheme)
//                 TargetSchemePastFragment    (uiNode completed_target_scheme)
import React, { useRef, useState } from 'react';
import { View, Text, Pressable, ScrollView, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toolbar from '../src/components/Toolbar';
import VoiceFab from '../src/components/VoiceFab';
import TargetSchemeCard from '../src/components/TargetSchemeCard';
import EmptyState from '../src/components/EmptyState';
import { C, F, D } from '../src/theme';
import TabLabel from '../src/components/TabLabel';
import { M, RUNNING_SCHEMES, COMPLETED_SCHEMES } from '../src/data';

export default function MyTargets() {
  // ViewPager2 lays its pages out against its own width. Reading the window
  // instead overflows the pager whenever the two differ: a web phone frame, an
  // Android split screen, a foldable's inner display.
  const [pageW, setPageW] = useState(0);
  const pager = useRef(null);
  const [tab, setTab] = useState(0);
  const router = useRouter();

  const goToTab = (i) => {
    setTab(i);
    pager.current?.scrollTo({ x: i * pageW, animated: true });
  };

  const renderList = (data) => (
    <View style={{ width: pageW, flex: 1 }}>
      {data.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.entityId}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: D.cardGap }} />}
          renderItem={({ item }) => (
            <TargetSchemeCard node={item} onPress={() => router.push(`/scheme/${item.entityId}`)} />
          )}
        />
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Toolbar title={M._target_scheme} />
      <View style={styles.tabBar}>
        {[M._running_schemes, M._completed_schemes].map((t, i) => (
          <Pressable
            key={t}
            style={styles.tab}
            onPress={() => goToTab(i)}
            android_ripple={{ color: '#ffffff26' }}
          >
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
        {renderList(RUNNING_SCHEMES)}
        {renderList(COMPLETED_SCHEMES)}
      </ScrollView>
      <VoiceFab />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.white },
  tabBar: { height: D.tabHeight, backgroundColor: C.brandGreen, flexDirection: 'row' },
  // TabLayout default tabPaddingStart/End is 12dp
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  // TextAppearance.Design.Tab: 14sp, sans-serif-medium, textAllCaps
  indicator: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, backgroundColor: C.white },
  // fragment_target_scheme_running.xml paddingHorizontal _10sdp; ListItemDecoration adds 12dp
  // above the first row and below the last row.
  list: { paddingHorizontal: D.listPaddingH, paddingTop: D.cardGap, paddingBottom: D.cardGap },
});
