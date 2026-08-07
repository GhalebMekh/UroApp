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

export async function askEvidence(history: AiMessage[]): Promise<string> {
  let res: Response;
  try {
    res = await fetch('/api/evidence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history }),
    });
  } catch {
    throw new EvidenceUnavailableError('Could not reach the evidence service.');
  }

  if (!res.ok) {
    throw new EvidenceUnavailableError(`Evidence service returned ${res.status}.`);
  }

  const data: unknown = await res.json();
  const text =
    data && typeof data === 'object' && 'text' in data
      ? String((data as { text: unknown }).text ?? '')
      : '';

  if (!text.trim()) {
    throw new EvidenceUnavailableError('No answer was returned.');
  }
  return text;
}
