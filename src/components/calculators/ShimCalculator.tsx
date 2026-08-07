import { useState } from 'react';
import { CalcCard, ResultRow, SelectField, type RiskBand } from './primitives';
import { CITATIONS } from '@/data/citations';

interface Question {
  label: string;
  options: string[];
}

const QUESTIONS: Question[] = [
  {
    label: '1 · Confidence you could get and keep an erection',
    options: ['1 — Very low', '2 — Low', '3 — Moderate', '4 — High', '5 — Very high'],
  },
  {
    label: '2 · Erections hard enough for penetration',
    options: ['0 — No sexual activity', '1 — Almost never', '2 — A few times', '3 — Sometimes (about half)', '4 — Most times', '5 — Almost always'],
  },
  {
    label: '3 · Able to maintain erection after penetration',
    options: ['0 — Did not attempt', '1 — Almost never', '2 — A few times', '3 — Sometimes (about half)', '4 — Most times', '5 — Almost always'],
  },
  {
    label: '4 · Difficulty maintaining erection to completion',
    options: ['0 — Did not attempt', '1 — Extremely difficult', '2 — Very difficult', '3 — Difficult', '4 — Slightly difficult', '5 — Not difficult'],
  },
  {
    label: '5 · Intercourse was satisfactory',
    options: ['0 — Did not attempt', '1 — Almost never', '2 — A few times', '3 — Sometimes (about half)', '4 — Most times', '5 — Almost always'],
  },
];

// Question 1 is scored 1–5; questions 2–5 are scored 0–5.
const FIRST_VALUE = [1, 0, 0, 0, 0];

function band(total: number): { band: RiskBand; label: string } {
  if (total >= 22) return { band: 'low', label: 'No erectile dysfunction (22–25)' };
  if (total >= 17) return { band: 'moderate', label: 'Mild ED (17–21)' };
  if (total >= 12) return { band: 'moderate', label: 'Mild–moderate ED (12–16)' };
  if (total >= 8) return { band: 'high', label: 'Moderate ED (8–11)' };
  return { band: 'high', label: 'Severe ED (1–7)' };
}

/** IIEF-5 / SHIM (Rosen et al. 1999). */
export function ShimCalculator() {
  const [answers, setAnswers] = useState<Record<number, string>>({});

  function set(i: number, value: string) {
    setAnswers((prev) => ({ ...prev, [i]: value }));
  }

  const complete = QUESTIONS.every((_, i) => answers[i] != null && answers[i] !== '');
  const total = QUESTIONS.reduce((sum, _, i) => sum + Number(answers[i] ?? 0), 0);
  const result = complete ? band(total) : null;

  return (
    <CalcCard
      title="IIEF-5 (SHIM)"
      subtitle="Sexual Health Inventory for Men — erectile function over the past 6 months"
      citation={CITATIONS.shim}
    >
      {QUESTIONS.map((q, i) => (
        <SelectField key={i} label={q.label} value={answers[i] ?? ''} onChange={(v) => set(i, v)}>
          <option value="">Select…</option>
          {q.options.map((opt, idx) => (
            <option key={idx} value={FIRST_VALUE[i]! + idx}>
              {opt}
            </option>
          ))}
        </SelectField>
      ))}

      <ResultRow
        score={result ? total : '—'}
        band={result?.band}
        caption={result ? result.label : 'Answer all five questions'}
      />
    </CalcCard>
  );
}
