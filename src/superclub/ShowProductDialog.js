// /partials/show-product.html + ShowProductCtrl (md-dialog).
import React, { useState } from 'react';
import { View, Text, Image, Modal, Pressable, StyleSheet } from 'react-native';
import { SC, F } from './theme';
import { IMG } from './assets';
import { ScSvg } from './ScSvg';
import ProductImage from './ProductImage';
import { claimProduct } from './data';

export default function ShowProductDialog({ product, available, onClose }) {
  const [confirmed, setConfirmed] = useState(false);
  if (!product) return null;

  const confirm = () => {
    if (available >= product.points) {
      claimProduct(product);
      setConfirmed(true);
    }
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.dialog}>
          <Pressable style={styles.closeRow} onPress={onClose} hitSlop={8}>
            <Image source={IMG.close} style={styles.close} resizeMode="contain" />
          </Pressable>

          {confirmed ? (
            <View style={styles.congratsRow}>
              <Image source={IMG.congrats} style={{ height: 34, width: 34 }} resizeMode="contain" />
              <Text style={styles.congratsText} allowFontScaling={false}>Congratulations!!!</Text>
            </View>
          ) : null}

          <View style={{ alignItems: 'center' }}>
            <ProductImage url={product.imageURL} width={120} height={120} />
          </View>

          <View style={{ marginTop: 16 }}>
            <Text style={styles.title} allowFontScaling={false}>{product.title}</Text>
            <View style={styles.divider} />

            {!confirmed ? (
              <>
                <View style={styles.line}>
                  <Text style={styles.muted} allowFontScaling={false}>Jumbocoins:</Text>
                  <View style={styles.valueRow}>
                    <ScSvg name="coin_small" width={14} height={14} />
                    <Text style={styles.priceValue} allowFontScaling={false}> {product.points} Only</Text>
                  </View>
                </View>
                <View style={[styles.line, { marginTop: 15 }]}>
                  <Text style={styles.muted} allowFontScaling={false}>Jumbocoins Available:</Text>
                  <View style={styles.valueRow}>
                    <ScSvg name="coin_small" width={14} height={14} />
                    <Text style={styles.availableValue} allowFontScaling={false}> {available}</Text>
                  </View>
                </View>
              </>
            ) : (
              <>
                <View style={styles.line}>
                  <Text style={styles.muted} allowFontScaling={false}>Jumbocoins Used:</Text>
                  <View style={styles.valueRow}>
                    <ScSvg name="coin_small" width={14} height={14} />
                    <Text style={styles.priceValue} allowFontScaling={false}> {product.points}</Text>
                  </View>
                </View>
                <View style={{ marginTop: 15 }}>
                  <Text style={styles.requestReceived} allowFontScaling={false}>
                    Request received! You will get confirmation call within 7-10 working days
                  </Text>
                  <Text style={styles.deductionNote} allowFontScaling={false}>
                    *Jumbocoins will be deducted from your wallet post confirmation
                  </Text>
                </View>
              </>
            )}
          </View>

          {product.points <= available ? (
            <View style={styles.buttonRow}>
              <Pressable style={styles.button} onPress={confirmed ? onClose : confirm}>
                <Text style={styles.buttonText} allowFontScaling={false}>{confirmed ? 'OK' : 'CONFIRM'}</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'rgba(33,33,33,0.48)', alignItems: 'center', justifyContent: 'center' },
  // md-dialog: white, radius 4, min-width 240, heavy material shadow
  // md-dialog: 1px white border, no radius rule in the bundle, min-width 240, material shadow
  dialog: {
    backgroundColor: SC.white,
    borderWidth: 1,
    borderColor: SC.white,
    minWidth: 240,
    width: '80%',
    paddingLeft: 21,
    paddingRight: 21,
    paddingBottom: 23,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 7 },
    elevation: 12,
  },
  closeRow: { height: 23 + 15, alignItems: 'flex-end', justifyContent: 'flex-end' },
  close: { height: 23, width: 23 },
  congratsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 25 },
  congratsText: { marginLeft: 8, fontSize: 16, lineHeight: 34, color: SC.black, fontFamily: F.bold, letterSpacing: 0.1 },
  title: { fontSize: 14, lineHeight: 16, fontFamily: F.medium, color: SC.black, letterSpacing: 0.1 },
  divider: { borderTopWidth: 1, borderTopColor: SC.hr, opacity: 0.28, marginVertical: 5 },
  line: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  muted: { color: SC.greyText, fontSize: 13, fontFamily: F.regular, letterSpacing: 0.1 },
  valueRow: { flexDirection: 'row', alignItems: 'center', marginLeft: 5 },
  priceValue: { fontSize: 16, color: SC.green, fontFamily: F.regular, letterSpacing: 0.1 },
  availableValue: { color: '#767676', fontFamily: F.bold, fontSize: 13, letterSpacing: 0.1 },
  requestReceived: { color: 'green', fontSize: 13, fontFamily: F.regular, letterSpacing: 0.1 },
  deductionNote: { color: '#EF6C00', fontSize: 9, fontFamily: F.regular, letterSpacing: 0.1 },
  buttonRow: { marginTop: 10, alignItems: 'flex-end' },
  // inline override on .btn-jt-green: background #58a159, padding 8px 16px, 12px, weight 400
  // .btn{border-radius:0} with the inline override padding:8px 16px!important
  button: { backgroundColor: SC.green, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 0 },
  // .btn line-height 1.846, font-weight 400 from the inline style
  buttonText: { color: SC.white, fontSize: 12, lineHeight: 22.15, fontFamily: F.regular, letterSpacing: 0.1 },
});
