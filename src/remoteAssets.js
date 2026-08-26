// UI images the app itself loads from its CDNs, downloaded so the replica shows the same
// artwork instead of blank boxes:
//   d1vfjtt39xhg5z.cloudfront.net/encoded/hamburger_icons/*  (MenuItemEnum.kt)
//   ui-images.s3.ap-southeast-1.amazonaws.com/customer-app/* (en_messages.xml)
//   jtmerch.s3.ap-south-1.amazonaws.com/logos/*              (offer logos)
// product_image_placeholder.png is the app's own fallback for a missing product image.
export const REMOTE = {
  hbMyTargets: require('../assets/remote/hb_My_Targets.png'),
  hbMyRewards: require('../assets/remote/hb_My_Rewards.png'),
  hbJumbocash: require('../assets/remote/hb_Jumbocash.png'),
  hbSuperclub: require('../assets/remote/hb_Superclub.png'),
  hbMyOrders: require('../assets/remote/hb_My_Orders.png'),
  hbMyDeliveries: require('../assets/remote/hb_My_Deliveries.png'),
  hbMyPayments: require('../assets/remote/hb_My_Payments.png'),
  hbCredit: require('../assets/remote/hb_Credit.png'),
  hbLanguage: require('../assets/remote/hb_Language.png'),
  hbMyProfile: require('../assets/remote/hb_My_Profile.png'),
  hbPrivacy: require('../assets/remote/hb_Privacy_Policy.png'),
  hamburgerLogo: require('../assets/remote/hamburger_logo.png'),
  goldLogo: require('../assets/remote/gold_logo.png'),
  otpUnavailable: require('../assets/remote/otp_unavailable.png'),
  brandDefault: require('../assets/remote/brand_default.png'),
  productPlaceholder: require('../assets/remote/product_image_placeholder.png'),
  targetOfferSmall: require('../assets/remote/target_offer_small.png'),
  targetOfferDisabled: require('../assets/remote/target_offer_disabled.png'),
};
