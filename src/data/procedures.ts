/**
 * Operative reference — anatomy · steps · complications, per procedure.
 * LICENSING (CLAUDE.md): content is SUMMARISED in our own words from the cited
 * source, never reproduced verbatim. Each procedure carries its citation. Build
 * one procedure at a time from a named source; do not write steps from memory.
 */
import type { Citation } from './citations';
import type { DangerZone } from '@/lib/rehearsal';

const CWW_URL = 'https://search.worldcat.org/search?q=ti%3ACampbell-Walsh-Wein+urology+twelfth+edition';

/** A chapter of Campbell-Walsh-Wein 12th ed (Elsevier, 2021) — the source of the pre-op, danger-zone and post-op sections. */
function cww(chapter: string, authors: string): Citation {
  return {
    authors,
    journal: 'Campbell-Walsh-Wein Urology, 12th ed',
    year: 2021,
    url: CWW_URL,
    label: `${chapter} — Elsevier`,
  };
}

/** Antibiotic prophylaxis wording, from the AUA 2008 best-practice table reproduced in Campbell ch 8. */
const PROPHYLAXIS_NOTE =
  'Give within 60 minutes before incision and stop within 24 hours; re-dose if surgery exceeds 4 hours. Choose by the local antibiogram and check the current AUA statement (Campbell ch 8 tabulates the 2008 version).';

export interface PreOp {
  indications: string[];
  workup: string[];
  /** Positioning, antibiotic prophylaxis, kit. */
  setup: string[];
}

export interface Procedure {
  id: string;
  name: string;
  category: string;
  summary: string;
  anatomy: string[];
  steps: string[];
  complications: string[];
  /** Operative-technique source for the steps/anatomy. */
  citation: Citation;
  /** Optional society guideline anchoring indications/timing/complications. */
  guideline?: Citation;
  /** Before theatre — added procedure by procedure, each from `extrasSource`. */
  preop?: PreOp;
  /** Structures at risk, keyed to a step, with the bail-out. Feeds the danger-zone quiz. */
  dangerZones?: DangerZone[];
  /** After theatre: drains, catheters, stents, discharge, follow-up. */
  postop?: string[];
  /** Source for preop / dangerZones / postop when it differs from `citation`. */
  extrasSource?: Citation;
}

const orchidopexy: Procedure = {
  id: 'orchidopexy',
  name: 'Inguinal orchidopexy',
  category: 'Pediatric',
  summary:
    'Repair of a palpable undescended testis. AUA advises surgery when the testis has not descended by 6 months (corrected age), ideally completed by ~18 months; a scrotal or inguinal approach is acceptable. Goal: straighten the spermatic-vessel course so the testis reaches the scrotum without tension. Does not fully restore spermatogenesis or remove the cancer risk, but enables earlier self-examination.',
  anatomy: [
    'Spermatic vessels — testicular artery/veins arising near the renal vascular pedicle; their short length limits descent.',
    'Vas deferens — must be preserved; runs with the cord to the internal ring.',
    'Inguinal canal with internal and external rings; external oblique aponeurosis overlies the canal.',
    'Cremaster muscle and tunica vaginalis investing the testis; gubernaculum anchoring it distally.',
    'Patent processus vaginalis / indirect hernia sac — commonly accompanies the undescended testis.',
    'Inferior epigastric vessels — medial to the internal ring; divided to gain retroperitoneal length.',
    'Dartos pouch in the scrotum — the destination space for the testis.',
  ],
  steps: [
    'Oblique skin-crease incision over the inguinal ligament.',
    'Open the external oblique fascia along its fibres from external to internal ring.',
    'Mobilise the testis and tunica vaginalis off the gubernaculum and pubic attachments up to the internal ring.',
    'Separate the cremaster from the cord; mobilise the vas; open transversalis fascia to expose the retroperitoneum; ligate/divide the inferior epigastric vessels.',
    'Separate the indirect hernia sac from the cord and perform high ligation.',
    'Continue retroperitoneal mobilisation of the spermatic vessels near their origin to gain length.',
    'Develop a subdartos scrotal pouch; deliver the untwisted cord/testis and anchor the tunica to the dartos with interrupted non-absorbable sutures (avoid torsion/retraction); close in layers.',
  ],
  complications: [
    'Testicular atrophy — the most significant; from spermatic-vessel injury or excessive traction causing venous congestion/ischaemia.',
    'Failure / re-ascent of the testis needing redo orchidopexy (~8% for distal, >25% for intra-abdominal testes).',
    'Wound infection.',
    'Bleeding / scrotal haematoma.',
    'Vas deferens injury (impaired fertility).',
    'Persistent testicular-cancer risk despite repair — counsel on self-examination.',
  ],
  preop: {
    indications: [
      'A palpable undescended testis that has not descended by 6 months of corrected age — operate after 6 months, preferably by 12 months.',
      'Acquired (ascended) testis.',
      'Orchiectomy instead is reserved for a visibly abnormal or atrophic testis, a postpubertal patient, or insufficient vasal length.',
    ],
    workup: [
      'Clinical diagnosis — no ultrasound or MRI before referral.',
      'Bilateral nonpalpable testes or proximal hypospadias: karyotype and hormones first (see Pediatrics → Undescended testis).',
      'Re-examine under anaesthesia to confirm the testis is palpable and find its lowest position.',
    ],
    setup: [
      'General anaesthesia plus local infiltration, an ilioinguinal block or a caudal (the caudal helps for bilateral or combined penile surgery).',
      'Approach: standard inguinal, or a primary scrotal (Bianchi) incision for a low, prescrotal palpable testis.',
      'Antibiotic prophylaxis only if risk factors (clean surgery that does not enter the urinary tract). ' + PROPHYLAXIS_NOTE,
    ],
  },
  dangerZones: [
    {
      step: 1,
      structure: 'Ilioinguinal nerve',
      risk: 'It runs on the cord under the external oblique and is injured when the aponeurosis is opened.',
      bailout: 'Open the external oblique along its fibres from the external ring and keep the nerve in view throughout.',
    },
    {
      step: 2,
      structure: 'Long-looping vas',
      risk: 'The vas can loop down below the testis and be cut with the gubernaculum.',
      bailout: 'Transect the gubernaculum distal to the sac, only after seeing where the vas runs.',
    },
    {
      step: 4,
      structure: 'Vas and spermatic vessels at the hernia sac',
      risk: 'Stripping the sac skeletonises and can injure the vas and vessels.',
      bailout: 'Open the internal spermatic fascia longitudinally to free an intact sac with minimal handling of the cord structures, then ligate it at the internal ring.',
    },
    {
      step: 6,
      structure: 'Testicular blood supply',
      risk: 'A cord under tension or twisted as it is passed to the scrotum causes retraction or atrophy.',
      bailout: 'Gain length (open the transversalis fascia, divide lateral bands, dissect retroperitoneally, move the testis under the epigastric vessels — the Prentiss manoeuvre). Pass it untwisted. If it still will not reach, a two-stage repair is preferable to orchiectomy.',
    },
  ],
  postop: [
    'Follow up for at least 6 months to confirm position and size; in one series atrophy was 1.9% and non-scrotal position 10.3%, and earlier reviews found higher rates for abdominal or peeping testes (24%) than for those beyond the ring (10%).',
    'Long-term follow-up for fertility counselling, cancer risk and self-examination.',
    'If the testis atrophies completely, no further surgery is needed — offer a prosthesis at least 6 months after scrotal surgery or after puberty, through an inguinal approach.',
  ],
  extrasSource: cww('Ch 46, Etiology, Diagnosis, and Management of the Undescended Testis', 'Barthold & Hagerty'),
  citation: {
    authors: 'Dunn et al.',
    journal: 'Oper Tech Gen Surg',
    year: 2004,
    doi: '10.1053/j.optechgensurg.2004.10.005',
    url: 'https://doi.org/10.1053/j.optechgensurg.2004.10.005',
  },
  guideline: {
    authors: 'AUA',
    journal: 'Cryptorchidism Guideline',
    year: 2018,
    url: 'https://www.auanet.org/guidelines-and-quality/guidelines/cryptorchidism-guideline',
    label: 'AUA Cryptorchidism Guideline',
  },
};

const EAU_PAEDIATRIC: Citation = {
  authors: 'EAU',
  journal: 'Paediatric Urology Guideline',
  year: 2025,
  url: 'https://uroweb.org/guidelines/paediatric-urology',
  label: 'EAU Paediatric Urology Guideline',
};

const CWW_EXT_GENITALIA = cww('Ch 44, Management of Abnormalities of the External Genitalia in Boys', 'Palmer & Palmer');

const circumcision: Procedure = {
  id: 'circumcision',
  name: 'Circumcision (child, sleeve technique)',
  category: 'Pediatric',
  summary:
    'Removal of the prepuce. Primary phimosis usually resolves (fewer than 1% of 17-year-olds have a phimotic prepuce) and topical steroid relaxes the ring in 70–80%, so surgery is for persistent or secondary phimosis, BXO, recurrent balanitis or posthitis, UTI, or a family’s choice. Beyond the neonatal period it is done under general anaesthesia with a freehand technique; the sleeve technique is shown.',
  anatomy: [
    'Prepuce — outer penile skin and inner preputial mucosa, held to the glans by physiological adhesions that separate with age.',
    'Frenulum — the usual source of bleeding after circumcision.',
    'Glans, corona and meatus — inspected before any skin is removed, to exclude hypospadias.',
    'Dorsal penile nerves — the target of a dorsal penile nerve block.',
    'Buck fascia — the sleeve is freed from the shaft superficial to it.',
  ],
  steps: [
    'General anaesthesia with a penile block; free the preputial adhesions completely and inspect the meatus and corona.',
    'Mark the outer skin incision circumferentially, and the inner mucosal incision separately.',
    'Incise the outer skin circumferentially.',
    'Incise the inner mucosa circumferentially.',
    'Separate the subcutaneous attachments superficial to Buck fascia and excise the sleeve of skin and mucosa with scissors.',
    'Haemostasis with bipolar diathermy.',
    'Approximate mucosa to skin with 5-0 absorbable sutures.',
  ],
  complications: [
    'Bleeding — the commonest complication (overall complication rate 0.2–5%), usually from the frenulum.',
    'Wound infection (rare).',
    'Too much or too little skin removed: denuded shaft, asymmetry, curvature, torsion or a trapped penis.',
    'Glanular adhesions and skin bridges.',
    'Meatal stenosis — seen almost only after circumcision.',
    'Glans or urethral injury, and penile necrosis from thermal injury (rare and serious).',
  ],
  preop: {
    indications: [
      'Persistent primary phimosis despite topical steroid, secondary phimosis, BXO (circumcision is preferred, with meatotomy or meatoplasty if the meatus is involved), recurrent balanitis or posthitis, and UTI.',
      'Paraphimosis that will not reduce with glans compression and distal traction on the oedematous foreskin needs a dorsal slit or circumcision — untreated it can cause gangrene.',
      'Defer for hypospadias, penile curvature, dorsal hood, buried or webbed penis (the skin may be needed for repair), a large hydrocele or hernia (risk of secondary phimosis and a buried or trapped penis), and a known coagulopathy.',
    ],
    workup: [
      'Examine for hypospadias, curvature, a buried or webbed penis, and any hydrocele or hernia pushing the penile skin forward.',
      'Ask about bleeding disorders.',
    ],
    setup: [
      'General anaesthesia beyond the neonatal period; office devices (Gomco, Mogen, Plastibell) are for neonates under local anaesthesia.',
      'Dorsal penile nerve block — better than EMLA cream in trials; the prilocaine in EMLA carries a small risk of methaemoglobinaemia.',
      'Bipolar diathermy. Never let monopolar current touch a metal clamp or ring — thermal injury can cause penile necrosis.',
    ],
  },
  dangerZones: [
    {
      step: 0,
      structure: 'Hypospadias or deficient ventral skin',
      risk: 'Circumcising a penis with hypospadias, curvature or a buried or webbed penis removes skin needed for the repair.',
      bailout: 'Free all adhesions and inspect the meatus and corona before cutting; if an anomaly is found, stop and refer for repair.',
    },
    {
      step: 1,
      structure: 'Penile shaft skin',
      risk: 'Excessive excision leaves a denuded shaft and can cause curvature, torsion or a trapped penis.',
      bailout: 'Mark conservatively. A denuded shaft usually re-epithelialises with antibiotic ointment and warm baths — do not suture the edges together or graft it immediately.',
    },
    {
      step: 4,
      structure: 'Glans and urethra',
      risk: 'The glans or urethra can be cut with the prepuce.',
      bailout: 'Suture an amputated glans back in place — results are good within 8 hours, often without microsurgery. A urethral injury needs urethroplasty.',
    },
    {
      step: 5,
      structure: 'Frenular vessels',
      risk: 'Bleeding, usually from the frenulum, is the commonest complication.',
      bailout: 'Pressure first; then fine cautery, silver nitrate or a suture.',
    },
  ],
  postop: [
    'Antibiotic ointment (e.g., bacitracin) to the wound; infection is rare.',
    'Glanular adhesions are common and separate with age (71% of infants, 2% over 9 years). Persistent ones can be released in clinic with a topical anaesthetic — steroid creams do not help. Skin bridges may need excision.',
    'Meatal stenosis: an upward-deflected, narrow, forceful stream or pain at the start of voiding. Normal calibre is 10 Fr before age 4, 12 Fr at 4–10 and 14 Fr after 10. Treat by meatotomy or meatoplasty.',
    'BXO with meatal involvement: keep under review — about 20% need further meatal surgery.',
    'Trapped penis from a cicatrix: 0.05% betamethasone with manual retraction softened it in 79% in one series.',
  ],
  extrasSource: CWW_EXT_GENITALIA,
  citation: {
    authors: 'Kılıç',
    journal: 'BMC Urol',
    year: 2024,
    doi: '10.1186/s12894-024-01513-9',
    url: 'https://doi.org/10.1186/s12894-024-01513-9',
  },
  guideline: EAU_PAEDIATRIC,
};

const herniotomy: Procedure = {
  id: 'paediatric-herniotomy',
  name: 'Inguinal herniotomy & hydrocele repair (child)',
  category: 'Pediatric',
  summary:
    'High ligation of a patent processus vaginalis at the internal ring — the operation for an indirect inguinal hernia or communicating hydrocele in a child. Hernias are repaired soon after diagnosis because of the risk of incarceration; infant hydroceles are observed because many resolve. The open inguinal approach has the highest success, with 0.5–1% recurrence after uncomplicated repair.',
  anatomy: [
    'Processus vaginalis — the peritoneal outpouching that should close after testicular descent; its persistence underlies hernias and communicating and cord hydroceles.',
    'External oblique aponeurosis, with the ilioinguinal nerve beneath it.',
    'In young infants the internal and external rings almost overlie each other, so the sac can be reached without opening the external oblique (Mitchell-Banks).',
    'Hernia sac — lies anteromedially in the cord within the cremaster fibres.',
    'Vas deferens and testicular vessels — separated from the sac; more easily injured in young infants and after incarceration.',
  ],
  steps: [
    'Small skin-crease incision superolateral to the pubic tubercle; open Scarpa fascia and clear the external oblique down to the external ring.',
    'Open the external oblique along its fibres (often unnecessary in young infants).',
    'Separate the cremaster fibres perpendicular to the cord to expose the sac anteromedially.',
    'Lift the sac, separate it atraumatically from the vas and vessels, and divide it between clamps.',
    'Free the proximal sac up to the internal ring and ligate it there; open it first if it is large, thick or may contain bowel, omentum, gonad or a sliding component.',
    'Tighten a widened internal ring medially without compressing the cord. Leave a short distal sac; excise the front of a long one; excise a hydrocele and remove appendages.',
    'Confirm the testis lies in the scrotum before closing; do an orchidopexy at the same time if it is undescended or retractile.',
  ],
  complications: [
    'Recurrence — 0.5–1% after uncomplicated open repair, 2% in premature infants and 3–6% after an incarcerated hernia.',
    'Testicular atrophy — 0.3% in one large series and 4–12% in others; higher after an irreducible hernia, with infarction in 30–33% of infants under 2–3 months.',
    'Iatrogenic cryptorchidism.',
    'Vas injury — vas is found in 0.13–0.3% of excised sacs; obstruction can cause infertility later.',
    'Persistent hydrocele (0.1%).',
    'Bleeding and infection (rare).',
  ],
  preop: {
    indications: [
      'Inguinal hernia: repair within a few weeks if easily reducible, sooner if hard to reduce, and immediately if irreducible.',
      'Premature infants: repair before discharge, but delay in those under 1500 g or with cardiac, pulmonary, septic or metabolic illness; some wait until 50–52 weeks postconception.',
      'Infant hydrocele: observe; operate if it persists beyond 1 year, enlarges or starts to fluctuate (communicating). Cord hydroceles rarely resolve but can wait until after 1 year.',
      'Peripubertal boys: most hydroceles over age 10–12 are non-communicating (82–86%) — trans-scrotal repair as in adults, unless the history suggests communication.',
    ],
    workup: [
      'Clinical diagnosis: an intermittent groin bulge with crying or straining that reduces when supine; parents’ photographs are reliable if it is not seen in clinic.',
      'Palpate from the internal ring down: hernias and communicating hydroceles start at the internal ring; a scrotal hydrocele has normal cord above it and transilluminates (neonatal bowel can too).',
      'Ultrasound only when needed: an obese child, suspected incarceration, a tense cord hydrocele versus a mass, or a testis that cannot be felt.',
      'Teach the signs of incarceration: an inconsolable child, a persistent larger bulge, vomiting, distension, no stool.',
    ],
    setup: [
      'Day-case surgery for a reducible hernia.',
      'Open inguinal approach. Laparoscopy reduces metachronous contralateral hernias but has a higher recurrence (up to 4%) and a learning curve of about 20 cases; most European paediatric surgeons surveyed still prefer open repair.',
    ],
  },
  dangerZones: [
    {
      step: 1,
      structure: 'Ilioinguinal nerve',
      risk: 'The nerve lies under the external oblique and is injured when the aponeurosis is opened.',
      bailout: 'Open the external oblique along its fibres with the nerve in view.',
    },
    {
      step: 3,
      structure: 'Vas deferens and testicular vessels',
      risk: 'Separating the sac can injure the vas or vessels, especially in young infants or after incarceration; a crushed but intact vas can block and cause infertility later.',
      bailout: 'Separate the sac atraumatically, handling the vas and vessels as little as possible.',
    },
    {
      step: 4,
      structure: 'Sac contents',
      risk: 'Ligating a sac that holds bowel, omentum, a gonad or a sliding component injures it.',
      bailout: 'Open a large, thick or possibly occupied sac before ligation and reduce the contents.',
    },
    {
      step: 4,
      structure: 'Incomplete sac ligation',
      risk: 'Recurrence follows a sac that was not found or not ligated high, a tear leaving a strip of peritoneum on the cord, a damaged floor, or a missed direct hernia.',
      bailout: 'Ligate at the internal ring, repair any tear in the sac, and check the floor before closing.',
    },
    {
      step: 6,
      structure: 'Testis position',
      risk: 'The testis can be pulled up and trapped above the scrotum (iatrogenic cryptorchidism).',
      bailout: 'Confirm the testis is in the scrotum before closing.',
    },
  ],
  postop: [
    'Half of recurrences appear within 1 year and over 75% by 2 years.',
    'A hydrocele after hernia repair is rare: observe for at least 1 year, then repair it trans-scrotally if it persists, or re-explore if it fluctuates (recurrent hernia).',
    'Recurrent hernia: usually re-repaired inguinally, with high ligation of an indirect sac and/or repair of the floor for a direct one.',
    'Check testicular size and position at follow-up.',
  ],
  citation: CWW_EXT_GENITALIA,
  guideline: EAU_PAEDIATRIC,
};

const scrotalExploration: Procedure = {
  id: 'scrotal-exploration',
  name: 'Scrotal exploration for testicular torsion',
  category: 'Pediatric',
  summary:
    'Emergency exploration when spermatic cord torsion is suspected: untwist, judge viability, and fix both testes. Testis loss rises with time — orchiectomy in about 5% at 0–6 hours, 20% at 7–12, 40% at 13–18, 60% at 19–24, 80% after 24 and 90% after 48 hours. Do not delay surgery for imaging when the clinical picture fits.',
  anatomy: [
    'Bell-clapper deformity — the tunica vaginalis attaches high on the cord, letting the testis twist inside it (intravaginal torsion); found in 12% of males at autopsy.',
    'Spermatic cord — twisted 180–1080°; median 540° in testes removed and 360° in testes saved.',
    'Tunica vaginalis — opened to inspect the testis; can be raised as a vascularised flap.',
    'Dartos — the layer the testis is fixed to (dartos pouch or direct suture).',
    'Appendix testis (76–83%) and appendix epididymis (22–28%) — appendage torsion is the commonest cause of an acute scrotum before puberty.',
  ],
  steps: [
    'Hemiscrotal transverse (dartos pouch) or midline raphe incision; affected side first.',
    'Deliver the testis and open the tunica vaginalis; note the colour, the number of twists and the anatomy of the tunica.',
    'Untwist; wrap the testis in warm soaked gauze and watch for colour to return.',
    'Meanwhile fix the opposite testis with non-absorbable suture.',
    'Re-examine the affected testis and decide whether to keep it. If it is tensely congested, incise the tunica albuginea and patch the defect with a vascularised tunica vaginalis flap.',
    'Keep: fix in a dartos pouch or directly to the dartos with non-absorbable suture. Remove: divide the cord in segments, each ligated with non-absorbable suture.',
  ],
  complications: [
    'Orchiectomy — 30–70% in large series and 32–42% in database reviews.',
    'Later atrophy of a retained testis — under 10%, 40% and 75% after under 12, 12–24 and over 24 hours of pain; partial atrophy even after 4 hours.',
    'Retorsion despite fixation, from suture failure.',
    'Subtly reduced semen quality; lower inhibin B in the long term.',
  ],
  preop: {
    indications: [
      'Suspected spermatic cord torsion: emergency exploration without delay.',
      'Confirmed or strongly suspected intermittent torsion: elective bilateral orchidopexy (confirmation may be impossible and symptoms may persist).',
      'Appendage torsion is self-limiting — explore only if testicular torsion cannot be excluded, or for prolonged severe or recurrent pain.',
      'Perinatal (extravaginal) torsion has no consensus; torsion after a documented normal postnatal examination is explored promptly, as for intravaginal torsion.',
    ],
    workup: [
      'Typical: sudden severe pain at rest or with activity, nausea or vomiting (10–60%), a high-riding horizontal testis and an absent cremasteric reflex — though the reflex is present in up to 10% of proven torsion (see Pediatrics → Scrotal pain for the risk scores).',
      'Doppler ultrasound: absent or reduced intratesticular flow or a heterogeneous testis. Sensitivity was only 63–90% in some series, so normal flow does not exclude torsion when the story fits; a cord twist on high-resolution imaging was seen in 96% of proven cases.',
      'Manual detorsion may relieve pain but is incomplete in about a third (the twist was lateral rather than medial in 33%) — it does not replace surgery.',
    ],
    setup: [
      'Consent for possible orchiectomy and for fixing the other testis — the decision is made at surgery.',
      'Warm saline-soaked gauze; non-absorbable sutures for fixation and for ligating the cord.',
      'Avoid avoidable delay: inter-hospital transfer added 75 minutes in one study.',
    ],
  },
  dangerZones: [
    {
      step: 0,
      structure: 'Possible testicular tumour (neonate)',
      risk: 'A neonatal scrotal mass may be a tumour rather than torsion, and trans-scrotal surgery would breach the scrotum.',
      bailout: 'Some surgeons explore neonates inguinally, which also allows ligation of a patent processus vaginalis.',
    },
    {
      step: 2,
      structure: 'Ischaemic testis',
      risk: 'Viability judged straight after untwisting is unreliable.',
      bailout: 'Wrap it in warm gauze and fix the other side first, then re-examine. Doppler probe or tunica albuginea incision to look for bleeding are not validated.',
    },
    {
      step: 3,
      structure: 'Contralateral testis',
      risk: 'The other testis can twist later (metachronous torsion).',
      bailout: 'Fix it with non-absorbable sutures at the same operation.',
    },
    {
      step: 4,
      structure: 'Intratesticular pressure',
      risk: 'A tense, congested testis after untwisting may stay ischaemic (compartment syndrome).',
      bailout: 'Incise the tunica albuginea and cover the defect with a vascularised tunica vaginalis flap — 55% of testes judged unsalvageable recovered in one series; long-term data are lacking.',
    },
    {
      step: 5,
      structure: 'Fixation',
      risk: 'Torsion can recur after orchidopexy when the sutures fail.',
      bailout: 'Fix with non-absorbable suture in a dartos pouch or directly to the dartos.',
    },
  ],
  postop: [
    'Follow testicular size: in one series 54% of testes judged viable lost over half their volume; pain over 1 day and a heterogeneous testis on ultrasound predicted atrophy.',
    'After orchiectomy, offer a prosthesis once healed or later in puberty (placement at the same operation is feasible).',
    'Fertility: semen quality is often subtly reduced; FSH, LH and testosterone stay normal but inhibin B is lower.',
  ],
  citation: CWW_EXT_GENITALIA,
  guideline: EAU_PAEDIATRIC,
};

const hypospadiasTip: Procedure = {
  id: 'hypospadias-tip',
  name: 'Hypospadias repair — TIP (distal)',
  category: 'Pediatric',
  summary:
    'Tubularised incised plate (TIP, Snodgrass) urethroplasty — used in over 90% of distal and 80% of midshaft repairs in one survey. The urethral plate is incised deeply in the midline and tubularised, covered with a dartos flap, and the glans is closed over it. Goals: a straight penis, a slit-like meatus at the tip and a normal appearance. Elective repair at 6–12 months.',
  anatomy: [
    'Urethral plate — the strip of mucosa from the ectopic meatus to the glans; its width and depth decide whether it can be tubularised.',
    'Glans wings — mobilised off the plate to close over the neourethra; a glans narrower than 14–15 mm worries many surgeons.',
    'Corpus spongiosum — divergent beside the plate; brought together over the repair (spongioplasty) in more proximal cases.',
    'Corpora cavernosa — the midline plate incision stops just above them.',
    'Dartos (preputial) tissue — the vascularised barrier layer over the urethroplasty.',
    'Ventral curvature — from short ventral skin, a short urethra or corporal disproportion.',
  ],
  steps: [
    'With the child asleep, free the preputial adhesions and assess meatal position, ventral shaft tissue and curvature; a bougie shows the quality of the tissue over the urethra.',
    'Circumscribing incision preserving a mucosal collar; deglove to the penoscrotal junction, excising dysplastic dartos.',
    'Artificial erection (tourniquet at the base and saline injection); measure curvature — dorsal plication if under 30°.',
    'Incise along the junction of the glans wings and the plate, then make a deep midline incision of the plate down to just above the corpora.',
    'Tubularise the plate from distal to proximal in two layers of fine subepithelial suture under magnification, starting 2–3 mm short of the end of the plate to leave an oval meatus.',
    'Cover the neourethra with a dartos flap.',
    'Glansplasty in two layers (spongiosum, then epithelium) to form the meatus; close the mucosal collar and skin; stent and dressing.',
  ],
  complications: [
    'Urethrocutaneous fistula — the commonest, just under 10% in short-term follow-up, most at the original meatus or the corona.',
    'Glans dehiscence.',
    'Meatal stenosis and meatal retrusion.',
    'Urethral stricture — usually at the junction of native and new urethra.',
    'Urethral diverticulum (more after flap, staged and proximal repairs).',
    'Recurrent curvature over 30°.',
    'Skin problems: excess or deficient skin, penile torsion, lichen sclerosus.',
  ],
  preop: {
    indications: [
      'Repair when the meatus deflects the stream or there is curvature; a straight erect penis with a meatus that allows voiding standing may gain little.',
      'Timing: 6–12 months (AAP 1996). Genital awareness starts around 18 months, and earlier repair is linked with less anxiety and possibly fewer complications. A single anaesthetic for hernia repair showed no neurodevelopmental delay at 2 years.',
      'TIP suits distal and midshaft hypospadias with an adequate plate and curvature corrected by degloving or plication; with curvature over 30° after degloving most surgeons now stage the repair.',
    ],
    workup: [
      'History: earlier surgery, UTIs, curvature on erection (parents’ photographs help) and bleeding disorders. Do not circumcise.',
      'Examine penile length, glans, meatus, plate, skin and both testes. One or both testes undescended, perineal hypospadias or ambiguous genitalia: work up for a disorder of sex development first.',
      'No routine VCUG or renal ultrasound; ultrasound only if there are other systemic anomalies.',
      'Small glans (under 15 mm): some give preoperative testosterone (e.g., IM 5 and 2 weeks before surgery). Its effect on complications is disputed; side effects resolve within 6 months.',
    ],
    setup: [
      'Regional block — caudal or penile (pudendal is an alternative). Whether a caudal raises the fistula rate is unresolved.',
      'IV antibiotics after skin preparation.',
      'Cystoscopy only for severe proximal or redo cases (a utricle can block catheter passage).',
      'Optical magnification, fine absorbable sutures, a tourniquet and saline for artificial erection, and a goniometer — eyeballing underestimates curvature.',
    ],
  },
  dangerZones: [
    {
      step: 0,
      structure: 'Proximal hypospadias in disguise',
      risk: 'A proximal hypospadias can look distal when there is severe curvature and thin ventral skin.',
      bailout: 'Recognise it before incising and change the plan, often to a staged repair.',
    },
    {
      step: 2,
      structure: 'Basal curvature',
      risk: 'Curvature at the base of the penis can be hidden by the tourniquet.',
      bailout: 'Compress the corpora at the base or use a prostaglandin erection instead, and measure the angle with a goniometer.',
    },
    {
      step: 3,
      structure: 'Narrow urethral plate',
      risk: 'A narrow plate raises the risk of meatal or urethral stenosis; incised plates vary in width and contract.',
      bailout: 'Incise the plate first, measure it, and aim for a total width of about 12 mm; consider an inner preputial graft or an onlay flap.',
    },
    {
      step: 4,
      structure: 'Neomeatus',
      risk: 'Closing the urethroplasty too far distally causes meatal stenosis.',
      bailout: 'Stop the closure 2–3 mm short of the intended meatus.',
    },
    {
      step: 5,
      structure: 'Urethroplasty suture line',
      risk: 'Overlapping suture lines, poor epithelial inversion, ischaemia and haematoma lead to fistula.',
      bailout: 'Cover with a well-vascularised barrier layer and keep the layers tension-free and non-overlapping.',
    },
    {
      step: 6,
      structure: 'Glans closure',
      risk: 'Tension on the glans or a catheter pulling on the repair causes dehiscence and meatal retraction.',
      bailout: 'Mobilise the glans wings deeply and widely; use a soft stent, and secure any Foley catheter to the abdominal wall in the midline.',
    },
  ],
  postop: [
    'Compressive dressing for 48–72 hours, then petroleum jelly.',
    'Urinary diversion for 3–21 days depending on the repair; short distal repairs can go without a stent, and UTI risk rises with each day of diversion.',
    'Oxybutynin for bladder spasm until the stent is out.',
    'Regular paracetamol and ibuprofen, tapered within 48–72 hours.',
    'The meatus should calibrate to at least 8 Fr; routine dilation is not needed.',
    'Fistulas usually show within 2 years, often at toilet training. Small early ones rarely close; repair no sooner than 6–12 months after surgery (about 20% recur).',
  ],
  citation: cww('Ch 45, Hypospadias', 'Long, Zaontz & Canning'),
  guideline: EAU_PAEDIATRIC,
};

const pyeloplasty: Procedure = {
  id: 'pyeloplasty',
  name: 'Pyeloplasty (Anderson-Hynes, child)',
  category: 'Pediatric',
  summary:
    'Dismembered pyeloplasty for pelvi-ureteric junction obstruction — the gold standard by open, laparoscopic or robotic access, with success of 90–100%. Only about a third of children with this hydronephrosis need surgery.',
  anatomy: [
    'Intrinsic PUJ narrowing (interrupted circular muscle) — the usual cause in infants.',
    'Lower-pole crossing vessel — a common cause in older children, with the ureter kinking over it; it is preserved and the new junction placed in front of it.',
    'Renal pelvis — redundant pelvis can be excised; the dependent part forms the new junction.',
    'Proximal ureter — spatulated laterally into healthy ureter; its blood supply is protected by minimal handling and bipolar diathermy.',
    'Associated anomalies: contralateral PUJ obstruction (10–40%), VUR (up to 40%), duplex lower-moiety obstruction and horseshoe kidney.',
  ],
  steps: [
    'Open Gerota fascia and dissect the PUJ from in front or behind (depending on access); free the lower pole so a crossing vessel is not missed.',
    'Place stay sutures in the pelvis above the planned line of division and in the ureter at the stenosis; decompress a tense pelvis with a 21G needle.',
    'Divide the PUJ and reduce the pelvis if it is redundant.',
    'Spatulate the ureter laterally beyond the stenosis into healthy ureter, keeping the stenotic end as a handle.',
    'Anastomose with 6-0 or 5-0 absorbable suture, placing the apex of the V precisely and without tension on the stay sutures.',
    'Before completing it, excise the stenotic segment and irrigate the pelvis to clear clot; place a stent (internal double-J or externalised transanastomotic).',
    'Return the kidney to its position and cover the anastomosis with perinephric fat; a drain is usually not needed.',
  ],
  complications: [
    'Bleeding from ureteric or pelvic vessels — the commonest reason for conversion in minimally invasive cases.',
    'Urine leak or urinoma; ileus from urinary ascites after transperitoneal access.',
    'Early obstruction from clot or oedema — usually settles; may need a temporary nephrostomy.',
    'Failure: persistent or worsening dilation and falling function.',
    'A second anaesthetic to remove a double-J stent.',
  ],
  preop: {
    indications: [
      'Increasing AP diameter, low or falling differential function, breakthrough UTI on prophylaxis, or symptoms (pain; in infants failure to thrive, feeding problems).',
      'Duplex lower-moiety obstruction: a moiety with 5–10% or less of total function is better removed (partial nephrectomy) than repaired.',
      'Vascular hitch only for an anterior lower-pole vessel without intrinsic obstruction (normal ureter and peristalsis at surgery).',
      'High-grade VUR with secondary PUJ kinking: avoid a simultaneous reimplant and pyeloplasty — observe or stage.',
    ],
    workup: [
      'Ultrasound for AP diameter and serial diuretic renography for differential function. Read infant washout curves cautiously — hydration, posture, pelvic volume and diuretic timing all affect them (false positives up to 44%).',
      'Look for contralateral obstruction, VUR, dysplasia, multicystic kidney and duplication.',
      'If urgent drainage is needed close to surgery, prefer a nephrostomy — a retrograde stent inflames the PUJ and makes the anastomosis harder.',
    ],
    setup: [
      'Open in infants (the incision is no bigger than laparoscopic access needs); laparoscopic or robotic in older children. Retroperitoneal access avoids intra-abdominal organs, but not for a horseshoe kidney or retrocaval ureter.',
      'Retroperitoneoscopic: 80–90° flank, gel roll under the opposite iliac crest, table not flexed (flexing narrows the space). Transperitoneal: 45–60° flank; transmesenteric approach on the left.',
      'Bipolar diathermy; 6-0 or 5-0 absorbable sutures; stent of choice (methylene blue in the bladder confirms a double-J is in place).',
    ],
  },
  dangerZones: [
    {
      step: 0,
      structure: 'Lower-pole crossing vessel',
      risk: 'A missed crossing vessel leaves the obstruction in place, especially with retroperitoneoscopic access.',
      bailout: 'Free the lower pole to look for it; keep the vessel and bring the anastomosis in front of it.',
    },
    {
      step: 0,
      structure: 'Pelvic and ureteric blood supply',
      risk: 'Diathermy and handling damage the blood supply of the pelvis and ureter.',
      bailout: 'Use bipolar diathermy sparingly and handle the ureter by its stenotic stump.',
    },
    {
      step: 1,
      structure: 'Renal pelvis',
      risk: 'A tensely distended pelvis tempts excessive reduction.',
      bailout: 'Decompress it with a 21G needle before dividing the PUJ.',
    },
    {
      step: 4,
      structure: 'Apex of the anastomosis',
      risk: 'An imprecise or tense apex stenoses, and traction on stay sutures hides a kink that appears when released.',
      bailout: 'Place the apex precisely and relax the stay sutures while aligning. If length is short, mobilise the kidney or add a horizontal incision low in the pelvis.',
    },
    {
      step: 5,
      structure: 'Clot in the pelvis',
      risk: 'Clot left in the pelvis can block the new junction.',
      bailout: 'Irrigate the pelvis with saline before the last sutures.',
    },
  ],
  postop: [
    'Double-J stent: bladder catheter for 24–48 hours, because reflux up the stent transmits bladder pressure. Not needed with an externalised stent.',
    'Externalised transanastomotic stent: open for 12–48 hours, then knotted; removed at 7–14 days without anaesthesia. Untie it to drain if there is obstruction, infection or pain.',
    'Stenting for 1–4 weeks does not seem to change the outcome.',
    'Early pain, infection or more dilation can mean failure, but clot and oedema usually settle within days — use a temporary nephrostomy if needed.',
    'Late failure: balloon dilation or incision with 4–6 weeks of stenting, or redo pyeloplasty (transperitoneal preferred); ureterocalicostomy if the ureter is too short.',
  ],
  citation: cww('Ch 42, Surgery of the Ureter in Children', 'Olsen & Rawashdeh'),
  guideline: EAU_PAEDIATRIC,
};

const vasectomy: Procedure = {
  id: 'vasectomy',
  name: 'Vasectomy',
  category: 'Andrology',
  summary:
    'Permanent surgical sterilisation by scrotal division of the vas deferens, usually under local anaesthesia as an outpatient. AUA favours a minimally invasive (no-scalpel) vas isolation — which markedly lowers haematoma/infection — combined with an occlusion technique of mucosal thermal cautery plus fascial interposition (failure ~0.1%). Counsel that it is effectively irreversible and that contraception must continue until a post-vasectomy semen analysis confirms success.',
  anatomy: [
    'Vas deferens — firm, cord-like; isolated high in the scrotum just beneath the anterior scrotal skin.',
    'Spermatic cord — the vas is separated from the accompanying vessels and nerves (vasal nerve block).',
    'Scrotal wall layers — skin, dartos, and the vasal fascial sheath (interposed between cut ends to limit recanalisation).',
    'Pre-op: confirm both vasa palpable and exclude varicocele/hydrocele/hernia; congenital absence of the vas may coexist with ipsilateral renal agenesis (consider renal ultrasound).',
  ],
  steps: [
    'Isolate the vas high in the scrotum and fix it beneath the skin; infiltrate local anaesthetic around it (vasal block).',
    'Access the vas with a minimally invasive (no-scalpel) puncture where possible — a single midline opening lowers haematoma and infection versus a formal incision.',
    'Deliver the vas with its surrounding fascia and bluntly free a short segment; double-clamp without crushing.',
    'Divide the vas and send a segment for identification; the excised length is not itself critical to success.',
    'Occlude reliably: AUA favours mucosal thermal cautery of the lumen combined with fascial interposition; occlusion by ligation/excision of a short segment alone is discouraged (much higher failure).',
    'Let the testicular end retract; secure haemostasis and close (the no-scalpel opening often needs no suture).',
    'Confirm success with a post-vasectomy semen analysis from ~8 weeks; the patient may stop other contraception only after azoospermia or ≤100,000 non-motile sperm/mL on a fresh uncentrifuged sample.',
  ],
  complications: [
    'Scrotal haematoma.',
    'Wound infection.',
    'Sperm granuloma.',
    'Chronic scrotal / genital pain.',
    'Spontaneous recanalisation with return of fertility (~1 in 2000).',
    'Early failure if contraception is stopped before confirmed azoospermia.',
  ],
  preop: {
    indications: [
      'A man who wants permanent contraception, after counselling on alternatives.',
      'Conventional (open) isolation instead of minimally invasive for previous scrotal surgery or trauma, thick tight scrotal skin, or a varicocele, hydrocele or spermatocele.',
    ],
    workup: [
      'In-person or telephone consultation: medical and surgical history and a genital examination (both vasa palpable).',
      'Counsel on: the possible need for a repeat vasectomy if sperm persist, recanalisation and pregnancy, and a 1–2% risk of chronic scrotal pain; sign the consent beforehand.',
    ],
    setup: [
      'Local anaesthetic ± oral sedation (IV sedation or general anaesthesia if local will not suffice); use the finest needle (25–32 G) — topical cream alone is not enough.',
      'Minimally invasive isolation (≤ 10 mm opening, e.g. no-scalpel) — less pain and fewer complications.',
      'Plan an AUA-recommended occlusion (each < 1% failure): mucosal cautery with or without fascial interposition and without clips or ties, or open-ended with the abdominal end cauterised and interposed.',
    ],
  },
  dangerZones: [
    {
      step: 0,
      structure: 'The same vas twice',
      risk: 'Through a single midline opening it is possible to grasp and divide one vas twice and leave the other intact — a technical early failure.',
      bailout: 'A gentle tug on the isolated vas should move the testis on that side; some surgeons use two openings to avoid the problem.',
    },
    {
      step: 1,
      structure: 'Convoluted vas',
      risk: 'An opening placed too low reaches the small, convoluted vas, which is harder to handle now and at any future reversal.',
      bailout: 'Open at the penoscrotal junction or between it and the top of the testis, where the vas is straight.',
    },
    {
      step: 5,
      structure: 'Cord vessels (scrotal haematoma)',
      risk: 'Bleeding is the main complication of scrotal surgery; an expanding haematoma with a falling haematocrit can signal retroperitoneal bleeding from a retracted vessel.',
      bailout: 'Most haematomas settle — drain only if very large, infected or enlarging. Persistent cord bleeding: re-ligate through a small subinguinal incision, extending into the retroperitoneum if the cord has retracted.',
    },
  ],
  postop: [
    'Semen analysis on a fresh sample 8–16 weeks after surgery, after at least 10–20 ejaculations (older men clear sperm more slowly).',
    'Stop other contraception only once it shows azoospermia or rare non-motile sperm (≤ 100,000/mL).',
    'Motile sperm on the first test: repeat at 6 months; if still present, it has failed — arrange a repeat vasectomy.',
    'Late failure from recanalisation occurs in about 1 in 2000; pregnancy after a confirmed success is about 0.05%.',
  ],
  extrasSource: cww('Ch 83, Surgery of the Scrotum and Seminal Vesicles (vasectomy)', 'Hawksworth, Khera et al.'),
  citation: {
    authors: 'Basso',
    journal: 'Oper Tech Gen Surg',
    year: 2002,
    doi: '10.1053/otgn.2002.35343',
    url: 'https://doi.org/10.1053/otgn.2002.35343',
  },
  guideline: {
    authors: 'AUA',
    journal: 'Vasectomy Guideline',
    year: 2015,
    url: 'https://www.auanet.org/guidelines-and-quality/guidelines/vasectomy-guideline',
    label: 'AUA Vasectomy Guideline',
  },
};

const rplnd: Procedure = {
  id: 'rplnd',
  name: 'Retroperitoneal lymph node dissection (RPLND)',
  category: 'Oncology',
  summary:
    'Template, nerve-sparing dissection of the retroperitoneal nodes for non-seminomatous germ cell tumour — both diagnostic and therapeutic (curative in ~70% of pathologic stage II). Post-chemotherapy RPLND is a complete bilateral resection of residual masses and is technically demanding.',
  anatomy: [
    'Landing zones (Indiana mapping): para-aortic/interaortocaval for left tumours, paracaval/interaortocaval for right.',
    'Template boundaries: ipsilateral ureter laterally, renal vessels superiorly, common-iliac bifurcation inferiorly; the IMA take-off is a key landmark.',
    'Post-ganglionic sympathetic fibres (especially around the IMA) — spared to preserve antegrade ejaculation.',
    'Great vessels (aorta, IVC), lumbar vessels, and gonadal vein (right → IVC, left → renal vein).',
  ],
  steps: [
    'Midline transperitoneal access (laparoscopic described); reflect colon and small bowel and pack out, avoiding SMA/mesenteric traction.',
    'Define the template; mobilise the great vessels; ligate and divide the lumbar vessels.',
    '"Split-and-roll" the lymphatic packets off the great vessels; use liberal hemoclips on lymphatics to prevent chylous leak.',
    'Identify and preserve sympathetic fibres under loupe magnification (nerve-sparing).',
    'Resect the ipsilateral gonadal vein and spermatic-cord stump down to the internal ring.',
    'Post-chemotherapy: complete bilateral dissection; ureteric stents aid identification; stay in the adventitial plane of the great vessels to avoid vascular injury.',
  ],
  complications: [
    'Loss of antegrade ejaculation (≤ 1% with nerve-sparing; higher otherwise).',
    'Chylous ascites / lymphatic leak (~2%).',
    'Major vascular injury — especially with post-chemotherapy desmoplasia (aortic injury / delayed rupture may need grafting).',
    'Bowel ischaemia from mesenteric traction.',
    'Bleeding, ileus, wound complications.',
  ],
  preop: {
    indications: [
      'Primary RPLND for non-seminomatous germ cell tumour as in the summary above.',
      'Post-chemotherapy: a residual retroperitoneal mass once serum tumour markers have normalised — generally never with rising markers.',
    ],
    workup: [
      'Abdominal CT within 6 weeks: masses, and anatomy such as duplicated renal vessels or an IVC thrombus (total occlusion may need IVC resection).',
      'Tumour markers within 7–10 days; chest CT with prior lung lesions or a planned lung resection.',
      'After bleomycin (lung toxicity about 11% vs 1.7% without it): pulmonary function tests, and a chest physician if abnormal.',
      'Offer sperm banking to anyone who may want children; no bowel preparation needed.',
    ],
    setup: [
      'Tell the anaesthetist about bleomycin: low inspired oxygen and conservative fluids — and repeat it at the time-out.',
      'Supine, arms out; orogastric tube; midline incision from xiphoid to just below the umbilicus (transperitoneal, or extraperitoneal in selected patients).',
      'Antibiotic prophylaxis per the AUA statement. ' + PROPHYLAXIS_NOTE,
    ],
  },
  dangerZones: [
    {
      step: 0,
      structure: 'Liver',
      risk: 'Upper-abdominal retraction can tear the liver.',
      bailout: 'Divide the round ligament and release the falciform toward the IVC before placing retractors.',
    },
    {
      step: 1,
      structure: 'Lumbar arteries and veins',
      risk: 'About three pairs of lumbar arteries, and variable lumbar veins — a superior right lumbar vein just below the renal vein, and a large common lumbar vein near the IMA level — bleed when torn during rolling.',
      bailout: 'Identify and doubly ligate each before rolling the vessels; expect the common lumbar vein at the IMA level.',
    },
    {
      step: 2,
      structure: 'Lymphatics at the renal veins (chyle)',
      risk: 'Unsecured lymphatics, especially at the cephalad end and behind the duodenum and pancreas, cause chylous leak or ascites.',
      bailout: 'Clip liberally at the top of the template; inspect the bed at the end and clip or suture any leak; low-fat diet afterwards.',
    },
    {
      step: 3,
      structure: 'Postganglionic sympathetic fibres (L1–L4)',
      risk: 'Right fibres run beneath the IVC; left fibres leave from under the left renal vein around the aorta and IMA. Cutting them causes loss of antegrade ejaculation.',
      bailout: 'Identify the fibres before splitting and rolling, isolate them, and pass the node packet around them as it is freed.',
    },
    {
      step: 5,
      structure: 'Left renal hilum (post-chemotherapy)',
      risk: 'A bulky residual mass can engulf the hilum — nephrectomy needed in 5–31% (about 15% in a large series); the strongest predictor is a mass over 10 cm, mostly left-sided.',
      bailout: 'Anticipate and counsel beforehand; salvage the kidney where possible, as further cisplatin may be needed.',
    },
  ],
  postop: [
    'Before closing: inspect for residual nodes, lymph leak and bleeding (warm irrigation helps), and check bowel, liver, stomach and pancreas.',
    'No routine drain; after a large dissection, a non-suction drain until output is serous and under 100 mL/24 h on a regular diet.',
    'No nasogastric tube; clear fluids that evening, low-fat diet days 1–2, non-opioid analgesia, out of bed on day 1; home at about day 3–5.',
  ],
  extrasSource: cww('Ch 77, Surgery of Testicular Tumors', 'Riggs, Gaston & Clark'),
  citation: {
    authors: 'Wood',
    journal: 'Oper Tech Gen Surg',
    year: 2006,
    doi: '10.1053/j.optechgensurg.2006.06.003',
    url: 'https://doi.org/10.1053/j.optechgensurg.2006.06.003',
  },
  guideline: {
    authors: 'AUA',
    journal: 'Testicular Cancer Guideline',
    year: 2019,
    url: 'https://www.auanet.org/guidelines-and-quality/guidelines/testicular-cancer-guideline',
    label: 'AUA Testicular Cancer Guideline',
  },
};

const lapNephrectomy: Procedure = {
  id: 'lap-nephrectomy',
  name: 'Laparoscopic nephrectomy (transperitoneal)',
  category: 'Oncology',
  summary:
    'Minimally invasive kidney removal — radical (with Gerota’s ± adrenal) or simple (benign). Equivalent oncologic outcomes to open with faster recovery. Contraindicated with renal-vein/IVC tumour thrombus or bulky adenopathy.',
  anatomy: [
    'Line of Toldt — incised to mobilise the colon medially off Gerota’s fascia.',
    'Gerota’s fascia enclosing the kidney; perinephric and sinus fat.',
    'Renal hilum — artery and vein dissected separately (artery divided before vein).',
    'Ureter and gonadal vein — found medial to psoas; the ureter often lies lateral/deep to the gonadal vein.',
    'Adjacent structures: duodenum (Kocherise on the right), liver/hepatic flexure (right), spleen/splenic flexure/lienorenal ligament (left), and the adrenal gland with its vein.',
  ],
  steps: [
    '45° modified flank position; general anaesthesia (avoid nitrous oxide); orogastric tube and catheter.',
    'Establish pneumoperitoneum (Veress/Hasson at the umbilicus) and place 3–4 ports.',
    'Incise the line of Toldt and mobilise the colon medially off Gerota’s (Kocher on right; release splenic attachments on left).',
    'Identify the ureter and gonadal vein; retract upward to mobilise the lower pole within Gerota’s.',
    'Hilar dissection: free the renal artery and vein separately close to the great vessels; divide with the endovascular stapler — artery first, then vein.',
    'Circumferentially mobilise; for radical take the adrenal vein/gland as indicated, for simple spare the adrenal; divide the ureter.',
    'Entrap the specimen in a bag — intact extraction for cancer, morcellation for benign disease.',
  ],
  complications: [
    'Vascular injury / haemorrhage (hilar vessels; the weak gonadal-vein–IVC junction on the right).',
    'Adjacent-organ injury (bowel, duodenum, spleen, liver, pancreas).',
    'Conversion to open surgery.',
    'Ileus, bleeding.',
    'General laparoscopic risks (port-site, gas embolism).',
  ],
  preop: {
    indications: [
      'The same indications as open radical nephrectomy for renal cancer (contraindications in the summary above), or simple nephrectomy for a benign, poorly functioning kidney.',
      'Approach (transperitoneal, retroperitoneal, hand-assisted, robotic) by resources, experience and the patient — outcomes are comparable.',
    ],
    workup: [
      'Previous abdominal or retroperitoneal surgery shapes access: adhesions raise bowel-injury risk.',
      'Cardiopulmonary reserve: pneumoperitoneum impairs ventilation and venous return; severe lung disease may not tolerate hypercarbia (lower pressure, helium, or open).',
      'Obesity is not a contraindication but raises complication and conversion rates.',
      'Review imaging for the number and position of renal arteries and veins.',
    ],
    setup: [
      'General anaesthesia, orogastric tube, catheter, compression stockings; modified flank (30–45°), pressure points padded, patient secured so the table can tilt.',
      'Prep and drape the whole abdomen and flank in case of conversion; 3–5 trocars.',
      'Antibiotic prophylaxis per the AUA statement. ' + PROPHYLAXIS_NOTE,
      'VTE prophylaxis by risk: compression devices for low risk, add pharmacological prophylaxis for high risk.',
    ],
  },
  dangerZones: [
    {
      step: 1,
      structure: 'Great vessels and bowel at access',
      risk: 'Most life-threatening vascular injuries happen at Veress or first-trocar insertion, as do about a third of bowel injuries.',
      bailout: 'After previous surgery, enter away from scars, use open (Hasson) access, or go retroperitoneal.',
    },
    {
      step: 2,
      structure: 'Bowel and mesentery',
      risk: 'Unrecognised bowel injury (0.1–0.8%) carries about 3% mortality; half are thermal injuries from energy devices near bowel, often out of view.',
      bailout: 'Keep energy away from bowel and instruments in view; imbricate a superficial thermal injury found at surgery; close any mesenteric defect. After surgery, pain out of proportion at one port site, distension and a low white count mean CT with oral contrast and usually exploration.',
    },
    {
      step: 3,
      structure: 'Right gonadal vein–IVC junction',
      risk: 'Lifting the ureter and lower pole can tear the gonadal vein where it enters the cava.',
      bailout: 'Press with gauze for several minutes; once a grasper controls the hole, clip or suture it — never blindly.',
    },
    {
      step: 4,
      structure: 'Renal artery and vein',
      risk: 'Injuries come from unidentified structures, sharp hilar dissection, or a stapler that misses part of the vessel or misfires (stapling over clips is a preventable cause).',
      bailout: 'Never use plastic clips alone on the renal artery. For brisk bleeding, a hand through a small lower midline incision holds pressure while you suture or convert in a controlled way.',
    },
    {
      step: 5,
      structure: 'Spleen, pancreas and diaphragm',
      risk: 'Splenic tears from traction on its ligaments and pancreatic injury (each up to 0.5%) on the left; liver and gallbladder on the right; diaphragmatic injury at the upper pole.',
      bailout: 'Spleen: argon beam and topical haemostats, splenectomy if needed. Pancreas: close a capsular tear with non-absorbable suture or drain; deeper injury needs formal repair — call general surgery. Diaphragm: a sudden rise in airway pressure means pneumothorax — repair, evacuate, chest X-ray.',
    },
  ],
  postop: [
    'Before closing, lower the insufflation pressure to unmask venous bleeding; check the dissection bed, adrenal, mesentery, gonadal vessels and ureteric stump.',
    'Hypotension, tachycardia and a falling haematocrit suggest bleeding — CT; most settle conservatively, and arterial bleeding is usually embolised.',
    'Watch for unrecognised bowel injury (port-site pain, distension, diarrhoea, low-grade fever) in the first days.',
    'Complications cluster in a surgeon’s first ~20 cases — supervise accordingly.',
  ],
  extrasSource: cww('Ch 102, Laparoscopic and Robotic Surgery of the Kidney', 'Moreira & Kavoussi'),
  citation: {
    authors: 'Gettman & Segura',
    journal: 'Oper Tech Gen Surg',
    year: 2005,
    doi: '10.1053/j.optechgensurg.2004.12.003',
    url: 'https://doi.org/10.1053/j.optechgensurg.2004.12.003',
  },
  guideline: {
    authors: 'AUA',
    journal: 'Renal Mass & Localized Renal Cancer Guideline',
    year: 2021,
    url: 'https://www.auanet.org/guidelines-and-quality/guidelines/renal-mass-and-localized-renal-cancer-evaluation-management-and-follow-up',
    label: 'AUA Renal Mass Guideline',
  },
};

const turp: Procedure = {
  id: 'turp',
  name: 'TURP (transurethral resection of prostate)',
  category: 'Endourology',
  summary:
    'Telescopic resection of the obstructing central (transition-zone) prostate with a diathermy loop to create a wide channel and relieve bladder-outlet obstruction from BPH. A catheter with irrigation is left to wash out clots; the usual operation for troublesome flow.',
  anatomy: [
    'The prostate surrounds the prostatic urethra as it leaves the bladder; the enlarged transition-zone adenoma obstructs flow.',
    'Bladder neck — the proximal limit of resection.',
    'Verumontanum — distal landmark; resection is kept proximal to it to protect the distal (external) sphincter and continence.',
    'Prostatic capsule — the depth limit; breaching it risks perforation and absorption of irrigation fluid.',
  ],
  steps: [
    'General or spinal anaesthetic; give prophylactic antibiotics after checking allergies.',
    'Pass a resectoscope per urethra into the bladder.',
    'Resect the central prostate piece-by-piece with the diathermy loop.',
    'Evacuate the chippings by suction and send for histology.',
    'Cauterise bleeding points in the resection cavity.',
    'Leave a bladder catheter and run irrigation to flush clots.',
  ],
  complications: [
    'Temporary burning, bleeding and frequency (almost all patients).',
    'Retrograde ejaculation (~65–75%).',
    'Incomplete relief of symptoms.',
    'Bleeding needing transfusion or re-operation (~1 in 10–50).',
    'Erectile dysfunction in previously normal men (~1 in 10–50).',
    'Repeat resection later from regrowth; urethral stricture / bladder-neck scarring (~1 in 10–50 each).',
    'Retention needing catheter/ISC; urinary incontinence, temporary or permanent (~1 in 10–50).',
    'TUR syndrome — irrigant absorption causing confusion / cardiac effects (~1 in 50–250).',
    'Incidental prostate cancer in the chippings; anaesthetic/cardiovascular events (~1 in 50–250).',
  ],
  citation: {
    authors: 'BAUS',
    journal: 'Patient information leaflet E23/109',
    year: 2023,
    url: 'https://www.baus.org.uk/patients/information_leaflets/',
    label: 'BAUS leaflet',
  },
  guideline: {
    authors: 'AUA',
    journal: 'BPH / LUTS Guideline',
    year: 2024,
    url: 'https://www.auanet.org/guidelines-and-quality/guidelines/bph-guideline',
    label: 'AUA BPH Guideline',
  },
  preop: {
    indications: [
      'Moderate to severe LUTS from BPH that persist despite a trial of medical therapy.',
      'Urinary retention after a failed trial without catheter (an alpha-blocker during the trial improves the chance of voiding).',
      'Recurrent gross haematuria from the prostate once infection, cancer and trauma are excluded.',
      'Bladder stones or diverticula, recurrent UTI from a high residual, or bilateral hydronephrosis with impaired renal function.',
    ],
    workup: [
      'Symptom score, uroflow and post-void residual; pressure-flow studies when bladder function is in doubt (e.g. large-volume retention).',
      'Prostate volume — transrectal ultrasound is more accurate than DRE or cystoscopy and guides the choice of technique.',
      'Review anticoagulation: if it cannot be stopped, a laser technique carries less bleeding risk.',
      'With obstructive uropathy, decompress and let renal function and oedema settle before definitive surgery.',
    ],
    setup: [
      'Antibiotic prophylaxis for all patients (cystoscopy with manipulation). ' + PROPHYLAXIS_NOTE,
      'Match the irrigant to the energy: saline for bipolar, glycine or water for monopolar (and check the grounding pad).',
      'Hang irrigation about 60 cm above the patient — each extra 10 cm more than doubles fluid absorption.',
      'Before resecting, inspect the bladder for tumour and note the ureteric orifices, trigone, bladder neck, verumontanum and sphincter.',
    ],
  },
  dangerZones: [
    {
      step: 2,
      structure: 'External urethral sphincter',
      risk: 'Resecting distal to the verumontanum, especially at the apex and anteriorly where the sphincter tilts proximally, causes stress incontinence.',
      bailout: 'Prevention is the only remedy: resect the apex last in a dry field and leave residual apical tissue — a repeat resection is far better than an incontinent patient.',
    },
    {
      step: 2,
      structure: 'Prostatic capsule and venous sinuses',
      risk: 'Over-resection or perforation opens venous sinuses: bleeding, extravasation and absorption of irrigant (TUR syndrome — confusion, nausea, visual change, hypertension, bradycardia).',
      bailout: 'Finish promptly and secure haemostasis; tamponade venous bleeding with an over-inflated catheter balloon on traction; check sodium (below 120 mmol/L risks seizures) and correct slowly with hypertonic saline if neurological signs appear.',
    },
    {
      step: 2,
      structure: 'Ureteric orifices',
      risk: 'A large median lobe or high bladder neck hides the orifices, which can be resected.',
      bailout: 'Identify them before resecting (70° lens, intravenous dye); if still hidden, start in the midline and take down the median lobe first — the orifices usually appear once its mass is gone.',
    },
    {
      step: 4,
      structure: 'Bladder neck and trigone',
      risk: 'Over-resecting the dorsal bladder neck undermines the trigone, and heavy fulguration of the neck predisposes to bladder-neck contracture.',
      bailout: 'Expose but do not resect the bladder-neck fibres; finish the prostatic floor last without undermining. A contracture (about 2%, typically falling flow around 6 months) is confirmed cystoscopically: dilate, then incise endoscopically if needed; open Y-V plasty for intractable cases.',
    },
  ],
  postop: [
    'Large-bore three-way catheter, balloon volume matched to the resected tissue so it does not fall into the fossa; brief traction for bleeding; continuous irrigation if the effluent is not clear.',
    'Expect 800–1000 mL of irrigant absorption even in an uncomplicated resection — prescribe IV fluids accordingly; check sodium after long or large resections.',
    'Bladder spasm or rectal pain: check the catheter is not blocked before giving antispasmodics.',
    'Remove the catheter at 24–48 hours if there was no significant perforation or bleeding; many go home on day 1.',
    'Stool softeners for about a month; avoid perineal pressure for 4–6 weeks; warn of dysuria for a few weeks and passage of tissue with minor bleeding at 1–4 weeks.',
  ],
  extrasSource: cww('Ch 146, Minimally Invasive and Endoscopic Management of BPH (TURP); ch 8 for prophylaxis', 'Helo, Welliver & McVary'),
};

const flexibleUrs: Procedure = {
  id: 'flexible-urs',
  name: 'Flexible ureteroscopy + JJ stent',
  category: 'Endourology',
  summary:
    'Retrograde endoscopic access to the ureter and kidney with a flexible ureteroscope to treat stones (holmium/thulium laser fragmentation or basketing) or inspect the upper tract, with placement of a double-J (JJ) ureteric stent when drainage is needed. AUA: obtain a urine culture and give prophylactic antibiotics first, and never operate on an untreated infection; an obstructing infected stone must be decompressed (stent or nephrostomy) before any definitive treatment. A stent may be omitted after an uncomplicated case but should be placed for a solitary or bilateral case, an impacted stone, ureteric injury, or residual obstruction.',
  anatomy: [
    'Retrograde route: urethra → bladder → ureteric orifice, cannulated under vision after cystoscopy.',
    'Three ureteric narrowings — the pelviureteric junction, the crossing of the iliac vessels, and the ureterovesical junction — are the natural points of resistance and common stone-impaction sites.',
    'Intramural (submucosal) ureter and orifice — a guidewire is passed here first and kept as a safety wire to the renal pelvis.',
    'Ureteric access sheath (optional, AUA-permitted) — eases repeated passes and lowers intrarenal pressure during laser work.',
    'Pelvicalyceal system — upper, mid and lower calyces; a steep lower-pole infundibulopelvic angle limits flexible-scope deflection to lower-pole stones.',
  ],
  steps: [
    'General or spinal anaesthesia; lithotomy position; give prophylactic antibiotics after checking the urine culture — do not proceed with an untreated infection.',
    'Cystoscopy; identify the ureteric orifice and pass a safety guidewire to the renal pelvis under fluoroscopic control.',
    'Retrograde ureteropyelogram if needed to map the collecting system and the stone.',
    'Semi-rigid ureteroscopy to inspect and treat the ureter; place a ureteric access sheath over a working wire when repeated passes are anticipated.',
    'Advance the flexible ureteroscope (over the wire or through the sheath) to the renal pelvis and inspect every calyx.',
    'Fragment the stone with the holmium/thulium laser (dusting or fragmentation) and/or retrieve fragments with a nitinol basket; send stone for analysis.',
    'Inspect for residual fragments and ureteric injury; when drainage is indicated, place a JJ stent over the wire under fluoroscopy — proximal coil in the renal pelvis, distal coil in the bladder (a stent may be omitted after an uncomplicated case).',
    'Confirm stent position; counsel on stent symptoms and arrange removal (often 1–2 weeks; a stent-on-a-string allows earlier self-removal).',
  ],
  complications: [
    'Failure to reach or clear the stone, needing a staged procedure (e.g. pre-stenting a tight ureter and returning).',
    'Post-operative urinary infection or sepsis — the key risk, higher with infected or obstructing stones.',
    'Ureteric injury: mucosal abrasion, false passage or perforation; rarely ureteric avulsion — a serious injury needing reconstruction.',
    'Stent symptoms while in situ — flank/suprapubic pain, dysuria, frequency, urgency and haematuria (very common).',
    'Haematuria, usually self-limiting.',
    'Residual stone fragments requiring further treatment.',
    'Late ureteric stricture.',
    'A retained / “forgotten” stent that encrusts if not removed on time — track and remove it.',
    'Anaesthetic and cardiovascular events.',
  ],
  citation: {
    authors: 'BAUS',
    journal: 'Patient information — ureteroscopy & laser / ureteric stent',
    year: 2023,
    url: 'https://www.baus.org.uk/patients/information_leaflets/',
    label: 'BAUS leaflet',
  },
  guideline: {
    authors: 'AUA',
    journal: 'Surgical Management of Stones Guideline',
    year: 2016,
    url: 'https://www.auanet.org/guidelines-and-quality/guidelines/surgical-management-of-kidney-and-ureteral-stones',
    label: 'AUA Surgical Stones Guideline',
  },
  preop: {
    indications: [
      'Renal and proximal ureteric stones (stone-specific choices per AUA in the summary above); upper-tract inspection or biopsy.',
      'An obstructed, infected kidney is decompressed first (stent or nephrostomy) — definitive treatment comes later.',
    ],
    workup: [
      'Non-contrast CT for stone size, position and collecting-system anatomy.',
      'Urine culture, with treatment of any infection before the procedure.',
      'Ask about previous ureteric surgery, pelvic radiation or a long-impacted stone — all raise the stricture risk.',
    ],
    setup: [
      'Antibiotic prophylaxis for all (ureteroscopy). ' + PROPHYLAXIS_NOTE,
      'Two wires for intrarenal work: a safety wire, and a working wire for the scope (monorail).',
      'Saline irrigation; pressurised irrigation when an instrument fills the working channel — but keep pressures controlled.',
      'Head-down with the ipsilateral flank raised helps find fragments, which drift upward.',
    ],
  },
  dangerZones: [
    {
      step: 3,
      structure: 'Ureteric wall (access sheath or dilation)',
      risk: 'A forced access sheath or a balloon dilation can split the ureter — perforation in 0–4% of modern series.',
      bailout: 'Stop, stent across the injury for about 4 weeks (nephrostomy if extravasation is severe), drain any urinoma, give antibiotics, and image after the stent comes out.',
    },
    {
      step: 5,
      structure: 'Proximal ureter — avulsion',
      risk: 'Forcefully basketing a large or impacted stone (or withdrawing an oversized rigid scope) can avulse the ureter, the proximal third being weakest — rare (0.06–0.5%) but catastrophic.',
      bailout: 'Never basket blind; basket only stones that fit the lumen, under vision; fragment larger ones; release an entrapped stone or dismantle the basket and laser it in situ. If avulsion happens: nephrostomy now, delayed reconstruction (psoas hitch or Boari flap distally; ileal ureter or autotransplant for long defects — not transureteroureterostomy in stone formers).',
    },
    {
      step: 5,
      structure: 'Calyces and collecting system',
      risk: 'High irrigation pressure can rupture a calyx; dust from a large stone hides fragments and the wall, inviting perforation.',
      bailout: 'Aspirate the irrigant through the scope to clear the view, or stent and stage the procedure.',
    },
    {
      step: 5,
      structure: 'Ureteric submucosa (submucosal or lost stone)',
      risk: 'A fragment pushed into the wall, or out through a perforation, raises later stricture risk.',
      bailout: 'Submucosal stone: laser it out and stent. Extruded stone: leave it, stop, stent, give antibiotics, image later — and tell the patient so it is not mistaken for a new stone.',
    },
  ],
  postop: [
    'Stent if there is oedema or injury; an uncomplicated case can safely go without one (meta-analyses).',
    'Image every patient after ureteroscopy: strictures (3–6%) can be silent.',
    'After a perforation: stent for about 4 weeks, then imaging to confirm healing and drainage.',
    'Most complications settle with simple drainage by a stent or ureteric catheter.',
  ],
  extrasSource: cww('Ch 94, Surgical Management for Upper Urinary Tract Calculi (ureteroscopy)', 'Matlaga & Krambeck'),
};

const semiRigidUrs: Procedure = {
  id: 'semi-rigid-urs',
  name: 'Semi-rigid ureteroscopy',
  category: 'Endourology',
  summary:
    'Retrograde endoscopy of the ureter with a semi-rigid ureteroscope, mainly for distal and mid-ureteric stones or ureteric inspection/biopsy, with holmium/thulium laser fragmentation or basket retrieval. Same AUA principles as flexible URS: check the urine culture and give prophylactic antibiotics first, never operate on an untreated infection, and decompress an obstructing infected stone before definitive treatment. A stent may be omitted after an uncomplicated case.',
  anatomy: [
    'Retrograde route: urethra → bladder → ureteric orifice, entered under vision after cystoscopy.',
    'Three ureteric narrowings — pelviureteric junction, iliac-vessel crossing, and ureterovesical junction — the usual sites of resistance and stone impaction.',
    'Intramural ureter and orifice — a guidewire is passed and kept as a safety wire.',
    'Distal vs proximal ureter — proximal stones are prone to retropulsion up into the kidney, where a flexible scope is then needed.',
  ],
  steps: [
    'General or spinal anaesthesia; lithotomy; prophylactic antibiotics after checking the urine culture — do not proceed with an untreated infection.',
    'Cystoscopy; identify the ureteric orifice and pass a safety guidewire to the renal pelvis under fluoroscopy.',
    'Retrograde ureterogram if needed to define the anatomy and stone.',
    'Advance the semi-rigid scope alongside the safety wire under irrigation and fluoroscopic control to the stone.',
    'Fragment the stone (laser dusting/fragmentation) and/or basket it, using an anti-retropulsion technique to avoid pushing it into the kidney; send stone for analysis.',
    'Inspect for ureteric injury; place a JJ stent over the wire when drainage is indicated (a stent may be omitted after an uncomplicated case).',
    'Counsel on stent symptoms and arrange removal.',
  ],
  complications: [
    'Stone retropulsion into the kidney, needing flexible ureteroscopy to complete.',
    'Post-operative urinary infection or sepsis — higher with infected/obstructing stones.',
    'Ureteric injury: mucosal abrasion, false passage or perforation; rarely avulsion (needs reconstruction).',
    'Stent symptoms — flank/suprapubic pain, dysuria, frequency, haematuria.',
    'Residual fragments needing further treatment; late ureteric stricture.',
    'Anaesthetic and cardiovascular events.',
  ],
  citation: {
    authors: 'BAUS',
    journal: 'Patient information — ureteroscopy & laser',
    year: 2023,
    url: 'https://www.baus.org.uk/patients/information_leaflets/',
    label: 'BAUS leaflet',
  },
  guideline: {
    authors: 'AUA',
    journal: 'Surgical Management of Stones Guideline',
    year: 2016,
    url: 'https://www.auanet.org/guidelines-and-quality/guidelines/surgical-management-of-kidney-and-ureteral-stones',
    label: 'AUA Surgical Stones Guideline',
  },
  preop: {
    indications: [
      'Distal and mid-ureteric stones; ureteric inspection or biopsy.',
      'The whole ureter is usually reachable with a rigid scope in women; in men it may not pass above the iliac vessels — plan for a flexible scope.',
      'An obstructed, infected kidney is decompressed first.',
    ],
    workup: [
      'Non-contrast CT for stone size and position.',
      'Urine culture, with treatment of any infection before the procedure.',
      'Previous ureteric surgery, pelvic radiation or a long-impacted stone raise the stricture risk.',
    ],
    setup: [
      'Antibiotic prophylaxis for all (ureteroscopy). ' + PROPHYLAXIS_NOTE,
      'Safety wire throughout; saline irrigation.',
      'Have an anti-retropulsion device and a flexible ureteroscope available in case fragments migrate to the kidney.',
    ],
  },
  dangerZones: [
    {
      step: 3,
      structure: 'Ureter at the iliac vessels',
      risk: 'Forcing a rigid scope that will not pass (often in men) perforates the ureter or creates a scabbard effect that can avulse it on withdrawal.',
      bailout: 'Do not force it: switch to a flexible scope over the wire, or leave a stent to dilate the ureter passively and return later.',
    },
    {
      step: 4,
      structure: 'Proximal ureter — avulsion',
      risk: 'Pulling a stone too large for the lumen in a basket can avulse the ureter (0.06–0.5%).',
      bailout: 'Basket only small stones under direct vision; fragment larger ones; release or dismantle the basket if trapped. After avulsion: nephrostomy and delayed reconstruction (psoas hitch or Boari flap distally).',
    },
    {
      step: 4,
      structure: 'Ureteric wall (lithotrite or basket)',
      risk: 'The laser, a lithotrite or a basket snaring the wall can cause full-thickness injury; long, bloody, tiring cases raise the risk.',
      bailout: 'If the case is not progressing, stop, stent and stage. For a perforation: stent about 4 weeks, nephrostomy if extravasation is severe, antibiotics, imaging after removal.',
    },
  ],
  postop: [
    'Stent if there is oedema or injury; an uncomplicated case can safely go without one.',
    'Image every patient afterwards: post-ureteroscopy strictures (3–6%) can be silent.',
    'Most complications settle with simple drainage by a stent or ureteric catheter.',
  ],
  extrasSource: cww('Ch 94, Surgical Management for Upper Urinary Tract Calculi (ureteroscopy)', 'Matlaga & Krambeck'),
};

const pcnl: Procedure = {
  id: 'pcnl',
  name: 'Percutaneous nephrolithotomy (PCNL)',
  category: 'Endourology',
  summary:
    'Percutaneous access to the kidney to remove large or complex stones. AUA makes PCNL first-line for stones >2 cm and for lower-pole stones >1 cm (higher stone-free rate than SWL or URS). Prone or supine positioning; ultrasound and/or fluoroscopic guidance for access; the nephrostomy tube may be omitted (tubeless) with or without a stent; mini-PCNL gives comparable clearance with fewer complications. Check the urine culture and give prophylaxis first — sepsis risk is significant.',
  anatomy: [
    'Access target: a posterior calyx (usually lower-pole) entered through the calyceal fornix along the relatively avascular plane to limit bleeding.',
    'Renal segmental arteries run anterior and posterior to the infundibula — puncturing the fornix rather than the infundibulum avoids major vessels.',
    'Pelvicalyceal anatomy and stone burden determine the tract(s) and whether more than one is needed.',
    'Pleura and lung — upper-pole / supracostal access risks pleural injury or hydrothorax.',
    'Adjacent organs — colon (retro-/paracolic, occasionally more posterior), spleen (left upper pole) and liver (right upper pole).',
  ],
  steps: [
    'Check the urine culture and give prophylactic antibiotics; do not proceed with an untreated infection.',
    'Cystoscopy and a retrograde ureteric catheter to opacify and distend the collecting system.',
    'Position prone or supine; obtain percutaneous access to a posterior calyx under ultrasound and/or fluoroscopic guidance.',
    'Pass a guidewire to the pelvis/ureter; dilate the tract and place a working sheath (standard, mini or ultra-mini).',
    'Nephroscopy; fragment the stone (ultrasonic, pneumatic or laser lithotripsy) and remove fragments; consider systemic tranexamic acid to reduce blood loss.',
    'Inspect for residual stones and bleeding, checking clearance with fluoroscopy and flexible nephroscopy.',
    'Drainage: leave a nephrostomy tube, a ureteric stent, both or neither (tubeless) depending on bleeding, perforation and residual burden.',
    'Offer secondary endoscopic removal for significant residual fragments.',
  ],
  complications: [
    'Bleeding — the main risk; may need transfusion, tamponade with a nephrostomy tube, or angioembolisation for a pseudoaneurysm / arteriovenous fistula.',
    'Post-operative sepsis / SIRS — significant, from direct exposure of the renal vasculature to urine, especially with infected or large stones.',
    'Collecting-system perforation or urine extravasation.',
    'Pleural injury, hydrothorax or pneumothorax with upper-pole (supracostal) access.',
    'Injury to adjacent organs — colon, spleen or liver.',
    'Residual stone fragments needing a second-look procedure.',
    'Loss of renal function; urinoma; anaesthetic and cardiovascular events.',
  ],
  citation: {
    authors: 'BAUS',
    journal: 'Patient information — PCNL',
    year: 2023,
    url: 'https://www.baus.org.uk/patients/information_leaflets/',
    label: 'BAUS leaflet',
  },
  guideline: {
    authors: 'AUA',
    journal: 'Surgical Management of Stones Guideline',
    year: 2016,
    url: 'https://www.auanet.org/guidelines-and-quality/guidelines/surgical-management-of-kidney-and-ureteral-stones',
    label: 'AUA Surgical Stones Guideline',
  },
  preop: {
    indications: [
      'Large or complex renal stones, including staghorn calculi (size thresholds per AUA in the summary above).',
      'Absolute contraindications: uncorrected coagulopathy and active untreated urinary infection.',
      'An obstructed, septic kidney gets a nephrostomy drain only — no stone manipulation until the infection is treated.',
    ],
    workup: [
      'CT for stone burden and the access path: retrorenal colon, liver or spleen in the track; cross-sectional imaging is essential for ectopic or transplanted kidneys and abnormal habitus.',
      'Nuclear renography for differential function with a large burden or an atrophic kidney.',
      'Blood count, electrolytes, renal function and urine culture; group and screen (cross-match usually unnecessary).',
      'Stop aspirin, antiplatelets and anticoagulants if medically feasible; bridge patients at high thrombotic risk.',
    ],
    setup: [
      'Antibiotic prophylaxis for all (percutaneous renal surgery); a preoperative broad-spectrum course if struvite or infection is suspected, and a course before instrumenting an indwelling stent. ' + PROPHYLAXIS_NOTE,
      'General anaesthesia is preferred, and needed for upper-pole access to control breathing; the anaesthetist watches airway pressure, end-tidal CO₂ and saturation for a pleural injury.',
      'Physiological (saline) irrigation only, not hung excessively high, through an Amplatz-type sheath to keep intrarenal pressure low; warm fluids and the patient against hypothermia.',
    ],
  },
  dangerZones: [
    {
      step: 2,
      structure: 'Pleura and lung',
      risk: 'Supracostal (upper-pole) puncture: pneumothorax or hydrothorax needing drainage in 1.8–8%.',
      bailout: 'Screen the chest with fluoroscopy at the end (chest X-ray if suspicious). Aspiration usually suffices as lung injury is rare; place a chest tube if it recurs.',
    },
    {
      step: 2,
      structure: 'Retrorenal colon',
      risk: 'The colon lies in the track — signs are gas or faeces in the tract, intraoperative diarrhoea, rectal bleeding; often found only on the postoperative nephrostogram or CT.',
      bailout: 'If extraperitoneal: decompress the kidney with a JJ stent or ureteric catheter and pull the nephrostomy back into the colon as a colostomy tube for at least 7 days, until contrast shows no colon–kidney communication.',
    },
    {
      step: 4,
      structure: 'Renal parenchymal and tract vessels',
      risk: 'Bleeding rises with stone burden and operating time; significant bleeding obscures vision and usually means stopping.',
      bailout: 'Stop, place a nephrostomy tube (most bleeding is venous), clamp it for a period; if it persists, a Kaye tamponade balloon; then immediate angiography — an AV fistula or pseudoaneurysm (under 1%) is embolised; partial nephrectomy is the last resort.',
    },
    {
      step: 4,
      structure: 'Collecting system wall',
      risk: 'Perforation lets irrigant extravasate; intraperitoneal spread is the dangerous kind and is hard to see in a prone patient.',
      bailout: 'Minor perforations are common — continue with a low-pressure sheath. A significant one: stop and leave a nephrostomy. Suspect intraperitoneal fluid if diastolic pressure and CVP rise, pulse pressure narrows or ventilation gets harder; treat with diuresis, peritoneal drainage or laparotomy.',
    },
  ],
  postop: [
    'The nephrostomy tube helps the tract heal, aids haemostasis, prevents extravasation, drains infection and allows re-entry; tubeless (stent only) or totally tubeless options suit selected cases.',
    'Fever above 38.5 °C follows almost a quarter of PCNLs — watch closely for sepsis.',
    'Chest X-ray after supracostal access if there is any suspicion of pneumothorax or hydrothorax.',
    'Major complications in up to 7% and minor in up to 25%; mortality 0.03–0.8%.',
    'Image for residual fragments and plan a second-look procedure where needed.',
  ],
  extrasSource: cww('Ch 94, Surgical Management for Upper Urinary Tract Calculi (PCNL)', 'Matlaga & Krambeck'),
};

const cystoscopy: Procedure = {
  id: 'cystoscopy',
  name: 'Cystoscopy ± retrograde ureteric stent',
  category: 'Endourology',
  summary:
    'Endoscopic inspection of the urethra and bladder — flexible under local anaesthetic gel, or rigid under general/spinal anaesthesia — to investigate haematuria, recurrent infection or LUTS and to survey for bladder tumours. A retrograde JJ ureteric stent can be placed at the same sitting to relieve ureteric obstruction (stone, stricture, extrinsic compression). Cystoscopy is the standard bladder evaluation in the haematuria workup.',
  anatomy: [
    'Anterior and posterior urethra — the male urethra curves and includes the membranous (sphincteric) segment, needing a gentle, well-lubricated pass.',
    'Prostatic urethra and bladder neck — assessed for obstruction or median-lobe enlargement.',
    'Bladder walls, dome and trigone — inspected systematically, including a look-back at the bladder neck.',
    'Ureteric orifices on the trigone — watched for efflux and cannulated for a retrograde study or stent.',
    'For stenting: the ureter with its three narrowings and the renal pelvis (the proximal-coil target).',
  ],
  steps: [
    'Flexible cystoscopy under local anaesthetic gel, or rigid cystoscopy under general/spinal anaesthesia; prophylactic antibiotics as indicated by the urine culture.',
    'Inspect the full urethra on the way in, then the bladder systematically — walls, dome, trigone, both ureteric orifices and the bladder neck.',
    'Biopsy or treat any lesion; document tumour site and size.',
    'For a stent: cannulate the ureteric orifice, pass a guidewire to the renal pelvis under fluoroscopy (± retrograde ureterogram) and deploy a JJ stent (proximal coil in the pelvis, distal coil in the bladder).',
    'Confirm position; counsel on stent symptoms and arrange removal or exchange.',
  ],
  complications: [
    'Transient dysuria, frequency and haematuria (common and self-limiting).',
    'Urinary tract infection.',
    'Urethral trauma or a false passage; rarely a urethral stricture.',
    'Urinary retention, especially in men with prostatic obstruction.',
    'Failure to pass the scope, needing a change of technique.',
    'If a stent is placed: stent symptoms, migration, or a retained/forgotten stent that encrusts.',
  ],
  preop: {
    indications: [
      'Haematuria; urothelial cancer surveillance; abnormal bladder imaging.',
      'Lower urinary tract symptoms, recurrent infection, incontinence or chronic pelvic pain needing assessment.',
      'Urethral stricture, small bladder stones and foreign bodies — some treatable in clinic.',
      'Ureteric obstruction needing a retrograde stent (indications mirror those for a nephrostomy).',
    ],
    workup: [
      'Urinalysis, with culture if indicated; treat any infection first — instrumenting infected urine risks bacteraemia and sepsis.',
      'Continent diversion: obtain the operative note (bowel segment, ureteric anastomoses, continence mechanism) before scoping.',
      'Suprapubic catheter: avoid scoping through the tract until it matures (several weeks).',
    ],
    setup: [
      'Diagnostic cystoscopy: no antibiotic prophylaxis unless risk factors (older age, urinary tract anomalies, poor nutrition, smoking, steroids, immunodeficiency, catheters or colonisation, distant infection, diabetes, previous UTI or instrumentation, long admission). Stent placement or other manipulation: prophylaxis for all. ' + PROPHYLAXIS_NOTE,
      'Prepare the genitalia with an aqueous iodophor — chlorhexidine and alcohol solutions damage mucous membranes.',
      'Use the smallest scope that will do the job; lidocaine gel is optional (its benefit is uncertain).',
      'Squeezing the irrigation bag as the flexible scope passes the membranous urethra cuts pain; letting men watch the screen also helps.',
    ],
  },
  dangerZones: [
    {
      step: 1,
      structure: 'Membranous urethra',
      risk: 'The tightest, most painful point for men; forcing a scope here traumatises the urethra.',
      bailout: 'Advance only with the lumen in view and the irrigation pressure up; if the scope will not pass, stop rather than force it and switch to a smaller scope or another route.',
    },
    {
      step: 3,
      structure: 'Ureter beside an impacted stone',
      risk: 'Pushing a wire around an impacted stone easily perforates the ureter.',
      bailout: 'Use an angled hydrophilic wire or torquable catheter, or pass the wire under direct vision with a rigid ureteroscope; once past, exchange it for a standard wire.',
    },
    {
      step: 3,
      structure: 'Infected obstructed collecting system',
      risk: 'Instrumenting an obstructed, infected kidney under pressure can provoke sepsis.',
      bailout: 'Aspirate the renal pelvis through an open-ended catheter; if the urine is turbid, place a stent and postpone any definitive treatment until the infection is treated.',
    },
  ],
  postop: [
    'Before withdrawing the scope, leave the bladder partly full if a catheter is to be placed.',
    'Stent symptoms are common (urinary symptoms in 78%, pain limiting activity in 80%): alpha-blockers and antimuscarinics both help; stent material, design and diameter make little difference.',
    'Record every stent with a planned removal or exchange date so none is forgotten.',
  ],
  extrasSource: cww('Ch 13, Principles of Urologic Endoscopy; ch 12 for stent tolerance', 'Duty & Conlin'),
  citation: {
    authors: 'BAUS',
    journal: 'Patient information — flexible/rigid cystoscopy',
    year: 2023,
    url: 'https://www.baus.org.uk/patients/information_leaflets/',
    label: 'BAUS leaflet',
  },
  guideline: {
    authors: 'AUA',
    journal: 'Microhematuria Guideline',
    year: 2020,
    url: 'https://www.auanet.org/guidelines-and-quality/guidelines/microhematuria',
    label: 'AUA Microhematuria Guideline',
  },
};

const turbt: Procedure = {
  id: 'turbt',
  name: 'TURBT (transurethral resection of bladder tumour)',
  category: 'Endourology',
  summary:
    'Endoscopic resection of a bladder tumour — simultaneously diagnostic, staging and therapeutic. AUA calls for complete visual resection whenever technically feasible, with detrusor (muscularis propria) in the specimen: absent muscle risks understaging and early recurrence, and tumour is seen at first surveillance cystoscopy in up to 45% of patients after incomplete resection. Blue-light cystoscopy should be offered where available to improve detection and reduce recurrence.',
  anatomy: [
    'Bladder wall layers — urothelium → lamina propria → muscularis propria (detrusor) → perivesical fat; depth of invasion defines the T stage, so the resected base must contain detrusor.',
    'Bladder dome — the thinnest, least-supported area and the usual site of intraperitoneal perforation.',
    'Lateral bladder walls — the obturator nerve runs immediately adjacent; diathermy here triggers a sudden adductor jerk (obturator reflex) that can drive the loop through the wall.',
    'Trigone and ureteric orifices — resect conservatively nearby to avoid orifice stricture or reflux.',
    'Prostatic urethra — inspected because involvement alters staging and management.',
  ],
  steps: [
    'General or spinal anaesthesia; note that spinal block does not abolish the obturator reflex — an obturator nerve block or muscle relaxant may be needed for lateral-wall tumours.',
    'Bimanual examination under anaesthesia before and after resection to assess a palpable or fixed mass.',
    'Cystoscopy and mapping of all lesions; use blue-light (or narrow-band) cystoscopy where available.',
    'Resect the tumour completely, then resect the base separately to include detrusor muscle, and send it as a separate specimen for staging.',
    'Keep the bladder only moderately filled — overdistension thins the wall and invites perforation.',
    'Coagulate the tumour base and secure haemostasis; inspect for perforation.',
    'Give a single intravesical chemotherapy instillation within 24 h for low- or intermediate-risk disease — but withhold it if perforation is suspected or the resection was extensive.',
    'Leave a catheter on irrigation; plan a repeat TURBT within 6 weeks for T1 disease, high-grade Ta, or when resection was incomplete or muscle is absent.',
  ],
  complications: [
    'Bladder perforation — usually extraperitoneal (managed with catheter drainage); an intraperitoneal dome perforation may need formal repair.',
    'Obturator reflex causing a sudden adductor contraction, with perforation or vessel injury.',
    'Bleeding needing transfusion, clot retention or return to theatre.',
    'TUR syndrome from absorption of hypotonic irrigant (monopolar resection).',
    'Urinary infection or sepsis.',
    'Understaging or early recurrence when the resection is incomplete or lacks detrusor muscle.',
    'Urethral stricture or bladder-neck scarring.',
    'Chemical cystitis from the immediate intravesical instillation.',
  ],
  citation: {
    authors: 'BAUS',
    journal: 'Patient information — bladder tumour resection',
    year: 2023,
    url: 'https://www.baus.org.uk/patients/information_leaflets/',
    label: 'BAUS leaflet',
  },
  guideline: {
    authors: 'AUA',
    journal: 'Non-Muscle-Invasive Bladder Cancer Guideline',
    year: 2020,
    url: 'https://www.auanet.org/guidelines-and-quality/guidelines/bladder-cancer-non-muscle-invasive-guideline',
    label: 'AUA NMIBC Guideline',
  },
  preop: {
    indications: [
      'A bladder tumour seen at flexible cystoscopy — tissue is needed for grade and stage even when it looks low grade.',
      'Suspected recurrence on surveillance.',
      'Restaging resection after a first TURBT (see the last step).',
    ],
    workup: [
      'Antithrombotics: the authors continue aspirin; plan stopping or bridging of warfarin, heparin and P2Y12 inhibitors with the relevant team.',
      'Examination including DRE in men (prostatic involvement) and bimanual examination in women (anterior vaginal wall).',
      'Blood count, renal function, coagulation, and urine culture — treat infection and delay resection until it clears.',
      'Upper tract imaging: CT urogram if GFR > 60, MRI if GFR > 30, or ultrasound with retrograde pyelography; full staging of chest, abdomen and pelvis if invasion is suspected.',
      'Tumour over a ureteric orifice: be ready for ureteroscopy, a stent and fluoroscopy.',
    ],
    setup: [
      'Dorsal lithotomy; rigid cystoscope with a visual obturator; 30° then 70° lens (bladder neck, dome, anterior wall).',
      'Antibiotic prophylaxis for all patients within 1 hour (AUA); the chapter authors prefer a non-fluoroquinolone where possible. ' + PROPHYLAXIS_NOTE,
      'Irrigant: water or 1.5% glycine for monopolar, saline for bipolar — bipolar also lowers electrolyte risk and may damp the obturator reflex.',
      'Narrow-band imaging or blue-light cystoscopy whenever available.',
    ],
  },
  dangerZones: [
    {
      step: 3,
      structure: 'Obturator nerve',
      risk: 'Diathermy on the lateral wall stimulates the nerve; the leg adducts and the loop is driven through the bladder wall.',
      bailout: 'Minimise bladder distension, use bipolar current if available, and ask for a muscle relaxant under general anaesthesia. Manage any perforation as below.',
    },
    {
      step: 3,
      structure: 'Ureteric orifice',
      risk: 'Coagulating over the orifice can seal it, causing obstruction.',
      bailout: 'Use pure cutting current with quick strokes. Routine stenting is not needed (hydronephrosis in about 4%), but a short-term stent is reasonable after a large resection or heavy cautery.',
    },
    {
      step: 3,
      structure: 'Bladder dome and adjacent bowel',
      risk: 'Dome and posterior tumours risk intraperitoneal perforation (about 0.36%); prolonged cautery can injure bowel even without perforation.',
      bailout: 'Suspect it with loss of distension, a visible defect or a distending abdomen; confirm with an on-table cystogram; treat by laparotomy, bowel inspection, repair, catheter and drain.',
    },
    {
      step: 5,
      structure: 'Bladder wall — extraperitoneal perforation',
      risk: 'A deep resection elsewhere in the bladder perforates outside the peritoneum — sometimes the natural result of an adequate resection of an advanced tumour.',
      bailout: 'Catheter drainage and observation; do not give the immediate intravesical instillation.',
    },
  ],
  postop: [
    'Single intravesical chemotherapy instillation within 24 hours if there is no perforation: in a meta-analysis it cut recurrence from 50% to 37% (number needed to treat about 7).',
    'BCG for high-grade disease is never given immediately — wait 2–4 weeks and confirm there is no visible haematuria.',
    'Extraperitoneal perforation: catheter drainage until healed; intraperitoneal: managed surgically as above.',
    'Check the pathology report for detrusor muscle and plan restaging resection where indicated.',
  ],
  extrasSource: cww('Ch 138, Surgical Management of Bladder Cancer (transurethral resection)', 'Navai & Dinney'),
};

const eswl: Procedure = {
  id: 'eswl',
  name: 'Shockwave lithotripsy (SWL / ESWL)',
  category: 'Endourology',
  summary:
    'Non-invasive fragmentation of a kidney or ureteric stone with externally focused shockwaves, localised by fluoroscopy or ultrasound. AUA advises starting at low energy and ramping up gradually to reduce bleeding complications, and requires a urine culture beforehand — definitive stone treatment must not proceed with untreated bacteriuria. Clearance is lower than PCNL for lower-pole stones >1 cm.',
  anatomy: [
    'Stone target — localised and kept at the focal point by fluoroscopy or ultrasound throughout treatment.',
    'Skin-to-stone distance — a longer distance (obesity) attenuates the shockwave and lowers success.',
    'Renal parenchyma and intrarenal vessels lying in the shockwave path — the source of subcapsular and perinephric haematoma.',
    'Lower-pole calyx — a steep infundibulopelvic angle and long, narrow infundibulum impede clearance of fragments even after good fragmentation.',
    'Ureter — the route for fragment passage, where a column of fragments can stack into a steinstrasse.',
  ],
  steps: [
    'Check the urine culture and treat any infection first; exclude pregnancy and correct coagulopathy or stop anticoagulants.',
    'Position the patient and localise the stone at the focal point with fluoroscopy and/or ultrasound.',
    'Begin at low energy and increase the energy gradually — this ramping reduces the risk of bleeding complications.',
    'Deliver shocks at a controlled rate, re-localising the stone periodically as it moves with respiration.',
    'Consider a ureteric stent for a large stone burden to reduce obstructive steinstrasse; routine stenting is not required.',
    'Post-treatment: analgesia, hydration, and medical expulsive therapy may aid fragment passage.',
    'Arrange follow-up imaging to confirm clearance; offer retreatment or ureteroscopy/PCNL for significant residual fragments.',
  ],
  complications: [
    'Steinstrasse — a column of fragments obstructing the ureter, which may need stenting or ureteroscopy.',
    'Renal subcapsular or perinephric haematoma.',
    'Haematuria — near-universal and usually transient.',
    'Renal colic during fragment passage.',
    'Residual fragments needing retreatment or a different modality.',
    'Urinary infection or sepsis, particularly with an infected stone.',
    'Failure to fragment — denser stones and a long skin-to-stone distance predict this.',
  ],
  preop: {
    indications: [
      'Selected renal and ureteric stones (size and location thresholds per AUA in the summary above); lower stone-free rates than endoscopy for some sizes and sites must be weighed.',
      'Not with untreated bacteriuria, pregnancy or uncorrected coagulopathy.',
    ],
    workup: [
      'Urine culture; pregnancy test where relevant; stop or manage anticoagulants and antiplatelets.',
      'Haematoma risk factors: older age (risk 2.2-fold per decade), obesity or low BMI (>30 or <21.5), coagulopathy, low platelets, diabetes, coronary disease and hypertension — control blood pressure first.',
    ],
    setup: [
      'Antibiotic prophylaxis for all (SWL). ' + PROPHYLAXIS_NOTE,
      'General anaesthesia gives the best results (stone-free 78–87% vs 51–55% with sedation) by limiting respiratory movement — the kidney can move up to 50 mm.',
      'Good coupling: water-soluble lubricant applied by hand.',
      'Plan a slow to intermediate rate (60–90 shocks/min), ramping up from low power, with frequent imaging — stop once fragmented rather than giving a preset number of shocks.',
    ],
  },
  dangerZones: [
    {
      step: 2,
      structure: 'Renal parenchyma and vessels',
      risk: 'Shockwaves injure vessels: clinically significant haematomas in 3–12% with high-pressure machines, rarely needing transfusion or embolisation.',
      bailout: 'Prevent it — control blood pressure, start at low power and ramp, treat slowly. Most haematomas resolve within weeks; severe bleeding may need transfusion or angiographic embolisation.',
    },
    {
      step: 3,
      structure: 'Stone off the focal point',
      risk: 'With breathing, as few as 60% of shocks may hit the stone — wasted energy still reaches the kidney.',
      bailout: 'Re-image often, re-target, and favour general anaesthesia (or jet ventilation) to limit movement.',
    },
    {
      step: 4,
      structure: 'Ureter — steinstrasse',
      risk: 'A column of fragments can obstruct the ureter after treatment of a large burden.',
      bailout: 'AUA does not advise routine stents with SWL (no better clearance, more morbidity); treat an obstructing steinstrasse with a stent or ureteroscopy.',
    },
  ],
  postop: [
    'An alpha-blocker after SWL improves stone-free rates (70.8% vs 33.3% in one trial) and pain control.',
    'Percussion, diuresis and inversion helps clear lower-pole fragments.',
    'Image to confirm clearance; residual fragments raise later stone recurrence.',
    'Long-term data show no convincing link to hypertension, chronic kidney disease or diabetes; sperm quality dips after distal ureteric treatment but recovers by 3 months.',
  ],
  extrasSource: cww('Ch 94, Surgical Management for Upper Urinary Tract Calculi (SWL); ch 8 for prophylaxis', 'Matlaga & Krambeck'),
  citation: {
    authors: 'BAUS',
    journal: 'Patient information — shockwave lithotripsy',
    year: 2023,
    url: 'https://www.baus.org.uk/patients/information_leaflets/',
    label: 'BAUS leaflet',
  },
  guideline: {
    authors: 'AUA',
    journal: 'Surgical Management of Stones Guideline',
    year: 2016,
    url: 'https://www.auanet.org/guidelines-and-quality/guidelines/surgical-management-of-kidney-and-ureteral-stones',
    label: 'AUA Surgical Stones Guideline',
  },
};

const opticalUrethrotomy: Procedure = {
  id: 'optical-urethrotomy',
  name: 'Optical urethrotomy (DVIU)',
  category: 'Endourology',
  summary:
    'Endoscopic incision of a urethral stricture under direct vision. AUA restricts its role: it is a reasonable first option for a short bulbar stricture (<2 cm, best under 1 cm) with success around 35–70%, but success for strictures >2 cm is very low. For a long (≥2 cm) bulbar stricture, a penile stricture, or a stricture that has already recurred after dilation/DVIU, urethroplasty should be offered instead of repeat endoscopic treatment (success 80–95%).',
  anatomy: [
    'Anterior urethra — bulbar and penile segments; the bulbar urethra is the commonest site amenable to DVIU.',
    'Corpus spongiosum surrounding the urethra — the depth of spongiofibrosis in the scar governs the chance of recurrence.',
    'Incision site — the bulbar stricture is conventionally incised at the 12 o’clock position, away from the deeper ventral spongiosal vessels.',
    'External (distal) sphincter proximally — the incision is kept clear of it to protect continence.',
    'Stricture length and location — the single strongest predictor of success; short bulbar strictures do best.',
  ],
  steps: [
    'Map the stricture beforehand with a retrograde urethrogram (± antegrade study) to document length and location.',
    'General or spinal anaesthesia; lithotomy; prophylactic antibiotics guided by the urine culture.',
    'Urethroscopy to inspect the stricture and confirm its length.',
    'Pass a guidewire across the stricture into the bladder to act as a guide and safety.',
    'Incise the scar under direct vision with a cold knife (or laser), classically at 12 o’clock in the bulbar urethra, through the full depth of the scar until the lumen opens.',
    'Confirm the scope now passes freely into the bladder.',
    'Leave a urethral catheter — after an uncomplicated dilation or DVIU it may be removed within 72 hours.',
    'Counsel on recurrence: offer urethroplasty rather than repeat endoscopic treatment if it recurs; in patients unsuitable for urethroplasty, intermittent self-catheterisation may be advised to maintain patency.',
  ],
  complications: [
    'Recurrence — the dominant problem; endoscopic success is only ~35–70% even for short bulbar strictures and much lower for longer ones.',
    'Bleeding from the corpus spongiosum.',
    'Extravasation of irrigation fluid through a false passage.',
    'Urinary infection.',
    'Urinary incontinence if the incision is carried into the external sphincter (uncommon).',
    'Erectile dysfunction (uncommon).',
    'Progression to needing formal urethroplasty.',
  ],
  preop: {
    indications: [
      'Best case: a bulbar stricture under 1.5 cm without dense, deep spongiofibrosis (about 74% long-term success). Outside the bulbar urethra, long-term cures are rare.',
      'Overall curative success is only about 20–35%, and a second urethrotomy adds virtually nothing.',
      'Palliation is acceptable if that is the agreed goal; repeated dilations and urethrotomies make later reconstruction less successful.',
    ],
    workup: [
      'Define location, length, depth and density of the scar: dynamic retrograde and voiding urethrograms in a steep oblique position (otherwise length is underestimated), with IV-grade contrast — not jelly-thickened.',
      'Urethroscopy (a flexible or paediatric scope to the stricture, without dilating it at the first look); ultrasound helps measure bulbar stricture length.',
      'Retention with unknown stricture anatomy: place a suprapubic catheter — blind filiforms and dilation are condemned.',
    ],
    setup: [
      'Saline irrigation (limits harm from extravasation).',
      'Antibiotic prophylaxis for all (urethral instrumentation with manipulation). ' + PROPHYLAXIS_NOTE,
      'Guidewire across the stricture under direct vision before any incision.',
    ],
  },
  dangerZones: [
    {
      step: 3,
      structure: 'Urethral wall (false passage)',
      risk: 'Blind passage of wires, filiforms or dilators creates a false passage.',
      bailout: 'Pass the wire only under direct vision; if it will not cross, stop and drain the bladder suprapubically, then plan definitive repair.',
    },
    {
      step: 4,
      structure: 'Thin dorsal spongiosum and triangular ligament',
      risk: 'The spongiosum is thinnest from 10 to 2 o’clock; a deep 12 o’clock cut in the bulbar urethra can pass into the triangular ligament or intracrural space.',
      bailout: 'Incise only through the scar to healthy tissue. If spongiofibrosis is deep, urethrotomy cannot cure it — stop and offer urethroplasty.',
    },
    {
      step: 4,
      structure: 'Corpora cavernosa',
      risk: 'Deep incisions in the distal anterior (penile) urethra, or vigorous 10 and 2 o’clock cuts, enter the corpora — spongiosal–cavernosal fistula and veno-occlusive erectile dysfunction.',
      bailout: 'Avoid deep distal incisions altogether; penile strictures belong to urethroplasty.',
    },
    {
      step: 4,
      structure: 'Perispongiosal tissue',
      risk: 'Irrigant extravasates into the tissues around the spongiosum; bleeding is usually with erections soon after surgery.',
      bailout: 'Use saline, keep pressure low and finish promptly; leave a catheter.',
    },
  ],
  postop: [
    'Catheter for about 3–5 days — leaving it 6 weeks gives no better results than 3–7 days.',
    'A tapering self-catheterisation (obturation) regimen over 3–6 months can manage a motivated patient, but the stricture tends to return once it stops.',
    'Recurrence is the rule rather than the exception: offer urethroplasty rather than repeating the urethrotomy.',
  ],
  extrasSource: cww('Ch 82, Surgery for Benign Disorders of the Penis and Urethra', 'Virasoro, Jordan & McCammon'),
  citation: {
    authors: 'BAUS',
    journal: 'Patient information — optical urethrotomy',
    year: 2023,
    url: 'https://www.baus.org.uk/patients/information_leaflets/',
    label: 'BAUS leaflet',
  },
  guideline: {
    authors: 'AUA',
    journal: 'Urethral Stricture Guideline',
    year: 2023,
    url: 'https://www.auanet.org/guidelines-and-quality/guidelines/urethral-stricture-guideline',
    label: 'AUA Urethral Stricture Guideline',
  },
};

const bladderUreteralTrauma: Procedure = {
  id: 'bladder-ureteral-trauma',
  name: 'Bladder & ureteral injury repair (trauma)',
  category: 'Trauma',
  summary:
    'Operative management of bladder and ureteral injury (blunt, penetrating, iatrogenic). Most extraperitoneal bladder ruptures are managed with catheter drainage; intraperitoneal rupture needs repair. Ureteral injuries usually need repair — principles: preserve viability, tension-free anastomosis, low-pressure drainage.',
  anatomy: [
    'Bladder dome — the thinnest, least-supported part; the usual site of intraperitoneal rupture.',
    'Extraperitoneal ruptures — typically anterior/anterolateral lower bladder with pelvic fracture; avoid entering the pelvic haematoma.',
    'Trigone and ureteric orifices — must be protected during posterolateral bladder repair.',
    'Ureteric blood supply — a longitudinal vessel runs its length in >80%; dissect in the adventitial plane to preserve perfusion.',
    'Psoas muscle and bladder mobility — used for a psoas hitch (proximal injuries); a Boari flap bridges longer defects.',
  ],
  steps: [
    'Intraperitoneal bladder: lower midline laparotomy; inspect the bladder internally and check ureteric efflux; conservative debridement; two-layer absorbable closure; leave a urethral catheter.',
    'Extraperitoneal bladder needing repair: repair transvesically via an anterior cystotomy cephalad to the pelvic haematoma to avoid catastrophic bleeding; spare the ureteric orifices.',
    'Penetrating bladder: anterior cystotomy; identify entrance/exit wounds; exclude trigone/ureteric involvement; two-layer closure.',
    'Upper/mid ureter: debride to healthy bleeding tissue; spatulate both ends; tension-free end-to-end anastomosis over a stent.',
    'Distal ureter: ureteroneocystostomy (reimplant), ± antireflux tunnel; psoas hitch for more proximal loss; Boari flap for long defects.',
  ],
  complications: [
    'Urine leak / urinoma; fistula (especially with concomitant vaginal or rectal injury).',
    'Catastrophic haemorrhage if the pelvic haematoma is entered.',
    'Ureteric stricture / devascularisation; anastomotic leak.',
    'Missed injury — haematuria is absent in up to ~30% of penetrating ureteric injuries.',
    'Reduced bladder capacity after extensive tissue loss.',
  ],
  preop: {
    indications: [
      'Repair the bladder immediately for: intraperitoneal injury from external trauma; penetrating or iatrogenic non-urological injury; poor catheter drainage or clots; bladder neck injury; rectal or vaginal injury; open pelvic fracture; pelvic fracture needing internal fixation; bone fragments projecting into the bladder; and selected stable patients already at laparotomy.',
      'Uncomplicated extraperitoneal rupture: a large-bore (22 Fr) urethral catheter alone (AUA Urotrauma statement 16).',
      'Ureter: repair at the first laparotomy when the patient is stable; in the unstable, complex polytrauma patient choose damage control and stage the repair.',
    ],
    workup: [
      'Cystography: absolute indication is gross haematuria with a pelvic fracture (about 29% have a rupture). Relative: gross haematuria without a fracture, or microhaematuria with one (0.6%). Penetrating buttock, pelvic or lower-abdominal wounds with any haematuria warrant cystography.',
      'Fill retrogradely to discomfort or 350 mL — 250 mL gives false negatives. A plain-film study needs a drainage film; a CT cystogram needs contrast diluted to 2–4% (6:1 with saline). Clamping the catheter after IV contrast is not adequate.',
      'Blood at the meatus or a catheter that will not pass: retrograde urethrogram first — urethral injury accompanies 10–29% of bladder ruptures.',
      'Ureter: 25–45% have no haematuria at all. CT urography with delayed images (about 10 minutes after contrast); look for extravasation, a delayed nephrogram, hydronephrosis, no contrast in the distal ureter or a urinoma, and trace both ureters along their whole course.',
    ],
    setup: [
      'Antibiotics: extraperitoneal rupture from the day of injury for at least 1 week; intraperitoneal rupture for 3 days peri-operatively.',
      'Exploration without prior imaging: be ready to check orifice efflux with IV indigo carmine or a retrograde ureteric catheter. Avoid IV methylene blue in pregnancy, with SSRIs, SNRIs or MAOIs (serotonin toxicity) and in G6PD deficiency; it also lowers pulse-oximetry readings.',
      'Ureteric stents, a retroperitoneal drain and long silk or polypropylene ties (for damage-control ligation) available.',
    ],
  },
  dangerZones: [
    {
      step: 0,
      structure: 'Rectum or vagina',
      risk: 'An associated rectal or vaginal injury left with overlapping suture lines fistulates.',
      bailout: 'Separate the organ walls, avoid overlapping suture lines and interpose viable tissue; fibrin sealant over the bladder closure can help when no tissue is available.',
    },
    {
      step: 1,
      structure: 'Perivesical pelvic haematoma',
      risk: 'Disturbing the haematoma around an extraperitoneal rupture risks major bleeding.',
      bailout: 'Open the anterior bladder wall in the midline and close the tear from inside with absorbable suture; leave the haematoma alone.',
    },
    {
      step: 1,
      structure: 'Bladder neck',
      risk: 'An unrecognised bladder neck injury leads to incontinence, fistula or stricture and a difficult delayed reconstruction.',
      bailout: 'Inspect the bladder neck through the cystotomy; a bladder neck injury is an indication for immediate repair.',
    },
    {
      step: 2,
      structure: 'Ureteric orifices and intramural ureter',
      risk: 'Penetrating injuries explored without imaging can involve an orifice and be missed.',
      bailout: 'Look for clear efflux from both orifices (IV indigo carmine or a retrograde ureteric catheter). An orifice or intramural injury needs closure with a stented reimplant and a perivesical drain.',
    },
    {
      step: 3,
      structure: 'Ureteric adventitial blood supply',
      risk: 'The ureteric supply is tenuous; stripping it during exploration gives leak, stricture, and sometimes nephrectomy.',
      bailout: 'Mobilise with a wide cuff of adventitia, debride until the edges bleed, then a spatulated, tension-free, stented, watertight repair with a drain. Close peritoneum over it; consider omentum after blast injury or vascular repair.',
    },
    {
      step: 3,
      structure: 'Unstable patient',
      risk: 'A formal ureteric repair is too long for a patient in shock, with uncontrolled bleeding or a major colon injury.',
      bailout: 'Damage control: tie the proximal ureter with long silk or polypropylene and place a percutaneous nephrostomy once stable, or bring a single-J stent or 5 Fr feeding tube out to the skin; reconstruct later.',
    },
    {
      step: 4,
      structure: 'Genitofemoral nerve',
      risk: 'The nerve on psoas can be injured or caught in the hitch sutures.',
      bailout: 'Place hitch sutures in psoas and the psoas minor tendon clear of the nerve; divide the contralateral superior vesical pedicle if more reach is needed.',
    },
    {
      step: 4,
      structure: 'Reimplant tunnel',
      risk: 'A tunnelled reimplant in trauma carries a higher risk of obstruction than of clinically important reflux.',
      bailout: 'Use a long, non-tunnelled, widely spatulated, stented anastomosis.',
    },
  ],
  postop: [
    'Extraperitoneal rupture on catheter drainage: cystogram before catheter removal at 14 days; if it still leaks, keep draining for several weeks and re-image.',
    'Bladder repaired at laparotomy or internal fixation: large-bore urethral catheter alone; cystogram about 1 week after repair (7–10 days after intraperitoneal repair). A suprapubic tube adds nothing (AUA Urotrauma statement 18).',
    'Missed bladder injury shows as acidosis, azotaemia, fever or sepsis, low urine output, peritonitis, ileus or urinary ascites.',
    'Missed ureteric injury: fever, leucocytosis and local peritoneal irritation should prompt CT; retrograde ureterogram with a stent attempt, or nephrostomy and an antegrade stent for 6 weeks if that fails (83–88% success).',
    'Delayed recognition: repair if found within 1 week; otherwise stent or nephrostomy and definitive repair at 6 weeks or later.',
    'After ureteric repair: diuretic renogram or ultrasound at 4–12 weeks and at 1 year — late stenosis is often silent.',
  ],
  extrasSource: cww('Ch 133, Genital and Lower Urinary Tract Trauma; ch 90, Upper Urinary Tract Trauma', 'Morey & Simhan; Brandes & Eswara'),
  citation: {
    authors: 'Coburn',
    journal: 'Oper Tech Gen Surg',
    year: 2000,
    doi: '10.1053/otgn.2000.17745',
    url: 'https://doi.org/10.1053/otgn.2000.17745',
  },
  guideline: {
    authors: 'AUA',
    journal: 'Urotrauma Guideline',
    year: 2020,
    url: 'https://www.auanet.org/guidelines-and-quality/guidelines/urotrauma-guideline',
    label: 'AUA Urotrauma Guideline',
  },
};

const ureteralReconstruction: Procedure = {
  id: 'ureteral-reconstruction',
  name: 'Ureteral reconstruction (injury repair)',
  category: 'Reconstruction',
  summary:
    'The reconstructive ladder for ureteral injury or stricture, chosen by the level and length of the defect — primary uretero-ureterostomy (upper/mid), transuretero-ureterostomy, ureteroneocystostomy ± psoas hitch (distal), and a Boari flap for long defects. Principles: preserve peri-ureteric blood supply, tension-free, spatulated, stented anastomoses.',
  anatomy: [
    'The ureter crosses the iliac-vessel bifurcation entering the pelvis — a reliable point for identification.',
    'Ureteric blood supply travels in the peri-adventitial tissue; mobilise that tissue with the ureter and avoid skeletonising it.',
    'Psoas hitch nerves: the genitofemoral nerve runs over psoas (avoid in sutures); the femoral nerve lies behind psoas major (avoid deep sutures).',
    'Bladder pedicles (superior/inferior vesical) — divided contralaterally to gain bladder mobility for a hitch or flap.',
  ],
  steps: [
    'Uretero-ureterostomy (upper/mid): spatulate both ends 180° apart; tension-free interrupted absorbable anastomosis with extraluminal knots, over a 6Fr stent.',
    'Transuretero-ureterostomy: tunnel the donor ureter through the retroperitoneum cephalad to the IMA to the contralateral ureter; end-to-side, stented.',
    'Ureteroneocystostomy (distal): direct refluxing reimplant to the bladder dome if length allows; spatulate, anastomose, stent.',
    'Psoas hitch: mobilise the bladder, transverse cystotomy, elevate the dome above the iliac vessels and fix to psoas (sparing genitofemoral/femoral nerves); then reimplant.',
    'Boari flap: tubularise an anterior bladder flap (base ≥ 4 cm, apex ~3 cm) to bridge long defects, combined with a psoas hitch; stent; leave a perivesical drain.',
  ],
  complications: [
    'Anastomotic leak / urinoma.',
    'Ureteric stricture or devascularisation.',
    'Reflux (usually clinically insignificant in adults).',
    'Genitofemoral / femoral nerve injury with a psoas hitch.',
    'Reduced bladder capacity after a Boari flap / psoas hitch.',
  ],
  preop: {
    indications: [
      'Choose by level and length. Uretero-ureterostomy only for short upper or mid defects — tension almost always ends in stricture, and whether the ends will meet is often clear only at surgery, so be ready to switch.',
      'Ureteroneocystostomy for the distal 3–4 cm; a psoas hitch adds up to 5 cm (a defect above the pelvic brim usually needs more); a Boari flap bridges 10–15 cm; renal descensus gains up to 8 cm.',
      'Contraindications: small contracted bladder (hitch or flap); for TUU, a diseased recipient ureter or a donor too short to reach without tension. TUU is relatively contraindicated with stones, retroperitoneal fibrosis, urothelial cancer, chronic pyelonephritis or pelvic radiation.',
      'Endoscopic incision is an alternative only for strictures under 2 cm without active infection, and needs about 25% function in that kidney.',
    ],
    workup: [
      'IVP or antegrade nephrostogram plus retrograde pyelogram for location and length; diuretic renogram for function; ureteroscopy, barbotage or brushings to exclude carcinoma when indicated.',
      'Before a hitch or flap: urodynamics for capacity and compliance; treat outlet obstruction or neurogenic dysfunction first.',
      'Before TUU: voiding cystogram — reflux into the recipient ureter must be corrected at the same time.',
    ],
    setup: [
      'Incision by level: flank for the upper ureter; Gibson or lower midline for the mid and lower ureter. After an injury at Pfannenstiel surgery, reuse it with a hockey-stick extension. Extraperitoneal unless the injury was transperitoneal; TUU is midline transperitoneal.',
      'Vessel loop or Penrose sling for the ureter, fine absorbable sutures, double-J stents and a drain. Methylene blue in the bladder irrigant confirms the distal coil is in the bladder.',
    ],
  },
  dangerZones: [
    {
      step: 0,
      structure: 'Ureteric adventitia',
      risk: 'Forceps handling and stripping the adventitia devascularise the ends — leak and stricture.',
      bailout: 'Handle the ureter with a sling, keep its adventitia, and trim to healthy tissue (after a gunshot wound, take an extra segment of normal-looking ureter too).',
    },
    {
      step: 0,
      structure: 'Anastomotic tension',
      risk: 'An end-to-end repair under tension almost always strictures.',
      bailout: 'If the spatulated ends do not meet freely, change plan: reimplant with a psoas hitch or Boari flap, TUU, or renal descensus.',
    },
    {
      step: 1,
      structure: 'Inferior mesenteric artery',
      risk: 'A donor ureter passed below the IMA is tethered and kinks; revisions for this are reported.',
      bailout: 'Tunnel under the sigmoid mesentery above the IMA.',
    },
    {
      step: 1,
      structure: 'Recipient ureter',
      risk: 'Surgery on the healthy contralateral ureter can turn a one-sided problem into a bilateral one.',
      bailout: 'Expose only the length needed (about 5 cm), make an anteromedial ureterotomy and stent across the anastomosis.',
    },
    {
      step: 3,
      structure: 'Genitofemoral nerve and iliac vein',
      risk: 'Hitch sutures can catch the genitofemoral nerve; nerve, bowel and iliac vein injuries are reported.',
      bailout: 'Place sutures in psoas and the psoas minor tendon under vision, clear of the nerve; divide the contralateral superior vesical pedicle rather than pull harder.',
    },
    {
      step: 4,
      structure: 'Flap blood supply',
      risk: 'Recurrent stricture from ischaemia or tension is the commonest complication of a Boari flap.',
      bailout: 'Raise a well-vascularised flap without tension; with a small bladder, plan an alternative (TUU, ileal ureter) rather than a short flap.',
    },
  ],
  postop: [
    'Drain plus urethral catheter for 1–2 days; remove the drain after 24–48 hours of minimal output (check drain fluid creatinine if the peritoneum was opened).',
    'Double-J stent out endoscopically at 4–6 weeks. Uretero-ureterostomy succeeds in over 90% and a psoas hitch reimplant in over 85%.',
    'Leak: plain film for stent position, move the drain off the anastomosis and stop suction; catheter and an anticholinergic for reflux or spasm; nephrostomy if it persists.',
    'Counsel on function: in one reimplant series (most with a hitch ± Boari flap) eGFR fell in 44% over 2 years even though hydronephrosis resolved.',
    'After repair of a traumatic injury: diuretic renogram or ultrasound at 4–12 weeks and at 1 year, because late stenosis is often silent.',
  ],
  extrasSource: cww('Ch 89, Management of Upper Urinary Tract Obstruction; ch 90, Upper Urinary Tract Trauma', 'Nakada & Best; Brandes & Eswara'),
  citation: {
    authors: 'LaFontaine',
    journal: 'Oper Tech Gen Surg',
    year: 2008,
    doi: '10.1053/j.optechgensurg.2008.01.004',
    url: 'https://doi.org/10.1053/j.optechgensurg.2008.01.004',
  },
  guideline: {
    authors: 'EAU',
    journal: 'Urological Trauma Guideline',
    year: 2024,
    url: 'https://uroweb.org/guidelines/urological-trauma',
    label: 'EAU Urological Trauma Guideline',
  },
};

const retroperitonealExposure: Procedure = {
  id: 'retroperitoneal-exposure',
  name: 'Left retroperitoneal exposure',
  category: 'Surgical access',
  summary:
    'Retroperitoneal approach to the aorta/great vessels (and anterolateral spine) — also the access used for the kidney and great vessels. Avoids a hostile peritoneal cavity and reduces fluid shifts; the left side is preferred for aortic exposure.',
  anatomy: [
    'Plane between transversus abdominis and the peritoneum (developed laterally); the peritoneum is swept medially.',
    'The left kidney is swept anteriorly after ligating left-renal-vein branches to expose the perivisceral aorta.',
    'The ureter is identified medially on the peritoneal sac.',
    'Vertebra–vessel relationships: L1–L4 needs aortic mobilisation (left RP), L4–L5 lies behind the aortic bifurcation, L5–S1 by a direct anterior approach.',
    'Costal margin, diaphragm, pleura and spleen (avoid traction) are the key superior landmarks.',
  ],
  steps: [
    'Position: torso rotated right, hips flat for groin access, beanbag support, table flexion for exposure; pad all pressure points.',
    'Incision at the 9th/10th/11th interspace (mid-axillary) ± 12th-rib resection; carry medially to the rectus edge or midline.',
    'Divide latissimus dorsi and external oblique along their fibres, then transversus abdominis; develop the retroperitoneal plane laterally.',
    'Divide the costal cartilage; manage pleura (posterior chest drain if entered) and diaphragm as needed.',
    'Sweep the peritoneum off the diaphragm (avoid splenic traction); open the fascia anterolateral to the left kidney; ligate left-renal-vein branches; sweep the kidney anteriorly; identify the ureter medially.',
    'Hold the viscera medially with padded self-retaining retractors; close in layers ± chest drain.',
  ],
  complications: [
    'Pleural entry needing a chest drain.',
    'Splenic injury from traction.',
    'Inadvertent peritoneal entry (attenuated transversus abdominis).',
    'Positioning-related pressure/stretch injury (brachial plexus, axilla).',
    'Haemorrhage from the aorta or renal-vein branches.',
  ],
  preop: {
    indications: [
      'Open flank access is now mostly kept for large or complex oncological resections, though still used for benign work such as donor nephrectomy or simple nephrectomy for XGP.',
      'Going in posteriorly through the retroperitoneum lowers the risk of bowel complications but raises the risk of thoracic ones, chiefly pleural injury.',
      'Thoracoabdominal extension (9th–10th rib, extendable to the midline) gives early great-vessel control for level III caval thrombus, T4 renal tumours, large upper-pole or adrenal tumours and retroperitoneal masses.',
      'Supracostal 12th-rib or 11th–12th interspace incisions avoid rib resection and its pain yet still expose the kidney and hilum; resecting rib tips as high as the 11th brings marked pain and a risk of flank bulge.',
    ],
    workup: [
      'Choose the incision from the imaging: the location and size of the target decide between supracostal, transcostal, subcostal and thoracoabdominal access.',
      'Plan for the chest if a thoracoabdominal incision is likely — the pleura will be opened and a chest drain placed.',
    ],
    setup: [
      'Flank position: lateral, lower leg flexed and upper leg extended, incision over the table break. Thoracoabdominal: exaggerated flank with the ipsilateral arm raised on a Mayo stand or trapeze.',
      'Arms: ipsilateral arm on a raised rest or gel pad, abducted no more than 90° without shoulder stretch; contralateral arm on an armboard with ulnar padding. Front and back support. Rotate the table fully before draping to prove the patient is secure.',
      'Rib cutter, periosteal elevator, Doyen rib stripper, bone wax; a red rubber catheter and chest drain for pleural repair.',
    ],
  },
  dangerZones: [
    {
      step: 0,
      structure: 'Contralateral brachial plexus',
      risk: 'An axillary roll placed in the axilla compresses the dependent brachial plexus; over-abduction stretches the upper one.',
      bailout: 'Put the roll just caudal to the axilla, not in it, and keep the upper arm at or below 90° of abduction.',
    },
    {
      step: 2,
      structure: 'Rib neurovascular bundle',
      risk: 'The bundle runs between the second and third muscle layers and is easily divided as they are opened.',
      bailout: 'Identify it between those layers and dissect it free where possible before placing retractors.',
    },
    {
      step: 2,
      structure: 'Peritoneum',
      risk: 'Opening the muscle layers too far anteriorly enters the peritoneal cavity and exposes bowel.',
      bailout: 'Enter the retroperitoneum as far posteriorly as possible and push the peritoneum bluntly medially as the remaining layers are opened.',
    },
    {
      step: 3,
      structure: 'Pleura',
      risk: 'Rib resection and supracostal incisions put the pleura at risk.',
      bailout: 'Ask the anaesthetist for large breaths to show the pleura. If torn: close it with a running absorbable suture around a red rubber catheter, put the catheter end under water, give large breaths until the bubbles stop, then withdraw it. Use a chest drain for a larger tear.',
    },
    {
      step: 5,
      structure: 'Spleen or liver',
      risk: 'Self-retaining retractor blades can injure the spleen (left) or liver (right).',
      bailout: 'Use padded blades and keep them clear of the spleen and liver.',
    },
  ],
  postop: [
    'Close in two layers with running absorbable suture. After a thoracoabdominal incision, close the diaphragm in two layers, re-approximate the costal cartilage and leave a chest drain (it may be omitted if the parietal pleura is intact).',
    'Chest X-ray only if a pleural tear was recognised and repaired — routine films after open renal surgery have a very low yield.',
    'A wound drain is seldom needed unless findings demand it, for example after partial nephrectomy or simple nephrectomy for XGP.',
  ],
  extrasSource: cww('Ch 9, Incisions and Access; ch 10, Intraoperative Technical Decisions', 'Mikhail & Hall; Vira & Hartman'),
  citation: {
    authors: 'Radtka & Han',
    journal: 'Oper Tech Gen Surg',
    year: 2008,
    doi: '10.1053/j.optechgensurg.2008.05.001',
    url: 'https://doi.org/10.1053/j.optechgensurg.2008.05.001',
  },
};

export const PROCEDURES: Procedure[] = [
  orchidopexy,
  circumcision,
  herniotomy,
  scrotalExploration,
  hypospadiasTip,
  pyeloplasty,
  turp,
  turbt,
  flexibleUrs,
  semiRigidUrs,
  pcnl,
  eswl,
  cystoscopy,
  opticalUrethrotomy,
  vasectomy,
  rplnd,
  lapNephrectomy,
  bladderUreteralTrauma,
  ureteralReconstruction,
  retroperitonealExposure,
];
