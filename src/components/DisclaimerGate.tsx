import { useEffect, useState, type ReactNode } from 'react';
import { BrandMark } from './BrandMark';
import { getJSON, setJSON } from '@/lib/storage';

const KEY = 'uroapp.disclaimer.v1';

/**
 * First-launch medical disclaimer (CLAUDE.md: required at first launch).
 * Blocks the app until acknowledged; the acceptance is stored on-device so it
 * shows once. Returning users never see the flash (null = still loading).
 */
export function DisclaimerGate({ children }: { children: ReactNode }) {
  const [accepted, setAccepted] = useState<boolean | null>(null);

  useEffect(() => {
    getJSON<boolean>(KEY, false).then(setAccepted);
  }, []);

  function accept() {
    setAccepted(true);
    void setJSON(KEY, true);
  }

  return (
    <>
      {children}
      {accepted === false && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-navy/90 px-6 pb-safe pt-safe backdrop-blur-sm">
          <div className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-[20px] border border-line bg-navy-2 p-7">
            <div className="mb-4 flex items-center gap-2.5">
              <BrandMark className="h-9 w-9 text-[20px]" />
              <span className="text-[17px] font-bold tracking-[-0.02em]">UroApp</span>
            </div>
            <h2 className="mb-3 font-display text-[22px] font-semibold">Before you begin</h2>
            <div className="space-y-3 text-[13.5px] text-muted">
              <p>
                UroApp is an <b className="text-ink">educational and decision-support tool for licensed
                healthcare professionals</b> — not a substitute for clinical judgement, and not for
                patient use.
              </p>
              <p>
                Every score, dose, threshold and summary must be <b className="text-ink">verified
                against its primary source and your local protocol</b> before you act on it. In an
                emergency, follow local protocol and escalate to your senior.
              </p>
              <p>UroApp stores <b className="text-ink">no patient-identifiable data</b>.</p>
            </div>
            <button
              type="button"
              onClick={accept}
              className="mt-6 w-full rounded-[12px] bg-violet py-3.5 text-[15px] font-semibold text-white transition hover:bg-violet-deep"
            >
              I'm a healthcare professional — I understand
            </button>
          </div>
        </div>
      )}
    </>
  );
}
