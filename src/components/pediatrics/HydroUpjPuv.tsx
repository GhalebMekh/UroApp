import { useState } from 'react';
import { CalcCard } from '@/components/calculators/primitives';
import { CitationNote } from '@/components/CitationNote';
import { CITATIONS, type Citation } from '@/data/citations';
import { cn } from '@/lib/cn';

interface Topic {
  id: string;
  label: string;
  points: string[];
  citation: Citation;
}

// Summarised from Campbell ch 22, 33, 42 and 11 — our wording.
const TOPICS: Topic[] = [
  {
    id: 'upjo',
    label: 'UPJ obstruction',
    points: [
      'Most cases resolve without surgery — only about a third ever need it — and severe dilation alone is not an indication.',
      'Early: ultrasound in the neonatal period for P2/P3; consider prophylaxis for P3; VCUG to exclude VUR (up to 40% with UPJO) and check the posterior urethra in boys.',
      'MAG3 for persistent P3; P2 or APD under 20 mm on serial scans suggests preserved function.',
      'Operate for: rising APD on serial ultrasound, differential function under 40% or falling, a delayed drainage curve or retention on upright imaging, breakthrough infection on prophylaxis, or pain.',
      'Dismembered pyeloplasty succeeds in 90–100%; open is usual in infants, laparoscopic or robotic more often after about 2 years.',
    ],
    citation: CITATIONS.cwwUreterSurgery,
  },
  {
    id: 'megaureter',
    label: 'Megaureter',
    points: [
      'Most resolve without surgery. After birth: renal and bladder ultrasound, start prophylaxis, and VCUG to classify (refluxing, obstructed or both).',
      'Surgery for function under 40%, febrile UTI or pain.',
      'Under 1 year, prefer a temporising procedure (e.g. cutaneous ureterostomy or refluxing reimplant) and defer definitive reimplantation until after 1 year.',
      'Follow into adulthood: late silent deterioration can occur (British Association of Paediatric Urologists consensus).',
    ],
    citation: CITATIONS.cwwPerinatal,
  },
  {
    id: 'puv',
    label: 'Posterior urethral valves',
    points: [
      'Suspect antenatally with a thick-walled dilated bladder, bilateral hydroureteronephrosis and oligohydramnios; postnatally confirm on ultrasound and VCUG (dilated, elongated posterior urethra).',
      'At birth: decompress the bladder and start prophylaxis. A blunt 5 Fr catheter shaped with an anterior curve (or guided with a finger in the rectum) passes the valves; if it won’t, ultrasound-guided suprapubic drainage (Campbell ch 11).',
      'Watch for post-obstructive diuresis and the concentrating defect; oliguria after decompression can follow the thick bladder wall (antimuscarinics may help).',
      'Avoid an immediate VCUG in a baby with renal insufficiency who needs the catheter — it may be hard to replace.',
      'Track the nadir creatinine (1 month, 6 months, 1 year), an effective marker of long-term kidney function. About a third eventually need renal replacement.',
      'Treatment: cystoscopic valve ablation first; vesicostomy only when ablation isn’t possible. Encourage circumcision, especially after a UTI.',
      'Not all valves are found antenatally: consider them in boys with recurrent UTI, voiding symptoms, overflow incontinence or renal impairment.',
    ],
    citation: CITATIONS.cwwPuv,
  },
  {
    id: 'vur',
    label: 'VUR screening',
    points: [
      'VUR is found in up to 31% of infants screened after antenatal dilation, and the dilation grade predicts it poorly.',
      'Screen by UTI risk: girls with high-grade dilation and boys with an intact foreskin are at higher risk; circumcised boys with low-grade dilation rarely need a VCUG.',
      'Discuss natural history and the costs and benefits of prophylaxis with the family.',
    ],
    citation: CITATIONS.cwwPerinatal,
  },
];

/** Antenatal hydronephrosis follow-on: UPJO, megaureter, valves and VUR screening. */
export function HydroUpjPuv() {
  const [open, setOpen] = useState(TOPICS[0]!.id);
  const topic = TOPICS.find((t) => t.id === open) ?? TOPICS[0]!;

  return (
    <CalcCard
      title="Antenatal hydronephrosis → UPJO, megaureter, valves"
      subtitle="What to do after the UTD group is known"
      citation={CITATIONS.cwwPerinatal}
    >
      <div className="mb-4 flex flex-wrap gap-2">
        {TOPICS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setOpen(t.id)}
            className={cn(
              'min-h-[44px] flex-1 rounded-[10px] border px-3 py-2 text-[12.5px] transition-colors',
              t.id === open
                ? 'border-violet bg-violet/[0.18] font-semibold text-violet-soft'
                : 'border-line bg-navy text-muted hover:border-violet',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <ul className="space-y-2">
        {topic.points.map((p) => (
          <li key={p} className="rounded-[10px] border border-line bg-navy px-3 py-2.5 text-[13px] text-muted">
            {p}
          </li>
        ))}
      </ul>
      {topic.citation !== CITATIONS.cwwPerinatal && <CitationNote citation={topic.citation} />}
    </CalcCard>
  );
}
