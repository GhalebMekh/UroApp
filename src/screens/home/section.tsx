import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** Constrains content to the 1180px site width. */
export function Wrap({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mx-auto max-w-wrap px-6', className)}>{children}</div>;
}

/** A landing-page section with the standard eyebrow / heading / lede header. */
export function Section({
  id,
  eyebrow,
  title,
  lede,
  children,
}: {
  id?: string;
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className="border-t border-line py-20">
      <Wrap>
        <div className="mb-3.5 text-[12px] font-medium text-violet-soft">
          {eyebrow}
        </div>
        <h2 className="mb-4 font-display text-[clamp(28px,4vw,40px)] font-medium leading-[1.1]">
          {title}
        </h2>
        {lede && <p className="max-w-xl text-[16px] text-muted">{lede}</p>}
        {children}
      </Wrap>
    </section>
  );
}
