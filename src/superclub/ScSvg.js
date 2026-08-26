import React from 'react';
import { SvgXml } from 'react-native-svg';
import { SVG_XML } from './svgAssets';

// Renders one of the SuperClub SVG assets at the size the web <img> uses.
export function ScSvg({ name, width, height }) {
  return <SvgXml xml={SVG_XML[name]} width={width} height={height} />;
}
