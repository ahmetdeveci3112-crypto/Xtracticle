export { parseInput, parsePath, type ParsedInput } from '../shared/url';

export function shareUrl(handle: string, id: string) {
  return `${location.origin}/${handle || 'i'}/status/${id}`;
}
