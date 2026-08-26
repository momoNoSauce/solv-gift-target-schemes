// Bootstrap 3 grid, as loaded by the SuperClub page:
//   .row { margin-left:-15px; margin-right:-15px }
//   .col-xs-N { float:left; width:N/12*100%; padding-left:15px; padding-right:15px }
import React from 'react';
import { View } from 'react-native';
import { GUTTER } from './theme';

export function Row({ style, children, flex = false }) {
  return (
    <View
      style={[
        { marginLeft: -GUTTER, marginRight: -GUTTER, flexDirection: 'row', flexWrap: 'wrap' },
        flex && { alignItems: 'stretch' },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Col({ n, style, children, noPadding, noLeftPadding, noRightPadding, onLayout }) {
  return (
    <View
      onLayout={onLayout}
      style={[
        {
          width: `${(n / 12) * 100}%`,
          paddingLeft: GUTTER,
          paddingRight: GUTTER,
          minHeight: 1,
        },
        noPadding && { paddingLeft: 0, paddingRight: 0 },
        noLeftPadding && { paddingLeft: 0 },
        noRightPadding && { paddingRight: 0 },
        style,
      ]}
    >
      {children}
    </View>
  );
}
