import axios from 'axios';

// Subspecialty keyword mappings for targeted PubMed queries
const subspecialtyKeywords = {
  oncology: "prostate cancer OR bladder cancer OR kidney cancer",
  endourology: "nephrolithiasis OR ureteroscopy OR lithotripsy",
  pediatric: "pediatric urology OR hydronephrosis",
  reconstructive: "ureteral stricture OR urethral stricture"
};

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

// Query PubMed for articles using E-utilities
export async function fetchArticlesFromPMC(topic, subspecialty) {
  try {
    const keyword = subspecialtyKeywords[subspecialty] || "urology";
    // Broaden the query to increase chances of finding articles
    const query = `(${topic} OR ${keyword})`;

    console.log(`\n🔍 Fetching PubMed articles for ${subspecialty}`);

    // Step 1: Search using esearch (returns XML by default)
    const searchUrl = `${BASE_URL}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=10&tool=${TOOL}&email=${EMAIL}`;
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
          abstract: item.summary?.substring(0, 500) || "",
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
  const subspecialties = Object.keys(subspecialtyKeywords);
  const allArticles = [];

  for (const specialty of subspecialties) {
    const articles = await fetchArticlesFromPMC(topic, specialty);
    allArticles.push(...articles);
    // Rate limit: 3 requests per second for NCBI
    await new Promise((r) => setTimeout(r, 350));
  }

  return allArticles;
}
