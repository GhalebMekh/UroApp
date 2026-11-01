import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const pad = (n: number) => String(n).padStart(2, '0');
const daysIn = (y: number, m: number) => new Date(y || 2000, m, 0).getDate(); // m is 1-based

interface Parts {
  d: number;
  m: number;
  y: number;
}

function split(value: string): Parts {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return m ? { y: Number(m[1]), m: Number(m[2]), d: Number(m[3]) } : { d: 0, m: 0, y: 0 };
}

/**
 * A day / month / year picker that always uses the Gregorian calendar.
 * iOS draws `<input type="date">` with the phone's own calendar setting, so a
 * phone set to the Japanese calendar shows "Reiwa 8" — these selects don't.
 * Value and onChange use yyyy-mm-dd, like the native input ('' = not set).
 */
export function DateInput({
  value,
  onChange,
  max,
  min,
  className,
  wrapperClassName,
  label = 'Date',
}: {
  value: string;
  onChange: (value: string) => void;
  max?: string;
  min?: string;
  /** Applied to each of the three selects (pass the screen's usual field class). */
  className?: string;
  wrapperClassName?: string;
  label?: string;
}) {
  const [parts, setParts] = useState<Parts>(() => split(value));
  useEffect(() => setParts(split(value)), [value]);

  const thisYear = new Date().getFullYear();
  const maxYear = max ? split(max).y : thisYear + 10;
  const minYear = min ? split(min).y : thisYear - 30;
  const years: number[] = [];
  for (let y = maxYear; y >= minYear; y--) years.push(y);
  if (parts.y && !years.includes(parts.y)) years.push(parts.y);

  function set(patch: Partial<Parts>) {
    const next = { ...parts, ...patch };
    if (next.d && next.m) next.d = Math.min(next.d, daysIn(next.y, next.m));
    setParts(next);
    if (!next.d || !next.m || !next.y) {
      if (value) onChange('');
      return;
    }
    let iso = `${next.y}-${pad(next.m)}-${pad(next.d)}`;
    if (max && iso > max) iso = max;
    if (min && iso < min) iso = min;
    onChange(iso);
  }

  const cls = cn(className, 'min-w-0 flex-1 px-2');
  const days = Array.from({ length: parts.m ? daysIn(parts.y, parts.m) : 31 }, (_, i) => i + 1);

  return (
    <div role="group" aria-label={label} className={cn('flex gap-1.5', wrapperClassName)}>
      <select aria-label={`${label}: day`} value={parts.d} onChange={(e) => set({ d: Number(e.target.value) })} className={cls}>
        <option value={0}>Day</option>
        {days.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>
      <select aria-label={`${label}: month`} value={parts.m} onChange={(e) => set({ m: Number(e.target.value) })} className={cls}>
        <option value={0}>Month</option>
        {MONTHS.map((name, i) => (
          <option key={name} value={i + 1}>
            {name}
          </option>
        ))}
      </select>
      <select aria-label={`${label}: year`} value={parts.y} onChange={(e) => set({ y: Number(e.target.value) })} className={cls}>
        <option value={0}>Year</option>
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}
