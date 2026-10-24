import { BrandMark } from '@/components/BrandMark';

/**
 * Shown in a preview build in place of a workspace that ships in the App Store
 * release. Names what the screen does, so the lock reads as a shop window
 * rather than a dead end.
 */
export function AppStoreLockScreen({ title, blurb }: { title: string; blurb: string }) {
  return (
    <div className="mx-auto max-w-wrap px-6 py-16">
      <div className="mx-auto max-w-lg rounded-[20px] border border-line bg-navy-2 p-8 text-center">
        <div className="mb-4 flex justify-center">
          <BrandMark className="h-10 w-10 text-[22px]" />
        </div>
        <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-soft">
          In the full app
        </div>
        <h2 className="mb-3 font-display text-[28px] font-semibold">{title}</h2>
        <p className="text-[15px] text-muted">{blurb}</p>
        <p className="mt-6 text-[13px] text-muted-2">
          This preview includes the calculators and guideline summaries. {title} arrives with the
          iOS release.
        </p>
      </div>
    </div>
  );
}
