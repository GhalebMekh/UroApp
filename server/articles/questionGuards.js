/**
 * Checks on what the model writes for each paper (questions.js), kept free of
 * dependencies so the app's test suite can run them.
 */

/** Result-like content a research question must not carry. */
const RESULT_PATTERNS = [
  /\d\s*%/,
  /\bp\s*[<=>]/i,
  /\b(HR|OR|RR|CI)\b\s*[\d(=]/,
  /\b(improved|reduced|increased|decreased|was associated)\b/i,
];

function numbersIn(text) {
  return new Set(text.replace(/(\d),(\d{3})/g, "$1$2").match(/\d+(\.\d+)?/g) ?? []);
}

/** Keep the question only if it reads as a question and carries no result. */
export function cleanQuestion(raw) {
  const q = String(raw ?? "").replace(/\s+/g, " ").trim();
  if (q.length < 20 || q.length > 220 || !q.endsWith("?")) return null;
  if (RESULT_PATTERNS.some((re) => re.test(q))) return null;
  return q;
}

/** Keep the size only if every number in it appears in the abstract. */
export function cleanSize(raw, abstract) {
  const s = String(raw ?? "").replace(/\s+/g, " ").trim();
  if (!s || s.length > 60) return null;
  const allowed = numbersIn(String(abstract ?? ""));
  const used = numbersIn(s);
  if (used.size === 0) return null;
  for (const n of used) if (!allowed.has(n)) return null;
  return s;
}

/**
 * The study design shown under each question, from PubMed's own publication
 * types (indexed by NLM, not inferred). Most specific first.
 */
export function studyTypeOf(pubtypes) {
  const list = Array.isArray(pubtypes) ? pubtypes : [];
  const has = (t) => list.some((p) => String(p).toLowerCase() === t.toLowerCase());
  if (has("Meta-Analysis") && has("Systematic Review")) return "Systematic review & meta-analysis";
  if (has("Meta-Analysis")) return "Meta-analysis";
  if (has("Systematic Review")) return "Systematic review";
  if (has("Randomized Controlled Trial")) return "Randomised controlled trial";
  if (has("Practice Guideline") || has("Guideline")) return "Guideline";
  if (has("Consensus Statement") || has("Consensus Development Conference")) return "Consensus statement";
  if (list.some((p) => /^Clinical Trial/i.test(String(p)))) return "Clinical trial";
  if (has("Review")) return "Review";
  return "";
}
