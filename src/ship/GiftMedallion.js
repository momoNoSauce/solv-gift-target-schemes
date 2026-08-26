// A gift medallion: the product photo in a white circle that hangs from the progress
// bar where a flag used to be. Reference: Shopee's task track (reward badges on the
// bar), Ulta's tick labels. THREE states, because the scheme pays one gift and the
// medallions must say which:
//   won     blue ring, GREEN check, full photo. The gift going home. The check is
//           the card's ONLY badge, so the badge itself is the one-gift rule.
//   passed  grey ring, photo dimmed, NO badge. Crossed, then out-climbed. Dimming
//           alone says out-of-play; any checkmark near a gift whispers "you get
//           this", so the passed state carries none.
//   open    grey ring, FULL-COLOUR photo, no badge. Still worth wanting, so it is
//           never washed out.
// A tier without a photo falls back to its line glyph, same ring rules.
import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { C } from '../theme';
import { SOLV } from '../gifts/solv';
import GiftGlyph from '../gifts/icons';

export const BADGE = 16;

export default function GiftMedallion({ tier, state, achieved, size = 44, dark = false }) {
  // `achieved` kept as a legacy alias for callers that predate the three states.
  const st = state ?? (achieved ? 'won' : 'open');
  const ring =
    st === 'won' ? SOLV.blue : dark ? 'rgba(255,255,255,0.45)' : '#D8D8D8';
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={[
          styles.circle,
          { width: size, height: size, borderRadius: size / 2, borderColor: ring },
        ]}
      >
        {tier.image ? (
          <Image
            source={tier.image}
            style={{
              width: size - 10,
              height: size - 10,
              borderRadius: (size - 10) / 2,
              opacity: st === 'passed' ? 0.5 : 1,
            }}
            resizeMode="contain"
          />
        ) : (
          <GiftGlyph
            kind={tier.icon || 'gift'}
            size={size * 0.5}
            color={st === 'passed' ? '#B9B9B9' : C.greyTextDark}
            strokeWidth={1.7}
          />
        )}
        {/* a 1px black-alpha outline keeps light product shots from melting into the circle */}
        <View
          pointerEvents="none"
          style={[styles.photoOutline, { borderRadius: size / 2 }]}
        />
      </View>
      {st === 'won' ? (
        <View style={styles.badge}>
          <Svg width={9} height={9} viewBox="0 0 12 12">
            <Path d="M2 6.2l2.8 2.8L10 3.4" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </Svg>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    backgroundColor: '#fff',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoOutline: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: BADGE,
    height: BADGE,
    borderRadius: BADGE / 2,
    backgroundColor: SOLV.green,
    borderWidth: 1.5,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
