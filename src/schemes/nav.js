// The back arrow on the list returns to the Option A / Option B entry.
// In the deployed review build the entry is `/`; locally it is `/options`. A
// deep link has no history, so the arrow never relies on router.back() alone.
// Home from a detail: the main list of cards, in the option the detail belongs to.
export function toList(router, opt) {
  router.replace(`/schemes/list?opt=${opt}`);
}

// Back from a detail: to wherever the shop came from when there is a history
// (the product page, the list, the entry), else to the entry.
export function backToEntry(router) {
  if (typeof router.canGoBack === 'function' && router.canGoBack()) {
    router.back();
    return;
  }
  router.replace(process.env.EXPO_PUBLIC_LANDING === 'options' ? '/' : '/options');
}
