import type { Citation } from '@/data/citations';

/**
 * The source line under every clinical value — UroApp's signature detail
 * (unslop direction, 2026-11-22): one mono line, the same everywhere. The
 * "verify against the primary source" wording is required by the
 * clinical-safety rules — keep it.
 */
export function CitationNote({ citation }: { citation: Citation }) {
  const ref = citation.pmid
    ? `PMID ${citation.pmid}`
    : citation.doi
      ? `DOI ${citation.doi}`
      : (citation.label ?? 'source');

  return (
    <p className="mt-4 border-t border-line pt-3 font-mono text-[12px] leading-relaxed text-muted-2">
      <span className="text-muted">Source</span> · {citation.authors}, {citation.journal} {citation.year} ·{' '}
      <a
        href={citation.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-violet underline decoration-violet/40 underline-offset-2 hover:text-violet-soft"
      >
        {ref}
      </a>
      <span className="mt-1 block font-sans">Verify against the primary source before clinical use.</span>
    </p>
  );
}
