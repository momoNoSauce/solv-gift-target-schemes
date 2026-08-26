// Flow A: the Mega Diwali gift scheme inside the current My Targets paradigm.
// Same chrome as app/targets.js (toolbar, 2 tabs, card list). Only the data and the
// card component change. This flow answers: "if we ship gifts on the existing target
// scheme stack, what does the customer see?"
//
// One customer is enrolled in one category scheme (BG inclusion decides which), so
// the running list holds one card. What the paradigm forces here:
//   - milestone_1..4 caps the ladder at 4 slabs, so the 8-slab Diwali ladder is cut.
//   - 4 milestone markers crowd the TSWP card; the layout was drawn for 2-3.
import React, { useRef, useState } from 'react';
import { View, Text, Pressable, ScrollView, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toolbar from '../../src/components/Toolbar';
import GiftSchemeCard from '../../src/gifts/GiftSchemeCard';
import EmptyState from '../../src/components/EmptyState';
import { C, D, F } from '../../src/theme';
import TabLabel from '../../src/components/TabLabel';
import { M } from '../../src/data';
import { GIFT_RUNNING_SCHEMES, GIFT_COMPLETED_SCHEMES, GM } from '../../src/gifts/data';

export default function GiftTargets() {
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

  const renderList = (data, withStatesLink) => (
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
            <GiftSchemeCard node={item} onPress={() => router.push(`/gift-targets/${item.entityId}`)} />
          )}
          ListFooterComponent={
            withStatesLink ? (
              <Pressable style={styles.protoLink} onPress={() => router.push('/gift-targets/states')}>
                <Text style={styles.protoText} allowFontScaling={false}>
                  Prototype: card states, start to end
                </Text>
              </Pressable>
            ) : null
          }
        />
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Toolbar title={GM._gift_targets_title} />
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
        {renderList(GIFT_RUNNING_SCHEMES, true)}
        {renderList(GIFT_COMPLETED_SCHEMES)}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.white },
  tabBar: { height: D.tabHeight, backgroundColor: C.brandGreen, flexDirection: 'row' },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  indicator: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, backgroundColor: C.white },
  list: { paddingHorizontal: D.listPaddingH, paddingTop: D.cardGap, paddingBottom: D.cardGap },
  protoLink: { marginTop: 20, alignItems: 'center' },
  protoText: { fontFamily: F.medium, fontSize: 12, lineHeight: 14.4, color: C.mediumGrey, textDecorationLine: 'underline' },
});
