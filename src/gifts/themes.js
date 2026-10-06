// Scheme themes.
//
// The scheme framework has one DEFAULT theme (Solv chrome) and a set of FESTIVE
// themes. A theme is picked when the scheme is created: the scheme master row
// carries a `theme_key` column, set in the creation form (Rambo) from this
// registry. The client resolves the key here; an unknown or absent key falls
// back to `default`, so an old app version never breaks on a new theme.
//
// A theme is only paint. Layout, copy and the state machine (src/gifts/state.js)
// stay identical across themes, so a festive scheme can never behave differently
// from a plain one.
//
// Each theme carries two token groups:
//   stage  the detail page hero and the festive list card (dark gradient).
//   card   the list card. Festive themes reuse the stage look (card.dark=true);
//          the default theme renders the plain white card (card.dark=false).
//
// Contrast rule: `accent` must read on the stage gradient; `accentDeep` must
// read on white; `accentInk` is the text color on an accent-filled surface.

export const THEMES = {
  default: {
    key: 'default',
    label: 'Default',
    motif: null,
    stage: {
      // Solv's primary_color #004FFA falling to primary_dark #0038CC, the
      // toolbar's own blues (src/gifts/solv.js SOLV.blue, SOLV.blueDark).
      grad: ['#004FFA', '#0038CC'],
      ground: '#004FFA',
      ground2: '#0038CC',
      glowKey: '#FFFFFF',
      glowAmbient: '#5AA0FF',
      speck: '#FFFFFF',
      ink: '#FFFFFF',
      sub: '#E4EEFF',
      accent: '#FFFFFF',
      accentInk: '#004FFA',
      accentDeep: '#0038CC',
      good: '#8CE0A9',
      urgent: '#FFC7A6',
      track: 'rgba(255,255,255,0.22)',
    },
    card: {
      dark: false,
      tint: '#E6F0FF',
      ink: '#1A1A1A',
      sub: '#6B6B6B',
      accent: '#004FFA',
      accentInk: '#FFFFFF',
      accentDeep: '#0038CC',
      good: '#177E36',
      urgent: '#C2410C',
      track: '#EDEDED',
    },
  },

  // Jumbotail's default paint, two drawings, both from the app's own greens
  // (brand_green #2c552d, light_green #58a159). The meter keeps its seal green
  // for the done run on Solv; on a green night it would vanish, so these
  // themes carry a light `meterGood` and the check's ink follows.
  //   jtA  Forest: the brand green as a deep night, white accent, the light
  //        green in the glow. Quiet, close to the app's toolbar.
  //   jtB  Meadow: the light green as a brighter ground falling to the brand
  //        green, a warm yellow accent. Livelier, the festive schemes' cousin.
  jtA: {
    key: 'jtA',
    label: 'Jumbotail Forest',
    motif: null,
    stage: {
      grad: ['#2F6B32', '#1B3A1C'],
      ground: '#2C552D',
      ground2: '#1B3A1C',
      glowKey: '#FFFFFF',
      glowAmbient: '#58A159',
      speck: '#D7F2D9',
      ink: '#FFFFFF',
      sub: '#D6EAD7',
      accent: '#FFFFFF',
      accentInk: '#2C552D',
      accentDeep: '#2C552D',
      good: '#8CE0A9',
      meterGood: '#8CE0A9',
      urgent: '#FFD4A6',
      track: 'rgba(255,255,255,0.22)',
    },
    card: {
      dark: true,
      tint: '#EAF4EA',
      ink: '#FFFFFF',
      sub: '#D6EAD7',
      accent: '#2C552D',
      accentInk: '#FFFFFF',
      accentDeep: '#2C552D',
      good: '#177E36',
      urgent: '#C2410C',
      track: 'rgba(255,255,255,0.22)',
    },
  },
  jtB: {
    key: 'jtB',
    label: 'Jumbotail Meadow',
    motif: null,
    stage: {
      grad: ['#4CA150', '#2C552D'],
      ground: '#3E8E41',
      ground2: '#2C552D',
      glowKey: '#FFF7C2',
      glowAmbient: '#A5DE7A',
      speck: '#FFFFFF',
      ink: '#FFFFFF',
      sub: '#E3F3E1',
      accent: '#FFE07A',
      accentInk: '#2C552D',
      accentDeep: '#2C552D',
      good: '#CFF7D6',
      meterGood: '#CFF7D6',
      urgent: '#FFD4A6',
      track: 'rgba(255,255,255,0.24)',
    },
    card: {
      dark: true,
      tint: '#EEF7E9',
      ink: '#FFFFFF',
      sub: '#E3F3E1',
      accent: '#3E8E41',
      accentInk: '#FFFFFF',
      accentDeep: '#2C552D',
      good: '#177E36',
      urgent: '#C2410C',
      track: 'rgba(255,255,255,0.24)',
    },
  },

  // Gold: the membership's own branding, the app's gold pill (ic_gold_exclusive:
  // a lilac field, a violet crown, a flame) turned into a night: deep violet
  // ground, the crown's colour in the glow, the flame's gold for the accent.
  gold: {
    key: 'gold',
    label: 'Gold',
    motif: null,
    // The page below the stage wears Mega Diwali's paint (pageThemeOf); the
    // stage keeps the Gold night.
    page: 'diwali',
    stage: {
      grad: ['#3B0F6E', '#1E0740'],
      ground: '#3B0F6E',
      ground2: '#1E0740',
      glowKey: '#F1C7FF',
      glowAmbient: '#A922A3',
      speck: '#FFE08A',
      ink: '#FFFFFF',
      sub: '#E4CFF7',
      accent: '#FFC94A',
      accentInk: '#2A0B4A',
      accentDeep: '#E3A62B',
      good: '#8CE0A9',
      urgent: '#FFC7A6',
      track: 'rgba(255,255,255,0.22)',
    },
    card: {
      dark: true,
      tint: '#F4E8FF',
      ink: '#FFFFFF',
      sub: '#E4CFF7',
      accent: '#FFC94A',
      accentInk: '#2A0B4A',
      accentDeep: '#6909B8',
      good: '#8CE0A9',
      urgent: '#FFC7A6',
      track: 'rgba(255,255,255,0.22)',
    },
  },

  // Diwali's stage is a picture (stage.image, 6 Oct 2026). The colours below
  // stay for what the picture does not cover: the pager's backdrop and the
  // page's confirm button (ground2), the secondary notes (sub, a warm cream),
  // and the drawn scene should the picture be removed. They were picked from a
  // photo of a lit rangoli: the dark warm floor falling to its shadow, the lit
  // wall's amber as the ambient glow, the flame's core as the key glow.
  diwali: {
    key: 'diwali',
    label: 'Diwali',
    motif: 'diya',
    stage: {
      // Hanging gold diyas over an amber ground lightening to gold, with bokeh; replaces the scene and its shader
      // on the stage, covering it and centred (Stage.js).
      image: require('../../assets/stages/diwali.jpg'),
      grad: ['#6D2400', '#330400'],
      ground: '#6D2400',
      ground2: '#330400',
      glowKey: '#FEE72B',
      glowAmbient: '#CE6A00',
      speck: '#FEE72B',
      ink: '#FFFFFF',
      sub: '#F2CBA6',
      accent: '#F2B84B',
      accentInk: '#160E33',
      accentDeep: '#9A5F0B',
      good: '#6FDB9B',
      urgent: '#FF8A5B',
      track: 'rgba(255,255,255,0.16)',
    },
    card: {
      dark: true,
      tint: '#FBF2DF',
      ink: '#FFFFFF',
      sub: '#F2CBA6',
      accent: '#F2B84B',
      accentInk: '#160E33',
      accentDeep: '#9A5F0B',
      good: '#6FDB9B',
      urgent: '#FF8A5B',
      track: 'rgba(255,255,255,0.16)',
    },
  },

  onam: {
    key: 'onam',
    label: 'Onam',
    motif: 'flower',
    stage: {
      grad: ['#0B3A2A', '#14573F'],
      ground: '#0F4936',
      ground2: '#092E22',
      glowKey: '#F5C04E',
      glowAmbient: '#2C8C63',
      speck: '#F5CC6E',
      ink: '#FFFFFF',
      sub: '#A9CFBB',
      accent: '#F5C04E',
      accentInk: '#0B3A2A',
      accentDeep: '#8F6200',
      good: '#8CE0A9',
      urgent: '#FF9E7A',
      track: 'rgba(255,255,255,0.16)',
    },
    card: {
      dark: true,
      tint: '#EDF7F0',
      ink: '#FFFFFF',
      sub: '#A9CFBB',
      accent: '#F5C04E',
      accentInk: '#0B3A2A',
      accentDeep: '#8F6200',
      good: '#8CE0A9',
      urgent: '#FF9E7A',
      track: 'rgba(255,255,255,0.16)',
    },
  },

  holi: {
    key: 'holi',
    label: 'Holi',
    motif: 'sparkle',
    stage: {
      grad: ['#3D0E4E', '#7A1E63'],
      ground: '#4A1259',
      ground2: '#32093E',
      glowKey: '#FFC93C',
      glowAmbient: '#D8409B',
      speck: '#FF9AD5',
      ink: '#FFFFFF',
      sub: '#E3B8D9',
      accent: '#FFC93C',
      accentInk: '#3D0E4E',
      accentDeep: '#9C6500',
      good: '#8CE0A9',
      urgent: '#FF9E7A',
      track: 'rgba(255,255,255,0.16)',
    },
    card: {
      dark: true,
      tint: '#F8EEF6',
      ink: '#FFFFFF',
      sub: '#E3B8D9',
      accent: '#FFC93C',
      accentInk: '#3D0E4E',
      accentDeep: '#9C6500',
      good: '#8CE0A9',
      urgent: '#FF9E7A',
      track: 'rgba(255,255,255,0.16)',
    },
  },
};

export function themeOf(key) {
  return THEMES[key] || THEMES.default;
}

// The theme that paints the page below the stage: the scheme's own, unless it
// borrows a sibling's (`page`). The stage always wears the scheme's own theme.
export function pageThemeOf(key) {
  const th = themeOf(key);
  return th.page ? themeOf(th.page) : th;
}

export const THEME_KEYS = Object.keys(THEMES);
