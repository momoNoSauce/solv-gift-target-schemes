// The API sends product / reward / badge artwork by URL. When there is no URL the app shows
// @drawable/product_image_placeholder, so the replica shows the same asset rather than a
// blank rectangle.
import React from 'react';
import { Image } from 'react-native';
import { REMOTE } from '../remoteAssets';

export default function ProductImage({ url, width, height, style, resizeMode = 'contain' }) {
  return (
    <Image
      source={url ? { uri: url } : REMOTE.productPlaceholder}
      style={[{ width, height }, style]}
      resizeMode={resizeMode}
    />
  );
}
