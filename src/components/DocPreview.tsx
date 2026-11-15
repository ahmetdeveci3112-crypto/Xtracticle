import { lazy, Suspense, useEffect } from 'react';
import type { XDoc } from '../shared/convert';

// Lazy-load react-markdown + remark-gfm together (~165KB saved from initial bundle)
const LazyMarkdown = lazy(() =>
  Promise.all([import('react-markdown'), import('remark-gfm')]).then(
    ([{ default: ReactMarkdown }, { default: remarkGfm }]) => ({
      default: (props: any) => <ReactMarkdown remarkPlugins={[remarkGfm]} {...props} />,
    })
  )
);

/** Mounts only once the Markdown renderer has loaded (same Suspense boundary). */
function Ready({ onReady }: { onReady?: () => void }) {
  useEffect(() => onReady?.(), [onReady]);
  return null;
}

/**
 * The rendered document (the preview card's body). PDF and EPUB exports read this element by `id`,
 * so `onReady` tells the caller when the Markdown is really on screen (used by the `#dl=` deep link).
 */
export default function DocPreview({ doc, id, loadingLabel, onReady }: { doc: XDoc; id: string; loadingLabel: string; onReady?: () => void }) {
  return (
    <article
      id={id}
      dir="auto"
      lang={doc.lang && doc.lang !== 'zxx' ? doc.lang : undefined}
      className="prose prose-neutral max-w-none prose-img:rounded-2xl prose-img:border prose-headings:tracking-tight"
    >
      <Suspense fallback={<p style={{ color: 'var(--text-tertiary)' }}>{loadingLabel}</p>}>
        <LazyMarkdown
          components={{
            img: ({ node, ...props }: any) => (
              <img {...props} loading="lazy" referrerPolicy="no-referrer" style={{ borderColor: 'var(--border)' }} />
            ),
            a: ({ node, ...props }: any) => <a {...props} target="_blank" rel="noopener noreferrer nofollow" />,
          }}
        >
          {doc.md}
        </LazyMarkdown>
        <Ready onReady={onReady} />
      </Suspense>
    </article>
  );
}
