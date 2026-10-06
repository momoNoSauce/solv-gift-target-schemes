# Deploying

`master` deploys itself. Vercel (project `solv-gift-target-schemes`) is connected to
this repo: every push to `master` builds and goes to production at
https://solv-gift-target-schemes.vercel.app, about 90 seconds later. The final scheme
list is https://solv-gift-target-schemes.vercel.app/schemes/list4.

The build is set in [vercel.json](vercel.json): `npx expo export -p web`, serving `dist`,
with every path rewritten to `index.html` for the client router. Without those settings a
git build publishes no `index.html` and every route returns 404 (6 Oct 2026).

A failed build does not replace production; the last good deploy keeps serving. Nothing
compiles the code before Vercel does when there is no local install, so read JSX edits
for syntax before pushing. The commit's GitHub status links the Vercel build log.

To watch a push land:

```bash
gh api repos/momoNoSauce/solv-gift-target-schemes/commits/<sha>/status --jq '.statuses[0].state'
```

## Running it locally

```bash
npm install
npx expo start --web --port 8099
```

`package-lock.json` resolves every package to `registry.npmmirror.com`. An npm that only
fetches from `registry.npmjs.org` (npm 12's default) refuses it; the tarballs are the
same on both registries.

## The earlier review build

Before the git deploys, builds were exported and uploaded by hand. The founder-review
build (Option A / Option B, opening the detail screens directly) went to
https://solvts.vercel.app from a `review-live` branch that is not in this repo:

```bash
EXPO_PUBLIC_LANDING=options EXPO_PUBLIC_ENTRY=detail npx expo export -p web
cp vercel.json dist/
cd dist && vercel link --yes --project solvts --scope solvjt && vercel deploy --prod --yes
```
