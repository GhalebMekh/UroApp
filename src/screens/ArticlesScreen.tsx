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

const API_BASE = import.meta.env.VITE_ARTICLES_API || 'http://localhost:3001';

export function ArticlesScreen() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [subspecialty, setSubspecialty] = useState<string>('oncology');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weeklyTopic, setWeeklyTopic] = useState<string>('');

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const url = `${API_BASE}/api/articles${subspecialty ? `?subspecialty=${subspecialty}` : ''}`;
        const res = await fetch(url);
        const data: ApiResponse = await res.json();

        if (data.success) {
          setArticles(data.articles);
          setWeeklyTopic(data.articles[0]?.topic || '');
          setError(null);
        } else {
          setError('Failed to fetch articles');
        }
      } catch (e) {
        setError(`Could not connect to articles server: ${e instanceof Error ? e.message : 'Unknown error'}`);
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
            <div className="mb-2">📚 Loading articles...</div>
            <p className="text-sm">Fetching from PubMed Central</p>
          </div>
        )}

        {error && (
          <div className="rounded-card border border-crimson/30 bg-crimson/10 p-4 text-sm text-crimson">
            ⚠️ {error}
            <p className="mt-2 text-xs text-crimson/70">Make sure the articles server is running at {API_BASE}</p>
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
