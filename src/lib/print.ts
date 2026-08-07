/**
 * Popup-free printing and document export.
 *
 * `window.open` is routinely blocked by popup blockers (and is unavailable in
 * the Capacitor webview), which makes a print button fail silently. We instead
 * render the document into a hidden iframe and print that.
 *
 * Export is platform-aware: a file download on the web, and the native share
 * sheet (Save to Files / Print → Save as PDF) inside the Capacitor shell.
 */
import { Capacitor } from '@capacitor/core';

/** Escape user-entered text before injecting it into a print document. */
export function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string,
  );
}

/** Shared ink-on-paper stylesheet for UroApp print documents. */
export const PRINT_CSS = `
  * { box-sizing: border-box; }
  body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; color: #111; margin: 24px; font-size: 12px; line-height: 1.5; }
  h1 { font-size: 18px; margin: 0 0 2px; }
  h2 { font-size: 13px; margin: 14px 0 5px; }
  .sub { color: #555; margin: 0 0 12px; font-size: 11px; }
  table { width: 100%; border-collapse: collapse; margin-top: 6px; }
  th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; vertical-align: top; }
  th { background: #f3f4f6; font-size: 10.5px; text-transform: uppercase; letter-spacing: .04em; }
  .stats { margin: 10px 0 4px; }
  .stats span { display: inline-block; border: 1px solid #ddd; padding: 4px 10px; margin-right: 8px; font-size: 11px; }
  .stats b { font-size: 15px; }
  .card { border: 1px solid #ddd; padding: 8px 10px; margin-top: 8px; page-break-inside: avoid; }
  .card h3 { font-size: 13px; margin: 0 0 4px; }
  .meta { color: #555; font-size: 11px; margin-bottom: 4px; }
  .row { margin: 2px 0; }
  .row b { display: inline-block; min-width: 130px; }
  .note { margin-top: 16px; padding: 8px 10px; border: 1px solid #e0b050; background: #fdf6e3; font-size: 10.5px; }
  @media print { body { margin: 12mm; } }
`;

/** Send a complete, self-contained HTML document to the printer. */
export function printHtmlDocument(fullHtml: string): boolean {
  const frame = document.createElement('iframe');
  frame.setAttribute('aria-hidden', 'true');
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
  document.body.appendChild(frame);

  const doc = frame.contentWindow?.document;
  if (!doc) {
    frame.remove();
    return false;
  }

  doc.open();
  doc.write(fullHtml);
  doc.close();

  let fired = false;
  const run = () => {
    if (fired) return;
    fired = true;
    try {
      frame.contentWindow?.focus();
      frame.contentWindow?.print();
    } catch {
      /* the browser refused; the caller shows fallback guidance */
    }
    window.setTimeout(() => frame.remove(), 1000);
  };

  frame.onload = run;
  // Fallback in case load already fired for the written document.
  window.setTimeout(run, 300);
  return true;
}

/** Wrap a body + CSS into a complete, self-contained HTML document. */
export function buildDocument(title: string, bodyHtml: string, extraCss = ''): string {
  return (
    `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title>` +
    `<style>${PRINT_CSS}${extraCss}</style></head><body>${bodyHtml}</body></html>`
  );
}

/** Build a standard UroApp document and print it. */
export function printDocument(title: string, bodyHtml: string, extraCss = ''): boolean {
  return printHtmlDocument(buildDocument(title, bodyHtml, extraCss));
}

/** Turn a title into a safe file name stem. */
function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'document';
}

/** Web download of arbitrary text content as a named file. */
function downloadInBrowser(fileStem: string, ext: string, mime: string, content: string): boolean {
  try {
    const blob = new Blob([content], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slugify(fileStem)}.${ext}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch {
    return false;
  }
}

/**
 * Native export: write the content into the app's cache directory and open the
 * OS share sheet. For HTML that offers "Save to Files" / Print → Save as PDF;
 * for an .ics file iOS offers "Add to Calendar". Runs only in the Capacitor
 * webview; the plugins are dynamically imported so the web bundle is unaffected.
 */
async function shareOnNative(fileStem: string, ext: string, content: string): Promise<void> {
  const [{ Filesystem, Directory, Encoding }, { Share }] = await Promise.all([
    import('@capacitor/filesystem'),
    import('@capacitor/share'),
  ]);

  const path = `${slugify(fileStem)}.${ext}`;
  await Filesystem.writeFile({ path, data: content, directory: Directory.Cache, encoding: Encoding.UTF8 });
  const { uri } = await Filesystem.getUri({ path, directory: Directory.Cache });
  await Share.share({ title: fileStem, url: uri, dialogTitle: 'Save or share' });
}

/**
 * Save/export a text file. On the web this downloads it; inside the Capacitor
 * native shell it opens the OS share sheet. Returns false only when the
 * synchronous web path fails.
 */
export function saveFile(fileStem: string, ext: string, mime: string, content: string): boolean {
  if (Capacitor.isNativePlatform()) {
    void shareOnNative(fileStem, ext, content).catch(() =>
      downloadInBrowser(fileStem, ext, mime, content),
    );
    return true;
  }
  return downloadInBrowser(fileStem, ext, mime, content);
}

/** Save/export a full HTML document (see saveFile for platform behaviour). */
export function saveHtmlDocument(fileStem: string, fullHtml: string): boolean {
  return saveFile(fileStem, 'html', 'text/html', fullHtml);
}

/** Build a standard UroApp document and save it to a file. */
export function saveDocument(
  title: string,
  bodyHtml: string,
  extraCss = '',
  fileStem = title,
): boolean {
  return saveHtmlDocument(fileStem, buildDocument(title, bodyHtml, extraCss));
}
