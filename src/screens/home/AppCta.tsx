import { Wrap } from './section';

/** "TestFlight soon" call-to-action band + footer. */
export function AppCta() {
  return (
    <>
      <section className="border-t border-line py-20">
        <Wrap>
          <div className="rounded-[22px] border border-violet/[0.35] bg-ai-soft px-8 py-[46px] text-center">
            <h3 className="mb-2.5 font-display text-[clamp(24px,4vw,30px)] font-semibold">
              UroApp for iPhone — in development
            </h3>
            <p className="mx-auto max-w-[520px] text-muted">
              The offline calculators, guideline summaries, surveillance schedules, operative
              reference and bilingual consent generator are being packaged for iPhone. A TestFlight
              build is planned once the native wrap is complete.
            </p>
          </div>
        </Wrap>
      </section>

      <footer className="border-t border-line py-12 text-[13px] text-muted-2">
        <Wrap>
          <div className="text-center">
            © 2026 UroApp · Jeddah, Saudi Arabia · For licensed healthcare professionals
          </div>
        </Wrap>
      </footer>
    </>
  );
}
