# Gift Target Schemes: dev handoff

This package holds the shippable prototype for gift-payout target schemes on the
current My Targets UI, in the Solv app (blue chrome). It is an Expo (React Native)
prototype. The layout values, copy and state machine are the specification; the code
is reference-quality and portable to the native app.

## Run it

```
npm install
npx expo start --web --port 8099
```

Open http://localhost:8099/ship. Screenshots of every screen are in `screenshots/`.

## Scope of the ship

Per the business decision:

- A campaign is broken into MULTIPLE schemes. Each scheme has AT MOST 3 gifts.
- Each scheme is targeted through BG inclusion, so a customer sees only the schemes
  relevant to them.
- The only structural UI change to My Targets: the milestone flags gain a gift-photo
  medallion. Everything else keeps the current paradigm (toolbar, two tabs, card
  list, detail sections).

## Files that ship

| File | What it is |
| --- | --- |
| `app/ship/index.js` | My Targets list: two tabs, card list. `?tab=1` deep-links Completed. |
| `app/ship/[id].js` | Scheme Details: hero (compact progress), gift ladder timeline, history, rules, top items. |
| `app/ship/states.js` | Every card state plus stress cases, for QA. |
| `src/ship/ShipSchemeCard.js` | The list card. |
| `src/ship/MedallionRail.js` | The progress rail: man, bar, flags, photo medallions. `medallions={false}` is the compact hero variant. |
| `src/ship/GiftMedallion.js` | Product photo in a ring, check badge when crossed, glyph fallback. |
| `src/ship/data.js` | Mock schemes. Replace with the API. |
| `src/ship/SchemeStrip.js` | The in-journey touchpoints: PPV strip, cart strip (projected bar), confirmation card (nudge + win). |
| `app/ship/ppv.js`, `cart.js`, `order-confirmation.js` | Touchpoint host mocks; `order-confirmation?win=1` shows the slab-crossing celebration. |
| `src/gifts/state.js` | THE state machine. Single source of truth for every surface. |
| `src/gifts/data.js` | `giftSchemeNode()` (card payload builder) and shared copy. |

Shared components used: `src/components/{Toolbar,TabLabel,EmptyState,HtmlText}.js`,
`src/icons.js`, `src/theme.js`, `src/textMetrics.js`, `src/fontWidths.js`,
`src/gifts/icons.js` (glyph fallbacks), `src/gifts/solv.js` (SOLV colour tokens).
Gift photos: `assets/gifts/`. In production, serve the photo URL in the milestone's
`payoutIcon` field; the client falls back to a line glyph when it is empty.

## The state machine (src/gifts/state.js)

| State | Trigger |
| --- | --- |
| SCHEDULED | now < start |
| LIVE | window open, no slab crossed |
| EARNED | a slab crossed; highest crossed slab = the gift in hand |
| NEAR_SLAB | gap to the next slab is 20% or less of the slab step |
| TOP_REACHED | top slab crossed |
| ENDED_MISSED | window closed, no slab crossed |
| ENDED_PENDING | window closed with a gift, order not placed |
| GIFT_ORDERED | order placed (`gift_order_id`) |
| DELIVERED | delivery confirmed (`gift_delivered_at`) |

Backend fields the gift variant needs on top of target_scheme:
`payout.payoutMode = 'GIFT'` with a gift reference (name, short name, photo URL),
`gift_order_id`, `gift_delivered_at`. Milestone cap for this ship: 3.

## Design contract (do not drift)

Colour, one meaning each:
- Blue: progress and action. Bar fill, man, crossed flags, the WON medallion's ring,
  "₹X more".
- Green: won. The single check badge, "You won", delivery success, "Eligible".
- Grey: not yet, or past tense.

Medallion states (the scheme pays ONE gift; the medallions must say which):
- won     highest crossed slab: blue ring, GREEN check, full photo. The check is the
          card's ONLY badge, so the badge itself is the one-gift rule.
- passed  crossed, then out-climbed: grey ring, photo dimmed to 50%, NO badge.
          Any checkmark near a gift whispers "you get this", so passed carries none.
- open    not yet crossed: grey ring, FULL-COLOUR photo, no badge. Never washed out.
Two checks on one card would read as "you get both" and become a support call.

Cohort mapping: ONE customer maps to ONE running scheme, slabs priced to the
customer (demo views: /ship?cohort=starter|growth|established|bumper). The cohort
name is a targeting artifact and never renders in customer-facing copy.

Copy, one shape each:
- Running distance: "₹3,60,000 more". Ended distance: "Needed ₹80,000 more".
  Same shape, past tense. Never "short", never "left", never "Missed"/"Replaced".
- The won gift says "You won" everywhere, running or ended. "is yours" appears only
  in the future tense, on gifts not yet won.
- The Yours/won row carries the delivery fact under the name:
  running "You get it after the scheme ends, 9 Nov 2026";
  ended "Your gift order will be placed soon" / "On the way. Ordered 16 Sep." /
  "Delivered 18 Nov". Orders are placed only AFTER the scheme window closes.
- A superseded gift (crossed, then out-climbed) keeps its check and dims its name.
  No verdict word.
- Every end date is per scheme. Never print one campaign's date on another scheme.

Typography: bold only at 14sp and up (titles, product names, the chip). Below 14sp,
emphasis is size and colour, never weight. Amounts use tabular figures.

## Behaviour and edge cases the components already handle

1. Nothing positioned draws before the container width is measured.
2. The pager sizes pages from its own `onLayout`, never `useWindowDimensions`
   (split screen, foldables, web frames).
3. The current-value pill hides at zero.
4. Medallion centres clamp into the card and push apart pairwise (6dp gutter);
   crowded ladders (10L/15L/20L) cannot overlap photos.
5. Edge labels shift inward instead of ellipsising ("Soundbar" stays whole).
6. A gift with no photo renders its line glyph in the same ring.
7. Ended list cards drop the meter and state the outcome; the detail page keeps the
   full rail as the record.
8. The ladder timeline is drawn from measured row centres: one continuous line,
   blue up to the gift in hand.
9. The bar fill animates once, 600ms ease-out. Cards scale 0.98 on press.
10. SCHEDULED: the card announces the top gift and start date (no chip, no meter);
    a not-yet-started scheme never sits on the running list. The state renders in
    the states gallery, and its detail is a catalogue with no amounts to act on.

## In-journey touchpoints

All three read the same schemeState() as My Targets, so no surface can disagree.

- PPV: one strip in the offers position. It renders ONLY when the product falls
  inside the scheme's included category; an ineligible product carries no strip.
- Cart: the strip states this cart's ELIGIBLE amount ("₹18,000 of this cart counts:
  Lifestyle products only"), the projected landing point, and draws the projection as
  a lighter segment on the bar. Out-of-scope line items visibly do not move it.
- Order confirmation: the quiet nudge (added amount + distance left), or the WIN
  moment when the order crosses a slab: the won gift leads at full size with the
  delivery timing. The added amount is the cart's eligible total, so the confirmation
  continues the exact number the cart promised.

## QA checklist

Walk `app/ship/states.js` (11 states + 2 stress cases), then on the list: both tabs,
every card opens its detail, back returns to the same tab. On details check the four
endings: won+pending, won+ordered, won+delivered, missed. On touchpoints: PPV strip
opens the detail, cart's eligible amount matches the confirmation's added amount, and
`?win=1` celebrates with the correct gift.
