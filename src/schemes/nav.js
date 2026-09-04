// The back arrow on the list returns to the Option A / Option B entry.
// In the deployed review build the entry is `/`; locally it is `/options`. A
// deep link has no history, so the arrow never relies on router.back() alone.
export function backToEntry(router) {
  if (process.env.EXPO_PUBLIC_LANDING === 'options') {
    router.replace('/');
    return;
  }
  if (typeof router.canGoBack === 'function' && router.canGoBack()) router.back();
  else router.replace('/options');
}
