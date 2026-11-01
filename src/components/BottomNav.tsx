import { useRef, useState, type ComponentType, type TouchEvent } from 'react';
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

/** The tab under a touch point, read from the button's data attribute. */
function tabAt(e: TouchEvent): Screen | null {
  const t = e.touches[0] ?? e.changedTouches[0];
  if (!t) return null;
  const el = document.elementFromPoint(t.clientX, t.clientY)?.closest<HTMLElement>('[data-tab]');
  return (el?.dataset.tab as Screen | undefined) ?? null;
}

/**
 * Floating glass tab bar (iOS 26 style): a pill that hovers above the
 * home-indicator safe area, with the active tab in its own glass bubble.
 * As on iOS, the thumb can slide along the bar — the bubble follows it and
 * the tab under the finger opens on release. Touch targets are ≥44pt
 * (CLAUDE.md). Centred, and capped in width on iPad.
 */
export function BottomNav({ items, current, onNavigate }: BottomNavProps) {
  /** The tab under a sliding thumb; null when not sliding. */
  const [dragTab, setDragTab] = useState<Screen | null>(null);
  const dragged = useRef(false);
  const shown = dragTab ?? current;

  return (
    <nav
      className="pointer-events-none fixed inset-x-0 z-50 px-safe"
      style={{ bottom: 'calc(env(safe-area-inset-bottom) + 10px)' }}
    >
      <ul
        className="glass pointer-events-auto mx-4 flex touch-none select-none items-stretch justify-around rounded-full p-1.5 sm:mx-auto sm:max-w-[560px]"
        onTouchStart={(e) => {
          dragged.current = false;
          setDragTab(tabAt(e));
        }}
        onTouchMove={(e) => {
          dragged.current = true;
          const id = tabAt(e);
          if (id) setDragTab(id);
        }}
        onTouchEnd={(e) => {
          const id = dragged.current ? (tabAt(e) ?? dragTab) : null;
          setDragTab(null);
          if (id) {
            // The finger moved: handle it here and skip the click that may follow.
            e.preventDefault();
            onNavigate(id);
          }
        }}
        onTouchCancel={() => setDragTab(null)}
      >
        {items.map(({ id, label, Icon }) => {
          const active = id === shown;
          return (
            <li key={id} className="flex-1">
              <button
                type="button"
                data-tab={id}
                onClick={() => onNavigate(id)}
                aria-current={id === current ? 'page' : undefined}
                className={cn(
                  'flex min-h-[52px] w-full flex-col items-center justify-center gap-0.5 rounded-full py-1.5 text-[10.5px] font-medium transition-colors',
                  active
                    ? 'bg-white/[0.18] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_2px_8px_-2px_rgba(0,0,0,0.35)]'
                    : 'text-ink/75 hover:text-ink',
                  dragTab !== null && active && 'scale-105',
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
