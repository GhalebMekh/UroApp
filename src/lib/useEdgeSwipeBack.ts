import { useEffect, useRef } from 'react';

/** A swipe must start this close to the left edge… */
const EDGE_PX = 28;
/** …travel this far right… */
const MIN_DX = 70;
/** …and stay mostly horizontal. */
const MAX_SLOPE = 0.6;

/**
 * iOS-style back gesture: a swipe in from the left edge calls `onBack`.
 * The app routes screens in state (no browser history), so WKWebView's own
 * back gesture has nothing to go back to — this stands in for it.
 */
export function useEdgeSwipeBack(onBack: () => void, enabled: boolean): void {
  const backRef = useRef(onBack);
  backRef.current = onBack;

  useEffect(() => {
    if (!enabled) return;
    let start: { x: number; y: number } | null = null;

    const onStart = (e: TouchEvent) => {
      const t = e.touches[0];
      start = t && e.touches.length === 1 && t.clientX <= EDGE_PX ? { x: t.clientX, y: t.clientY } : null;
    };
    const onEnd = (e: TouchEvent) => {
      const t = e.changedTouches[0];
      if (!start || !t) return;
      const dx = t.clientX - start.x;
      const dy = Math.abs(t.clientY - start.y);
      start = null;
      if (dx >= MIN_DX && dy <= dx * MAX_SLOPE) backRef.current();
    };
    const onCancel = () => {
      start = null;
    };

    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchend', onEnd, { passive: true });
    window.addEventListener('touchcancel', onCancel, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchend', onEnd);
      window.removeEventListener('touchcancel', onCancel);
    };
  }, [enabled]);
}
