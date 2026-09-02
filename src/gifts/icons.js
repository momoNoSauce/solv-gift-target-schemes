// Line icons for the gift ladders. The production app would use product photos from the
// catalog CDN; a prototype must not hotlink Amazon/Flipkart images, so each gift renders
// as a 24x24 stroke glyph. Stroke 1.6, round caps, no fill.
import React from 'react';
import Svg, { Path, Rect, Circle, Line } from 'react-native-svg';

const P = { fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };

const GLYPHS = {
  mixer: (s) => (
    <>
      <Path {...P} {...s} d="M9 3h6l-1 9h-4L9 3z" />
      <Line {...s} x1="8" y1="3" x2="16" y2="3" strokeLinecap="round" />
      <Rect {...P} {...s} x="7.5" y="14.5" width="9" height="6" rx="1.5" />
      <Circle {...P} {...s} cx="12" cy="17.5" r="1.2" />
    </>
  ),
  airfryer: (s) => (
    <>
      <Rect {...P} {...s} x="4.5" y="4" width="15" height="16" rx="2.5" />
      <Line {...s} x1="4.5" y1="9.5" x2="19.5" y2="9.5" strokeLinecap="round" />
      <Line {...s} x1="10" y1="6.8" x2="14" y2="6.8" strokeLinecap="round" />
      <Circle {...P} {...s} cx="12" cy="14.8" r="2.2" />
    </>
  ),
  soundbar: (s) => (
    <>
      <Rect {...P} {...s} x="3" y="11" width="18" height="5.5" rx="2.5" />
      <Circle {...P} {...s} cx="7.5" cy="13.7" r="1" />
      <Circle {...P} {...s} cx="16.5" cy="13.7" r="1" />
      <Path {...P} {...s} d="M9.5 7.5c1 .8 1 2 0 2.8" />
      <Path {...P} {...s} d="M14.5 7.5c-1 .8-1 2 0 2.8" />
    </>
  ),
  vacuum: (s) => (
    <>
      <Circle {...P} {...s} cx="9" cy="15" r="4.2" />
      <Circle {...P} {...s} cx="9" cy="15" r="1.4" />
      <Path {...P} {...s} d="M12.5 12.5C14 7 17.5 6.5 19 9l1.5 2.5" />
    </>
  ),
  phone: (s) => (
    <>
      <Rect {...P} {...s} x="8" y="3" width="8.5" height="18" rx="2" />
      <Line {...s} x1="11" y1="5.5" x2="13.5" y2="5.5" strokeLinecap="round" />
    </>
  ),
  fridge: (s) => (
    <>
      <Rect {...P} {...s} x="7" y="3" width="10" height="18" rx="1.5" />
      <Line {...s} x1="7" y1="10" x2="17" y2="10" strokeLinecap="round" />
      <Line {...s} x1="14.5" y1="5.5" x2="14.5" y2="7.5" strokeLinecap="round" />
      <Line {...s} x1="14.5" y1="12.5" x2="14.5" y2="15.5" strokeLinecap="round" />
    </>
  ),
  tv: (s) => (
    <>
      <Rect {...P} {...s} x="3" y="5" width="18" height="11.5" rx="1.5" />
      <Line {...s} x1="12" y1="16.5" x2="12" y2="19" strokeLinecap="round" />
      <Line {...s} x1="8.5" y1="19" x2="15.5" y2="19" strokeLinecap="round" />
    </>
  ),
  kettle: (s) => (
    <>
      <Path {...P} {...s} d="M7.5 8.5h8.5l-1 10h-6.5l-1-10z" />
      <Path {...P} {...s} d="M9 8.5c0-2 1.3-3 3-3s3 1 3 3" />
      <Path {...P} {...s} d="M16 10c1.8.4 2.2 3.6.3 4.8" />
    </>
  ),
  watch: (s) => (
    <>
      <Circle {...P} {...s} cx="12" cy="12" r="4.8" />
      <Path {...P} {...s} d="M9.8 7.6V4h4.4v3.6M9.8 16.4V20h4.4v-3.6" />
      <Path {...P} {...s} d="M12 10v2.3l1.5 1" />
    </>
  ),
  microwave: (s) => (
    <>
      <Rect {...P} {...s} x="3" y="6" width="18" height="12" rx="1.5" />
      <Rect {...P} {...s} x="6" y="9" width="8" height="6" rx="0.8" />
      <Line {...s} x1="17.5" y1="9" x2="17.5" y2="15" strokeLinecap="round" />
    </>
  ),
  // A steel dinner set: plate and fork. At 26px a plate with both fork and knife
  // collapses into one blob, so the mark carries the plate and one utensil.
  dinnerset: (s) => (
    <>
      <Circle {...P} {...s} cx="14.5" cy="12" r="6.5" />
      <Circle {...P} {...s} cx="14.5" cy="12" r="3" />
      <Line {...s} x1="3" y1="3.5" x2="3" y2="8" strokeLinecap="round" />
      <Line {...s} x1="6" y1="3.5" x2="6" y2="8" strokeLinecap="round" />
      <Path {...P} {...s} d="M1.5 8h6a0 0 0 0 1 0 0 2.5 2.5 0 0 1-2.5 2.5h-1A2.5 2.5 0 0 1 1.5 8z" />
      <Line {...s} x1="4.5" y1="10.5" x2="4.5" y2="20.5" strokeLinecap="round" />
    </>
  ),
  // A voucher: ticket with a perforation.
  voucher: (s) => (
    <>
      <Path {...P} {...s} d="M3 7.5h18v3a1.8 1.8 0 0 0 0 3.6v2.9H3v-2.9a1.8 1.8 0 0 0 0-3.6z" />
      <Line {...s} x1="14" y1="9.5" x2="14" y2="11" strokeLinecap="round" />
      <Line {...s} x1="14" y1="13" x2="14" y2="14.5" strokeLinecap="round" />
    </>
  ),
  gift: (s) => (
    <>
      <Rect {...P} {...s} x="4.5" y="10" width="15" height="10" rx="1" />
      <Rect {...P} {...s} x="3.5" y="7" width="17" height="3" rx="0.8" />
      <Line {...s} x1="12" y1="7" x2="12" y2="20" strokeLinecap="round" />
      <Path {...P} {...s} d="M12 7c-1.2-3-5-2.8-4.6-.8.3 1.3 2.6.8 4.6.8zm0 0c1.2-3 5-2.8 4.6-.8-.3 1.3-2.6.8-4.6.8z" />
    </>
  ),
  diya: (s) => (
    <>
      <Path {...P} {...s} d="M5.5 14.5h13c0 3-2.8 4.8-6.5 4.8s-6.5-1.8-6.5-4.8z" />
      <Path {...P} {...s} d="M12 6.2c1.6 1.6 2 3.4 0 5.4-2-2-1.6-3.8 0-5.4z" />
    </>
  ),
  // A four-petal flower with a center: the Onam pookalam motif at glyph size.
  flower: (s) => (
    <>
      <Circle {...P} {...s} cx="12" cy="12" r="2.1" />
      <Path {...P} {...s} d="M12 4.2c1.5 1.7 1.5 3.6 0 5.3-1.5-1.7-1.5-3.6 0-5.3z" />
      <Path {...P} {...s} d="M12 19.8c1.5-1.7 1.5-3.6 0-5.3-1.5 1.7-1.5 3.6 0 5.3z" />
      <Path {...P} {...s} d="M19.8 12c-1.7 1.5-3.6 1.5-5.3 0 1.7-1.5 3.6-1.5 5.3 0z" />
      <Path {...P} {...s} d="M4.2 12c1.7 1.5 3.6 1.5 5.3 0-1.7-1.5-3.6-1.5-5.3 0z" />
    </>
  ),
  sparkle: (s) => (
    <Path {...P} {...s} d="M12 4.5l1.4 4.6 4.6 1.4-4.6 1.4L12 16.5l-1.4-4.6L6 10.5l4.6-1.4L12 4.5z" />
  ),
  truck: (s) => (
    <>
      <Path {...P} {...s} d="M3 7.5h10.5V16H3z" />
      <Path {...P} {...s} d="M13.5 10.5h3.6l2.9 3V16h-6.5" />
      <Circle {...P} {...s} cx="7" cy="17.5" r="1.6" />
      <Circle {...P} {...s} cx="16.5" cy="17.5" r="1.6" />
    </>
  ),
  check: (s) => (
    <>
      <Circle {...P} {...s} cx="12" cy="12" r="8.5" />
      <Path {...P} {...s} d="M8.5 12.3l2.4 2.4 4.6-5" />
    </>
  ),
};

export default function GiftGlyph({ kind, size = 24, color = '#000', strokeWidth = 1.6 }) {
  const draw = GLYPHS[kind] || GLYPHS.gift;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {draw({ stroke: color, strokeWidth })}
    </Svg>
  );
}
