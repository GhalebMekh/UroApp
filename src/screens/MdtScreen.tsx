import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/cn';
import { getJSON, setJSON } from '@/lib/storage';
import { escapeHtml, printDocument, saveDocument } from '@/lib/print';
import { todayISO } from '@/lib/date';
import { PageBody, PageHero } from '@/components/PageHero';
import { CALCULATORS } from '@/components/calculators/registry';
import {
  COMMON_TOOLS,
  SITE_LABEL,
  SITE_TOOLS,
  emptyCase,
  normalizeCase,
  sortCases,
  type MdtCase,
  type TumourSite,
} from '@/lib/mdt';

const STORAGE_KEY = 'uroapp.mdt.v1';
const CALC_TITLE = new Map(CALCULATORS.map((c) => [c.id, c.title]));

const inputCls =
  'w-full rounded-[10px] border border-line bg-navy px-3 py-[11px] text-[13px] text-ink outline-none focus:border-violet';

function Field({
  label,
  value,
  onChange,
  placeholder,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  textarea?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-[7px] block text-[13px] font-semibold text-muted">{label}</span>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={2} className={cn(inputCls, 'resize-y')} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputCls} />
      )}
    </label>
  );
}

/** One case as a printable block. */
function caseHtml(c: MdtCase): string {
  const row = (label: string, val: string) =>
    val.trim() ? `<div class="row"><b>${escapeHtml(label)}</b> ${escapeHtml(val)}</div>` : '';
  const who = [c.initials || '—', [c.age && `${c.age}y`, c.sex].filter(Boolean).join(' '), SITE_LABEL[c.site]]
    .filter(Boolean)
    .join(' · ');
  return (
    `<div class="card"><h3>${escapeHtml(who)}</h3>` +
    row('MDT question', c.question) +
    row('Presentation', c.presentation) +
    row('Comorbidity / performance status', c.comorbidity) +
    row('Imaging', c.imaging) +
    row('Pathology', c.pathology) +
    row('Stage', c.stage) +
    row('Risk scores', c.scores) +
    row('MDT recommendation', c.recommendation) +
    `</div>`
  );
}

function sheetHtml(cases: MdtCase[], title: string): string {
  return (
    `<h1>${escapeHtml(title)}</h1>` +
    `<p class="sub">${cases.length} case${cases.length === 1 ? '' : 's'} · generated ${escapeHtml(new Date().toLocaleString())}</p>` +
    cases.map(caseHtml).join('') +
    `<div class="note">De-identified — initials and age only, no names or medical-record numbers. ` +
    `A working sheet for the meeting, not a medical record. Dispose of securely.</div>`
  );
}

/** MDT / tumour-board case sheets. */
export function MdtScreen({ onOpenCalculator }: { onOpenCalculator: (id: string) => void }) {
  const [cases, setCases] = useState<MdtCase[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [printError, setPrintError] = useState(false);

  useEffect(() => {
    getJSON<unknown>(STORAGE_KEY, []).then((raw) => {
      setCases(Array.isArray(raw) ? raw.map(normalizeCase).filter((c): c is MdtCase => c !== null) : []);
      setLoaded(true);
    });
  }, []);

  function persist(next: MdtCase[]) {
    setCases(next);
    void setJSON(STORAGE_KEY, next);
  }

  const sorted = useMemo(() => sortCases(cases), [cases]);
  const open = cases.find((c) => c.id === openId) ?? null;

  function add() {
    const c = emptyCase(todayISO());
    persist([...cases, c]);
    setOpenId(c.id);
  }

  function update(patch: Partial<MdtCase>) {
    if (!open) return;
    persist(cases.map((c) => (c.id === open.id ? { ...c, ...patch } : c)));
  }

  function remove(id: string) {
    persist(cases.filter((c) => c.id !== id));
    setOpenId(null);
  }

  const print = (list: MdtCase[], title: string) => setPrintError(!printDocument(title, sheetHtml(list, title)));
  const save = (list: MdtCase[], title: string, stem: string) =>
    setPrintError(!saveDocument(title, sheetHtml(list, title), '', stem));

  return (
    <>
      <PageHero
        eyebrow="MDT"
        title="Tumour board case sheets."
        lede="Prepare each case in the same structure, then print the list for the meeting. Stored on this device, de-identified — initials and age only."
      />
      <PageBody>
        {printError && (
          <p className="mb-6 rounded-[10px] border border-crimson/50 bg-crimson/[0.10] px-4 py-3 text-[12px] text-muted">
            Printing was blocked. Use Save instead, or your browser’s own Print command.
          </p>
        )}

        {!open ? (
          <>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={add}
                className="min-h-[44px] rounded-[11px] bg-violet px-5 py-3 text-[14px] font-semibold text-white transition hover:bg-violet-deep"
              >
                + New case
              </button>
              {cases.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={() => print(sorted, 'MDT list')}
                    className="min-h-[44px] rounded-[11px] border border-line bg-navy-2 px-4 py-3 text-[13.5px] font-semibold text-ink hover:border-violet"
                  >
                    Print MDT list
                  </button>
                  <button
                    type="button"
                    onClick={() => save(sorted, 'MDT list', `mdt-list-${todayISO()}`)}
                    className="min-h-[44px] rounded-[11px] border border-line bg-navy-2 px-4 py-3 text-[13.5px] font-semibold text-ink hover:border-teal"
                  >
                    Save MDT list
                  </button>
                </>
              )}
            </div>

            <div className="mt-6 space-y-2.5">
              {!loaded ? (
                <p className="text-[13px] text-muted-2">Loading…</p>
              ) : sorted.length === 0 ? (
                <div className="rounded-[16px] border border-line bg-navy-2 p-6 text-center text-[14px] text-muted">
                  No cases yet. Add one to prepare for the next meeting.
                </div>
              ) : (
                sorted.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setOpenId(c.id)}
                    className="block w-full rounded-[14px] border border-line bg-navy-2 p-4 text-left transition-colors hover:border-violet"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[15px] font-semibold">{c.initials || 'Unnamed'}</span>
                      <span className="rounded-[6px] bg-violet/[0.16] px-2 py-0.5 text-[11px] font-semibold text-violet-soft">
                        {SITE_LABEL[c.site]}
                      </span>
                      <span className="ml-auto text-[12px] text-muted-2">{c.mdtDate}</span>
                    </div>
                    <div className={cn('mt-1 truncate text-[13px]', c.question ? 'text-muted' : 'text-amber')}>
                      {c.question || 'No MDT question yet'}
                    </div>
                  </button>
                ))
              )}
            </div>
          </>
        ) : (
          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <button type="button" onClick={() => setOpenId(null)} className="min-h-[44px] text-[13px] text-violet-soft hover:underline">
                ← Back to list
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => print([open], `MDT case — ${open.initials || 'unnamed'}`)}
                  className="min-h-[44px] rounded-[10px] border border-line bg-navy-2 px-3 text-[13px] font-semibold text-ink hover:border-violet"
                >
                  Print case
                </button>
                <button
                  type="button"
                  onClick={() => remove(open.id)}
                  className="min-h-[44px] rounded-[10px] px-3 text-[13px] text-crimson hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>

            <section className="space-y-3.5 rounded-[20px] border border-line bg-navy-2 p-6">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Field label="Initials" value={open.initials} onChange={(v) => update({ initials: v })} placeholder="e.g. A.M." />
                <Field label="Age" value={open.age} onChange={(v) => update({ age: v })} placeholder="e.g. 68" />
                <label className="block">
                  <span className="mb-[7px] block text-[13px] font-semibold text-muted">Sex</span>
                  <select value={open.sex} onChange={(e) => update({ sex: e.target.value as MdtCase['sex'] })} className={inputCls}>
                    <option value="">—</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-[7px] block text-[13px] font-semibold text-muted">MDT date</span>
                  <input type="date" value={open.mdtDate} onChange={(e) => update({ mdtDate: e.target.value })} className={inputCls} />
                </label>
              </div>

              <label className="block">
                <span className="mb-[7px] block text-[13px] font-semibold text-muted">Tumour site</span>
                <select value={open.site} onChange={(e) => update({ site: e.target.value as TumourSite })} className={inputCls}>
                  {(Object.keys(SITE_LABEL) as TumourSite[]).map((s) => (
                    <option key={s} value={s}>
                      {SITE_LABEL[s]}
                    </option>
                  ))}
                </select>
              </label>

              <Field label="MDT question" value={open.question} onChange={(v) => update({ question: v })} textarea placeholder="What do you want the board to decide?" />
              <Field label="Presentation" value={open.presentation} onChange={(v) => update({ presentation: v })} textarea />
              <Field label="Comorbidity / performance status" value={open.comorbidity} onChange={(v) => update({ comorbidity: v })} placeholder="e.g. Charlson 3; independent" />
              <Field label="Imaging" value={open.imaging} onChange={(v) => update({ imaging: v })} textarea />
              <Field label="Pathology" value={open.pathology} onChange={(v) => update({ pathology: v })} textarea />
              <Field label="Stage" value={open.stage} onChange={(v) => update({ stage: v })} placeholder="e.g. cT2 N0 M0" />
              <Field label="Risk scores" value={open.scores} onChange={(v) => update({ scores: v })} placeholder="e.g. CAPRA 4 (intermediate)" />

              <div>
                <div className="mb-[7px] text-[12px] font-semibold uppercase tracking-[0.08em] text-muted-2">Open a calculator</div>
                <div className="flex flex-wrap gap-2">
                  {[...SITE_TOOLS[open.site], ...COMMON_TOOLS].map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => onOpenCalculator(id)}
                      className="min-h-[44px] rounded-[10px] border border-line bg-navy px-3 text-[12.5px] text-muted hover:border-violet hover:text-ink"
                    >
                      {CALC_TITLE.get(id)}
                    </button>
                  ))}
                </div>
                <p className="mt-1.5 text-[11.5px] text-muted-2">This case is saved — come back with Back.</p>
              </div>

              <Field label="MDT recommendation" value={open.recommendation} onChange={(v) => update({ recommendation: v })} textarea placeholder="Filled in at or after the meeting" />
            </section>
          </div>
        )}
      </PageBody>
    </>
  );
}
