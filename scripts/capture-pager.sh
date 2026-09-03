#!/usr/bin/env bash
# Capture the My Schemes pager (route /schemes) in every scenario and at exact
# mid-swipe positions. Deterministic: ?static=1 renders every animated value
# settled, ?pos= pins the pager at a fractional page.
#
# Usage: scripts/capture-pager.sh [base-url] [only]
#   base-url  default http://localhost:8099
#   only      "pager" (version A) or "arc" (version B); default both
# Output: exploration-screenshots/pager-*.png, 824 x 1830 (412 x 915 at 2x).
set -euo pipefail
BASE="${1:-http://localhost:8099}"
ONLY="${2:-}"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
OUT="$(cd "$(dirname "$0")/.." && pwd)/exploration-screenshots"
mkdir -p "$OUT"

# shot NAME QUERY [ROUTE]   ROUTE defaults to /schemes (version A); /schemes/arc is version B.
shot() {
  local name="$1" query="$2" route="${3:-schemes}"
  case "$ONLY" in
    pager) [[ "$name" == pager-* ]] || return 0 ;;
    arc) [[ "$name" == arc-* ]] || return 0 ;;
  esac
  local tmp="$OUT/.tmp-$name.png"
  # Headless lays the 412 x 915 frame centred in a 512 x 1015 window; the
  # centre crop is the frame. Metro can take longer than the virtual-time
  # budget on a cold bundle, which leaves a frame with only the backdrop
  # (about 13 KB), so a small file is retried with a longer budget.
  local budget=20000 size=0 tries=0
  while [ "$size" -lt 25000 ] && [ "$tries" -lt 3 ]; do
    "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=2 \
      --window-size=512,1015 --virtual-time-budget=$budget \
      --screenshot="$tmp" "$BASE/$route?static=1${query:+&$query}" >/dev/null 2>&1
    size=$(stat -f%z "$tmp" 2>/dev/null || echo 0)
    budget=$((budget + 15000)); tries=$((tries + 1))
  done
  sips -c 1830 824 "$tmp" --out "$OUT/$name.png" >/dev/null
  rm -f "$tmp"
  echo "$name ($size bytes, $tries run(s))"
}

shot pager-01-landing-diwali ""
shot pager-02-mid-swipe "pos=0.5"
shot pager-03-bata "i=1"
shot pager-04-prestige-voucher "i=2"
shot pager-05-onam-completed "i=3"
shot pager-06-havells-delivered "i=4"
shot pager-07-dock-many-first "view=many"
shot pager-08-dock-many-mid "view=many&pos=3.5"
shot pager-09-dock-many-last "view=many&i=7"
shot pager-10-season-start "view=start"
shot pager-11-season-over-ordered "view=over&i=1"
shot pager-12-season-over-missed "view=over&i=2"
shot pager-13-empty "view=empty"
shot pager-14-rubber-band "pos=-0.18"

# Version B: the sheet and the arc.
shot arc-01-landing-diwali "" schemes/arc
shot arc-02-mid-swipe "pos=0.5" schemes/arc
shot arc-03-bata "i=1" schemes/arc
shot arc-04-prestige-voucher "i=2" schemes/arc
shot arc-05-onam-completed "i=3" schemes/arc
shot arc-06-havells-delivered "i=4" schemes/arc
shot arc-07-many-first "view=many" schemes/arc
shot arc-08-many-mid "view=many&pos=3.5" schemes/arc
shot arc-09-many-last "view=many&i=7" schemes/arc
shot arc-10-season-start "view=start" schemes/arc
shot arc-11-season-over-ordered "view=over&i=1" schemes/arc
shot arc-12-season-over-missed "view=over&i=2" schemes/arc
shot arc-13-empty "view=empty" schemes/arc
shot arc-14-rubber-band "pos=-0.18" schemes/arc
