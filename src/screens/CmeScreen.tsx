import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/cn';
import { getJSON, setJSON } from '@/lib/storage';
import { escapeHtml, printDocument, saveDocument } from '@/lib/print';
import { todayISO } from '@/lib/date';
import { useAccount } from '@/lib/accountContext';
import { profileByline } from '@/lib/profile';
import {
  CME_TYPE_LABEL,
  inCycle,
  normalizeActivity,
  normalizeTarget,
  summarise,
  type CmeActivity,
  type CmeTarget,
  type CmeType,
} from '@/lib/cme';

const ACT_KEY = 'uroapp.cme.v1';
const TARGET_KEY = 'uroapp.cme.target.v1';

const inputCls =
  'w-full rounded-[10px] border border-line bg-navy px-3 py-[11px] text-[13px] text-ink outline-none focus:border-violet';

function Label({ children }: { children: React.ReactNode }) {
  return <span className="mb-[7px] block text-[13px] font-semibold text-muted">{children}</span>;
}

/** CME / CPD tracker. */
export function CmeScreen() {
  const [activities, setActivities] = useState<CmeActivity[]>([]);
  const [target, setTarget] = useState<CmeTarget>({ hours: 0, cycleStart: '', cycleEnd: '' });
  const [loaded, setLoaded] = useState(false);
  const [printError, setPrintError] = useState(false);
  const byline = profileByline(useAccount().profile);

  // form
  const [date, setDate] = useState(todayISO());
  const [title, setTitle] = useState('');
  const [provider, setProvider] = useState('');
  const [hours, setHours] = useState('');
  const [type, setType] = useState<CmeType>('conference');
  const [accredited, setAccredited] = useState(true);
  const [reference, setReference] = useState('');

  useEffect(() => {
    Promise.all([getJSON<unknown>(ACT_KEY, []), getJSON<unknown>(TARGET_KEY, null)]).then(([a, t]) => {
      setActivities(Array.isArray(a) ? a.map(normalizeActivity).filter((x): x is CmeActivity => x !== null) : []);
      setTarget(normalizeTarget(t));
      setLoaded(true);
    });
  }, []);

  const saveActivities = (next: CmeActivity[]) => {
    const sorted = [...next].sort((x, y) => y.date.localeCompare(x.date));
    setActivities(sorted);
    void setJSON(ACT_KEY, sorted);
  };
  const saveTarget = (patch: Partial<CmeTarget>) => {
    const next = { ...target, ...patch };
    setTarget(next);
    void setJSON(TARGET_KEY, next);
  };

  const h = Number.parseFloat(hours);
  const canAdd = title.trim() !== '' && date !== '' && Number.isFinite(h) && h > 0;

  function add() {
    if (!canAdd) return;
    saveActivities([
      ...activities,
      { id: crypto.randomUUID(), date, title: title.trim(), provider: provider.trim(), hours: h, type, accredited, reference: reference.trim() },
    ]);
    setTitle('');
    setProvider('');
    setHours('');
    setReference('');
  }

  const summary = useMemo(() => summarise(activities, target), [activities, target]);
  const cycleSet = Boolean(target.cycleStart || target.cycleEnd);

  function body(): string {
    const rows = activities
      .filter((a) => inCycle(a, target))
      .map(
        (a) =>
          `<tr><td>${escapeHtml(a.date)}</td><td>${escapeHtml(a.title)}</td><td>${escapeHtml(a.provider)}</td>` +
          `<td>${escapeHtml(CME_TYPE_LABEL[a.type])}</td><td>${a.hours}</td><td>${a.accredited ? 'Yes' : 'No'}</td>` +
          `<td>${escapeHtml(a.reference)}</td></tr>`,
      )
      .join('');
    const cycle = cycleSet ? `${target.cycleStart || '…'} to ${target.cycleEnd || '…'}` : 'all dates';
    return (
      `<h1>CME / CPD record</h1>` +
      (byline ? `<p class="sub">${escapeHtml(byline)}</p>` : '') +
      `<p class="sub">Cycle: ${escapeHtml(cycle)} · generated ${escapeHtml(new Date().toLocaleDateString())}</p>` +
      `<div class="stats"><span>Total hours <b>${summary.total}</b></span><span>Accredited <b>${summary.accredited}</b></span>` +
      (target.hours > 0 ? `<span>Target <b>${target.hours}</b></span><span>Remaining <b>${summary.remaining}</b></span>` : '') +
      `</div>` +
      `<table><thead><tr><th>Date</th><th>Activity</th><th>Provider</th><th>Type</th><th>Hours</th><th>Accredited</th><th>Reference</th></tr></thead>` +
      `<tbody>${rows || '<tr><td colspan="7">No activities in this cycle.</td></tr>'}</tbody></table>` +
      `<div class="note">Self-reported record. Keep the original certificates; ` +
      `check credit rules with your licensing body.</div>`
    );
  }

  return (
    <div className="mx-auto max-w-wrap px-6 py-12">
      <div className="mb-3 text-[12.5px] font-semibold uppercase tracking-[0.14em] text-violet-soft">CME / CPD</div>
      <h2 className="mb-4 font-display text-[clamp(28px,4vw,40px)] font-semibold leading-[1.1] tracking-[-0.02em]">
        Your CPD hours.
      </h2>
      <p className="max-w-xl text-[16.5px] text-muted">
        Log each activity as you go, and the record is ready when your licence renewal comes round.
        Set the hours and cycle your licensing body requires — the app doesn't assume them.
      </p>

      {/* Progress */}
      <section className="mt-8 rounded-[20px] border border-line bg-navy-2 p-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label className="block">
            <Label>Hours required</Label>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              value={target.hours || ''}
              onChange={(e) => saveTarget({ hours: Math.max(0, Number.parseFloat(e.target.value) || 0) })}
              placeholder="e.g. per your licensing body"
              className={inputCls}
            />
          </label>
          <label className="block">
            <Label>Cycle start</Label>
            <input type="date" value={target.cycleStart} onChange={(e) => saveTarget({ cycleStart: e.target.value })} className={inputCls} />
          </label>
          <label className="block">
            <Label>Cycle end</Label>
            <input type="date" value={target.cycleEnd} onChange={(e) => saveTarget({ cycleEnd: e.target.value })} className={inputCls} />
          </label>
        </div>

        <div className="mt-5 flex flex-wrap items-baseline gap-x-6 gap-y-1">
          <div className="font-display text-[34px] font-semibold text-ink">
            {summary.total}
            <span className="ml-1.5 font-sans text-[14px] text-muted-2">{target.hours > 0 ? `of ${target.hours} h` : 'hours'}</span>
          </div>
          <div className="text-[13px] text-muted">{summary.accredited} h accredited</div>
          {summary.remaining !== null && (
            <div className={cn('text-[13px] font-semibold', summary.remaining === 0 ? 'text-teal' : 'text-amber')}>
              {summary.remaining === 0 ? 'Target met' : `${summary.remaining} h to go`}
            </div>
          )}
        </div>
        {summary.percent !== null && (
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-steel" role="progressbar" aria-valuenow={summary.percent} aria-valuemin={0} aria-valuemax={100}>
            <div className={cn('h-full rounded-full', summary.percent >= 100 ? 'bg-teal' : 'bg-violet')} style={{ width: `${summary.percent}%` }} />
          </div>
        )}
        {Object.keys(summary.byType).length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {(Object.entries(summary.byType) as [CmeType, number][]).map(([t, v]) => (
              <span key={t} className="rounded-[8px] border border-line bg-navy px-2.5 py-1 text-[12px] text-muted">
                {CME_TYPE_LABEL[t]} <span className="font-mono text-ink">{v} h</span>
              </span>
            ))}
          </div>
        )}
        {!cycleSet && <p className="mt-3 text-[12px] text-muted-2">No cycle dates set — every activity counts.</p>}
      </section>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[360px_1fr]">
        <section className="space-y-3.5 rounded-[20px] border border-line bg-navy-2 p-6">
          <h3 className="font-display text-[19px] font-semibold">Log an activity</h3>
          <label className="block">
            <Label>Date</Label>
            <input type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} className={inputCls} />
          </label>
          <label className="block">
            <Label>Activity</Label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. SUA annual meeting" className={inputCls} />
          </label>
          <label className="block">
            <Label>Provider</Label>
            <input value={provider} onChange={(e) => setProvider(e.target.value)} placeholder="e.g. Saudi Urological Association" className={inputCls} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <Label>Credit hours</Label>
              <input type="number" inputMode="decimal" min="0" step="0.5" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="e.g. 6" className={inputCls} />
            </label>
            <label className="block">
              <Label>Type</Label>
              <select value={type} onChange={(e) => setType(e.target.value as CmeType)} className={inputCls}>
                {(Object.keys(CME_TYPE_LABEL) as CmeType[]).map((t) => (
                  <option key={t} value={t}>
                    {CME_TYPE_LABEL[t]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button
            type="button"
            aria-pressed={accredited}
            onClick={() => setAccredited((v) => !v)}
            className={cn(
              'min-h-[44px] w-full rounded-[10px] border px-3 text-[13px] font-semibold transition-colors',
              accredited ? 'border-teal bg-teal/[0.14] text-teal' : 'border-line bg-navy text-muted',
            )}
          >
            {accredited ? 'Accredited activity' : 'Not accredited'}
          </button>
          <label className="block">
            <Label>Accreditation no. / certificate ref (optional)</Label>
            <input value={reference} onChange={(e) => setReference(e.target.value)} className={inputCls} />
          </label>
          <button
            type="button"
            onClick={add}
            disabled={!canAdd}
            className="w-full rounded-[11px] bg-violet py-3 text-[14.5px] font-semibold text-white transition hover:bg-violet-deep disabled:opacity-40"
          >
            Add activity
          </button>
        </section>

        <section>
          {activities.length > 0 && (
            <div className="mb-4 flex gap-2">
              <button
                type="button"
                onClick={() => setPrintError(!printDocument('CME / CPD record', body()))}
                className="min-h-[44px] flex-1 rounded-[11px] border border-line bg-navy-2 py-2.5 text-[13.5px] font-semibold text-ink hover:border-violet"
              >
                Print record
              </button>
              <button
                type="button"
                onClick={() => setPrintError(!saveDocument('CME / CPD record', body(), '', `cpd-record-${todayISO()}`))}
                className="min-h-[44px] flex-1 rounded-[11px] border border-line bg-navy-2 py-2.5 text-[13.5px] font-semibold text-ink hover:border-teal"
              >
                Save record
              </button>
            </div>
          )}
          {printError && (
            <p className="mb-4 rounded-[10px] border border-crimson/50 bg-crimson/[0.10] px-4 py-3 text-[12px] text-muted">
              Printing was blocked. Use Save record instead.
            </p>
          )}
          <div className="space-y-2.5">
            {!loaded ? (
              <p className="text-[13px] text-muted-2">Loading…</p>
            ) : activities.length === 0 ? (
              <div className="rounded-[16px] border border-line bg-navy-2 p-6 text-center text-[14px] text-muted">
                No activities yet.
              </div>
            ) : (
              activities.map((a) => {
                const counted = inCycle(a, target);
                return (
                  <article key={a.id} className={cn('flex items-center gap-3 rounded-[14px] border border-line bg-navy-2 p-4', !counted && 'opacity-50')}>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[14.5px] font-semibold">{a.title}</div>
                      <div className="mt-0.5 text-[12px] text-muted-2">
                        {a.date} · {CME_TYPE_LABEL[a.type]}
                        {a.provider && ` · ${a.provider}`}
                        {!counted && ' · outside this cycle'}
                      </div>
                    </div>
                    <span className={cn('shrink-0 font-mono text-[14px]', a.accredited ? 'text-teal' : 'text-muted')}>{a.hours} h</span>
                    <button
                      type="button"
                      onClick={() => saveActivities(activities.filter((x) => x.id !== a.id))}
                      aria-label={`Delete ${a.title}`}
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-[8px] border border-line text-muted-2 hover:border-crimson hover:text-crimson"
                    >
                      ✕
                    </button>
                  </article>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
