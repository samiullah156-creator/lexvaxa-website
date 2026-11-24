export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  // Prevent accidental HTML injection from structured-data strings.
  const value = JSON.stringify(data).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: value }} />;
}
