/**
 * Operative reference — anatomy · steps · complications, per procedure.
 * LICENSING (CLAUDE.md): content is SUMMARISED in our own words from the cited
 * source, never reproduced verbatim. Each procedure carries its citation. Build
 * one procedure at a time from a named source; do not write steps from memory.
 */
import type { Citation } from './citations';

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
