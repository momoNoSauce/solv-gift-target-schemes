// Mock browse-node payload for the cashback cards.
// CashbackCardLayout.kt reads entityData.availableOfferSection / appliedOfferSection,
// card codes COC (available offers) and CAOC (claimed offers only).
export const CASHBACK_NODE = {
  layoutType: 'COC',
  entityData: {
    headerText: 'Cashbacks',
    availableOfferSection: {
      cards: [
        {
          offerId: 'CB-5001',
          offerImageUrl: '',
          labelUrl: '',                   // no label image -> the badge stays invisible
          claimedOfferText: 'Sunfeast Cashback Offer',
          offerDescription: 'You got ₹10 cashback on ₹300 Sunfeast purchase!',
          ctaText: 'Claim  ₹10',
          claimedOfferValue: '10',
          offerNumericValue: 10,
        },
        {
          offerId: 'CB-5002',
          offerImageUrl: '',
          labelUrl: '',
          claimedOfferText: 'Coca-Cola Cashback Offer',
          offerDescription: 'You got ₹25 cashback on ₹1,200 Coca-Cola purchase!',
          ctaText: 'Claim  ₹25',
          claimedOfferValue: '25',
          offerNumericValue: 25,
        },
        {
          offerId: 'CB-5003',
          offerImageUrl: '',
          labelUrl: '',
          claimedOfferText: 'Lux Cashback Offer',
          offerDescription: 'You got ₹15 cashback on ₹500 Lux purchase!',
          ctaText: 'Claim  ₹15',
          claimedOfferValue: '15',
          offerNumericValue: 15,
        },
      ],
    },
    appliedOfferSection: {
      claimedSectionTitle: 'Total Cashbacks claimed',
      totalClaimedValues: 'Total: ₹40.00',
      offerItemViews: [
        { text: 'Parle Biscuits', value: '₹20.00', numericValue: 20, iconUrl: '', gold: false },
        { text: 'Surf Excel 1 kg', value: '₹20.00', numericValue: 20, iconUrl: '', gold: true },
      ],
    },
  },
};

export const CASHBACK_APPLIED_NODE = {
  layoutType: 'CAOC',
  entityData: {
    headerText: 'Cashbacks',
    availableOfferSection: { cards: [] },
    appliedOfferSection: CASHBACK_NODE.entityData.appliedOfferSection,
  },
};

export const VIEW_ALL_TEXT = 'VIEW ALL CASHBACK OFFERS';
