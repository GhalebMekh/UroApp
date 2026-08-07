import { useState } from 'react';
import { cn } from '@/lib/cn';
import { CITATIONS, type Citation } from '@/data/citations';
import { CitationNote } from '@/components/CitationNote';
import { ResultRow, NumberField, type RiskBand } from './primitives';
import {
  buildSeries,
  freeTotalRatioPct,
  psaDensity,
  psaDoublingTimeMonths,
  psaVelocity,
  type PsaReading,
} from '@/lib/psa';

type Tab = 'density' | 'velocity' | 'doubling' | 'free';

const TABS: { id: Tab; label: string }[] = [
  { id: 'density', label: 'Density' },
  { id: 'velocity', label: 'Velocity' },
  { id: 'doubling', label: 'Doubling time' },
  { id: 'free', label: 'Free %' },
];

/** PSA toolkit — density, velocity, doubling time, free/total ratio. */
export function PsaToolkit() {
  const [tab, setTab] = useState<Tab>('density');
  // Velocity and doubling time share the same dated PSA series.
  const [readings, setReadings] = useState<UiReading[]>([
    { date: '', psa: '' },
    { date: '', psa: '' },
  ]);

  return (
    <section className="rounded-[20px] border border-line bg-navy-2 p-6">
      <h3 className="font-display text-[21px] font-semibold">PSA toolkit</h3>
      <p className="mb-4 text-[13px] text-muted-2">
        PSA density, velocity, doubling time and free/total ratio — daily clinic use
      </p>

      <div className="mb-5 grid grid-cols-4 gap-1.5 rounded-[12px] border border-line bg-navy p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              'min-h-[44px] rounded-[9px] px-2 py-2 text-[12px] font-semibold transition-colors',
              tab === t.id ? 'bg-violet/[0.18] text-violet-soft' : 'text-muted hover:text-ink',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'density' && <DensityTab />}
      {tab === 'velocity' && <VelocityTab readings={readings} setReadings={setReadings} />}
      {tab === 'doubling' && <DoublingTab readings={readings} setReadings={setReadings} />}
      {tab === 'free' && <FreeTab />}
    </section>
  );
}

/** Footer block shared by every tab: EAU context + the primary citation. */
function TabFooter({ context, citation }: { context: string; citation: Citation }) {
  return (
    <>
      <p className="mt-3 rounded-[10px] border border-line bg-navy px-3 py-2.5 text-[12px] text-muted">
        <span className="font-semibold text-violet-soft">EAU context · </span>
        {context}
      </p>
      <CitationNote citation={citation} />
    </>
  );
}

/* ───────── Density ───────── */
function DensityTab() {
  const [psa, setPsa] = useState('');
  const [vol, setVol] = useState('');
  const value = psaDensity(parseFloat(psa), parseFloat(vol));

  let band: RiskBand = 'none';
  let caption = 'Enter total PSA and prostate volume';
  if (value !== null) {
    band = value >= 0.15 ? 'moderate' : 'low';
    caption =
      value >= 0.15
        ? 'Raised suspicion (≥ 0.15 ng/mL/cc)'
        : 'Lower suspicion (< 0.15 ng/mL/cc)';
  }

  return (
    <>
      <NumberField label="Total PSA" value={psa} onChange={setPsa} unit="ng/mL" step="0.1" min="0" placeholder="e.g. 6.5" />
      <NumberField label="Prostate volume (TRUS / MRI)" value={vol} onChange={setVol} unit="cc" step="1" min="0" placeholder="e.g. 45" />
      <ResultRow score={value !== null ? value.toFixed(2) : '—'} band={band} caption={caption} />
      <TabFooter
        context="PSA density (with mpMRI) helps refine biopsy and active-surveillance decisions; ≥ 0.15 ng/mL/cc raises suspicion for clinically significant cancer."
        citation={CITATIONS.psaDensity}
      />
    </>
  );
}

/* ───────── Velocity ───────── */
function VelocityTab({ readings, setReadings }: SeriesProps) {
  const series = buildSeries(toReadings(readings));
  const velocity = series ? psaVelocity(series) : null;

  let band: RiskBand = 'none';
  let caption = 'Enter ≥ 2 dated PSA values';
  if (velocity !== null && Number.isFinite(velocity)) {
    band = velocity >= 0.75 ? 'moderate' : 'low';
    caption =
      velocity >= 0.75
        ? '≥ 0.75 ng/mL/yr — historically concerning'
        : 'Below the 0.75 ng/mL/yr threshold';
  }

  return (
    <>
      <ReadingsEditor readings={readings} setReadings={setReadings} />
      <ResultRow
        score={velocity !== null && Number.isFinite(velocity) ? `${velocity.toFixed(2)}` : '—'}
        band={band}
        caption={velocity !== null && Number.isFinite(velocity) ? `ng/mL/yr · ${caption}` : caption}
      />
      <TabFooter
        context="Current EAU guidance does not recommend PSA velocity as a standalone trigger for biopsy — interpret alongside DRE, MRI and total PSA. Ideally ≥ 3 readings over ≥ 18 months."
        citation={CITATIONS.psaVelocity}
      />
    </>
  );
}

/* ───────── Doubling time ───────── */
function DoublingTab({ readings, setReadings }: SeriesProps) {
  const series = buildSeries(toReadings(readings));
  const months = series ? psaDoublingTimeMonths(series) : null;

  let band: RiskBand = 'none';
  let caption = 'Enter ≥ 2 dated PSA values';
  let score = '—';
  if (series) {
    if (months === null) {
      caption = 'PSA not rising — doubling time undefined';
    } else {
      score = months.toFixed(1);
      band = months <= 12 ? 'high' : 'low';
      caption =
        months <= 12
          ? `months · high-risk kinetics (≤ 12 months)${months <= 3 ? ' — especially aggressive' : ''}`
          : 'months · lower-risk kinetics (> 12 months)';
    }
  }

  return (
    <>
      <ReadingsEditor readings={readings} setReadings={setReadings} />
      <ResultRow score={score} band={band} caption={caption} />
      <TabFooter
        context="After radical prostatectomy, EAU classifies biochemical recurrence as high-risk when PSA doubling time ≤ 12 months (or ISUP grade 4–5)."
        citation={CITATIONS.psaDoublingTime}
      />
    </>
  );
}

/* ───────── Free / total ratio ───────── */
function FreeTab() {
  const [free, setFree] = useState('');
  const [total, setTotal] = useState('');
  const totalNum = parseFloat(total);
  const value = freeTotalRatioPct(parseFloat(free), totalNum);

  let band: RiskBand = 'none';
  let caption = 'Enter free and total PSA';
  if (value !== null) {
    band = value <= 25 ? 'moderate' : 'low';
    caption = value <= 25 ? '≤ 25% — increased cancer risk' : '> 25% — lower risk';
  }

  const outOfRange = value !== null && (totalNum < 4 || totalNum > 10);

  return (
    <>
      <NumberField label="Free PSA" value={free} onChange={setFree} unit="ng/mL" step="0.1" min="0" placeholder="e.g. 1.0" />
      <NumberField label="Total PSA" value={total} onChange={setTotal} unit="ng/mL" step="0.1" min="0" placeholder="e.g. 6.0" />
      <ResultRow score={value !== null ? `${value.toFixed(0)}%` : '—'} band={band} caption={caption} />
      {outOfRange && (
        <p className="mt-2 text-[12px] text-amber">
          Note: the 25% cutoff was validated for total PSA 4–10 ng/mL — interpret with caution outside this range.
        </p>
      )}
      <TabFooter
        context="Validated for total PSA 4–10 ng/mL with a normal DRE; %free ≤ 25% identified ~95% of cancers in the derivation cohort. Less used now where mpMRI is available."
        citation={CITATIONS.psaFreeRatio}
      />
    </>
  );
}

/* ───────── Shared dated-readings editor ───────── */
interface UiReading {
  date: string;
  psa: string;
}
interface SeriesProps {
  readings: UiReading[];
  setReadings: React.Dispatch<React.SetStateAction<UiReading[]>>;
}

function toReadings(rows: UiReading[]): PsaReading[] {
  return rows.map((r) => ({ date: r.date, psa: parseFloat(r.psa) }));
}

function ReadingsEditor({ readings, setReadings }: SeriesProps) {
  function update(i: number, patch: Partial<UiReading>) {
    setReadings((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }
  function add() {
    setReadings((prev) => [...prev, { date: '', psa: '' }]);
  }
  function remove(i: number) {
    setReadings((prev) => (prev.length > 2 ? prev.filter((_, idx) => idx !== i) : prev));
  }

  return (
    <div className="mb-3.5">
      <div className="mb-[7px] text-[13px] font-semibold text-muted">PSA readings over time</div>
      <div className="space-y-2">
        {readings.map((r, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="date"
              value={r.date}
              onChange={(e) => update(i, { date: e.target.value })}
              className="flex-1 rounded-[10px] border border-line bg-navy px-3 py-[10px] text-[13px] text-ink outline-none focus:border-violet"
            />
            <div className="flex w-[120px] items-center gap-1.5 rounded-[10px] border border-line bg-navy px-3 focus-within:border-violet">
              <input
                type="number"
                inputMode="decimal"
                value={r.psa}
                onChange={(e) => update(i, { psa: e.target.value })}
                placeholder="PSA"
                step="0.1"
                min="0"
                className="w-full bg-transparent py-[10px] font-mono text-[13px] text-ink outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <span className="shrink-0 text-[11px] text-muted-2">ng/mL</span>
            </div>
            <button
              type="button"
              onClick={() => remove(i)}
              disabled={readings.length <= 2}
              aria-label="Remove reading"
              className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-[10px] border border-line text-muted-2 transition-colors hover:border-crimson hover:text-crimson disabled:opacity-30 disabled:hover:border-line disabled:hover:text-muted-2"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        className="mt-2 rounded-[10px] border border-line bg-navy px-3 py-2 text-[12px] font-semibold text-violet-soft transition-colors hover:border-violet"
      >
        + Add reading
      </button>
    </div>
  );
}
