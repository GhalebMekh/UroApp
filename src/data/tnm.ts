/**
 * TNM quick staging — prostate, kidney, bladder, testis (AJCC 8th edition).
 *
 * LICENSING (CLAUDE.md, NON-NEGOTIABLE): category definitions below are
 * summarised in our own words — NOT verbatim AJCC tables. Stage-group logic is
 * implemented from the AJCC 8th edition and verified against the American
 * Cancer Society's published AJCC 8th summaries. Always confirm against the
 * AJCC Cancer Staging Manual before clinical use.
 */
import { CITATIONS, type Citation } from './citations';

export type StageBand = 'low' | 'moderate' | 'high';

export interface TnmOption {
  /** Canonical code used by the staging logic, e.g. "T2a". */
  value: string;
  /** Summarised, human-readable definition (our wording). */
  label: string;
}

export interface TnmAxis {
  key: string;
  label: string;
  options: TnmOption[];
}

export interface StageResult {
  code: string;
  band: StageBand;
}

export interface TnmCancer {
  id: 'prostate' | 'kidney' | 'bladder' | 'testis';
  name: string;
  short: string;
  axes: TnmAxis[];
  /** Returns the AJCC stage group, or null if selection is incomplete. */
  stage: (sel: Record<string, string>) => StageResult | null;
  citation: Citation;
}

/** Maps an AJCC stage code (e.g. "IIIA", "0is") to a risk band for colouring. */
function band(code: string): StageBand {
  const up = code.toUpperCase();
  if (up.startsWith('IV') || up.startsWith('III')) return 'high';
  if (up.startsWith('II')) return 'moderate';
  return 'low'; // I, IA/IB/IS, 0/0a/0is
}
const res = (code: string): StageResult => ({ code, band: band(code) });

/** True only when every axis key has a value. */
function complete(sel: Record<string, string>, axes: TnmAxis[]): boolean {
  return axes.every((a) => sel[a.key]);
}

/* ───────── Prostate (prognostic stage groups: T, N, M, PSA, Grade Group) ───────── */
const prostate: TnmCancer = {
  id: 'prostate',
  name: 'Prostate',
  short: 'Prostate',
  axes: [
    {
      key: 'T',
      label: 'T — primary tumour',
      options: [
        { value: 'T1', label: 'T1 — not palpable or visible (incidental or biopsy-detected)' },
        { value: 'T2a', label: 'T2a — ≤ half of one lobe' },
        { value: 'T2b', label: 'T2b — > half of one lobe, one side' },
        { value: 'T2c', label: 'T2c — both lobes' },
        { value: 'T3', label: 'T3 — extraprostatic extension or seminal-vesicle invasion' },
        { value: 'T4', label: 'T4 — fixed or invades adjacent structures' },
      ],
    },
    {
      key: 'N',
      label: 'N — regional nodes',
      options: [
        { value: 'N0', label: 'N0 — no regional node metastasis' },
        { value: 'N1', label: 'N1 — regional node metastasis' },
      ],
    },
    {
      key: 'M',
      label: 'M — distant metastasis',
      options: [
        { value: 'M0', label: 'M0 — none' },
        { value: 'M1', label: 'M1 — distant metastasis' },
      ],
    },
    {
      key: 'PSA',
      label: 'PSA at diagnosis',
      options: [
        { value: 'lt10', label: '< 10 ng/mL' },
        { value: '10to20', label: '≥ 10 and < 20 ng/mL' },
        { value: 'ge20', label: '≥ 20 ng/mL' },
      ],
    },
    {
      key: 'GG',
      label: 'Grade Group (WHO/ISUP)',
      options: [
        { value: '1', label: 'GG 1 — Gleason ≤ 6' },
        { value: '2', label: 'GG 2 — Gleason 3+4' },
        { value: '3', label: 'GG 3 — Gleason 4+3' },
        { value: '4', label: 'GG 4 — Gleason 8' },
        { value: '5', label: 'GG 5 — Gleason 9–10' },
      ],
    },
  ],
  stage(sel) {
    if (!complete(sel, this.axes)) return null;
    const { T, N, M, PSA, GG } = sel as Record<string, string>;
    if (M === 'M1') return res('IVB');
    if (N === 'N1') return res('IVA');
    // N0, M0
    if (GG === '5') return res('IIIC');
    if (T === 'T3' || T === 'T4') return res('IIIB');
    // T1/T2x, GG 1–4
    if (PSA === 'ge20') return res('IIIA');
    if (GG === '2') return res('IIB');
    if (GG === '3' || GG === '4') return res('IIC');
    // GG 1, PSA < 20
    if (T === 'T2b' || T === 'T2c') return res('IIA');
    // T1 or T2a, GG1
    return res(PSA === 'lt10' ? 'I' : 'IIA');
  },
  citation: CITATIONS.tnmProstate,
};

/* ───────── Kidney / RCC (T, N, M) ───────── */
const kidney: TnmCancer = {
  id: 'kidney',
  name: 'Kidney (RCC)',
  short: 'Kidney',
  axes: [
    {
      key: 'T',
      label: 'T — primary tumour',
      options: [
        { value: 'T1', label: 'T1 — ≤ 7 cm, confined to kidney' },
        { value: 'T2', label: 'T2 — > 7 cm, confined to kidney' },
        { value: 'T3', label: 'T3 — into renal vein / perinephric or sinus fat, within Gerota fascia' },
        { value: 'T4', label: 'T4 — beyond Gerota fascia (incl. ipsilateral adrenal)' },
      ],
    },
    {
      key: 'N',
      label: 'N — regional nodes',
      options: [
        { value: 'N0', label: 'N0 — no regional node metastasis' },
        { value: 'N1', label: 'N1 — regional node metastasis' },
      ],
    },
    {
      key: 'M',
      label: 'M — distant metastasis',
      options: [
        { value: 'M0', label: 'M0 — none' },
        { value: 'M1', label: 'M1 — distant metastasis' },
      ],
    },
  ],
  stage(sel) {
    if (!complete(sel, this.axes)) return null;
    const { T, N, M } = sel as Record<string, string>;
    if (M === 'M1') return res('IV');
    if (T === 'T4') return res('IV');
    if (N === 'N1') return res('III');
    if (T === 'T3') return res('III');
    if (T === 'T2') return res('II');
    return res('I'); // T1 N0 M0
  },
  citation: CITATIONS.tnmKidney,
};

/* ───────── Bladder / urothelial (T, N, M) ───────── */
const bladder: TnmCancer = {
  id: 'bladder',
  name: 'Bladder',
  short: 'Bladder',
  axes: [
    {
      key: 'T',
      label: 'T — primary tumour',
      options: [
        { value: 'Ta', label: 'Ta — non-invasive papillary' },
        { value: 'Tis', label: 'Tis — carcinoma in situ (flat)' },
        { value: 'T1', label: 'T1 — invades lamina propria' },
        { value: 'T2a', label: 'T2a — invades inner (superficial) muscle' },
        { value: 'T2b', label: 'T2b — invades outer (deep) muscle' },
        { value: 'T3a', label: 'T3a — microscopic perivesical invasion' },
        { value: 'T3b', label: 'T3b — macroscopic perivesical mass' },
        { value: 'T4a', label: 'T4a — invades prostate/uterus/vagina' },
        { value: 'T4b', label: 'T4b — invades pelvic/abdominal wall' },
      ],
    },
    {
      key: 'N',
      label: 'N — regional nodes',
      options: [
        { value: 'N0', label: 'N0 — none' },
        { value: 'N1', label: 'N1 — single node, true pelvis' },
        { value: 'N2', label: 'N2 — multiple nodes, true pelvis' },
        { value: 'N3', label: 'N3 — common iliac node(s)' },
      ],
    },
    {
      key: 'M',
      label: 'M — distant metastasis',
      options: [
        { value: 'M0', label: 'M0 — none' },
        { value: 'M1a', label: 'M1a — non-regional nodes' },
        { value: 'M1b', label: 'M1b — other distant metastasis' },
      ],
    },
  ],
  stage(sel) {
    if (!complete(sel, this.axes)) return null;
    const { T, N, M } = sel as Record<string, string>;
    if (M === 'M1b') return res('IVB');
    if (M === 'M1a') return res('IVA');
    if (T === 'T4b') return res('IVA');
    if (N === 'N2' || N === 'N3') return res('IIIB');
    if (N === 'N1') return res('IIIA');
    // N0, M0
    if (T === 'Ta') return res('0a');
    if (T === 'Tis') return res('0is');
    if (T === 'T1') return res('I');
    if (T === 'T2a' || T === 'T2b') return res('II');
    return res('IIIA'); // T3a/T3b/T4a N0 M0
  },
  citation: CITATIONS.tnmBladder,
};

/* ───────── Testis / germ cell (T, N, M, S serum markers) ───────── */
const testis: TnmCancer = {
  id: 'testis',
  name: 'Testis',
  short: 'Testis',
  axes: [
    {
      key: 'T',
      label: 'T — primary tumour (post-orchidectomy, pT)',
      options: [
        { value: 'pTis', label: 'pTis — germ cell neoplasia in situ' },
        { value: 'pT1', label: 'pT1 — testis/epididymis, no vascular invasion' },
        { value: 'pT2', label: 'pT2 — vascular/lymphatic invasion or tunica vaginalis' },
        { value: 'pT3', label: 'pT3 — spermatic cord invasion' },
        { value: 'pT4', label: 'pT4 — scrotal invasion' },
      ],
    },
    {
      key: 'N',
      label: 'N — regional nodes',
      options: [
        { value: 'N0', label: 'N0 — none' },
        { value: 'N1', label: 'N1 — ≤ 2 cm node mass' },
        { value: 'N2', label: 'N2 — > 2 to 5 cm' },
        { value: 'N3', label: 'N3 — > 5 cm' },
      ],
    },
    {
      key: 'M',
      label: 'M — distant metastasis',
      options: [
        { value: 'M0', label: 'M0 — none' },
        { value: 'M1a', label: 'M1a — non-regional nodes or lung' },
        { value: 'M1b', label: 'M1b — other distant sites' },
      ],
    },
    {
      key: 'S',
      label: 'S — serum tumour markers (post-orchidectomy)',
      options: [
        { value: 'S0', label: 'S0 — all normal' },
        { value: 'S1', label: 'S1 — mildly elevated' },
        { value: 'S2', label: 'S2 — moderately elevated' },
        { value: 'S3', label: 'S3 — markedly elevated' },
      ],
    },
  ],
  stage(sel) {
    if (!complete(sel, this.axes)) return null;
    const { T, N, M, S } = sel as Record<string, string>;
    if (M === 'M1b') return res('IIIC');
    if (M === 'M1a') {
      if (S === 'S3') return res('IIIC');
      if (S === 'S2') return res('IIIB');
      return res('IIIA'); // S0/S1
    }
    // M0
    if (N === 'N1' || N === 'N2' || N === 'N3') {
      if (S === 'S3') return res('IIIC');
      if (S === 'S2') return res('IIIB');
      // S0/S1
      if (N === 'N1') return res('IIA');
      if (N === 'N2') return res('IIB');
      return res('IIC'); // N3
    }
    // N0, M0
    if (S === 'S1' || S === 'S2' || S === 'S3') return res('IS');
    // N0, M0, S0
    if (T === 'pTis') return res('0');
    if (T === 'pT1') return res('IA');
    return res('IB'); // pT2–pT4
  },
  citation: CITATIONS.tnmTestis,
};

export const TNM_CANCERS: TnmCancer[] = [prostate, kidney, bladder, testis];
