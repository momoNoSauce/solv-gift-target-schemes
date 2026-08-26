// Shippable cut, per the business decision:
//   - ONE customer maps to ONE running scheme. Targeting picks the scheme whose slabs
//     fit the customer's buying, so a small shopkeeper sees a ladder up to ₹1L and a
//     large one sees ₹20L-₹40L.
//   - Each scheme has AT MOST 3 gifts.
//   - The COHORT IS A TARGETING ARTIFACT, NEVER CUSTOMER-FACING COPY. No card ever
//     says "Starter": every customer just sees "Diwali Gifts: Appliances" with slabs
//     and gifts sized to them.
//
// Four demo cohorts, one view each (/ship?cohort=...), carved from the campaign's own
// gift sheet ("Final Working for Mega Diwali Scheme.xlsx", Final Gift Summary): the
// slab-to-gift pricing is the sheet's, never invented here. Starter takes the
// Electronics ladder's low end; the other three are consecutive windows of the
// Lifestyle ladder up to the iPhone 17 (a 2-gift ladder, which the layout allows).
// Every cohort carries the same journey: ONE running Diwali scheme and a history of
// one won-and-ordered plus one missed scheme. The running tab stays clean: a not-yet
// started scheme never sits on it (the SCHEDULED card lives in the states gallery).
// The running states differ across cohorts on purpose, so the four views also demo
// LIVE and EARNED without inventing extra schemes.
import { giftSchemeNode, LADDERS, NOW } from '../gifts/data';
import { C } from '../theme';
import { SOLV } from '../gifts/solv';

const L = 100000;

// The sheet's own ladders. A cohort scheme is a slab window over one of them, so
// every gift keeps the slab the sheet priced it at.
const LIFESTYLE = { key: 'lifestyle', label: 'Lifestyle', tiers: LADDERS[0].tiers };
const ELECTRONICS = { key: 'electronics', label: 'Electronics', tiers: LADDERS[1].tiers };

function scheme({ id, name, windowLabel, ladder, slabs, currentValue, included, excluded = [], now = NOW, fulfilment = {}, startTime, endTime, startLabel, endLabel }) {
  const node = giftSchemeNode({
    id,
    name,
    windowLabel,
    ladder,
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

// One cohort's full journey at its own scale.
function cohortJourney({ key, ladder, slabs, running, onam, summer, included, excluded = [] }) {
  const shared = { ladder, slabs, included, excluded };
  return {
    running: [
      scheme({
        ...shared,
        id: `SHIP-${key}-DIWALI`,
        name: 'Diwali Gifts',
        windowLabel: '1st Oct - 9th Nov, 26',
        currentValue: running,
      }),
    ],
    completed: [
      scheme({
        ...shared,
        id: `SHIP-${key}-ONAM`,
        name: 'Onam Gifts',
        windowLabel: '15th Aug - 12th Sep, 26',
        currentValue: onam,
        startTime: Date.UTC(2026, 7, 15),
        endTime: Date.UTC(2026, 8, 12),
        startLabel: '15 Aug 2026',
        endLabel: '12 Sep 2026',
        fulfilment: { orderedAt: Date.UTC(2026, 8, 16) },
      }),
      scheme({
        ...shared,
        id: `SHIP-${key}-SUMMER`,
        name: 'Summer Gifts',
        windowLabel: '1st - 31st May, 26',
        currentValue: summer,
        startTime: Date.UTC(2026, 4, 1),
        endTime: Date.UTC(2026, 4, 31),
        startLabel: '1 May 2026',
        endLabel: '31 May 2026',
      }),
    ],
  };
}

// The four cohorts. `label` is DEMO CHROME ONLY (drawer rows, docs); it never renders
// inside the customer's own screens.
export const SHIP_COHORTS = {
  starter: {
    label: 'Starter — ₹1L/₹2L/₹5L: Kettle, Watch, Air Fryer (Electronics ladder)',
    ...cohortJourney({
      key: 'STARTER',
      ladder: ELECTRONICS,
      slabs: [1, 2, 5],
      running: 1.4 * L,    // EARNED: holds the kettle, ₹60,000 to the watch
      onam: 1.2 * L,       // won the kettle, order placed
      summer: 0.4 * L,     // ended below the first slab
      included: ['Consumer Electronics'],
    }),
  },
  growth: {
    label: 'Growth — ₹2L/₹5L/₹10L: Mixer, Air Fryer, Soundbar',
    ...cohortJourney({
      key: 'GROWTH',
      ladder: LIFESTYLE,
      slabs: [2, 5, 10],
      running: 6.4 * L,    // EARNED: holds the air fryer, ₹3.6L to the soundbar
      onam: 2.3 * L,       // won the mixer, order placed
      summer: 1.2 * L,
      included: ['Lifestyle'],
      excluded: ['Consumer Electronics'],
    }),
  },
  established: {
    label: 'Established — ₹15L/₹20L/₹30L: Vacuum, Phone, Fridge',
    ...cohortJourney({
      key: 'ESTABLISHED',
      ladder: LIFESTYLE,
      slabs: [15, 20, 30],
      running: 12.8 * L,   // LIVE: nothing crossed yet, ₹2.2L to the vacuum
      onam: 21 * L,        // won the phone, order placed
      summer: 6 * L,
      included: ['Lifestyle'],
      excluded: ['Consumer Electronics'],
    }),
  },
  bumper: {
    label: 'Bumper — ₹40L/₹1.2Cr: Smart TV, iPhone 17 (2-gift ladder)',
    ...cohortJourney({
      key: 'BUMPER',
      ladder: LIFESTYLE,
      slabs: [40, 120],
      running: 38.5 * L,   // LIVE, close: ₹1.5L to the first slab (Smart TV)
      onam: 43 * L,        // won the Smart TV, order placed
      summer: 12 * L,
      included: ['Lifestyle'],
      excluded: ['Consumer Electronics'],
    }),
  },
};

export const DEFAULT_COHORT = 'established';

// Route lookup across every cohort's schemes, so any card opens its detail.
export const SHIP_BY_ID = Object.fromEntries(
  Object.values(SHIP_COHORTS)
    .flatMap((c) => [...c.running, ...c.completed])
    .map((x) => [x.node.entityId, x])
);
