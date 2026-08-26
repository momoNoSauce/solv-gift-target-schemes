# Touchpoint inventory — target schemes, cashback, Jumbocash, Jumbocoins, SuperClub

Source: `jumbotail-technologies/mainandroidapp`, flavour `jumbotail`, commit `9b7328729`,
plus the SuperClub web bundle `1.0.75`.

Status: DONE = built in this app; TODO = to build; DEAD = present in the repo but unreachable;
SKIP = deliberately out of scope (reason given).

## Target schemes

| # | Touchpoint | Source | Status |
|---|---|---|---|
| 1 | Nav drawer row "My Targets" | `drawer.xml` `@+id/target_scheme_item` | DONE |
| 2 | My Targets, tabs Running / Completed | `fragment_target_scheme_new.xml`, `TargetSchemeFragmentNew.kt` | DONE |
| 3 | Scheme card with progress (card code `TSWP`) | `browse_card_target_scheme_with_progress.xml`, `TargetSchemeWithProgress.kt` | DONE |
| 4 | Empty state "No target schemes are available" | `retry_page.xml` via `setEmptyState()` | DONE |
| 5 | Scheme details | `fragment_target_scheme_detail.xml`, `TargetSchemeDetailFragment.kt` | DONE |
| 6 | Transaction history | `fragment_target_scheme_history.xml`, `TargetSchemeHistoryFragment.kt` | DONE |
| 7 | PDP offer row "TARGET SCHEME" | `target_scheme_view_holder.xml`, `TargetSchemeViewHolder.java`, `OfferAdapter.java` | DONE |
| 8 | Product offers bottom sheet card (progress + VIEW MORE DETAILS) | `dialog_view_holder_target_scheme.xml`, `SchemeMemberTarget.getDialogView()`, `dialog_product_offers.xml` | DONE |
| 9 | Cart target-schemes dialog | `dialog_target_schemes.xml`, `TargetSchemesDialog.java`, `target_scheme_view_holder_list.xml` | DONE |
| 10 | Cart suggestion strip | `cart_suggestion_target_scheme.xml`, `CartDetailsFragment.java` | DONE |
| 11 | Legacy WebView screen (flag `should_show_native_target_scheme_v2` off) | `TargetSchemeFragment.java` | SKIP — remote web content |

## Cashback

| # | Touchpoint | Source | Status |
|---|---|---|---|
| 12 | Available cashback offers card (card code `COC`) | `cashback_card_layout.xml`, `cashback_card_item.xml`, `CashbackCardLayout.kt` | DONE |
| 13 | Claimed cashback rows (card code `CAOC`) | `claimed_cashback_item.xml` | DONE |
| 14 | Cashback group container | `cashback_group.xml`, `CashbackGroup.kt` | DONE |
| 15 | Cashback attachable sheet | `cashback_layout.xml`, `AttachableBrowseNodeFragment.kt` | DONE — the sheet is a bare RecyclerView host; the replica renders the cards it hosts |

## Jumbocash

| # | Touchpoint | Source | Status |
|---|---|---|---|
| 16 | Nav drawer row "Jumbocash" | `drawer.xml` `@+id/jumboCashLedger`, `ic_jumbocash_ledger` | DONE |
| 17 | Jumbocash ledger screen | `fragment_jumbocash_ledger.xml`, `JumboCashLedgerFragment.kt` | DONE |
| 18 | Ledger row, status chip, pending tooltip | `jumbocash_ledger_item.xml`, `StatusChipBinder.kt`, `PendingTooltipPopup.kt` | DONE |
| 19 | Ledger transaction details | `fragment_jumbocash_ledger_details.xml` | DONE |
| 20 | Ledger OTP block | `jumbocash_ledger_otp_layout.xml`, `JumboCashLedgerOtpLayout.kt` | DONE |
| 21 | Know more / policy | `JumboCashPolicyFragment.kt`, `jumbocash_policy_item.xml` | DONE |
| 22 | Checkout payment method + breakdown | `item_payment_method.xml`, `item_payment_breakdown.xml`, `PaymentMethodAdapter.kt`, `_full_amount_covered_using_jumbocash` | DONE |
| 23 | My Passbook | `fragment_mypassbook.xml`, `MyPassbookFragment.kt` | NOT BUILT — payments passbook, covers all payment modes rather than Jumbocash |
| 23a | Jumbocash tag on product cards | `card_label_tag_layout.xml`, `card_label_tag_curved_layout.xml`, `below_image_card_label_tag_layout.xml`, `ic_jumbocash_white_bg` | DONE |
| 23b | Jumbocash T&C / policy screen title | `JumboCashPolicyFragment.kt`, `@string/_jumbocash_tnc_title` | DONE |

## Jumbocoins

| # | Touchpoint | Source | Status |
|---|---|---|---|
| 24 | Nav drawer row "My Rewards" | `drawer.xml` `@+id/my_rewards_item`, `ic_trophy_unselected` | DONE |
| 25 | My Rewards grid, header and footer | `fragment_rewards.xml`, `RewardsPagingAdapter.kt`, `card_rewards_header.xml`, `card_rewards_footer.xml` | DONE |
| 26 | Scratch card states: locked, unscratched, revealed, disabled | `card_scratched_card_item.xml`, `reward_item_layout_small.xml`, `ScratchedCardViewHolder.kt` | DONE |
| 27 | Scratch card reveal screen and scratch gesture | `fragment_scratch_card_details_3.xml`, `ScratchCardRevealFragment.kt`, `ScratchCardOverlayUi.java` | DONE |
| 28 | Post-order scratch card on order confirmation | `fragment_cart_order_confirmation.xml`, `reward_item_layout_large_with_cta.xml` | DONE |
| 29 | CDC quiz sheet with Jumbocoins | `viewholder_cdc_quiz.xml`, `QuizBottomSheetFragment.kt` | DONE |
| 30 | Quiz disabled sheet | `quiz_disabled_layout.xml`, `QuizDisabledBottomSheetFragment.kt` | DONE |
| 31 | JIX survey sheet with Jumbocoins | `bottomsheet_jix_survey.xml`, `JixSurveyBottomSheetFragment.kt` | DONE |
| 32 | Jumbocoins as target-scheme payout | `fragment_target_scheme_detail.xml` (`ic_jumbo_coins`) | DONE |
| — | `fragment_scratch_card_details.xml`, `fragment_scratch_card_details_2.xml`, `scratch_card_detail_bottom_sheet.xml`, `cart_reward_layout.xml` | no binding or inflate reference | DEAD |

## SuperClub

| # | Touchpoint | Source | Status |
|---|---|---|---|
| 33 | Nav drawer row "SuperClub" | `drawer.xml` `@+id/super_club_item`, `ic_star_outline` | DONE |
| 34 | Native WebView shell | `fragment_super_club.xml`, `SuperClubFragment.java` | DONE |
| 35 | Redeem Jumbocoins (deals) | `deals.html`, `DealsCtrl` | DONE |
| 36 | Your Activity carousel and milestone card | `touch-carousel.html`, `milestone-activity.html`, `time-bar.html` | DONE |
| 37 | Rewards Claimed with delivery timeline | `reward-claimed.html`, `claimed-product.html`, `time-line.html` | DONE |
| 38 | Transaction History | `transaction-history.html`, `transaction.html` | DONE |
| 39 | Redeem dialog and confirmation state | `show-product.html`, `ShowProductCtrl` | DONE |
| 40 | VIEW PRODUCTS dialog | `product-list.html`, `ProductListCtrl` | DONE |
| 41 | Side menu with support block | `nav-bar.html`, `CONF.LEFT_MENU` | DONE |
