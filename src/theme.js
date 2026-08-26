// Tokens copied 1:1 from mainandroidapp (jumbotail flavor).
// app/src/main/res/values/colors.xml + app/src/jumbotail/res/values/colors.xml
export const C = {
  brandGreen: '#2c552d',      // brand_green
  targetSchemeNative: '#58a159', // target_scheme_native (jumbotail flavor)
  lightGreen: '#58a159',      // light_green
  green: '#27ae60',           // green
  greyishWhite: '#dfdfdf',    // greyish_white (progress track, grey flag)
  lightGreyishWhite: '#efefef', // light_greyish_white (empty state bg)
  grey3: '#CCCCCC',           // grey_3 (card border)
  greyText: '#7F7F7F',        // grey_text
  greyTextDark: '#333333',    // grey_text_dark
  mediumGrey: '#7D7D7D',      // medium_grey
  brown3: '#8A726E',          // brown_3 (expiry label)
  yellowPale6: '#9F7164',     // yellow_pale_6 (transaction history "View")
  anotherRed: '#cb0f26',      // another_red (debit)
  red: '#FF0000',             // red (not eligible)
  blue1: '#023D8C',           // blue_1 (voice fab)
  black: '#000000',
  white: '#ffffff',
  defaultBg: '#F7F7F7',       // default_bg_color (window background)
  textPrimary: 'rgba(0,0,0,0.87)', // android textColorPrimary, light theme
  black50: 'rgba(0,0,0,0.5)', // black_50pc
  almostBlack: '#111111',
};

// Roboto*TextView subclasses in com.jumbotail.app.views
export const F = {
  regular: 'Roboto-Regular',
  medium: 'Roboto-Medium',
  bold: 'Roboto-Bold',
};

// values-sw360dp/dimens.xml: _NNsdp == NN dp, _NNssp == NN sp on a 360dp-wide phone
export const D = {
  toolbarHeight: 48,  // toolbar_height = _48sdp
  tabHeight: 48,      // Material TabLayout default
  listPaddingH: 10,   // fragment_target_scheme_running paddingHorizontal _10sdp
  cardGap: 12,        // ListItemDecoration(context, VERTICAL, 12)
};
