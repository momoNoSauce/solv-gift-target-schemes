// Colours and dimens used by the rewards (Jumbocoins scratch card) surfaces.
// res/values/colors.xml + res/values/dimens.xml
export const R = {
  white: '#ffffff',
  black: '#000000',
  black2: '#282828',          // black_2
  darkerGrey: '#4a4a4a',      // darker_grey
  grey4: '#666666',           // grey_4
  grey11: 'rgba(0,0,0,0.8)',  // grey_11 = #cc000000, reveal screen scrim
  greyishWhite: '#dfdfdf',
  lightGreen: '#58a159',      // light_green
  lightGreen5: '#C4E9C9',     // light_green_5, status label background
  green5: '#eaf4e9',          // green_5, win-exciting-rewards card
  green6: '#008015',          // green_6, expiry label text
  green9: '#99eaf4e9',        // green_9, expiry label background
  green10: '#f2f8f2',         // green_10
  green13: '#0c9700',         // green_13, see-details link
  brown2: '#B06D00',          // brown_2, Jumbocash/Jumbocoins applicability value
  brandGreen: '#2c552d',
  defaultBg: '#F7F7F7',
};

export const RD = {
  cornerSmall: 10,   // reward_bg_corner_radius_small = _10sdp
  cornerLarge: 20,   // reward_bg_corner_radius_large = _20sdp
  cardSmallW: 160,   // _160sdp
  cardSmallH: 172,   // _172sdp
  cardLarge: 240,    // _240sdp
  cardPostOrder: 260, // _260sdp
};

// res/xml/en_messages.xml
export const RM = {
  _my_rewards: 'My Rewards',
  _win_exciting_rewards: 'Win exciting rewards',
  _win_exciting_rewards_description: 'Earn Jumbocoins, Free delivery, discounts and much more',
  _win_exciting_rewards_cta_title: 'Shop Now',
  _see_details: 'VIEW DETAILS',
  _unscratched_card_title: 'Super!',
  _scratch_card_detail_subtitle: 'You have earned a scratch card',
  _added_on: 'Added on',
  _start_date: 'Start Date',
  _expired_on: 'Expired on',
  _used_on_date: 'Used on',
  _expires_on: 'Expires on',
  _never_expires: 'Never expires',
  _locked_scratch_card_title: 'PLACE AN ORDER TO UNLOCK SCRATCH CARD',
};
