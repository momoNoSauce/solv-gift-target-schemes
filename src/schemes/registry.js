// The member's schemes, in dock order: running schemes first (the main scheme
// leads), then completed ones. One builder, so the pager, the dock and the old
// list can never disagree about a scheme.
//
// Every scheme carries what the page needs to render it on its own:
//   id, title, dockName (short, for the dock label), theme, tiers, currentValue,
//   startTime, endTime, now, fulfilment, startLabel, endLabel, fmt (slab labels),
//   money (gap amounts), rules {included, excluded}, deliverBy, orderNo,
//   and `s`, the derived schemeState().
//
// View scenarios (?view=) mirror the old list page so every dock state can be
// inspected: typical, start, over, empty.
import { schemeState } from '../gifts/state';
import { LADDERS, lakh } from '../gifts/data';
import { indianPrice } from '../data';

const L = 100000;
const LIFESTYLE = LADDERS[0];
const IMG_MIXER = require('../../assets/gifts/mixer.jpg');
const IMG_KETTLE = require('../../assets/gifts/kettle.jpg');

const OIL_TIER = [{ at: 50000, name: 'NutriPro Juicer Mixer Grinder', shortName: 'Mixer', icon: 'mixer', image: IMG_MIXER }];
const KETTLE_TIER = [{ at: 40000, name: 'Pigeon Amaze Plus Electric Kettle', shortName: 'Kettle', icon: 'kettle', image: IMG_KETTLE }];
const VOUCHER_TIER = [{ at: 80000, name: '₹2,000 Solv voucher', shortName: '₹2,000 voucher', icon: 'voucher', voucher: '₹2,000' }];

const D = (m, d, y = 2026) => Date.UTC(y, m - 1, d);
const DAY = 24 * 60 * 60 * 1000;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const ddMMM = (ms) => {
  const d = new Date(ms);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
};
const ddMMMyyyy = (ms) => `${ddMMM(ms)} ${new Date(ms).getUTCFullYear()}`;

// Trade-category rules per scheme, the shape the app's createTable() flattens.
const RULES_CAMPAIGN = { included: ['Packaged Foods', 'Beverages', 'Personal Care', 'Home Care'], excluded: ['Sugar', 'Edible Oil'] };
const RULES_FORTUNE = { included: ['Fortune Sunflower Oil (all packs)'], excluded: ['Fortune Rice Bran Oil'] };
const RULES_BRITANNIA = { included: ['Britannia Biscuits', 'Britannia Cakes', 'Britannia Rusk'], excluded: [] };
const RULES_SAFFOLA = { included: ['Saffola Gold', 'Saffola Active'], excluded: ['Saffola Oats'] };

// A stable mock Amazon order number per scheme id.
function orderNoFor(id) {
  let h = 7;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const a = String(400 + (h % 10));
  const b = String(1000000 + (h % 9000000)).padStart(7, '0');
  const c = String(1000000 + ((h >>> 3) % 9000000)).padStart(7, '0');
  return `Amazon order ${a}-${b}-${c}`;
}

function scheme({ id, title, dockName, theme = 'default', tiers, currentValue, startTime, endTime, now, fulfilment = {}, fmt = indianPrice, rules }) {
  const startLabel = ddMMMyyyy(startTime);
  const endLabel = ddMMMyyyy(endTime);
  const s = schemeState({ tiers, currentValue, startTime, endTime, now, fulfilment, startLabel, endLabel });
  return {
    id,
    title,
    dockName,
    theme,
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

// The five schemes of the mid-season member, parameterised by the clock.
const diwali = (now, currentValue, fulfilment) =>
  scheme({ id: 'diwali', title: 'Mega Diwali Scheme', dockName: 'Diwali', theme: 'diwali', tiers: LIFESTYLE.tiers, currentValue, startTime: D(10, 1), endTime: D(11, 9), now, fulfilment, fmt: lakh, rules: RULES_CAMPAIGN });

const fortune = (now, currentValue, { start = D(9, 20), end = D(10, 28) } = {}) =>
  scheme({ id: 'fortune', title: 'Fortune Sunflower Oil Scheme', dockName: 'Fortune Oil', tiers: OIL_TIER, currentValue, startTime: start, endTime: end, now, rules: RULES_FORTUNE });

const britannia = (now, currentValue, { end = D(11, 9) } = {}) =>
  scheme({ id: 'britannia', title: 'Britannia Diwali Stock-Up', dockName: 'Britannia', tiers: VOUCHER_TIER, currentValue, startTime: D(10, 1), endTime: end, now, rules: RULES_BRITANNIA });

const onam = (now, fulfilment) =>
  scheme({ id: 'onam', title: 'Onam Mega Scheme', dockName: 'Onam', theme: 'onam', tiers: LIFESTYLE.tiers, currentValue: 7.1 * L, startTime: D(8, 15), endTime: D(9, 12), now, fulfilment, fmt: lakh, rules: RULES_CAMPAIGN });

const saffola = (now) =>
  scheme({ id: 'saffola', title: 'Saffola September Scheme', dockName: 'Saffola', tiers: KETTLE_TIER, currentValue: 47000, startTime: D(8, 20), endTime: D(9, 20), now, fulfilment: { orderedAt: D(9, 24), deliveredAt: D(10, 6) }, rules: RULES_SAFFOLA });

// Extra schemes for the long-list scenario, so the dock's scrolling mode
// (thumbs overflow the pill) can be inspected.
const IMG_WATCH = require('../../assets/gifts/watch.jpg');
const WATCH_TIER = [{ at: 60000, name: 'Fire-Boltt Brillia Smart Watch', shortName: 'Watch', icon: 'watch', image: IMG_WATCH }];
const parle = (now, currentValue) =>
  scheme({ id: 'parle', title: 'Parle Festive Push', dockName: 'Parle', tiers: WATCH_TIER, currentValue, startTime: D(10, 5), endTime: D(11, 5), now, rules: { included: ['Parle-G', 'Parle Hide & Seek'], excluded: [] } });
const dabur = (now, currentValue) =>
  scheme({ id: 'dabur', title: 'Dabur Health Week', dockName: 'Dabur', tiers: [{ at: 30000, name: '₹1,000 Solv voucher', shortName: '₹1,000 voucher', icon: 'voucher', voucher: '₹1,000' }], currentValue, startTime: D(10, 10), endTime: D(10, 24), now, rules: { included: ['Dabur Chyawanprash', 'Dabur Honey'], excluded: [] } });
const holi = (now) =>
  scheme({ id: 'holi', title: 'Holi Bumper Scheme', dockName: 'Holi', theme: 'holi', tiers: LIFESTYLE.tiers, currentValue: 5.6 * L, startTime: D(3, 1), endTime: D(3, 20), now, fulfilment: { orderedAt: D(3, 24), deliveredAt: D(4, 2) }, fmt: lakh, rules: RULES_CAMPAIGN });

export const VIEWS = {
  typical: {
    label: 'Typical',
    running: [diwali(D(10, 19), 6.4 * L), fortune(D(10, 19), 31200), britannia(D(10, 19), 16000)],
    completed: [onam(D(10, 19), { orderedAt: D(9, 16), deliveredAt: D(9, 24) }), saffola(D(10, 19))],
  },
  start: {
    label: 'Season start',
    running: [diwali(D(9, 26), 0), fortune(D(9, 26), 0)],
    completed: [],
  },
  over: {
    label: 'Season over',
    running: [britannia(D(11, 14), 76000, { end: D(11, 20) })],
    completed: [diwali(D(11, 14), 11.4 * L, { orderedAt: D(11, 12) }), fortune(D(11, 14), 22000), saffola(D(11, 14))],
  },
  many: {
    label: 'Many',
    running: [diwali(D(10, 19), 6.4 * L), fortune(D(10, 19), 31200), britannia(D(10, 19), 16000), parle(D(10, 19), 12500), dabur(D(10, 19), 4000)],
    completed: [onam(D(10, 19), { orderedAt: D(9, 16), deliveredAt: D(9, 24) }), saffola(D(10, 19)), holi(D(10, 19))],
  },
  empty: { label: 'Empty', running: [], completed: [] },
};

// The dock order: running, then completed. `group` tells the dock where the
// divider goes and which thumbs read as past tense.
export function schemesFor(viewKey) {
  const v = VIEWS[viewKey] || VIEWS.typical;
  return [
    ...v.running.map((x) => ({ ...x, group: 'running' })),
    ...v.completed.map((x) => ({ ...x, group: 'completed' })),
  ];
}

export const SHOP_ADDRESS = { shop: 'Sri Lakshmi Stores', line: '12, Gandhi Bazaar Main Road, Basavanagudi, Bengaluru 560004' };
