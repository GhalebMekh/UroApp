import { useState, type ReactNode } from 'react';
import { NumberField } from '@/components/calculators/primitives';
import { CitationNote } from '@/components/CitationNote';
import { CITATIONS } from '@/data/citations';
import { cn } from '@/lib/cn';
import {
  AKI_URINE_THRESHOLD,
  CCHD_PASS,
  PRETERM_SPO2_TARGET,
  TEMP_TARGET,
  bloodPressureRow,
  bpFlag,
  cchdScreen,
  flagValue,
  pmaWeeks,
  pretermHeartRate,
  temperatureStatus,
  urineOutputStatus,
  type Centiles,
} from '@/lib/neonatalVitals';

type Tone = 'ok' | 'warn' | 'alert' | 'none';
const TONE: Record<Tone, string> = {
  ok: 'text-teal',
  warn: 'text-amber',
  alert: 'text-crimson',
  none: 'text-muted',
};

const num = (s: string) => (s.trim() === '' ? null : Number(s));

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[16px] border border-line bg-navy-2 p-6">
      <h3 className="mb-4 font-display text-[18px] font-medium">{title}</h3>
      {children}
    </section>
  );
}

/** A reference range as a readout: label on the left, mono figures on the right. */
function Range({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line py-2.5 last:border-b-0">
      <span className="text-[13px] text-muted">{label}</span>
      <span className="text-right font-mono text-[15px] text-ink">{value}</span>
    </div>
  );
}

function Verdict({ tone, children }: { tone: Tone; children: ReactNode }) {
  return <p className={cn('-mt-1.5 mb-1 text-[13px]', TONE[tone])}>{children}</p>;
}

function Note({ children }: { children: ReactNode }) {
  return <p className="mt-3 text-[12px] leading-relaxed text-muted-2">{children}</p>;
}

/** Neonatal vital signs by gestational and postnatal age, each range with its source. */
export function NeonatalVitals() {
  const [ga, setGa] = useState('');
  const [days, setDays] = useState('');
  const [hr, setHr] = useState('');
  const [sbp, setSbp] = useState('');
  const [dbp, setDbp] = useState('');
  const [uo, setUo] = useState('');
  const [temp, setTemp] = useState('');
  const [spo2, setSpo2] = useState('');
  const [hand, setHand] = useState('');
  const [foot, setFoot] = useState('');

  const gaN = num(ga);
  const daysN = num(days);
  const pma = gaN !== null && daysN !== null ? pmaWeeks(gaN, daysN) : null;
  const preterm = gaN !== null && gaN < 37;

  return (
    <div className="space-y-4">
      <Card title="Age">
        <NumberField label="Gestational age at birth" value={ga} onChange={setGa} unit="weeks" step="1" min="22" placeholder="e.g. 30" />
        <NumberField label="Postnatal age" value={days} onChange={setDays} unit="days" step="1" min="0" placeholder="e.g. 10" />
        {pma !== null ? (
          <Range label="Postmenstrual age" value={`${pma} wk`} />
        ) : (
          <p className="text-[13px] text-muted-2">Enter both ages to see the ranges. GA 22–44 weeks.</p>
        )}
      </Card>

      {pma !== null && gaN !== null && daysN !== null && (
        <>
          <HeartRate ga={gaN} pma={pma} value={hr} onChange={setHr} />
          <BloodPressure pma={pma} days={daysN} sbp={sbp} dbp={dbp} onSbp={setSbp} onDbp={setDbp} />

          <Card title="Urine output">
            <Range label="AKI by urine output, days 2–7" value={`≤${AKI_URINE_THRESHOLD} mL/kg/h`} />
            <NumberField label="Measured, 24-hour average" value={uo} onChange={setUo} unit="mL/kg/h" step="0.1" min="0" />
            {num(uo) !== null && <UrineVerdict value={num(uo)!} days={daysN} />}
            <Note>Averaged over 24 hours. Day 1 is the day of birth.</Note>
            <CitationNote citation={CITATIONS.awaken2017} />
          </Card>

          <Card title="Temperature">
            <Range label="Target" value={`${TEMP_TARGET.low}–${TEMP_TARGET.high} °C`} />
            <Range label="Mild hypothermia" value="36.0–36.4 °C" />
            <Range label="Moderate hypothermia" value="32.0–35.9 °C" />
            <Range label="Severe hypothermia" value="<32 °C" />
            <div className="mt-3" />
            <NumberField label="Measured" value={temp} onChange={setTemp} unit="°C" step="0.1" />
            {num(temp) !== null && <TempVerdict value={num(temp)!} />}
            <CitationNote citation={CITATIONS.ercNewborn2025} />
            <CitationNote citation={CITATIONS.whoHypothermiaGrades} />
          </Card>

          <Card title="Oxygen saturation">
            {preterm ? (
              <>
                <Range label="Preterm on oxygen, target" value={`${PRETERM_SPO2_TARGET.low}–${PRETERM_SPO2_TARGET.high}%`} />
                <Range label="Alarm limits" value="89% and 95%" />
                <div className="mt-3" />
                <NumberField label="Measured" value={spo2} onChange={setSpo2} unit="%" step="1" min="0" />
                {num(spo2) !== null && <Spo2Verdict value={num(spo2)!} />}
                <Note>For preterm babies receiving supplemental oxygen.</Note>
                <CitationNote citation={CITATIONS.europeanRds2022} />
              </>
            ) : (
              <>
                <Range label="CCHD screen, to pass" value={`≥${CCHD_PASS}% hand and foot`} />
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <NumberField label="Right hand" value={hand} onChange={setHand} unit="%" step="1" min="0" />
                  <NumberField label="Foot" value={foot} onChange={setFoot} unit="%" step="1" min="0" />
                </div>
                {num(hand) !== null && num(foot) !== null && (
                  cchdScreen(num(hand)!, num(foot)!) === 'pass' ? (
                    <Verdict tone="ok">Passes: at least {CCHD_PASS}% in both limbs.</Verdict>
                  ) : (
                    <Verdict tone="warn">Does not pass on this reading. The 2020 algorithm allows one repeat screen.</Verdict>
                  )
                )}
                <Note>Pulse oximetry screening for critical congenital heart disease in newborns.</Note>
                <CitationNote citation={CITATIONS.cchdScreen2020} />
              </>
            )}
          </Card>
        </>
      )}
    </div>
  );
}

function HeartRate({ ga, pma, value, onChange }: { ga: number; pma: number; value: string; onChange: (v: string) => void }) {
  const range = pretermHeartRate(ga, pma);
  const v = num(value);

  if (range) {
    const f = v !== null ? flagValue(v, range.p5, range.p95) : null;
    return (
      <Card title="Heart rate">
        <Range label="5th–95th centile" value={`${range.p5}–${range.p95} /min`} />
        <div className="mt-3" />
        <NumberField label="Measured" value={value} onChange={onChange} unit="/min" step="1" min="0" />
        {f && (
          <Verdict tone={f === 'within' ? 'ok' : 'warn'}>
            {f === 'within' ? 'Within the 5th–95th centile.' : f === 'below' ? 'Below the 5th centile.' : 'Above the 95th centile.'}
          </Verdict>
        )}
        <Note>
          From 1,703 NICU babies born at 23–34 weeks, by GA and PMA up to 38 weeks. The study had no exclusion
          criteria, so these are NICU ranges, not healthy-baby norms.
        </Note>
        <CitationNote citation={CITATIONS.alonzoPretermHr2018} />
      </Card>
    );
  }

  return (
    <Card title="Heart rate and breathing rate">
      <Range label="Median heart rate at birth" value="127 /min" />
      <Range label="Median heart rate peak, about 1 month" value="145 /min" />
      <Range label="Median breathing rate at birth" value="44 /min" />
      <Note>
        {ga < 35
          ? 'The preterm centile table stops at 38 weeks PMA. '
          : 'No verified centile range for term babies in the app yet. '}
        These medians come from healthy children; no out-of-range flag is shown.
      </Note>
      <CitationNote citation={CITATIONS.flemingVitals2011} />
    </Card>
  );
}

function BloodPressure({
  pma,
  days,
  sbp,
  dbp,
  onSbp,
  onDbp,
}: {
  pma: number;
  days: number;
  sbp: string;
  dbp: string;
  onSbp: (v: string) => void;
  onDbp: (v: string) => void;
}) {
  const lookup = bloodPressureRow(pma, days);

  if (lookup.kind !== 'row') {
    return (
      <Card title="Blood pressure">
        <p className="text-[13px] text-muted">
          {lookup.kind === 'too-young'
            ? 'The centile table applies from 2 weeks of age. In the first 2 weeks blood pressure rises quickly, and the common rule that mean pressure should exceed gestational age in weeks has little evidence behind it.'
            : 'The centile table covers 26 to 44 weeks PMA.'}
        </p>
        <CitationNote citation={CITATIONS.dionneInfantBp2012} />
        {lookup.kind === 'too-young' && <CitationNote citation={CITATIONS.doreNeonatalBp2024} />}
      </Card>
    );
  }

  const { row } = lookup;
  const fmt = (c: Centiles) => `${c.p50} · ${c.p95} · ${c.p99}`;
  const s = num(sbp);
  const d = num(dbp);

  return (
    <Card title="Blood pressure">
      <p className="mb-1 text-[12px] text-muted-2">
        {row.pma === pma ? `${row.pma} weeks PMA` : `${row.pma} weeks PMA row (the table steps every 2 weeks)`}. Centiles 50th · 95th · 99th, mmHg
      </p>
      <Range label="Systolic" value={fmt(row.sbp)} />
      <Range label="Diastolic" value={fmt(row.dbp)} />
      <Range label="Mean" value={fmt(row.map)} />
      <div className="mt-3 grid grid-cols-2 gap-3">
        <NumberField label="Systolic" value={sbp} onChange={onSbp} unit="mmHg" step="1" min="0" />
        <NumberField label="Diastolic" value={dbp} onChange={onDbp} unit="mmHg" step="1" min="0" />
      </div>
      {s !== null && <BpVerdict label="Systolic" value={s} centiles={row.sbp} />}
      {d !== null && <BpVerdict label="Diastolic" value={d} centiles={row.dbp} />}
      <Note>For babies 2 weeks of age or older.</Note>
      <CitationNote citation={CITATIONS.dionneInfantBp2012} />
    </Card>
  );
}

function BpVerdict({ label, value, centiles }: { label: string; value: number; centiles: Centiles }) {
  const f = bpFlag(value, centiles);
  if (f === 'normal') return <Verdict tone="ok">{label} at or below the 95th centile.</Verdict>;
  if (f === 'above-95') return <Verdict tone="warn">{label} above the 95th centile.</Verdict>;
  return <Verdict tone="alert">{label} above the 99th centile.</Verdict>;
}

function UrineVerdict({ value, days }: { value: number; days: number }) {
  const s = urineOutputStatus(value, days);
  if (s === 'day-1') return <Verdict tone="none">The urine output criterion applies from day 2 to day 7.</Verdict>;
  if (s === 'after-day-7') return <Verdict tone="none">After day 7, outside the window this criterion was defined for.</Verdict>;
  if (s === 'aki') return <Verdict tone="alert">Meets the urine output criterion for AKI.</Verdict>;
  return <Verdict tone="ok">Above the AKI threshold.</Verdict>;
}

function TempVerdict({ value }: { value: number }) {
  const s = temperatureStatus(value);
  if (s === 'normal') return <Verdict tone="ok">Within the target range.</Verdict>;
  if (s === 'mild') return <Verdict tone="warn">Mild hypothermia.</Verdict>;
  if (s === 'moderate') return <Verdict tone="alert">Moderate hypothermia.</Verdict>;
  if (s === 'severe') return <Verdict tone="alert">Severe hypothermia.</Verdict>;
  return <Verdict tone="warn">Above the target range.</Verdict>;
}

function Spo2Verdict({ value }: { value: number }) {
  const f = flagValue(value, PRETERM_SPO2_TARGET.low, PRETERM_SPO2_TARGET.high);
  if (f === 'within') return <Verdict tone="ok">Within the target range.</Verdict>;
  return <Verdict tone="warn">{f === 'below' ? 'Below' : 'Above'} the target range.</Verdict>;
}
