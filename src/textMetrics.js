// Android measures a single-line TextView (includeFontPadding defaults to true) as
//   (OS/2.usWinAscent + OS/2.usWinDescent) / head.unitsPerEm * textSize
// Read from the app's own Roboto files: 1946 + 512 over 2048 units = 1.20019 x size.
// Every absolutely positioned stack in this replica uses these heights so the boxes line up
// with the ConstraintLayout chains they came from.
export const ROBOTO_LINE = 2458 / 2048;
export const line = (sp) => Math.round(ROBOTO_LINE * sp * 100) / 100;

export const L8 = line(8);    //  9.6
export const L10 = line(10);  // 12.0
export const L12 = line(12);  // 14.4
export const L13 = line(13);  // 15.6
export const L14 = line(14);  // 16.8
export const L15 = line(15);  // 18.0
export const L16 = line(16);  // 19.2
export const L18 = line(18);  // 21.6
export const L20 = line(20);  // 24.0
export const L24 = line(24);  // 28.8
export const L28 = line(28);  // 33.6
