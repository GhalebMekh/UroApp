import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

const TONE = {
  // Neutral by default; a colour only when the section carries a status (on-call).
  violet: 'text-ink',
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
        <h2 className={cn('text-[14px] font-medium', TONE[tone])}>{title}</h2>
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className="-my-2.5 min-h-[44px] shrink-0 px-1 text-[13px] font-medium text-violet transition-colors hover:text-violet-soft"
          >
            {action.label} <span aria-hidden="true">→</span>
          </button>
        )}
      </div>
      {children}
    </section>
  );
}
