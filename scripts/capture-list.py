# Screens of the scheme list and the details, from a deployed build.
#
#   python3 scripts/capture-list.py <base-url> <out-dir>
#
# WebKit (Safari's engine, and every browser on iOS) at 412 x 915 dp, 2x, so the
# files are what an iPhone renders. Each shot names a route and, where a state
# cannot be reached by URL alone, the hooks that reach it: window.__list for the
# card-to-detail move (open, freeze) and window.__schemes for the pager.
import sys, pathlib
from playwright.sync_api import sync_playwright

BASE, OUT = sys.argv[1].rstrip('/'), pathlib.Path(sys.argv[2])
OUT.mkdir(parents=True, exist_ok=True)

# A frame of the card-to-detail move: start it, then stop the spring at `at`.
# The two must run in one call; a pause between them lets the spring finish and
# the transition layer unmount.
def move(index, at):
    return f'(async () => {{ await window.__list.open({index}); window.__list.freeze({at}); }})()'


# Open a card and let the move settle, so the shot is the detail itself.
def move_open(index):
    return f'window.__list.open({index})'


# name, path, steps. A step is a JS expression run in the page.
SHOTS = [
    ('01-entry', '/', []),
    ('02-list-b-running', '/schemes/list?opt=b', []),
    ('03-list-b-running-scrolled', '/schemes/list?opt=b', ['__scroll(560)']),
    ('04-list-b-completed', '/schemes/list?opt=b', ['window.__list.tab(1)']),
    ('05-list-b-move-05', '/schemes/list?opt=b', [move(0, 0.05)]),
    ('06-list-b-move-20', '/schemes/list?opt=b', [move(0, 0.20)]),
    ('07-list-b-move-50', '/schemes/list?opt=b', [move(0, 0.50)]),
    ('08-list-b-move-80', '/schemes/list?opt=b', [move(0, 0.80)]),
    ('09-list-b-detail-open', '/schemes/list?opt=b', ['window.__list.open(0)']),
    ('10-list-a-running', '/schemes/list?opt=a', []),
    ('11-list-a-completed', '/schemes/list?opt=a', ['window.__list.tab(1)']),
    ('12-list-a-move-50', '/schemes/list?opt=a', [move(0, 0.50)]),
    ('13-list-a-detail-open', '/schemes/list?opt=a', ['window.__list.open(0)']),
    ('14-detail-dock-diwali', '/schemes', []),
    ('15-detail-dock-diwali-gifts', '/schemes', ['__scroll(420)']),
    ('16-detail-dock-onam', '/schemes?i=3', []),
    ('17-detail-dock-onam-delivery', '/schemes?i=3', ['__scroll(380)']),
    ('18-detail-dock-holi', '/schemes?i=5', []),
    ('19-detail-arc-diwali', '/schemes/arc', []),
    ('20-detail-arc-bata', '/schemes/arc?i=1', []),
    ('21-detail-arc-havells', '/schemes/arc?i=4', []),
    ('22-detail-arc-swipe', '/schemes/arc?pos=0.5', []),
    ('22a-list-b-jumbocash-card', '/schemes/list?opt=b', ['__scroll(1010)']),
    ('22b-detail-jumbocash', '/schemes/list?opt=b', ['window.__list.open(2)']),
    ('22c-list-a-completed-detail', '/schemes/list?opt=a', ['window.__list.tab(1)', 'window.__list.open(3)']),
    ('22d-detail-home-dock', '/schemes/list?opt=b', ['window.__list.open(0)']),
    ('22e-detail-home-arc-last', '/schemes/list?opt=a', [move_open(2)]),
    ('23-list-b-over-completed', '/schemes/list?opt=b&view=over', ['window.__list.tab(1)']),
    ('24-detail-dock-missed', '/schemes?view=over&i=2', []),
    ('25-list-b-empty', '/schemes/list?opt=b&view=empty', []),
    ('26-list-b-many', '/schemes/list?opt=b&view=many', []),
]

SCROLL = """window.__scroll = (y) => { const sv=[...document.querySelectorAll('div')]
  .find(d=>{const o=getComputedStyle(d).overflowY; return o==='auto'||o==='scroll';});
  if (sv) sv.scrollTop = y; };"""

with sync_playwright() as p:
    b = p.webkit.launch()
    pg = b.new_page(viewport={'width': 412, 'height': 915}, device_scale_factor=2, reduced_motion='no-preference')
    # src/schemes/motion.js renders everything settled when it sees
    # navigator.webdriver or prefers-reduced-motion, which would leave the move
    # frames empty. Mask the flag and ask for no motion preference, so the shots
    # are what a phone renders.
    pg.add_init_script("Object.defineProperty(navigator, 'webdriver', { get: () => false });")
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    for name, path, steps in SHOTS:
        pg.goto(BASE + path, wait_until='networkidle')
        pg.wait_for_timeout(2600)          # fonts, images, the first shader frame
        pg.evaluate(SCROLL)
        for step in steps:
            try:
                pg.evaluate(step)
            except Exception as e:
                print(f'  ! {name}: {step} -> {e}')
            pg.wait_for_timeout(900)
        pg.wait_for_timeout(500)
        pg.screenshot(path=str(OUT / f'{name}.png'))
        print(f'  {name}.png')
    b.close()
    if errs:
        print('page errors:', errs[:4])
print(f'{len(SHOTS)} shots -> {OUT}')
