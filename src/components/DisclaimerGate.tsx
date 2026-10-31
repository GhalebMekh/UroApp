import { useEffect, useState, type ReactNode } from 'react';
import { BrandMark } from './BrandMark';
import { getJSON, setJSON } from '@/lib/storage';
import { PRIVACY_URL, TERMS_URL } from '@/lib/legal';

// v2 (2026-10-31): explicit checkbox consent + Terms/Privacy links; everyone re-accepts once.
const KEY = 'uroapp.disclaimer.v2';

/**
 * First-launch medical disclaimer (CLAUDE.md: required at first launch).
 * Blocks the app until the user ticks the checkbox and taps the button; the
 * acceptance is stored on-device with its date so it shows once.
 * Returning users never see the flash (null = still loading).
 */
export function DisclaimerGate({ children }: { children: ReactNode }) {
  const [accepted, setAccepted] = useState<boolean | null>(null);
  const [ticked, setTicked] = useState(false);

  useEffect(() => {
    getJSON<string | null>(KEY, null).then((at) => setAccepted(at !== null));
  }, []);

  function accept() {
    if (!ticked) return;
    setAccepted(true);
    void setJSON(KEY, new Date().toISOString());
  }

  return (
    <>
      {accepted !== false && children}
      {accepted === false && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-navy px-6 pb-safe pt-safe">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="disclaimer-title"
            className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-[20px] border border-line bg-navy-2 p-7"
          >
            <div className="mb-4 flex items-center gap-2.5">
              <BrandMark className="h-9 w-9 text-[20px]" />
              <span className="text-[17px] font-bold tracking-[-0.02em]">UroApp</span>
            </div>
            <h2 id="disclaimer-title" className="mb-3 font-display text-[22px] font-semibold">
              Medical disclaimer
            </h2>
            <div className="space-y-3 text-[13.5px] text-muted">
              <p>
                UroApp is an <b className="text-ink">educational and reference tool for healthcare
                professionals</b> — urologists, residents and medical students. It is not for patient use.
              </p>
              <p>
                Its content summarises published literature and guidelines (such as EAU and AUA), with
                the source cited in the app. UroApp is not affiliated with or endorsed by these bodies.
              </p>
              <p>
                UroApp <b className="text-ink">does not provide clinical advice, diagnosis or treatment
                plans</b> and does not replace clinical judgement. Verify every score, dose and threshold
                against its primary source and your local protocol. In an emergency, follow local
                protocol and escalate to your senior.
              </p>
              <p>UroApp stores <b className="text-ink">no patient-identifiable data</b>.</p>
            </div>

            <label className="mt-5 flex min-h-[44px] cursor-pointer items-start gap-3 rounded-[12px] border border-line bg-navy p-3 text-[13.5px]">
              <input
                type="checkbox"
                checked={ticked}
                onChange={(e) => setTicked(e.target.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 accent-violet"
              />
              <span>
                I am a healthcare professional or medical student, and I have read and agree to the{' '}
                <a href={TERMS_URL} target="_blank" rel="noreferrer" className="text-violet underline">
                  Terms of Use
                </a>
                {PRIVACY_URL && (
                  <>
                    {' '}and{' '}
                    <a href={PRIVACY_URL} target="_blank" rel="noreferrer" className="text-violet underline">
                      Privacy Policy
                    </a>
                  </>
                )}
                .
              </span>
            </label>

            <button
              type="button"
              onClick={accept}
              disabled={!ticked}
              className="mt-4 w-full rounded-[12px] bg-violet py-3.5 text-[15px] font-semibold text-white transition hover:bg-violet-deep disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-violet"
            >
              I agree &amp; understand
            </button>
          </div>
        </div>
      )}
    </>
  );
}
