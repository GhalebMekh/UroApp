import { cn } from '@/lib/cn';

/** The violet "U" tile used in the nav, footer, and hero. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'grid place-items-center rounded-[9px] bg-violet-mark font-display font-bold text-white shadow-violet-ring',
        className,
      )}
    >
      U
    </span>
  );
}
