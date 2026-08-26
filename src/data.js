// Mock payloads shaped exactly like the API responses the screens consume.
// List cards  -> BrowseNodeModel.entityData (browse/models/EntityDataModel.java)
// Detail      -> SchemeMemberTarget (products/model/SchemeMemberTarget.java)
// History     -> TargetSchemeHistoryDto (target/data/remote/dto/target_scheme_history_dto)

// payoutIcon on the wire is a URL. The two payout modes in PayoutBO are CASHBACK
// (rupee value, credited as Jumbocash) and JUMBOCOIN (SuperClub Jumbocoins), so the replica
// carries the mode and draws ic_jumbocash_icon or ic_jumbo_coins accordingly.
const JUMBOCASH = 'jumbocash';
const JUMBOCOINS = 'jumbocoins';

export const RUNNING_SCHEMES = [
  {
    entityId: 'TS-100023451',
    nextPageType: 'TARGET_SCHEME_DETAILS',
    entityData: {
      logo: '',
      localizedTitle: "Garnier Men's Products - (16th - 22nd Dec, 24)",
      localizedSubText: "Buy Garnier Men's products for <b>₹1,200</b> more and get <b>₹50</b> Jumbocash",
      localizedLabel: 'In 6 Days',
      labelBgColor: '#8A726E',
      currentValueLabel: '₹800',
      currentAchievedValue: 800,
      progressPercentage: 40,
      progressColor: '#58a159',
      progressIcon: 'standing_man',
      mileStoneDisplayBOList: [
        { milestoneValue: 1000, milestoneDisplayValue: '₹1,000', payoutValue: '20', payoutIcon: JUMBOCASH },
        { milestoneValue: 2000, milestoneDisplayValue: '₹2,000', payoutValue: '50', payoutIcon: JUMBOCASH },
      ],
    },
  },
  {
    entityId: 'TS-100023452',
    nextPageType: 'TARGET_SCHEME_DETAILS',
    entityData: {
      logo: 'gold',
      localizedTitle: 'All Products (Excluding Sugar & Edible Oil) - (1st - 31st Aug, 26)',
      localizedSubText: 'Buy for <b>₹6,000</b> more and get <b>250</b> Jumbocoins',
      localizedLabel: 'In 11 Days',
      labelBgColor: '#8A726E',
      currentValueLabel: '₹4,000',
      currentAchievedValue: 4000,
      progressPercentage: 40,
      progressColor: '#58a159',
      progressIcon: 'standing_man',
      mileStoneDisplayBOList: [
        { milestoneValue: 5000, milestoneDisplayValue: '₹5,000', payoutValue: '100', payoutIcon: JUMBOCOINS },
        { milestoneValue: 10000, milestoneDisplayValue: '₹10,000', payoutValue: '250', payoutIcon: JUMBOCOINS },
      ],
    },
  },
  {
    entityId: 'TS-100023453',
    nextPageType: 'TARGET_SCHEME_DETAILS',
    entityData: {
      logo: '',
      localizedTitle: 'Coca-Cola Beverages - (15th - 21st Aug, 26)',
      localizedSubText: 'Target complete. <b>Jumbocash</b> is credited after the scheme ends',
      localizedLabel: '<font color="#d55d3b">In 1 Day</font>',
      labelBgColor: '#8A726E',
      currentValueLabel: '₹3,000',
      currentAchievedValue: 3000,
      progressPercentage: 100,
      progressColor: '#58a159',
      progressIcon: 'standing_man',
      mileStoneDisplayBOList: [
        { milestoneValue: 3000, milestoneDisplayValue: '₹3,000', payoutValue: '75', payoutIcon: JUMBOCASH },
      ],
    },
  },
];

export const COMPLETED_SCHEMES = [
  {
    entityId: 'TS-100019870',
    nextPageType: 'TARGET_SCHEME_DETAILS',
    entityData: {
      logo: '',
      localizedTitle: 'Parle Biscuits - (1st - 15th Jul, 26)',
      localizedSubText: 'You earned <b>₹100</b> Jumbocash in this scheme',
      localizedLabel: 'Ended',
      labelBgColor: '#8A726E',
      currentValueLabel: '₹4,000',
      currentAchievedValue: 4000,
      progressPercentage: 100,
      progressColor: '#58a159',
      progressIcon: 'standing_man',
      mileStoneDisplayBOList: [
        { milestoneValue: 4000, milestoneDisplayValue: '₹4,000', payoutValue: '100', payoutIcon: JUMBOCASH },
      ],
    },
  },
  {
    entityId: 'TS-100019871',
    nextPageType: 'TARGET_SCHEME_DETAILS',
    entityData: {
      logo: '',
      localizedTitle: 'HUL Home Care - (1st - 30th Jun, 26)',
      localizedSubText: 'You did not reach the first milestone in this scheme',
      localizedLabel: 'Ended',
      labelBgColor: '#8A726E',
      currentValueLabel: '₹1,800',
      currentAchievedValue: 1800,
      progressPercentage: 36,
      progressColor: '#58a159',
      progressIcon: 'standing_man',
      mileStoneDisplayBOList: [
        { milestoneValue: 2500, milestoneDisplayValue: '₹2,500', payoutValue: '50', payoutIcon: JUMBOCASH },
        { milestoneValue: 5000, milestoneDisplayValue: '₹5,000', payoutValue: '120', payoutIcon: JUMBOCASH },
      ],
    },
  },
];

// SchemeMemberTarget per targetSchemeId
export const SCHEME_DETAILS = {
  'TS-100023451': {
    schemeMemberTargetBO: {
      schemeMemberTargetId: 'SMT-800045121',
      targetSchemeId: 'TS-100023451',
      currentValue: 800,
      milestoneBOs: [
        { milestoneId: 'MS-200001', atValue: 1000, payout: { payoutMode: 'CASHBACK', payoutType: 'ABSOLUTE', value: 20 } },
        { milestoneId: 'MS-200002', atValue: 2000, payout: { payoutMode: 'CASHBACK', payoutType: 'ABSOLUTE', value: 50 } },
      ],
      targetSchemeBO: {
        purposeType: 'GROWTH',
        startTime: Date.UTC(2024, 11, 16),
        endTime: Date.UTC(2024, 11, 22),
        schemeItemRules: {
          includedEntries: { manufacturer: ["Garnier Men's"], category: ['Personal Care'] },
          excludedEntries: { brand: ['Garnier Color Naturals'] },
        },
      },
    },
    displayData: {
      title: "Garnier Men's Products - (16th - 22nd Dec, 24)",
      subtitle: 'Valid till 22nd Dec',
      description: 'Buy above ₹2,000 and get up to ₹50 Jumbocash',
      footerLabel: '',
      payoutModeIcon: JUMBOCASH,
      milestoneSubtext: 'Jumbocash',
      deepLinkUrl: 'jumbotail://plv?listViewId=target_scheme_items&targetId=TS-100023451',
    },
  },
  'TS-100023452': {
    schemeMemberTargetBO: {
      schemeMemberTargetId: 'SMT-800045122',
      targetSchemeId: 'TS-100023452',
      currentValue: 4000,
      milestoneBOs: [
        { milestoneId: 'MS-200003', atValue: 5000, payout: { payoutMode: 'JUMBOCOIN', payoutType: 'ABSOLUTE', value: 100 } },
        { milestoneId: 'MS-200004', atValue: 10000, payout: { payoutMode: 'JUMBOCOIN', payoutType: 'ABSOLUTE', value: 250 } },
      ],
      targetSchemeBO: {
        purposeType: 'MEMBERSHIP_BENEFIT',
        startTime: Date.UTC(2026, 7, 1),
        endTime: Date.UTC(2026, 7, 31),
        schemeItemRules: {
          includedEntries: { all: ['All Products'] },
          excludedEntries: { category: ['Sugar', 'Edible Oil'] },
        },
      },
    },
    displayData: {
      title: 'All Products (Excluding Sugar & Edible Oil) - (1st - 31st Aug, 26)',
      subtitle: 'Valid till 31st Aug',
      description: 'Buy above ₹10,000 and get up to 250 Jumbocoins',
      footerLabel: '',
      payoutModeIcon: JUMBOCOINS,
      milestoneSubtext: 'Jumbocoins',
      deepLinkUrl: 'jumbotail://plv?listViewId=target_scheme_items&targetId=TS-100023452',
    },
  },
  'TS-100023453': {
    schemeMemberTargetBO: {
      schemeMemberTargetId: 'SMT-800045123',
      targetSchemeId: 'TS-100023453',
      currentValue: 3000,
      milestoneBOs: [{ milestoneId: 'MS-200005', atValue: 3000, payout: { payoutMode: 'CASHBACK', payoutType: 'ABSOLUTE', value: 75 } }],
      targetSchemeBO: {
        purposeType: 'GROWTH',
        startTime: Date.UTC(2026, 7, 15),
        endTime: Date.UTC(2026, 7, 21),
        schemeItemRules: {
          includedEntries: { manufacturer: ['Coca-Cola'] },
          excludedEntries: {},
        },
      },
    },
    displayData: {
      title: 'Coca-Cola Beverages - (15th - 21st Aug, 26)',
      subtitle: 'Valid till 21st Aug',
      description: 'Buy above ₹3,000 and get up to ₹75 Jumbocash',
      footerLabel: '₹75 Jumbocash will be credited to you after the scheme ends',
      payoutModeIcon: JUMBOCASH,
      milestoneSubtext: 'Jumbocash',
      deepLinkUrl: 'jumbotail://plv?listViewId=target_scheme_items&targetId=TS-100023453',
    },
  },
  'TS-100019870': {
    schemeMemberTargetBO: {
      schemeMemberTargetId: 'SMT-800039901',
      targetSchemeId: 'TS-100019870',
      currentValue: 4000,
      milestoneBOs: [{ milestoneId: 'MS-200006', atValue: 4000, payout: { payoutMode: 'CASHBACK', payoutType: 'ABSOLUTE', value: 100 } }],
      targetSchemeBO: {
        purposeType: 'GROWTH',
        startTime: Date.UTC(2026, 6, 1),
        endTime: Date.UTC(2026, 6, 15),
        schemeItemRules: {
          includedEntries: { manufacturer: ['Parle Products'] },
          excludedEntries: {},
        },
      },
    },
    displayData: {
      title: 'Parle Biscuits - (1st - 15th Jul, 26)',
      subtitle: 'Ended on 15th Jul',
      description: 'Buy above ₹4,000 and get up to ₹100 Jumbocash',
      footerLabel: '',
      payoutModeIcon: JUMBOCASH,
      milestoneSubtext: 'Jumbocash',
      deepLinkUrl: 'jumbotail://plv?listViewId=target_scheme_items&targetId=TS-100019870',
    },
  },
  'TS-100019871': {
    schemeMemberTargetBO: {
      schemeMemberTargetId: 'SMT-800039902',
      targetSchemeId: 'TS-100019871',
      currentValue: 1800,
      milestoneBOs: [
        { milestoneId: 'MS-200007', atValue: 2500, payout: { payoutMode: 'CASHBACK', payoutType: 'ABSOLUTE', value: 50 } },
        { milestoneId: 'MS-200008', atValue: 5000, payout: { payoutMode: 'CASHBACK', payoutType: 'ABSOLUTE', value: 120 } },
      ],
      targetSchemeBO: {
        purposeType: 'GROWTH',
        startTime: Date.UTC(2026, 5, 1),
        endTime: Date.UTC(2026, 5, 30),
        schemeItemRules: {
          includedEntries: { manufacturer: ['Hindustan Unilever'], category: ['Home Care'] },
          excludedEntries: { brand: ['Surf Excel Bar'] },
        },
      },
    },
    displayData: {
      title: 'HUL Home Care - (1st - 30th Jun, 26)',
      subtitle: 'Ended on 30th Jun',
      description: 'Buy above ₹5,000 and get up to ₹120 Jumbocash',
      footerLabel: '',
      payoutModeIcon: JUMBOCASH,
      milestoneSubtext: 'Jumbocash',
      deepLinkUrl: 'jumbotail://plv?listViewId=target_scheme_items&targetId=TS-100019871',
    },
  },
};

// GET /target-scheme/history/{smtId}
export const SCHEME_HISTORY = {
  'SMT-800045121': {
    schemeMemberTargetId: 'SMT-800045121',
    dailyTransactionResponseList: [
      { date: Date.UTC(2024, 11, 20), labelString: '20 Dec 2024', transactionType: 'CREDIT', value: 320 },
      { date: Date.UTC(2024, 11, 19), labelString: '19 Dec 2024', transactionType: 'DEBIT', value: 140 },
      { date: Date.UTC(2024, 11, 18), labelString: '18 Dec 2024', transactionType: 'CREDIT', value: 460 },
      { date: Date.UTC(2024, 11, 17), labelString: '17 Dec 2024', transactionType: 'CREDIT', value: 160 },
    ],
  },
  'SMT-800045122': {
    schemeMemberTargetId: 'SMT-800045122',
    dailyTransactionResponseList: [
      { date: Date.UTC(2026, 7, 18), labelString: '18 Aug 2026', transactionType: 'CREDIT', value: 1250 },
      { date: Date.UTC(2026, 7, 14), labelString: '14 Aug 2026', transactionType: 'CREDIT', value: 1900 },
      { date: Date.UTC(2026, 7, 9), labelString: '9 Aug 2026', transactionType: 'DEBIT', value: 350 },
      { date: Date.UTC(2026, 7, 4), labelString: '4 Aug 2026', transactionType: 'CREDIT', value: 1200 },
    ],
  },
  'SMT-800045123': {
    schemeMemberTargetId: 'SMT-800045123',
    dailyTransactionResponseList: [
      { date: Date.UTC(2026, 7, 19), labelString: '19 Aug 2026', transactionType: 'CREDIT', value: 1900 },
      { date: Date.UTC(2026, 7, 16), labelString: '16 Aug 2026', transactionType: 'CREDIT', value: 1100 },
    ],
  },
  'SMT-800039901': {
    schemeMemberTargetId: 'SMT-800039901',
    dailyTransactionResponseList: [
      { date: Date.UTC(2026, 6, 12), labelString: '12 Jul 2026', transactionType: 'CREDIT', value: 2000 },
      { date: Date.UTC(2026, 6, 6), labelString: '6 Jul 2026', transactionType: 'CREDIT', value: 2000 },
    ],
  },
  'SMT-800039902': {
    schemeMemberTargetId: 'SMT-800039902',
    dailyTransactionResponseList: [
      { date: Date.UTC(2026, 5, 22), labelString: '22 Jun 2026', transactionType: 'CREDIT', value: 900 },
      { date: Date.UTC(2026, 5, 11), labelString: '11 Jun 2026', transactionType: 'CREDIT', value: 900 },
    ],
  },
};

// EntityDataModel.getLastMileStone() / getIntermediateMilestones()
export function lastMilestone(list) {
  return list.reduce((a, b) => (b.milestoneValue > a.milestoneValue ? b : a), list[0]);
}
export function intermediateMilestones(list) {
  const last = lastMilestone(list);
  return list.filter((m) => m.milestoneValue !== last.milestoneValue);
}

// PayoutBO.getText(): prefix ₹ for CASHBACK, append % for PERCENTAGE
export function payoutText(payout) {
  if (!payout) return '';
  let out = '';
  if (payout.payoutMode === 'CASHBACK') out += '₹';
  out += Math.trunc(payout.value);
  if (payout.payoutType === 'PERCENTAGE') out += '%';
  return out;
}

// PayoutBO.getDrawable() returns ic_jumbo_coins for JUMBOCOIN only; the live screens load
// displayData.payoutModeIcon from the API. 'jumbocash' -> ic_jumbocash_icon (green note),
// 'jumbocoins' -> ic_jumbo_coins (gold coin).
export function payoutIconName(payout) {
  return payout?.payoutMode === 'JUMBOCOIN' ? 'jumbocoins' : 'jumbocash';
}

// Utils.indianPrice()
export function indianPrice(value) {
  const n = Number(value);
  const s = Math.round(n).toString();
  if (s.length <= 3) return '₹' + s;
  const head = s.slice(0, s.length - 3);
  const tail = s.slice(s.length - 3);
  return '₹' + head.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + tail;
}

// MessagesManager keys, resolved from res/xml/en_messages.xml
export const M = {
  _target_scheme: 'My Targets',
  _running_schemes: 'Running Schemes',
  _completed_schemes: 'Completed Schemes',
  _scheme_details: 'Scheme Details',
  _transaction_history: 'Transaction History',
  _amount_contributed: 'Amount contributed towards the scheme',
  _maximum_reward: 'Maximum reward',
  _scheme_rules: 'Scheme Rules',
  _scheme_rules_desc: 'Following company/brand/category/products are eligible',
  _except: 'Except',
  _top_items_target: 'Top items for this scheme',
  _view: 'View',
  _eligible: 'Eligible',
  _not_eligible: 'Not Eligible',
  _no_targets_available: 'No target schemes are available',
  _go_to_home: 'Go to Home Page',
  _valid_from_time_to_time: 'Valid from %$ to %$',
};
