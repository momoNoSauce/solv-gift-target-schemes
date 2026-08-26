// Tokens read from the SuperClub web bundle
// https://superclub.jumbotail.com/generated/1.0.75/css/all.1.0.75.min.css
// body { letter-spacing: .1px } applies to every element on the page
export const SC_TRACKING = 0.1;

export const SC = {
  pageBg: '#f7f7f7',          // last body rule: background-color #f7f7f7
  // body { font-family: Roboto...; font-size: 13px; line-height: 1.846; color: #3a3a3a }
  bodyColor: '#3a3a3a',
  bodySize: 13,
  bodyLineHeight: 24, // 13 * 1.846

  navGreen: '#2c552d',          // .page-head background-color
  // .-deal, .SILVER-deal / .GOLD-deal gradients
  dealGreen: ['#326633', '#57923c', '#09360a'],
  dealGold: ['#2d1e30', '#59305f', '#2f1f32'],

  green: '#58a159',             // .inner-bar, .product-points-value, .status-done
  greenDash: '#6fa139',         // .available-customer-points border
  orange: '#d55d3b',            // .left-time, support number, DEBIT points
  grey: '#dfdfdf',              // .back-bar
  greyText: '#a1a1a1',
  stone: '#686868',             // .stone
  darkGrey: '#606060',          // .total-label, .reward-subtext
  pageName: '#3a3a3a',          // .page-name-new
  hr: '#979797',
  black: '#000000',
  white: '#ffffff',
  messageTitle: '#2c552d',
  goldBorder: '#ecd061',        // .gold-reward border
  cardBorder: '#dfdfdf',        // .redeemed-card-wrapper border
  rewardText: '#111111',
};

export const F = {
  regular: 'Roboto-Regular',
  medium: 'Roboto-Medium',
  bold: 'Roboto-Bold',
};

// Bootstrap 3 grid metrics used by every SuperClub template
export const GUTTER = 15;
