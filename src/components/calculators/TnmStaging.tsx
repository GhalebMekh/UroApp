import { useState } from 'react';
import { cn } from '@/lib/cn';
import { CitationNote } from '@/components/CitationNote';
import { ResultRow, SelectField } from './primitives';
import { TNM_CANCERS } from '@/data/tnm';

/** TNM quick staging — tap-through AJCC 8th stage groups for four cancers. */
export function TnmStaging() {
  const [cancerId, setCancerId] = useState(TNM_CANCERS[0]!.id);
  const [sel, setSel] = useState<Record<string, string>>({});
  const cancer = TNM_CANCERS.find((c) => c.id === cancerId)!;

  function selectCancer(id: typeof cancerId) {
    setCancerId(id);
    setSel({}); // categories differ per cancer — start fresh
  }

  const result = cancer.stage(sel);

  return (
    <section className="rounded-[20px] border border-line bg-navy-2 p-6">
      <h3 className="font-display text-[21px] font-semibold">TNM quick staging</h3>
      <p className="mb-4 text-[13px] text-muted-2">
        AJCC 8th edition stage groups — tap through the categories
      </p>

      {/* Cancer selector */}
      <div className="mb-5 grid grid-cols-4 gap-1.5 rounded-[12px] border border-line bg-navy p-1">
        {TNM_CANCERS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => selectCancer(c.id)}
            className={cn(
              'min-h-[44px] rounded-[9px] px-2 py-2 text-[12px] font-semibold transition-colors',
              c.id === cancerId ? 'bg-violet/[0.18] text-violet-soft' : 'text-muted hover:text-ink',
            )}
          >
            {c.short}
          </button>
        ))}
      </div>

      {cancer.axes.map((axis) => (
        <SelectField
          key={axis.key}
          label={axis.label}
          value={sel[axis.key] ?? ''}
          onChange={(v) => setSel((prev) => ({ ...prev, [axis.key]: v }))}
        >
          <option value="">Select…</option>
          {axis.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </SelectField>
      ))}

      <ResultRow
        score={result ? result.code : '—'}
        band={result?.band}
        caption={result ? 'AJCC 8th stage group' : 'Select every category to stage'}
      />

      <p className="mt-3 rounded-[10px] border border-line bg-navy px-3 py-2.5 text-[12px] text-muted-2">
        Category definitions summarised in UroApp's own words — not verbatim AJCC
        tables. Stage groups derived per AJCC 8th edition; verify against the AJCC
        Cancer Staging Manual before clinical use.
      </p>
      <CitationNote citation={cancer.citation} />
    </section>
  );
}
