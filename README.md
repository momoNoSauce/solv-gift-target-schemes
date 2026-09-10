# Target Schemes — Expo replica

A 1:1 replica of the Target Schemes screens in the Jumbotail customer app
(`jumbotail-technologies/mainandroidapp`, jumbotail flavour, commit `9b7328729`).

Run it:

```bash
npm start          # then press a for Android, i for iOS
npm run web        # browser, port 8099 when started through .claude/launch.json
```

## Screens and their source files

| Replica | Android source |
|---|---|
| [app/index.js](app/index.js) — drawer row that opens the feature | `res/layout/drawer.xml` → `@+id/target_scheme_item`, `HomeActivity.java:164` |
| [app/targets.js](app/targets.js) — My Targets, 2 tabs | `res/layout/fragment_target_scheme_new.xml`, `target/presentation/TargetSchemeFragmentNew.kt`, `common/adapter/TargetSchemeFragmentAdapter.kt` |
| list pages inside the pager | `res/layout/fragment_target_scheme_running.xml`, `targetschemerunning/TargetSchemeRunningFragment.kt` (UINode `running_target_scheme`), `targetschemepast/TargetSchemePastFragment.kt` (UINode `completed_target_scheme`) |
| [src/components/TargetSchemeCard.js](src/components/TargetSchemeCard.js) | `res/layout/browse_card_target_scheme_with_progress.xml`, `browse/ui/adapters/viewholders/cards/TargetSchemeWithProgress.kt` (card layout code `TSWP`, id 25) |
| [src/components/MilestoneMarker.js](src/components/MilestoneMarker.js) | `res/layout/mile_stone_layout.xml` |
| [app/scheme/[id].js](app/scheme/[id].js) — Scheme Details | `res/layout/fragment_target_scheme_detail.xml`, `targetschemedetail/TargetSchemeDetailFragment.kt` |
| [src/components/DetailProgress.js](src/components/DetailProgress.js) | `res/layout/dialog_view_holder_target_scheme.xml` + `products/model/SchemeMemberTarget.getDialogView()` + the overrides in `TargetSchemeDetailFragment.setUpProgress()` |
| rule rows | `res/layout/target_scheme_rule.xml` |
| [app/history/[smtId].js](app/history/[smtId].js) — Transaction History | `res/layout/fragment_target_scheme_history.xml`, `res/layout/view_holder_target_scheme_history.xml`, `targetschemehistory/*` |
| [src/components/EmptyState.js](src/components/EmptyState.js) | `res/layout/retry_page.xml` + `res/layout/error_illustration.xml` as configured by `setEmptyState()` |
| [src/icons.js](src/icons.js) | vector drawables: `ic_target_scheme_flag`, `ic_target_flag`, `ic_target_flag_green`, `ic_target_scheme_standing_man_green`, `ic_jumbocash_icon`, `ic_jumbo_coins`, `ic_gold_exclusive`, `ic_target_scheme_navigation`, `default_nav_icon_back`, `ic_baseline_arrow_forward_ios_24` |
| [src/theme.js](src/theme.js) | `res/values/colors.xml` + `src/jumbotail/res/values/colors.xml`, `res/values-sw360dp/dimens.xml` |

Navigation copies the app: drawer row → My Targets → card (`NextPageType.TARGET_SCHEME_DETAILS`
with `entityId`) → Scheme Details → Transaction History (`TargetSchemeHistoryFragment.newInstance(smtId)`).

Copy comes from `res/xml/en_messages.xml` (`MessagesManager` keys), reproduced in `M` in
[src/data.js](src/data.js). Fonts are the app's own `Roboto-Regular/Medium/Bold.ttf`.

## What is exact and what is a stand-in

Exact: layout structure, margins, paddings, sizes, colours, fonts, font sizes, icon paths,
progress-bar geometry, the position formulas for the runner icon, the current-value label and the
milestone markers, tab and toolbar chrome, card border and corner treatment, visibility rules
(gold tag, expiry label, description, transaction-history row, current-value label at 100%,
footer label vs maximum-reward row, "Except" block).

Stand-in (assumption, not measured): the content. Every display string the server computes
(`localizedTitle`, `localizedSubText`, `localizedLabel`, `currentValueLabel`,
`milestoneDisplayValue`, `payoutValue`, `progressColor`, `progressIcon`, milestone flag icons,
`footerLabel`, `milestoneSubtext`, rule entry names) is mocked in [src/data.js](src/data.js) with
plausible values. Field names and shapes match the API models; the values were not captured from
production.

## Known deviations

1. `sdp`/`ssp` are mapped 1:1 to dp/sp, which is the `values-sw360dp` bucket. The real app scales
   these per screen width.
2. Text line boxes use fixed constants (14sp → 19dp, 12sp → 16dp) instead of Android font metrics
   with `includeFontPadding`. Vertical positions can differ by 1–2 dp.
3. The tab indicator does not slide between tabs; it is drawn under the selected tab.
4. Toolbar geometry: Android puts the 24dp back icon inside a 48dp button at a 16dp content inset.
   The replica draws the icon at 16dp with a 12dp title margin, so the title x can differ a few dp.
5. Mock progress values are capped at 100%. The real card passes the raw
   `progressPercentage` to the runner-icon margin and clamps only the bar, so a scheme above 100%
   pushes the icon past the bar. That behaviour is in the code but was not verified against a
   running app, so the mock does not exercise it.
6. Colours are the jumbotail flavour. The solv flavour overrides `brand_green` to `#004FFA` and
   `target_scheme_native` to `#ff7711`.
7. The empty state uses a plain glyph instead of the `warning_grey` raster asset.

## Not included

- The legacy WebView screen (`target/TargetSchemeFragment.java`), used when the remote flag
  `should_show_native_target_scheme_v2` is off.
- The product-page offer surfaces: `target_scheme_view_holder.xml`,
  `target_scheme_view_holder_list.xml`, `dialog_target_schemes.xml`, and the full
  `dialog_view_holder_target_scheme.xml` (with title, validity and "VIEW MORE DETAILS").
- The cart suggestion card (`cart_suggestion_target_scheme.xml`).
- The gold-locked overlay badge (`BaseCardViewHolder.setOverlayBadge`, `overlayConfig`).
- The voice search flow behind the FAB, and all analytics events.
- The rest of `drawer.xml`. Only the Target Schemes row is present, as the entry point.


---

# SuperClub and Jumbocoins

The app opens SuperClub from the nav drawer (`drawer.xml` -> `@+id/super_club_item`,
icon `ic_star_outline`, label `@string/_super_club` = "SuperClub"). The screen itself is a
WebView: `SuperClubFragment` shows a `brand_green` toolbar with `cross_button_white` and
loads `https://superclub.jumbotail.com/#/customers?bzid=&token=&businessName=`
(`SuperClubPresenter`). All Jumbocoins UI lives in that web app, not in the Android code.

The replica reproduces both layers: the native shell
([src/components/WebViewShell.js](src/components/WebViewShell.js)) and the web app rebuilt as
native screens. Two green bars stack at the top, exactly as the app renders them today —
the native toolbar, then the page's own nav bar.

## Where the web UI came from

The SuperClub bundle is public, so the replica is built from the shipped source, not from
guesses:

- HTML templates: `https://superclub.jumbotail.com/generated/1.0.75/js/partials.1.0.75.min.js`
  (`$templateCache` entries: `deals.html`, `nav-bar.html`, `touch-carousel.html`,
  `milestone-activity.html`, `time-bar.html`, `time-line.html`, `show-product.html`,
  `product-list.html`, `reward-claimed.html`, `claimed-product.html`,
  `transaction-history.html`, `transaction.html`)
- Controllers, routes and `CONF`: `https://superclub.jumbotail.com/generated/1.0.75/js/all.1.0.75.min.js`
- Styles: `https://superclub.jumbotail.com/generated/1.0.75/css/all.1.0.75.min.css`
- Images: `https://superclub.jumbotail.com/assets/img/*`, copied into
  [assets/superclub](assets/superclub) (SVGs inlined in [src/superclub/svgAssets.js](src/superclub/svgAssets.js))

Version replicated: **1.0.75**.

## Screens

| Replica | SuperClub source |
|---|---|
| [app/superclub/index.js](app/superclub/index.js) — Redeem Jumbocoins | route `/customers` -> `deals.html` + `DealsCtrl` |
| [app/superclub/claimed.js](app/superclub/claimed.js) — Rewards Claimed | route `/rewards-claimed` -> `reward-claimed.html` + `claimed-product.html` |
| [app/superclub/history.js](app/superclub/history.js) — Transaction History | route `/transaction-history` -> `transaction-history.html` + `transaction.html` |
| [src/superclub/NavBar.js](src/superclub/NavBar.js) | `nav-bar.html` + `NavBarCtrl`, `md-sidenav` (320px) with `CONF.LEFT_MENU` |
| [src/superclub/TouchCarousel.js](src/superclub/TouchCarousel.js) | `touch-carousel.html` + `TouchCarouselCtrl` (320px items, 335px step) |
| [src/superclub/MilestoneActivity.js](src/superclub/MilestoneActivity.js) | `milestone-activity.html` + `MilestoneActivityCtrl` + `time-bar.html` |
| [src/superclub/TimeLine.js](src/superclub/TimeLine.js) | `time-line.html` + `TimeLineCtrl` (CLAIMED > CONFIRMED > SHIPPED > DELIVERED, or CANCELLED) |
| [src/superclub/ShowProductDialog.js](src/superclub/ShowProductDialog.js) | `show-product.html` + `ShowProductCtrl` |
| [src/superclub/ProductListDialog.js](src/superclub/ProductListDialog.js) | `product-list.html` + `ProductListCtrl` (VIEW PRODUCTS on a target) |
| [src/superclub/grid.js](src/superclub/grid.js) | Bootstrap 3 `.row` / `.col-xs-N` metrics from the CSS bundle |

## Behaviour copied from the controllers

- Header gradient by member type: `.GOLD-deal` `linear-gradient(186deg,#2d1e30,#59305f 47%,#2f1f32)`,
  `.SILVER-deal` `linear-gradient(186deg,#326633,#57923c 47%,#09360a)`. GOLD also shows
  `gold.png`, the subscription date box, and the three hard-coded gold benefits from `DealsCtrl`.
- Balance card: `.point-box` pulled up 59px over the header, dashed `.available-customer-points`
  box, 28px balance, "Jumbocoins" label.
- Milestone card: flags at `atValue/maxValue*100`% (green once `atValue <= currentValue`),
  current pill at `currentValue/maxValue*100`% minus 30px with the dashed drop line, points
  turning green when the milestone is met, `parseInt((applicableTo - now)/86400000)` days left,
  and the "Congratulations!! You have won N Jumbocoins" state once `currentValue >= maxValue`.
- Redemption: CONFIRM only renders when `product.points <= availablePoints`; after `claim-new`
  the dialog switches to the congratulations state and the balance is left untouched, matching
  "*Jumbocoins will be deducted from your wallet post confirmation".
- Transaction rows start collapsed (`less = true`) and only show the SHOW MORE toggle when the
  row has a description.

## SuperClub deviations

1. The replica renders the web UI as native components. It is not a WebView, so scrolling,
   text selection and font rasterisation differ from the real page.
2. Catalogue, claim and message images come from `imageURL` on the API. The prototype has no
   catalogue images, so [src/superclub/ProductImage.js](src/superclub/ProductImage.js) draws the
   empty image box instead.
3. `md-swipe-left/right` moves the carousel one card at a time by 335px. The replica uses a
   snapping horizontal scroll, so a fast drag can cross more than one card.
4. The message description is HTML (`ng-bind-html`); the replica strips the tags and renders
   plain text.
5. Angular's `currency:"₹":0` is reproduced with `toLocaleString('en-US')` grouping (₹1,000),
   not Indian digit grouping. That matches the web output.
6. `NOW` is pinned in [src/superclub/data.js](src/superclub/data.js) so "11 Days Left" and the
   dates stay stable between runs.
7. Data is mock. Field names and shapes follow the endpoints listed above; the values are
   invented.

## Not included from SuperClub

- The AngularJS loader/`Loading...` state, `maintainance.html`, and `error-panel.html`.
- Google Analytics events (`sendGaEventWithValue`) that the controllers fire.
- Token decryption and the `rewardId` deep link that scrolls to one catalogue item.
- The native scratch-card surface, which is the other place Jumbocoins appear
  (`com.jumbotail.app.rewards`: My Rewards grid, scratch-to-reveal, reward details bottom sheet).


---

# Full touchpoint coverage

[docs/CURRENCY-MODEL.md](docs/CURRENCY-MODEL.md) states the difference between Jumbocash
(rupee store credit) and Jumbocoins (SuperClub points), with the code that decides each.
Read it first — the two were conflated in the first build.

[docs/TOUCHPOINTS.md](docs/TOUCHPOINTS.md) lists every surface in the app that touches target
schemes, cashback, Jumbocash, Jumbocoins or SuperClub, with its Android source and build
status. [docs/AUDIT.md](docs/AUDIT.md) records both audit passes: what was verified, the
deviations found and fixed, and the ones that remain.

## Routes

| Route | Touchpoint |
|---|---|
| `/` | drawer rows (My Targets, My Rewards, Jumbocash, SuperClub) plus links to the surfaces that live inside other screens |
| `/targets` | My Targets, Running and Completed tabs |
| `/scheme/[id]` | Scheme details |
| `/schemes/list` | The scheme list. Solv: the Targets tab of the bottom navigation (Home, Rewards, Targets, Credit, All Brands), blue toolbar, RUNNING and COMPLETED tabs with counts. Big cards (the detail's own stage) grow into the detail the App Store way; a finger drag on the detail pushes it back. `?brand=jt` for the Jumbotail flavour: green chrome, a back arrow, no bottom navigation. `?compare=1` for the footer variants side by side (gift discs and count; goal chips; goal shelf; goal ladder). |
| `/options` | The founder-review entry: Option A (arc) and Option B (dock). The deployed build (`EXPO_PUBLIC_LANDING=options`) lands here at `/`. Live: https://solvts.vercel.app |

Screens: `python3 scripts/capture-list.py <base-url> <out-dir>` shoots every list and
detail state in WebKit (Safari's engine, and every browser on iOS) at 412 x 915 dp, 2x.
The latest set is in `exploration-screenshots/list/`.

Two lines of work. `master` (this copy) carries the scheme list and the App Store
card-to-detail move, and ships to a new link. `review-live` (working copy
`../target-schemes-live`, tag `live-review-2026-09-04`) is what https://solvts.vercel.app
serves: the Option A / Option B entry that opens the detail screens directly. `master`
ships to https://solvts-list.vercel.app (project `solvts-list`). Fixes to
the review experience go to that branch; see its `DEPLOY.md`.
| `/schemes/arc` | My Schemes, Option A (3 Sep 2026): the scheme page is a floating sheet that ends above an ARC of scheme thumbs (the reference video's arrangement); the focused scheme's name and status read under the apex; a "N schemes" button opens the full list. Same `?view=`, `?i=`, `?pos=`, `?static=1`. See [docs/SCHEME-DOCK.md](docs/SCHEME-DOCK.md) |
| `/schemes` | My Schemes, Option B (3 Sep 2026): the main scheme's page opens first; every scheme sits in a dock near the thumb; swipe the page or the dock, or tap a thumb. `?view=typical\|start\|over\|many\|empty`, `?i=`, `?pos=`, `?static=1`. See [docs/SCHEME-DOCK.md](docs/SCHEME-DOCK.md) |
| `/history/[smtId]` | Target scheme transaction history |
| `/targets/pdp-offer` | Product page offer row and the offers bottom sheet |
| `/targets/cart` | Cart suggestion strip and the target schemes dialog |
| `/cashback` | Cashback offers card (COC) and claimed cashbacks card (CAOC) |
| `/jumbocash` | Jumbocash ledger with the OTP card |
| `/jumbocash/about` | Jumbocash Terms & Conditions with the policy accordion |
| `/jumbocash/checkout` | Jumbocash payment method, reward chip and payment breakdown |
| `/jumbocash/labels` | Jumbocash tags on product cards (three layout variants) |
| `/rewards` | My Rewards scratch-card grid |
| `/rewards/[id]` | Scratch card reveal with the scratch gesture |
| `/rewards/order-confirmation` | Post-order scratch card and Rewards Earned strip |
| `/coins/quiz` | Jix quiz sheet: active, completed and disabled states |
| `/coins/survey` | Jix survey sheet and its completion card |
| `/superclub` | SuperClub Redeem Jumbocoins |
| `/superclub/claimed` | SuperClub Rewards Claimed |
| `/superclub/history` | SuperClub Transaction History |

## Not built, and why

- Checkout payment method and payment breakdown, where Jumbocash is applied to an order
  (`PaymentMethodAdapter.kt`, `PaymentBreakdownAdapter.kt`). Needs the checkout screen.
- My Passbook (`MyPassbookFragment.kt`). It reports all payment modes, not Jumbocash.
- The legacy target scheme WebView (`TargetSchemeFragment.java`), used when
  `should_show_native_target_scheme_v2` is off.
- `fragment_scratch_card_details.xml`, `fragment_scratch_card_details_2.xml`,
  `scratch_card_detail_bottom_sheet.xml` and `cart_reward_layout.xml`: no inflate or binding
  reference anywhere in the app.
