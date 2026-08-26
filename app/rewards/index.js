// fragment_rewards.xml + RewardsFragment.kt + RewardsPagingAdapter.kt
//   toolbar (visible only when showToolbar), 2-column grid, header spanning both columns,
//   footer "Win exciting rewards" card spanning both columns.
import React from 'react';
import { View, Text, Pressable, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScratchCardItem from '../../src/rewards/ScratchCardItem';
import { R, RM } from '../../src/rewards/theme';
import { REWARDS } from '../../src/rewards/data';

export default function MyRewards() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {/* RewardsFragment.newInstance() passes showToolbar = false on the jumbotail flavour,
          so the toolbar is GONE and the list header carries the title. The solv flavour
          forces it visible. */}
      <FlatList
        data={REWARDS}
        keyExtractor={(item) => item.scratchCardId}
        numColumns={2}
        style={{ marginHorizontal: 10 }}
        contentContainerStyle={{ paddingBottom: 32 }}
        columnWrapperStyle={{ justifyContent: 'flex-start' }}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <Text style={styles.headerTitle} allowFontScaling={false}>{RM._my_rewards}</Text>
          </View>
        )}
        ListFooterComponent={() => (
          <View style={styles.footer}>
            <View style={styles.footerCard}>
              <Text style={styles.footerTitle} allowFontScaling={false}>{RM._win_exciting_rewards}</Text>
              <Text style={styles.footerSubtitle} allowFontScaling={false}>
                {RM._win_exciting_rewards_description}
              </Text>
              <Pressable onPress={() => router.replace('/')}>
                <Text style={styles.shopNow} allowFontScaling={false}>
                  {RM._win_exciting_rewards_cta_title.toUpperCase()}
                </Text>
              </Pressable>
            </View>
          </View>
        )}
        renderItem={({ item }) => (
          <ScratchCardItem card={item} onPress={() => router.push(`/rewards/${item.scratchCardId}`)} />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: R.defaultBg },
  // card_rewards_header.xml
  header: { paddingTop: 16, paddingBottom: 16 },
  headerTitle: { marginLeft: 16, color: R.darkerGrey, fontSize: 16, lineHeight: 19.2, fontFamily: 'Roboto-Bold' },
  // card_rewards_footer.xml
  footer: { paddingBottom: 32 },
  footerCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: R.green5,
    borderRadius: 8,
    paddingHorizontal: 32,
    paddingVertical: 24,
    alignItems: 'center',
  },
  footerTitle: { color: R.brandGreen, fontSize: 18, lineHeight: 21.6, fontFamily: 'Roboto-Bold' },
  footerSubtitle: {
    marginTop: 8,
    textAlign: 'center',
    color: R.black,
    fontSize: 16, lineHeight: 19.2,
    fontFamily: 'Roboto-Regular',
  },
  shopNow: {
    marginTop: 24,
    alignSelf: 'stretch',
    backgroundColor: R.lightGreen,
    borderRadius: 8,
    textAlign: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
    color: R.white,
    fontFamily: 'Roboto-Bold',
    fontSize: 14, lineHeight: 16.8,
  },
});
