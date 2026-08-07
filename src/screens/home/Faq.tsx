import { useState } from 'react';
import { Section } from './section';
import { FAQS } from '@/data/marketing';

export function Faq() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <Section id="faq" eyebrow="FAQ" title="Questions, answered.">
      <div className="mt-10 max-w-[760px]">
        {FAQS.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={item.q} className="mb-3 rounded-[14px] border border-line bg-navy-2 px-5">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between py-4 text-left text-[15px] font-semibold"
              >
                {item.q}
                <span className="text-[19px] text-violet-soft">{isOpen ? '–' : '+'}</span>
              </button>
              {isOpen && <p className="mb-[18px] text-[14px] text-muted">{item.a}</p>}
            </div>
          );
        })}
      </div>
    </Section>
  );
}
