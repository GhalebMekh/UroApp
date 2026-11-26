import { cn } from '@/lib/cn';

/** The "U" mark: one flat accent tile, no gradient or glow (unslop, 2026-11-22). */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn('grid place-items-center rounded-[8px] bg-violet-deep font-display font-medium text-white', className)}>
      U
    </span>
  );
}
