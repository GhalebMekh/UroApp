/**
 * On-call urological emergencies — "what to do in the next 30 minutes".
 * LICENSING/SAFETY (CLAUDE.md): each pathway is SUMMARISED in our own words
 * from the cited guideline, never reproduced verbatim, and is decision-support
 * for a clinician — not a substitute for senior/on-call judgement. Verify doses
 * and steps against the primary source and local protocol.
 */
import type { Citation } from './citations';

export interface Emergency {
  id: string;
  name: string;
  oneLiner: string;
  /** Time sensitivity headline, e.g. "Salvage falls sharply after ~6 h". */
  clock: string;
  /** Ordered immediate actions. */
  immediate: string[];
  /** Things that must not be missed. */
  redFlags: string[];
  citation: Citation;
}

const eau = (chapter: string, slug: string): Citation => ({
  authors: 'EAU Guidelines',
  journal: chapter,
  year: 2025,
  url: `https://uroweb.org/guidelines/${slug}`,
  label: 'EAU guideline',
});

export const EMERGENCIES: Emergency[] = [
  {
    id: 'torsion',
    name: 'Testicular torsion',
    oneLiner: 'Sudden severe unilateral scrotal pain ± nausea/vomiting; a high-riding testis with an absent cremasteric reflex.',
    clock: 'Time-critical — salvage falls sharply after ~6 h from onset.',
    immediate: [
      'Assess clinically and score with TWIST (below); in a high-risk boy do NOT delay exploration for ultrasound.',
      'Keep nil by mouth; give analgesia and an antiemetic; take consent for scrotal exploration ± bilateral orchidopexy / orchidectomy.',
      'Call theatre and the senior on-call now — aim to explore within 6 h of onset.',
      'If theatre will be delayed, attempt manual detorsion (commonly lateral-to-medial, "opening a book") as a temporising measure; relief of pain and return of flow suggest success.',
      'Fix both testes — the bell-clapper anomaly is usually bilateral.',
    ],
    redFlags: ['Intermittent prior episodes', 'Neonatal torsion (may be missed)', 'Do not be reassured by a normal urinalysis'],
    citation: eau('Paediatric urology (acute scrotum)', 'paediatric-urology'),
  },
  {
    id: 'priapism',
    name: 'Ischaemic priapism',
    oneLiner: 'Painful, rigid erection > 4 h with little or no arterial inflow — a penile compartment syndrome.',
    clock: 'Emergency — begin within 4–6 h; smooth-muscle damage becomes irreversible with time.',
    immediate: [
      'Confirm it is ischaemic: rigid, painful corpora, dark aspirate, low-flow on a cavernosal blood gas — versus a soft, non-painful high-flow priapism.',
      'Provide a penile block / local anaesthesia.',
      'Aspirate the corpus cavernosum ± saline irrigation until fresh red blood returns.',
      'If it persists, give intracavernosal phenylephrine in small aliquots with blood-pressure and pulse monitoring.',
      'If sickle-cell / haematological cause, treat systemically in parallel and involve haematology.',
      'Escalate to a surgical shunt if refractory.',
    ],
    redFlags: ['Recurrent (stuttering) priapism', 'Sickle-cell disease', 'Recent intracavernosal injection therapy'],
    citation: eau('Sexual & reproductive health (priapism)', 'sexual-and-reproductive-health'),
  },
  {
    id: 'fourniers',
    name: "Fournier's gangrene",
    oneLiner: 'Necrotising fasciitis of the perineum/genitalia — pain out of proportion, crepitus, systemic toxicity; rapidly progressive, high mortality.',
    clock: 'Surgical emergency — debridement within hours; do not delay for imaging.',
    immediate: [
      'Resuscitate (sepsis pathway): IV fluids, blood cultures, lactate, monitor urine output.',
      'Start broad-spectrum antibiotics immediately, covering Gram-positive, Gram-negative and anaerobes.',
      'Call theatre and the senior on-call — urgent, wide surgical debridement is the definitive treatment.',
      'Involve general/plastic surgery and ICU; consider urinary/faecal diversion.',
    ],
    redFlags: ['Diabetes / immunosuppression', 'Rapidly spreading erythema or crepitus', 'Disproportionate pain then anaesthesia of the skin'],
    citation: eau('Urological infections', 'urological-infections'),
  },
  {
    id: 'obstructed-kidney',
    name: 'Obstructed, infected kidney',
    oneLiner: 'Obstructing stone plus fever/UTI (or anuria) — pus under pressure above the obstruction.',
    clock: 'Emergency — decompress urgently; sepsis can escalate rapidly.',
    immediate: [
      'Resuscitate; send blood and urine cultures; start antibiotics per local policy.',
      'Arrange urgent decompression — retrograde ureteric (JJ) stent OR percutaneous nephrostomy.',
      'Do NOT attempt definitive stone treatment (e.g. ureteroscopy/lithotripsy) in the acutely infected, obstructed system.',
      'Discuss with on-call urology and interventional radiology; expedite to theatre/IR.',
      'Treat the stone electively once the infection has settled.',
    ],
    redFlags: ['Single/transplant kidney', 'Anuria', 'Signs of septic shock'],
    citation: eau('Urolithiasis', 'urolithiasis'),
  },
];
