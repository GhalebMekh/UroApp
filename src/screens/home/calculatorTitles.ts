import { CALCULATORS } from '@/components/calculators/registry';

/** Calculator titles by id, for the Home shortcut chips. */
export const CALC_TITLE = new Map(CALCULATORS.map((c) => [c.id, c.title]));

/** Whether a stored calculator id still exists (ids can be renamed or removed). */
export function isKnownCalculator(id: string): boolean {
  return CALC_TITLE.has(id);
}
