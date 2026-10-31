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
  /** Further headed lists after the first 30 minutes, e.g. what to order. */
  sections?: { title: string; items: string[] }[];
  citation: Citation;
  /** A second source for the detail in sections, shown under the main one. */
  alsoSee?: string;
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
  {
    id: 'gu-trauma',
    name: 'Genitourinary trauma',
    oneLiner:
      'Blunt or penetrating injury to the kidney, ureter, bladder or urethra. The kidney is the commonest genitourinary organ injured; grade the injury with AAST below.',
    clock:
      'Haemodynamic status sets the pace — instability despite active resuscitation means theatre, not the CT scanner or angiography suite.',
    immediate: [
      'Resuscitate with the trauma team; the genitourinary injury is rarely the one that kills first.',
      'Image the stable patient: IV contrast-enhanced CT with a delayed excretory phase whenever renal injury is known or suspected — the delayed phase is what shows urinary extravasation.',
      'Blood at the meatus after pelvic trauma? Retrograde urethrogram BEFORE any catheter. Never pass a catheter blindly.',
      'Gross haematuria with a pelvic fracture? Retrograde cystography (plain film or CT) — bladder injury is present in about 29% of these patients.',
      'Establish prompt urinary drainage in pelvic-fracture urethral injury — suprapubic if the urethra cannot be safely catheterised.',
      'Grade the injury with AAST (below), then decide: unstable or an expanding/pulsatile haematoma means exploration; a stable renal injury with urinary extravasation alone can usually be observed.',
      'Suspected renal pelvis or proximal ureteric avulsion needs prompt intervention, not observation.',
    ],
    redFlags: [
      'Do not catheterise before a RUG if blood is at the meatus',
      'Haematuria is unreliable in ureteric injury and is often absent',
      'Unstable despite resuscitation → theatre, not angiography',
      'Re-image AAST Grade IV–V, or any patient who develops fever, worsening flank pain or ongoing blood loss',
    ],
    citation: {
      authors: 'AUA (Morey et al.)',
      journal: 'J Urol',
      year: 2014,
      doi: '10.1016/j.juro.2014.05.004',
      url: 'https://www.auanet.org/guidelines-and-quality/guidelines/urotrauma-guideline',
      label: 'AUA Urotrauma guideline — 192:327-335 (amended 2017, 2020)',
    },
  },
  {
    // Detail mirrors procedures.ts → 'bladder-ureteral-trauma' (same sources).
    id: 'iatrogenic-bladder-ureter',
    name: 'Bladder / ureteric injury in surgery',
    oneLiner:
      'Injury to the bladder or ureter during an operation (pelvic, gynaecological, colorectal or endoscopic), recognised on the table or presenting afterwards.',
    clock:
      'Best repaired when found — at the same operation, or within 1 week of surgery. Later than that, drain first and reconstruct at 6 weeks or more.',
    immediate: [
      'Recognised in theatre: ask the anaesthetist about stability. Unstable, uncontrolled bleeding or a major colon injury → damage control, not a formal repair (step 6).',
      'Check both ureteric orifices for clear efflux — IV indigo carmine or a retrograde ureteric catheter. Avoid IV methylene blue in pregnancy, with SSRIs, SNRIs or MAOIs, and in G6PD deficiency.',
      'Bladder tear: inspect it from inside, including the bladder neck and orifices; debride conservatively and close in two layers with absorbable suture; leave a large-bore urethral catheter.',
      'Ureter, upper or mid: keep a wide cuff of adventitia, debride until the edges bleed, then a spatulated, tension-free, watertight end-to-end repair over a stent, with a drain.',
      'Ureter, distal: reimplant into the bladder (long, non-tunnelled, stented), adding a psoas hitch or a Boari flap for a longer defect.',
      'Damage control: tie the proximal ureter with a long silk or polypropylene tie and place a nephrostomy once stable — or bring a single-J stent or 5 Fr feeding tube out to the skin — and reconstruct later.',
    ],
    sections: [
      {
        title: 'Suspected after surgery — what to order',
        items: [
          'Bladder: retrograde cystogram (plain film with a drainage film, or CT cystogram with contrast diluted to 2–4%), filled to discomfort or 350 mL — 250 mL gives false negatives. Clamping the catheter after IV contrast is not adequate.',
          'Ureter: CT urography with delayed images (about 10 minutes after contrast). Look for extravasation, a delayed nephrogram, hydronephrosis, no contrast in the distal ureter, or a urinoma; trace both ureters along their whole length.',
          'Renal function, electrolytes and a blood gas — absorbed urine causes azotaemia and acidosis.',
          'Blood at the meatus, or a catheter that will not pass: retrograde urethrogram before another attempt.',
        ],
      },
      {
        title: 'Found after surgery — what to do',
        items: [
          'Extraperitoneal bladder leak: large-bore (22 Fr) urethral catheter drainage; cystogram before removing it at 14 days, and keep draining if it still leaks.',
          'Intraperitoneal bladder leak: operative repair; cystogram 7–10 days afterwards.',
          'Ureteric injury: retrograde ureterogram and try to pass a stent; if that fails, nephrostomy with an antegrade stent for 6 weeks (83–88% success).',
          'Found within 1 week of surgery: repair it. Found later: stent or nephrostomy now, definitive repair at 6 weeks or later.',
          'Antibiotics: extraperitoneal bladder injury for at least 1 week; intraperitoneal for 3 days around the repair.',
          'After a ureteric repair: diuretic renogram or ultrasound at 4–12 weeks and at 1 year — late narrowing is often silent.',
        ],
      },
    ],
    redFlags: [
      'Haematuria is absent in 25–45% of ureteric injuries',
      'Fever, raised white cells or peritoneal irritation after pelvic surgery → CT',
      'Low urine output, ileus, urinary ascites or a rising creatinine → missed bladder injury',
      'Check the bladder neck and both orifices before closing',
    ],
    citation: {
      authors: 'AUA (Morey et al.)',
      journal: 'J Urol',
      year: 2014,
      doi: '10.1016/j.juro.2014.05.004',
      url: 'https://www.auanet.org/guidelines-and-quality/guidelines/urotrauma-guideline',
      label: 'AUA Urotrauma guideline — 192:327-335 (amended 2017, 2020)',
    },
    alsoSee:
      'Operative detail: Campbell-Walsh-Wein Urology 12th ed, ch 133 (Genital and Lower Urinary Tract Trauma) and ch 90 (Upper Urinary Tract Trauma). Full steps in Procedures → Bladder & ureteral injury repair.',
  },
];
