import { CALC_TITLE } from './calculatorTitles';

/** A shortcut to one calculator, used by the Home pinned and recent lists. */
export function ToolChip({ id, onOpen }: { id: string; onOpen: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(id)}
      className="min-h-[44px] rounded-[11px] border border-line bg-navy-2 px-3.5 py-2 text-left text-[13px] font-semibold text-ink transition-colors hover:border-violet"
    >
      {CALC_TITLE.get(id)}
    </button>
  );
}
