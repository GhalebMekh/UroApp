import { useEffect, useState, type ComponentType, type ReactNode } from 'react';
import type { OrTab, ResidencySection, ResidencyTarget } from '@/navigation';
import { ProGate } from '@/components/ProGate';
import { LockGate } from '@/components/LockGate';
import { HeroTabs, PageHero, PageSheet, type HeroTone } from '@/components/PageHero';
import { InpatientIcon, OnCallIcon, ScalpelIcon } from '@/components/icons';
import { RoundingScreen } from './RoundingScreen';
import { OnCallScreen } from './OnCallScreen';
import { OperativeLogScreen } from './OperativeLogScreen';
import { ProceduresScreen } from './ProceduresScreen';
import { ConsentScreen } from './ConsentScreen';

/** The header copy for each Residency page — its sub-heading lives here, not in the page. */
const COPY: Record<'inpatient' | 'oncall' | OrTab, { eyebrow: string; title: string; lede: ReactNode; tone?: HeroTone }> = {
  inpatient: {
    eyebrow: 'Rounding',
    title: 'Ward round list.',
    lede: (
      <>
        A working list for your patients, stored only on this device.{' '}
        <b className="font-semibold text-white">
          De-identified — a first name or initials and a bed/ward, never a full name or MRN.
        </b>{' '}
        A personal aide-mémoire, not a medical record.
      </>
    ),
  },
  oncall: {
    eyebrow: 'On-call',
    title: 'The next 30 minutes.',
    lede: 'Immediate management of the commonest urological emergencies. Decision-support only — escalate to your senior and follow local protocol.',
    tone: 'emergency',
  },
  logbook: {
    eyebrow: 'Operative log',
    title: 'Surgical logbook.',
    lede: 'Your case log, stored on this device. De-identified by design — no names or medical-record numbers, only date, patient gender, procedure, your role and any complication.',
  },
  procedures: {
    eyebrow: 'Procedures',
    title: 'Anatomy, steps & complications.',
    lede: 'Operative reference for the OR and viva — the relevant anatomy, the steps of the procedure, and the complications to watch for. Summarised from the cited source.',
  },
  consent: {
    eyebrow: 'Operative reference',
    title: 'Consent generator',
    lede: 'Bilingual (English / العربية) surgical-consent templates with procedure-specific complications. Pick a procedure, optionally fill the case details, and print.',
  },
};

export function ResidencyScreen({
  initial,
  onInitialHandled,
}: {
  /** Tab to open on arrival, e.g. from a Home card; read once on mount. */
  initial?: ResidencyTarget | null;
  onInitialHandled?: () => void;
}) {
  const [section, setSection] = useState<ResidencySection>(initial?.section ?? 'inpatient');
  const [orTab, setOrTab] = useState<OrTab>(initial?.orTab ?? 'logbook');

  // Consume the link so a later tap on the Residency tab opens the default view.
  useEffect(() => {
    if (initial) onInitialHandled?.();
  }, [initial, onInitialHandled]);

  const sections: { id: ResidencySection; label: string; Icon: ComponentType<{ className?: string }> }[] = [
    { id: 'inpatient', label: 'Inpatient', Icon: InpatientIcon },
    { id: 'oncall', label: 'On-Call', Icon: OnCallIcon },
    { id: 'or', label: 'OR', Icon: ScalpelIcon },
  ];

  const orTabs: { id: OrTab; label: string }[] = [
    { id: 'logbook', label: 'Logbook' },
    { id: 'procedures', label: 'Procedures' },
    { id: 'consent', label: 'Consent' },
  ];

  const copy = COPY[section === 'or' ? orTab : section];

  return (
    <>
      <PageHero tone={copy.tone} eyebrow={`Residency · ${copy.eyebrow}`} title={copy.title} lede={copy.lede}>
        <div className="space-y-2.5 sm:max-w-xl">
          <HeroTabs
            value={section}
            onChange={setSection}
            items={sections.map((s) => ({
              id: s.id,
              label: (
                <>
                  <s.Icon className="text-[17px]" />
                  {s.label}
                </>
              ),
            }))}
          />
          {section === 'or' && <HeroTabs value={orTab} onChange={setOrTab} items={orTabs} />}
        </div>
      </PageHero>

      <PageSheet>
        {section === 'inpatient' && (
          <ProGate feature="inpatient">
            <LockGate>
              <RoundingScreen />
            </LockGate>
          </ProGate>
        )}
        {section === 'oncall' && <OnCallScreen initialId={initial?.emergency} />}
        {section === 'or' && orTab === 'logbook' && (
          <ProGate feature="logbook">
            <LockGate>
              <OperativeLogScreen />
            </LockGate>
          </ProGate>
        )}
        {section === 'or' && orTab === 'procedures' && <ProceduresScreen initialId={initial?.procedure} />}
        {section === 'or' && orTab === 'consent' && (
          <ProGate feature="consent">
            <ConsentScreen />
          </ProGate>
        )}
      </PageSheet>
    </>
  );
}
