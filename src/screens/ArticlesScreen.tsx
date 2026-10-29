import { useCallback, useEffect, useState } from 'react';
import { ExternalLinkIcon } from '@/components/icons';
import { loadFeed, type Feed, type FeedSource } from '@/lib/articlesFeed';
import { HeroChips, PageBody, PageHero } from '@/components/PageHero';

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
    <>
      <PageHero
        eyebrow="Weekly reads"
        title={feed ? feed.topic : 'This week in urology.'}
        lede={
          feed && (
            <>
              Week {feed.week} · updated {formatDate(feed.generatedAt)}
              {source === 'bundled' && ' · offline copy'}
            </>
          )
        }
      >
        <HeroChips
          value={subspecialty}
          onChange={setSubspecialty}
          items={SUBSPECIALTIES.map((s) => ({ id: s.key, label: s.label }))}
        />
      </PageHero>

      <PageBody>
        <div className="space-y-4">
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
      </PageBody>
    </>
  );
}
