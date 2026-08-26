// /partials/time-line.html + TimeLineCtrl.
// Stages CLAIMED > CONFIRMED > SHIPPED > DELIVERED, or CLAIMED > CANCELLED.
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { SC, F } from './theme';
import { IMG } from './assets';

const STAGES = ['CLAIMED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

export default function TimeLine({ current }) {
  const cancelled = current === 'CANCELLED';
  const stages = cancelled ? ['CLAIMED', 'CANCELLED'] : STAGES;
  const idx = stages.indexOf(current);
  const width = idx > 0 ? idx * (100 / (stages.length - 1)) : 0;

  return (
    <View style={{ paddingTop: 15 }}>
      <View style={styles.barWrap}>
        <View style={styles.backBar} />
        <View style={[styles.innerBar, { width: `${width}%` }]} />
      </View>

      {cancelled ? (
        <View style={styles.row}>
          <View style={styles.box}>
            <Image source={IMG.success} style={styles.dotImg} resizeMode="contain" />
            <Text style={[styles.label, styles.done]} allowFontScaling={false}>CONFIRMED</Text>
          </View>
          <View style={styles.box} />
          <View style={styles.box} />
          <View style={styles.box}>
            <Image source={IMG.noSuccess} style={styles.dotImg} resizeMode="contain" />
            <Text style={[styles.label, { color: 'red' }]} allowFontScaling={false}>CANCELLED</Text>
          </View>
        </View>
      ) : (
        <View style={styles.row}>
          {STAGES.map((name, i) => {
            const done = idx >= i;
            return (
              <View key={name} style={styles.box}>
                {done ? (
                  <Image source={IMG.success} style={styles.dotImg} resizeMode="contain" />
                ) : (
                  <View style={styles.dot} />
                )}
                <Text style={[styles.label, done ? styles.done : styles.notDone]} allowFontScaling={false}>{name}</Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  barWrap: { width: '75%', alignSelf: 'center', marginBottom: -15 },
  backBar: { height: 2, backgroundColor: SC.grey },
  innerBar: { height: 2, backgroundColor: SC.green, marginTop: -2, borderRadius: 2 },
  row: { flexDirection: 'row' },
  // .time-status-box { display:inline-block; text-align:center; width:25% }
  box: { width: '25%', alignItems: 'center' },
  dotImg: { width: 20, height: 20 },
  dot: { height: 20, width: 20, backgroundColor: SC.grey, borderRadius: 10 },
  label: { fontSize: 11, fontFamily: F.medium, letterSpacing: 0.1 },
  done: { color: SC.green },
  notDone: { color: 'gray' },
});
