// One derivation of the gift-scheme lifecycle. The list card, the detail screen and any
// entry point read this function, so they cannot disagree about what the customer holds.
//
// The eight states map to target_scheme columns plus two fulfilment fields the gift
// variant adds (gift_order_id, gift_delivered_at):
//   SCHEDULED      now < ts_start_time
//   LIVE           window open, no slab crossed (smt_current_value < milestone_1)
//   EARNED         a slab crossed; the highest crossed slab is the gift in hand
//   NEAR_SLAB      derived: the gap to the next slab is 20% or less of the slab step
//   TOP_REACHED    the top slab is crossed; nothing left to win
//   ENDED_MISSED   window closed, no slab crossed; terminal
//   ENDED_PENDING  window closed with a slab crossed; the confirmation call is still to come
//   CALL_MISSED    the confirmation call went unanswered; we will call again
//   CALL_FAILED    no answer after several calls; the shop is asked to call us
//   GIFT_ORDERED   address confirmed on the call, gift ordered and on the way
//   DELIVERY_ATTEMPT_FAILED a delivery attempt failed; the courier will try again
//   DELIVERED      delivery confirmed; terminal
//   DELIVERY_FAILED the courier gave up; the shop is asked to call us
// A gift is never lost in the failed states: a call to support sorts it out.
//
// NEAR_SLAB and TOP_REACHED are refinements of EARNED/LIVE, so `earned` tells a caller
// whether a gift is secured without having to list the states again.

export const STATE = {
  SCHEDULED: 'SCHEDULED',
  LIVE: 'LIVE',
  EARNED: 'EARNED',
  NEAR_SLAB: 'NEAR_SLAB',
  TOP_REACHED: 'TOP_REACHED',
  ENDED_MISSED: 'ENDED_MISSED',
  ENDED_PENDING: 'ENDED_PENDING',
  CALL_MISSED: 'CALL_MISSED',
  CALL_FAILED: 'CALL_FAILED',
  GIFT_ORDERED: 'GIFT_ORDERED',
  DELIVERY_ATTEMPT_FAILED: 'DELIVERY_ATTEMPT_FAILED',
  DELIVERED: 'DELIVERED',
  DELIVERY_FAILED: 'DELIVERY_FAILED',
};

// The gap that turns EARNED into NEAR_SLAB, as a share of the current slab step.
export const NEAR_SLAB_SHARE = 0.2;

const DAY = 24 * 60 * 60 * 1000;

// tiers: [{ at, name, shortName, icon }] in ascending order of `at`.
// fulfilment: { callMissedAt, callFailedAt, orderedAt, attemptFailedAt, deliveredAt, failedAt }
// for the won states; all optional.
export function schemeState({ tiers, currentValue, startTime, endTime, now, fulfilment = {}, startLabel = '', endLabel = '' }) {
  const ladder = [...tiers].sort((a, b) => a.at - b.at);
  const top = ladder[ladder.length - 1];
  const crossed = ladder.filter((t) => currentValue >= t.at);
  const secured = crossed.length ? crossed[crossed.length - 1] : null;
  const next = ladder.find((t) => currentValue < t.at) || null;

  const remaining = next ? next.at - currentValue : 0;
  // The step is measured from the slab already held, not from zero: the customer buys
  // the difference between two slabs, so that is the distance urgency should reflect.
  const stepFrom = secured ? secured.at : 0;
  const step = next ? next.at - stepFrom : 0;
  const nearSlab = Boolean(next) && step > 0 && remaining <= step * NEAR_SLAB_SHARE;

  const daysLeft = Math.max(0, Math.ceil((endTime - now) / DAY));
  const started = now >= startTime;
  const ended = now > endTime;

  let state;
  if (!started) {
    state = STATE.SCHEDULED;
  } else if (!ended) {
    if (!secured) state = STATE.LIVE;
    else if (!next) state = STATE.TOP_REACHED;
    else if (nearSlab) state = STATE.NEAR_SLAB;
    else state = STATE.EARNED;
  } else if (!secured) {
    state = STATE.ENDED_MISSED;
  } else if (fulfilment.deliveredAt) {
    state = STATE.DELIVERED;
  } else if (fulfilment.failedAt) {
    state = STATE.DELIVERY_FAILED;
  } else if (fulfilment.attemptFailedAt) {
    state = STATE.DELIVERY_ATTEMPT_FAILED;
  } else if (fulfilment.orderedAt) {
    state = STATE.GIFT_ORDERED;
  } else if (fulfilment.callFailedAt) {
    state = STATE.CALL_FAILED;
  } else if (fulfilment.callMissedAt) {
    state = STATE.CALL_MISSED;
  } else {
    state = STATE.ENDED_PENDING;
  }

  return {
    state,
    currentValue,
    startLabel,
    endLabel,
    ladder,
    top,
    secured,
    next,
    remaining,
    step,
    nearSlab,
    daysLeft,
    started,
    ended,
    earned: Boolean(secured),
    // The meter is drawn against the top slab, so it stops at 100 and never exceeds it.
    progressPct: top.at > 0 ? Math.min(100, (currentValue / top.at) * 100) : 0,
  };
}

// Terminal states must not show a progress meter: after the window closes the bar
// cannot move, and a half-filled bar reads as "keep buying".
export function isTerminal(state) {
  return (
    state === STATE.ENDED_MISSED ||
    state === STATE.ENDED_PENDING ||
    state === STATE.CALL_MISSED ||
    state === STATE.CALL_FAILED ||
    state === STATE.GIFT_ORDERED ||
    state === STATE.DELIVERY_ATTEMPT_FAILED ||
    state === STATE.DELIVERED ||
    state === STATE.DELIVERY_FAILED
  );
}
