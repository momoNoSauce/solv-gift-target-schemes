// Eligible products with pictures (the /schemes/list2 variant of the rules
// card). The list variant names the categories in rows with a status word;
// this one leads with what counts, as a row of product tiles the eye can scan
// without reading, and keeps what does not count quieter underneath.
//
//   - Both groups are the same row of square photos with the name under
//     them. What counts wears a green tick; what does not wears a red cross,
//     a muted photo and the name in the secondary ink. The row scrolls
//     sideways; a fourth tile peeks past the card's edge so the scroll reads.
//   - The group headings carry "counts" / "doesn't count" in words, the tiles
//     carry the tick / cross; screen readers get the status in each label.
//
// Photos: generated catalog shots on one warm off-white ground
// (assets/eligible). A rule entry with no photo gets a lettered tile.
import React, { useState } from 'react';
import { View, Text, Image, ScrollView, Pressable, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { F } from '../theme';
import { N } from './Stage';
import { SELLER } from './sellers';

const P = {
  sneakers: require('../../assets/eligible/sneakers.jpg'),
  cushions: require('../../assets/eligible/cushions.jpg'),
  airfryer: require('../../assets/eligible/airfryer.jpg'),
  toys: require('../../assets/eligible/toys.jpg'),
  grocery: require('../../assets/eligible/grocery.jpg'),
  mobile: require('../../assets/eligible/mobile.jpg'),
  sandals: require('../../assets/eligible/sandals.jpg'),
  sports: require('../../assets/eligible/sports.jpg'),
  formal: require('../../assets/eligible/formal.jpg'),
  school: require('../../assets/eligible/school.jpg'),
  cooker: require('../../assets/eligible/cooker.jpg'),
  cookware: require('../../assets/eligible/cookware.jpg'),
  mixer: require('../../assets/eligible/mixer.jpg'),
  stove: require('../../assets/eligible/stove.jpg'),
  fan: require('../../assets/eligible/fan.jpg'),
  heater: require('../../assets/eligible/heater.jpg'),
  iron: require('../../assets/eligible/iron.jpg'),
  wires: require('../../assets/eligible/wires.jpg'),
  bedsheet: require('../../assets/eligible/bedsheet.jpg'),
  towels: require('../../assets/eligible/towels.jpg'),
  blanket: require('../../assets/eligible/blanket.jpg'),
  goldbox: require('../../assets/eligible/goldbox.jpg'),
  goldbag: require('../../assets/eligible/goldbag.jpg'),
  staples: require('../../assets/eligible/staples.jpg'),
  boardgame: require('../../assets/eligible/boardgame.jpg'),
  dough: require('../../assets/eligible/dough.jpg'),
  babytoy: require('../../assets/eligible/babytoy.jpg'),
};

// Rule entry name (registry.js RULES_*) → photo.
const PHOTO_FOR = {
  'Footwear': P.sneakers,
  'Home Furnishing': P.cushions,
  'Small Appliances': P.airfryer,
  'Toys': P.toys,
  'Grocery': P.grocery,
  'Mobile Phones': P.mobile,
  'Bata Comfit': P.sandals,
  'Power': P.sports,
  'Hush Puppies': P.formal,
  'Bata school shoes': P.school,
  'Prestige pressure cookers': P.cooker,
  'Prestige cookware': P.cookware,
  'Prestige mixer grinders': P.mixer,
  'Prestige gas stoves': P.stove,
  'Havells fans': P.fan,
  'Havells water heaters': P.heater,
  'Havells irons and kettles': P.iron,
  'Havells wires and cables': P.wires,
  'Bed sheets': P.bedsheet,
  'Towels': P.towels,
  'Comforters and blankets': P.blanket,
  'Gold-exclusive listings': P.goldbox,
  'Gold member prices': P.goldbag,
  'Grocery staples': P.staples,
  'Funskool board games': P.boardgame,
  'Play-Doh': P.dough,
  'Giggles': P.babytoy,
};

const RED = '#C2410C';
const GROUND = '#F4F1EC'; // the photos' own ground, so a lettered tile sits with them
const TILE = 104;

function Tick({ size = 10, color = '#FFFFFF' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 12 12">
      <Path d="M2.5 6.2l2.3 2.3 4.7-4.9" stroke={color} strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function Cross({ size = 10, color = '#FFFFFF' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 12 12">
      <Path d="M3.5 3.5l5 5M8.5 3.5l-5 5" stroke={color} strokeWidth={1.8} fill="none" strokeLinecap="round" />
    </Svg>
  );
}

function Photo({ name, style }) {
  const src = PHOTO_FOR[name];
  if (src) return <Image source={src} style={style} resizeMode="cover" />;
  return (
    <View style={[style, styles.lettered]}>
      <Text style={styles.letter} allowFontScaling={false}>{name.charAt(0)}</Text>
    </View>
  );
}

// The group heading: plain text in the page's card-title style (as
// "Purchases counted"); the tick or cross lives on the tiles, not here.
function GroupHead({ label, count }) {
  return (
    <View style={styles.head}>
      <Text style={styles.headText} allowFontScaling={false}>
        {label}
        {count > 1 ? <Text style={styles.headCount}>{` (${count})`}</Text> : null}
      </Text>
    </View>
  );
}

// One row of square tiles. Both groups use it, so siblings share one layout;
// the badge (green tick / red cross) and the name's ink tell them apart.
function Shelf({ names, tone, t }) {
  const out = tone === 'out';
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.shelf} contentContainerStyle={styles.shelfContent}>
      {names.map((name) => (
        <View key={name} style={styles.tile} accessible accessibilityLabel={`${name}, ${out ? t.notEligible : t.eligible}`}>
          <View>
            <Photo name={name} style={[styles.tilePhoto, out && styles.tilePhotoOut]} />
            <View style={[styles.tileBadge, { backgroundColor: out ? RED : N.green }]}>
              {out ? <Cross size={9} /> : <Tick size={9} />}
            </View>
          </View>
          <Text style={[styles.tileName, out && styles.tileNameOut]} numberOfLines={2} allowFontScaling={false}>{name}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

export default function ProductRules({ rules, t }) {
  const { included, excluded } = rules;
  return (
    <View style={styles.card}>
      <GroupHead label={t.rulesCounts} count={included.length} />
      <Shelf names={included} tone="in" t={t} />
      {excluded.length ? (
        <>
          <View style={styles.divider} />
          <GroupHead label={t.rulesNotCounts} count={excluded.length} />
          <Shelf names={excluded} tone="out" t={t} />
        </>
      ) : null}
    </View>
  );
}

// The rules as one list, eligible first: [name, eligible].
export function ruleRows(rules) {
  return [
    ...rules.included.map((name) => [name, true]),
    ...rules.excluded.map((name) => [name, false]),
  ];
}

// A long rules list folds: past FOLD rows it shows the first FOLD and a row
// that unfolds the rest in place (and folds it back).
const FOLD = 5;

export function useFold(rows, at = FOLD) {
  const [open, setOpen] = useState(false);
  const folds = rows.length > at;
  return {
    shown: folds && !open ? rows.slice(0, at) : rows,
    folds,
    open,
    hidden: rows.length - at,
    toggle: () => setOpen((v) => !v),
  };
}

export function FoldRow({ fold, t, accent }) {
  if (!fold.folds) return null;
  return (
    <Pressable onPress={fold.toggle} style={styles.foldRow} accessibilityRole="button" hitSlop={4}>
      <Text style={[styles.foldText, { color: accent }]} allowFontScaling={false}>
        {fold.open ? t.rulesLess : t.rulesMore(fold.hidden)}
      </Text>
      <Svg width={12} height={12} viewBox="0 0 12 12" style={fold.open ? styles.foldChevronUp : null}>
        <Path d="M3 4.5l3 3 3-3" stroke={accent} strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </Pressable>
  );
}

// /schemes/list4: the rules as two groups in one card, both always open, no
// heading inside the card. Each group is a tinted frame (green for what
// counts, red for what doesn't) with its mark and count on the head, and a
// white inset holding the rows: photo, name, status. The status word stays on
// every row even though the frame says it; people read row by row. Past three
// rows a group folds behind "View N more" in its own colour.
const GROUP = {
  in: { bg: '#F1F8F2', line: '#D6EBDA', ink: N.green },
  out: { bg: '#FDF2EE', line: '#F5D7CB', ink: RED },
};
const GROUP_FOLD = 3;

function Group({ names, ok, t }) {
  const g = ok ? GROUP.in : GROUP.out;
  const fold = useFold(names.map((name) => [name, ok]), GROUP_FOLD);
  return (
    <View style={[styles.group, { backgroundColor: g.bg, borderColor: g.line }]}>
      <View style={styles.groupHead}>
        <View style={[styles.panelDisc, { backgroundColor: g.ink }]}>
          {ok ? <Tick size={11} /> : <Cross size={11} />}
        </View>
        <Text style={styles.panelLabel} allowFontScaling={false}>{ok ? t.rulesGroupIn(names.length) : t.rulesGroupOut(names.length)}</Text>
      </View>
      <View style={styles.groupBody}>
        {fold.shown.map(([name], i) => (
          <View key={name} style={[styles.tableRow, i === 0 && styles.tableRowFirst]} accessible accessibilityLabel={`${name}, ${ok ? t.eligible : t.notEligible}`}>
            <Photo name={name} style={styles.tablePhoto} />
            <Text style={styles.tableName} numberOfLines={2} allowFontScaling={false}>{name}</Text>
            <Text style={[styles.tableStatus, { color: g.ink }]} allowFontScaling={false}>{ok ? t.eligible : t.notEligible}</Text>
          </View>
        ))}
        {fold.folds ? (
          <Pressable onPress={fold.toggle} style={styles.groupMore} accessibilityRole="button">
            <Text style={[styles.foldText, { color: g.ink }]} allowFontScaling={false}>{fold.open ? t.rulesViewLess : t.rulesViewMore(fold.hidden)}</Text>
            <Svg width={16} height={16} viewBox="0 0 12 12" style={fold.open ? styles.foldChevronUp : null}>
              <Path d="M3 4.5l3 3 3-3" stroke={N.sub} strokeWidth={1.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export function RulesTable({ rules, t }) {
  return (
    <View style={styles.tableCard}>
      {rules.included.length ? <Group names={rules.included} ok t={t} /> : null}
      {rules.excluded.length ? <Group names={rules.excluded} ok={false} t={t} /> : null}
    </View>
  );
}

// /schemes/list3: the scheme counts only what the shop buys from one seller.
// One seller is one fact, so it is a single row, not a shelf: the seller's
// initials, their name and where they ship from, under the same card-title
// heading as the other rules cards.
function initials(name) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w.charAt(0)).join('').toUpperCase();
}

export function SellerRules({ scheme, t }) {
  const seller = SELLER[scheme.id];
  if (!seller) return null;
  return (
    <View style={styles.card}>
      <GroupHead label={t.sellersCounts} />
      <View style={styles.sellerRow} accessible accessibilityLabel={`${seller.name}, ${t.sellerFrom(seller.city)}`}>
        <View style={styles.sellerMark}>
          <Text style={styles.sellerMarkText} allowFontScaling={false}>{initials(seller.name)}</Text>
        </View>
        <View style={styles.sellerText}>
          <Text style={styles.sellerName} numberOfLines={1} allowFontScaling={false}>{seller.name}</Text>
          <Text style={styles.sellerCity} numberOfLines={1} allowFontScaling={false}>{t.sellerFrom(seller.city)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: N.paper,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(17,24,39,0.06)',
    shadowColor: '#0B1B33',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
    paddingTop: 14,
    paddingBottom: 14,
    overflow: 'hidden',
  },
  head: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14 },
  headText: { flex: 1, fontFamily: F.medium, fontSize: 14, lineHeight: 18, color: N.ink },
  headCount: { color: N.sub },

  // The shelf runs to the card's edges; its padding lines the first tile up
  // with the heading text column above it.
  shelf: { marginTop: 12 },
  shelfContent: { paddingHorizontal: 14, gap: 10 },
  tile: { width: TILE },
  tilePhoto: { width: TILE, height: TILE, borderRadius: 12, backgroundColor: GROUND, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  tileBadge: {
    position: 'absolute', top: 6, left: 6, width: 18, height: 18, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: N.paper,
  },
  tileName: { marginTop: 7, fontFamily: F.medium, fontSize: 12, lineHeight: 16, color: N.ink },

  tilePhotoOut: { opacity: 0.6 },
  tileNameOut: { color: N.sub },
  divider: { height: 1, backgroundColor: '#F2F3F5', marginHorizontal: 14, marginVertical: 16 },

  tableCard: {
    marginHorizontal: 16, marginTop: 8, padding: 12, gap: 12, backgroundColor: N.paper, borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(17,24,39,0.06)', shadowColor: '#0B1B33', shadowOpacity: 0.05,
    shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 1,
  },
  group: { borderRadius: 14, borderWidth: 1, padding: 4 },
  groupHead: { flexDirection: 'row', alignItems: 'center', minHeight: 48, paddingHorizontal: 10, gap: 10 },
  groupBody: { backgroundColor: N.paper, borderRadius: 10, paddingHorizontal: 12 },
  groupMore: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 48, borderTopWidth: 1, borderTopColor: '#F2F3F5' },
  panelDisc: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  panelLabel: { flex: 1, fontFamily: F.medium, fontSize: 14, lineHeight: 18, color: N.ink },
  tableRow: { flexDirection: 'row', alignItems: 'center', minHeight: 64, paddingVertical: 10, gap: 12, borderTopWidth: 1, borderTopColor: '#F2F3F5' },
  tableRowFirst: { borderTopWidth: 0 },
  tablePhoto: { width: 44, height: 44, borderRadius: 10, backgroundColor: GROUND, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  tableName: { flex: 1, fontFamily: F.medium, fontSize: 13, lineHeight: 17, color: N.ink },
  tableStatus: { fontFamily: F.medium, fontSize: 13, lineHeight: 17 },

  foldRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, minHeight: 44, borderTopWidth: 1, borderTopColor: '#F2F3F5' },
  foldText: { fontFamily: F.medium, fontSize: 13, lineHeight: 17 },
  foldChevronUp: { transform: [{ rotate: '180deg' }] },

  sellerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, marginHorizontal: 14, padding: 12, borderRadius: 12, backgroundColor: GROUND },
  sellerMark: { width: 44, height: 44, borderRadius: 22, backgroundColor: N.paper, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)' },
  sellerMarkText: { fontFamily: F.bold, fontSize: 14, lineHeight: 18, color: N.ink, letterSpacing: 0.3 },
  sellerText: { flex: 1, marginLeft: 12 },
  sellerName: { fontFamily: F.medium, fontSize: 14, lineHeight: 18, color: N.ink },
  sellerCity: { marginTop: 2, fontFamily: F.regular, fontSize: 12, lineHeight: 16, color: N.sub },

  lettered: { alignItems: 'center', justifyContent: 'center' },
  letter: { fontFamily: F.bold, fontSize: 22, color: '#B8B2A7' },
});
