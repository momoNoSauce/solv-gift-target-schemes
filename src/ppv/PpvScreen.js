// The Solv product page (PPV), as the Android app draws it today, with the
// target-scheme card the founders are reviewing slotted into its card stack.
//
// The page is the v2 product details screen (productsv2/details/
// ProductGroupDetailsFragment, gated by showProductVariantUx), redrawn from
// its layouts on a 360 dp phone where _Nsdp == N dp:
//   fragment_product_group_page.xml        toolbar 48, blue; the list; the cart bar
//   viewholder_product_group_details.xml   position 0, the whole static block:
//     header (title 16 bold, rating, the "N MORE VARIETIES" pill)
//     product_select_bar.xml               the variant chips (44 px pills), dots
//     product_info_layout                  edge to edge, 1 px #CCC, square:
//                                          tag ribbon, label 18, images 240 tall,
//                                          offer chips (card_jt_offer_v2)
//     12 px gap
//     product_sub_total_bar_new.xml        the green SUBTOTAL strip (qty > 0)
//     order_info_layout                    product_select_qty_bar_v2: MRP/Pc,
//                                          PRICE/Pc, price 24 bold, margin,
//                                          ADD or the stepper; then DELIVERY
//     credit_view_product_fragment.xml     CREDIT card
//     seller_info_layout                   SELLER card
//   positions 1..n                         server UI nodes; here one
//                                          "Frequently bought together" strip
//   cart_status_bar_with_nudge.xml         the sticky GO TO CART bar
//
// Target schemes today (production): an offer chip "TARGET SCHEME" among the
// offers, opening a dialog. ?as=prod shows that. The design (default) puts a
// small scheme card under the order card instead; a tap opens the scheme
// sheet (SchemeSheet.js) with the list's own card, which opens the detail.
import React, { useMemo, useState } from 'react';
import { View, Text, Image, Pressable, ScrollView, StyleSheet, StatusBar as RNStatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { F } from '../theme';
import { IconBack, IconHome } from '../icons';
import { schemesFor } from '../schemes/registry';
import { PRODUCT, CART } from './product';
import SchemeNodeCard from './SchemeNodeCard';
import SchemeSheet from './SchemeSheet';

// Solv colours, resolved from app/src/solv/res/values/colors.xml over the base.
const P = {
  toolbar: '#004FFA',      // brand_green -> Solv
  brand: '#004FFA',        // brand_color
  accent: '#0066FF',       // light_green -> Solv: margin, MRP heading, chips, cart bar
  page: '#F7F7F7',         // default_bg_color
  border: '#CCCCCC',       // grey_3
  black: '#000000',
  white: '#FFFFFF',
  greyText: '#7F7F7F',
  greyTextDark: '#333333',
  grey8: '#999999',
  lightGrey1: '#b1b1b1',
  lightGrey2: '#b3b3b3',
  greyishWhite: '#dfdfdf',
  greyBg: '#ebebeb',
  orange: '#FB9805',       // tag ribbon
  subtotal: '#58a159',     // subtotal_green, kept green on Solv
  addRed: '#D55D38',       // red_2, the ADD button
  stepRed: '#D55D3B',      // the +/- circles
  badge: '#ff7711',        // indicator_background_color
  star: '#FEC74B',         // yellow_pale_1
  black50: 'rgba(0,0,0,0.5)',
};

const rupee = (n) => '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 2 });

// Material glyphs the layouts use.
const G = {
  search: 'M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z',
  share: 'M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z',
  cart: 'M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0 0 20 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z',
  doubleArrow: 'M15.5 5H11l5 7-5 7h4.5l5-7z M8.5 5H4l5 7-5 7h4.5l5-7z',
  truck: 'M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9 1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z',
  notes: 'M3 18h12v-2H3v2zM3 6v2h18V6H3zm0 7h18v-2H3v2z',
  credit: 'M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z',
  chevron: 'M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z',
  plus: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z',
  minus: 'M19 13H5v-2h14v2z',
  forward: 'M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z',
  star: 'M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z',
  check: 'M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
};
const Glyph = ({ d, size = 24, color }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24"><Path d={d} fill={color} /></Svg>
);

export default function PpvScreen({ as = 'design' }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [qty, setQty] = useState(0);
  const [sheet, setSheet] = useState(null);      // the scheme whose sheet is open
  const all = useMemo(() => schemesFor('typical'), []);
  const schemes = useMemo(() => PRODUCT.appliesTo.map((id) => all.find((s) => s.id === id)).filter(Boolean), [all]);
  const indexOf = (sc) => all.findIndex((s) => s.id === sc.id);
  const cartItems = CART.items + (qty > 0 ? 1 : 0);
  const cartAmount = CART.amount + qty * PRODUCT.price;
  const prod = as === 'prod';

  return (
    <View style={styles.root}>
      <RNStatusBar barStyle="light-content" />
      {/* Toolbar: 48 dp, brand blue, back, the home logo, the brand as title, search, share, cart. */}
      <View style={[styles.toolbar, { paddingTop: insets.top, height: 48 + insets.top }]}>
        <Pressable onPress={() => router.back()} style={styles.tbHit} accessibilityRole="button" accessibilityLabel="Back">
          <IconBack size={24} color={P.white} />
        </Pressable>
        <Pressable style={styles.tbHit} accessibilityLabel="Home">
          <IconHome size={24} color={P.white} />
        </Pressable>
        <Text style={styles.tbTitle} numberOfLines={1} allowFontScaling={false}>{PRODUCT.brand}</Text>
        <Pressable style={styles.tbHit} accessibilityLabel="Search"><Glyph d={G.search} color={P.white} /></Pressable>
        <Pressable style={styles.tbHit} accessibilityLabel="Share"><Glyph d={G.share} color={P.white} /></Pressable>
        <Pressable style={styles.tbHit} accessibilityLabel="Go to cart">
          <Glyph d={G.cart} color={P.white} />
          <View style={styles.tbBadge}><Text style={styles.tbBadgeText} allowFontScaling={false}>{cartItems}</Text></View>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 + 70 + insets.bottom }} showsVerticalScrollIndicator={false}>
        {/* 5.1 Header */}
        <View style={styles.header}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.title} allowFontScaling={false}>{PRODUCT.title}</Text>
            <View style={styles.ratingRow}>
              <Text style={styles.ratingText} allowFontScaling={false}>{PRODUCT.rating.toFixed(1)}</Text>
              <View style={styles.stars}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <Glyph key={i} d={G.star} size={12} color={i < Math.round(PRODUCT.rating) ? P.star : P.lightGrey2} />
                ))}
              </View>
            </View>
          </View>
          <View style={styles.varietiesWrap}>
            <Svg width={12} height={16} viewBox="0 0 24 24"><Path d={G.doubleArrow} fill={P.lightGrey1} /></Svg>
            <Pressable style={styles.varietiesBtn}>
              <Text style={styles.varietiesLabel} allowFontScaling={false}>{`${PRODUCT.moreVarieties} MORE\nVARIETIES`}</Text>
            </Pressable>
          </View>
        </View>

        {/* 5.2 Variant chips */}
        <View style={styles.chipStrip}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12 }}>
            {PRODUCT.variants.map((v) => (
              <View key={v.value} style={styles.chipWrap}>
                <View style={styles.chip}>
                  <Text style={[styles.chipLabel, v.selected && { color: P.accent }]} allowFontScaling={false}>{v.label}</Text>
                  <Text style={[styles.chipValue, v.selected && { color: P.accent }]} allowFontScaling={false}>{v.value}</Text>
                </View>
                {v.selected ? <View style={styles.chipPointer} /> : <View style={{ height: 16 }} />}
              </View>
            ))}
          </ScrollView>
          <View style={styles.dots}>
            {PRODUCT.variants.map((v) => <View key={v.value} style={[styles.dot, v.selected ? styles.dotOn : styles.dotOff]} />)}
          </View>
        </View>

        {/* 5.3 Product info card: edge to edge, square, 1 px border */}
        <View style={styles.infoCard}>
          <View style={styles.tag}>
            <Image source={require('../../assets/remote/jumbocash_offer_small.png')} style={{ width: 20, height: 12 }} resizeMode="contain" />
            <Text style={styles.tagText} allowFontScaling={false}>₹20 JUMBOCASH</Text>
          </View>
          <Text style={styles.variantLabel} allowFontScaling={false}>{PRODUCT.variantLabel}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imagesRow}>
            {PRODUCT.images.map((src, i) => (
              <View key={i} style={styles.imageBox}><Image source={src} style={styles.image} resizeMode="contain" /></View>
            ))}
          </ScrollView>
          {/* 6 Offer chips, wrapping */}
          <View style={styles.offers}>
            {prod ? (
              <View style={styles.offerChip}>
                <Image source={require('../../assets/remote/target_offer_small.png')} style={styles.offerLogo} resizeMode="stretch" />
                <Text style={styles.offerTitle} allowFontScaling={false}>TARGET SCHEME</Text>
              </View>
            ) : null}
            {PRODUCT.offers.map((o) => (
              <View key={o.id} style={styles.offerChip}>
                <Image source={o.logo} style={styles.offerLogo} resizeMode="stretch" />
                <Text style={styles.offerTitle} allowFontScaling={false}>{o.title}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 12 }} />

        {/* 5.5 Subtotal strip, only with a quantity */}
        {qty > 0 ? (
          <View style={styles.subtotal}>
            <Text style={styles.subtotalText} allowFontScaling={false}>SUBTOTAL</Text>
            <Text style={styles.subtotalPrice} allowFontScaling={false}>{rupee(qty * PRODUCT.price)}</Text>
          </View>
        ) : null}

        {/* 5.6 Order info card */}
        <View style={styles.card}>
          <View style={styles.qtyBar}>
            <View style={{ flex: 1 }}>
              <Text style={styles.mrpHeading} allowFontScaling={false}>{`MRP/${PRODUCT.uom} ${rupee(PRODUCT.mrp)}`}</Text>
              <View style={styles.qtyDivider} />
              <Text style={styles.priceTitle} allowFontScaling={false}>{`PRICE/${PRODUCT.uom}`}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.price} allowFontScaling={false}>{rupee(PRODUCT.price)}</Text>
                <Text style={styles.marginText} allowFontScaling={false}>{`${PRODUCT.marginPct}% margin`}</Text>
              </View>
            </View>
            {qty === 0 ? (
              <Pressable style={styles.addBtn} onPress={() => setQty(1)} accessibilityRole="button" accessibilityLabel="Add">
                <Text style={styles.addText} allowFontScaling={false}>ADD</Text>
                <View style={styles.addDivider} />
                <View style={styles.addIcon}><Glyph d={G.plus} color={P.white} /></View>
              </Pressable>
            ) : (
              <View style={styles.stepper}>
                <Pressable style={styles.stepBtn} onPress={() => setQty((q) => Math.max(0, q - 1))} accessibilityLabel="Decrease">
                  <Glyph d={G.minus} size={20} color={P.stepRed} />
                </Pressable>
                <View style={styles.spinner}><Text style={styles.spinnerText} allowFontScaling={false}>{qty}</Text></View>
                <Pressable style={styles.stepBtn} onPress={() => setQty((q) => q + 1)} accessibilityLabel="Increase">
                  <Glyph d={G.plus} size={20} color={P.stepRed} />
                </Pressable>
              </View>
            )}
          </View>
          <View style={styles.sep} />
          <View style={styles.delivery}>
            <Glyph d={G.truck} color={P.lightGrey1} />
            <Text style={styles.rowLabel} allowFontScaling={false}>DELIVERY</Text>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Text style={styles.deliveryPrice} allowFontScaling={false}>{PRODUCT.delivery.priceUom}</Text>
              <Text style={styles.deliveryTime} allowFontScaling={false}>{PRODUCT.delivery.timeUom}</Text>
            </View>
          </View>
        </View>

        {/* The design: the target-scheme card, in the card stack. */}
        {!prod && schemes.length ? (
          <SchemeNodeCard schemes={schemes} onPress={(sc) => setSheet(sc)} style={styles.schemeCard} />
        ) : null}

        {/* 5.7 Credit */}
        <View style={[styles.card, styles.cardPadY]}>
          <View style={styles.rowHead}>
            <Glyph d={G.credit} color={P.lightGrey1} />
            <Text style={styles.rowLabel} allowFontScaling={false}>{PRODUCT.credit.heading}</Text>
          </View>
          <Text style={styles.creditTitle} allowFontScaling={false}>{PRODUCT.credit.title}</Text>
          <Text style={styles.creditDesc} allowFontScaling={false}>{PRODUCT.credit.description}</Text>
        </View>

        {/* 5.8 Seller */}
        <Pressable style={[styles.card, styles.sellerRow]}>
          <Glyph d={G.notes} size={18} color={P.lightGrey1} />
          <Text style={styles.rowLabel} allowFontScaling={false}>SELLER</Text>
          <Text style={styles.sellerName} numberOfLines={1} allowFontScaling={false}>{PRODUCT.seller}</Text>
          <Glyph d={G.chevron} color={P.black} />
        </Pressable>

        {/* 7 One UI node under the static block: frequently bought together. */}
        <View style={styles.node}>
          <Text style={styles.nodeTitle} allowFontScaling={false}>Frequently bought together</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 8, gap: 8 }}>
            {PRODUCT.related.map((r) => (
              <View key={r.title} style={styles.relCard}>
                <View style={styles.relImageBox}><Image source={r.image} style={{ width: 96, height: 76 }} resizeMode="contain" /></View>
                <Text style={styles.relTitle} numberOfLines={2} allowFontScaling={false}>{r.title}</Text>
                <Text style={styles.relPrice} allowFontScaling={false}>{rupee(r.price)}</Text>
                <View style={styles.relAdd}><Text style={styles.relAddText} allowFontScaling={false}>ADD</Text></View>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* 10 The sticky cart bar */}
      <View style={[styles.cartBarWrap, { paddingBottom: insets.bottom }]}>
        <View style={styles.cartRule} />
        <View style={styles.cartBar}>
          <View style={styles.cartIconCol}>
            <Glyph d={G.cart} color={P.black} />
            <View style={styles.cartCount}><Text style={styles.cartCountText} allowFontScaling={false}>{cartItems}</Text></View>
          </View>
          <View style={styles.cartAmountCol}>
            <Text style={styles.cartAmount} allowFontScaling={false}>{rupee(cartAmount)}</Text>
            <Text style={styles.cartDelivery} allowFontScaling={false}>{`+ ₹${CART.deliveryCharge} DELIVERY CHARGES`}</Text>
          </View>
          <Pressable style={styles.goToCart} accessibilityRole="button">
            <Text style={styles.goToCartText} allowFontScaling={false}>GO TO CART</Text>
            <Svg width={14} height={14} viewBox="0 0 24 24" style={{ marginLeft: 10 }}><Path d={G.forward} fill={P.white} /></Svg>
          </Pressable>
        </View>
      </View>

      <SchemeSheet scheme={sheet} indexOf={indexOf} onClose={() => setSheet(null)} />
    </View>
  );
}

const CARD = { backgroundColor: P.white, borderWidth: 1, borderColor: P.border };

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: P.page },
  toolbar: { flexDirection: 'row', alignItems: 'center', backgroundColor: P.toolbar, paddingHorizontal: 4, elevation: 4, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, zIndex: 2 },
  tbHit: { width: 44, height: 48, alignItems: 'center', justifyContent: 'center' },
  tbTitle: { flex: 1, color: P.white, fontFamily: F.medium, fontSize: 18, lineHeight: 22, marginLeft: 8 },
  tbBadge: { position: 'absolute', top: 12, right: 8, width: 10, height: 10, borderRadius: 5, backgroundColor: P.badge, alignItems: 'center', justifyContent: 'center' },
  tbBadgeText: { color: P.white, fontFamily: F.medium, fontSize: 8, lineHeight: 10 },

  header: { flexDirection: 'row', alignItems: 'flex-start', marginLeft: 16, marginTop: 16, marginRight: 16 },
  title: { color: P.black, fontFamily: F.bold, fontSize: 16, lineHeight: 21 },
  ratingRow: { height: 40, flexDirection: 'row', alignItems: 'center', gap: 6 },
  ratingText: { color: P.black, fontFamily: F.medium, fontSize: 16, lineHeight: 20 },
  stars: { flexDirection: 'row', gap: 1 },
  varietiesWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  varietiesBtn: { minWidth: 64, backgroundColor: P.brand, borderRadius: 6, paddingVertical: 4, paddingHorizontal: 8, elevation: 2, shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } },
  varietiesLabel: { color: P.white, fontFamily: F.regular, fontSize: 10, lineHeight: 13, textAlign: 'center', maxWidth: 60 },

  chipStrip: { marginHorizontal: 8, marginTop: 4 },
  chipWrap: { marginRight: 8, paddingHorizontal: 2, alignItems: 'center' },
  chip: { backgroundColor: P.white, borderRadius: 44, borderWidth: 1, borderColor: P.border, paddingHorizontal: 16, alignItems: 'center' },
  chipLabel: { color: P.black, fontFamily: F.bold, fontSize: 10, lineHeight: 13, marginTop: 4 },
  chipValue: { color: P.black, fontFamily: F.bold, fontSize: 16, lineHeight: 20, paddingBottom: 4 },
  chipPointer: { width: 0, height: 0, borderLeftWidth: 16, borderRightWidth: 16, borderTopWidth: 16, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: P.border, marginTop: 0 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 4, height: 10, marginTop: 4, marginBottom: 20, alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotOn: { backgroundColor: P.greyText },
  dotOff: { backgroundColor: P.white, borderWidth: 1, borderColor: P.greyText },

  infoCard: { ...CARD, paddingBottom: 12 },
  tag: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: P.orange, borderTopLeftRadius: 4, borderBottomRightRadius: 4, paddingVertical: 2, paddingHorizontal: 6, marginLeft: -1, marginTop: -1 },
  tagText: { color: P.white, fontFamily: F.bold, fontSize: 12, lineHeight: 16 },
  variantLabel: { color: P.black, fontFamily: F.bold, fontSize: 18, lineHeight: 23, marginHorizontal: 12, marginTop: 16 },
  imagesRow: { paddingHorizontal: 12, paddingVertical: 2, marginTop: 12, gap: 6 },
  imageBox: { height: 240, backgroundColor: P.white, padding: 2 },
  image: { width: 236, height: 236 },
  offers: { flexDirection: 'row', flexWrap: 'wrap', margin: 12, marginBottom: 0, gap: 8 },
  offerChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: P.white, borderRadius: 4, borderWidth: 1, borderColor: P.accent, paddingLeft: 4, paddingRight: 2, elevation: 1, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 1.5, shadowOffset: { width: 0, height: 1 } },
  offerLogo: { width: 24, height: 12 },
  offerTitle: { color: P.accent, fontFamily: F.bold, fontSize: 12, lineHeight: 16, paddingHorizontal: 4, paddingVertical: 2 },

  subtotal: { marginHorizontal: 8, flexDirection: 'row', alignItems: 'center', backgroundColor: P.subtotal, opacity: 0.8, paddingVertical: 2, paddingHorizontal: 8, gap: 8 },
  subtotalText: { flex: 1, color: P.white, fontFamily: F.regular, fontSize: 12, lineHeight: 16 },
  subtotalPrice: { color: P.white, fontFamily: F.regular, fontSize: 14, lineHeight: 18 },

  card: { ...CARD, marginHorizontal: 8, marginTop: 8 },
  cardPadY: { paddingVertical: 12 },
  qtyBar: { flexDirection: 'row', alignItems: 'flex-start', marginHorizontal: 8, marginTop: 12, paddingBottom: 4 },
  mrpHeading: { color: P.accent, fontFamily: F.medium, fontSize: 16, lineHeight: 20 },
  qtyDivider: { height: 1, backgroundColor: P.greyBg, marginTop: 12 },
  priceTitle: { color: P.greyText, fontFamily: F.bold, fontSize: 12, lineHeight: 16, marginTop: 8 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 4 },
  price: { color: P.black, fontFamily: F.bold, fontSize: 24, lineHeight: 30 },
  marginText: { color: P.accent, fontFamily: F.regular, fontSize: 12, lineHeight: 16, marginLeft: 8 },
  addBtn: { flexDirection: 'row', alignItems: 'center', height: 36, marginTop: 44, marginRight: 8, backgroundColor: P.addRed, borderRadius: 4, elevation: 2, shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 2, shadowOffset: { width: 0, height: 1 } },
  addText: { color: P.white, fontFamily: F.bold, fontSize: 16, lineHeight: 20, paddingHorizontal: 16 },
  addDivider: { width: 1, height: 36, backgroundColor: P.page },
  addIcon: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  stepper: { flexDirection: 'row', alignItems: 'center', marginTop: 44, marginRight: 8, gap: 8 },
  stepBtn: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, borderColor: P.stepRed, alignItems: 'center', justifyContent: 'center' },
  spinner: { width: 44, height: 44, borderWidth: 1.5, borderColor: P.greyishWhite, borderRadius: 2, alignItems: 'center', justifyContent: 'center' },
  spinnerText: { color: P.black, fontFamily: F.medium, fontSize: 16, lineHeight: 20 },
  sep: { height: 1, backgroundColor: P.greyishWhite, marginHorizontal: 8, marginTop: 8 },
  delivery: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  rowLabel: { color: P.black, fontFamily: F.bold, fontSize: 12, lineHeight: 16 },
  deliveryPrice: { color: P.black, fontFamily: F.medium, fontSize: 14, lineHeight: 18 },
  deliveryTime: { color: P.black, fontFamily: F.regular, fontSize: 12, lineHeight: 16 },

  schemeCard: { marginHorizontal: 8, marginTop: 8 },

  rowHead: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12 },
  creditTitle: { color: P.black, fontFamily: F.bold, fontSize: 14, lineHeight: 18, marginLeft: 12, marginTop: 8 },
  creditDesc: { color: P.greyTextDark, fontFamily: F.bold, fontSize: 12, lineHeight: 16, marginLeft: 12, marginTop: 4 },
  sellerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingLeft: 12, paddingRight: 12, gap: 8 },
  sellerName: { flex: 1, color: P.black, fontFamily: F.bold, fontSize: 14, lineHeight: 18, marginLeft: 8 },

  node: { marginTop: 16 },
  nodeTitle: { color: P.black, fontFamily: F.bold, fontSize: 14, lineHeight: 18, marginHorizontal: 16, marginBottom: 8 },
  relCard: { width: 140, ...CARD, borderColor: P.lightGrey2, paddingBottom: 8 },
  relImageBox: { margin: 8, marginBottom: 4, backgroundColor: P.white, borderWidth: 1, borderColor: P.border, padding: 2, alignItems: 'center' },
  relTitle: { color: P.black, fontFamily: F.bold, fontSize: 12, lineHeight: 16, marginHorizontal: 8, height: 32 },
  relPrice: { color: P.black, fontFamily: F.bold, fontSize: 14, lineHeight: 18, marginHorizontal: 8, marginTop: 4 },
  relAdd: { marginHorizontal: 8, marginTop: 8, height: 30, borderRadius: 4, backgroundColor: P.addRed, alignItems: 'center', justifyContent: 'center' },
  relAddText: { color: P.white, fontFamily: F.bold, fontSize: 12, lineHeight: 16 },

  cartBarWrap: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: P.white },
  cartRule: { height: 2, backgroundColor: P.accent },
  cartBar: { flexDirection: 'row', alignItems: 'center', paddingLeft: 10, paddingRight: 8, paddingVertical: 4 },
  cartIconCol: { flex: 2.2, alignItems: 'center', justifyContent: 'center', height: 44 },
  cartCount: { position: 'absolute', top: 4, right: '28%', width: 17, height: 17, borderRadius: 9, backgroundColor: P.accent, alignItems: 'center', justifyContent: 'center' },
  cartCountText: { color: P.white, fontFamily: F.medium, fontSize: 10, lineHeight: 12 },
  cartAmountCol: { flex: 6, marginRight: 14 },
  cartAmount: { color: P.accent, fontFamily: F.medium, fontSize: 16, lineHeight: 20 },
  cartDelivery: { color: P.black50, fontFamily: F.regular, fontSize: 10, lineHeight: 12 },
  goToCart: { flex: 5, height: 44, backgroundColor: P.accent, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  goToCartText: { color: P.white, fontFamily: F.medium, fontSize: 12, lineHeight: 16 },
});
