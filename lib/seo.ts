import type { Metadata } from 'next';
import { SITE } from './site';
import { services } from './data/services';

export function pageMetadata({
  title,
  description,
  path,
  image,
  type = 'website',
  publishedTime,
  modifiedTime,
}: {
  title: string;
  description: string;
  path: string;
  image?: { url: string; width: number; height: number; alt: string };
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
}): Metadata {
  const canonicalUrl = new URL(path, SITE.url);
  canonicalUrl.search = '';
  canonicalUrl.hash = '';
  const canonical = canonicalUrl.toString();
  // Some existing editorial titles already include the brand; emit it exactly once.
  const pageTitle = `${title.replace(/(?:\s*\|\s*Lexvaxa)+$/i, '').trim()} | ${SITE.name}`;
  const ogImageUrl = new URL(image?.url ?? '/og-default.png', SITE.url).toString();
  const ogImageWidth = image?.width ?? 1200;
  const ogImageHeight = image?.height ?? 630;
  const ogImageAlt = image?.alt ?? 'Lexvaxa: Engineering With Intelligence';

  return {
    title: { absolute: pageTitle },
    description,
    alternates: { canonical },
    openGraph: {
      ...(type === 'article'
        ? { type: 'article' as const, publishedTime, modifiedTime }
        : { type: 'website' as const }),
      locale: 'en_US',
      title: pageTitle,
      description,
      url: canonical,
      siteName: SITE.name,
      images: [
        {
          url: ogImageUrl,
          width: ogImageWidth,
          height: ogImageHeight,
          alt: ogImageAlt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description,
      images: [ogImageUrl],
    },
  };
}

export function articleSchema({
  title,
  description,
  url,
  image,
  datePublished,
  dateModified,
  author,
  about = [],
}: {
  title: string;
  description: string;
  url: string;
  image: string;
  datePublished: string;
  dateModified: string;
  author: { name: string; role: string };
  /** Service pages the guide is about; links the article to those entities. */
  about?: { name: string; url: string }[];
}) {
  const absoluteUrl = new URL(url, SITE.url).toString();
  const absoluteImage = new URL(image, SITE.url).toString();
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${absoluteUrl}#article`,
    url: absoluteUrl,
    headline: title,
    description,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': absoluteUrl,
    },
    image: absoluteImage,
    datePublished,
    dateModified,
    inLanguage: 'en',
    isPartOf: { '@id': `${SITE.url}/#website` },
    // An article without a named writer is credited to the company rather than to a guessed person.
    author: author.name
      ? { '@type': 'Person', name: author.name, ...(author.role ? { jobTitle: author.role } : {}) }
      : { '@id': `${SITE.url}/#organization` },
    publisher: { '@id': `${SITE.url}/#organization` },
    ...(about.length ? { about: about.map((item) => ({ '@type': 'Service', name: item.name, url: new URL(item.url, SITE.url).toString() })) } : {}),
  };
}

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE.url}/#organization`,
    name: SITE.name,
    url: `${SITE.url}/`,
    logo: {
      '@type': 'ImageObject',
      '@id': `${SITE.url}/#logo`,
      url: `${SITE.url}/brand/lexvaxa-logo.svg`,
    },
    description: SITE.description,
    // Mirrors the service disciplines listed on the site.
    knowsAbout: services.map((service) => service.name),
    email: SITE.email,
    telephone: SITE.phone,
    sameAs: [
      SITE.socials.linkedin,
      SITE.socials.x,
      SITE.socials.youtube,
      SITE.socials.facebook,
      SITE.socials.instagram,
    ],
    founder: {
      '@type': 'Person',
      '@id': `${SITE.url}/about#founder`,
      name: SITE.founder.name,
      jobTitle: SITE.founder.role,
      sameAs: SITE.founder.linkedin,
    },
  };
}

export function breadcrumbs(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: new URL(item.url, SITE.url).toString(),
    })),
  };
}

/** Collection page with its entries, so search and answer engines can enumerate a hub's pages. */
export function collectionSchema({ name, description, path, items }: { name: string; description: string; path: string; items: { name: string; url: string }[] }) {
  const url = new URL(path, SITE.url).toString();
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${url}#collection`,
    name,
    description,
    url,
    isPartOf: { '@id': `${SITE.url}/#website` },
    publisher: { '@id': `${SITE.url}/#organization` },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: items.length,
      itemListElement: items.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.name, url: new URL(item.url, SITE.url).toString() })),
    },
  };
}

/** Used on the root home page to help search engines identify the company site name. */
export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE.url}/#website`,
    name: SITE.name,
    url: `${SITE.url}/`,
    publisher: { '@id': `${SITE.url}/#organization` },
    inLanguage: 'en',
  };
}
