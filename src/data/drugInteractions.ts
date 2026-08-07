/**
 * Curated, urology-relevant drug–drug interactions for point-of-care reference.
 *
 * DECISION SUPPORT ONLY. This is a focused, guideline-grounded list — NOT a
 * comprehensive interaction database. Every entry states its clinical effect and
 * a management action, and cites the AUA/EAU guideline that discusses the drug
 * (where applicable) or the FDA prescribing information. The treating clinician
 * must verify against current prescribing information and a full interaction
 * checker; final decisions rest on clinical judgment.
 */

export type InteractionSeverity = 'contraindicated' | 'major' | 'moderate' | 'minor';

export interface DrugInteraction {
  id: string;
  /** Urology drug group this interaction belongs to (for grouping in the UI). */
  category: string;
  /** The urology drug or class. */
  drugA: string;
  /** The interacting drug or class. */
  drugB: string;
  severity: InteractionSeverity;
  /** Clinical consequence of the interaction. */
  effect: string;
  /** Recommended management. */
  management: string;
  /** Attribution; url present only when independently verified. */
  source: { label: string; url?: string };
}

/** Human-readable label + design-system risk colour for each severity. */
export const SEVERITY_META: Record<
  InteractionSeverity,
  { label: string; band: 'high' | 'moderate' | 'low' }
> = {
  contraindicated: { label: 'Contraindicated', band: 'high' },
  major: { label: 'Major', band: 'high' },
  moderate: { label: 'Moderate', band: 'moderate' },
  minor: { label: 'Minor', band: 'low' },
};

const AUA_ED = 'https://www.auanet.org/guidelines-and-quality/guidelines/erectile-dysfunction-(ed)-guideline';
const AUA_BPH = 'https://www.auanet.org/guidelines-and-quality/guidelines/bph-guideline';
const AUA_OAB = 'https://www.auanet.org/guidelines-and-quality/guidelines/idiopathic-overactive-bladder';
const AUA_TESTO = 'https://www.auanet.org/guidelines-and-quality/guidelines/testosterone-deficiency-guideline';
const AUA_STONE = 'https://www.auanet.org/guidelines-and-quality/guidelines/kidney-stones-medical-mangement-guideline';
const AUA_RUTI = 'https://www.auanet.org/guidelines-and-quality/guidelines/recurrent-uti';
const AUA_NMIBC = 'https://www.auanet.org/guidelines-and-quality/guidelines/bladder-cancer-non-muscle-invasive-guideline';

export const DRUG_INTERACTIONS: DrugInteraction[] = [
  // ── ED / PDE5 inhibitors ────────────────────────────────────────────────
  {
    id: 'pde5i-nitrates',
    category: 'ED · PDE5 inhibitors',
    drugA: 'PDE5 inhibitors (sildenafil, tadalafil, vardenafil, avanafil)',
    drugB: 'Organic nitrates (nitroglycerin, isosorbide, amyl nitrite/"poppers")',
    severity: 'contraindicated',
    effect:
      'Synergistic cGMP-mediated vasodilation causing profound, potentially fatal hypotension.',
    management:
      'Absolute contraindication. Never co-administer. After sildenafil/vardenafil wait ≥24 h and after tadalafil ≥48 h before giving a nitrate; if a patient on a PDE5i develops chest pain, avoid nitrates and manage acutely by other means.',
    source: { label: 'AUA Erectile Dysfunction Guideline', url: AUA_ED },
  },
  {
    id: 'pde5i-riociguat',
    category: 'ED · PDE5 inhibitors',
    drugA: 'PDE5 inhibitors',
    drugB: 'Riociguat and other soluble guanylate cyclase stimulators',
    severity: 'contraindicated',
    effect: 'Additive vasodilation and symptomatic hypotension.',
    management: 'Combination is contraindicated; do not co-prescribe.',
    source: { label: 'FDA prescribing information' },
  },
  {
    id: 'pde5i-alpha-blocker',
    category: 'ED · PDE5 inhibitors',
    drugA: 'PDE5 inhibitors',
    drugB: 'Alpha-blockers (tamsulosin, doxazosin, terazosin, alfuzosin)',
    severity: 'moderate',
    effect: 'Additive lowering of blood pressure; symptomatic/orthostatic hypotension.',
    management:
      'Ensure the patient is stable on the alpha-blocker first, start the PDE5i at the lowest dose, and separate dosing. Tadalafil 5 mg daily is co-approved with alpha-blockers for LUTS/BPH in selected patients.',
    source: { label: 'AUA ED / BPH Guidelines', url: AUA_ED },
  },
  {
    id: 'pde5i-cyp3a4-inhibitors',
    category: 'ED · PDE5 inhibitors',
    drugA: 'PDE5 inhibitors',
    drugB: 'Potent CYP3A4 inhibitors (ketoconazole, itraconazole, ritonavir, clarithromycin)',
    severity: 'major',
    effect: 'Reduced PDE5i clearance with markedly increased drug levels and adverse effects.',
    management:
      'Reduce PDE5i dose and extend the dosing interval per label; counsel on hypotension, priapism, and visual symptoms.',
    source: { label: 'FDA prescribing information' },
  },

  // ── BPH / alpha-blockers & 5-ARIs ───────────────────────────────────────
  {
    id: 'alpha-blocker-antihypertensives',
    category: 'BPH · Alpha-blockers',
    drugA: 'Alpha-blockers (doxazosin, terazosin, tamsulosin, alfuzosin)',
    drugB: 'Antihypertensives, diuretics, other vasodilators',
    severity: 'moderate',
    effect: 'Additive hypotension, first-dose syncope, and falls (particularly in the elderly).',
    management:
      'Start at the lowest dose, titrate slowly, dose at bedtime, and counsel on orthostatic symptoms; prefer uroselective agents (tamsulosin, alfuzosin, silodosin) when blood pressure is a concern.',
    source: { label: 'AUA BPH Guideline', url: AUA_BPH },
  },
  {
    id: 'alpha-blocker-cyp',
    category: 'BPH · Alpha-blockers',
    drugA: 'Tamsulosin / silodosin',
    drugB: 'Strong CYP3A4 or CYP2D6 inhibitors (ketoconazole, ritonavir, paroxetine)',
    severity: 'moderate',
    effect: 'Increased alpha-blocker exposure and hypotension risk.',
    management: 'Avoid or use the lowest dose; silodosin with strong CYP3A4 inhibitors is not recommended.',
    source: { label: 'FDA prescribing information' },
  },

  // ── OAB / antimuscarinics ───────────────────────────────────────────────
  {
    id: 'antimuscarinic-anticholinergic-burden',
    category: 'OAB · Antimuscarinics',
    drugA: 'Antimuscarinics (oxybutynin, tolterodine, solifenacin, fesoterodine, darifenacin, trospium)',
    drugB: 'Other anticholinergics (TCAs, first-generation antihistamines, antipsychotics, antiparkinsonian agents)',
    severity: 'major',
    effect:
      'Additive anticholinergic burden → confusion, falls, constipation, urinary retention, blurred vision; cognitive risk is greatest in older adults.',
    management:
      'Total the anticholinergic burden before adding therapy; in the elderly prefer a β3 agonist (mirabegron) or a more uroselective/less CNS-penetrant agent (trospium, darifenacin); avoid oxybutynin IR.',
    source: { label: 'AUA Overactive Bladder Guideline', url: AUA_OAB },
  },
  {
    id: 'antimuscarinic-cyp3a4',
    category: 'OAB · Antimuscarinics',
    drugA: 'Solifenacin, darifenacin, tolterodine, fesoterodine',
    drugB: 'Strong CYP3A4 inhibitors (ketoconazole, itraconazole, clarithromycin)',
    severity: 'moderate',
    effect: 'Increased antimuscarinic exposure and anticholinergic adverse effects.',
    management: 'Apply label dose caps (e.g., solifenacin ≤5 mg; fesoterodine ≤4 mg) and monitor.',
    source: { label: 'FDA prescribing information' },
  },
  {
    id: 'antimuscarinic-achei',
    category: 'OAB · Antimuscarinics',
    drugA: 'Antimuscarinics',
    drugB: 'Acetylcholinesterase inhibitors (donepezil, rivastigmine, galantamine)',
    severity: 'moderate',
    effect: 'Pharmacologic antagonism — opposing mechanisms reduce efficacy of both drugs.',
    management:
      'Avoid the combination where possible; the pairing signals an anticholinergic-cognitive conflict in a patient with dementia — reconsider OAB drug therapy.',
    source: { label: 'AUA Overactive Bladder Guideline', url: AUA_OAB },
  },

  // ── OAB / mirabegron (β3 agonist) ───────────────────────────────────────
  {
    id: 'mirabegron-cyp2d6',
    category: 'OAB · Mirabegron',
    drugA: 'Mirabegron (moderate CYP2D6 inhibitor)',
    drugB: 'Narrow-index CYP2D6 substrates (metoprolol, desipramine, flecainide, propafenone)',
    severity: 'moderate',
    effect: 'Increased substrate levels and their dose-related toxicity.',
    management: 'Monitor and consider lower substrate doses; titrate the substrate carefully.',
    source: { label: 'FDA prescribing information' },
  },
  {
    id: 'mirabegron-digoxin',
    category: 'OAB · Mirabegron',
    drugA: 'Mirabegron',
    drugB: 'Digoxin',
    severity: 'moderate',
    effect: 'Increased digoxin plasma concentration and risk of toxicity.',
    management: 'Start digoxin at the lowest dose and monitor serum digoxin levels.',
    source: { label: 'FDA prescribing information' },
  },

  // ── Testosterone therapy ────────────────────────────────────────────────
  {
    id: 'testosterone-warfarin',
    category: 'Testosterone',
    drugA: 'Testosterone',
    drugB: 'Warfarin and other vitamin-K antagonists',
    severity: 'major',
    effect: 'Enhanced anticoagulant effect with increased INR and bleeding risk.',
    management: 'Monitor INR closely when starting, stopping, or changing testosterone dose and adjust the anticoagulant.',
    source: { label: 'AUA Testosterone Deficiency Guideline', url: AUA_TESTO },
  },
  {
    id: 'testosterone-hypoglycemics',
    category: 'Testosterone',
    drugA: 'Testosterone',
    drugB: 'Insulin and oral hypoglycemics',
    severity: 'moderate',
    effect: 'Improved insulin sensitivity may reduce glucose and antidiabetic requirements.',
    management: 'Monitor glucose and adjust antidiabetic therapy as needed.',
    source: { label: 'FDA prescribing information' },
  },

  // ── UTI antibiotics: fluoroquinolones ───────────────────────────────────
  {
    id: 'fq-tizanidine',
    category: 'UTI antibiotics · Fluoroquinolones',
    drugA: 'Ciprofloxacin (CYP1A2 inhibitor)',
    drugB: 'Tizanidine',
    severity: 'contraindicated',
    effect: 'Markedly increased tizanidine levels causing severe hypotension and sedation.',
    management: 'Ciprofloxacin with tizanidine is contraindicated; choose an alternative antibiotic.',
    source: { label: 'FDA prescribing information' },
  },
  {
    id: 'fq-warfarin',
    category: 'UTI antibiotics · Fluoroquinolones',
    drugA: 'Fluoroquinolones (ciprofloxacin, levofloxacin)',
    drugB: 'Warfarin',
    severity: 'major',
    effect: 'Potentiated anticoagulation with elevated INR and bleeding.',
    management: 'Monitor INR during and after the course; anticipate dose adjustment.',
    source: { label: 'FDA prescribing information' },
  },
  {
    id: 'fq-qt',
    category: 'UTI antibiotics · Fluoroquinolones',
    drugA: 'Fluoroquinolones',
    drugB: 'QT-prolonging drugs (amiodarone, sotalol, ondansetron, antipsychotics)',
    severity: 'major',
    effect: 'Additive QT prolongation and risk of torsades de pointes.',
    management: 'Avoid in patients with QT risk factors; if unavoidable, monitor ECG and electrolytes.',
    source: { label: 'FDA prescribing information' },
  },
  {
    id: 'fq-cations',
    category: 'UTI antibiotics · Fluoroquinolones',
    drugA: 'Fluoroquinolones',
    drugB: 'Di/tri-valent cations (antacids, calcium, iron, zinc, sucralfate, dairy)',
    severity: 'moderate',
    effect: 'Chelation markedly reduces fluoroquinolone absorption and efficacy.',
    management: 'Separate dosing — give the fluoroquinolone ≥2 h before or ≥6 h after the cation.',
    source: { label: 'FDA prescribing information' },
  },

  // ── UTI antibiotics: TMP-SMX ────────────────────────────────────────────
  {
    id: 'tmpsmx-warfarin',
    category: 'UTI antibiotics · TMP-SMX',
    drugA: 'Trimethoprim-sulfamethoxazole',
    drugB: 'Warfarin',
    severity: 'major',
    effect: 'Inhibited warfarin metabolism → sharply increased INR and bleeding.',
    management: 'Prefer an alternative antibiotic; if used, monitor INR closely and adjust.',
    source: { label: 'AUA Recurrent UTI Guideline', url: AUA_RUTI },
  },
  {
    id: 'tmpsmx-hyperkalemia',
    category: 'UTI antibiotics · TMP-SMX',
    drugA: 'Trimethoprim-sulfamethoxazole',
    drugB: 'ACE inhibitors, ARBs, potassium-sparing diuretics, potassium supplements',
    severity: 'major',
    effect: 'Trimethoprim blocks distal tubular potassium secretion → hyperkalemia.',
    management: 'Monitor serum potassium, especially in the elderly and in renal impairment; consider an alternative.',
    source: { label: 'FDA prescribing information' },
  },
  {
    id: 'tmpsmx-methotrexate',
    category: 'UTI antibiotics · TMP-SMX',
    drugA: 'Trimethoprim-sulfamethoxazole',
    drugB: 'Methotrexate',
    severity: 'major',
    effect: 'Additive antifolate effect and displacement → myelosuppression and MTX toxicity.',
    management: 'Avoid the combination; choose a non-sulfa antibiotic.',
    source: { label: 'FDA prescribing information' },
  },
  {
    id: 'tmpsmx-sulfonylureas',
    category: 'UTI antibiotics · TMP-SMX',
    drugA: 'Trimethoprim-sulfamethoxazole',
    drugB: 'Sulfonylureas (glipizide, glyburide)',
    severity: 'moderate',
    effect: 'Potentiated hypoglycemic effect.',
    management: 'Monitor blood glucose during therapy.',
    source: { label: 'FDA prescribing information' },
  },

  // ── UTI antibiotics: nitrofurantoin ─────────────────────────────────────
  {
    id: 'nitrofurantoin-antacids',
    category: 'UTI antibiotics · Nitrofurantoin',
    drugA: 'Nitrofurantoin',
    drugB: 'Magnesium-containing antacids',
    severity: 'minor',
    effect: 'Reduced rate and extent of nitrofurantoin absorption.',
    management: 'Separate administration times.',
    source: { label: 'FDA prescribing information' },
  },

  // ── Stone / metabolic management ────────────────────────────────────────
  {
    id: 'kcitrate-hyperkalemia',
    category: 'Stones · Metabolic',
    drugA: 'Potassium citrate',
    drugB: 'ACE inhibitors, ARBs, potassium-sparing diuretics, NSAIDs',
    severity: 'major',
    effect: 'Additive potassium load → hyperkalemia, especially with impaired renal function.',
    management: 'Monitor serum potassium and renal function; use caution in CKD.',
    source: { label: 'AUA Medical Management of Kidney Stones Guideline', url: AUA_STONE },
  },
  {
    id: 'thiazide-lithium',
    category: 'Stones · Metabolic',
    drugA: 'Thiazide diuretics (for hypercalciuria)',
    drugB: 'Lithium',
    severity: 'major',
    effect: 'Reduced renal lithium clearance → elevated lithium levels and toxicity.',
    management: 'Monitor lithium levels and reduce the lithium dose; coordinate with the prescriber.',
    source: { label: 'FDA prescribing information' },
  },
  {
    id: 'allopurinol-azathioprine',
    category: 'Stones · Metabolic',
    drugA: 'Allopurinol (recurrent uric acid / calcium oxalate stones)',
    drugB: 'Azathioprine / 6-mercaptopurine',
    severity: 'major',
    effect: 'Blocked xanthine-oxidase metabolism of the thiopurine → severe myelosuppression.',
    management: 'Avoid, or reduce the thiopurine dose to ~25% with close blood-count monitoring.',
    source: { label: 'FDA prescribing information' },
  },

  // ── Oncology (selected high-yield) ──────────────────────────────────────
  {
    id: 'bcg-antibiotics',
    category: 'Oncology · Intravesical BCG',
    drugA: 'Intravesical BCG',
    drugB: 'Antibiotics and immunosuppressants',
    severity: 'moderate',
    effect: 'Antibiotics may inhibit the live mycobacterium and blunt BCG efficacy; immunosuppression raises disseminated-infection risk.',
    management:
      'Avoid antibiotics active against BCG around instillation; do not give BCG to significantly immunosuppressed patients or during active UTI/gross hematuria.',
    source: { label: 'AUA NMIBC Guideline', url: AUA_NMIBC },
  },
  {
    id: 'cisplatin-nephrotoxins',
    category: 'Oncology · Cisplatin',
    drugA: 'Cisplatin',
    drugB: 'Aminoglycosides, loop diuretics, other nephrotoxins',
    severity: 'major',
    effect: 'Additive nephrotoxicity and ototoxicity.',
    management: 'Ensure vigorous hydration, avoid concurrent nephrotoxins, and monitor renal function and electrolytes.',
    source: { label: 'FDA prescribing information' },
  },
];

/** Distinct category groups, preserving first-seen order. */
export const INTERACTION_CATEGORIES: string[] = [
  ...new Set(DRUG_INTERACTIONS.map((d) => d.category)),
];
