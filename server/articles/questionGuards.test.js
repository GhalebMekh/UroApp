import { describe, expect, it } from "vitest";
import { cleanQuestion, cleanSize, studyTypeOf } from "./questionGuards.js";

describe("research question guard", () => {
  it("keeps a plain question", () => {
    const q = "Does neoadjuvant chemotherapy before nephroureterectomy improve survival in upper tract urothelial carcinoma?";
    expect(cleanQuestion(`  ${q} `)).toBe(q);
  });

  it("drops anything that carries a result", () => {
    expect(cleanQuestion("Does NAC give a 44% lower risk of death after nephroureterectomy?")).toBeNull();
    expect(cleanQuestion("Is baclofen better than placebo for pelvic pain (p < 0.001)?")).toBeNull();
    expect(cleanQuestion("Does NAC before RNU have HR 0.56 for overall survival in UTUC?")).toBeNull();
    expect(cleanQuestion("Which boys had complications that were associated reduced albumin?")).toBeNull();
  });

  it("drops non-questions and odd lengths", () => {
    expect(cleanQuestion("HoLEP is safe as day surgery.")).toBeNull();
    expect(cleanQuestion("Safe?")).toBeNull();
    expect(cleanQuestion(null)).toBeNull();
  });
});

describe("size guard", () => {
  const abstract = "The review included 30 studies covering 2,384 patients treated between 1995 and 2025.";

  it("keeps a size whose numbers all appear in the abstract", () => {
    expect(cleanSize("30 studies, 2,384 patients", abstract)).toBe("30 studies, 2,384 patients");
    expect(cleanSize("2384 patients", abstract)).toBe("2384 patients");
  });

  it("drops invented or missing numbers", () => {
    expect(cleanSize("2,500 patients", abstract)).toBeNull();
    expect(cleanSize("several hundred patients", abstract)).toBeNull();
    expect(cleanSize(null, abstract)).toBeNull();
  });
});

describe("study type from PubMed publication types", () => {
  it("names the most specific design", () => {
    expect(studyTypeOf(["Journal Article", "Meta-Analysis", "Systematic Review"])).toBe("Systematic review & meta-analysis");
    expect(studyTypeOf(["Randomized Controlled Trial", "Journal Article"])).toBe("Randomised controlled trial");
    expect(studyTypeOf(["Consensus Statement", "Journal Article"])).toBe("Consensus statement");
    expect(studyTypeOf(["Review", "Journal Article"])).toBe("Review");
    expect(studyTypeOf(["Journal Article"])).toBe("");
    expect(studyTypeOf(undefined)).toBe("");
  });
});
