/**
 * App-wide search matching. The query is split into words; each word matches
 * when it (or a urology synonym of it) starts a word in the item, so
 * "renal cancer" finds "Renal cell carcinoma" and "stone" finds PCNL.
 * Items matching every word rank first, then partial matches.
 */

/** Words treated as the same thing. Matching is by word prefix, so stems suffice. */
const SYNONYM_GROUPS: readonly string[][] = [
  ['cancer', 'carcinoma', 'tumor', 'malignan', 'neoplas', 'oncolog'],
  ['renal', 'kidney', 'nephr', 'rcc'],
  ['bladder', 'vesic', 'urothelial', 'nmibc', 'mibc', 'cystectomy', 'turbt'],
  ['prostat', 'pca', 'psa', 'bph', 'turp'],
  ['stone', 'calcul', 'lithiasis', 'urolithiasis', 'nephrolithiasis', 'colic', 'pcnl', 'ureteroscop', 'urs', 'swl', 'eswl', 'lithotripsy'],
  ['stricture', 'urethroplasty', 'urethrotomy', 'narrowing'],
  ['testis', 'testes', 'testic', 'scrot', 'orchi'],
  ['torsion', 'twist'],
  ['incontinence', 'leak', 'sui', 'sling'],
  ['overactive', 'oab', 'urgency', 'frequency'],
  ['erectile', 'impotence', 'pde5', 'ed'],
  ['infertil', 'semen', 'sperm', 'azoosperm', 'varicocele'],
  ['infection', 'uti', 'sepsis', 'urosepsis', 'pyelonephritis', 'antibiotic'],
  ['hematuria', 'blood'],
  ['retention', 'catheter'],
  ['trauma', 'injury', 'aast'],
  ['pediatric', 'child', 'infant', 'neonat', 'peds'],
  ['ureter', 'upper tract', 'utuc'],
  ['hydronephrosis', 'dilatation', 'utd', 'obstruct'],
  ['adrenal', 'incidentaloma', 'pheochromocytoma'],
  ['penile', 'penis', 'peyronie', 'priapism'],
];

/** UK spellings folded to US so either form matches. */
const SPELLING: [RegExp, string][] = [
  [/haem/g, 'hem'],
  [/paed/g, 'ped'],
  [/oes/g, 'es'],
  [/tumour/g, 'tumor'],
];

const STOPWORDS = new Set(['of', 'the', 'and', 'for', 'in', 'a', 'an', 'to', 'with', 'on']);

export function normalize(s: string): string {
  let out = s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '');
  for (const [re, to] of SPELLING) out = out.replace(re, to);
  return out.replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

/** The query word plus every synonym stem from the groups it belongs to. */
function expand(word: string): string[] {
  const out = new Set([word]);
  for (const group of SYNONYM_GROUPS) {
    if (group.some((g) => (word.length < 3 ? g === word : word.startsWith(g) || g.startsWith(word)))) {
      group.forEach((g) => out.add(g));
    }
  }
  return [...out];
}

/** Whether any variant starts a word in the text (short variants must match whole words). */
function hits(words: readonly string[], variants: readonly string[]): boolean {
  return variants.some((v) => {
    if (v.includes(' ')) return words.join(' ').includes(v);
    return words.some((w) => (v.length < 3 ? w === v : w.startsWith(v)));
  });
}

export interface Searchable {
  label: string;
  sub: string;
  keywords: string;
}

/** Ranked matches for a query; empty query returns []. */
export function searchItems<T extends Searchable>(items: readonly T[], query: string, limit = 20): T[] {
  const terms = normalize(query)
    .split(' ')
    .filter((w) => w && !STOPWORDS.has(w));
  if (!terms.length) return [];
  const variants = terms.map(expand);
  const whole = normalize(query);

  const scored: { item: T; score: number }[] = [];
  for (const item of items) {
    const label = normalize(item.label).split(' ');
    const sub = normalize(item.sub).split(' ');
    const all = [...label, ...sub, ...normalize(item.keywords).split(' ')];
    let matched = 0;
    let score = 0;
    variants.forEach((v, i) => {
      if (!hits(all, v)) return;
      matched++;
      // The typed word itself beats a synonym; the title beats the body.
      const exact = [terms[i]!];
      score += hits(label, exact) ? 6 : hits(label, v) ? 4 : hits(sub, v) ? 2 : 1;
    });
    if (!matched) continue;
    if (matched === terms.length) score += 20;
    if (normalize(item.label).startsWith(whole)) score += 10;
    scored.push({ item, score });
  }
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.item);
}
