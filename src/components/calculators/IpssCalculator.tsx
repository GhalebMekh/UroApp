import { useState } from 'react';
import { CalcCard, ResultRow, SelectField, type RiskBand } from './primitives';
import { IPSS_QUESTIONS, IPSS_QOL } from '@/data/ipss';
import { CITATIONS } from '@/data/citations';

type Answers = Record<number, string>;

function band(total: number): { band: RiskBand; label: string } {
  if (total <= 7) return { band: 'low', label: 'Mild (0–7)' };
  if (total <= 19) return { band: 'moderate', label: 'Moderate (8–19)' };
  return { band: 'high', label: 'Severe (20–35)' };
}

/** IPSS + QoL (Barry et al. 1992). 7 symptom items + 1 QoL item. */
export function IpssCalculator() {
  const [answers, setAnswers] = useState<Answers>({});
  const [qol, setQol] = useState('');

  function set(i: number, value: string) {
    setAnswers((prev) => ({ ...prev, [i]: value }));
  }

  const complete = IPSS_QUESTIONS.every((_, i) => answers[i] != null && answers[i] !== '');
  const total = IPSS_QUESTIONS.reduce((sum, _, i) => sum + Number(answers[i] ?? 0), 0);
  const result = complete ? band(total) : null;

  return (
    <CalcCard
      title="IPSS + Quality of Life"
      subtitle="International Prostate Symptom Score — LUTS over the past month"
      citation={CITATIONS.ipss}
    >
      {IPSS_QUESTIONS.map((q, i) => (
        <SelectField
          key={i}
          label={q.label}
          value={answers[i] ?? ''}
          onChange={(v) => set(i, v)}
        >
          <option value="">Select…</option>
          {q.options.map((opt, v) => (
            <option key={v} value={v}>
              {opt}
            </option>
          ))}
        </SelectField>
      ))}

      <SelectField label={IPSS_QOL.label} value={qol} onChange={setQol}>
        <option value="">Select…</option>
        {IPSS_QOL.options.map((opt, v) => (
          <option key={v} value={v}>
            {opt}
          </option>
        ))}
      </SelectField>

      <ResultRow
        score={result ? total : '—'}
        band={result?.band}
        caption={
          result
            ? `${result.label}${qol !== '' ? ` · QoL ${qol}/6` : ''}`
            : 'Answer all seven symptom questions'
        }
      />
    </CalcCard>
  );
}
