import { PEDIATRIC_SECTIONS, PEDIATRIC_TOOLS } from '@/components/pediatrics/registry';
import { ToolGroupCard, ToolRow } from '@/components/ToolList';
import { PageBody, PageHero } from '@/components/PageHero';
import { SPECIALTY } from '@/lib/specialty';

/**
 * Pediatric urology — grading, pathways and ward essentials, as a short list;
 * each tool opens on its own screen (PediatricToolScreen).
 * Sections flow into two columns from 640 px and three from 1024 px.
 */
export function PediatricsScreen({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <>
      <PageHero
        tone="pediatric"
        eyebrow="Pediatrics"
        title="Pediatric urology"
        lede="Hydronephrosis and reflux grading, bladder and bowel dysfunction, the undescended testis, hypospadias, the acute scrotum, and weight-based ward essentials."
      />
      <PageBody>
        <div className="gap-4 sm:columns-2 lg:columns-3">
          {PEDIATRIC_SECTIONS.map(({ section, label }) => {
            const tools = PEDIATRIC_TOOLS.filter((t) => t.section === section);
            return (
              <ToolGroupCard key={section} title={label} count={tools.length} accent={SPECIALTY.pediatric.text}>
                {tools.map((t) => (
                  <ToolRow key={t.id} title={t.title} onOpen={() => onOpen(t.id)} />
                ))}
              </ToolGroupCard>
            );
          })}
        </div>
      </PageBody>
    </>
  );
}
