import { CALCULATORS, groupLabel, siblingsOf } from '@/components/calculators/registry';
import { CalcSlot } from '@/components/calculators/CalcSlot';
import { ToolDetail, ToolMissing } from '@/components/ToolList';

/** One calculator on its own screen, with links to the others in its group. */
export function CalculatorScreen({
  id,
  onOpen,
  onAll,
}: {
  id: string;
  onOpen: (id: string) => void;
  onAll: () => void;
}) {
  const entry = CALCULATORS.find((c) => c.id === id);
  if (!entry) return <ToolMissing allLabel="All calculators" onAll={onAll} />;
  const group = groupLabel(entry);

  return (
    <ToolDetail
      eyebrow={group ? `Calculators · ${group}` : 'Calculators'}
      allLabel="All calculators"
      onAll={onAll}
      group={group}
      siblings={siblingsOf(entry)}
      onOpen={onOpen}
    >
      {/* key: switching calculator starts it fresh rather than carrying inputs over. */}
      <CalcSlot key={entry.id} id={entry.id} title={entry.title} Component={entry.Component} />
    </ToolDetail>
  );
}
