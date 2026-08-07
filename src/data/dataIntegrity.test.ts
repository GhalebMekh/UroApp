/**
 * Data-integrity guards for the clinical datasets.
 *
 * These exist because of two real defects shipped in this project:
 *   1. ~77 fabricated AUA URLs written from memory, all of which 404'd.
 *   2. Bilingual consent content where a missing Arabic string would have
 *      silently printed an empty section on a consent form.
 * Unit tests on calculators would not have caught either.
 */
import { describe, expect, it } from 'vitest';
import { GUIDELINES, ONCOLOGY_GUIDELINE_IDS } from './guidelines';
import { CONSENT_PROCEDURES, CONSENT_BOILERPLATE } from './consent';
import { PROCEDURES } from './procedures';
import { SURVEILLANCE } from './surveillance';
import { DRUG_INTERACTIONS } from './drugInteractions';
import { CONFERENCES } from './conferences';
import { SCENARIOS } from './scenarios';
import { buildICS } from '../lib/ics';

/** AUA guideline pages live under /guidelines-and-quality/guidelines/. */
const AUA_PATTERN = /^https:\/\/www\.auanet\.org\/guidelines-and-quality\/guidelines\/[\w\-()/.]+$/;
/** EAU guideline pages live under uroweb.org/guidelines/. */
const EAU_PATTERN = /^https:\/\/uroweb\.org\/(guidelines|eau-guidelines)\/[\w\-()/.]+$/;

function isSupportedSourceUrl(url: string): boolean {
  return (
    AUA_PATTERN.test(url) ||
    EAU_PATTERN.test(url) ||
    url.startsWith('https://pubmed.ncbi.nlm.nih.gov/') ||
    url.startsWith('https://doi.org/') ||
    url.startsWith('https://www.baus.org.uk/') ||
    url.startsWith('/guidelines/') // bundled local PDF
  );
}

describe('guidelines', () => {
  it('has unique ids', () => {
    const ids = GUIDELINES.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('uses the correct AUA URL path for every auaUrl', () => {
    // The old, fabricated form was /guidelines/<name> — it must never come back.
    for (const g of GUIDELINES) {
      if (!g.auaUrl) continue;
      expect(g.auaUrl, `${g.id} auaUrl`).toMatch(AUA_PATTERN);
      expect(g.auaUrl, `${g.id} must not use the legacy /guidelines/ path`).not.toMatch(
        /auanet\.org\/guidelines\/[a-z]/,
      );
    }
  });

  it('uses a valid EAU URL for every eauUrl', () => {
    for (const g of GUIDELINES) {
      if (!g.eauUrl) continue;
      expect(g.eauUrl, `${g.id} eauUrl`).toMatch(EAU_PATTERN);
    }
  });

  it('points every bundled PDF at the public guidelines folder', () => {
    for (const g of GUIDELINES) {
      if (g.pdfUrl) expect(g.pdfUrl, `${g.id} pdfUrl`).toMatch(/^\/guidelines\/.+\.pdf$/);
      if (g.eauPdfUrl) expect(g.eauPdfUrl, `${g.id} eauPdfUrl`).toMatch(/^\/guidelines\/.+\.pdf$/);
    }
  });

  it('gives every step source a recognised, non-fabricated URL', () => {
    for (const g of GUIDELINES) {
      for (const section of g.sections) {
        for (const step of section.steps) {
          if (!step.source) continue;
          expect(
            isSupportedSourceUrl(step.source.url),
            `${g.id} → "${step.label}" has an unrecognised source URL: ${step.source.url}`,
          ).toBe(true);
        }
      }
    }
  });

  it('has non-empty content in every section', () => {
    for (const g of GUIDELINES) {
      expect(g.quickAlgorithm.trim().length, `${g.id} quickAlgorithm`).toBeGreaterThan(0);
      expect(g.sections.length, `${g.id} sections`).toBeGreaterThan(0);
      for (const section of g.sections) {
        expect(section.steps.length, `${g.id} → ${section.title}`).toBeGreaterThan(0);
      }
    }
  });

  it('only lists oncology ids that actually exist', () => {
    const ids = new Set(GUIDELINES.map((g) => g.id));
    for (const id of ONCOLOGY_GUIDELINE_IDS) {
      expect(ids.has(id), `ONCOLOGY_GUIDELINE_IDS references unknown guideline "${id}"`).toBe(true);
    }
  });
});

describe('bilingual consent', () => {
  it('has unique ids', () => {
    const ids = CONSENT_PROCEDURES.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has both English and Arabic for every field', () => {
    for (const p of CONSENT_PROCEDURES) {
      const pairs = [
        ['name', p.name],
        ['description', p.description],
        ['anaesthesia', p.anaesthesia],
        ...p.benefits.map((b, i) => [`benefits[${i}]`, b] as const),
        ...p.alternatives.map((a, i) => [`alternatives[${i}]`, a] as const),
        ...p.complications.map((c, i) => [`complications[${i}]`, c] as const),
      ] as [string, { en: string; ar: string }][];

      for (const [field, text] of pairs) {
        expect(text.en.trim().length, `${p.id}.${field}.en is empty`).toBeGreaterThan(0);
        expect(text.ar.trim().length, `${p.id}.${field}.ar is empty`).toBeGreaterThan(0);
      }
    }
  });

  it('actually contains Arabic script in every ar field', () => {
    // Guards against an English string being pasted into the ar slot.
    const arabic = /[؀-ۿ]/;
    for (const p of CONSENT_PROCEDURES) {
      expect(arabic.test(p.name.ar), `${p.id}.name.ar has no Arabic script`).toBe(true);
      expect(arabic.test(p.description.ar), `${p.id}.description.ar has no Arabic script`).toBe(true);
      for (const c of p.complications) {
        expect(arabic.test(c.ar), `${p.id} complication "${c.en}" has no Arabic script`).toBe(true);
      }
    }
  });

  it('has at least one benefit, alternative and complication each', () => {
    for (const p of CONSENT_PROCEDURES) {
      expect(p.benefits.length, `${p.id} benefits`).toBeGreaterThan(0);
      expect(p.alternatives.length, `${p.id} alternatives`).toBeGreaterThan(0);
      expect(p.complications.length, `${p.id} complications`).toBeGreaterThan(0);
    }
  });

  it('has bilingual boilerplate for the printed form', () => {
    const arabic = /[؀-ۿ]/;
    expect(arabic.test(CONSENT_BOILERPLATE.title.ar)).toBe(true);
    expect(arabic.test(CONSENT_BOILERPLATE.statement.ar)).toBe(true);
    expect(arabic.test(CONSENT_BOILERPLATE.disclaimer.ar)).toBe(true);
    expect(CONSENT_BOILERPLATE.statement.en.length).toBeGreaterThan(50);
  });
});

describe('procedures', () => {
  it('has unique ids', () => {
    const ids = PROCEDURES.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has anatomy, steps and complications for every procedure', () => {
    for (const p of PROCEDURES) {
      expect(p.anatomy.length, `${p.id} anatomy`).toBeGreaterThan(0);
      expect(p.steps.length, `${p.id} steps`).toBeGreaterThan(0);
      expect(p.complications.length, `${p.id} complications`).toBeGreaterThan(0);
    }
  });

  it('gives every procedure a resolvable operative citation', () => {
    for (const p of PROCEDURES) {
      expect(isSupportedSourceUrl(p.citation.url), `${p.id} citation ${p.citation.url}`).toBe(true);
    }
  });

  it('uses the correct AUA/EAU path for any attached guideline', () => {
    for (const p of PROCEDURES) {
      if (!p.guideline) continue;
      const url = p.guideline.url;
      expect(
        AUA_PATTERN.test(url) || EAU_PATTERN.test(url),
        `${p.id} guideline URL is not a recognised AUA/EAU page: ${url}`,
      ).toBe(true);
    }
  });
});

describe('surveillance', () => {
  it('has unique diagnosis and protocol ids', () => {
    const diagIds = SURVEILLANCE.map((d) => d.id);
    expect(new Set(diagIds).size).toBe(diagIds.length);

    const protocolIds = SURVEILLANCE.flatMap((d) => d.protocols.map((p) => p.id));
    expect(new Set(protocolIds).size).toBe(protocolIds.length);
  });

  it('has at least one protocol per diagnosis and visits in every protocol', () => {
    for (const d of SURVEILLANCE) {
      expect(d.protocols.length, `${d.id} protocols`).toBeGreaterThan(0);
      for (const p of d.protocols) {
        expect(p.visits.length, `${p.id} visits`).toBeGreaterThan(0);
        expect(p.thereafter.trim().length, `${p.id} thereafter`).toBeGreaterThan(0);
        expect(p.notes.length, `${p.id} notes`).toBeGreaterThan(0);
      }
    }
  });

  it('keeps visits in ascending month order with no duplicates', () => {
    // The merge() helper must not emit the same month twice, or the printed
    // calendar would show two rows for one appointment.
    for (const d of SURVEILLANCE) {
      for (const p of d.protocols) {
        const months = p.visits.map((v) => v.month);
        expect(months, `${p.id} months not ascending`).toEqual([...months].sort((a, b) => a - b));
        expect(new Set(months).size, `${p.id} has duplicate months`).toBe(months.length);
      }
    }
  });

  it('has non-negative months and at least one test per visit', () => {
    for (const d of SURVEILLANCE) {
      for (const p of d.protocols) {
        for (const v of p.visits) {
          expect(v.month, `${p.id} month`).toBeGreaterThanOrEqual(0);
          expect(v.tests.length, `${p.id} month ${v.month} has no tests`).toBeGreaterThan(0);
        }
      }
    }
  });

  it('cites a recognised AUA/EAU guideline for every protocol', () => {
    for (const d of SURVEILLANCE) {
      for (const p of d.protocols) {
        const url = p.source.url;
        expect(
          AUA_PATTERN.test(url) || EAU_PATTERN.test(url),
          `${p.id} source is not a recognised AUA/EAU page: ${url}`,
        ).toBe(true);
      }
    }
  });
});

describe('conferences', () => {
  const ISO = /^\d{4}-\d{2}-\d{2}$/;

  it('has unique ids', () => {
    const ids = CONFERENCES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has valid ISO dates with end on or after start', () => {
    for (const c of CONFERENCES) {
      expect(c.startDate, `${c.id} startDate`).toMatch(ISO);
      expect(c.endDate, `${c.id} endDate`).toMatch(ISO);
      expect(Number.isNaN(Date.parse(c.startDate)), `${c.id} startDate parse`).toBe(false);
      expect(Number.isNaN(Date.parse(c.endDate)), `${c.id} endDate parse`).toBe(false);
      expect(c.endDate >= c.startDate, `${c.id} end before start`).toBe(true);
    }
  });

  it('gives every conference an https official website', () => {
    for (const c of CONFERENCES) {
      expect(c.url, `${c.id} url`).toMatch(/^https:\/\/.+/);
    }
  });

  it('has a city, country and organisation for every conference', () => {
    for (const c of CONFERENCES) {
      expect(c.city.trim().length, `${c.id} city`).toBeGreaterThan(0);
      expect(c.country.trim().length, `${c.id} country`).toBeGreaterThan(0);
      expect(c.organisation.trim().length, `${c.id} organisation`).toBeGreaterThan(0);
      expect(c.notes.trim().length, `${c.id} notes`).toBeGreaterThan(0);
    }
  });

  it('builds a well-formed .ics with an exclusive all-day DTEND', () => {
    const ics = buildICS([
      {
        uid: 'test@uroapp',
        startDate: '2027-03-19',
        endDate: '2027-03-22',
        title: 'Test; congress, with specials',
        location: 'Amsterdam, Netherlands',
        url: 'https://example.org/',
        description: 'line one\nline two',
      },
    ]);
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('END:VCALENDAR');
    expect(ics).toContain('DTSTART;VALUE=DATE:20270319');
    // DTEND is exclusive, so the 22nd (last day) becomes the 23rd.
    expect(ics).toContain('DTEND;VALUE=DATE:20270323');
    // Text values must be escaped.
    expect(ics).toContain('SUMMARY:Test\\; congress\\, with specials');
    expect(ics).toContain('line one\\nline two');
    // CRLF line endings per RFC 5545.
    expect(ics.includes('\r\n')).toBe(true);
  });
});

describe('intra-op scenarios', () => {
  it('has unique scenario and node ids', () => {
    const ids = SCENARIOS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const s of SCENARIOS) {
      const nodeIds = s.nodes.map((n) => n.id);
      expect(new Set(nodeIds).size, `${s.id} node ids`).toBe(nodeIds.length);
    }
  });

  it('has at least one node with content in every scenario', () => {
    for (const s of SCENARIOS) {
      expect(s.vignette.trim().length, `${s.id} vignette`).toBeGreaterThan(0);
      expect(s.nodes.length, `${s.id} nodes`).toBeGreaterThan(0);
    }
  });

  it('gives every node exactly one correct choice, all with feedback', () => {
    for (const s of SCENARIOS) {
      for (const n of s.nodes) {
        expect(n.choices.length, `${s.id}/${n.id} choices`).toBeGreaterThanOrEqual(2);
        const correct = n.choices.filter((c) => c.correct);
        expect(correct.length, `${s.id}/${n.id} must have exactly one correct choice`).toBe(1);
        // A correct choice must never be terminal (it should advance the case).
        expect(correct[0]!.terminal ?? false, `${s.id}/${n.id} correct choice is terminal`).toBe(false);
        for (const c of n.choices) {
          expect(c.outcome.trim().length, `${s.id}/${n.id} choice missing outcome`).toBeGreaterThan(0);
        }
      }
    }
  });

  it('cites a recognised AUA/EAU guideline for every node', () => {
    for (const s of SCENARIOS) {
      for (const n of s.nodes) {
        expect(
          AUA_PATTERN.test(n.source.url) || EAU_PATTERN.test(n.source.url),
          `${s.id}/${n.id} source is not a recognised AUA/EAU page: ${n.source.url}`,
        ).toBe(true);
      }
    }
  });
});

describe('drug interactions', () => {
  it('has unique ids', () => {
    const ids = DRUG_INTERACTIONS.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('states an effect and a management action for every interaction', () => {
    for (const d of DRUG_INTERACTIONS) {
      expect(d.effect.trim().length, `${d.id} effect`).toBeGreaterThan(0);
      expect(d.management.trim().length, `${d.id} management`).toBeGreaterThan(0);
      expect(d.drugA.trim().length, `${d.id} drugA`).toBeGreaterThan(0);
      expect(d.drugB.trim().length, `${d.id} drugB`).toBeGreaterThan(0);
    }
  });

  it('only uses a recognised URL when a source link is given', () => {
    for (const d of DRUG_INTERACTIONS) {
      if (!d.source.url) continue;
      expect(isSupportedSourceUrl(d.source.url), `${d.id} source ${d.source.url}`).toBe(true);
    }
  });
});
