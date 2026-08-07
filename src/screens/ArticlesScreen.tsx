import { useEffect, useState } from 'react';
import { ExternalLinkIcon } from '@/components/icons';

interface Article {
  pmid: string;
  title: string;
  authors: string;
  journal: string;
  pubDate: string;
  abstract: string;
  url: string;
  subspecialty: string;
  topic: string;
}

interface ApiResponse {
  success: boolean;
  count: number;
  week: number;
  subspecialties: string[];
  articles: Article[];
}

/**
 * Where the articles service lives. In dev that's the local server on 3001; in
 * a deployed build it must come from VITE_ARTICLES_API, because localhost on a
 * colleague's phone is their own device (and http:// on an https:// page is
 * blocked as mixed content). Null means "not configured" — the screen then says
 * so instead of failing on a request that could never have worked.
 */
const API_BASE: string | null =
  import.meta.env.VITE_ARTICLES_API || (import.meta.env.DEV ? 'http://localhost:3001' : null);

export function ArticlesScreen() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [subspecialty, setSubspecialty] = useState<string>('oncology');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weeklyTopic, setWeeklyTopic] = useState<string>('');

  useEffect(() => {
    if (API_BASE === null) {
      setLoading(false);
      setError('Weekly reads needs a live connection and is not available in this build.');
      return;
    }

    const fetchArticles = async () => {
      try {
        setLoading(true);
        const url = `${API_BASE}/api/articles${subspecialty ? `?subspecialty=${subspecialty}` : ''}`;
        const res = await fetch(url);

        // Read as text first: a misrouted /api call is answered with HTML, and
        // res.json() on that throws a parser error rather than a usable one.
        const raw = await res.text();
        let data: ApiResponse;
        try {
          data = JSON.parse(raw) as ApiResponse;
        } catch {
          console.error(`Expected JSON from ${url}, got ${res.status}:`, raw.slice(0, 200));
          throw new Error('The articles service returned an unexpected response.');
        }

        if (data.success) {
          setArticles(data.articles);
          setWeeklyTopic(data.articles[0]?.topic || '');
          setError(null);
        } else {
          setError('Could not load this week’s articles.');
        }
      } catch (e) {
        console.error(e);
        setError('Could not reach the articles service. Check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [subspecialty]);

  const subspecialtyLabels: Record<string, string> = {
    oncology: 'Oncology',
    endourology: 'Endourology',
    pediatric: 'Pediatric',
    reconstructive: 'Reconstructive'
  };

  const filteredArticles = articles.filter((a) => a.subspecialty === subspecialty);

  return (
    <div className="min-h-screen bg-navy pb-20">
      {/* Header */}
      <div className="border-b border-line bg-navy-2 px-4 py-6">
        <h1 className="mb-1 font-display text-2xl font-semibold">Weekly Reads</h1>
        {weeklyTopic && (
          <p className="text-sm text-muted">This week: <em>{weeklyTopic}</em></p>
        )}
      </div>

      {/* Subspecialty tabs */}
      <div className="border-b border-line bg-navy-2 px-4 py-3">
        <div className="flex gap-2 overflow-x-auto">
          {Object.entries(subspecialtyLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSubspecialty(key)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                subspecialty === key
                  ? 'bg-violet text-ink'
                  : 'bg-steel text-muted hover:bg-steel/80'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {loading && (
          <div className="text-center text-muted">
            <div className="mb-2 text-sm">Loading articles…</div>
            <p className="text-xs text-muted-2">Fetching from PubMed Central</p>
          </div>
        )}

        {/* Steel, not crimson: crimson is reserved for risk/calculus cues (CLAUDE.md). */}
        {error && (
          <div className="rounded-card border border-line bg-steel p-4">
            <p className="text-sm text-ink">{error}</p>
            <p className="mt-2 text-xs text-muted">
              The rest of UroApp works offline — calculators, guidelines and drugs are all available.
            </p>
          </div>
        )}

        {!loading && !error && filteredArticles.length === 0 && (
          <div className="text-center text-muted">
            <p>No articles available for {subspecialtyLabels[subspecialty]} this week.</p>
            <p className="mt-2 text-xs">Check back later!</p>
          </div>
        )}

        {!loading && filteredArticles.length > 0 && (
          <div className="space-y-4">
            {filteredArticles.map((article) => (
              <article
                key={article.pmid}
                className="group overflow-hidden rounded-card border border-line bg-navy-2 p-5 transition hover:border-violet/50"
              >
                <h3 className="mb-2 line-clamp-2 font-semibold leading-tight text-ink hover:text-violet transition">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2"
                  >
                    {article.title}
                    <ExternalLinkIcon className="mt-1 h-4 w-4 flex-shrink-0 opacity-60 group-hover:opacity-100" />
                  </a>
                </h3>

                <div className="mb-3 text-xs text-muted">
                  <div>{article.authors}</div>
                  <div>
                    <span className="font-medium">{article.journal}</span>
                    {' · '}
                    <span>
                      {article.pubDate?.includes('-') || article.pubDate?.includes(' ')
                        ? new Date(article.pubDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                        : article.pubDate}
                    </span>
                  </div>
                </div>

                {article.abstract && (
                  <p className="line-clamp-3 text-sm text-muted/80">{article.abstract}</p>
                )}

                <div className="mt-4 flex items-center gap-2">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-violet hover:text-violet-soft transition"
                  >
                    Read on PubMed
                    <ExternalLinkIcon className="h-3 w-3" />
                  </a>
                  <span className="text-xs text-muted/50">PMID: {article.pmid}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="border-t border-line px-4 py-4 text-center text-xs text-muted-2">
        <p>Articles sourced from PubMed Central. Always verify information with primary sources.</p>
      </div>
    </div>
  );
}
