import type { Citation } from '@/data/citations';

/**
 * Renders the primary-source line under a calculator. The "verify against the
 * primary source" wording is required by the clinical-safety rules — keep it.
 */
export function CitationNote({ citation }: { citation: Citation }) {
  const ref = citation.pmid
    ? `PMID ${citation.pmid}`
    : citation.doi
      ? `DOI ${citation.doi}`
      : (citation.label ?? 'source');

  return (
    <p className="mt-3 text-[11.5px] text-muted-2">
      {citation.authors}, <i>{citation.journal}</i> {citation.year} —{' '}
      <a
        href={citation.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-violet-soft underline"
      >
        {ref}
      </a>
      . Verify against the primary source before clinical use.
    </p>
  );
}
