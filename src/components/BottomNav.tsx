import type { ComponentType } from 'react';
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

/**
 * Floating glass tab bar (iOS 26 style): a pill that hovers above the
 * home-indicator safe area, with the active tab in its own glass bubble.
 * Touch targets are ≥44pt (CLAUDE.md). Centred, and capped in width on iPad.
 */
export function BottomNav({ items, current, onNavigate }: BottomNavProps) {
  return (
    <nav
      className="pointer-events-none fixed inset-x-0 z-50 px-safe"
      style={{ bottom: 'calc(env(safe-area-inset-bottom) + 10px)' }}
    >
      <ul className="glass pointer-events-auto mx-4 flex items-stretch justify-around rounded-full p-1.5 sm:mx-auto sm:max-w-[560px]">
        {items.map(({ id, label, Icon }) => {
          const active = id === current;
          return (
            <li key={id} className="flex-1">
              <button
                type="button"
                onClick={() => onNavigate(id)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex min-h-[52px] w-full flex-col items-center justify-center gap-0.5 rounded-full py-1.5 text-[10.5px] font-medium transition-colors',
                  active
                    ? 'bg-white/[0.12] text-violet-soft shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]'
                    : 'text-muted hover:text-ink',
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
