import type { ComponentType, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { ChevronRightIcon } from '@/components/icons';

/** A titled card holding a list of tool rows (Calculators, Pediatrics). */
export function ToolGroupCard({
  title,
  Icon,
  count,
  accent = 'text-violet-soft',
  className,
  children,
}: {
  title: ReactNode;
  Icon?: ComponentType<{ className?: string }>;
  count?: number;
  accent?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn('mb-4 break-inside-avoid rounded-card border border-line bg-navy-2 p-1.5', className)}>
      <h3 className={cn('flex items-center gap-2 px-3 pb-1 pt-2.5 text-[11px] font-semibold uppercase tracking-[0.14em]', accent)}>
        {Icon && <Icon className="text-[15px]" />}
        {title}
        {count !== undefined && <span className="font-normal text-muted-2">{count}</span>}
      </h3>
      <ul>{children}</ul>
    </section>
  );
}

/** One tool in a list: the row opens it; `action` (e.g. a pin star) sits at the end. */
export function ToolRow({
  title,
  subtitle,
  onOpen,
  action,
}: {
  title: string;
  subtitle?: string;
  onOpen: () => void;
  action?: ReactNode;
}) {
  return (
    <li className="flex items-center border-b border-line/60 last:border-b-0">
      <button
        type="button"
        onClick={onOpen}
        className="flex min-h-[52px] min-w-0 flex-1 items-center gap-3 rounded-[10px] px-3 py-2.5 text-left transition-colors hover:bg-steel"
      >
        <span className="min-w-0 flex-1">
          <span className="block text-[14.5px] font-semibold leading-snug">{title}</span>
          {subtitle && <span className="block text-[12px] text-muted-2">{subtitle}</span>}
        </span>
        <ChevronRightIcon className="shrink-0 text-[16px] text-muted-2" />
      </button>
      {action}
    </li>
  );
}

/**
 * The page around one opened tool: where it sits, a way back to the full list,
 * and links to the other tools under the same heading.
 */
export function ToolDetail({
  eyebrow,
  allLabel,
  onAll,
  group,
  siblings,
  onOpen,
  children,
}: {
  eyebrow: string;
  allLabel: string;
  onAll: () => void;
  group: string;
  siblings: { id: string; title: string }[];
  onOpen: (id: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 md:py-8">
      <div className="mb-3 flex min-h-[24px] items-center justify-between gap-3">
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-soft">{eyebrow}</div>
        <button
          type="button"
          onClick={onAll}
          className="-my-2.5 min-h-[44px] shrink-0 px-1 text-[12.5px] font-semibold text-violet-soft transition-colors hover:text-ink"
        >
          {allLabel} <span aria-hidden="true">→</span>
        </button>
      </div>

      {children}

      {siblings.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2">Also in {group}</h2>
          <div className="flex flex-wrap gap-2">
            {siblings.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onOpen(s.id)}
                className="min-h-[44px] rounded-[11px] border border-line bg-navy-2 px-3.5 py-2 text-left text-[13px] font-semibold text-ink transition-colors hover:border-violet"
              >
                {s.title}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/** Shown when a stored or linked tool id no longer exists. */
export function ToolMissing({ allLabel, onAll }: { allLabel: string; onAll: () => void }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="text-[14px] text-muted">This tool is no longer available.</p>
      <button
        type="button"
        onClick={onAll}
        className="mt-4 min-h-[44px] rounded-[11px] border border-line bg-navy-2 px-4 text-[14px] font-semibold text-violet-soft hover:border-violet"
      >
        {allLabel}
      </button>
    </div>
  );
}
