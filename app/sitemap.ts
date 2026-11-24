import type { MetadataRoute } from 'next';
import { IS_PREVIEW, SITE } from '@/lib/site';
import { services } from '@/lib/data/services';
import { industries } from '@/lib/data/industries';
import { articles } from '@/lib/data/articles';
import { publishedPosts } from '@/lib/data/insights';
import { cmsJobs } from '@/lib/cms';
import { allProjects } from '@/lib/data/all-projects';

// Rebuilt every 5 minutes (like llms.txt), so projects, posts and jobs published in the CMS reach the
// sitemap without a redeploy. Without this the sitemap stayed frozen at build time.
export const dynamic = 'force-static';
export const revalidate = 300;

const coreRoutes = [
  '/',
  '/services',
  '/industries',
  '/work',
  '/insights',
  '/about',
  '/careers',
  '/contact',
  '/privacy',
  '/cookie-policy',
  '/terms',
  '/security',
  '/accessibility',
];

const urls = [
  ...coreRoutes,
  ...services.map((s) => `/services/${s.slug}`),
  ...industries.map((i) => `/industries/${i.slug}`),
  ...articles.map((a) => `/insights/${a.slug}`),
];

/** Image sitemap entries, so project screenshots and the founder portrait can be found in image search. */
function imagesFor(path: string, projectImages: string[]): string[] {
  if (path === '/about') return [new URL('/media/founder-sami.jpg', SITE.url).toString()];
  if (path === '/work') return projectImages;
  return [];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (IS_PREVIEW) return [];
  // Posts published from the admin panel carry a real edit time, so it is safe to advertise.
  const [posts, jobs, projects] = await Promise.all([publishedPosts(), cmsJobs(), allProjects()]);
  const projectImages = projects.map((item) => new URL(item.image.src, SITE.url).toString());

  // Only editorially recorded article revisions have a reliable modification date.
  // Rebuilding an unchanged page must not advertise it as newly updated.
  return [
    ...urls.map((path) => ({
      url: new URL(path, SITE.url).toString(),
      ...(path.startsWith('/insights/')
        ? { lastModified: articles.find((article) => path === `/insights/${article.slug}`)?.modifiedAt }
        : {}),
      ...(imagesFor(path, projectImages).length ? { images: imagesFor(path, projectImages) } : {}),
    })),
    ...posts.map((post) => ({
      url: new URL(`/insights/${post.slug}`, SITE.url).toString(),
      lastModified: post.updatedAt,
      ...(post.cover ? { images: [post.cover.url] } : {}),
    })),
    ...jobs.map((job) => ({ url: new URL(`/careers/${job.slug}`, SITE.url).toString(), lastModified: job.updatedAt })),
    ...projects.map((project) => ({ url: new URL(`/work/${project.slug}`, SITE.url).toString(), lastModified: project.updatedAt, images: [new URL(project.image.src, SITE.url).toString()] })),
  ];
}
