import { useState, type ComponentType } from 'react';
import { cn } from '@/lib/cn';
import { InpatientIcon, OnCallIcon, ScalpelIcon } from '@/components/icons';
import { RoundingScreen } from './RoundingScreen';
import { OnCallScreen } from './OnCallScreen';
import { OperativeLogScreen } from './OperativeLogScreen';
import { ProceduresScreen } from './ProceduresScreen';
import { ConsentScreen } from './ConsentScreen';

type ResidencySection = 'inpatient' | 'oncall' | 'or';
type OrTab = 'logbook' | 'procedures' | 'consent';

export function ResidencyScreen() {
  const [section, setSection] = useState<ResidencySection>('inpatient');
  const [orTab, setOrTab] = useState<OrTab>('logbook');

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

  return (
    <div className="min-h-[100dvh] flex flex-col">
      {/* Section tabs */}
      <div className="sticky top-16 z-40 border-b border-line bg-navy/[0.95] backdrop-blur-[8px]">
        <div className="mx-auto max-w-wrap px-6 py-3">
          <div className="flex gap-2">
            {sections.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSection(s.id)}
                className={cn(
                  'flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-[10px] py-2.5 px-3 text-center text-sm font-semibold transition-colors',
                  section === s.id
                    ? 'bg-violet text-white'
                    : 'border border-line bg-navy text-muted hover:border-violet hover:text-violet-soft',
                )}
              >
                <s.Icon className="text-[17px]" />
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        {section === 'inpatient' && <RoundingScreen />}
        {section === 'oncall' && <OnCallScreen />}
        {section === 'or' && (
          <div>
            {/* OR sub-tabs */}
            <div className="mx-auto max-w-wrap px-6 pt-4">
              <div className="flex gap-1.5 rounded-[11px] border border-line bg-navy p-1">
                {orTabs.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setOrTab(t.id)}
                    className={cn(
                      'min-h-[44px] flex-1 rounded-[8px] px-3 py-2 text-[13px] font-semibold transition-colors',
                      orTab === t.id
                        ? 'bg-violet/[0.18] text-violet-soft'
                        : 'text-muted hover:text-ink',
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {orTab === 'logbook' && <OperativeLogScreen />}
            {orTab === 'procedures' && <ProceduresScreen />}
            {orTab === 'consent' && <ConsentScreen />}
          </div>
        )}
      </div>
    </div>
  );
}
