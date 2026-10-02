/**
 * Shortens `text` to at most `max` characters (the ellipsis counts toward the limit).
 * Cuts on a word boundary when one is close enough, so previews don't end mid-word.
 */
export function truncate(text: string | null | undefined, max: number): string {
  const value = (text ?? '').trim();
  if (value.length <= max) return value;

  const cut = value.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  const base = lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut;
  return `${base.trimEnd()}…`;
}

/** Parses the backend's JSON-encoded `points` column; anything malformed becomes `[]`. */
export function parsePoints(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw !== 'string') return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

/** Splits plain multi-line text into paragraphs on blank lines. */
export function toParagraphs(text: string | null | undefined): string[] {
  return (text ?? '')
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}
