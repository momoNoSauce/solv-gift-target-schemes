# Jumbocash and Jumbocoins are two different currencies

This was wrong in the first build. The model below comes from the app's own code.

## Jumbocash

Rupee-denominated store credit held against the customer's Jumbotail account.

| Property | Evidence |
|---|---|
| Unit | Rupees. `PayoutBO.getText()` prefixes `₹` when `payoutMode == CASHBACK` |
| Artwork | `ic_jumbocash_icon` (green banknote), `ic_jumbocash_white_bg` (banknote on the product tag), `ic_jumbocash_ledger` (outlined grey icon, nav drawer row) |
| Ledger | `JumboCashLedgerFragment` — balance, pending amount, per-transaction before / amount / after |
| Spent | At delivery against an OTP (`jumbocash_ledger_otp_layout.xml`), and at checkout (`item_payment_method.xml`, `_full_amount_covered_using_jumbocash`) |
| Earned | Cashback offers (`CashbackCardLayout`, `ic_jumbocash_icon`), target scheme payouts in `CASHBACK` mode, `JUMBO_CASH` scratch cards, return adjustments |
| Copy | `@string/_jumbocash` = "Jumbocash"; `_my_jumbocash` = "MY JUMBOCASH : %$"; `_full_amount_covered_using_jumbocash` = "Full amount covered using JumboCash" |
| Balance format | `JumboCashLedgerFragment` sets `jumbocash_total_tv` from `jumbocashTotalBalance.toString()`, so the ledger balance shows as a bare number next to the icon |

## Jumbocoins

SuperClub loyalty points. Not money, and never printed with a rupee sign.

| Property | Evidence |
|---|---|
| Unit | Whole points. `PayoutBO.getText()` adds no `₹` for `payoutMode == JUMBOCOIN` |
| Artwork | `ic_jumbo_coins` (gold coin), `ic_jumbocoin_new`, and SuperClub's own `coin_small.svg` / `coin_banner.svg` |
| Where the balance lives | The SuperClub web app: `GET /super-club/points/{bzid}` -> `currentBalance`, rendered as "N Jumbocoins" |
| Spent | Redeemed for catalogue products in SuperClub (`show-product.html`: "Jumbocoins: N Only", "Jumbocoins Available: N") |
| Earned | SuperClub milestone targets (`milestone-activity.html`), the Jix quiz (`viewholder_cdc_quiz.xml`), the Jix survey (`bottomsheet_jix_survey.xml`), `JUMBO_COINS` scratch cards, target scheme payouts in `JUMBOCOIN` mode |
| Copy | `_total_jumbocoins` = "%$ Jumbo Coins", `_total_jumbocoins_earned_text` = "Total JumboCoins you have earned", `_jumbocoins_owned_text` = "Available Jumbocoins", `_survey_earned_text` = "You have earned %s Jumbocoins" |

## Target scheme payouts carry the mode

`products/model/PayoutBO.java`:

```java
public @interface PayoutMode { String CASHBACK = "CASHBACK"; String JUMBOCOIN = "JUMBOCOIN"; }
public @interface PayoutType { String PERCENTAGE = "PERCENTAGE"; String ABSOLUTE = "ABSOLUTE"; }

getText():     "₹" only when payoutMode == CASHBACK, then value, then "%" when payoutType == PERCENTAGE
getDrawable(): ic_jumbo_coins only when payoutMode == JUMBOCOIN
```

So one scheme pays Jumbocash and another pays Jumbocoins, and the milestone labels differ
accordingly. The replica now carries `payoutMode` on every milestone and derives both the
number format and the icon from it.

## One quirk kept on purpose

`browse_card_target_scheme_with_progress.xml` declares a `rupeeLogo` TextView with a
hard-coded `₹`, and `TargetSchemeWithProgress.kt` never references it. The glyph therefore
shows on the scheme card for every payout mode, Jumbocoin schemes included, while the
intermediate milestone markers (`mile_stone_layout.xml`) have no such glyph. The replica
reproduces this, so a Jumbocoin scheme card reads "🪙 ₹250" on the last milestone and
"🪙 100" on the intermediate one — exactly as the app draws it.

## Cashback

Cashback is an offer type, not a third currency. It credits Jumbocash: the cashback card uses
`ic_jumbocash_icon`, its amounts are rupees, and `CashbackCardLayout.updateTotalClaimedAmount()`
writes `"Total ₹" + sum`.
