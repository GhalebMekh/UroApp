import { PEDIATRIC_SECTIONS, PEDIATRIC_TOOLS } from '@/components/pediatrics/registry';
import { ToolGroupCard, ToolRow } from '@/components/ToolList';

/**
 * Pediatric urology — grading, pathways and ward essentials, as a short list;
 * each tool opens on its own screen (PediatricToolScreen).
 * Sections flow into two columns from 640 px and three from 1024 px.
 */
export function PediatricsScreen({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <div className="mx-auto max-w-wrap px-4 py-6 sm:px-6 md:py-8">
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-soft">Pediatrics</div>
      <h2 className="font-display text-[28px] font-semibold leading-tight md:text-[32px]">Pediatric urology</h2>
      <p className="mt-2 max-w-xl text-[14px] text-muted">
        Hydronephrosis and reflux grading, bladder and bowel dysfunction, the undescended testis,
        hypospadias, the acute scrotum, and weight-based ward essentials.
      </p>

      <div className="mt-6 gap-4 sm:columns-2 lg:columns-3">
        {PEDIATRIC_SECTIONS.map(({ section, label }) => {
          const tools = PEDIATRIC_TOOLS.filter((t) => t.section === section);
          return (
            <ToolGroupCard key={section} title={label} count={tools.length}>
              {tools.map((t) => (
                <ToolRow key={t.id} title={t.title} onOpen={() => onOpen(t.id)} />
              ))}
            </ToolGroupCard>
          );
        })}
      </div>
    </div>
  );
}
