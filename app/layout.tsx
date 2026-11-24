import { articles } from '@/lib/data/articles';
import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { BookCallTab } from '@/components/layout/book-call-tab';
import { AnnouncementBar } from '@/components/layout/announcement-bar';
import { JsonLd } from '@/components/content/json-ld';
import { MotionGate } from '@/components/layout/motion-gate';
import { IS_PREVIEW, SITE } from '@/lib/site';
import { organizationSchema } from '@/lib/seo';
import './globals.css';

// One expressive, highly legible family for headings and text; mono only for small technical labels.
const inter = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: 'AI Development, Automation & Custom Software | Lexvaxa', template: '%s | Lexvaxa' },
  description: SITE.description,
  applicationName: SITE.name,
  openGraph: {
    type: 'website',
    title: 'AI Development, Automation & Custom Software | Lexvaxa',
    description: SITE.description,
    siteName: SITE.name,
    locale: 'en_US',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'Lexvaxa: Engineering With Intelligence' }],
  },
  twitter: { card: 'summary_large_image', title: 'AI Development, Automation & Custom Software | Lexvaxa', description: SITE.description, images: ['/og-default.png'] },
  // Crawlers must be able to fetch preview pages to read their noindex directive.
  robots: {
    index: !IS_PREVIEW,
    follow: true,
    googleBot: { index: !IS_PREVIEW, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
  },
  // Search Console / Bing Webmaster HTML-tag verification. Set the env values on Vercel to switch them on.
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.BING_SITE_VERIFICATION ? { 'msvalidate.01': process.env.BING_SITE_VERIFICATION } : undefined,
  },
};

const latestForNav = [...articles].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)).slice(0, 3)
  .map(({ slug, title, category, readingTime }) => ({ slug, title: title.includes(':') && title.indexOf(':') > 18 ? title.slice(0, title.indexOf(':')) : title, category, readingTime }));

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <a className="skip-link" href="#main">Skip to main content</a>
        <JsonLd data={organizationSchema()} />
        <AnnouncementBar />
        <Header latest={latestForNav} />
        <main id="main">{children}</main>
        <Footer />
        <MotionGate />
        <BookCallTab />
      </body>
    </html>
  );
}
