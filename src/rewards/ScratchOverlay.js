// ScratchCardOverlayUi.java: a scratchable cover over the reward card. The Android view
// paints scratch_bg_rect (or gold_scratch_bg_rect) into a canvas and erases along the
// finger path, calling back with the visible percent; ScratchCardRevealFragment reveals
// the reward once that percent passes 0.3.
import React, { useMemo, useRef, useState } from 'react';
import { View, Image, PanResponder, StyleSheet } from 'react-native';
import { RIMG } from './assets';

const GRID = 10; // 10x10 erase cells
const REVEAL_AT = 0.3;

export default function ScratchOverlay({ size, gold, onRevealed, texture }) {
  const cell = size / GRID;
  const [cleared, setCleared] = useState(() => new Set());
  const clearedRef = useRef(cleared);
  const revealedRef = useRef(false);
  const originRef = useRef({ x: 0, y: 0 });
  const rootRef = useRef(null);

  const measure = () => {
    rootRef.current?.measureInWindow?.((x, y) => {
      originRef.current = { x, y };
    });
  };

  const clearAtPage = (pageX, pageY) => {
    const x = pageX - originRef.current.x;
    const y = pageY - originRef.current.y;
    const col = Math.floor(x / cell);
    const row = Math.floor(y / cell);
    if (col < 0 || row < 0 || col >= GRID || row >= GRID) return;
    const next = new Set(clearedRef.current);
    // erase a 2x2 block, roughly the stroke width the Android view uses
    for (const [dc, dr] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
      const c = col + dc;
      const r = row + dr;
      if (c < GRID && r < GRID) next.add(r * GRID + c);
    }
    clearedRef.current = next;
    setCleared(next);
    if (!revealedRef.current && next.size / (GRID * GRID) > REVEAL_AT) {
      revealedRef.current = true;
      onRevealed?.();
    }
  };

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (e) => {
          measure();
          clearAtPage(e.nativeEvent.pageX, e.nativeEvent.pageY);
        },
        onPanResponderMove: (e) => clearAtPage(e.nativeEvent.pageX, e.nativeEvent.pageY),
      }),
    [cell]
  );

  const cells = [];
  for (let r = 0; r < GRID; r++) {
    for (let c = 0; c < GRID; c++) {
      const i = r * GRID + c;
      if (cleared.has(i)) continue;
      cells.push(
        <View
          key={i}
          pointerEvents="none"
          style={{ position: 'absolute', left: c * cell, top: r * cell, width: cell, height: cell, overflow: 'hidden' }}
        >
          <Image
            source={texture ?? (gold ? RIMG.goldScratchBg : RIMG.scratchBg)}
            style={{ position: 'absolute', left: -c * cell, top: -r * cell, width: size, height: size }}
            resizeMode="cover"
          />
        </View>
      );
    }
  }

  return (
    <View
      ref={rootRef}
      onLayout={measure}
      style={[styles.root, { width: size, height: size }]}
      {...responder.panHandlers}
    >
      {cells}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { position: 'absolute', left: 0, top: 0, overflow: 'hidden' },
});
