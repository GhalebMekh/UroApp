import { useState } from 'react';
import { HeroChips, PageBody, PageHero } from '@/components/PageHero';
import { TRIALS, TRIAL_AREAS, pubmedUrl, type Trial, type TrialArea, type TrialSource } from '@/data/trials';

function SourceLine({ source }: { source: TrialSource }) {
  return (
    <p className="mt-2 font-mono text-[12px] text-muted-2">
      <span className="text-muted">Source</span> · {source.journal} {source.year} ·{' '}
      <a
        href={pubmedUrl(source.pmid)}
        target="_blank"
        rel="noopener noreferrer"
        className="text-violet underline decoration-violet/40 underline-offset-2 hover:text-violet-soft"
      >
        PMID {source.pmid}
      </a>
    </p>
  );
}

function Field({ label, children }: { label: string; children: string }) {
  return (
    <div className="border-t border-line py-3">
      <div className="mb-1 text-[12px] font-medium text-muted-2">{label}</div>
      <p className="text-[14px] leading-relaxed text-ink">{children}</p>
    </div>
  );
}

function TrialCard({ trial }: { trial: Trial }) {
  return (
    <article className="rounded-[16px] border border-line bg-navy-2 p-5">
      <h3 className="font-display text-[18px] font-medium text-ink">{trial.name}</h3>
      <p className="mt-1 font-mono text-[12px] text-violet-soft">
        {trial.source.journal} {trial.source.year} · {trial.size}
      </p>
      <p className="mt-3 text-[14px] leading-relaxed text-muted">{trial.question}</p>
      <p className="mt-1 mb-3 text-[12px] text-muted-2">{trial.design}</p>

      <Field label="Main result">{trial.result}</Field>
      <Field label="What it changed">{trial.practice}</Field>
      <SourceLine source={trial.source} />

      {trial.later && (
        <div className="mt-4 rounded-[12px] border border-amber/40 bg-navy px-4 py-3">
          <div className="mb-1 text-[12px] font-medium text-amber">Later follow-up</div>
          <p className="text-[13px] leading-relaxed text-ink">{trial.later.text}</p>
          <SourceLine source={trial.later.source} />
        </div>
      )}
    </article>
  );
}

/** Landmark trials digest: the trials that changed urology practice, one card each. */
export function TrialsScreen() {
  const [area, setArea] = useState<TrialArea>('prostate');
  const trials = TRIALS.filter((t) => t.area === area);

  return (
    <>
      <PageHero
        eyebrow="Landmark trials"
        title="Trials that changed practice"
        lede={`${TRIALS.length} trials, each with its question, size, main result and what followed.`}
      >
        <HeroChips value={area} onChange={setArea} items={TRIAL_AREAS.map((a) => ({ id: a.id, label: a.label }))} />
      </PageHero>

      <PageBody>
        <div className="space-y-4">
          {trials.map((t) => (
            <TrialCard key={t.id} trial={t} />
          ))}
        </div>
        <p className="mt-8 text-[12px] text-muted-2">
          Figures come from each trial&apos;s published abstract, summarised in our words. &quot;What it changed&quot;
          restates the authors&apos; conclusion, not a recommendation for a patient. Verify against the primary
          source before clinical use.
        </p>
      </PageBody>
    </>
  );
}
