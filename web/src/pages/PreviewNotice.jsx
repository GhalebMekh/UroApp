import React from 'react';

/**
 * Shown in place of the login and patient platform in a preview build. No
 * sign-in form is rendered at all, so no account or record can be created
 * against a build that is not the real product.
 */
export default function PreviewNotice() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-navy px-4">
      <div className="w-full max-w-md rounded-lg border border-line bg-navy-2 p-8 text-center">
        <h1 className="font-display text-3xl font-bold text-ink mb-2">UroApp</h1>
        <p className="text-muted text-sm mb-6">Residency platform for on-duty clinicians</p>

        <div className="rounded border border-line bg-steel p-4 text-left">
          <p className="text-sm text-ink">
            The patient platform ships with the iOS release and is not part of this preview.
          </p>
          <p className="mt-2 text-xs text-muted">
            Ward round lists, SOAP notes and the operative logbook live in the full app, where
            records stay on your device.
          </p>
        </div>

        <a
          href="/"
          className="mt-6 inline-flex min-h-[44px] w-full items-center justify-center rounded bg-violet font-semibold text-navy transition hover:bg-violet-soft"
        >
          Open the preview
        </a>
      </div>
    </div>
  );
}
