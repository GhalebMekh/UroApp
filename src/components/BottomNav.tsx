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
 * Fixed bottom navigation. Touch targets are ≥44pt and the bar respects the
 * home-indicator safe area (CLAUDE.md). Mobile-first; centred on wide screens.
 */
export function BottomNav({ items, current, onNavigate }: BottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-navy/[0.92] pb-safe backdrop-blur-[14px]">
      <ul className="mx-auto flex max-w-wrap items-stretch justify-around px-2">
        {items.map(({ id, label, Icon }) => {
          const active = id === current;
          return (
            <li key={id} className="flex-1">
              <button
                type="button"
                onClick={() => onNavigate(id)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex min-h-[56px] w-full flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium transition-colors',
                  active ? 'text-violet-soft' : 'text-muted-2 hover:text-ink',
                )}
              >
                <Icon className="text-[22px]" />
                {label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
