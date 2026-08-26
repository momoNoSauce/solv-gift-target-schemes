// /partials/product-list.html + ProductListCtrl (opened by VIEW PRODUCTS on a target).
import React from 'react';
import { View, Text, Image, Modal, Pressable, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { SC, F } from './theme';
import { IMG } from './assets';
import ProductImage from './ProductImage';

export default function ProductListDialog({ products, onClose }) {
  const { height } = useWindowDimensions();
  if (!products) return null;
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.dialog}>
          <View style={styles.heading}>
            <Text style={styles.headingText} allowFontScaling={false}>List of New Products for You</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Image source={IMG.close} style={{ height: 24, width: 24 }} resizeMode="contain" />
            </Pressable>
          </View>
          <ScrollView style={[styles.list, { maxHeight: height * 0.8 }]}>
            {products.map((p, i) => (
              <View key={i} style={styles.item}>
                <Text style={styles.itemTitle} allowFontScaling={false}>{p.title}</Text>
                <View style={styles.itemImg}>
                  <ProductImage url={p.imurl} width={124} height={124} />
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'rgba(33,33,33,0.48)', alignItems: 'center', justifyContent: 'center' },
  // .product-list-dialoge { background:#fff; width:114%; margin-left:-7% }
  // md-dialog: 1px white border, square corners, min-width 240
  dialog: { backgroundColor: SC.white, width: '92%', borderWidth: 1, borderColor: SC.white, minWidth: 240, overflow: 'hidden' },
  heading: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: SC.grey,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  // .product-list-heading-text { font-size:16px; color:#2c552d; font-weight:500 }
  headingText: { fontSize: 16, color: '#2c552d', fontFamily: F.medium, letterSpacing: 0.1 },
  list: { paddingHorizontal: 10 },
  item: { paddingVertical: 16, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: SC.grey },
  itemTitle: { fontSize: 14, color: SC.black, lineHeight: 18, fontFamily: F.regular, letterSpacing: 0.1 },
  itemImg: { marginTop: 15, alignItems: 'center' },
});
