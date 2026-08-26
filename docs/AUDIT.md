# Audit — replica against the Android app

Method: for every surface, the condensed Android layout (ids, sizes, margins, colours,
visibility rules) and the binding code were re-read and compared against the replica, then
each screen was rendered at 360x760 and driven through its interactions.

## Checks that passed

| Surface | Verified |
|---|---|
| My Targets | toolbar 48dp `brand_green`, tabs all-caps 14sp with the 3dp white indicator, 10dp page padding, 12dp row gaps, both tabs swipe |
| Target scheme card (`TSWP`) | 1dp `grey_3` border, `-3dp` horizontal card margin, 6dp vertical padding, title 14sp bold with 100dp end margin, expiry chip border from `labelBgColor`, runner at `progress% x barWidth`, current-value label bias `progress/100`, milestone markers at `(width-100) x value/last`, flag turning green at 100% |
| Scheme details | green background ending at the vertical centre of the first card, white progress labels, `footerLabel` replacing the Maximum reward row, transaction-history row only when `currentValue > 0`, rule table order (all, brand, manufacturer, category, jpin, productVertical) |
| Transaction history | 1dp `grey_text` row borders, credit `light_green` / debit `another_red` |
| PDP offer row | `OFFERS` header card with `+1 more offer` in `pale_red`, `TARGET SCHEME` title in `light_green`, red chevron, 44dp bar inset, runner base margin 37.2dp |
| Offers bottom sheet | full `dialog_view_holder_target_scheme` with title, validity, `VIEW MORE DETAILS` and the bottom border |
| Cart suggestion + dialog | all-caps title, red arrow, 56dp indented suggestion text, dialog header (20dp logo, title, close) and `target_scheme_view_holder_list` cards |
| Cashback | ticket outline from `cashback_item_background`, 186x250 cards, `green_rays_background` behind the COC header, dotted separators, claim animation (scale 0.5, move to (0,-12), fade, 1s) then the row moves to the claimed list and the total switches to the `Total ₹X` format the code writes |
| Jumbocash ledger | OTP card in both states, 24sp balance, pending row with the info tooltip, status chips with server colours and a 6dp radius, four equal-width columns, rows with 5dp elevation |
| About Jumbocash | 24sp balance, `brand_color` accordion headers, 12sp bodies |
| My Rewards | no toolbar (`newInstance()` passes `showToolbar = false`), in-list header, 2-column grid, footer card, scratch textures, lock badge, Expired / Used status bands |
| Scratch reveal | scrim `grey_11`, 240dp card, scratch threshold 0.3, ribbon confetti for 5s, info levels per reward status and reward type, `brown_2` level-1 value for Jumbocash / Jumbocoins, full-width `light_green` CTA |
| Order confirmation | Congratulations / You have earned a reward, 300dp shadow box around the 260dp with-CTA card, `scratch_card_overlay` texture, Rewards Earned strip with View all |
| SuperClub | member-type gradients, balance card pulled up 59dp, milestone geometry, redeem dialog states, claimed timeline, transaction rows, side menu |
| Quiz and survey sheets | 12dp sheet corners, handle, question navigation, option borders (`jix_option_selected`), completed state with earned and available Jumbocoins, survey completion card and `shire_green` CTA |

## Deviations found during the audit and fixed

1. My Rewards showed a green toolbar. `RewardsFragment.newInstance()` defaults
   `showToolbar = false` on this flavour, so the toolbar is `GONE` and the list header
   carries the title. Toolbar removed.
2. Tab labels used 0.5 letter spacing. `Widget.MaterialComponents.TabLayout` takes
   `TextAppearance.MaterialComponents.Button`, so spacing is `0.0892857em` (1.25 at 14sp).
3. The scheme-details `VIEW` button was 48dp tall with 4dp corners. `RobotoMediumButton`
   extends `AppCompatButton`, whose default background is `abc_btn_default_mtrl_shape`:
   2dp corners inside 6dp vertical / 4dp horizontal insets, so the painted box is 36dp.
   Elevation removed too, since that drawable is flat.
4. The empty-state retry button used `#0d0d0d`. `selector_black` resolves to
   `almost_black` `#2c2c2c`.
5. The About Jumbocash accordion headers used `brand_green`. The layout uses
   `brand_color`, which is `#4CAF50` on the jumbotail flavour.
6. Gold rewards used a flat tint. `bg_gold_all_rounded.xml` and
   `bg_gold_pattern_rounded_top.xml` are now drawn from their own path data with the
   drawable's gold gradient.
7. The gold pill on reward cards and cashback rows was a placeholder. It now renders
   `gold_exclusive_tag.xml` / `gold_exclusive_tag_large.xml` path data, lettering included.
8. Jumbocash ledger columns were weighted 1.5/1/1/1. All four are `0dp` in the
   ConstraintLayout, so they share the width equally.
9. The scratch overlay mapped touches through the child cell's coordinate space, so drags
   cleared the wrong cells. It now measures the overlay origin and uses page coordinates.

## Known deviations that remain

1. Content is mock throughout. Field names and shapes follow the APIs; values are invented.
   Every image the API supplies by URL (catalogue items, reward images, badges, company
   logos, status-chip icons, cashback product shots) renders as the empty image box.
2. `sdp` / `ssp` are mapped 1:1 to dp / sp, which is the `values-sw360dp` bucket.
3. Text line boxes use fixed constants instead of Android font metrics with
   `includeFontPadding`, so vertical positions can differ by 1-2 dp.
4. The 2-column rewards grid clips each cell by a few dp, as it does in the app
   (170dp cell versus a 160dp card with 6dp margins).
5. `ScratchCardOverlayUi` erases along the finger path on a canvas; the replica erases a
   10x10 cell grid, so the cleared shape is blockier at the same 0.3 threshold.
6. The reward sound (`res/raw/reward_sound.mp3`) is not played: `expo-audio` has no build
   for this SDK version. The ribbon confetti animation is the real Lottie file.
7. Tab and page transitions use the defaults of the navigator, not `ViewPager2` /
   fragment transitions.
8. Analytics events, impression tracking and remote flags are not reproduced.
9. The JIX survey's camera and gallery upload block is not built; the question, text answer
   and completion states are.

---

# Second audit pass — currency separation

Trigger: Jumbocash and Jumbocoins were treated as one thing in the first build. The model is
now written down in [CURRENCY-MODEL.md](CURRENCY-MODEL.md), sourced from `PayoutBO.java`,
`ScratchCardUiInfo.kt`, the ledger models, the drawables and `en_messages.xml`.

## Currency errors found and fixed

1. **Scratch card rewards drew the banknote for both currencies.** `RewardCard` rendered
   `ic_jumbocash_icon` when the reward type was `JUMBO_COINS` or `JUMBO_CASH`. Now
   `JUMBO_COINS` draws `ic_jumbo_coins` and `JUMBO_CASH` draws `ic_jumbocash_icon`.
2. **Target scheme payouts had no mode.** Milestones carried a pre-formatted string. They now
   carry `payoutMode` / `payoutType` / `value` like `PayoutBO`, and the replica derives the
   text (`₹` only for CASHBACK, `%` only for PERCENTAGE) and the icon (coin only for
   JUMBOCOIN) through one shared `PayoutIcon` component. The Gold scheme in the mock pays
   Jumbocoins; the rest pay Jumbocash, so both paths render.
3. **The scheme card's static `₹` had been dropped.** It is a hard-coded TextView the view
   holder never touches, so it shows for every payout mode. Restored, and the mock payout
   values went back to bare digits so the glyph is not doubled.
4. **The nav drawer Jumbocash row used the green banknote.** `drawer.xml` uses
   `ic_jumbocash_ledger`, a different outlined icon. Ported from the drawable.
5. **The product page and cart dialog used the banknote as the offer logo.**
   `SchemeMemberTarget.getLogoUrl()` returns `@string/_target_offer_small_logo_green` and
   `TargetSchemesDialog` loads `@string/_target_offer_logo_disabled` — both public S3 images
   (a runner-to-flag mark). Downloaded and used.
6. **The cart suggestion strip used the banknote.** `cart_suggestion_target_scheme.xml`
   ships `ic_truck_outline`. Ported.
7. **"Jumbo Cash" spelling.** The app writes "Jumbocash" (`@string/_jumbocash`). All mock copy
   normalised; "JumboCash" is kept only where the app itself uses it, in
   `_full_amount_covered_using_jumbocash`.
8. **The Jumbocash policy screen had the wrong title.** `JumboCashPolicyFragment` sets
   `@string/_jumbocash_tnc_title` = "Jumbocash Terms & Conditions", not "Jumbocash". Fixed,
   and the accordion now swaps `ic_arrow_right_smoothened` for `ic_up_arrow_smoothened`
   instead of rotating one icon.
9. **Host screen titles were invented.** The order confirmation screen is
   `@string/_order_confirmed` = "Order Confirmed", the cart is `@string/_cart_items_msg` =
   "Your Cart Items (%$)", and the earned-rewards link is `@string/_view_all` = "View All >".
   Corrected.

## Touchpoints this pass added

10. **Jumbocash on product cards** — `card_label_tag_layout.xml` (orange tag, 4dp corner pair),
    `card_label_tag_curved_layout.xml` (12dp corner pair) and
    `below_image_card_label_tag_layout.xml` (blue_2 background, `blue_1` 10sp label), all with
    `ic_jumbocash_white_bg`. Label text and colours are backend-driven
    (`ProductCardLabelTagHandler`).
11. **Jumbocash at checkout** — `item_payment_method.xml` with the reward chip
    (`ic_jumbocash_icon` + `offerDetails.title`), the expanded `bg_payment_details` block and
    `item_payment_breakdown.xml` rows, plus the `_full_amount_covered_using_jumbocash` line
    from `fragment_checkout.xml`.

## Verified after the fixes

- Target scheme card, both payout modes: Jumbocash scheme shows the banknote with `₹50`;
  Jumbocoin scheme shows the gold coin with `₹250` on the last milestone (the layout quirk)
  and `100` on the intermediate marker.
- Scheme details, both modes: milestone labels read "₹20 Jumbocash" / "100 Jumbocoins", and
  Maximum reward shows `₹50` with the banknote or `250` with the coin.
- Scratch card reveal: the Jumbocoins reward shows the coin and "Added to your SuperClub
  balance"; the Jumbocash reward shows the banknote and "Credited to your account".
- Jumbocash ledger: rupee amounts throughout, bare balance number next to the icon, no coin
  artwork anywhere on the screen.
- SuperClub: Jumbocoins throughout, rupees only on purchase-target values.
- Quiz and survey: Jumbocoins only.
- Checkout: rupee breakdown with the banknote chip.

## Still not the real thing

- Payout mode icons (`displayData.payoutModeIcon`, `milestone.payoutIcon`) are URLs the API
  supplies per scheme. The replica picks `ic_jumbocash_icon` or `ic_jumbo_coins` from the
  payout mode, which is what those URLs point at, but the exact files are not fetched.
- Product tag labels, cashback card copy, ledger transaction titles and status chips are all
  backend-driven strings; the replica's values are invented.
- The five host screens that only exist as contexts in the app (product page, cart, checkout,
  order confirmation, the quiz and survey sheet hosts) carry a scaffold toolbar so the
  prototype can navigate. Where the app has a real title for that screen it is used.
