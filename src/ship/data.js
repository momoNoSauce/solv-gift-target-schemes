// Shippable cut of the Mega Diwali campaign, per the business decision:
//   - the big ladder is broken into MULTIPLE schemes, each with AT MOST 3 gifts
//   - each scheme goes to the customers its BG inclusion targets, so a member sees
//     only the schemes relevant to them
// This member is targeted with two running schemes carved from the Lifestyle ladder:
// an appliances scheme (2L/5L/10L) and a bumper scheme for the big slabs (20L/30L/40L).
// Each scheme tracks its own scope, so the two current values differ.
import { giftSchemeNode, LADDERS, NOW } from '../gifts/data';
import { C } from '../theme';
import { SOLV } from '../gifts/solv';

const L = 100000;
const LIFESTYLE = LADDERS[0];

// A scheme's scope label rides on a ladder copy; the tiers stay the campaign's own.
const scoped = (label) => ({ key: 'lifestyle', label, tiers: LIFESTYLE.tiers });

function scheme({ id, name, windowLabel, scope, slabs, currentValue, included, excluded = [], now = NOW, fulfilment = {}, startTime, endTime, startLabel, endLabel }) {
  const node = giftSchemeNode({
    id,
    name,
    windowLabel,
    ladder: scoped(scope),
    slabsInLakhs: slabs,
    currentValue,
    now,
    fulfilment,
    ...(startTime ? { startTime } : {}),
    ...(endTime ? { endTime } : {}),
    ...(startLabel ? { startLabel } : {}),
    ...(endLabel ? { endLabel } : {}),
  });
  // The chip colour system is Solv's: blue for a normal countdown, red when urgent,
  // grey when the window has closed. giftSchemeNode writes Jumbotail brown.
  if (node.entityData.labelBgColor === C.brown3) node.entityData.labelBgColor = SOLV.blueDark;
  if (node.entityData.labelBgColor === C.mediumGrey) node.entityData.labelBgColor = SOLV.sub;
  return { node, included, excluded };
}

export const SHIP_RUNNING = [
  scheme({
    id: 'SHIP-DIWALI-APPL',
    name: 'Diwali Gifts',
    windowLabel: '1st Oct - 9th Nov, 26',
    scope: 'Appliances',
    slabs: [2, 5, 10],
    currentValue: 6.4 * L,
    included: ['Home & Kitchen Appliances'],
    excluded: ['Consumer Electronics'],
  }),
  scheme({
    id: 'SHIP-DIWALI-BUMPER',
    name: 'Diwali Bumper',
    windowLabel: '1st Oct - 9th Nov, 26',
    scope: 'All Products',
    slabs: [20, 30, 40],
    currentValue: 3.1 * L,
    included: ['All Products'],
    excluded: ['Sugar', 'Edible Oil'],
  }),
];

// An announced scheme: the window opens 15 Nov, so the list primes the customer and
// the detail page reads as a catalogue with no amounts to act on yet.
export const SHIP_SCHEDULED = scheme({
  id: 'SHIP-NEWYEAR-APPL',
  name: 'New Year Gifts',
  windowLabel: '15th Nov - 31st Dec, 26',
  scope: 'Appliances',
  slabs: [2, 5, 10],
  currentValue: 0,
  included: ['Home & Kitchen Appliances'],
  startTime: Date.UTC(2026, 10, 15),
  endTime: Date.UTC(2026, 11, 31),
  startLabel: '15 Nov 2026',
  endLabel: '31 Dec 2026',
});
SHIP_RUNNING.push(SHIP_SCHEDULED);

export const SHIP_COMPLETED = [
  scheme({
    id: 'SHIP-ONAM-APPL',
    name: 'Onam Gifts',
    windowLabel: '15th Aug - 12th Sep, 26',
    scope: 'Appliances',
    slabs: [2, 5, 10],
    currentValue: 5.6 * L,
    included: ['Home & Kitchen Appliances'],
    startTime: Date.UTC(2026, 7, 15),
    endTime: Date.UTC(2026, 8, 12),
    startLabel: '15 Aug 2026',
    endLabel: '12 Sep 2026',
    fulfilment: { orderedAt: Date.UTC(2026, 8, 16) },
  }),
  scheme({
    id: 'SHIP-SUMMER-APPL',
    name: 'Summer Gifts',
    windowLabel: '1st - 31st May, 26',
    scope: 'Appliances',
    slabs: [2, 5, 10],
    currentValue: 1.2 * L,
    included: ['Home & Kitchen Appliances'],
    startTime: Date.UTC(2026, 4, 1),
    endTime: Date.UTC(2026, 4, 31),
    startLabel: '1 May 2026',
    endLabel: '31 May 2026',
  }),
];

export const SHIP_BY_ID = Object.fromEntries(
  [...SHIP_RUNNING, ...SHIP_COMPLETED].map((x) => [x.node.entityId, x])
);
