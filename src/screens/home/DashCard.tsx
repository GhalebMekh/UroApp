import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

const TONE = {
  violet: 'text-violet-soft',
  crimson: 'text-crimson',
  amber: 'text-amber',
  teal: 'text-teal',
} as const;

/** One Home dashboard card: an eyebrow title, an optional "see all" link, then its content. */
export function DashCard({
  title,
  tone = 'violet',
  action,
  className,
  children,
}: {
  title: string;
  tone?: keyof typeof TONE;
  action?: { label: string; onClick: () => void };
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn('flex flex-col rounded-card border border-line bg-navy-2 p-4 sm:p-5', className)}>
      <div className="mb-3 flex min-h-[24px] items-center justify-between gap-3">
        <h2 className={cn('text-[11px] font-semibold uppercase tracking-[0.14em]', TONE[tone])}>{title}</h2>
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className="-my-2.5 min-h-[44px] shrink-0 px-1 text-[12.5px] font-semibold text-violet-soft transition-colors hover:text-ink"
          >
            {action.label} <span aria-hidden="true">→</span>
          </button>
        )}
      </div>
      {children}
    </section>
  );
}
