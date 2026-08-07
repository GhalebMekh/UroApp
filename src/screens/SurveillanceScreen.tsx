import { useMemo, useState } from 'react';
import { SURVEILLANCE, type SurveillanceProtocol } from '@/data/surveillance';
import { escapeHtml, printDocument, saveDocument } from '@/lib/print';
import { addMonths, todayISO } from '@/lib/date';

function monthLabel(month: number): string {
  if (month === 0) return 'Baseline';
  if (month % 12 === 0) return `${month} months (year ${month / 12})`;
  return `${month} months`;
}

export function SurveillanceScreen() {
  const [diagnosisId, setDiagnosisId] = useState(SURVEILLANCE[0]?.id ?? '');
  const diagnosis = SURVEILLANCE.find((d) => d.id === diagnosisId) ?? SURVEILLANCE[0];

  const [protocolId, setProtocolId] = useState(diagnosis?.protocols[0]?.id ?? '');
  const [indexDate, setIndexDate] = useState(todayISO());
  const [exportError, setExportError] = useState(false);

  const protocol: SurveillanceProtocol | undefined =
    diagnosis?.protocols.find((p) => p.id === protocolId) ?? diagnosis?.protocols[0];

  function selectDiagnosis(id: string) {
    setDiagnosisId(id);
    const next = SURVEILLANCE.find((d) => d.id === id);
    setProtocolId(next?.protocols[0]?.id ?? '');
  }

  const rows = useMemo(
    () =>
      (protocol?.visits ?? []).map((v) => ({
        month: v.month,
        label: monthLabel(v.month),
        due: addMonths(indexDate, v.month),
        tests: v.tests,
      })),
    [protocol, indexDate],
  );

  function buildBody() {
    if (!diagnosis || !protocol) return '';
    const body = rows
      .map(
        (r) =>
          `<tr><td>${escapeHtml(r.label)}</td><td>${escapeHtml(r.due)}</td>` +
          `<td>${r.tests.map((t) => escapeHtml(t)).join('<br>')}</td></tr>`,
      )
      .join('');

    return `
      <h1>Surveillance schedule — ${escapeHtml(diagnosis.name)}</h1>
      <p class="sub">${escapeHtml(protocol.label)} · ${escapeHtml(diagnosis.indexLabel)}: ${escapeHtml(indexDate)} · generated ${new Date().toLocaleDateString()}</p>
      <p>${escapeHtml(protocol.description)}</p>
      <table>
        <thead><tr><th>Visit</th><th>Due</th><th>Investigations</th></tr></thead>
        <tbody>${body}</tbody>
      </table>
      <h2>After the schedule</h2>
      <p>${escapeHtml(protocol.thereafter)}</p>
      <h2>Notes</h2>
      <ul>${protocol.notes.map((n) => `<li>${escapeHtml(n)}</li>`).join('')}</ul>
      <div class="note">Summarised from ${escapeHtml(protocol.source.label)} in UroApp's own words —
      not a verbatim reproduction. Decision support only: the treating clinician sets the actual
      follow-up, adjusting for the individual patient. Verify against the primary source.</div>`;
  }

  function print() {
    setExportError(false);
    if (!printDocument('Surveillance schedule', buildBody())) setExportError(true);
  }

  function save() {
    setExportError(false);
    const stem = `surveillance-${protocol?.id ?? 'schedule'}-${indexDate}`;
    if (!saveDocument('Surveillance schedule', buildBody(), '', stem)) setExportError(true);
  }

  const field =
    'min-h-[44px] w-full rounded-[10px] border border-line bg-navy px-3 py-[11px] text-[13.5px] text-ink outline-none focus:border-violet';

  if (!diagnosis || !protocol) return null;

  return (
    <div className="mx-auto max-w-wrap px-6 py-12">
      <div className="mx-auto max-w-3xl space-y-6">
        <header>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-soft">
            Follow-up planning
          </div>
          <h2 className="font-display text-[28px] font-semibold">Surveillance schedule</h2>
          <p className="mt-3 text-[14px] text-muted">
            Pick a diagnosis and risk group to generate a dated follow-up calendar from the
            AUA/EAU guideline intervals. Where a guideline gives a range, the schedule uses the
            shorter interval so it is never laxer than the guideline. Each protocol shows its
            own source below.
          </p>
        </header>

        {/* Inputs */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label className="block">
            <span className="mb-[7px] block text-[13px] font-semibold text-muted">Diagnosis</span>
            <select value={diagnosisId} onChange={(e) => selectDiagnosis(e.target.value)} className={field}>
              {SURVEILLANCE.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-[7px] block text-[13px] font-semibold text-muted">Risk group</span>
            <select value={protocol.id} onChange={(e) => setProtocolId(e.target.value)} className={field}>
              {diagnosis.protocols.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-[7px] block text-[13px] font-semibold text-muted">
              {diagnosis.indexLabel}
            </span>
            <input type="date" value={indexDate} onChange={(e) => setIndexDate(e.target.value)} className={field} />
          </label>
        </div>

        <p className="text-[13px] text-muted-2">{protocol.description}</p>

        {/* Export */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={print}
            className="flex-1 rounded-[11px] bg-violet py-3 text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            🖨 Print schedule
          </button>
          <button
            type="button"
            onClick={save}
            className="flex-1 rounded-[11px] border border-line bg-navy-2 py-3 text-[14px] font-semibold text-ink transition-colors hover:border-teal"
          >
            ⬇ Save file
          </button>
        </div>

        {exportError && (
          <p className="rounded-[10px] border border-crimson/50 bg-crimson/[0.10] px-4 py-3 text-[12px] text-muted">
            Export was blocked by the browser. Use your browser’s own Print command (Ctrl/Cmd + P)
            and choose “Save as PDF”.
          </p>
        )}

        {/* Schedule */}
        {/* Mobile-first: rows stack on a phone (fixed columns would squeeze the
            investigations text into ~75px); the table layout returns at sm+. */}
        <div className="overflow-hidden rounded-[16px] border border-line bg-navy-2">
          <div className="hidden border-b border-line bg-steel/40 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-2 sm:grid sm:grid-cols-[110px_120px_1fr] sm:gap-3">
            <span>Visit</span>
            <span>Due</span>
            <span>Investigations</span>
          </div>
          {rows.map((r) => (
            <div
              key={r.month}
              className="border-b border-line px-5 py-3 last:border-b-0 sm:grid sm:grid-cols-[110px_120px_1fr] sm:gap-3"
            >
              <div className="mb-1.5 flex items-baseline justify-between gap-3 sm:mb-0 sm:block">
                <span className="text-[13px] font-semibold text-violet-soft">{r.label}</span>
                <span className="font-mono text-[12.5px] text-ink sm:hidden">{r.due || '—'}</span>
              </div>
              <span className="hidden font-mono text-[12.5px] text-ink sm:block">{r.due || '—'}</span>
              <span className="text-[13px] text-muted">
                {r.tests.map((t) => (
                  <span key={t} className="block">
                    • {t}
                  </span>
                ))}
              </span>
            </div>
          ))}
        </div>

        {/* Thereafter + notes */}
        <div className="rounded-[14px] border border-line bg-navy-2 p-5">
          <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-[0.05em] text-violet-soft">
            After the schedule
          </h3>
          <p className="text-[13px] text-muted">{protocol.thereafter}</p>

          <h3 className="mb-2 mt-4 text-[13px] font-semibold uppercase tracking-[0.05em] text-violet-soft">
            Notes
          </h3>
          <ul className="list-disc space-y-1.5 pl-5 text-[13px] text-muted">
            {protocol.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>

          <p className="mt-4 text-[11.5px] text-muted-2">
            Source:{' '}
            <a
              href={protocol.source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-violet hover:text-violet-soft"
            >
              {protocol.source.label} ↗
            </a>
          </p>
        </div>

        {/* Disclaimer */}
        <div className="rounded-[12px] border border-amber/50 bg-amber/[0.10] px-5 py-4">
          <div className="mb-1 text-[12px] font-semibold uppercase tracking-[0.06em] text-amber">
            ⚠ Decision support only
          </div>
          <p className="text-[12px] leading-relaxed text-muted">
            Generated dates are a planning aid, not a prescription. The treating clinician sets the
            actual follow-up, adjusting for pathology, renal function, comorbidity and patient
            preference. Verify intervals against the primary guideline before use.
          </p>
        </div>
      </div>
    </div>
  );
}
