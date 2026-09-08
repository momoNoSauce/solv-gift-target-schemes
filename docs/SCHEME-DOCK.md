# My Schemes: the scheme pager, the dock and the arc

Date: 3 Sep 2026. Routes: `/schemes` (version A, the dock bar) and `/schemes/arc`
(version B, the sheet and the arc). Input: founder feedback on the list page, and a
reference video of a B2C grocery app (`Video_20260903_150940_379_1.mp4`).

Both versions share one engine, one page component, one registry and one artwork
set. They differ in how the schemes are arranged near the thumb. Version B is the
closer match to the reference video.

## Version B: the sheet and the arc

The scheme page is a floating card: 14 px side margins, 24 px corners, from 10 px
below the status bar to the top of the dock zone. Below it the schemes sit on an arc.

Non-apex thumbs on the arc wear a 40 % veil of the night colour (not 55 %), so a
brand's red still reads as red while the thumb recedes. The name under the apex holds
until 0.3 of a page and commits to the neighbour by 0.5.

The ground is one cool near-black (`#0B0A14`) with 18 % of the active theme's night
mixed in, blending as the pager crosses. The card carries the theme; the floor
recedes (Apple HIG: deference, materials). The earlier ground, the theme's night at
full strength, put a blue card on a blue field and recoloured the screen on every
swipe.

Geometry, measured from the reference at 592 px and scaled to 412 px:

| Token | Value |
|---|---|
| Arc radius | 520 px (1.26 screen widths), centre below the screen |
| Pitch | 86 px at the apex, one page per 0.1654 rad |
| Apex thumb | 76 px, white 2 px ring at a 3 px gap (86 px ring) |
| Neighbour thumbs | 58 px at one page, 50 px at two, then constant |
| Drops from the apex | 7 px at one page, 24 px at two |
| Opacity | 1.0, 0.85 at one page, 0.5 at two, 0 at three |
| Veil on non-apex thumbs | night colour at 55 %, lifting to 0 at the apex |
| Dock zone | 161 px plus the bottom safe area |
| Name under the apex | 15 px Medium white, status 12 px at 72 % (accent while running) |

The whole arc turns with the pager: every thumb's x, y, scale and opacity are
functions of its angular distance from `pos`, sampled every quarter page. The
focused scheme's name and status cross-fade under the apex; each label is fully
gone at the halfway point, so two names never overlap.

Recognition: a thumb is the scheme's own art, never a gift photo. Festive schemes
carry an illustration of the festival (a diya in a plum night, a pookalam, Holi
colour clouds), drawn as deterministic SVG in `src/schemes/SchemeArt.js`. Brand
schemes carry the brand's mark on a white disc, from `assets/brands/`. A wide
wordmark takes 82 % of the disc, a compact mark 66 %. Completed schemes dim to
70 % and carry the green check when a gift was won.

Too many schemes: a "N schemes" pill in the fixed chrome opens every scheme as a
bottom sheet (`src/schemes/AllSchemesSheet.js`): a handle, the count, RUNNING and
COMPLETED groups, one row per scheme (art, full name, status line, chevron), the
scheme on screen marked "Viewing". Tapping a row springs the pager there and closes
the sheet. The scrim fades in 200 ms and the sheet springs up (stiffness 300,
damping 32); both leave faster, easing out.

Press feedback: every thumb springs to 0.96 on press and back on release, and the
release reverses a press mid-motion.

Categories: Solv sells beyond grocery (apparel, footwear, home furnishing, small
electronics, toys), so the brand schemes are Bata, Prestige, Havells, Bombay Dyeing
and Funskool. The campaign schemes (Diwali, Onam, Holi) keep the Lifestyle gift
ladder.

## Version A: the dock bar

The list page (`/solv-schemes`) is gone from the path. "My Schemes" opens the main
scheme's own page (the Mega Diwali detail). Every other scheme of the member sits in
a dock near the thumb. A swipe on the page, a swipe on the dock, or a tap on a dock
thumb moves to another scheme.

The reference video shows a product page that swipes horizontally, with a strip of
round thumbnails at the bottom that tracks the swipe. The focused thumbnail is larger
and ringed. This design keeps that pattern in a glass pill and adds what the brief
asked for: each thumb shows the scheme's own art and its short name, so a scheme is
recognisable by image and by name. The founder's read: it feels like a nav bar. That
read led to version B.

## Files

| File | What it is |
|---|---|
| [app/schemes/index.js](../app/schemes/index.js) | The landing: pager, fixed back button, dock, demo panel |
| [src/schemes/usePager.js](../src/schemes/usePager.js) | The pager engine: one position value, two gestures, one spring |
| [src/schemes/SchemeDock.js](../src/schemes/SchemeDock.js) | The dock |
| [src/schemes/SchemePage.js](../src/schemes/SchemePage.js) | One scheme's page, any scheme type and any state |
| [src/schemes/registry.js](../src/schemes/registry.js) | The member's schemes and the view scenarios |
| [src/schemes/copy.js](../src/schemes/copy.js) | UI strings, English and Hindi |
| [src/schemes/motion.js](../src/schemes/motion.js) | The motion policy: capture, reduced motion |
| [app/schemes/arc.js](../app/schemes/arc.js) | Version B: the sheet, the arc, the schemes pill |
| [src/schemes/ArcDock.js](../src/schemes/ArcDock.js) | The arc: geometry, sampling, labels |
| [src/schemes/AllSchemesSheet.js](../src/schemes/AllSchemesSheet.js) | The list of every scheme, as a bottom sheet |
| [src/schemes/SchemeArt.js](../src/schemes/SchemeArt.js) | Scheme identity art: festival SVGs, brand marks |
| [scripts/capture-pager.sh](../scripts/capture-pager.sh) | Deterministic screenshots of both versions, every scenario and mid-swipe frame |

The state machine (`src/gifts/state.js`), the themes (`src/gifts/themes.js`) and the
stage scene (`src/gifts/Scene.js`) are unchanged. The old routes still work.

## Architecture

One value drives the whole screen. `pos` is the page position as a float: 0 is the
first scheme, 1.5 is halfway between the second and the third. Every surface reads it:

- the page strip translates by `-pos * pageWidth`
- the dock row translates by a clamped map of `pos` (see Geometry)
- the dock ring translates by `pos * 64`
- each thumb scales by its distance from `pos`
- each label fades by its distance from `pos`
- the ring colour blends between the schemes' theme accents
- the backdrop behind the pages blends between the themes' night colours
- the pedestal on each page lags the page by 36 px per page of travel

Because there is one value, the page and the dock cannot disagree by a frame. Nothing
polls or syncs.

## Gestures

Two surfaces write `pos`. A drag on the page moves one page per page width of finger
travel. A drag on the dock moves one page per 64 px (one thumb pitch). Both use the
same release rule:

1. Project the finger velocity 160 ms ahead.
2. Round to the nearest page. A flick from rest moves at most one page. A drag that
   travelled more than a page can cross more.
3. Spring to the target with the velocity carried in.

Past either end the position rubber-bands at 35 %. A tap on a dock thumb springs to
that page. On the web, the left and right arrow keys page.

The spring: stiffness 320, damping 34, mass 1 (damping ratio 0.95). The landing is
firm with no visible bounce. The spring is interruptible: a touch mid-flight stops it
and continues from the current position. At the two ends overshoot is clamped, so the
backdrop never peeks past the last page.

A horizontal move claims the gesture only when it travels more than 6 px and is at
least 1.4 times its vertical travel. A vertical or ambiguous move stays with the
page's own scroll view and its buttons.

## Dock gestures (audit, 4 Sep 2026)

- Who owns a touch is declared: the page strip is `touch-action: pan-y` (the browser
  keeps vertical scroll, the pager takes horizontal); the dock and the arc zone are
  `touch-action: none`. Without this a mobile browser could claim a horizontal swipe
  before the pan responder saw it.
- One touch, one axis. The axis of a touch is decided once, in its first 8 px of
  travel (horizontal when dx exceeds 1.2 times dy), and held for the rest of that
  touch. A vertical-first touch belongs to the page's scroll view and never moves the
  pager, however far it drifts sideways; a horizontal-first touch moves the pager, and
  the browser starts no scroll for it. The dock has no vertical axis: it claims at 4 px
  in any direction.
- The back arrow returns to the Option A / Option B entry, from a deep link as well.
- A flick from rest carries at most one page on the page strip and up to three on the
  dock, the way a picker does; real travel crosses more on both.
- The focused thumb rises 2 px as it grows, and every thumb reports `selected` to
  assistive tech.
- Both versions carry the "N schemes" pill and the list sheet, so a long list always
  has an exit that does not depend on swiping.

## Dock geometry

| Token | Value |
|---|---|
| Pitch (one thumb column) | 64 px |
| Resting photo circle | 42 px |
| Focused photo circle | 52 px |
| Ring | 60 px outer, 2 px stroke, 2 px gap to the photo (concentric) |
| Label | 11 px Medium, 14 px line, 3 px under the ring |
| Pill height | 94 px |
| Pill padding, left and right | 10 px |
| Pill margin from the screen edge and the bottom | 12 px (plus the safe area) |
| Pill surface | rgba(16,13,30,0.84), backdrop blur 22 px, 1 px top highlight at 10 % white |
| Photo edge | 1 px black at 10 % |

The pill hugs its thumbs and centres itself, up to the screen width minus the
margins. Two schemes make a 152 px pill; five make a 340 px pill; eight fill the
width.

The row position is `clamp(centre - pos * 64, lo, hi)`, a piecewise-linear map of
`pos`:

- When every thumb fits, `lo >= hi`. The row stands still and the ring glides from
  thumb to thumb.
- When the thumbs overflow, the row scrolls to keep the focused thumb centred, clamped
  at both ends so the pill never shows empty glass. The ring holds the centre while
  the row moves under it. A 26 px fade at each end softens the clip.

This is the reference behaviour for a long list and a tab bar for a short one. The
eye sees no mode switch, because both are the same map.

## Dock semantics

- Order: running schemes first, the main scheme leading, then completed schemes
  behind a 1 px hairline.
- Each thumb shows the gift the scheme's pedestal shows: the next gift while the
  scheme runs, the top gift before it starts, the won gift after it ends.
- A festive scheme wears its motif as an 18 px accent badge (diya, flower, sparkle).
- A completed scheme dims its photo to 70 %, sits on a grey disc, and carries the
  green check when a gift was won. The check is the medallion system's one badge.
- A voucher renders as a blue rupee disc.
- The focused label is 100 % white; the others are 55 %.
- Each thumb is a 64 px wide button with the scheme title as its accessibility label.

## The fold (version B)

The sheet's bottom edge must say "more below" without a hint label. Three moves:

1. The stage is compact inside the sheet (pedestal 204 px, tile 148 px, tighter tag
   and ask spacing), about 60 px shorter, so a row of the list is sliced at the fold
   on every scheme type. A sliced row is the strongest signifier there is.
2. The fold is a material. A 64 px band at the sheet's bottom dissolves the content
   into the card's colour (on the web it also blurs what passes under it, 8 px under a
   gradient mask). Its opacity tracks the scroll left below: full while there is
   more, gone over the last 48 px. The edge tells the truth instead of hinting.
3. On native the platform's own scroll indicator flashes once, 350 ms after arrival.

Not done, on purpose: a pinned CTA bar (it stacks about 240 px of chrome above the
arc and rewrites the page's ending), a chevron or "scroll for details" label, and a
peek nudge on arrival.

## Completed schemes

A completed scheme with a gift reads as settled before a word is read:

- The won gift's tile carries a seal, cut the way a real one is: a 3.2 px outer ring
  with its ink slightly uneven (a hairline dashed bite in the paper's colour), a
  1.4 px inner ring, the state on the top arc and the date on the bottom arc in
  letterspaced caps (both read upright), two dots at the sides, and a heavy check at
  the centre. 96 px, set 12 degrees off square, one green ink (`#2BB05B`) that reads
  on the white tile and on every night colour, with a 10 % white impression under it.
- The seal crosses the tile's top-right corner and lands on the stage: its centre sits
  6 px outside the tile, so the ink shows on the ground and only clips the photo's
  empty corner. It lands with the tile and settles from 1.3 to 1.
- The tile is smaller than a goal tile (128 px in the sheet, 136 px full), because the
  object is no longer the thing to reach for.
- The sentence leads: "You won the Air Fryer" at 22 px Bold, the title's weight. Under
  it, one status line in the colour of its meaning, with its glyph: "Delivered to your
  shop, 24 Sep" in green with a check; "On the way. Arrives by 21 Nov 2026" in the
  accent with a truck; "Your gift is being confirmed" muted with a gift.
- "Final buying" follows, muted, 13 px.
- No meter, no ask, no note that repeats the stepper. After delivery the address card
  is gone.

Two earlier treatments were rejected: a rotated bordered label (a cliché that fought
the tile) and a ring with a small check badge (correct, but too quiet to be read as
"won" at a glance).

## Numbers

The ask leads, but by a step, not a leap: the ask is 26 px Bold, the bought-so-far
tag 15 px Bold, the slab values at the ends 12 px Medium, "Final buying" 15 px
Medium. The bar's right end reads "Target ₹10L", the word in the muted colour and the
value in ink, so the domain word "target" sits on the goal.

## Facts

The facts card shows on every page except a missed scheme: the scheme window
("Scheme window: 1 Oct 2026 to 9 Nov 2026"), the one-gift rule, and, while the
scheme runs, the delivery date.

## Brand schemes on the stage

A brand scheme wears its mark (26 px, on white) where a festive scheme wears its
motif, next to the title. The stage keeps the Solv theme; the mark is what tells
Bata from Prestige at a glance.

## Gift list

Every gift is one row: slab value, 44 px photo, name, and a label on the right. The
top gift uses the same row. Its rank shows as emphasis inside that anatomy: the
theme's tint behind the row (the way the won row is tinted green), the slab value and
the label in the accent, and a sparkle before "TOP GIFT" on a festive scheme. The
earlier top-gift card (a lit scene with a 150 px photo inside the list) is gone: it
read as a second component inside the card.

## Page motion contract

- The page that opens first plays the full staged intro (label, tile, name, bar
  sweep, amount, CTA), 90 ms apart.
- A neighbouring page renders its stage settled but its meter empty. When the pager
  lands on it, the fill sweeps (640 ms) and the ask rises (300 ms, 120 ms later). The
  page reads as arriving. The swipe never shows a full bar that then resets.
- Each page plays its arrival once.
- Confetti greets the first arrival on a page that holds a won gift, once, and fades.
- A missed scheme's stage fills the page: one dark room, one line, one button to the
  running schemes.

## The living stage (web)

A festive scheme's stage moves, at the pace of a lit room, through one fragment
shader (`src/schemes/ShaderStage.js`) laid over the SVG scene: Diwali breathes its
key glow and lifts embers from the diya line, each on its own clock; Onam drops light
rays from above with motes drifting through them; Holi folds three clouds of gulal
through warped noise. Deterministic in time, no run-time randomness, one canvas per
festive page. Under capture and reduced motion it paints one frame at t = 12 s and
stops. Native keeps the SVG scene.

A richer rewrite (fireworks and bokeh for Diwali, a pookalam for Onam, gulal bursts
for Holi) was tried on 4 Sep 2026 and rolled back the same day: it looked and ran
worse on the phone. This is the version that shipped.

## The list, and the move into the detail (4 Sep 2026)

`/schemes/list?opt=a|b` is the scheme list. It is a tab of the Solv app's bottom
navigation (it takes the place of All Brands), so it wears the app's chrome and has no
back action: the blue toolbar with the title, the RUNNING and COMPLETED tabs with the
sliding orange indicator (both labels at a fixed 14 sp; the shared TabLabel's fit
measurement shrank the shorter word), the app's ground, and the bottom navigation itself.
The details' scheme picker (the "N schemes" button and its sheet) is hidden for now
(`SHOW_PICKER` in ArcScreen and DockScreen); the swipe and the dock still move between
schemes.

The colours are the Solv flavour's own, from `mainandroidapp/app/src/solv/res/values/colors.xml`
(`src/gifts/solv.js`): toolbar and tabs `primary_color` #004FFA, ground `background_green`
#F5F8FF, indicator `indicator_background_color` #ff7711 (3 dp, as
`fragment_target_scheme_new.xml` sets it). The bottom navigation
(`src/schemes/SolvBottomNav.js`) follows `fragment_home_page.xml` and `custom_tab_layout.xml`:
a 52 dp white bar with an 8 dp elevation, tabs filling the width, a 24 dp icon over a 12 sp
Roboto Medium label, the selected label in `grey_text_dark` and bold with the icon in its filled
form, a 2 dp indicator in the brand colour. The icons are the app's vectors (`ic_home_*`,
`ic_explore_*`, `ic_target_scheme_navigation`). Tab set: Home, Explore, Target Schemes, the
JT order with Target Schemes in the All Brands slot; the Solv flavour drops Credit and
Distributors. In the checkout of 2026-07-19, `HomePagePresenter.initTabs()` gives the Solv
flavour only the Home tab, so the set here is an assumption to confirm with the app team. The two tabs are pages of one
pager (`usePager`, `keys: false` so the detail's arrow keys stay its own): a swipe on
the pages moves the tab and the indicator together; a tap on a tab springs there.
Axis lock applies, so a vertical drag scrolls and never changes the tab.

Each card is the exact stage of the detail it opens: `src/schemes/Stage.js` draws both
the card and the top of the page, so they are the same pixels. Cards are big, one and a
half to two per fold; a status eyebrow ("21 DAYS LEFT", "DELIVERED 24 SEP") sits where
the detail's chrome will be. An empty tab shows the app's empty state.

The affordance (founder review, 4 Sep 2026: the stages read as a list of graphics; no
"View details" link; "a white border around the content" would make it a card). The art
does not reach the card's edge. Each card is a white surface with a 10 px frame on all four
sides, an inset art panel, and the footer inside that frame under the art: the white is what
makes the card a card and the stage its picture. Radii are concentric, 12 px on the art
plus the 10 px frame = 22 px on the card.

Depth. A white card on the app's near-white ground cannot lean on a flat outline: one
hairline reads as a drawn border, two layered shadows read as a lifted surface. On web the
card takes an injected `box-shadow` of two layers, a tight ambient one that holds the edge
(where a soft shadow is weakest) and a wide key one that carries the lift; native keeps
`elevation`, which Android draws itself. The list's ground is `SOLV.listBg` #EDF1F9, one
step deeper than the window's #F5F8FF, because react-native-web renders a softer shadow
than an 8 dp Android elevation and the deeper ground stands in for that depth. The footer's own edges line up with the art's,
not the card's.

Tab counts. Each tab carries the number of schemes in its group, in a hug-width pill
(min width 18 px, 5 px of side padding, so one and two digits both sit centred) at 22 %
white, riding the label and dimming with it.

Home in the bottom bar. The leftmost circle is always Home, and it returns to the list of
cards. In the dock version it is a pinned cell at the pill's left edge, outside the
scrolling row (the row's clamp and centring measure the width that is left), with a
hairline between it and the schemes and its label at 72 % so the focused scheme stays the
brightest thing. In the arc version it cannot ride the curve, because the arc's own nodes
sweep the whole curve as the pager turns and a pinned node would be run over on the last
page; it sits in the zone's bottom-left corner instead, below the lowest point the left
tail reaches (the tail's visible edge stops at 867 px on a 915 px screen, the chip starts
at 873, and a bottom inset widens the gap). Embedded in the list, Home runs the move in
reverse, exactly as the back arrow does; on the standalone routes it replaces the route
with the list.

The detail sees one group. A card opened from RUNNING pages through the running schemes;
one opened from COMPLETED pages through the completed ones. The list passes the filtered
array and maps the detail's indexes back to its own, for the arrival and for the way back.

The footer is one row, 56 px, and it owns the whole band under the art: the window on the
left ("Ends 9 Nov 2026 · 21 days left", "Ended 12 Sep 2026", "Starts 1 Oct") and a round
chevron in the brand colour on the right, with 19 px above and below the text and 13 px
around the chevron. Its edges line up with the art's, not the card's. The card's frame runs
on three sides (`paddingBottom: 0`) so the footer centres its content in that band; a frame
under the footer as well put the content a frame's width high in the white, which is what
the 4 Sep 2026 review caught.

No gift thumbnails there (founder review, 4 Sep 2026). The card already has one gift photo,
the hero tile; a row of 22 px discs was a second, weaker one that showed the same product
again on a single-gift scheme, and the subtitle already counts the gifts in words. The full
list with photos and slab amounts is one tap away in the detail.

The subtitle carries the offer, not the dates: "Targets ₹2L to ₹1.2Cr · 8 gifts", "Target
₹60,000 · 1 gift", "Won at the ₹5L target", "No target reached" (Stage's `offerLine`). A
scheme pays one gift, the highest target crossed, so nothing counts gifts won. The detail
keeps the dates under the title, and the two readings cross in place over the first third
of the move.

Card size. `Stage` takes `cardAnim`, a 0..1 dial: at 0 (the list card) a running stage has
no eyebrow, a 20 px top bar, a shorter pedestal, the tile at the won size, and the ask
("Buy ₹X more") collapsed to 0, while the amount tag over the bar and the qualified chip
stay (the current buying is the card's signal); at 1 (the detail) everything is at full
size. The contact shadow under the tile is an SVG ellipse whose position and size ride the
same dial (audit, 4 Sep 2026: a fixed viewBox let it slide behind the gift name on the
shortened pedestal).

Cards in a tab stand within 12 px of each other, except that a card carrying the qualified
chip is 52 px taller. Do not pay for the chip out of the pedestal and the stage's bottom
padding: that was tried on 4 Sep 2026 and it clipped the chip against the art panel's
bottom edge. The pedestal cannot go below the tile's own height plus its 16 px margin, so
equal heights with the chip would cost either a clipped chip or a smaller gift photo on
every card, and both read worse than a taller card.

The move is the App Store's card-to-detail:

1. On tap the card's rectangle is measured against the screen root.
2. A transition layer showing the detail page appears in that exact rectangle and
   springs to the detail's frame: the sheet (option A) or the full screen (option B),
   corner radius easing from 22 to the frame's while the white frame opens, its 10 px
   inset going to 0 and the art's corners easing to the frame's own. The page lays out at the layer's live
   width, so the centred stage stays centred as the frame grows.
3. The card's eyebrow fades over the first third; the paper under the body turns from
   the stage's night to the page ground in the first fifth, before the frame has grown
   enough to show it; the body below the stage fades and lifts in from a third onward;
   the list behind scales to 0.96 and dims to 50 %.
3a. The card's footer rides the layer's bottom edge (where the card's own footer sits) and
   fades out by 0.3. Do not pin it a fixed distance from the layer's top: the stage grows
   during the move, passes under it, and the half-faded white cuts a grey strip across the
   art. The layer's inner frame paints the page's paper for the same reason, so the band
   under a still card-sized stage belongs to the page and not to the dimmed list behind.
4. Underneath, the real detail screen mounts on the opening scheme with its stage
   settled (`still`: no intro, no arrival sweep, no confetti) and fades in over the
   last stretch. When the layer lifts at the end, nothing moves. Below the layer's
   growing edge the detail shows through at its fade, on the same paper.
5. Back reverses the move into the card of the scheme on screen: the list switches
   to that scheme's tab, scrolls its card into view, measures it, and shrinks the
   layer into it.

One spring (stiffness 190, damping 26, ratio 0.94) drives every part and can be
reversed mid-flight. Under capture and reduced motion the move is a cut.

The two detail screens are components (`ArcScreen`, `DockScreen`) so the list can
host them; the routes are thin wrappers.

WebGL contexts. The list mounts one shader canvas per festive card, the detail one per
festive page, and the layer one more. `ShaderStage` therefore makes its context once
per canvas and only resizes the buffer when the frame changes; an earlier version made
a new context on every size change, so the growing layer burned through the browser's
context budget in a few frames and came back with a lost context, which paints white
over the scene. A context that cannot be made, or is lost later, unmounts the canvas
and the SVG scene under it stands in.

Frame audit: `window.__list.open(i)`, `.close(i)`, `.tab(0|1)`, `.freeze(0..1)`.

## Entry and deploy

`/options` is the founder-review entry: Option A (arc) and Option B (dock), each with
a device preview, one line, and a spring press. The deployed build sets
`EXPO_PUBLIC_LANDING=options` so `/` lands there; the drawer stays the local root.
`vercel.json` rewrites every path to `index.html` for the client router.

Deploy:

```bash
EXPO_PUBLIC_LANDING=options npx expo export -p web && cp vercel.json dist/ && vercel deploy dist --prod
```

## Motion policy

`src/schemes/motion.js` gives one answer to "animate at all?":

- A capture pipeline (`navigator.webdriver`, HeadlessChrome, or `?static=1`) renders
  every value settled.
- `prefers-reduced-motion: reduce` renders entrances and sweeps settled. The pager
  still moves, on a stiff short spring (stiffness 900, damping 60, no carried
  velocity), because a page that jumps with no motion loses the cue of which way the
  list went.

## Verification

Environment: Expo web, Chrome, 412 x 915 frame. Input was driven by synthetic mouse
events through the same PanResponder path a finger uses.

| Check | Result |
|---|---|
| Page drag, 300 px left from page 0 | Landed on page 1 |
| Dock drag, 80 px left from page 1 | Landed on page 2 |
| Dock tap on the last thumb from page 2 | Landed on page 4 |
| Arrow keys from page 1 | Right to 2, left back to 1 |
| Frames at pos 0, 0.5, 1.0 | Ring mid-glide at 0.5, colour blending gold to white, pedestal lag visible, no seam between pages |
| Eight schemes at pos 0, 3.5, 7 | Row clamped left, centred, clamped right; fades at the clipped end |
| Rubber band at pos -0.18 | Backdrop shows the theme's night colour, never white |
| Scenarios typical, start, over, many, empty | All render; the empty state is a single centred message |
| Console | No errors |

Screenshots: `exploration-screenshots/pager-*.png` (see the capture script).

## Known limits

- Web prototype. The pager runs on React Native's Animated with the JS driver. On the
  native app, build it on Reanimated or a native pager so the gesture and the spring
  run off the main thread.
- On a touch device, a diagonal gesture on the page may scroll the page vertically and
  move the pager at once. The 1.4 ratio limits this. Test on a device.
- A hidden browser tab pauses `requestAnimationFrame`. The root layout ticks frames
  on a 16 ms timer while the document is hidden so a capture pane still renders motion.
  This is a capture aid and does nothing in a visible tab.
- Backdrop blur is a web-only style, applied through a data attribute. Native needs a
  blur view or a solid pill.

## Open questions for the founder review

1. Does the dock hold completed schemes, or only running ones? The prototype holds
   both, behind a hairline. Assumption: a shopkeeper wants the delivered gift one swipe
   away.
2. Short names for the dock (`dockName`) are set per scheme by the merch team. Eleven
   characters fit at 11 px; longer names truncate.
3. The main scheme is the first running scheme. Is that the campaign scheme, or the
   scheme closest to its next slab?
