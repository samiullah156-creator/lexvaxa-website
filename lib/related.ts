import { articles, type Article } from './data/articles';
import { industries, type Industry } from './data/industries';
import type { Project } from './data/projects';
import { services, type Service } from './data/services';

/**
 * Cross-links between services, projects, guides and industries.
 * Everything is derived from the service tags each record already carries, so a
 * new guide or project joins the internal-link graph without hand-written links.
 */

/** Sector a published project actually served; only set where the domain is unambiguous. */
const PROJECT_INDUSTRY: Record<string, string> = {
  'saff-hospital-management': 'healthcare-operations',
  'learning-hub': 'education-elearning',
  genaix: 'saas-technology',
  'exect-services': 'marketing-creative-agencies',
  'exect-media-kit': 'marketing-creative-agencies',
  'magic-wal-kit': 'saas-technology',
};

export type RelatedLink = { href: string; title: string; description: string; label: string };

const overlap = (a: readonly string[], b: readonly string[]) => a.filter((item) => b.includes(item)).length;

/** Stable ranking: higher score first, then the record's original order (or `order`, when given). */
function rank<T>(items: T[], score: (item: T) => number, limit: number, order: (index: number) => number = (index) => index) {
  return items
    .map((item, index) => ({ item, index: order(index), score: score(item) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map((entry) => entry.item);
}

export function articlesFor(serviceSlugs: readonly string[], { exclude, limit = 3 }: { exclude?: string; limit?: number } = {}) {
  // The primary service of a guide (its first tag) weighs more than secondary mentions.
  return rank(articles.filter((article) => article.slug !== exclude),
    (article) => overlap(article.relatedServices, serviceSlugs) * 2 + (serviceSlugs.includes(article.relatedServices[0]) ? 1 : 0), limit);
}

/**
 * Projects (pass the CMS portfolio from allProjects()) ranked by shared services.
 * With `exclude` (a project page), ties go to the projects that follow it in the portfolio, wrapping
 * round, so every project page links to different neighbours and no project is left with no links.
 */
export function projectsFor<T extends Project>(projects: readonly T[], serviceSlugs: readonly string[], { exclude, industry, limit = 3 }: { exclude?: string; industry?: string; limit?: number } = {}) {
  const anchor = exclude ? projects.findIndex((project) => project.slug === exclude) : -1;
  const others = projects.filter((project) => project.slug !== exclude);
  const order = anchor < 0 ? undefined : (index: number) => (index - anchor + others.length) % others.length;
  return rank(others,
    (project) => overlap(project.serviceSlugs, serviceSlugs) + (industry && PROJECT_INDUSTRY[project.slug] === industry ? 3 : 0), limit, order);
}

export function industriesFor(serviceSlugs: readonly string[], { exclude, project, limit = 3 }: { exclude?: string; project?: string; limit?: number } = {}) {
  return rank(industries.filter((industry) => industry.slug !== exclude),
    (industry) => overlap(industry.related, serviceSlugs) + (project && PROJECT_INDUSTRY[project] === industry.slug ? 3 : 0), limit);
}

export function servicesFor(serviceSlugs: readonly string[], limit = 3) {
  return serviceSlugs.map((slug) => services.find((service) => service.slug === slug)).filter((service): service is Service => Boolean(service)).slice(0, limit);
}

export const articleLink = (article: Article): RelatedLink => ({ href: `/insights/${article.slug}`, title: article.title, description: article.summary, label: `${article.category} guide · ${article.readingTime}` });
export const projectLink = (project: Project): RelatedLink => ({ href: `/work/${project.slug}`, title: project.name, description: project.summary, label: `${project.category} · ${project.discipline}` });
export const industryLink = (industry: Industry): RelatedLink => ({ href: `/industries/${industry.slug}`, title: industry.name, description: industry.description, label: 'Industry applications' });
export const serviceLink = (service: Service): RelatedLink => ({ href: `/services/${service.slug}`, title: service.name, description: service.blurb, label: 'Service' });

/** Top-level hubs, so every section page points readers (and crawlers) to the others. */
export const HUBS: RelatedLink[] = [
  { href: '/services', title: 'Services', description: 'Nine capabilities across AI, automation, software and search.', label: 'What we do' },
  { href: '/industries', title: 'Industries', description: 'How the same capabilities adapt to ten operating environments.', label: 'Where it applies' },
  { href: '/work', title: 'Selected projects', description: 'Shipped platforms, tools and products with their real stacks.', label: 'Our work' },
  { href: '/insights', title: 'Insights', description: 'Decision guides on agents, RAG, voice AI, CRM and AI search.', label: 'Guides' },
  { href: '/about', title: 'About Lexvaxa', description: 'The team, principles and delivery process behind the work.', label: 'Who we are' },
];
