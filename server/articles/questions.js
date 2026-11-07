/**
 * Turns each paper into the research question it asks, plus its size, for the
 * Weekly reads cards (owner, 2026-11-07: "just type the research question and
 * let the reader decide whether to open PubMed"; published automatically).
 *
 * What may appear: the question (no findings) and the number of participants
 * or studies. Results are deliberately left out — a question is not a clinical
 * claim, so nothing here needs checking against the paper before it ships.
 * Every number in `size` must appear in the abstract, or it is dropped; a
 * question that slips in a result is dropped too, and the card falls back to
 * the paper's title.
 *
 * Needs ANTHROPIC_API_KEY (GitHub secret). Without it the feed still publishes,
 * just without questions.
 */
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import * as z from "zod/v4";
import { cleanQuestion, cleanSize } from "./questionGuards.js";

const MODEL = "claude-opus-5-5";
const CONCURRENCY = 4;

const Answer = z.object({
  question: z.string(),
  size: z.string().nullable(),
});

const SYSTEM = `You write the research question for papers in a weekly urology reading list for urologists and residents.

From the title and abstract, write:
- question: the one question the paper sets out to answer, in your own words (not the title reworded), in plain clinical English, at most 25 words, ending with "?". State the population, the intervention or exposure and, where there is one, the comparison. Never state or hint at a finding, result, conclusion or number from the results.
- size: how many participants (or, for a review, how many studies and patients) the abstract states, e.g. "412 patients" or "30 studies, 2,384 patients". Copy the numbers exactly as written. Use null if the abstract gives no count; never estimate.`;

async function askOne(client, article, abstract) {
  const message = await client.beta.messages.parse({
    model: MODEL,
    max_tokens: 4000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default", // if a classifier declines, the API retries on a fallback model
    output_config: { effort: "low", format: betaZodOutputFormat(Answer) },
    system: SYSTEM,
    messages: [{ role: "user", content: `Title: ${article.title}\n\nAbstract:\n${abstract}` }],
  });
  if (message.stop_reason === "refusal" || !message.parsed_output) return null;
  const question = cleanQuestion(message.parsed_output.question);
  if (!question) return null;
  return { question, size: cleanSize(message.parsed_output.size, abstract) };
}

/**
 * Adds `question` and `size` to the articles that have an abstract. Failures
 * leave that article as it was; the run itself never fails because of them.
 */
export async function addQuestions(articles, abstracts) {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log("ANTHROPIC_API_KEY not set — publishing without research questions.");
    return articles;
  }
  const client = new Anthropic();
  const queue = articles.filter((a) => (abstracts.get(a.pmid) ?? "").length >= 200);
  let done = 0;
  let kept = 0;

  async function worker() {
    for (let a = queue.shift(); a; a = queue.shift()) {
      try {
        const result = await askOne(client, a, abstracts.get(a.pmid));
        if (result) {
          a.question = result.question;
          if (result.size) a.size = result.size;
          kept += 1;
        }
      } catch (e) {
        if (e instanceof Anthropic.AuthenticationError) throw e; // a bad key won't fix itself
        console.error(`Question for PMID ${a.pmid} failed: ${e.message}`);
      }
      done += 1;
    }
  }

  try {
    await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  } catch (e) {
    console.error(`Research questions skipped: ${e.message}`);
  }
  console.log(`Research questions: ${kept} of ${done} papers.`);
  return articles;
}
