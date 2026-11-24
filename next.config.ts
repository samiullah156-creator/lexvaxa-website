import type { NextConfig } from 'next';
import { legacyRedirects } from './lib/legacy-redirects';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  turbopack: { root: process.cwd() },
  images: { formats: ['image/avif', 'image/webp'] },
  // Stylesheets stay external (no experimental.inlineCss): the site's CSS is large, and inlining copied it
  // into every HTML response three times (a <style> tag plus twice in the RSC payload), making the home
  // page about 1 MB. External files are fetched once over HTTP/2 and cached across pages.
  // Old lexvaxa.com URLs already in Google keep working.
  async redirects() {
    return [
      // The admin panel is served by the CMS project; lexvaxa.com/admin is a shortcut to it.
      { source: '/admin', destination: 'https://admin.lexvaxa.com/admin', permanent: false },
      { source: '/admin/:path*', destination: 'https://admin.lexvaxa.com/admin/:path*', permanent: false },
      ...legacyRedirects,
    ];
  },
  async headers() {
    const security = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ];
    // Rendered 3D stills and screenshots change rarely; cache them for a week and refresh in the background.
    const media = [{ key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' }];
    return [
      { source: '/:path*', headers: security },
      ...['/services/renders/:file*', '/media/:file*', '/team/:file*', '/images/:file*']
        .map((source) => ({ source, headers: media })),
    ];
  },
};
export default nextConfig;
