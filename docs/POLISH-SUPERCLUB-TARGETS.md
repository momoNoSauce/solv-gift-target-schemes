# Focused polish — SuperClub and target schemes

Two new capabilities made most of this possible:

- **[src/fontWidths.js](../src/fontWidths.js)** — Roboto Regular / Medium / Bold advance-width
  tables read straight out of the app's own TTF files (`hmtx` via `cmap`), plus a `measure()`
  that reproduces `Paint.measureText` with letter spacing. Positions that depend on text width
  are now computed, not estimated.
- **[src/components/HtmlText.js](../src/components/HtmlText.js)** — the target scheme fields go
  through `Utils.setHtmlTextView` → `Html.fromHtml`, so the backend can send markup. This
  renders the same subset: `<b> <strong> <i> <em> <u> <br> <font color>`.

## Target schemes

| # | Was | Now |
|---|---|---|
| 1 | ₹ glyph and payout icon anchored with a 6.7dp-per-character guess | `measure()` on the real 12sp Medium / Bold advances |
| 2 | Current-value pill position waited on an `onLayout` round-trip | computed from the font tables, correct on first paint |
| 3 | Title, subtext, expiry label, current value and milestone values rendered as plain text | rendered through `HtmlText`; the mock copy now carries the bold amounts and the coloured "In 1 Day" the backend sends |
| 4 | Expiry chip border 1dp | `GradientDrawable.setStroke(1, colour)` is 1 **pixel**, so `StyleSheet.hairlineWidth` |
| 5 | Card had a ripple | the background is `background_grey_border_without_radius`, a plain shape, so Android shows no ripple |
| 6 | "COMPLETED SCHEMES" ellipsised | `TabView.onMeasure` drops a label that needs two lines to `tabTextMultiLineSize` (12sp). Measured: "RUNNING SCHEMES" 147.4dp fits the 156dp tab and stays 14sp; "COMPLETED SCHEMES" is 168.8dp so it shrinks and fits whole |
| 7 | Tabs had no horizontal padding | `tabPaddingStart/End` 12dp |
| 8 | Voice FAB at right 12 / bottom 16 | `fab_btn_margin_from_other_three_sides` 16dp and `minimum_fab_btn_margin_from_bottom_bars` 56dp |
| 9 | Empty state drew a "!" glyph | the real `warning_grey` vector, 90x80, black at 50% alpha |
| 10 | Transaction-history chevron 14dp, 6dp gap; VIEW button chevron 14dp | 18dp with no gap (the `ImageView` is height-constrained to the 15sp text box); 24dp `drawableEnd` with `drawablePadding` unset |

## SuperClub

Re-read from the shipped stylesheet, including rules later in the file that override earlier
ones:

| # | Was | Now |
|---|---|---|
| 11 | No letter spacing | `body{letter-spacing:.1px}` applies to every element, so every SuperClub text style carries it |
| 12 | White page background | the last `body` rule is `background-color:#f7f7f7`, which is what separates the cards |
| 13 | Message box had only the left and right rails | `background-image` puts a 3px `#e59529 → #f6cf37` gradient across the top **and** bottom as well |
| 14 | Deal header had no shadow | `.deal-page-head` carries `0 4px 4px rgba(0,0,0,.24)` |
| 15 | Carousel box had no padding | `.activities-carousel-box{padding:0 1px 10px}` |
| 16 | Product-list heading 14px black; list capped at 480dp | `.product-list-heading-text` is 16px `#2c552d` weight 500; `.products-list{max-height:80vh}` |
| 17 | Dialogs had 4dp corners | `md-dialog` has `border:1px solid #fff` and no radius rule — square corners; `.btn{border-radius:0}` makes CONFIRM / OK square too, at `.btn` line-height 1.846 |
| 18 | Backdrop `#212121` at .48 | `md-backdrop.md-opaque` is black at .48 |
| 19 | SHOW MORE / SHOW LESS used `⌄` `⌃` characters | the FontAwesome chevron paths the page loads |
| 20 | Transaction header wrapped "Jumbocoins" to a second line | inline flow fits on one line at 360dp, so the row no longer wraps |
| 21 | Catalogue points had no leading space | the template's `&nbsp;` before the coin |
| 22 | No loading state | the SPA's `Loading...` at top 55%, 16px `#000`, while the first fetch is in flight on all three screens |
| 23 | Current-value pill 18dp tall | `.current-indicator` sets no line-height, so 10px text inherits the body's 1.846 and the pill is 22.46dp |

## Deliberately left as is

- The toolbar's navigation icon sits 16dp from the edge with a 12dp gap to the title. AppCompat
  positions that button through `contentInsetStart` and the navigation button style; without a
  device to measure, the Material spec value is the closest defensible choice.
- Catalogue, claim and reward images stay as empty boxes: the API supplies them by URL.
- `.product-list-dialoge` is `width:114%; margin-left:-7%` of a dialog that itself sizes to
  content. The replica uses 92% of the screen, which is what that resolves to at 360dp.
- `uib-collapse` animates the transaction description open and closed; the replica toggles it
  instantly.

---

# Images and the drawer

## Real artwork, pulled from the app's own CDNs

The blank boxes were the worst of it. The app loads a lot of its UI art remotely, and those
hosts are public, so the replica now ships the same files:

| Source | Files | Used by |
|---|---|---|
| `d1vfjtt39xhg5z.cloudfront.net/encoded/hamburger_icons/` (`MenuItemEnum.kt`) | `My_Targets`, `My_Rewards`, `Jumbocash`, `Superclub`, `My_Orders`, `My_Deliveries`, `My_Payments`, `Credit`, `Language`, `My_Profile`, `Privacy_Policy` | the nav drawer |
| `ui-images.s3.ap-southeast-1.amazonaws.com/customer-app/` | `HamburgerJumbotailLogo.png`, `Gold+logo+PNG.png`, `OTP+UnAvailable.png` | drawer header, membership row, Jumbocash OTP card |
| `jtmerch.s3.ap-south-1.amazonaws.com/logos/` | `ic_target_scheme_offer.png`, `_target_offer_logo_disabled.png` | product page offer row, cart schemes dialog |
| `superclub.jumbotail.com/assets/img/` | `msg_info.png` and the rest of the SuperClub art | message box, coins, flags, logos, timeline |
| the app's own drawable | `product_image_placeholder.png` | every image the API supplies by URL |

## The drawer was the wrong drawer

I had replicated `drawer.xml`, the older static list. The app now uses
`layout_configurable_hamburger_menu.xml` with `viewholder_hamburger_menu_item.xml` and
`MenuItemEnum`: a `brand_green` header with the 52dp mark, a bold welcome line, the store
name and a membership row, then rows of a 24dp remote icon (marginStart 24, marginEnd 16)
beside a 14dp Medium label with 12dp vertical padding. Rebuilt to match.

## Product photos

These I could not get, and I would rather say so than fake them:

- The API supplies catalogue, reward, cashback and claimed-product images by URL per item.
- `main.node_explorer.product` and `main.metrics_view.j24_catalog` carry titles, MRP and
  selling price but no image column, and `main.jt_target_scheme_prod` is not readable from
  this account.
- Direct S3 keys under `jtctimages` / `images.jumbotail.com` return 403, and `jtmerch` has
  logos but no per-product or per-brand artwork.

So every one of those slots now draws `product_image_placeholder.png` — the same asset the app
itself shows when an image has not resolved. The pages read as the app with images pending,
not as boxes I forgot to fill.

## Other image slots corrected

- Jumbocash ledger rows: `product_image_placeholder`, which is what the layout ships.
- Jumbocash OTP card: the real `OTP+UnAvailable.png` on the unavailable state.
- Scratch card details sheet: the `jumbotail_green` vector as the default company logo.
- Cashback offer badges: no fake label URL, so they stay invisible exactly as the layout does
  when the API sends no label image.
