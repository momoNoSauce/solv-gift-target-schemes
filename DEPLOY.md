# The live review build

This working copy is the `review-live` branch. It is what https://solvts.vercel.app
serves: the Option A (arc) and Option B (dock) entry that opens the detail screens
directly. The scheme list and the card-to-detail move live on `master`, in
`../target-schemes-proto`, and ship to a different link.

Only fixes to the review experience go here. To deploy a fix:

```bash
EXPO_PUBLIC_LANDING=options EXPO_PUBLIC_ENTRY=detail npx expo export -p web
cp vercel.json dist/
cd dist && vercel link --yes --project solvts --scope solvjt && vercel deploy --prod --yes
```

`node_modules` is a symlink to the master copy's install.
