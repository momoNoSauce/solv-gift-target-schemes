// The pager engine. One Animated.Value, `pos`, is the page position as a float:
// 0 is the first scheme, 1.5 is halfway between the second and the third. Every
// surface reads it: the pages translate by -pos * pageW, the dock row by
// -pos * pitch, each thumb scales and rings by its distance from pos. Because
// there is one value, the page and the dock can never be out of step by a frame.
//
// Two gestures write it. A drag on the page moves one page per pageW of finger
// travel; a drag on the dock moves one page per pitch. Both share the release
// rule: project the finger's velocity 160ms ahead, round to the nearest page,
// and spring there carrying the velocity in. A flick moves one page; a long
// drag can cross several. Past either end the position rubber-bands at 35%.
//
// The spring: stiffness 320, damping 34, mass 1 (damping ratio 0.95), so the
// landing is firm with no visible bounce, and it can be interrupted mid-flight
// by the next touch. At the two ends overshoot is clamped so the backdrop never
// peeks past the last page.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, Platform } from 'react-native';
import { REDUCED_MOTION } from './motion';

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const RUBBER = 0.35;
const PROJECT_MS = 160;
const SPRING = REDUCED_MOTION
  // Reduced motion: the same landing in about a third of the time, no carry-in.
  ? { stiffness: 900, damping: 60, mass: 1, restDisplacementThreshold: 0.0005, restSpeedThreshold: 0.0005, useNativeDriver: false }
  : { stiffness: 320, damping: 34, mass: 1, restDisplacementThreshold: 0.0005, restSpeedThreshold: 0.0005, useNativeDriver: false };

export function usePager({ count, initial = 0 }) {
  const pos = useRef(new Animated.Value(initial)).current;
  const posNow = useRef(initial);
  const startPos = useRef(initial);
  const [index, setIndex] = useState(initial);
  const running = useRef(null);
  const last = Math.max(0, count - 1);

  useEffect(() => {
    const id = pos.addListener(({ value }) => {
      posNow.current = value;
    });
    return () => pos.removeListener(id);
  }, [pos]);

  // A shorter list than the current position: land on the new last page.
  useEffect(() => {
    if (posNow.current > last) {
      running.current?.stop();
      pos.setValue(last);
      setIndex(last);
    }
  }, [last, pos]);

  const settle = (target, velocity = 0) => {
    const t = clamp(Math.round(target), 0, last);
    setIndex(t);
    running.current?.stop();
    running.current = Animated.spring(pos, {
      ...SPRING,
      toValue: t,
      velocity: REDUCED_MOTION ? 0 : velocity,
      overshootClamping: t === 0 || t === last,
    });
    running.current.start(({ finished }) => {
      if (finished) running.current = null;
    });
  };

  const goTo = (i) => settle(i, 0);

  // Desktop demo: the arrow keys page. A keyboard action would normally not
  // animate (it repeats hundreds of times a day); here it stands in for the
  // swipe it demonstrates, so it takes the same spring.
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const onKey = (e) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'ArrowRight') settle(Math.round(posNow.current) + 1, 0);
      else if (e.key === 'ArrowLeft') settle(Math.round(posNow.current) - 1, 0);
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [last]);

  // `unit` is the finger travel, in px, that moves the position by one page.
  const makePan = (unitRef) =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      // Claim on horizontal intent only: a vertical or ambiguous move stays
      // with the page's own scroll view and its pressables.
      onMoveShouldSetPanResponderCapture: (_, g) => Math.abs(g.dx) > 6 && Math.abs(g.dx) > Math.abs(g.dy) * 1.4,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 6 && Math.abs(g.dx) > Math.abs(g.dy) * 1.4,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        running.current?.stop();
        running.current = null;
        pos.stopAnimation();
        startPos.current = posNow.current;
      },
      onPanResponderMove: (_, g) => {
        const unit = Math.max(1, unitRef.current);
        let raw = startPos.current - g.dx / unit;
        if (raw < 0) raw = -(-raw * RUBBER);
        else if (raw > last) raw = last + (raw - last) * RUBBER;
        pos.setValue(raw);
      },
      onPanResponderRelease: (_, g) => {
        const unit = Math.max(1, unitRef.current);
        const v = -g.vx / unit; // pages per ms
        const raw = posNow.current;
        const from = Math.round(startPos.current);
        let target = Math.round(raw + v * PROJECT_MS);
        // A flick from rest moves one page; only real travel crosses more.
        if (Math.abs(raw - startPos.current) < 1) target = clamp(target, from - 1, from + 1);
        settle(target, v * 1000);
      },
      onPanResponderTerminate: () => settle(posNow.current, 0),
    });

  const pageUnit = useRef(1);
  const dockUnit = useRef(1);
  const pagePan = useMemo(() => makePan(pageUnit), [last]);
  const dockPan = useMemo(() => makePan(dockUnit), [last]);

  return {
    pos,
    index,
    goTo,
    pagePan: pagePan.panHandlers,
    dockPan: dockPan.panHandlers,
    setPageUnit: (px) => {
      pageUnit.current = px;
    },
    setDockUnit: (px) => {
      dockUnit.current = px;
    },
    // For the frame audit: read the position, or place it exactly, no spring.
    _pos: () => posNow.current,
    _setPos: (v) => {
      running.current?.stop();
      pos.setValue(v);
    },
  };
}
