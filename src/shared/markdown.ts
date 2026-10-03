import { fileBaseName } from './convert';
import { ERROR_TEXT, loadDoc, renderDoc } from './doc';

/**
 * GET /api/markdown/:id — a post, self-thread or X Article as Markdown (or text),
 * for agents and scripts that don't speak MCP.
 *   ?format=markdown|text   (default markdown)
 *   ?thread=0|1             (default 1: unroll the author's self-thread)
 *   ?front_matter=0|1       (default 0: YAML front-matter)
 * Returns null for any other path.
 */
export async function handleMarkdown(request: Request, waitUntil?: (p: Promise<unknown>) => void): Promise<Response | null> {
  const url = new URL(request.url);
  const match = url.pathname.match(/^\/api\/markdown\/([^/]+)\/?$/);
  if (!match) return null;

  const base: Record<string, string> = {
    'Access-Control-Allow-Origin': '*',
    'X-Robots-Tag': 'noindex',
  };
  const plain = (body: string, status: number) =>
    new Response(body + '\n', { status, headers: { ...base, 'Content-Type': 'text/plain; charset=utf-8' } });

  if (request.method !== 'GET' && request.method !== 'HEAD') return plain('Method not allowed.', 405);
  const id = match[1];
  if (!/^\d{1,25}$/.test(id)) return plain(ERROR_TEXT.invalid, 400);

  const format = url.searchParams.get('format') === 'text' ? 'text' : 'markdown';
  const result = await loadDoc(url.origin, id, url.searchParams.get('thread') !== '0', waitUntil);
  if ('error' in result) return plain(ERROR_TEXT[result.error], result.error === 'not_found' ? 404 : 502);

  const { doc, stale } = result;
  const { text } = renderDoc(doc, { format, frontMatter: url.searchParams.get('front_matter') === '1' });
  const ext = format === 'text' ? 'txt' : 'md';
  return new Response(request.method === 'HEAD' ? null : text, {
    headers: {
      ...base,
      'Content-Type': `${format === 'text' ? 'text/plain' : 'text/markdown'}; charset=utf-8`,
      'Content-Disposition': `inline; filename="${fileBaseName(doc)}.${ext}"`,
      'Cache-Control': stale ? 'no-store' : 'public, max-age=300',
      'X-Xt-Kind': doc.kind,
      'X-Xt-Source': doc.sourceUrl,
      ...(stale ? { 'X-Xt-Stale': '1' } : {}),
    },
  });
}
