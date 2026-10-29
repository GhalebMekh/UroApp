import { PEDIATRIC_TOOLS, sectionLabel } from '@/components/pediatrics/registry';
import { ToolDetail, ToolMissing } from '@/components/ToolList';

/** One pediatric tool on its own screen, with links to the rest of its section. */
export function PediatricToolScreen({
  id,
  onOpen,
  onAll,
}: {
  id: string;
  onOpen: (id: string) => void;
  onAll: () => void;
}) {
  const tool = PEDIATRIC_TOOLS.find((t) => t.id === id);
  if (!tool) return <ToolMissing eyebrow="Pediatrics" allLabel="All pediatric tools" onAll={onAll} />;
  const group = sectionLabel(tool.section);
  const { Component } = tool;

  return (
    <ToolDetail
      tone="pediatric"
      eyebrow="Pediatrics"
      allLabel="All pediatric tools"
      onAll={onAll}
      group={group}
      siblings={PEDIATRIC_TOOLS.filter((t) => t.section === tool.section && t.id !== tool.id)}
      onOpen={onOpen}
    >
      {/* key: switching tool starts it fresh rather than carrying inputs over. */}
      <Component key={tool.id} />
    </ToolDetail>
  );
}
