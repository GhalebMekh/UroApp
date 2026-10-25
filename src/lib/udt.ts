/**
 * Undescended testis — next step for one boy. From Campbell-Walsh-Wein 12th ed,
 * ch 46 (Barthold & Hagerty), which presents the AUA guideline algorithm
 * (Kolon et al. 2014; PMID 24857650):
 *  - observe for the first 6 months (corrected age); spontaneous descent is
 *    unlikely in term boys after 2–6 months;
 *  - surgery after 6 months, preferably by 12 months of corrected age;
 *  - no imaging (ultrasound localises a nonpalpable testis with 45% sensitivity,
 *    78% specificity) and no hormonal therapy;
 *  - nonpalpable: examination under anaesthesia then diagnostic laparoscopy;
 *  - neither testis palpable, especially with abnormal penile development:
 *    urgent karyotype and hormones (exclude congenital adrenal hyperplasia);
 *    proximal hypospadias with cryptorchidism: chromosomal analysis
 *    (abnormal in 32–47%); delay circumcision until evaluation is complete;
 *  - acquired (ascended) testis: observation cannot be recommended.
 */

export type Palpability = 'palpable' | 'nonpalpable';

export interface UdtInput {
  correctedAgeMonths: number;
  palpability: Palpability;
  bilateral: boolean;
  hypospadias: 'none' | 'distal' | 'proximal';
  /** Testis documented in the scrotum earlier, now undescended. */
  acquired: boolean;
}

export interface UdtStep {
  tone: 'urgent' | 'action' | 'info';
  text: string;
}

export function udtPlan(i: UdtInput): UdtStep[] {
  const steps: UdtStep[] = [];
  const dsdRisk = (i.bilateral && i.palpability === 'nonpalpable') || i.hypospadias === 'proximal';

  if (dsdRisk) {
    steps.push({
      tone: 'urgent',
      text:
        i.bilateral && i.palpability === 'nonpalpable'
          ? 'Neither testis palpable: urgent karyotype and hormonal tests to exclude a disorder of sex development (including salt-wasting congenital adrenal hyperplasia). Delay any circumcision.'
          : 'Proximal hypospadias with an undescended testis: chromosomal analysis is warranted (abnormal in 32–47%). Delay any circumcision.',
    });
  } else if (i.hypospadias === 'distal') {
    steps.push({ tone: 'info', text: 'Hypospadias accompanies cryptorchidism in 12–24%; keep the foreskin for the repair.' });
  }

  if (i.acquired) {
    steps.push({
      tone: 'action',
      text: 'Acquired (ascended) testis: refer for orchidopexy. Waiting for spontaneous descent at puberty is not recommended, especially when bilateral.',
    });
  } else if (i.correctedAgeMonths < 6) {
    steps.push({
      tone: 'info',
      text: 'Under 6 months corrected age: observe and re-examine — most spontaneous descent happens in the first months. For prematurity, observe to 6 months beyond the due date (or to 1 year if the position is marginal).',
    });
  } else {
    steps.push({
      tone: 'action',
      text: 'Past 6 months corrected age: refer for surgery — after 6 months, preferably by 12 months of age. The AUA timeframe allows up to 18 months; later surgery is still indicated.',
    });
  }

  steps.push(
    i.palpability === 'palpable'
      ? { tone: 'info', text: 'Palpable: inguinal or scrotal orchidopexy. Confirm the lowest position the testis reaches — a retractile testis needs yearly examination, not surgery.' }
      : { tone: 'info', text: 'Nonpalpable: examination under anaesthesia, then diagnostic laparoscopy (orchidopexy if a viable abdominal testis is found; blind-ending vessels confirm a vanishing testis).' },
  );

  steps.push({
    tone: 'info',
    text: 'Do not request ultrasound or MRI before referral (ultrasound sensitivity 45%, specificity 78% for a nonpalpable testis; it delays surgery). Hormonal therapy is not recommended.',
  });
  steps.push({
    tone: 'info',
    text: 'Counsel: reduced sperm counts are common after bilateral cryptorchidism; testicular cancer risk is 2–5 times higher and rises with later surgery — teach self-examination.',
  });
  return steps;
}
