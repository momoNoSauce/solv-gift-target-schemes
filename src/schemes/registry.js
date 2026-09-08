// The member's schemes, in dock order: running schemes first (the main scheme
// leads), then completed ones. One builder, so both pagers, both docks, the
// list sheet and the old list can never disagree about a scheme.
//
// Solv sells beyond grocery: apparel, footwear, home furnishing, small
// electronics and toys (YourStory, Inc42, Mar 2025). The brand schemes here
// live in those categories: Bata (footwear), Prestige (kitchen appliances),
// Havells (small electronics), Bombay Dyeing (home furnishing), Funskool (toys).
// Brand marks: the brands' own logos from their Wikipedia pages, rasterised to
// 512 px in assets/brands/. Festive schemes carry an illustration of their
// festival (src/schemes/SchemeArt.js).
//
// Every scheme carries what the page needs to render it on its own:
//   id, title (full, "Bata Scheme"), dockName (short, for a 64 px column),
//   theme, art ({ logo } for a brand), tiers, currentValue, startTime, endTime,
//   now, fulfilment, startLabel, endLabel, fmt (slab labels), money (gap
//   amounts), rules {included, excluded}, deliverBy, orderNo, and `s`, the
//   derived schemeState().
//
// View scenarios (?view=): typical, start, over, many, empty.
import { schemeState, STATE } from '../gifts/state';
import { LADDERS, lakh } from '../gifts/data';
import { indianPrice } from '../data';

const L = 100000;
const LIFESTYLE = LADDERS[0];
const IMG = {
  mixer: require('../../assets/gifts/mixer.jpg'),
  kettle: require('../../assets/gifts/kettle.jpg'),
  watch: require('../../assets/gifts/watch.jpg'),
  microwave: require('../../assets/gifts/microwave.jpg'),
};
const BRAND = {
  bata: require('../../assets/brands/bata.png'),
  prestige: require('../../assets/brands/prestige.png'),
  havells: require('../../assets/brands/havells.png'),
  bombaydyeing: require('../../assets/brands/bombaydyeing.png'),
  funskool: require('../../assets/brands/funskool.png'),
};

const TIER_WATCH = [{ at: 60000, name: 'Fire-Boltt Brillia Smart Watch', shortName: 'Watch', icon: 'watch', image: IMG.watch }];
const TIER_KETTLE = [{ at: 40000, name: 'Pigeon Amaze Plus Electric Kettle', shortName: 'Kettle', icon: 'kettle', image: IMG.kettle }];
const TIER_MIXER = [{ at: 50000, name: 'NutriPro Juicer Mixer Grinder', shortName: 'Mixer', icon: 'mixer', image: IMG.mixer }];
const TIER_MICROWAVE = [{ at: 120000, name: 'Godrej 20 L Solo Microwave Oven', shortName: 'Microwave', icon: 'microwave', image: IMG.microwave }];
const cashTier = (at, amount) => ({ at, name: `${amount} cashback`, shortName: `${amount} cashback`, icon: 'jumbocash', cash: amount });
const TIER_JC2000 = [cashTier(80000, '₹2,000')];
// The common shape: cashback at several targets, the amount rising with the buying.
const TIERS_CASH_LADDER = [cashTier(30000, '₹500'), cashTier(80000, '₹2,000'), cashTier(150000, '₹5,000')];
const TIERS_GOLD = [{ ...TIER_KETTLE[0] }, { ...TIER_MICROWAVE[0] }];
const TIER_JC1000 = [cashTier(30000, '₹1,000')];

const D = (m, d, y = 2026) => Date.UTC(y, m - 1, d);
const DAY = 24 * 60 * 60 * 1000;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const ddMMM = (ms) => {
  const d = new Date(ms);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
};
const ddMMMyyyy = (ms) => `${ddMMM(ms)} ${new Date(ms).getUTCFullYear()}`;

// Eligible products per scheme, the shape the app's createTable() flattens.
const GOLD_LOGO = require('../../assets/remote/gold_logo.png');
const RULES_CAMPAIGN = { included: ['Footwear', 'Home Furnishing', 'Small Appliances', 'Toys'], excluded: ['Grocery', 'Mobile Phones'] };
const RULES_BATA = { included: ['Bata Comfit', 'Power', 'Hush Puppies'], excluded: ['Bata school shoes'] };
const RULES_PRESTIGE = { included: ['Prestige pressure cookers', 'Prestige cookware', 'Prestige mixer grinders'], excluded: ['Prestige gas stoves'] };
const RULES_HAVELLS = { included: ['Havells fans', 'Havells water heaters', 'Havells irons and kettles'], excluded: ['Havells wires and cables'] };
const RULES_BOMBAY = { included: ['Bed sheets', 'Towels', 'Comforters and blankets'], excluded: [] };
const RULES_GOLD = { included: ['Every Gold-exclusive listing', 'Gold member prices'], excluded: ['Grocery staples'] };
const RULES_FUNSKOOL = { included: ['Funskool board games', 'Play-Doh', 'Giggles'], excluded: [] };

// A stable mock Amazon order number per scheme id.
function orderNoFor(id) {
  let h = 7;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const a = String(400 + (h % 10));
  const b = String(1000000 + (h % 9000000)).padStart(7, '0');
  const c = String(1000000 + ((h >>> 3) % 9000000)).padStart(7, '0');
  return `Amazon order ${a}-${b}-${c}`;
}

function scheme({ id, title, dockName, theme = 'default', art = null, tiers, currentValue, startTime, endTime, now, fulfilment = {}, fmt = indianPrice, rules }) {
  const startLabel = ddMMMyyyy(startTime);
  const endLabel = ddMMMyyyy(endTime);
  const s = schemeState({ tiers, currentValue, startTime, endTime, now, fulfilment, startLabel, endLabel });
  return {
    id,
    title,
    dockName,
    theme,
    art,
    tiers,
    currentValue,
    startTime,
    endTime,
    now,
    fulfilment,
    startLabel,
    endLabel,
    fmt,
    money: indianPrice,
    rules,
    // Delivery runs through Amazon after the window closes: by end + 12 days.
    deliverBy: ddMMMyyyy(endTime + 12 * DAY),
    orderNo: orderNoFor(id),
    s,
  };
}

// One line that says where a scheme stands, for the dock label and the list.
export function statusLine(sc) {
  const s = sc.s;
  switch (s.state) {
    case STATE.SCHEDULED: return `Starts ${ddMMM(sc.startTime)}`;
    case STATE.LIVE:
    case STATE.EARNED:
    case STATE.NEAR_SLAB: return `${s.daysLeft} days left`;
    case STATE.TOP_REACHED: return 'Top gift won';
    case STATE.ENDED_MISSED: return `Ended ${ddMMM(sc.endTime)}`;
    case STATE.ENDED_PENDING: return 'Ended. Gift being confirmed';
    case STATE.GIFT_ORDERED: return `On the way, by ${ddMMM(sc.endTime + 12 * DAY)}`;
    case STATE.DELIVERED: return `Delivered ${sc.fulfilment.deliveredAt ? ddMMM(sc.fulfilment.deliveredAt) : ''}`.trim();
    default: return '';
  }
}

// The schemes, parameterised by the clock.
const diwali = (now, currentValue, fulfilment) =>
  scheme({ id: 'diwali', title: 'Mega Diwali Scheme', dockName: 'Diwali', theme: 'diwali', tiers: LIFESTYLE.tiers, currentValue, startTime: D(10, 1), endTime: D(11, 9), now, fulfilment, fmt: lakh, rules: RULES_CAMPAIGN });

const bata = (now, currentValue, { start = D(9, 20), end = D(10, 28) } = {}) =>
  scheme({ id: 'bata', title: 'Bata Scheme', dockName: 'Bata', art: { logo: BRAND.bata }, tiers: TIER_WATCH, currentValue, startTime: start, endTime: end, now, rules: RULES_BATA });

const prestige = (now, currentValue, { end = D(11, 9) } = {}) =>
  scheme({ id: 'prestige', title: 'Prestige Scheme', dockName: 'Prestige', art: { logo: BRAND.prestige }, tiers: TIERS_CASH_LADDER, currentValue, startTime: D(10, 1), endTime: end, now, rules: RULES_PRESTIGE });

const bombay = (now, currentValue) =>
  scheme({ id: 'bombaydyeing', title: 'Bombay Dyeing Scheme', dockName: 'B. Dyeing', art: { logo: BRAND.bombaydyeing, wide: true }, tiers: TIER_MIXER, currentValue, startTime: D(10, 5), endTime: D(11, 5), now, rules: RULES_BOMBAY });

const funskool = (now, currentValue) =>
  scheme({ id: 'funskool', title: 'Funskool Scheme', dockName: 'Funskool', art: { logo: BRAND.funskool }, tiers: TIER_JC1000, currentValue, startTime: D(10, 10), endTime: D(10, 24), now, rules: RULES_FUNSKOOL });

const onam = (now, fulfilment) =>
  scheme({ id: 'onam', title: 'Onam Scheme', dockName: 'Onam', theme: 'onam', tiers: LIFESTYLE.tiers, currentValue: 7.1 * L, startTime: D(8, 15), endTime: D(9, 12), now, fulfilment, fmt: lakh, rules: RULES_CAMPAIGN });

const havells = (now) =>
  scheme({ id: 'havells', title: 'Havells Scheme', dockName: 'Havells', art: { logo: BRAND.havells }, tiers: TIER_KETTLE, currentValue: 47000, startTime: D(8, 20), endTime: D(9, 20), now, fulfilment: { orderedAt: D(9, 24), deliveredAt: D(10, 6) }, rules: RULES_HAVELLS });

const holi = (now) =>
  scheme({ id: 'holi', title: 'Holi Scheme', dockName: 'Holi', theme: 'holi', tiers: LIFESTYLE.tiers, currentValue: 5.6 * L, startTime: D(3, 1), endTime: D(3, 20), now, fulfilment: { orderedAt: D(3, 24), deliveredAt: D(4, 2) }, fmt: lakh, rules: RULES_CAMPAIGN });

// Gold: the membership's own scheme, in the membership's branding (theme gold).
const gold = (now, currentValue) =>
  scheme({ id: 'gold', title: 'Gold Exclusive Scheme', dockName: 'Gold', theme: 'gold', art: { logo: GOLD_LOGO, wide: true }, tiers: TIERS_GOLD, currentValue, startTime: D(10, 1), endTime: D(11, 30), now, rules: RULES_GOLD });

export const VIEWS = {
  typical: {
    label: 'Typical',
    running: [diwali(D(10, 19), 6.4 * L), prestige(D(10, 19), 46000), gold(D(10, 19), 58000), bata(D(10, 19), 31200)],
    completed: [onam(D(10, 19), { orderedAt: D(9, 16), deliveredAt: D(9, 24) }), havells(D(10, 19)), holi(D(10, 19))],
  },
  start: {
    label: 'Season start',
    running: [diwali(D(9, 26), 0), bata(D(9, 26), 0)],
    completed: [],
  },
  over: {
    label: 'Season over',
    running: [prestige(D(11, 14), 76000, { end: D(11, 20) })],
    completed: [diwali(D(11, 14), 11.4 * L, { orderedAt: D(11, 12) }), bata(D(11, 14), 22000), havells(D(11, 14))],
  },
  many: {
    label: 'Many',
    running: [diwali(D(10, 19), 6.4 * L), prestige(D(10, 19), 46000), gold(D(10, 19), 58000), bata(D(10, 19), 31200), bombay(D(10, 19), 12500), funskool(D(10, 19), 4000)],
    completed: [onam(D(10, 19), { orderedAt: D(9, 16), deliveredAt: D(9, 24) }), havells(D(10, 19)), holi(D(10, 19))],
  },
  empty: { label: 'Empty', running: [], completed: [] },
};

// The dock order: running, then completed. `group` tells the docks where the
// divider goes and which thumbs read as past tense.
export function schemesFor(viewKey) {
  const v = VIEWS[viewKey] || VIEWS.typical;
  return [
    ...v.running.map((x) => ({ ...x, group: 'running' })),
    ...v.completed.map((x) => ({ ...x, group: 'completed' })),
  ];
}

export const SHOP_ADDRESS = { shop: 'Sri Lakshmi Stores', line: '12, Gandhi Bazaar Main Road, Basavanagudi, Bengaluru 560004' };
