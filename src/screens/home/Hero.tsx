import { Wrap } from './section';
import type { Screen } from '@/navigation';

/** Hero with the live-feeling phone mockup. */
export function Hero({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <header className="relative overflow-hidden py-20 md:py-24">
      <Wrap className="grid grid-cols-1 items-center gap-11 md:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="mb-6 text-[14px] text-muted">Built by a urology resident, for the OR</p>
          <h1 className="mb-6 font-display text-[clamp(38px,6vw,62px)] font-medium leading-[1.04]">
            The clinical brain for <span className="text-violet-soft">urology</span>, in your coat pocket
          </h1>
          <p className="mb-8 max-w-[520px] text-[18px] text-muted">
            Validated calculators, AUA/EAU guideline summaries, surveillance schedules, an operative
            reference and a bilingual consent generator. Every clinical value tied to its primary
            source. Built for residents and consultants across the Gulf and beyond, and it works
            offline in the basement OR.
          </p>
          <div className="flex flex-wrap gap-3.5">
            <button
              type="button"
              onClick={() => onNavigate('calculators')}
              className="rounded-[12px] bg-violet-deep px-6 py-3.5 text-[15px] font-medium text-white transition hover:bg-violet-press"
            >
              Open the calculators
            </button>
            <button
              type="button"
              onClick={() => onNavigate('guidelines')}
              className="rounded-[12px] border border-line bg-navy-2 px-6 py-3.5 text-[15px] font-medium text-ink transition hover:border-violet hover:text-violet-soft"
            >
              Browse guidelines
            </button>
          </div>
          <div className="mt-9 flex flex-wrap gap-6 text-[13px] text-muted-2">
            <div><b className="font-medium text-ink">19</b> validated calculators</div>
            <div><b className="font-medium text-ink">27</b> guideline summaries</div>
            <div><b className="font-medium text-ink">EAU · AUA</b> sourced</div>
          </div>
        </div>

        <PhoneMockup />
      </Wrap>
    </header>
  );
}

function PhoneMockup() {
  return (
    <div className="relative h-[600px] w-[300px] justify-self-center rounded-[42px] bg-navy-2 p-3 shadow-device">
      <div className="absolute left-1/2 top-5 z-10 h-[28px] w-[108px] -translate-x-1/2 rounded-[14px] bg-[#06101f]" />
      <div className="relative h-full w-full overflow-hidden rounded-[32px] border border-[#1c2d48] bg-navy">
        <div className="border-b border-line px-5 pb-3 pt-9">
          <div className="font-display text-[16px] font-medium">Command Center</div>
          <div className="text-[12px] text-muted-2">PGY-2 · Jeddah · 14 OR cases logged</div>
        </div>
        <div className="flex flex-col gap-2.5 p-3.5">
          <div className="grid grid-cols-2 gap-2.5">
            <MiniStat label="CAPRA" value="4" tone="text-violet-soft" />
            <MiniStat label="STONE" value="9" tone="text-crimson" />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <MiniStat label="R.E.N.A.L." value="10p" tone="text-teal" />
            <MiniStat label="IPSS" value="18" tone="text-amber" />
          </div>
          <div className="rounded-[14px] border border-violet/[0.35] bg-navy-2 p-3">
            <div className="flex items-center gap-1.5 text-[12px] font-medium text-violet-soft">Guidelines · AUA / EAU</div>
            <div className="mt-1.5 text-[12px] text-ink">High-risk NMIBC: cystoscopy + cytology every 3 months</div>
            <div className="mt-1.5 text-[12px] text-muted-2">AUA NMIBC guideline · verified link</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-[14px] border border-line bg-navy-2 p-3">
      <div className="text-[12px] text-muted-2">{label}</div>
      <div className={`mt-1 font-mono text-[20px] font-medium ${tone}`}>{value}</div>
    </div>
  );
}
