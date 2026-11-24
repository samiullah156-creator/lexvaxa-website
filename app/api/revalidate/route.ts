import crypto from 'node:crypto';
import { revalidateTag } from 'next/cache';
import { CMS_TAGS } from '@/lib/cms';

// Compared as bytes: a header with non-ASCII characters must be refused, not crash timingSafeEqual.
const sameSecret = (given: string, expected: string) => {
  const a = Buffer.from(given), b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

/**
 * Called by the admin backend right after content is published, edited or removed, so the
 * affected pages are rebuilt on the next visit instead of waiting for the timed refresh.
 * Both sides share REVALIDATE_SECRET; without it this endpoint refuses every request.
 */
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET ?? '';
  if (!secret || !sameSecret(request.headers.get('x-revalidate-secret') ?? '', secret)) {
    return Response.json({ error: 'Not authorised.' }, { status: 401 });
  }
  const body = (await request.json().catch(() => null)) as { tags?: unknown } | null;
  const tags = (Array.isArray(body?.tags) ? body.tags : []).filter((tag): tag is (typeof CMS_TAGS)[number] => (CMS_TAGS as readonly unknown[]).includes(tag));
  // A webhook is outside any user action, so the cached data is expired outright.
  for (const tag of tags) revalidateTag(tag, { expire: 0 });
  return Response.json({ revalidated: tags });
}
