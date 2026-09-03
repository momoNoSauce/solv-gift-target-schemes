// One answer to "should this page animate at all?", shared by the pager, the
// pages and the dock.
//   - navigator.webdriver / HeadlessChrome: a capture pipeline; render settled.
//   - ?static=1: a capture flag for a hidden preview pane, whose paused frame
//     clock would otherwise freeze every JS-driven value mid-flight.
//   - prefers-reduced-motion: the user asked for less movement. Entrances and
//     the meter sweep render settled; the pager still moves, but on a stiff,
//     short spring (see usePager), because a page that jumps with no motion
//     loses the spatial cue of which way the list went.
import { Platform } from 'react-native';

const web = Platform.OS === 'web' && typeof window !== 'undefined';

export const CAPTURE =
  web &&
  (navigator.webdriver === true ||
    /HeadlessChrome/.test(navigator.userAgent || '') ||
    /(^|[?&])static=1(&|$)/.test(window.location.search || ''));

export const REDUCED_MOTION =
  web && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Skip entrance and sweep animations: capture, or reduced motion.
export const SETTLED = CAPTURE || REDUCED_MOTION;
