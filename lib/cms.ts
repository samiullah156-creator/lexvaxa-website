/**
 * Content from the Lexvaxa admin panel (the backend in ../lexvaxa-backend).
 *
 * The site works without it: when CMS_URL is not set every function returns "nothing", and the
 * pages show only the content that lives in this repository. When it is set, pages are still
 * served as static HTML; they are rebuilt in the background on a timer and immediately after
 * something is published (see app/api/revalidate/route.ts).
 */
import type { ProjectTrack } from './data/projects';

const CMS_URL = (process.env.CMS_URL ?? '').replace(/\/$/, '');
/** Background refresh interval in seconds, as a safety net behind the instant publish webhook. */
const REFRESH = 300;
/** Cache tags the publish webhook may expire. */
export const CMS_TAGS = ['cms-posts', 'cms-settings', 'cms-testimonials', 'cms-faqs', 'cms-careers', 'cms-projects', 'cms-team'] as const;

export const cmsEnabled = CMS_URL !== '';

export type CmsImage = {
  url: string; width: number; height: number; alt: string; color: string;
  variants: { width: number; height: number; url: string }[];
};
export type CmsPostSummary = {
  slug: string; title: string; excerpt: string; category: string; tags: string[]; relatedServices: string[];
  seoTitle: string; seoDescription: string; authorName: string; authorRole: string;
  publishedAt: string; updatedAt: string; readingMinutes: number; cover: CmsImage | null;
};
export type CmsPost = CmsPostSummary & { html: string; toc: { id: string; label: string }[]; faqs: { question: string; answer: string }[] };
export type Announcement = { enabled: boolean; text: string; linkLabel: string; linkHref: string };

class CmsUnavailable extends Error {}

/**
 * GET from the public API, cached and tagged.
 * Returns null for "not found". When the API cannot be reached, `fallback` decides what happens:
 * a value is returned as-is; without one the error is thrown so an already published page keeps
 * its last good version instead of being rebuilt empty.
 */
async function read<T>(path: string, tag: (typeof CMS_TAGS)[number], fallback?: T): Promise<T | null> {
  if (!cmsEnabled) return fallback ?? null;
  try {
    const response = await fetch(`${CMS_URL}/api/public${path}`, { next: { revalidate: REFRESH, tags: [tag] }, signal: AbortSignal.timeout(8000) });
    if (response.status === 404) return null;
    if (!response.ok) throw new CmsUnavailable(`CMS answered ${response.status} for ${path}`);
    return (await response.json()) as T;
  } catch (error) {
    // While building or developing, a missing backend must not stop the site from rendering.
    const lenient = fallback !== undefined || process.env.NODE_ENV !== 'production' || process.env.NEXT_PHASE === 'phase-production-build';
    if (!lenient) throw error;
    console.warn(`[cms] ${path} unavailable: ${error instanceof Error ? error.message : error}`);
    return fallback ?? null;
  }
}

/**
 * Every published post, newest first. The API returns at most 100 per request, so this walks the
 * pages; it runs only when the cached list is rebuilt (on publish), never per visitor.
 */
export async function cmsPosts(): Promise<CmsPostSummary[]> {
  const PAGE_SIZE = 100;
  const posts: CmsPostSummary[] = [];
  for (let page = 1; page <= 50; page++) {
    const data = await read<{ items: CmsPostSummary[]; total?: number }>(`/posts?pageSize=${PAGE_SIZE}&page=${page}`, 'cms-posts');
    const items = data?.items ?? [];
    posts.push(...items);
    if (items.length < PAGE_SIZE || posts.length >= (data?.total ?? 0)) break;
  }
  return posts;
}

export async function cmsPost(slug: string): Promise<CmsPost | null> {
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) return null;
  const data = await read<{ post: CmsPost }>(`/posts/${slug}`, 'cms-posts');
  return data?.post ?? null;
}

const NO_ANNOUNCEMENT: Announcement = { enabled: false, text: '', linkLabel: '', linkHref: '' };

/** Site-wide notice. A backend hiccup simply hides the bar; it never blocks a page. */
export async function cmsAnnouncement(): Promise<Announcement> {
  const data = await read<{ settings: { announcement?: Announcement } }>('/settings', 'cms-settings', { settings: {} });
  const announcement = data?.settings.announcement;
  return announcement?.enabled && announcement.text ? announcement : NO_ANNOUNCEMENT;
}

export type CmsJob = {
  slug: string; title: string; team: string; location: string; workplace: 'Remote' | 'Hybrid' | 'On-site';
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship'; experience: string; salary: string; summary: string;
  responsibilities: string[]; requirements: string[]; niceToHave: string[]; createdAt: string; updatedAt: string;
};

/** Open roles managed in the admin. An unreachable backend shows "no open roles" rather than an error. */
export async function cmsJobs(): Promise<CmsJob[]> {
  const data = await read<{ items: CmsJob[] }>('/careers/jobs', 'cms-careers', { items: [] });
  return data?.items ?? [];
}

export async function cmsJob(slug: string): Promise<CmsJob | null> {
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) return null;
  const data = await read<{ job: CmsJob }>(`/careers/jobs/${slug}`, 'cms-careers');
  return data?.job ?? null;
}

/** A published case study from the admin. */
export type CmsProject = {
  slug: string; name: string; category: string; discipline: string; summary: string; overview: string; challenge: string; solution: string;
  technologies: string[]; features: string[]; serviceSlugs: string[]; liveUrl: string; featured: boolean; tracks: ProjectTrack[]; blueprint: boolean; seoTitle: string; seoDescription: string;
  image: { src: string; alt: string; width: number; height: number }; updatedAt: string;
  /** Extra screens and explainer images, in order. */
  gallery?: { src: string; alt: string; width: number; height: number }[];
  /** Guided tour over the cover screenshot; each box is in percentages of the image. */
  walkthrough?: { title: string; text: string; x: number; y: number; w: number; h: number }[];
  results?: string[];
};

/** Published projects from the admin, in admin order. Empty when the backend cannot be reached. */
export async function cmsProjects(): Promise<CmsProject[]> {
  const data = await read<{ items: CmsProject[] }>('/projects', 'cms-projects', { items: [] });
  return data?.items ?? [];
}

export type CmsTestimonial = { id: number; name: string; role: string; company: string; country: string; quote: string; sourceUrl: string; rating?: number };

/** Published client reviews from the admin. Empty when the backend is not connected. */
export async function cmsTestimonials(): Promise<CmsTestimonial[]> {
  const data = await read<{ items: CmsTestimonial[] }>('/testimonials', 'cms-testimonials', { items: [] });
  return data?.items ?? [];
}

export type CmsTeamMember = { id: number; name: string; role: string; summary: string; focus: string; photo: string; linkedinUrl: string };

/** People for the team section, in the admin's order. Empty when the backend is not connected. */
export async function cmsTeam(): Promise<CmsTeamMember[]> {
  const data = await read<{ items: CmsTeamMember[] }>('/team', 'cms-team', { items: [] });
  return data?.items ?? [];
}

/** `srcset` for an uploaded image, so the browser downloads the smallest size that fits. */
export const srcSet = (image: CmsImage) => image.variants.map((variant) => `${variant.url} ${variant.width}w`).join(', ');
