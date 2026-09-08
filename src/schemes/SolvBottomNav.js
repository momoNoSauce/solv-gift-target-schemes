// The Solv app's bottom navigation, as the Android app draws it, with Target
// Schemes in the slot All Brands had. Anatomy from mainandroidapp:
//   fragment_home_page.xml   CardView 52dp, elevation 8dp, white TabLayout,
//                            indicator brand_color, tabs fill the width
//   custom_tab_layout.xml    24dp icon above a 12sp Roboto Medium label
//   tab_selector.xml         label grey_text (#7F7F7F), selected grey_text_dark
//                            (#333333) and bold; icon swaps to its filled form
//   HomePagePresenter.java   the JT tab order Home, Explore, All Brands; the
//                            Solv flavour drops Credit and Distributors
// The icons are the app's vectors (ic_home_*, ic_explore_*,
// ic_target_scheme_navigation) redrawn with react-native-svg.
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { C, F } from '../theme';
import { HOME_PATH } from '../icons';
import { SOLV } from '../gifts/solv';

export const NAV_H = 52;


const EXPLORE_FILL = [
  'M3.46,16.48L2.62,14.2c-0.26,-0.7 0.06,-1.58 0.69,-1.96l0.94,-0.57l2.1,5.68l-1.08,0.18C4.53,17.66 3.72,17.18 3.46,16.48z',
  'M19.43,9.3c0.06,0.16 0.21,0.26 0.38,0.26c0.04,0 0.09,-0.01 0.14,-0.03l1.68,-0.62c0.21,-0.08 0.31,-0.31 0.24,-0.51c-0.08,-0.21 -0.31,-0.31 -0.51,-0.24l-1.68,0.62C19.46,8.86 19.35,9.09 19.43,9.3z',
  'M17.9,6.08c0.07,0.04 0.15,0.07 0.22,0.07c0.13,0 0.26,-0.06 0.33,-0.18L19.5,4.4c0.12,-0.18 0.07,-0.43 -0.11,-0.55c-0.18,-0.12 -0.43,-0.07 -0.55,0.11l-1.05,1.57C17.67,5.71 17.72,5.95 17.9,6.08z',
  'M22.65,12.99l-1.81,-0.52c-0.21,-0.06 -0.43,0.06 -0.49,0.27c-0.06,0.21 0.06,0.43 0.27,0.49l1.81,0.52c0.04,0.01 0.08,0.02 0.11,0.02c0.17,0 0.33,-0.12 0.38,-0.29C22.98,13.27 22.86,13.05 22.65,12.99z',
  'M13.55,5.44l2.06,-0.76c0.2,-0.07 0.41,0.03 0.49,0.23l3.64,9.95c0.07,0.2 -0.03,0.41 -0.23,0.49l-2.06,0.76c-0.06,0.02 -0.12,0.02 -0.17,-0.01c-0.05,-0.03 -0.09,-0.07 -0.12,-0.12L13.42,5.72C13.38,5.61 13.44,5.48 13.55,5.44z',
  'M7.14,17.22l-2.19,-5.96l7.95,-4.75l3.33,9.2z',
  'M14.13,17.24c0.18,0.48 -0.07,1.02 -0.55,1.19l-3.13,1.15c-0.24,0.08 -0.49,0.08 -0.71,-0.03c-0.23,-0.11 -0.4,-0.29 -0.48,-0.52l-0.51,-1.39l5.22,-0.86L14.13,17.24z',
  'M7.92,17.74l0.35,0.92c0.16,0.43 0.48,0.78 0.9,0.98C9.4,19.75 9.65,19.8 9.9,19.8c0.2,0 0.4,-0.04 0.6,-0.11l3.13,-1.15c0.9,-0.33 1.23,-1.19 1.11,-1.94l-0.06,0.01L7.92,17.74z',
];
const EXPLORE_LINE = [
  'M15.74,4.66c-0.05,0 -0.09,0.01 -0.14,0.02l-2.04,0.75c-0.45,0.16 -0.71,0.61 -0.66,1.07L3.38,12.2c-0.71,0.43 -1.02,1.3 -0.74,2.08l0.79,2.14c0.25,0.69 0.91,1.14 1.62,1.14c0.09,0 0.19,-0.01 0.28,-0.03l2.37,-0.39l0.56,1.53c0.16,0.43 0.48,0.78 0.9,0.98C9.4,19.75 9.65,19.8 9.9,19.8c0.2,0 0.4,-0.04 0.6,-0.11l3.13,-1.15c0.9,-0.33 1.36,-1.33 1.03,-2.22L14.54,16l1.73,-0.29c0.1,0.15 0.24,0.28 0.42,0.35c0.14,0.06 0.28,0.09 0.43,0.09c0.12,0 0.24,-0.02 0.35,-0.06l2.04,-0.75c0.1,-0.04 0.18,-0.11 0.23,-0.21c0.04,-0.1 0.05,-0.2 0.01,-0.31l-3.63,-9.9C16.06,4.77 15.9,4.66 15.74,4.66L15.74,4.66zM17.11,15.36c-0.03,0 -0.06,-0.01 -0.09,-0.02c-0.05,-0.03 -0.09,-0.07 -0.12,-0.12L13.7,6.48c-0.04,-0.11 0.02,-0.24 0.13,-0.28l1.67,-0.61l3.36,9.15l-1.67,0.61C17.16,15.36 17.14,15.36 17.11,15.36L17.11,15.36zM6.86,16.47l-1.63,-4.44l7.91,-4.73l2.81,7.66L6.86,16.47L6.86,16.47zM5.05,16.75c-0.38,0 -0.73,-0.24 -0.87,-0.61L3.39,14c-0.16,-0.42 0.01,-0.89 0.39,-1.12l0.75,-0.45l1.53,4.16L5.2,16.74C5.15,16.74 5.1,16.75 5.05,16.75L5.05,16.75zM9.89,19c-0.13,0 -0.27,-0.03 -0.39,-0.09c-0.23,-0.11 -0.4,-0.29 -0.48,-0.52L8.51,17l5.22,-0.86l0.17,0.47c0.18,0.48 -0.07,1.02 -0.55,1.19l-3.13,1.15C10.11,18.98 10,19 9.89,19L9.89,19z',
  'M21.49,8.14c-0.05,0 -0.09,0.01 -0.14,0.02l-1.68,0.62c-0.21,0.08 -0.32,0.31 -0.24,0.51c0.06,0.16 0.21,0.26 0.38,0.26c0.04,0 0.09,-0.01 0.14,-0.03l1.68,-0.62c0.21,-0.08 0.31,-0.31 0.24,-0.51C21.8,8.24 21.65,8.14 21.49,8.14L21.49,8.14z',
  'M19.17,3.78c-0.13,0 -0.26,0.06 -0.34,0.18l-1.05,1.57c-0.12,0.18 -0.07,0.43 0.12,0.55c0.07,0.04 0.15,0.07 0.22,0.07c0.13,0 0.26,-0.06 0.33,-0.18L19.5,4.4c0.12,-0.18 0.07,-0.43 -0.11,-0.55C19.32,3.8 19.25,3.78 19.17,3.78L19.17,3.78z',
  'M20.73,12.45c-0.17,0 -0.33,0.11 -0.38,0.29c-0.06,0.21 0.06,0.43 0.27,0.49l1.81,0.52c0.04,0.01 0.08,0.02 0.11,0.02c0.17,0 0.33,-0.12 0.38,-0.29c0.06,-0.21 -0.06,-0.43 -0.27,-0.49l-1.81,-0.52C20.8,12.45 20.77,12.45 20.73,12.45L20.73,12.45z',
];

// ic_target_scheme_navigation: the flag, the pole, the base (viewport 19 x 22).
const FLAG = 'M6.39,2.1C7.3922,1.9937 8.4048,2.0477 9.39,2.26C11.59,2.64 14.39,3.44 16.54,2.49C16.8226,2.3577 17.1588,2.4315 17.36,2.67C17.5673,2.908 17.6107,3.2475 17.47,3.53C16.89,4.64 16.27,5.7 15.6,6.74C15.4452,6.9697 15.4452,7.2703 15.6,7.5C16.1159,8.2586 16.6839,8.9803 17.3,9.66C17.4701,9.8384 17.5444,10.0875 17.5,10.33C17.4,10.83 16.84,11 16.4,11.08C14.8081,11.4147 13.1696,11.4654 11.56,11.23C9.83,10.95 8.17,10.23 6.39,10.55';
const POLE = 'M4.16,18.73L4.16,1.91C4.16,1.6271 4.273,1.356 4.474,1.1569C4.675,0.9578 4.9471,0.8473 5.23,0.85C5.5119,0.8473 5.7831,0.9581 5.9825,1.1575C6.1819,1.3569 6.2927,1.6281 6.29,1.91L6.29,18.73';
const BASE = 'M17.825,19.565L17.825,19.565A1,1 0,0 1,16.825 20.565L1.825,20.565A1,1 0,0 1,0.825 19.565L0.825,19.565A1,1 0,0 1,1.825 18.565L16.825,18.565A1,1 0,0 1,17.825 19.565z';

function HomeIcon({ selected, accent = SOLV.blue }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      {selected
        ? <Path d={HOME_PATH} fill={accent} fillRule="evenodd" />
        : <Path d={HOME_PATH} fill="none" stroke={C.almostBlack} strokeWidth={1.6} strokeLinejoin="round" />}
    </Svg>
  );
}

function ExploreIcon({ selected, accent = SOLV.blue }) {
  const paths = selected ? EXPLORE_FILL : EXPLORE_LINE;
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      {paths.map((d, i) => <Path key={i} d={d} fill={selected ? accent : C.almostBlack} />)}
    </Svg>
  );
}

function TargetIcon({ selected, accent = SOLV.blue }) {
  const ink = selected ? accent : C.almostBlack;
  return (
    <Svg width={24} height={24} viewBox="-2.5 -1 24 24">
      <Path d={FLAG} fill={selected ? accent : 'none'} stroke={ink} strokeWidth={selected ? 1.2 : 1.1} strokeLinejoin="round" />
      <Path d={POLE} fill={selected ? accent : 'none'} stroke={ink} strokeWidth={1.1} />
      <Path d={BASE} fill={selected ? accent : 'none'} stroke={ink} strokeWidth={1.1} />
    </Svg>
  );
}

export const TABS = [
  { key: 'home', label: 'Home', Icon: HomeIcon },
  { key: 'explore', label: 'Explore', Icon: ExploreIcon },
  { key: 'schemes', label: 'Target Schemes', Icon: TargetIcon },
];

export default function SolvBottomNav({ selected = 'schemes', bottomInset = 0, onSelect, accent = SOLV.blue }) {
  return (
    <View style={[styles.bar, { height: NAV_H + bottomInset, paddingBottom: bottomInset }]} accessibilityRole="tablist">
      {TABS.map(({ key, label, Icon }) => {
        const on = key === selected;
        return (
          <Pressable
            key={key}
            style={styles.tab}
            onPress={() => onSelect && onSelect(key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            android_ripple={{ color: 'rgba(0,0,0,0.06)' }}
          >
            <View style={styles.icon}>
              <Icon selected={on} accent={accent} />
            </View>
            <Text style={[styles.label, on && styles.labelOn]} numberOfLines={1} allowFontScaling={false}>{label}</Text>
            {on ? <View style={[styles.indicator, { backgroundColor: accent }]} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: C.white,
    // CardView elevation 8dp: the shadow reads upward over the list.
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
    elevation: 8,
    zIndex: 2,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', height: NAV_H },
  icon: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  label: { marginTop: 3, color: C.greyText, fontFamily: F.medium, fontSize: 12, lineHeight: 14 },
  labelOn: { color: C.greyTextDark, fontFamily: F.bold },
  // TabLayout's indicator, 2dp on the app's brand colour, under the tab.
  indicator: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 2, backgroundColor: SOLV.blue },
});
