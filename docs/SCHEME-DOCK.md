# My Schemes: the scheme pager and the dock

Date: 3 Sep 2026. Route: `/schemes`. Input: founder feedback on the list page, and a
reference video of a B2C grocery app (`Video_20260903_150940_379_1.mp4`).

## The change

The list page (`/solv-schemes`) is gone from the path. "My Schemes" opens the main
scheme's own page (the Mega Diwali detail). Every other scheme of the member sits in
a dock near the thumb. A swipe on the page, a swipe on the dock, or a tap on a dock
thumb moves to another scheme.

The reference video shows a product page that swipes horizontally, with a strip of
round thumbnails at the bottom that tracks the swipe. The focused thumbnail is larger
and ringed. This design keeps that pattern and adds what the brief asked for: each
thumb shows the scheme's gift photo and its short name, so a scheme is recognisable
by image and by name.

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
| [scripts/capture-pager.sh](../scripts/capture-pager.sh) | Deterministic screenshots of every scenario and mid-swipe frame |

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
