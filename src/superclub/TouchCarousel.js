// /partials/touch-carousel.html + TouchCarouselCtrl.
// .activity-item { width:320px; margin-right:15px } and the controller shifts the
// track by 335px per swipe; the ovals row mirrors the selected index.
import React, { useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SC, F } from './theme';
import MilestoneActivity from './MilestoneActivity';

const ITEM_W = 320;
const STEP = 335; // 320 + 15 margin

export default function TouchCarousel({ targets, onViewProducts }) {
  const [index, setIndex] = useState(0);
  const scroller = useRef(null);

  const goTo = (i) => {
    setIndex(i);
    scroller.current?.scrollTo({ x: i * STEP, animated: true });
  };

  return (
    <View>
      <Text style={styles.pageName} allowFontScaling={false}>Your Activity</Text>
      <View style={{ paddingLeft: 15 }}>
        {/* .activities-carousel-box { padding: 0 1px 10px } */}
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 1, paddingBottom: 10 }}
          ref={scroller}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={STEP}
          decelerationRate="fast"
          onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / STEP))}
        >
          {targets.map((t) => (
            <View key={t.targetId} style={styles.item}>
              <MilestoneActivity target={t} onViewProducts={() => onViewProducts(t)} />
            </View>
          ))}
        </ScrollView>
      </View>
      <View style={styles.ovals}>
        {targets.map((t, i) => (
          <Pressable key={t.targetId} onPress={() => goTo(i)}>
            <View style={[styles.oval, index === i && styles.ovalActive]} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // .page-name-new
  pageName: {
    fontSize: 16,
    lineHeight: 24,
    color: SC.pageName,
    fontFamily: F.bold,
    padding: 14,
    textAlign: 'center', letterSpacing: 0.1 },
  item: { width: ITEM_W, marginRight: 15 },
  ovals: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingTop: 8 },
  // .image-oval
  oval: { borderWidth: 1, borderColor: SC.black, borderRadius: 4, height: 8, width: 8, marginHorizontal: 4, opacity: 0.5 },
  ovalActive: { backgroundColor: SC.black },
});
