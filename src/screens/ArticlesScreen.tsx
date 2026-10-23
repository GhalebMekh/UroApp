import { useCallback, useEffect, useState } from 'react';
import { ExternalLinkIcon } from '@/components/icons';
import { cn } from '@/lib/cn';
import { loadFeed, type Feed, type FeedSource } from '@/lib/articlesFeed';

const SUBSPECIALTIES: { key: string; label: string }[] = [
  { key: 'topic', label: 'This week' },
  { key: 'oncology', label: 'Oncology' },
  { key: 'endourology', label: 'Endourology' },
  { key: 'pediatric', label: 'Pediatric' },
  { key: 'reconstructive', label: 'Reconstructive' },
];

function formatDate(raw: string): string {
  const d = new Date(raw);
  return Number.isNaN(d.getTime())
    ? raw
    : d.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' });
}

/** Weekly reads — a curated PubMed list, refreshed weekly, available offline. */
export function ArticlesScreen() {
  const [feed, setFeed] = useState<Feed | null>(null);
  const [source, setSource] = useState<FeedSource | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading');
  const [subspecialty, setSubspecialty] = useState('topic');

  const load = useCallback(async () => {
    setStatus('loading');
    const result = await loadFeed();
    if (result) {
      setFeed(result.feed);
      setSource(result.source);
      setStatus('ready');
    } else {
      setStatus('failed');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const articles = feed?.articles.filter((a) => a.subspecialty === subspecialty) ?? [];

  return (
    <div className="mx-auto max-w-wrap px-6 py-12">
      <div className="mb-3 text-[12.5px] font-semibold uppercase tracking-[0.14em] text-violet-soft">
        Weekly reads
      </div>
      <h2 className="mb-4 font-display text-[clamp(28px,4vw,40px)] font-semibold leading-[1.1] tracking-[-0.02em]">
        {feed ? feed.topic : 'This week in urology.'}
      </h2>
      {feed && (
        <p className="text-[13px] text-muted-2">
          Week {feed.week} · updated {formatDate(feed.generatedAt)}
          {source === 'bundled' && ' · offline copy'}
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        {SUBSPECIALTIES.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setSubspecialty(s.key)}
            aria-pressed={s.key === subspecialty}
            className={cn(
              'min-h-[44px] rounded-[10px] border px-3.5 py-2 text-[13px] font-semibold transition-colors',
              s.key === subspecialty
                ? 'border-violet bg-violet/[0.18] text-violet-soft'
                : 'border-line bg-navy-2 text-muted hover:border-violet',
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {status === 'loading' && <p className="text-[14px] text-muted">Loading this week's reading…</p>}

        {status === 'failed' && (
          <div className="rounded-[16px] border border-line bg-navy-2 p-5 text-[14px] text-muted">
            Weekly reads couldn't load right now.
            <button
              type="button"
              onClick={() => void load()}
              className="ml-2 font-semibold text-violet-soft hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {status === 'ready' && articles.length === 0 && (
          <p className="text-[14px] text-muted">Nothing in this subspecialty this week — check back next week.</p>
        )}

        {articles.map((a) => (
          <article key={a.pmid} className="rounded-[16px] border border-line bg-navy-2 p-5">
            <h3 className="mb-2 text-[15px] font-semibold leading-snug text-ink">
              <a
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-start gap-2 hover:text-violet-soft"
              >
                {a.title}
                <ExternalLinkIcon className="mt-1 h-4 w-4 shrink-0 opacity-60" />
              </a>
            </h3>
            <p className="text-[12.5px] text-muted">{a.authors}</p>
            <p className="mt-0.5 text-[12.5px] text-muted-2">
              <span className="font-semibold text-muted">{a.journal}</span> · {formatDate(a.pubDate)} · PMID {a.pmid}
            </p>
            {a.abstract && <p className="mt-3 line-clamp-3 text-[13.5px] text-muted">{a.abstract}</p>}
          </article>
        ))}
      </div>

      <p className="mt-8 text-[12px] text-muted-2">
        Selected automatically from PubMed each week around a rotating topic. Links open PubMed and
        need a connection. Always read the full paper before relying on it.
      </p>
    </div>
  );
}
