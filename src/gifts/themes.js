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
      grad: ['#0A66E8', '#0847A6'],
      ground: '#0E63DD',
      ground2: '#0847A6',
      glowKey: '#FFFFFF',
      glowAmbient: '#5AA0FF',
      speck: '#FFFFFF',
      ink: '#FFFFFF',
      sub: '#E4EEFF',
      accent: '#FFFFFF',
      accentInk: '#0A66E8',
      accentDeep: '#0847A6',
      good: '#8CE0A9',
      urgent: '#FFC7A6',
      track: 'rgba(255,255,255,0.22)',
    },
    card: {
      dark: false,
      tint: '#EEF4FE',
      ink: '#1A1A1A',
      sub: '#6B6B6B',
      accent: '#0A66E8',
      accentInk: '#FFFFFF',
      accentDeep: '#0847A6',
      good: '#1E8E3E',
      urgent: '#C2410C',
      track: '#EDEDED',
    },
  },

  // Gold: the membership's own branding, the app's gold pill (ic_gold_exclusive:
  // a lilac field, a violet crown, a flame) turned into a night: deep violet
  // ground, the crown's colour in the glow, the flame's gold for the accent.
  gold: {
    key: 'gold',
    label: 'Gold',
    motif: null,
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

  diwali: {
    key: 'diwali',
    label: 'Diwali',
    motif: 'diya',
    stage: {
      grad: ['#160E33', '#2C1D57'],
      ground: '#1B1140',
      ground2: '#120B2B',
      glowKey: '#F2B84B',
      glowAmbient: '#5F3DC4',
      speck: '#F2C46B',
      ink: '#FFFFFF',
      sub: '#B9ACDF',
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
      sub: '#B9ACDF',
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

export const THEME_KEYS = Object.keys(THEMES);
