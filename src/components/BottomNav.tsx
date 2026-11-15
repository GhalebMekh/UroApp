import { useEffect, useLayoutEffect, useRef, useState, type ComponentType, type TouchEvent } from 'react';
import { cn } from '@/lib/cn';
import type { Screen } from '@/navigation';

export interface NavItem {
  id: Screen;
  label: string;
  Icon: ComponentType<{ className?: string }>;
}

interface BottomNavProps {
  items: NavItem[];
  current: Screen;
  onNavigate: (screen: Screen) => void;
}

/** Inner padding of the bar (Tailwind p-1.5). */
const PAD = 6;
/** Springy ease with a little overshoot, so the bubble and bar rebound as they settle. */
const SPRING = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
/** How far the bubble may be pulled past the first/last tab, as a share of the overshoot. */
const RUBBER = 0.3;

interface Drag {
  /** Bubble's left edge in the bar's own (unscaled) pixels. */
  x: number;
  /** Horizontal stretch from the thumb's speed; 1 = at rest. */
  stretch: number;
  /** The tab under the thumb. */
  index: number;
}

/**
 * Floating glass tab bar (iOS 26 style): a pill that hovers above the
 * home-indicator safe area, with the active tab in a glass bubble.
 *
 * Owner 2026-11-15 (after a screen recording of the iOS 26 tab bar): press
 * and slide along the bar and it swells, the bubble glides under the thumb,
 * stretching with speed and rubber-banding past the ends; on release it
 * springs onto the tab and the bar settles back with a small rebound. Taps
 * slide the bubble across with the same spring. Reduce Motion drops the
 * swell, stretch and overshoot.
 *
 * Touch targets are ≥44pt (CLAUDE.md). Centred, and capped in width on iPad.
 */
export function BottomNav({ items, current, onNavigate }: BottomNavProps) {
  const barRef = useRef<HTMLUListElement>(null);
  /** Width of one tab in the bar's own pixels; 0 until measured. */
  const [tabW, setTabW] = useState(0);
  const [drag, setDrag] = useState<Drag | null>(null);
  const moved = useRef(false);
  const last = useRef({ x: 0, t: 0 });
  const settle = useRef<number | undefined>(undefined);

  useLayoutEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    const measure = () => setTabW((bar.offsetWidth - PAD * 2) / items.length);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(bar);
    return () => ro.disconnect();
  }, [items.length]);

  useEffect(() => () => window.clearTimeout(settle.current), []);

  /** No animation until the first measurement has painted, so the bubble doesn't slide in on launch. */
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!tabW || ready) return;
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, [tabW, ready]);

  const currentIndex = items.findIndex((i) => i.id === current);
  const shownIndex = drag?.index ?? currentIndex;

  /** Thumb position → bubble position and tab, in the bar's unscaled pixels. */
  function track(e: TouchEvent): Drag | null {
    const bar = barRef.current;
    const t = e.touches[0] ?? e.changedTouches[0];
    if (!bar || !t || !tabW) return null;
    const rect = bar.getBoundingClientRect();
    const scale = rect.width / bar.offsetWidth || 1; // the bar is swollen while pressed
    const local = (t.clientX - rect.left) / scale;
    const index = Math.min(items.length - 1, Math.max(0, Math.floor((local - PAD) / tabW)));

    const min = PAD;
    const max = PAD + tabW * (items.length - 1);
    let x = local - tabW / 2;
    if (x < min) x = min - (min - x) * RUBBER;
    if (x > max) x = max + (x - max) * RUBBER;

    const now = performance.now();
    const speed = Math.abs(t.clientX - last.current.x) / Math.max(1, now - last.current.t); // px/ms
    last.current = { x: t.clientX, t: now };
    const stretch = 1 + Math.min(speed * 0.12, 0.22);
    return { x, stretch, index };
  }

  function relax() {
    // When the thumb stops, the bubble loses its stretch.
    window.clearTimeout(settle.current);
    settle.current = window.setTimeout(() => setDrag((d) => (d ? { ...d, stretch: 1 } : d)), 90);
  }

  const restX = PAD + tabW * shownIndex;
  const bubbleX = drag ? drag.x : restX;
  const stretch = drag?.stretch ?? 1;

  return (
    <nav
      // Taps beside the pill stop here rather than reaching a row hidden behind the bar.
      className="fixed inset-x-0 z-50 px-safe"
      style={{ bottom: 'calc(env(safe-area-inset-bottom) + 10px)' }}
    >
      <ul
        ref={barRef}
        className={cn(
          'glass pointer-events-auto relative mx-4 flex touch-none select-none items-stretch justify-around rounded-full p-1.5 sm:mx-auto sm:max-w-[560px]',
          'transition-transform duration-[450ms] motion-reduce:!scale-100 motion-reduce:duration-150',
          drag && 'scale-[1.06]',
        )}
        style={{ transitionTimingFunction: SPRING }}
        onTouchStart={(e) => {
          moved.current = false;
          const t = e.touches[0];
          if (t) last.current = { x: t.clientX, t: performance.now() };
          const d = track(e);
          if (d) setDrag({ ...d, stretch: 1 });
        }}
        onTouchMove={(e) => {
          moved.current = true;
          const d = track(e);
          if (d) setDrag(d);
          relax();
        }}
        onTouchEnd={(e) => {
          window.clearTimeout(settle.current);
          const index = moved.current ? (track(e)?.index ?? drag?.index) : undefined;
          setDrag(null);
          const target = index === undefined ? undefined : items[index];
          if (target) {
            // The finger moved: handle it here and skip the click that may follow.
            e.preventDefault();
            onNavigate(target.id);
          }
        }}
        onTouchCancel={() => {
          window.clearTimeout(settle.current);
          setDrag(null);
        }}
      >
        {/* The glass bubble behind the active tab. */}
        <span
          aria-hidden
          className={cn(
            'pointer-events-none absolute inset-y-1.5 left-0 rounded-full bg-white/[0.18]',
            'shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_2px_8px_-2px_rgba(0,0,0,0.35)]',
            'motion-reduce:!transition-none',
          )}
          style={{
            width: tabW,
            opacity: tabW && shownIndex >= 0 ? 1 : 0,
            transform: `translateX(${bubbleX}px) scaleX(${stretch}) scaleY(${drag ? 1.04 : 1})`,
            // Follows the thumb closely while dragging; springs into place otherwise.
            transition: !ready
              ? 'none'
              : drag
                ? 'transform 90ms ease-out, opacity 150ms'
                : `transform 480ms ${SPRING}, opacity 150ms`,
          }}
        />
        {items.map(({ id, label, Icon }, i) => {
          const active = i === shownIndex;
          return (
            <li key={id} className="relative flex-1">
              <button
                type="button"
                onClick={() => onNavigate(id)}
                aria-current={id === current ? 'page' : undefined}
                className={cn(
                  'flex min-h-[52px] w-full flex-col items-center justify-center gap-0.5 rounded-full py-1.5 text-[10.5px] font-medium transition-colors',
                  active ? 'text-white' : 'text-ink/75 hover:text-ink',
                )}
              >
                <Icon className="text-[21px]" />
                {label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
