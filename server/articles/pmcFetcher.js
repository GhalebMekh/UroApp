import axios from 'axios';
import { studyTypeOf } from './questionGuards.js';

// Subspecialty keyword mappings for targeted PubMed queries
// Phrases are quoted so PubMed matches them as phrases. Bare "lithotripsy"
// also matched intravascular lithotripsy (aortic EVAR papers), hence the
// specific stone terms.
const subspecialtyKeywords = {
  oncology:
    '"prostate cancer" OR "bladder cancer" OR "renal cell carcinoma" OR "kidney cancer" OR "upper tract urothelial" OR "testicular cancer"',
  endourology:
    'nephrolithiasis OR urolithiasis OR ureteroscopy OR "percutaneous nephrolithotomy" OR "shock wave lithotripsy"',
  pediatric:
    'hydronephrosis OR "vesicoureteral reflux" OR hypospadias OR cryptorchidism OR "posterior urethral valves" OR "pediatric urology"',
  reconstructive:
    '"ureteral stricture" OR "urethral stricture" OR urethroplasty OR "ureteral reconstruction"'
};

// Urology journals only (NLM title abbreviations). Without it the feed pulled
// chemistry, vascular and education papers that merely mentioned a keyword.
const UROLOGY_JOURNALS = [
  "Eur Urol", "Eur Urol Focus", "Eur Urol Oncol", "Eur Urol Open Sci", "J Urol",
  "BJU Int", "Urology", "World J Urol", "J Endourol", "Urolithiasis", "J Pediatr Urol",
  "Urol Oncol", "Nat Rev Urol", "Prostate Cancer Prostatic Dis", "Neurourol Urodyn",
  "Curr Opin Urol", "Int J Urol", "Urol Int", "Can Urol Assoc J", "Int Braz J Urol",
  "Investig Clin Urol", "Asian J Urol", "Transl Androl Urol",
].map((j) => `"${j}"[ta]`).join(" OR ");

// Clinical evidence only. Without this the feed pulled basic-science papers
// (e.g. single-cell lncRNA studies) into a clinician's reading list.
const CLINICAL_FILTER =
  "(review[pt] OR systematic review[pt] OR meta-analysis[pt] OR randomized controlled trial[pt] OR practice guideline[pt] OR guideline[pt])";

// Published in the last two years (E-utilities date window, in days).
const RECENT_DAYS = 730;

const BASE_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";
const TOOL = "uroapp";
const EMAIL = "articles@uroapp.clinic";

// Simple XML tag extraction helper
function extractTag(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}>([^<]*)</${tag}>`));
  return match ? match[1] : null;
}

// Extract list of IDs from XML
function extractIdList(xml) {
  const matches = xml.match(/<Id>(\d+)<\/Id>/g);
  return matches ? matches.map(m => m.replace(/<\/?Id>/g, '')) : [];
}

/** Strip PubMed XML markup (<i>, <sup>, entities) from abstract text. */
function plainText(xml) {
  return xml
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Abstracts for a set of PMIDs (efetch XML; esummary has none). Used only to
 * write each paper's research question — the abstract itself is the journal's
 * text and is never published in the feed.
 */
export async function fetchAbstracts(pmids) {
  const out = new Map();
  if (pmids.length === 0) return out;
  const url = `${BASE_URL}/efetch.fcgi?db=pubmed&id=${pmids.join(",")}&retmode=xml&tool=${TOOL}&email=${EMAIL}`;
  const res = await axios.get(url, { timeout: 20000, responseType: "text" });
  for (const article of String(res.data).split("</PubmedArticle>")) {
    const pmid = article.match(/<PMID[^>]*>(\d+)<\/PMID>/)?.[1];
    if (!pmid) continue;
    const parts = [...article.matchAll(/<AbstractText([^>]*)>([\s\S]*?)<\/AbstractText>/g)].map(([, attrs, body]) => {
      const label = attrs.match(/Label="([^"]*)"/)?.[1];
      const text = plainText(body);
      return label ? `${label}: ${text}` : text;
    });
    if (parts.length) out.set(pmid, parts.join("\n"));
  }
  return out;
}

// Query PubMed for articles using E-utilities
export async function fetchArticlesFromPMC(topic, subspecialty) {
  try {
    // "topic" = this week's rotating topic; otherwise the subspecialty's keywords.
    // The old query OR-ed the two, so every list mixed unrelated papers and
    // all were labelled with the week's topic.
    const subject = subspecialty === "topic" ? topic : subspecialtyKeywords[subspecialty] || "urology";
    const query = `(${subject}) AND ${CLINICAL_FILTER} AND (${UROLOGY_JOURNALS}) AND english[la]`;

    console.log(`\n🔍 Fetching PubMed articles for ${subspecialty}`);

    // Step 1: Search using esearch (returns XML by default). Best Match ordering.
    const searchUrl = `${BASE_URL}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=10&datetype=pdat&reldate=${RECENT_DAYS}&tool=${TOOL}&email=${EMAIL}`;
    const searchRes = await axios.get(searchUrl, { timeout: 10000 });

    const pmids = extractIdList(searchRes.data);
    if (pmids.length === 0) {
      console.log(`⚠️  No results`);
      return [];
    }

    console.log(`✓ Found ${pmids.length} articles`);

    // Step 2: Get summaries using esummary with JSON output
    const summaryUrl = `${BASE_URL}/esummary.fcgi?db=pubmed&id=${pmids.join(",")}&retmode=json&rettype=json&tool=${TOOL}&email=${EMAIL}`;
    const summaryRes = await axios.get(summaryUrl, { timeout: 10000 });

    const result = summaryRes.data?.result;
    if (!result || !result.uids) {
      console.log(`⚠️  No summaries returned`);
      return [];
    }

    const articles = result.uids
      .map((uid) => {
        const item = result[uid];
        if (!item || !item.title) return null;

        const authors = item.authors?.slice(0, 3).map((a) => a.name).join(", ") || "Unknown";

        // Parse pubdate: "2026 Jul 31" → "2026-07-31"
        const rawDate = item.pubdate || new Date().toISOString().split("T")[0];
        const months = {Jan:1,Feb:2,Mar:3,Apr:4,May:5,Jun:6,Jul:7,Aug:8,Sep:9,Oct:10,Nov:11,Dec:12};
        const parts = rawDate.split(/\s+/);
        let pubDate = rawDate;
        if (parts.length >= 2) {
          const year = parts[0];
          const month = months[parts[1]];
          const day = parts[2] || "01";
          if (month) pubDate = `${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
        }

        return {
          pmid: uid,
          title: item.title,
          authors,
          journal: item.source || "PubMed",
          pubDate,
          // esummary carries no abstract; the feed doesn't publish one (journal text).
          abstract: "",
          studyType: studyTypeOf(Array.isArray(item.pubtype) ? item.pubtype : []),
          url: `https://pubmed.ncbi.nlm.nih.gov/${uid}/`,
          subspecialty,
          topic
        };
      })
      .filter(Boolean);

    console.log(`✓ Parsed ${articles.length} articles`);
    return articles;
  } catch (e) {
    console.error(`❌ Error for ${subspecialty}:`, e.message);
    return [];
  }
}

// Fetch articles for all subspecialties for a given topic
export async function fetchWeeklyArticles(topic) {
  const subspecialties = ["topic", ...Object.keys(subspecialtyKeywords)];
  const allArticles = [];
  const seen = new Set();

  for (const specialty of subspecialties) {
    const articles = await fetchArticlesFromPMC(topic, specialty);
    // Each paper appears in one tab only — the first list that found it.
    for (const a of articles) {
      if (seen.has(a.pmid)) continue;
      seen.add(a.pmid);
      allArticles.push(a);
    }
    // Rate limit: 3 requests per second for NCBI
    await new Promise((r) => setTimeout(r, 350));
  }

  return allArticles;
}
