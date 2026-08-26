// card_product_group_item.xml — the product card that carries the Jumbocash tags.
// The card includes card_label_tag_curved_layout at the top left and
// below_image_card_label_tag_layout under the 120dp image. Tag text, text colour and
// background colour are backend driven (ProductCardLabelTagHandler + ProductWrapper).
// The cart row uses card_label_tag_layout, the square-cornered variant of the same tag.
import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { C, F } from '../../src/theme';
import { L12, L14 } from '../../src/textMetrics';
import { REMOTE } from '../../src/remoteAssets';
import { JUMBOCASH_TAG_ICON } from '../../src/jumbocash/tagIcon';

function TagIcon({ width = 20 }) {
  return (
    <Svg width={width} height={(width * 12) / 20} viewBox={JUMBOCASH_TAG_ICON.viewBox}>
      <Defs>
        <LinearGradient id="jcTag" x1="10" y1="0" x2="10" y2="12.15" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#FFFFFF" />
          <Stop offset="1" stopColor="#EEFBEB" />
        </LinearGradient>
      </Defs>
      {/* path 0: white -> #EEFBEB gradient note, path 1: #0c9700 inner note, path 2: white glyph */}
      {JUMBOCASH_TAG_ICON.paths.map((d, i) => (
        <Path key={i} d={d} fill={i === 0 ? 'url(#jcTag)' : i === 1 ? '#0c9700' : '#ffffff'} />
      ))}
    </Svg>
  );
}

const PRODUCTS = [
  {
    title: 'Surf Excel Easy Wash detergent powder, 500 g pack',
    mrp: 'MRP  ₹135',
    caseSize: '   |   Case size 24',
    tag: 'Earn ₹10 Jumbocash',
    belowTag: '',
  },
  {
    title: 'Parle-G Original Gluco biscuits, 800 g family pack',
    mrp: 'MRP  ₹90',
    caseSize: '   |   Case size 12',
    tag: 'Earn ₹8 Jumbocash',
    belowTag: '₹8 Jumbocash on this order',
  },
];

export default function ProductCards() {
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView>
        {PRODUCTS.map((p, i) => (
          <View key={i} style={styles.card}>
            {/* card_label_tag_curved_layout: bias 0, so it hugs the card's start edge */}
            <View style={styles.tagCurved}>
              <TagIcon />
              <Text style={styles.tagLabel} numberOfLines={1} allowFontScaling={false}>{p.tag}</Text>
            </View>

            <View style={styles.row}>
              <View>
                <Image source={REMOTE.productPlaceholder} style={styles.image} resizeMode="contain" />
                {p.belowTag ? (
                  <View style={styles.tagBelow}>
                    {/* below_image_card_label_logo is 20x12; the label has maxLines 1 and no
                        ellipsize, so a long label clips instead of showing an ellipsis. */}
                    <View style={styles.tagBelowInner}>
                      <TagIcon />
                      <Text style={styles.tagBelowLabel} allowFontScaling={false}>{p.belowTag}</Text>
                    </View>
                  </View>
                ) : null}
              </View>

              <View style={styles.details}>
                <Text style={styles.title} numberOfLines={3} allowFontScaling={false}>{p.title}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.mrp} allowFontScaling={false}>{p.mrp}</Text>
                  <Text style={styles.caseSize} allowFontScaling={false}>{p.caseSize}</Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.defaultBg },
  card: { backgroundColor: C.white, paddingBottom: 12, marginBottom: 8 },
  row: { flexDirection: 'row' },
  // iv_product_card_image: 120x120, marginStart 12, marginTop 4
  image: { width: 120, height: 120, marginLeft: 12, marginTop: 4 },
  // tv_product_title: marginStart 8 from the image, marginTop 12, 14sp Bold, 3 lines
  details: { flex: 1, marginLeft: 8, marginRight: 8, marginTop: 12 },
  title: { color: C.black, fontSize: 14, lineHeight: L14, fontFamily: F.bold },
  priceRow: { flexDirection: 'row', marginTop: 2 },
  mrp: { color: '#7F7F7F', fontSize: 12, lineHeight: L12, fontFamily: F.regular },
  caseSize: { color: '#7F7F7F', fontSize: 12, lineHeight: L12, fontFamily: F.regular },
  // ic_plv_tag_bg: orange, 12dp on the top-left and bottom-right corners
  tagCurved: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FB9805',
    borderTopLeftRadius: 12,
    borderBottomRightRadius: 12,
    paddingRight: 8,
    paddingLeft: 4,
  },
  tagLabel: { marginLeft: 4, paddingVertical: 2, color: C.white, fontSize: 12, lineHeight: L12, fontFamily: F.bold },
  // ic_below_image_tag_bg: blue_2 #f5f9ff, 4dp radius; the include is 0dp wide, matched to the image
  tagBelow: {
    width: 120,
    marginLeft: 12,
    marginTop: 4,
    backgroundColor: '#f5f9ff',
    borderRadius: 4,
    paddingVertical: 4,
    alignItems: 'center',
    overflow: 'hidden',
  },
  // the inner ConstraintLayout is centred inside the tag
  tagBelowInner: { flexDirection: 'row', alignItems: 'center', flexShrink: 0 },
  tagBelowLabel: { marginLeft: 4, color: '#023D8C', fontSize: 10, lineHeight: 12.0, fontFamily: F.bold },
});
