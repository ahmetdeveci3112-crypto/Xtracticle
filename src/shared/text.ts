/** Text helpers shared by the client and the Worker. */

// Leading thread markers: "(1/🧵)", "1/", "1/8", "[1/n]", "🧵", "👇"…
const THREAD_MARKER = /^[\s([]*\d{1,3}\s*\/\s*(?:\d{1,3}|n|x|🧵)?\s*[)\]:.-]*\s*|[🧵👇⬇️↓]+/gu;

/** A human title from post text: first meaningful line, without links or thread markers. */
export function titleFromText(text: string, max = 80): string {
  for (const raw of (text || '').split('\n')) {
    const line = raw.replace(/https?:\/\/\S+/g, '').replace(THREAD_MARKER, '').replace(/\s+/g, ' ').trim();
    if ((line.match(/[\p{L}\p{N}]/gu) || []).length < 3) continue;
    if (line.length <= max) return line;
    const cut = line.slice(0, max - 1);
    const space = cut.lastIndexOf(' ');
    return (space > max * 0.6 ? cut.slice(0, space) : cut).trimEnd() + '…';
  }
  return '';
}
