import { BrandMark } from '@/components/BrandMark';
import { PageBody, PageHero } from '@/components/PageHero';

/**
 * Shown in a preview build in place of a workspace that ships in the App Store
 * release. Names what the screen does, so the lock reads as a shop window
 * rather than a dead end.
 */
export function AppStoreLockScreen({ title, blurb }: { title: string; blurb: string }) {
  return (
    <>
      <PageHero eyebrow="In the full app" title={title} lede={blurb} />
      <PageBody narrow>
        <div className="rounded-[20px] border border-line bg-navy-2 p-8 text-center">
          <div className="mb-4 flex justify-center">
            <BrandMark className="h-10 w-10 text-[22px]" />
          </div>
          <p className="text-[14px] text-muted">
            This preview includes the calculators and guideline summaries. {title} arrives with the
            iOS release.
          </p>
        </div>
      </PageBody>
    </>
  );
}
