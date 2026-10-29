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
  if (!entry) return <ToolMissing eyebrow="Calculators" allLabel="All calculators" onAll={onAll} />;

  return (
    <ToolDetail
      eyebrow="Calculators"
      allLabel="All calculators"
      onAll={onAll}
      group={groupLabel(entry)}
      siblings={siblingsOf(entry)}
      onOpen={onOpen}
    >
      {/* key: switching calculator starts it fresh rather than carrying inputs over. */}
      <CalcSlot key={entry.id} id={entry.id} title={entry.title} Component={entry.Component} />
    </ToolDetail>
  );
}
