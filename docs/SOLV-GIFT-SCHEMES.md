# Solv gift schemes: two design flows

Date: 20 Aug 2026. Input: "Final Working for Mega Diwali Scheme.xlsx" (sheets "Final Gift
Summary" and "Budget"). The team wants target schemes for Solv app customers. The payout is a
physical gift, not Jumbo Cash. The campaign runs in a window. The customer receives the gift
after the window ends.

## The business input

The sheet defines two per-category ladders. GTV slabs are in lakhs.

| Ladder | Slabs | Top slab |
|---|---|---|
| Lifestyle (excluding Consumer Electronics) | 8 (2L to 120L) | iPhone 17 at 120L |
| Consumer Electronics | 9 (1L to 150L) | iPhone 17 at 150L |

The Budget sheet plans about 3,335 gifts for a total of ₹61.62 lakh, from ₹200 Amazon
vouchers (870 units) to a ₹1,00,000 Goa trip (6 units). Assumption: the campaign window
(1 Oct to 9 Nov 2026) is not in the sheet; the prototype uses these dates as placeholders.

One customer is enrolled in one category ladder. The BG inclusion rule
(`gir_should_include`) decides which one. Both prototype flows render the view of a
customer on the Lifestyle ladder. This enrollment model matches the per-customer
targeting the current stack already does, so it needs no new machinery.

Note: the Budget sheet gift list (vouchers, washing machine, OnePlus, Goa trip) and the Final
Gift Summary list do not match. The prototype renders the Final Gift Summary list. Confirm
which list is final before build.

## Fit into the current paradigm (Flow A: /gift-targets)

The current stack (`main.jt_target_scheme_prod.target_scheme` + the My Targets UI) carries a
gift scheme only with these changes:

1. **New payout mode.** `PayoutBO` supports CASHBACK and JUMBOCOIN. A gift needs a third
   mode, GIFT, that carries a gift reference (name, image, SKU) in place of a numeric value.
2. **The 4-milestone cap.** The schema has `milestone_1..4`. The Diwali ladders have 8 and 9
   slabs. The merch team must cut the ladder to 4 slabs, or chain schemes. Flow A shows the
   Lifestyle cut (2L/5L/10L/20L). A second constraint sits in the card: milestone flags land
   at their share of the bar, so close slabs (1L and 2L on the Electronics ladder, at 10% and
   20%) collide. The card geometry forces cuts beyond the schema cap.
3. **UI slots assume numbers.** The TSWP card has a static "₹" TextView next to the payout
   value, and the milestone markers print numeric payouts. Flow A replaces both with a gift
   glyph plus a short gift name. Four markers also crowd a card drawn for 2-3. One slot
   already fits: `payoutIcon` is a URL on the wire, so the stack can serve product
   thumbnails today. Flow A uses product photos in the detail-page gift list on that basis.
4. **Copy.** "Credited after the scheme ends" becomes "delivered after the scheme ends".
5. **No fulfillment.** The system credits Jumbo Cash at `payout_time` and is done. A physical
   gift still needs an address, a dispatch, an owner, and a proof of handover. All of that
   happens off-system today.

One thing fits cleanly: per-customer enrollment. BG inclusion already targets each customer
into one scheme, so "one customer, one category ladder" is the existing model.

Conclusion: the current paradigm can announce and track a gift scheme with modest changes
(items 1, 3, 4). It cannot express the full ladder (item 2) or fulfillment (item 5).

## What a new experience needs (Flow B: /mega-diwali)

Flow B starts from the gift mechanic:

- **One campaign surface for the enrolled ladder.** The page shows the ladder the customer
  is on, the window, and a countdown. The header names the scheme ("Your scheme:
  Lifestyle").
- **Product photos carry the desire.** The next gift renders as a large product photo with
  the exact gap amount ("Buy for ₹3,60,000 more before 9 Nov"). Every ladder tier has a
  photo thumbnail. Locked tiers dim; secured tiers keep full color.
- **The spotlight pedestal.** The earned gift floats on a gold radial glow in a dark
  stage, labeled "YOUR GIFT". Possession is the spotlight. Reference: Shopee Lucky
  Prize puts the prize on a lit pedestal in a dark room
  ([Mobbin](https://mobbin.com/screens/74a0f438-dee0-4d14-afd8-2f1a29003bf8)).
- **One giant sentence.** "₹3,60,000 more / and the Soundbar is yours instead." The
  word "instead" carries the one-gift rule. Reference: Grab VIP's hero is a single
  sentence in display type
  ([Mobbin](https://mobbin.com/screens/176d50de-1d09-4586-a8a3-2c87edaf83f9)).
- **The next gift sits on the bar.** The progress bar ends in a gold ring that holds
  the next gift's photo. Reference: Shopee Member parks the next tier's badge at the
  end of the meter
  ([Mobbin](https://mobbin.com/screens/d9be55ce-b373-4bea-8c07-9b96f34de029)).
- **Rules behind a link, facts as icons.** No sentence on the page explains the page.
  The rulebook is three icon facts (1 gift per shop / what counts / delivered by
  Amazon) plus a "Rules" link. Reference: Temu's campaign pages keep rules behind a
  small top-right link
  ([Mobbin](https://mobbin.com/screens/a2ce726b-1e49-4d9b-9e5a-e7507812b1ea)).
- **The gift list is a leaflet table.** Slab amount in bold, photo, name. Passed rows
  fade; the earned row carries a gold "YOURS" chip; the next row's amount turns gold
  with a small "next"; future gifts stay in full color so desire stays bright. The
  top slab (iPhone 17, ₹1.2Cr) closes the table as a full-bleed dark TOP PRIZE card.
- **The stacked variant survives at /mega-diwali/stacked** as a backup for comparison;
  treat its per-tier "Secured" labels as a known misread risk.
- **Local progress.** The bar measures progress from the previous tier to the next tier.
  A single 0-to-top-slab bar would sit near zero for most customers.
- **The one-gift rule in full.** "You receive one gift: the gift for the highest slab you
  cross before the scheme ends." The same rule governs the current paradigm (payout at
  highest milestone); a physical gift makes it worth stating on the page.
- **An end-of-window flow.** Gift confirmation with the product photo, delivery-address
  confirmation, and a delivery timeline (confirmed, ordered on Amazon, on the way,
  delivered). Fulfillment runs through Amazon: the team places the order to the shop
  address, and Amazon delivers. Jumbo Cash has no equivalent of this flow.

Gift photos live in [assets/gifts/](../assets/gifts/), pulled from the product pages linked
in the sheet (Amazon image CDN; the iPhone 17 photo comes from the Flipkart listing).

## Theming: campaign skin vs app chrome

The night-purple + gold is the Mega Diwali campaign skin, not the scheme system's
color. The scheme framework renders in Solv app chrome (blue; the token in
src/gifts/solv.js is an assumption to replace with real Solv brand tokens). A
festival campaign carries its own skin, applied to its card and its pages. Regular
schemes wear the default blue skin. /solv-schemes shows this: the Diwali card is the
one dark card among white ones. Flow A stays Jumbotail green because it replicates
the JT app paradigm.

## Scheme cards and the state ladder (/solv-schemes, /solv-schemes/states)

One card design serves every scheme type: thumb (the gift in play), title, one
status sentence, days-left chip, and a slim progress bar with the reward's photo at
the bar's end. References: Wolt Rewards challenge rows and Grab Challenges cards
([Wolt](https://mobbin.com/screens/aa29d84b-a326-4eff-8a9d-fbe6a3d9e031),
[Grab](https://mobbin.com/screens/da0228d2-bc11-4fd2-a511-c1487837f4a4)).

Scheme types shown running in parallel: the festival gift ladder (skinned), a
single-gift trade scheme (the commonest slab-scheme shape), and a brand-funded
voucher scheme. The card lifecycle, start to end:

| State | Trigger | Card |
|---|---|---|
| SCHEDULED | before ts_start_time | top prize, "Starts 1 Oct" |
| LIVE | window open, nothing crossed | first gift, "Buy for ₹2L and the Mixer is yours" |
| EARNED | a slab crossed | held gift as thumb, gap sentence, bar |
| NEAR_SLAB | gap under 20% of the step (derived) | "Only ₹40,000 left", bar near full |
| TOP_REACHED | top slab crossed | "The iPhone 17 is yours." |
| ENDED_PENDING | after ts_end_time, order not placed | "Confirming your Soundbar" |
| GIFT_ORDERED | Amazon order placed | "On the way. Reaches you by 21 Nov." |
| DELIVERED | Amazon delivery confirmed | muted, "Delivered on 18 Nov", moves to Ended |

## End of scheme (/mega-diwali/claim)

The won gift on the same spotlight pedestal ("YOU WON"), then a horizontal 4-step
icon stepper (Won, Ordered, On the way, Delivered) with the Amazon order number
shown once, then the address card ("Your gift ships here") with a confirm action.
References: Fi and Instacart close delivered orders with compact horizontal steppers
([Fi](https://mobbin.com/screens/7bec611e-e757-41f8-aef6-71251da76a05),
[Instacart](https://mobbin.com/screens/e3d0881e-1cc4-4c6c-a06a-4bc747f576da)).

## The 10x pass (20 Aug 2026)

- **A primary CTA.** The hub now ends its pitch in "Shop Lifestyle products". A
  campaign page that cannot route into the catalog converts nobody.
- **Rules page (/mega-diwali/rules).** The "Rules" link works and carries the fine
  print the page deliberately omits: returns reduce the total, no cash exchange,
  out-of-stock substitution at equal or higher value, dispute window.
- **EN / Hindi toggle on the hub.** The audience is Hindi-first. The toggle proves
  the design survives translation; every layout holds with Devanagari strings.
  Translations are drafts for review by a native speaker.
- **Motion.** The pedestal gift springs in, the progress bar fills to its value on
  entry, the sparkles pulse. Same treatment on the claim screen.
- **Share the win.** The claim screen carries "Share your win on WhatsApp": a
  retailer who wins a soundbar shows it around, and the share card recruits the
  next participant.

## Entry points (/mega-diwali/entries)

A scheme page needs traffic. The mocked surfaces, each with its trigger:

1. **Home banner.** Launch state sells the top prize ("Buy more, win up to an iPhone
   17"). After the first slab, the banner turns personal: the gap amount and what is
   in the box now. Personal beats generic for the rest of the window.
2. **Product page strip** on every eligible item: "Counts toward your Diwali gift"
   plus the current gap. This answers "does this purchase count?" at the moment of
   choice.
3. **Cart nudge.** Every order shows its own contribution ("This order adds ₹42,000
   toward your gift"). When an order crosses a slab, the nudge becomes the
   celebration: "This order puts the Soundbar in your Diwali box!" The cart is the
   highest-leverage surface; the gap math is live there and the customer can still
   add items.
4. **Push notifications**: launch, near-a-slab ("Only ₹40,000 to the Soundbar"), and
   delivery updates after the window.
5. **WhatsApp card.** The Sales Officer forwards a scheme card (photos of 4 gifts,
   window dates); retailers forward it onward. In this segment WhatsApp forwarding is
   distribution, and the SO relationship is the trust channel even though delivery
   runs through Amazon.

All surfaces open the scheme page, and the personalized ones read the same slab data
the hub uses.

## Backend needs beyond the prototype (new experience)

- A gift catalog entity (product link, image, price, unit cap per gift tier) and a budget
  guardrail (the Budget sheet caps units per tier).
- A fulfillment record per winner: CONFIRMED, ORDERED, ON_THE_WAY, DELIVERED. Fulfillment
  runs through Amazon: the team places the order to the customer's shop address and stores
  the Amazon order number. The Budget sheet supports this model; it already lists Amazon
  vouchers as gift tiers. Status can start as a manual ops update keyed by the order number.
- Address confirmation before the Amazon order is placed. Amazon needs a deliverable
  address; a shop pin from onboarding may not be one.
- Progress accrual for the customer's enrolled ladder, with the same order eligibility
  rules the current `smt_current_value` accrual uses.
- Solv is a separate client from the JT customer app (different event set), so the surface
  ships in the Solv app, not in My Targets.

## Where the flows live

- Drawer section "Solv gift schemes: design flows" in [app/index.js](../app/index.js).
- Flow A: [app/gift-targets/index.js](../app/gift-targets/index.js),
  [app/gift-targets/[id].js](../app/gift-targets/[id].js), components under
  [src/gifts/](../src/gifts/).
- Flow B: [app/mega-diwali/index.js](../app/mega-diwali/index.js),
  [app/mega-diwali/claim.js](../app/mega-diwali/claim.js).
- Shared data (ladders from the sheet): [src/gifts/data.js](../src/gifts/data.js).

No existing screen changed, except the two new drawer entries in app/index.js.
