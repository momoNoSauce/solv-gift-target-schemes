# Pixel review — third pass

Method: for each screen, every view in the source layout was dumped with its full attribute
set (`layout_*`, padding, text size, colour, visibility, constraints) and compared line by
line against the replica's styles. Fixes below are grouped by what caused them.

## Foundation: text box heights were wrong everywhere

Android measures a single-line `TextView` with `includeFontPadding` (the default) as
`(OS/2.usWinAscent + OS/2.usWinDescent) / head.unitsPerEm * textSize`. Read from the app's own
Roboto files that is `(1946 + 512) / 2048 = 1.20019 x size`:

| Text size | Android box | Replica had |
|---|---|---|
| 12sp | 14.40 | 16 |
| 14sp | 16.80 | 19 |
| 16sp | 19.20 | default |
| 20sp | 24.00 | default |

Every absolutely positioned stack was derived from the wrong numbers, and every other text
box relied on the browser's default line height (Roboto hhea: 1.17 x size).

1. Added [src/textMetrics.js](../src/textMetrics.js) with the measured values.
2. Recomputed the target-scheme card stack: current value 24.8 (was 27), bar top 56.8 (was
   59), reward row 83.2 (was 87), milestone marker 76.8 (was 80).
3. Set an explicit `lineHeight` on **135 text styles across 21 files** so each box matches the
   Android measurement.

## Target schemes

4. Transaction-history chevron was 14dp; the `ImageView` is `layout_height=0dp` constrained to
   the 15sp text box, so it is 18dp.
5. A 6dp gap sat between "View" and that chevron; the layout constrains them edge to edge.
6. The Top-items `VIEW` button chevron was 14dp; `drawableEnd` draws at the drawable's
   intrinsic 24dp with `drawablePadding` unset.
7. `footer_label_view` reserved 59dp; the row it overlays is 20 + 20 + 16.8 = 56.8dp.

## Rewards

8. The small scratch card used a 10dp corner radius. `info_layout` uses
   `reward_shadow_large_bg` on every size, so it is 20dp; only the outer `dummy_shadow_rect`
   is 10dp.
9. Reward artwork ignored `scaleType=fitCenter`. In a 140x60 / 208x92 / 180x80 box the 2:1
   banknote paints 120 / 184 / 160 wide and the square coin 60 / 92 / 80.
10. The grid item was missing the 2dp margin `main_scratch_card_layout` puts around the card.

## Jumbocash

11. The ledger header was left-aligned. The date, the balance row, the pending pair and the
    conversion line are all start+end constrained, so they are centred.
12. The pending status chip was left-aligned; it is end-aligned to the pending pair.
13. "Know More" was rendered as its own line. There is no such view: it is part of the
    conversion `TextView`, and the whole line is the tap target for the policies screen.
14. Column headers were equal quarters. They are percent widths .4 / .17 / .17 / .17 with
    16 / 8 / 8 / 8 start margins inside a 50dp-minimum row.
15. Row columns were equal quarters. They are .4 / .18 / .18 / .18 with paddingLeft 8 / 4 / 8.
16. Row text was 13sp. The layout sets no `textSize`, so it is the 14sp default.

## Cashback

17. The header icon was a bare 60x30 image; the `ImageView` is 60x60 with `fitCenter`, which
    sets the header row height.
18. The card border was `#e6e6e6`; `outline_grey_cornered_border` strokes `light_grey_5`
    (`#22222221`, 13% black).
19. Dotted separators were 1dp boxes. `@drawable/dotted_line` sits in a 10dp view (2dp for the
    one above the offers row) with the dashes centred.
20. The claimed row stretched the label to fill; `textWithGoldContainer` is `wrap_content` and
    start-aligned, with the amount and tick at the end.
21. The label ignored `android:maxLength="25"`.
22. The VIEW ALL arrow was 16dp black; `ic_new_arrow_right` is 24dp filled `grey_text`.
23. The claimed state was a padded column; it is a badge at the top plus a 140dp block with a
    16dp top margin.
24. The ticket outline was drawn 229dp tall inside a 250dp card; the drawable is the card's
    background and stretches.

## Quiz and survey

25. Question chips were numbered circles. `question_guiding_layout` is a reward count plus
    `ic_jumbocoin_new`, a 35x34 circle with "Q1" (white/`#A5A5A5` stroke when unmarked,
    `#D6EFC4` correct, `#FFCCCC` wrong), a tick or cross underneath, and a 40x4 connector that
    hides on the last chip.
26. Ported `ic_jumbocoin_new` with both gradients and the white mark.
27. The sheet handle used `black_10pc`; the quiz sheet uses `light_grey_4` `#D1D1D1` (the
    disabled sheet is the one that uses `black_10pc`).
28. Option rows were invented. `option_viewholder_binding` is a 20dp radio at 12dp, text at
    16sp with 12dp vertical padding, a 21dp guiding icon on quiz rows, 6dp vertical margins,
    and the correct / wrong background and border swaps.
29. The survey action was one full-width button; it is "Skip this Question" (80dp,
    `jix_button_skip`) beside "Next Question" (fills the rest, `#C9C9C9` until an option is
    picked, then `light_green`).

## SuperClub

30. The current-value pill used a 14px line box. `.current-indicator` sets no line-height, so
    10px text inherits the body's 1.846 and the pill is 22.46dp tall.

## Also fixed while reviewing

31. A JSX comment placed directly inside a ternary branch broke the bundle; caught by the
    bundler and fixed.

## What is still not reviewed at this depth

- SuperClub's three screens were verified against the CSS rules, not re-derived box by box.
- The OTP card, the order-confirmation gamification block and the product-tag screen were
  built from full dumps in the previous pass and were not re-diffed here.
- Ripple, elevation shadow spread and press states are the platform defaults, not measured
  against Android's.

## Pass: removal of invented design (2026-08-21)

The prototype carried design that the app does not have. This pass removed it and
corrected the geometry errors that the removal exposed.

### Invented chrome removed

| Item | Was | Now |
| --- | --- | --- |
| Drawer section label | "Surfaces inside other screens" over dev-jargon labels | plain divider, real screen titles |
| `/coins/quiz` | full screen with a state switcher pill | `BottomSheetDialogFragment`, no switcher |
| `/coins/survey` | toolbar over the sheet content | bottom sheet, no toolbar |
| `/cashback` | invented toolbar | bare RecyclerView host, as in the app |
| `/targets/pdp-offer` | invented "Product details" toolbar | no toolbar |
| `/jumbocash/labels` | three specimen cards with grey boxes | two `card_product_group_item` rows with `product_image_placeholder` |
| Detail header title | `"<scheme> - Target scheme"` | `displayData.title` only |
| SuperClub message mock | `messageType: 'offer'` | `messageType: 'info'`; the site ships only `info.png` and `success.png` |

### Letter spacing

Android screens carry no tracking. `TextAppearance.MaterialComponents.Button` is the
only exception in the app, and `AppCompatButton` is not that style, so the 0.5 tracking
on `viewButtonText` in [app/scheme/[id].js](app/scheme/[id].js) was wrong and is gone.
The dead `tabText` style in [app/targets.js](app/targets.js) is gone; `TabLabel` measures
the label itself. SuperClub keeps `letter-spacing: .1px` from its body rule and 1.25 on
the tab labels (`0.0892857em` at 14sp).

Seven micro-label styles in `app/mega-diwali`, `app/solv-schemes` and `app/gift-targets`
carried 0.8 to 2.5 tracking on 10 to 11px bold uppercase text. That tracking is removed.
Those three route trees came from outside this session; their copy and structure are
unchanged.

### Geometry corrected

1. `TargetSchemeCard` current-value bias. The card used
   `manX + 10 + (32 - 10 - cvW) * p`. `updateCurrentValueIndicator()` calls
   `ConstraintSet.setHorizontalBias(current_value, progress/100)` on a view constrained
   start-to-start and end-to-end of `target_scheme_user`, so the free space is
   `32dp - cvW`, which is negative. The formula is now `manX + (32 - cvW) * p`.
2. Voice FAB icon. The card used the stock Material mic at 24dp in white. The app uses
   `ic_audio_blue_2`, 13x19dp, filled `blue_1` (`#023D8C`) on a `blue_1` circle;
   `fragment_product_list.xml` even adds `android:tint="@color/blue_1"` on top. The mic
   is therefore the same colour as the FAB behind it. The prototype now reproduces that.
3. `full-wide` images on SuperClub. `<img class="full-wide">` is `width:100%` with
   `height:auto`. React Native Web resolved `aspectRatio` against the flex
   `min-height:auto` of the bitmap and lost, so `info.png` rendered 99x156 instead of
   99x95, and the gold banner rendered 412x60 instead of 412x69. The widths are now
   measured with `onLayout` and the heights derive from the bitmap ratio.

### Not fixed, and why

Reward catalogue tiles show `product_image_placeholder`. `product.imageURL` comes from
the SuperClub API, which needs a session; `superclub.jumbotail.com/conf.js` returns 404,
`assets/img/` holds only `info.png` and `success.png` for messages, and no readable
warehouse table carries a product image column. The app shows the same placeholder when
`imageURL` is empty, so the tiles are correct for the data available, not decorated.

## Entry points for the gift-scheme design flows

The drawer opened the scheme pages directly. A customer never arrives that way: the
scheme page opens from a card on a scheme list. The drawer now offers the lists only.

| Row | Opens | Then |
| --- | --- | --- |
| A. Gift scheme in the current paradigm | `/gift-targets` (My Targets list) | tap the card, `/gift-targets/[id]` |
| B. Solv My Schemes, Mega Diwali and parallel schemes | `/solv-schemes` (My Schemes list) | tap the Mega Diwali card, `/mega-diwali`; from there `/mega-diwali/stacked`, `/rules`, `/claim`; from the list `/solv-schemes/states` |
| C. Entry points | `/mega-diwali/entries` | the banner, PDP, cart, push and WhatsApp mocks sit outside both lists, so this row stays direct |

Nothing became unreachable. The stacked variant and the card-state sheet keep the links
they already had inside the flows.

## Gift scheme card: one state, every context

The paradigm is unchanged. My Targets keeps its toolbar, its two tabs and its card list.
The work is in what a card guarantees.

### One derivation

`src/gifts/state.js` holds the whole lifecycle. It maps to target_scheme columns plus
two fields the gift variant adds (`gift_order_id`, `gift_delivered_at`):

| State | Trigger |
| --- | --- |
| SCHEDULED | before `ts_start_time` |
| LIVE | window open, `smt_current_value` below `milestone_1` |
| EARNED | a slab crossed; the highest crossed slab is the gift in hand |
| NEAR_SLAB | the gap to the next slab is 20% or less of the slab step |
| TOP_REACHED | the top slab crossed |
| ENDED_MISSED | window closed, no slab crossed |
| ENDED_PENDING | window closed with a slab crossed, no order placed |
| GIFT_ORDERED | order placed |
| DELIVERED | delivery confirmed |

The list card, the card payload builder and the detail screen all read this one
function, so the chip, the sentence, the meter and the ladder cannot disagree. Before
this pass the detail screen told a closed scheme's owner to "buy above ₹10,00,000".

### What the card guarantees

1. A footer row names the gift in hand and the gift next up. The bar labels are
   best-effort; these two facts are what a customer asks for, so they never depend on
   how the slabs happen to fall.
2. Milestone labels are placed in priority order (slab held, slab next, then left to
   right) and a label whose ink would touch one already placed is dropped. The flag
   stays, so the ladder keeps all of its steps. A 4-slab ladder on a 20L scale puts
   ₹2L and ₹5L 43dp apart with 100dp marker boxes, which is why they used to overlap.
3. After the window closes the meter is replaced by the outcome. A frozen bar reads as
   "keep buying" on a scheme that can no longer move.
4. The value pill is hidden at zero, as the app does, so a fresh member sees the ₹0
   start label with nothing stacked on it.
5. The chip carries time and only time. Slab urgency turns the sentence red instead; a
   red chip on a scheme with 21 days left would read as "time is short".
6. Nothing positioned draws until the card width is measured. The card no longer paints
   as a pile at x=0 on first layout or after a resize.

### Marker geometry corrected

`mile_stone_layout.xml` constrains the reward row with
`app:layout_constraintEnd_toEndOf="@id/milestone_limit"`, so its right edge sits on the
value's right edge and the logo hangs off to the left. Both markers centred the row
instead. Fixed in the replica and the fork. The row is `wrap_content` with only an End
constraint, so on Android it overflows the 100dp box rather than wrapping; the RN copy
needed `flexShrink: 0` and `numberOfLines={1}` to match.

### Coverage

- Running tab: the one scheme the member is enrolled in. BG inclusion decides which
  ladder, so more running cards would misstate enrolment.
- Completed tab: DELIVERED, GIFT_ORDERED, ENDED_PENDING and ENDED_MISSED, each a past
  scheme with its own window and title.
- `/gift-targets/states`: all ten states against the same card component, for review.
  Linked from the foot of the running list, matching `/solv-schemes/states`.
- Every card in both tabs opens a detail screen. The detail payload is derived from the
  same node, so a card can no longer lead to a blank page.

## Solv scheme card: the bar gets a scale

The My Schemes card was decoration around one sentence. `bar: { pct: 28 }` was a magic
number with no relation to anything else on the card, so the fill could not be read:
nothing said where the buying stood, what the leg cost, which gift the ring at the end
held, or what the left thumbnail was. "the Soundbar is yours instead" never said
instead of what.

The card now names four things and never fewer:

| Fact | Where |
| --- | --- |
| The gift in hand | left thumb, captioned YOURS, with the full product name beside the title |
| Where the buying stands | the value sitting on the fill's end |
| What the leg costs | the slab values under each end of the bar |
| The gift next up | the thumb on the bar's end, with its slab value and name under it |

The bar measures the current leg, from the slab held to the slab next, not the whole
ladder. The old bar ran against the top slab, so a 28% fill sat beside a sentence about
₹3,60,000 to the next gift and the two numbers had nothing to do with each other.

`solvSchemeCard()` in [src/gifts/solv.js](src/gifts/solv.js) maps a `schemeState()`
result onto a card. The list and the states page both call it, so a state cannot be
drawn two ways, and the Solv card and the My Targets card cannot report different gifts
for the same member.

Smaller fixes in the same pass:

- The left thumb is dropped when nothing is secured and the card has a bar. The reward
  was being drawn twice, once in the thumb and once on the bar's end.
- `lakh()` falls back to the plain format below one lakh. It was printing "₹0L" and
  "₹0.4L" where "₹0" and "₹40,000" read better and are no longer.
- Urgency has its own colour on the night skin (`FESTIVAL.alert`). It mapped to gold,
  which is already the accent, so a NEAR_SLAB card looked the same as an EARNED one.
- The Sunflower and Britannia schemes had a kettle glyph and a sparkle against a steel
  dinner set and a ₹2,000 voucher. Added `dinnerset` and `voucher` glyphs.
- "the Soundbar replaces the Air Fryer" instead of "is yours instead". The sentence
  names both gifts rather than leaving a pronoun for the reader to resolve.

## Horizontal overflow: the pager was sized from the wrong box

`My Targets` and the gift fork sized their pager pages with `useWindowDimensions()`.
The web build wraps the app in a 412dp phone frame, so in a 662px browser window each
page was laid out 662 wide inside a 412 wide scroller and every card ran off the right
edge. The same fault appears on a real device in Android split screen, on a foldable's
inner display, and in any multi-window mode: the window is not the container.

Both screens now measure the pager with `onLayout`, which is what `ViewPager2` does.

### Sweep

A detector walked all 31 routes, compared every element's box against the frame, and
ignored anything inside a horizontal scroller. Four faults, three of them the same bug:

| Route | Fault |
| --- | --- |
| `/targets`, `/gift-targets` | pages sized from the window, not the pager |
| `/scheme/[id]`, `/targets/pdp-offer`, `/gift-targets/[id]` | the last-milestone flag drew at `left: w - 32` before `onLayout`, so it landed 32px off the left edge for a frame |
| `/rewards` | the scratch texture rendered at its intrinsic 1102x1232. React Native Web falls back to the bitmap's own size when an `Image` is sized only by `left/top/right/bottom`; it now carries an explicit width and height |

`DetailProgress`, `TargetSchemeProgressBlock` and `GiftDetailProgress` now gate their
positioned children on a measured width, the same guard the list card already had.

The remaining hits on `/superclub` are `<g>` and `<rect>` geometry inside `<svg>`
elements that carry `overflow: hidden`; every `<svg>` box itself sits inside the frame.

## Shippable cut: photo medallions on the current UI (/ship)

Business decision encoded: the campaign ships on the existing My Targets UI, broken
into multiple schemes with at most 3 gifts each, targeted per customer. The one design
change: the flags become gift-photo medallions.

References: Shopee's task track (reward badges sitting on the bar, values under),
sweetgreen's rewards ladder (threshold + photo + name rows) for the detail page,
Ulta's two-line tick labels.

### Components

- `src/ship/GiftMedallion.js` — photo in a white circle. Achieved: green ring + check
  badge. Locked: grey ring, photo stays FULL COLOUR (a washed-out photo kills the
  desire the card exists to create). Missing photo: line-glyph fallback. A 1px
  black-alpha inner outline keeps light product shots off the white circle.
- `src/ship/MedallionRail.js` — the TSWP block above the bar unchanged (value pill,
  man, 4dp bar); medallions hang below on 6dp stems with value + name under each.
  Shared by the card (44dp, light) and the detail hero (52dp, dark), so the two
  surfaces cannot draw the same scheme differently. Fill animates once, 600ms ease-out.
- `src/ship/ShipSchemeCard.js` — the card; scale 0.98 on press when tappable.
- `app/ship/` — list (tabs, pager sized by onLayout), detail, states gallery.

### Edge cases carried by the components

1. Nothing positioned draws before the width is measured.
2. The value pill hides at zero.
3. Medallion centres clamp into the card and push apart pairwise (6dp gutter), so
   a crowded ladder (10L/15L/20L verified) cannot overlap two photos.
4. Labels take only the width their neighbours leave; at the card's edges the box
   shifts inward instead of shrinking, so "Soundbar" stays whole (optical over
   geometric).
5. Values use tabular figures.
6. Terminal states replace the meter with the outcome + won-gift photo; row status
   says "You won" on a closed scheme, never "Your gift now".
7. copyFor() no longer produces "All Products products".

### Verified

All /ship routes render with zero frame overflow at 411 and 412dp. States gallery
covers 11 lifecycle states plus the two stress cases (crowded slabs, missing photo).

### Revision after review: the ladder card is gone

The detail page repeated the ladder twice: the hero rail (photos, values, checks,
position) and a rows card underneath with verdict words ("Replaced", "Missed") and a
"Buy for ₹X" per row. The duplicate forced the confusing vocabulary, and the one-gift
mechanic ended up as a rules paragraph glued to the card's foot.

Now:

- The app's milestone FLAG is back on the bar at every slab, planted exactly as the
  current UI plants it. The flag is the metaphor (the man walks toward a planted
  flag); the stem carries it down to the gift photo. Flag marks the spot, photo says
  what is at it. Photos on top were considered and rejected: a 44dp circle swallows
  the 28dp man and fights the value pill for the same band, which is why the app used
  a thin flag there in the first place.
- The rows card is replaced by the GIFT FOCUS CARD (src/ship/GiftFocusCard.js), which
  answers the one question the rail cannot: what do I hold, and what is the next move.
  Holding a gift shows the upgrade strip: held photo, a dashed connector carrying
  "₹3,60,000 more", an arrowhead, "and it upgrades to", the next photo. The connector
  IS the one-gift mechanic; no rules paragraph needed. Other states collapse to one
  focus block: first gift, top reached, you won (with the delivery status and date),
  or the factual miss ("You reached ₹1,20,000. The first gift needed ₹2,00,000.").
- The one-gift rule moved into Scheme Rules, stated as a rule: "One gift per scheme.
  The highest slab you cross decides the gift."

### Revision: the ended detail page keeps the ladder

Hiding the rail on ended schemes erased the scheme's record: what was on offer, how
far the buying got, and the gift that was nearly reached. The "frozen bar" rule
applies to the LIST, where a half bar on a completed card invites buying; the detail
page of an ended scheme is the customer opening the record, and the rail is the
record. The rail now always renders on the detail page.

The ended-won focus card also gains one factual line under a hairline rule:
"You were ₹4,40,000 short of the boAt Aavante Bar Soundbar". That near-miss is the
seed for the next scheme; hiding it wasted the strongest motivator the data holds.

### Revision: Solv skin and the ladder redesigned, not deleted

The /ship surface now wears Solv blue end to end, and the detail page gets its ladder
back as a designed object instead of verdict rows.

Division of labour, so nothing repeats:
- Hero (Solv blue): title, one state sentence, validity, then the app's COMPACT
  progress block: man, bar, flags, slab values. The map.
- Gift ladder card: ONE continuous timeline drawn through the gift photos (courier
  order-tracking pattern the target users read daily). Blue segment up to the gift in
  hand, grey beyond. Rows: photo, name, "At ₹5L", and one right-hand fact.
- Photos appear once, in the ladder. The list card keeps its medallion rail.

Row vocabulary, cut to what a shopkeeper says:
- Yours (row tinted blue)     the gift in hand
- ₹3,60,000 more              distance to a gift still open
- You won + delivery status   the ended scheme's gift ("On the way. Ordered 16 Sep.")
- ₹4,40,000 short / Needed    an ended scheme's unreached slab
- A superseded row keeps its check and dims its name. No "Replaced".

One colour, one meaning: blue is progress and ownership (fill, man, crossed flags,
rings, amounts, Yours); green appears only on check badges, Eligible and delivery
success; grey is not-yet or past tense.

Defects caught in this pass's own review:
- The hero fill was Solv blue on the Solv blue hero, invisible; dark mode fills white.
- The ladder connector rendered as per-row stubs; it is now two absolute segments
  drawn from measured row centres, so the line never breaks.
- "secure the Soundbar" became "and the Soundbar is yours" (trade language).
- A hooks-order violation (useState after an early return) fixed before it bit.

### Revision: row language, fulfilment timing, full state coverage

- "₹4,40,000 short" is gone. Every unreached row on an ended scheme reads
  "Needed ₹X more": the same shape as the running "₹X more", in the past tense, with
  a per-row distance so the vocabulary never switches mid-card. "Left" was considered
  and rejected: on a closed scheme nothing is left to act on.
- The gift order is placed only after the scheme window closes. This is now said
  where the expectation forms: the Yours row carries "You get it after the scheme
  ends, 9 Nov 2026". End labels are per scheme (giftSchemeNode takes endLabel), so an
  Onam scheme can never show a Diwali date. The ENDED_PENDING card copy carries no
  borrowed campaign date: "Scheme ended. Your gift order will be placed soon."
- State coverage on the detail page: SCHEDULED added end to end. A New Year scheme in
  the running list opens a detail whose hero says "Starts 15 Nov 2026. Gifts up to the
  boAt Aavante Bar Soundbar." and whose ladder is a plain catalogue (photo, name,
  At ₹X) with no amounts to act on. The scheduled card drops its chip: the start date
  already appears in the sentence and the gift row, and the wide chip collided with
  the title's reserved 100dp.
- Verified: all 7 ship routes render with zero frame overflow; the sweep covered
  SCHEDULED, LIVE, EARNED, GIFT_ORDERED and ENDED_MISSED end to end, and the states
  gallery carries NEAR_SLAB, EXPIRING, TOP_REACHED, ENDED_PENDING, DELIVERED plus the
  crowded-slab and missing-photo stress cases.
