import { useEffect, useRef, useState, type ReactNode, type TouchEvent } from 'react';
import { cn } from '@/lib/cn';
import { tapFeedback, tickFeedback } from '@/lib/haptics';

/** How far the row slides to show the Delete button. */
const REVEAL = 92;
/** Hold this long (ms) to open the menu. */
const HOLD_MS = 450;
/** Movement (px) that turns a hold into a swipe or scroll. */
const SLOP = 8;

/**
 * A list row with iOS-style gestures (owner, 2026-11-15):
 * - swipe left to reveal Delete; swipe right or tap elsewhere to close;
 * - press and hold for a moment — with a haptic tap — to show Edit and Delete.
 *
 * `children` is the row's normal content; `onTap` replaces a click on it so a
 * swipe or hold never also counts as a tap. Vertical scrolling is left to the
 * page (touch-action: pan-y).
 */
export function SwipeRow({
  children,
  onTap,
  onEdit,
  onDelete,
  className,
}: {
  children: ReactNode;
  onTap?: () => void;
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
}) {
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [menu, setMenu] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);
  const start = useRef<{ x: number; y: number; base: number } | null>(null);
  const axis = useRef<'x' | 'y' | null>(null);
  const hold = useRef<number | undefined>(undefined);
  const passed = useRef(false);
  /** Set when a swipe or hold happened, so the click that follows is ignored. */
  const swallow = useRef(false);

  const open = offset <= -REVEAL / 2;

  // Close when the user touches anywhere outside this row.
  useEffect(() => {
    if (!open && !menu) return;
    const close = (e: Event) => {
      if (rowRef.current?.contains(e.target as Node)) return;
      setOffset(0);
      setMenu(false);
    };
    document.addEventListener('touchstart', close, { passive: true });
    document.addEventListener('mousedown', close);
    return () => {
      document.removeEventListener('touchstart', close);
      document.removeEventListener('mousedown', close);
    };
  }, [open, menu]);

  useEffect(() => () => window.clearTimeout(hold.current), []);

  function onTouchStart(e: TouchEvent) {
    const t = e.touches[0];
    if (!t) return;
    start.current = { x: t.clientX, y: t.clientY, base: offset };
    axis.current = null;
    passed.current = offset !== 0;
    swallow.current = false;
    window.clearTimeout(hold.current);
    hold.current = window.setTimeout(() => {
      if (axis.current) return;
      swallow.current = true;
      setOffset(0);
      setMenu(true);
      tapFeedback();
    }, HOLD_MS);
  }

  function onTouchMove(e: TouchEvent) {
    const t = e.touches[0];
    const s = start.current;
    if (!t || !s) return;
    const dx = t.clientX - s.x;
    const dy = t.clientY - s.y;
    if (!axis.current) {
      if (Math.abs(dx) < SLOP && Math.abs(dy) < SLOP) return;
      axis.current = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      window.clearTimeout(hold.current);
    }
    if (axis.current !== 'x') return;
    swallow.current = true;
    setDragging(true);
    setMenu(false);
    // Free to the left up to the button, then resistance; a little give to the right.
    let next = s.base + dx;
    if (next < -REVEAL) next = -REVEAL + (next + REVEAL) * 0.25;
    if (next > 0) next *= 0.2;
    setOffset(next);
    const past = next <= -REVEAL / 2;
    if (past !== passed.current) {
      passed.current = past;
      if (past) tickFeedback();
    }
  }

  function onTouchEnd() {
    window.clearTimeout(hold.current);
    start.current = null;
    if (axis.current === 'x') setOffset((o) => (o <= -REVEAL / 2 ? -REVEAL : 0));
    setDragging(false);
  }

  return (
    <div ref={rowRef} className={cn('relative overflow-hidden rounded-[14px]', className)}>
      {/* Behind the row: the Delete button the swipe uncovers. */}
      <div className="absolute inset-y-0 right-0 flex items-stretch" style={{ width: REVEAL }} aria-hidden={!open}>
        <button
          type="button"
          tabIndex={open ? 0 : -1}
          onClick={() => {
            setOffset(0);
            onDelete();
          }}
          className="w-full bg-steel text-[13.5px] font-semibold text-ink"
        >
          Delete
        </button>
      </div>

      <div
        className="relative touch-pan-y"
        style={{
          transform: `translateX(${offset}px)`,
          transition: dragging ? 'none' : 'transform 320ms cubic-bezier(0.34, 1.4, 0.64, 1)',
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
        onContextMenu={(e) => e.preventDefault()}
        onClickCapture={(e) => {
          if (swallow.current || open) {
            e.stopPropagation();
            e.preventDefault();
            swallow.current = false;
            if (open) setOffset(0);
          }
        }}
        onClick={onTap}
      >
        {children}
      </div>

      {menu && (
        <div className="relative flex gap-2 border-t border-line bg-navy-2 px-4 py-3" role="menu">
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setMenu(false);
              onEdit();
            }}
            className="min-h-[44px] flex-1 rounded-[10px] border border-violet bg-violet/[0.18] text-[13.5px] font-semibold text-violet-soft"
          >
            Edit
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setMenu(false);
              onDelete();
            }}
            className="min-h-[44px] flex-1 rounded-[10px] border border-line bg-navy text-[13.5px] font-semibold text-ink"
          >
            Delete
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => setMenu(false)}
            className="min-h-[44px] rounded-[10px] px-3 text-[13.5px] font-semibold text-muted"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
