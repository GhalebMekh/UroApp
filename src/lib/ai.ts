/**
 * Evidence AI client. Calls our own serverless proxy (server/ai-proxy) so the
 * Anthropic key never ships to the device (CLAUDE.md). The original landing
 * page also had a direct browser→Anthropic fallback; that is deliberately
 * dropped here because it would expose the key client-side.
 */
export interface AiMessage {
  role: 'user' | 'assistant';
  content: string;
}

export class EvidenceUnavailableError extends Error {}

/**
 * Proxy origin. Empty in dev so Vite's proxy handles /api; a deployed static
 * build has no proxy, so VITE_EVIDENCE_API must point at the proxy's origin or
 * the request is answered by the static host with HTML.
 */
const API_BASE = (import.meta.env.VITE_EVIDENCE_API || '').replace(/\/$/, '');

export async function askEvidence(history: AiMessage[]): Promise<string> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/evidence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history }),
    });
  } catch {
    throw new EvidenceUnavailableError('Could not reach the evidence service.');
  }

  // Read as text first. A static host answers /api with its index.html at status
  // 200, so res.ok is true and res.json() then throws outside any guard — in
  // Safari as "The string did not match the expected pattern".
  const raw = await res.text();
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    console.error(
      `Expected JSON from ${API_BASE}/api/evidence, got ${res.status}:`,
      raw.slice(0, 200),
    );
    throw new EvidenceUnavailableError('Could not reach the evidence service.');
  }

  if (!res.ok) {
    const detail =
      data && typeof data === 'object' && 'error' in data
        ? String((data as { error: unknown }).error ?? '')
        : '';
    throw new EvidenceUnavailableError(detail || `Evidence service returned ${res.status}.`);
  }

  const text =
    data && typeof data === 'object' && 'text' in data
      ? String((data as { text: unknown }).text ?? '')
      : '';

  if (!text.trim()) {
    throw new EvidenceUnavailableError('No answer was returned.');
  }
  return text;
}
