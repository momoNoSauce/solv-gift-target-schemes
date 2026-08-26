// /partials/nav-bar.html + NavBarCtrl. Inline styles are copied from the template,
// md-sidenav metrics from all.1.0.75.min.css (width 320px, z-index 60, backdrop 59).
import React, { useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet, Modal, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SC, F } from './theme';
import { IMG } from './assets';
import { ROOT, LEFT_MENU, SUPPORT_NUMBER } from './data';

export default function NavBar({ pageTitle }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <View style={styles.pageHead}>
        <Pressable onPress={() => setMenuOpen(true)} hitSlop={8}>
          <Image source={IMG.menu} style={styles.icon24} resizeMode="contain" />
        </Pressable>
        <Pressable onPress={() => router.replace('/superclub')} hitSlop={8} style={{ marginLeft: 10 }}>
          <Image source={IMG.home} style={styles.icon24} resizeMode="contain" />
        </Pressable>
        <Text style={styles.pageTitle} allowFontScaling={false}>{pageTitle ?? ''}</Text>
      </View>

      <Modal visible={menuOpen} transparent animationType="none" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setMenuOpen(false)} />
        <View style={styles.sidenav}>
          <View style={styles.sideHead}>
            <View style={styles.sideHeadRow}>
              <Image source={IMG.logo} style={{ height: 30, width: (30 * 208) / 34 }} resizeMode="contain" />
              <Pressable onPress={() => setMenuOpen(false)} hitSlop={8}>
                <Image source={IMG.back} style={{ height: 34, width: 34 }} resizeMode="contain" />
              </Pressable>
            </View>
            <Text style={styles.sideBusinessName} allowFontScaling={false}>{ROOT.businessName}</Text>
          </View>

          <ScrollView style={{ marginTop: 20 }}>
            {LEFT_MENU.map((m) => (
              <Pressable
                key={m.id}
                style={styles.menuItem}
                onPress={() => {
                  setMenuOpen(false);
                  router.replace(m.link);
                }}
              >
                <Image source={IMG[m.img]} style={{ height: 20, width: 20 }} resizeMode="contain" />
                <Text style={styles.menuItemText} allowFontScaling={false}>{m.display}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.sideFooter}>
            <View style={styles.footerHr} />
            <Text style={styles.footerBold} allowFontScaling={false}>For Queries</Text>
            <Text style={styles.footerMedium} allowFontScaling={false}>Call Superclub Customer Support</Text>
            <Text style={styles.footerNumber} allowFontScaling={false}>{SUPPORT_NUMBER}</Text>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  pageHead: {
    backgroundColor: SC.navGreen,
    paddingVertical: 15,
    paddingHorizontal: 18,
    marginBottom: -1,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
    shadowColor: '#000',
    shadowOpacity: 0.24,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  icon24: { height: 24, width: 24 },
  pageTitle: { color: SC.white, lineHeight: 24, fontSize: 18, fontFamily: F.medium, marginLeft: 10, letterSpacing: 0.1 },
  // md-backdrop.md-opaque: black at .48
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.48)' },
  sidenav: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 320,
    maxWidth: 320,
    backgroundColor: SC.white,
  },
  sideHead: {
    paddingVertical: 26,
    paddingHorizontal: 16,
    backgroundColor: SC.navGreen,
    shadowColor: '#000',
    shadowOpacity: 0.24,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  sideHeadRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sideBusinessName: { color: SC.white, fontSize: 14, paddingTop: 10, fontFamily: F.regular, letterSpacing: 0.1 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 15 },
  menuItemText: { color: '#424242', fontSize: 14, fontFamily: F.medium, marginLeft: 25, letterSpacing: 0.1 },
  sideFooter: { position: 'absolute', bottom: 15, width: '100%', paddingTop: 15, paddingLeft: 15 },
  footerHr: { borderTopWidth: 1, borderTopColor: '#e5e5e5', marginBottom: 15 },
  footerBold: { color: SC.black, fontFamily: F.bold, fontSize: 13, letterSpacing: 0.1 },
  footerMedium: { color: SC.black, fontFamily: F.medium, fontSize: 13, letterSpacing: 0.1 },
  footerNumber: { color: SC.orange, fontFamily: F.medium, fontSize: 13, letterSpacing: 0.1 },
});
