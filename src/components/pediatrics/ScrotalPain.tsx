import { useState } from 'react';
import { CalcCard, NumberField, ResultRow } from '@/components/calculators/primitives';
import { CitationNote } from '@/components/CitationNote';
import { CITATIONS } from '@/data/citations';
import { torsionRiskByHours } from '@/lib/scrotalPain';

interface Cause {
  name: string;
  share: string;
  points: string[];
  plan: string;
  urgent?: boolean;
}

// Summarised from Campbell ch 44 (Palmer & Palmer) — our wording.
const CAUSES: Cause[] = [
  {
    name: 'Spermatic cord torsion',
    share: '20–30% of acute scrota (outside the newborn period)',
    points: [
      'Peak 12–16 years; sudden severe pain, often with nausea or vomiting (10–60%).',
      'High-riding, horizontal testis; cremasteric reflex usually absent — though present in up to 10% of proven torsion.',
      'Doppler: absent or reduced flow, heterogeneous parenchyma, “snail sign” of the twisted cord.',
      'Earlier self-resolving episodes precede torsion in 30–50% (intermittent torsion).',
    ],
    plan: 'Emergency exploration — do not delay surgery for imaging when suspicion is high. Untwist, assess viability, fix the other side with non-absorbable suture.',
    urgent: true,
  },
  {
    name: 'Torsion of an appendage',
    share: '40–60% — the commonest cause before puberty',
    points: [
      'Peak 7–12 years; pain sudden or gradual, often milder.',
      'Tender nodule at the upper pole; “blue dot” through thin skin in 0–52% across series; cremasteric reflexes symmetrical.',
      'Doppler: avascular nodule with surrounding hyperaemia.',
    ],
    plan: 'Self-limiting: rest, ice packs, anti-inflammatories. Explore only if cord torsion can’t be excluded, or for prolonged or recurrent pain.',
  },
  {
    name: 'Epididymitis',
    share: '5–15% — peaks in infancy and at puberty',
    points: [
      'More gradual onset; cremasteric reflex should be intact.',
      'Pyuria or bacteriuria in 20–40%; Doppler shows increased epididymal flow.',
    ],
    plan: 'Ice, anti-inflammatories, rest. Antibiotics with gram-negative cover if pyuria; consider STI treatment in adolescents. A prepubertal boy with a positive culture needs renal ultrasound and VCUG.',
  },
];

/** Acute scrotal pain in children: torsion vs appendage vs epididymitis, and torsion-time risk. */
export function ScrotalPain() {
  const [hours, setHours] = useState('');
  const risk = hours === '' ? null : torsionRiskByHours(Number.parseFloat(hours));

  return (
    <CalcCard
      title="Scrotal pain in children"
      subtitle="Cord torsion, appendage torsion or epididymitis — and what the hours mean"
      citation={CITATIONS.cwwExtGenitalia}
    >
      <div className="space-y-2.5">
        {CAUSES.map((c) => (
          <article key={c.name} className="rounded-[14px] border border-line bg-navy p-4">
            <h4 className={`text-[14.5px] font-semibold ${c.urgent ? 'text-crimson' : 'text-ink'}`}>{c.name}</h4>
            <p className="mb-2 text-[12px] text-muted-2">{c.share}</p>
            <ul className="mb-2 list-disc space-y-1 pl-5 text-[13px] text-muted">
              {c.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <p className="text-[13px] text-ink">{c.plan}</p>
          </article>
        ))}
      </div>

      <div className="mt-5 border-t border-line pt-4">
        <h4 className="mb-2 text-[14px] font-semibold">If this is cord torsion</h4>
        <NumberField label="Hours since the pain began" value={hours} onChange={setHours} unit="h" min="0" />
        {risk && (
          <ResultRow
            score={`${risk.orchiectomyPct}%`}
            band={risk.band}
            caption={`Pooled risk of orchiectomy at ${risk.window} (1140 patients). If the testis is kept, later atrophy: ${risk.atrophy}.`}
          />
        )}
        <CitationNote citation={CITATIONS.visserHeyns2003} />
      </div>

      <p className="mt-3 rounded-[10px] border border-line bg-navy px-3 py-2.5 text-[12px] text-muted-2">
        Newborns: perinatal (extravaginal) torsion is rarely salvageable when found in the nursery,
        but a change after a normal newborn examination needs prompt exploration. Also consider
        Henoch–Schönlein purpura, idiopathic scrotal oedema, hernia and trauma. The TWIST score is in
        On-call.
      </p>
    </CalcCard>
  );
}
