/** Small text helpers for the Home header (kept out of the component file for fast refresh). */

export function greetingFor(hour: number): string {
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/** Up to two initials from a display name, ignoring a leading title ("Dr Ghaleb Al-Mekhlafi" → "GA"). */
export function initialsOf(name: string): string {
  const words = name
    .trim()
    .replace(/^(dr|prof|mr|mrs|ms|د)\.?\s+/i, '')
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return '';
  const first = [...words[0]!][0] ?? '';
  const last = words.length > 1 ? ([...words[words.length - 1]!][0] ?? '') : '';
  return (first + last).toUpperCase();
}
