// index.html: <div ng-show="$root.load"> with the text centred at top:55%, 16px #000.
// AppCtrl sets $root.load while the deals / claimed / transactions calls are in flight.
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SC, F } from './theme';

export default function Loading() {
  return (
    <View style={styles.root} pointerEvents="none">
      <Text style={styles.text} allowFontScaling={false}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFillObject, backgroundColor: SC.pageBg },
  text: {
    position: 'absolute',
    top: '55%',
    width: '100%',
    textAlign: 'center',
    fontSize: 16,
    color: '#000000',
    fontFamily: F.regular,
    letterSpacing: 0.1,
  },
});
