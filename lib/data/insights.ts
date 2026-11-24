import { articles, articleBySlug } from './articles';
import { cmsPosts, type CmsImage, type CmsPostSummary } from '../cms';
import { articleLink, articlesFor, type RelatedLink } from '../related';

/**
 * One list of everything published under /insights: the guides kept in this repository and the
 * posts written in the admin panel. Pages use these helpers so both kinds are listed, linked and
 * indexed the same way.
 */
export type InsightCard = {
  slug: string; title: string; summary: string; category: string; readingTime: string; publishedAt: string; authorName: string;
  relatedServices: string[];
  /** Guides ship an SVG cover with the site; admin posts carry an uploaded image (or none). */
  cover: { kind: 'guide'; src: string; alt: string; width: number; height: number } | { kind: 'post'; image: CmsImage } | null;
};

const fromGuide = (article: (typeof articles)[number]): InsightCard => ({
  slug: article.slug, title: article.title, summary: article.summary, category: article.category, readingTime: article.readingTime,
  publishedAt: article.publishedAt, authorName: article.author.name, relatedServices: article.relatedServices,
  cover: { kind: 'guide', src: article.cover.svg, alt: article.cover.alt, width: article.cover.width, height: article.cover.height },
});

const fromPost = (post: CmsPostSummary): InsightCard => ({
  slug: post.slug, title: post.title, summary: post.excerpt, category: post.category || 'Insight', readingTime: `${post.readingMinutes} min read`,
  publishedAt: post.publishedAt, authorName: post.authorName, relatedServices: post.relatedServices,
  cover: post.cover ? { kind: 'post', image: post.cover } : null,
});

/** Admin posts that do not reuse the address of a built-in guide (the guide wins a clash). */
export async function publishedPosts(): Promise<CmsPostSummary[]> {
  return (await cmsPosts()).filter((post) => !articleBySlug[post.slug]);
}

/** Every insight, newest first. */
export async function allInsights(): Promise<InsightCard[]> {
  const posts = await publishedPosts();
  return [...posts.map(fromPost), ...articles.map(fromGuide)].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
}

/**
 * Guides and posts about the given services, best match first, as "keep exploring" links.
 * This is what makes a new post link to its service pages and those pages link back.
 */
export async function guidesFor(serviceSlugs: readonly string[], { exclude, limit = 3 }: { exclude?: string; limit?: number } = {}): Promise<RelatedLink[]> {
  const score = (related: string[]) => related.filter((slug) => serviceSlugs.includes(slug)).length * 2 + (serviceSlugs.includes(related[0]) ? 1 : 0);
  const posts = (await publishedPosts()).filter((post) => post.slug !== exclude && score(post.relatedServices) > 0)
    .map((post) => ({ score: score(post.relatedServices), date: Date.parse(post.publishedAt),
      link: { href: `/insights/${post.slug}`, title: post.title, description: post.excerpt, label: `${post.category || 'Insight'} · ${post.readingMinutes} min read` } }));
  const guides = articlesFor(serviceSlugs, { exclude, limit: articles.length })
    .map((article) => ({ score: score(article.relatedServices), date: Date.parse(article.publishedAt), link: articleLink(article) }));
  return [...posts, ...guides].sort((a, b) => b.score - a.score || b.date - a.date).slice(0, limit).map((entry) => entry.link);
}
