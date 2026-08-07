import { useState } from 'react';
import {
  CONSENT_PROCEDURES,
  CONSENT_BOILERPLATE as B,
  type ConsentProcedure,
} from '@/data/consent';
import { printHtmlDocument, saveHtmlDocument } from '@/lib/print';
import { todayISO } from '@/lib/date';

/** Patient/case fields — held in-session only, never persisted (CLAUDE.md). */
interface CaseFields {
  patient: string;
  mrn: string;
  age: string;
  surgeon: string;
  date: string;
}

const EMPTY_FIELDS: CaseFields = { patient: '', mrn: '', age: '', surgeon: '', date: '' };

/** Escape user-entered text before injecting into the print document. */
function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string,
  );
}

/** Build a clean, self-contained bilingual HTML document for printing. */
function buildPrintHtml(p: ConsentProcedure, f: CaseFields): string {
  const bullets = (items: { en: string; ar: string }[], side: 'en' | 'ar') =>
    items.map((i) => `<li>${esc(i[side])}</li>`).join('');

  const row = (heading: { en: string; ar: string }, en: string, ar: string) => `
    <tr>
      <td class="en">
        <h2>${esc(heading.en)}</h2>
        ${en}
      </td>
      <td class="ar" dir="rtl">
        <h2>${esc(heading.ar)}</h2>
        ${ar}
      </td>
    </tr>`;

  const sigLine = (label: { en: string; ar: string }) => `
    <div class="sig">
      <div class="sig-line"></div>
      <div class="sig-labels"><span>${esc(label.en)}</span><span dir="rtl">${esc(label.ar)}</span></div>
    </div>`;

  const caseRow = `
    <table class="case">
      <tr>
        <td>${esc(B.signatures.patientName.en)} / <span dir="rtl">${esc(B.signatures.patientName.ar)}</span>: <strong>${esc(f.patient) || '—'}</strong></td>
        <td>MRN: <strong>${esc(f.mrn) || '—'}</strong></td>
        <td>${esc(B.signatures.datetime.en)} / <span dir="rtl">${esc(B.signatures.datetime.ar)}</span>: <strong>${esc(f.date) || '—'}</strong></td>
      </tr>
    </table>`;

  return `<!doctype html><html><head><meta charset="utf-8">
  <title>${esc(p.name.en)} — Consent</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; color: #111; margin: 24px; font-size: 12px; line-height: 1.5; }
    h1 { font-size: 18px; text-align: center; margin: 0 0 2px; }
    h1 .ar { display:block; font-size: 16px; }
    h2 { font-size: 13px; margin: 0 0 4px; color: #333; }
    .statement { border: 1px solid #ccc; padding: 10px; margin: 12px 0; }
    .statement td { vertical-align: top; width: 50%; padding: 4px 10px; }
    table { width: 100%; border-collapse: collapse; }
    .grid td { vertical-align: top; width: 50%; padding: 8px 10px; border-top: 1px solid #ddd; }
    .grid td.ar { border-right: none; text-align: right; }
    .grid td.en { border-right: 1px solid #eee; }
    ul { margin: 0; padding-inline-start: 18px; }
    li { margin-bottom: 2px; }
    .case { margin: 10px 0; font-size: 12px; }
    .case td { border: 1px solid #ddd; padding: 6px 8px; }
    .sigs { margin-top: 20px; display: flex; flex-wrap: wrap; gap: 20px; }
    .sig { flex: 1 1 45%; margin-top: 18px; }
    .sig-line { border-bottom: 1px solid #333; height: 28px; }
    .sig-labels { display: flex; justify-content: space-between; font-size: 11px; color: #444; margin-top: 3px; }
    .disclaimer { margin-top: 18px; padding: 8px 10px; border: 1px solid #e0b050; background: #fdf6e3; font-size: 10.5px; }
    .disclaimer td { width: 50%; vertical-align: top; padding: 2px 8px; }
    .proc-name { text-align:center; font-weight:bold; margin: 4px 0 8px; }
    .proc-name .ar { display:block; }
    @media print { body { margin: 12mm; } }
  </style></head><body>
    <h1>${esc(B.title.en)}<span class="ar" dir="rtl">${esc(B.title.ar)}</span></h1>
    <div class="proc-name">${esc(p.name.en)}<span class="ar" dir="rtl">${esc(p.name.ar)}</span></div>
    ${caseRow}
    <table class="statement"><tr>
      <td>${esc(B.statement.en)}</td>
      <td dir="rtl">${esc(B.statement.ar)}</td>
    </tr></table>
    <table class="grid">
      ${row(B.headings.procedure, `<p>${esc(p.description.en)}</p>`, `<p>${esc(p.description.ar)}</p>`)}
      ${row(B.headings.benefits, `<ul>${bullets(p.benefits, 'en')}</ul>`, `<ul>${bullets(p.benefits, 'ar')}</ul>`)}
      ${row(B.headings.alternatives, `<ul>${bullets(p.alternatives, 'en')}</ul>`, `<ul>${bullets(p.alternatives, 'ar')}</ul>`)}
      ${row(B.headings.risks, `<ul>${bullets(p.complications, 'en')}</ul>`, `<ul>${bullets(p.complications, 'ar')}</ul>`)}
      ${row(B.headings.anaesthesia, `<p>${esc(p.anaesthesia.en)}</p>`, `<p>${esc(p.anaesthesia.ar)}</p>`)}
    </table>
    <div class="sigs">
      ${sigLine(B.signatures.patientSign)}
      ${sigLine(B.signatures.guardian)}
      ${sigLine(B.signatures.surgeon)}
      ${sigLine(B.signatures.witness)}
    </div>
    <table class="disclaimer"><tr>
      <td>${esc(B.disclaimer.en)}</td>
      <td dir="rtl">${esc(B.disclaimer.ar)}</td>
    </tr></table>
  </body></html>`;
}

function BilingualList({ items }: { items: { en: string; ar: string }[] }) {
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-1 md:grid-cols-2">
      <ul className="list-disc space-y-1 pl-5 text-[13px] text-muted">
        {items.map((i) => (
          <li key={i.en}>{i.en}</li>
        ))}
      </ul>
      <ul dir="rtl" className="list-disc space-y-1 pr-5 text-right text-[13px] text-muted">
        {items.map((i) => (
          <li key={i.en}>{i.ar}</li>
        ))}
      </ul>
    </div>
  );
}

function Section({
  heading,
  children,
}: {
  heading: { en: string; ar: string };
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-line px-5 py-4">
      <div className="mb-2 flex items-baseline justify-between gap-4">
        <h4 className="text-[13px] font-semibold uppercase tracking-[0.05em] text-violet-soft">
          {heading.en}
        </h4>
        <h4 dir="rtl" className="text-[13px] font-semibold text-violet-soft">
          {heading.ar}
        </h4>
      </div>
      {children}
    </div>
  );
}

export function ConsentScreen() {
  const [selectedId, setSelectedId] = useState<string>(CONSENT_PROCEDURES[0]?.id ?? '');
  const [fields, setFields] = useState<CaseFields>(EMPTY_FIELDS);
  const [printError, setPrintError] = useState(false);

  const proc = CONSENT_PROCEDURES.find((p) => p.id === selectedId) ?? CONSENT_PROCEDURES[0];
  if (!proc) return null;

  function set<K extends keyof CaseFields>(key: K, value: string) {
    setFields((f) => ({ ...f, [key]: value }));
  }

  function print() {
    if (!proc) return;
    if (!printHtmlDocument(buildPrintHtml(proc, fields))) setPrintError(true);
  }

  function save() {
    if (!proc) return;
    const stem = `consent-${proc.id}-${fields.date || todayISO()}`;
    if (!saveHtmlDocument(stem, buildPrintHtml(proc, fields))) setPrintError(true);
  }

  const input =
    'min-h-[44px] w-full rounded-[10px] border border-line bg-navy px-3 py-2 text-[13px] text-ink placeholder:text-muted-2 focus:border-violet focus:outline-none';

  return (
    <div className="mx-auto max-w-wrap px-6 py-8">
      <div className="mx-auto max-w-3xl space-y-5">
        <header>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-soft">
            Operative reference
          </div>
          <h2 className="font-display text-[26px] font-semibold">Consent generator</h2>
          <p className="mt-2 text-[13px] text-muted">
            Bilingual (English / العربية) surgical-consent templates with procedure-specific
            complications. Pick a procedure, optionally fill the case details, and print.
          </p>
        </header>

        {/* Procedure picker */}
        <div>
          <label className="mb-1.5 block text-[12px] font-semibold text-ink">Procedure</label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className={input}
          >
            {CONSENT_PROCEDURES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name.en}
              </option>
            ))}
          </select>
        </div>

        {/* Optional, non-persisted case fields */}
        <div className="rounded-[12px] border border-line bg-navy-2 p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-[12px] font-semibold text-ink">Case details</span>
            <span className="rounded-full border border-line px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.04em] text-muted-2">
              optional · not saved
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input className={input} placeholder="Patient name / اسم المريض" value={fields.patient} onChange={(e) => set('patient', e.target.value)} />
            <input className={input} placeholder="MRN" value={fields.mrn} onChange={(e) => set('mrn', e.target.value)} />
            <input className={input} placeholder="Age / العمر" value={fields.age} onChange={(e) => set('age', e.target.value)} />
            <input className={input} placeholder="Surgeon / الجراح" value={fields.surgeon} onChange={(e) => set('surgeon', e.target.value)} />
            <input className={input} type="date" value={fields.date} onChange={(e) => set('date', e.target.value)} />
          </div>
          <p className="mt-2 text-[11px] text-muted-2">
            These fields stay on this device for this session only and are never stored by the app.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setPrintError(false);
              print();
            }}
            className="flex-1 rounded-[11px] bg-violet py-3 text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            🖨 Print consent (EN + AR)
          </button>
          <button
            type="button"
            onClick={() => {
              setPrintError(false);
              save();
            }}
            className="flex-1 rounded-[11px] border border-line bg-navy-2 py-3 text-[14px] font-semibold text-ink transition-colors hover:border-teal"
          >
            ⬇ Save file
          </button>
        </div>

        {printError && (
          <p className="rounded-[10px] border border-crimson/50 bg-crimson/[0.10] px-4 py-3 text-[12px] text-muted">
            Printing was blocked by the browser. Use your browser’s own Print command
            (Ctrl/Cmd + P) — or allow pop-ups for this site — and choose “Save as PDF”.
          </p>
        )}

        {/* On-screen bilingual preview */}
        <div className="overflow-hidden rounded-[16px] border border-line bg-navy-2">
          <div className="bg-steel/40 px-5 py-4">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="text-[15px] font-semibold">{proc.name.en}</h3>
              <h3 dir="rtl" className="text-[15px] font-semibold">
                {proc.name.ar}
              </h3>
            </div>
          </div>

          <Section heading={B.headings.procedure}>
            <div className="grid grid-cols-1 gap-x-6 gap-y-1 text-[13px] text-muted md:grid-cols-2">
              <p>{proc.description.en}</p>
              <p dir="rtl" className="text-right">
                {proc.description.ar}
              </p>
            </div>
          </Section>

          <Section heading={B.headings.benefits}>
            <BilingualList items={proc.benefits} />
          </Section>

          <Section heading={B.headings.alternatives}>
            <BilingualList items={proc.alternatives} />
          </Section>

          <Section heading={B.headings.risks}>
            <BilingualList items={proc.complications} />
          </Section>

          <Section heading={B.headings.anaesthesia}>
            <div className="grid grid-cols-1 gap-x-6 gap-y-1 text-[13px] text-muted md:grid-cols-2">
              <p>{proc.anaesthesia.en}</p>
              <p dir="rtl" className="text-right">
                {proc.anaesthesia.ar}
              </p>
            </div>
          </Section>

          <div className="border-t border-line px-5 py-3 text-[11px] text-muted-2">
            Source: {proc.source.url ? (
              <a href={proc.source.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-violet hover:text-violet-soft">
                {proc.source.label} ↗
              </a>
            ) : (
              proc.source.label
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="rounded-[12px] border border-amber/50 bg-amber/[0.10] px-5 py-4">
          <div className="mb-1 text-[12px] font-semibold uppercase tracking-[0.06em] text-amber">
            ⚠ Template — verify before use
          </div>
          <p className="text-[12px] leading-relaxed text-muted">
            {B.disclaimer.en}
          </p>
          <p dir="rtl" className="mt-2 text-right text-[12px] leading-relaxed text-muted">
            {B.disclaimer.ar}
          </p>
        </div>
      </div>
    </div>
  );
}
