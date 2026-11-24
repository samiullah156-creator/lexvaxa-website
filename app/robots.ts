import type { MetadataRoute } from 'next';
import { IS_PREVIEW, SITE } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    // The wildcard includes Googlebot, Bingbot and OAI-SearchBot. Keep rendering
    // assets crawlable, including on previews where HTML supplies noindex.
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api/'] },
    ...(!IS_PREVIEW ? { sitemap: `${SITE.url}/sitemap.xml` } : {}),
  };
}
