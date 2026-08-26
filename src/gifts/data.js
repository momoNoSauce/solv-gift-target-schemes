import { C } from '../theme';
import { indianPrice } from '../data';
import { schemeState, STATE } from './state';

// Mega Diwali Gift Scheme for Solv app customers.
// Source of the ladders: "Final Working for Mega Diwali Scheme.xlsx" (sheet "Final Gift
// Summary"). GTV slabs are in lakhs in the sheet; here they are absolute rupees.
// The campaign window (1 Oct - 9 Nov 2026) is an assumption; the sheet has no dates.
//
// Two design flows read this file:
//   Flow A (/gift-targets)  - the gift scheme forced into the current target scheme
//                             paradigm. Milestones cap at 4 (target_scheme schema:
//                             milestone_1..4), so each ladder is cut to 4 slabs.
//   Flow B (/mega-diwali)   - a new experience. It renders the full ladder.

export const CAMPAIGN = {
  title: 'Mega Diwali Gifts',
  startLabel: '1 Oct 2026',
  endLabel: '9 Nov 2026',
  daysLeft: 21,                       // mock "today" = 19 Oct 2026
  deliverByLabel: '21 Nov 2026',
};

const L = 100000; // 1 lakh

// One customer is enrolled in one category ladder. The BG inclusion rule
// (gir_should_include) decides which one. The mock member is on Lifestyle.
export const MEMBER = { ladderKey: 'lifestyle' };

// Product photos, pulled from the product pages linked in the sheet
// (m.media-amazon.com / rukminim2.flixcart.com), stored as local assets.
// The Bosch 207 L has no verified photo (Amazon lists newer capacities only), so
// that tier keeps its line glyph rather than wearing another fridge's picture.
const IMG = {
  mixer: require('../../assets/gifts/mixer.jpg'),
  airfryer: require('../../assets/gifts/airfryer.jpg'),
  soundbar: require('../../assets/gifts/soundbar.jpg'),
  vacuum: require('../../assets/gifts/vacuum.jpg'),
  phone: require('../../assets/gifts/phone.jpg'),
  fridge: require('../../assets/gifts/fridge.jpg'),
  tv: require('../../assets/gifts/tv.jpg'),
  iphone17: require('../../assets/gifts/iphone17.jpg'),
  kettle: require('../../assets/gifts/kettle.jpg'),
  watch: require('../../assets/gifts/watch.jpg'),
  microwave: require('../../assets/gifts/microwave.jpg'),
};

// Full ladders, as in the sheet. shortName must stay short: it renders in 100dp markers.
// Both ladders stay in this file because both exist across the customer base; a single
// customer sees only the ladder they are enrolled in.
export const LADDERS = [
  {
    key: 'lifestyle',
    label: 'Lifestyle',
    scopeLine: 'Lifestyle products only (no electronics)',
    tiers: [
      { at: 2 * L,   name: 'NutriPro Juicer Mixer Grinder', shortName: 'Mixer',     icon: 'mixer',    image: IMG.mixer },
      { at: 5 * L,   name: 'Pigeon Healthifry Air Fryer',   shortName: 'Air Fryer', icon: 'airfryer', image: IMG.airfryer },
      { at: 10 * L,  name: 'boAt Aavante Bar Soundbar',     shortName: 'Soundbar',  icon: 'soundbar', image: IMG.soundbar },
      { at: 15 * L,  name: 'Philips PowerPro Vacuum Cleaner', shortName: 'Vacuum',  icon: 'vacuum',   image: IMG.vacuum },
      { at: 20 * L,  name: 'Samsung Galaxy F06 5G',         shortName: 'Phone',     icon: 'phone',    image: IMG.phone },
      { at: 30 * L,  name: 'Samsung 236 L Double Door Refrigerator', shortName: 'Fridge', icon: 'fridge', image: IMG.fridge },
      { at: 40 * L,  name: 'Philips 50 inch 4K QLED TV',    shortName: 'Smart TV',  icon: 'tv',       image: IMG.tv },
      { at: 120 * L, name: 'iPhone 17',                     shortName: 'iPhone 17', icon: 'phone',    image: IMG.iphone17 },
    ],
    // mock member state
    currentValue: 6.4 * L,
  },
  {
    key: 'electronics',
    label: 'Electronics',
    scopeLine: 'Electronics products only',
    tiers: [
      { at: 1 * L,   name: 'Pigeon Amaze Plus Electric Kettle', shortName: 'Kettle', icon: 'kettle', image: IMG.kettle },
      { at: 2 * L,   name: 'Fire-Boltt Brillia Smart Watch', shortName: 'Watch',    icon: 'watch',   image: IMG.watch },
      { at: 5 * L,   name: 'Pigeon Healthifry Air Fryer',   shortName: 'Air Fryer', icon: 'airfryer', image: IMG.airfryer },
      { at: 10 * L,  name: 'boAt Aavante Bar Soundbar',     shortName: 'Soundbar',  icon: 'soundbar', image: IMG.soundbar },
      { at: 15 * L,  name: 'Godrej 20 L Solo Microwave Oven', shortName: 'Microwave', icon: 'microwave', image: IMG.microwave },
      { at: 20 * L,  name: 'Philips PowerPro Vacuum Cleaner', shortName: 'Vacuum',  icon: 'vacuum',  image: IMG.vacuum },
      { at: 30 * L,  name: 'Samsung Galaxy F06 5G',         shortName: 'Phone',     icon: 'phone',   image: IMG.phone },
      { at: 40 * L,  name: 'Bosch 207 L Refrigerator',      shortName: 'Fridge',    icon: 'fridge',  image: null },
      { at: 150 * L, name: 'iPhone 17',                     shortName: 'iPhone 17', icon: 'phone',   image: IMG.iphone17 },
    ],
    currentValue: 1.75 * L,
  },
];

// Compact lakh label: 640000 -> "₹6.4L", 175000 -> "₹1.75L", 200000 -> "₹2L".
// Never round: a compact label that changes the number breaks trust in the meter.
export function lakh(v) {
  // Below a lakh the compact form reads worse than the number: "₹0.4L" and "₹0L" are
  // both harder to parse than "₹40,000" and "₹0". Fall back to the plain format.
  if (v < L) return indianPrice(v);
  // From a crore up, the trade says crore: "₹1.2Cr", never "₹120L".
  if (v >= 100 * L) {
    const c = Math.round((v / (100 * L)) * 100) / 100;
    return '₹' + String(c) + 'Cr';
  }
  const n = Math.round((v / L) * 100) / 100;
  return '₹' + String(n) + 'L';
}

// Ladder state for a member: secured tier (highest crossed), next tier, remaining amount.
export function ladderState(ladder) {
  const crossed = ladder.tiers.filter((t) => ladder.currentValue >= t.at);
  const secured = crossed.length ? crossed[crossed.length - 1] : null;
  const next = ladder.tiers.find((t) => ladder.currentValue < t.at) || null;
  const remaining = next ? next.at - ladder.currentValue : 0;
  return { secured, next, remaining };
}

// ---------------------------------------------------------------------------
// Flow A: the same campaign expressed as target_scheme rows. The schema allows
// milestone_1..4 only, so the merch team must pick 4 of the 8-9 slabs per ladder.
// The payoutMode 'GIFT' does not exist in PayoutBO today; it is the first change
// the current paradigm needs.
// ---------------------------------------------------------------------------

function tier(ladder, atLakhs) {
  return ladder.tiers.find((t) => t.at === atLakhs * L);
}

const LIFESTYLE = LADDERS[0];

// ---------------------------------------------------------------------------
// Card payloads. Every field a card shows is derived from one state, so the chip,
// the sentence and the meter cannot disagree with each other. The card itself calls
// schemeState() again for the ladder facts; this builder only writes the copy.
// ---------------------------------------------------------------------------

// mock "today" = 19 Oct 2026
export const NOW = Date.UTC(2026, 9, 19);
const START = Date.UTC(2026, 9, 1);
const END = Date.UTC(2026, 10, 9);

function copyFor(s, ladder) {
  // "All Products" must not become "All Products products".
  const scope = /products?$/i.test(ladder.label) ? ladder.label : ladder.label + ' products';
  switch (s.state) {
    case STATE.SCHEDULED:
      return `Buy ${scope} from ${s.startLabel} and win gifts up to the ${s.top.shortName}`;
    case STATE.LIVE:
      // "more" only once some buying already counts toward the scheme.
      return `Buy <b>${indianPrice(s.remaining)}</b>${s.currentValue > 0 ? ' more' : ''} of ${scope} and the ${s.next.shortName} is yours`;
    case STATE.NEAR_SLAB:
      return `Only <b>${indianPrice(s.remaining)}</b> more for the ${s.next.shortName}`;
    case STATE.EARNED:
      return `Buy <b>${indianPrice(s.remaining)}</b> more of ${scope} and the ${s.next.shortName} is yours`;
    case STATE.TOP_REACHED:
      return `You won the ${s.secured.shortName}, the top gift`;
    case STATE.ENDED_MISSED:
      return 'The scheme ended. No slab was crossed.';
    case STATE.ENDED_PENDING:
      // The order is placed only after the scheme window closes, and each scheme has
      // its own dates, so this copy carries no borrowed campaign date.
      return 'Scheme ended. Your gift order will be placed soon.';
    case STATE.GIFT_ORDERED:
      return 'Ordered on Amazon. Delivery goes to your shop address.';
    case STATE.DELIVERED:
      return 'Delivered to your shop address.';
    default:
      return '';
  }
}

// The chip carries time, and only time. The title reserves 100dp for it, so the text
// stays as short as the app's own "In 6 Days". Slab urgency is a different fact and it
// lives in the sentence; a red chip for a near slab would read as "time is short".
function chipFor(s) {
  // A scheduled card names its start date in the sentence and in the gift row; a chip
  // would say it a third time and its width collides with the title's reserved 100dp.
  if (s.state === STATE.SCHEDULED) return null;
  if (s.ended) return { text: 'Ended', color: C.mediumGrey };
  return {
    text: s.daysLeft === 1 ? 'In 1 Day' : `In ${s.daysLeft} Days`,
    color: s.daysLeft <= 3 ? C.anotherRed : C.brown3,
  };
}

// slabs picks which tiers the target_scheme row can carry: milestone_1..4 caps the
// ladder at 4, so the merch team must choose 4 of the 8 or 9 slabs.
export function giftSchemeNode({
  id, ladder, slabsInLakhs, currentValue, now = NOW, fulfilment = {},
  name = 'Mega Diwali', windowLabel = '1st Oct - 9th Nov, 26',
  startTime = START, endTime = END, startLabel = CAMPAIGN.startLabel, endLabel = CAMPAIGN.endLabel,
}) {
  const tiers = slabsInLakhs.map((n) => tier(ladder, n));
  const gift = {
    tiers,
    currentValue,
    startTime,
    endTime,
    now,
    fulfilment,
    startLabel,
    endLabel,
  };
  const s = schemeState(gift);
  const chip = chipFor(s);
  return {
    entityId: id,
    nextPageType: 'TARGET_SCHEME_DETAILS',
    gift,
    ladderKey: ladder.key,
    entityData: {
      logo: '',
      localizedTitle: `${name}: ${ladder.label} - (${windowLabel})`,
      localizedSubText: copyFor(s, ladder),
      localizedLabel: chip ? chip.text : '',
      labelBgColor: chip ? chip.color : C.mediumGrey,
      currentValueLabel: lakh(currentValue),
      currentAchievedValue: currentValue,
      progressPercentage: Math.round(s.progressPct),
      progressColor: '#58a159',
      progressIcon: 'standing_man',
    },
  };
}

// The customer is enrolled in one category ladder, so the running tab holds one card.
// BG inclusion (gir_should_include) decides which ladder.
export const GIFT_RUNNING_SCHEMES = [
  giftSchemeNode({
    id: 'TS-DIWALI-LS',
    ladder: LIFESTYLE,
    slabsInLakhs: [2, 5, 10, 20],
    currentValue: LIFESTYLE.currentValue,
  }),
];

// The completed tab holds the schemes whose window has closed. Their cards drop the
// meter and state the outcome, because a frozen bar reads as "keep buying".
export const GIFT_COMPLETED_SCHEMES = [
  // DELIVERED: the gift reached the shop. Terminal.
  giftSchemeNode({
    id: 'TS-DIWALI-LS-2025',
    name: 'Mega Diwali 2025',
    windowLabel: '1st Oct - 9th Nov, 25',
    ladder: LIFESTYLE,
    slabsInLakhs: [2, 5, 10, 20],
    currentValue: 7.1 * L,
    startTime: Date.UTC(2025, 9, 1),
    endTime: Date.UTC(2025, 10, 9),
    now: NOW,
    fulfilment: { orderedAt: Date.UTC(2025, 10, 12), deliveredAt: Date.UTC(2025, 10, 18) },
  }),
  // GIFT_ORDERED: the Amazon order is placed, delivery is pending.
  giftSchemeNode({
    id: 'TS-ONAM-LS-2026',
    name: 'Onam Gifts',
    windowLabel: '15th Aug - 12th Sep, 26',
    ladder: LIFESTYLE,
    slabsInLakhs: [2, 5, 10, 20],
    currentValue: 3.2 * L,
    startTime: Date.UTC(2026, 7, 15),
    endTime: Date.UTC(2026, 8, 12),
    now: NOW,
    fulfilment: { orderedAt: Date.UTC(2026, 8, 16) },
  }),
  // ENDED_PENDING: the window closed with a slab crossed, no order placed yet. This is
  // the state most customers see first, in the days right after the scheme closes.
  giftSchemeNode({
    id: 'TS-HOLI-LS-2026',
    name: 'Holi Gifts',
    windowLabel: '1st - 20th Mar, 26',
    ladder: LIFESTYLE,
    slabsInLakhs: [2, 5, 10, 20],
    currentValue: 11.4 * L,
    startTime: Date.UTC(2026, 2, 1),
    endTime: Date.UTC(2026, 2, 20),
    now: NOW,
  }),
  // ENDED_MISSED: the window closed below the first slab. Terminal.
  giftSchemeNode({
    id: 'TS-SUMMER-LS-2026',
    name: 'Summer Gifts',
    windowLabel: '1st - 31st May, 26',
    ladder: LIFESTYLE,
    slabsInLakhs: [2, 5, 10, 20],
    currentValue: 1.1 * L,
    startTime: Date.UTC(2026, 4, 1),
    endTime: Date.UTC(2026, 4, 31),
    now: NOW,
  }),
];

// SchemeMemberTarget-shaped detail payload, derived from the same node. payoutMode
// 'GIFT' carries a gift reference instead of a value; 'value' holds the gift MRP for
// budget reporting only. Deriving it here is what keeps the card and the detail screen
// from telling the customer two different things.
export function giftSchemeDetail(node) {
  const ladder = LADDERS.find((l) => l.key === node.ladderKey);
  const g = node.gift;
  const s = schemeState(g);
  return {
    schemeMemberTargetBO: {
      schemeMemberTargetId: 'SMT-' + node.entityId,
      targetSchemeId: node.entityId,
      currentValue: g.currentValue,
      milestoneBOs: g.tiers.map((t, i) => ({
        milestoneId: `MS-${node.entityId}-${i + 1}`,
        atValue: t.at,
        payout: { payoutMode: 'GIFT', payoutType: 'ABSOLUTE', value: 0, gift: t },
      })),
      targetSchemeBO: {
        purposeType: 'GROWTH',
        startTime: g.startTime,
        endTime: g.endTime,
        schemeItemRules: {
          includedEntries: { category: [ladder.label] },
          excludedEntries: ladder.key === 'lifestyle' ? { category: ['Consumer Electronics'] } : {},
        },
      },
    },
    displayData: {
      title: node.entityData.localizedTitle,
      subtitle: 'Valid till ' + g.endLabel,
      // The header sentence follows the state, so a closed scheme never asks the
      // customer to keep buying. The card uses the same copyFor(); the detail screen
      // has no HtmlText, so the bold tags come out here.
      description: detailLine(s, ladder),
      footerLabel: s.ended ? GM_ONE_GIFT : GM_ONE_GIFT + ' Delivery after ' + CAMPAIGN.endLabel + '.',
      milestoneSubtext: 'Gift',
      ladderKey: ladder.key,
    },
  };
}

const GM_ONE_GIFT = '1 scheme, 1 gift. You take home the gift at the highest amount you cross.';

// The card's sentence uses short names to fit two lines. The detail screen has room for
// the full product name, so gift names are spelled out here.
function detailLine(s, ladder) {
  switch (s.state) {
    case STATE.ENDED_MISSED:
      return 'The scheme ended below the first slab. No gift was won.';
    case STATE.ENDED_PENDING:
      return `You won the ${s.secured.name}. The order is not placed yet.`;
    case STATE.GIFT_ORDERED:
      return `You won the ${s.secured.name}. It is on the way to your shop.`;
    case STATE.DELIVERED:
      return `You won the ${s.secured.name}. It was delivered to your shop.`;
    case STATE.TOP_REACHED:
      return `You crossed the top slab. The ${s.top.name} is yours.`;
    default:
      return `Buy ${ladder.label} products above ${indianPrice(s.next.at)} and secure a ${s.next.name}`;
  }
}

export const GIFT_SCHEME_DETAILS = Object.fromEntries(
  [...GIFT_RUNNING_SCHEMES, ...GIFT_COMPLETED_SCHEMES].map((n) => [n.entityId, giftSchemeDetail(n)])
);

// Copy used by both flows.
export const GM = {
  _gift_targets_title: 'My Targets',
  _gift_scheme_details: 'Scheme Details',
  _one_gift_rule: '1 scheme, 1 gift. You take home the gift at the highest amount you cross.',
  _delivery_note: 'We order your gift on Amazon to your shop address. Amazon delivers it to your door.',
  _gift_footer: 'Gift delivery starts after 9 Nov 2026',
};
