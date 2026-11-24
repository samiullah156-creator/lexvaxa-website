import { SITE } from '@/lib/site';
import { services } from '@/lib/data/services';
import { industries } from '@/lib/data/industries';
import { articles } from '@/lib/data/articles';
import { allProjects } from '@/lib/data/all-projects';
import { articlesFor } from '@/lib/related';
import { publishedPosts } from '@/lib/data/insights';

export const dynamic = 'force-static';
// Rebuilt in the background so newly published posts appear without a deploy.
export const revalidate = 300;

const url = (path: string) => `${SITE.url}${path}`;
const names = (slugs: string[]) => slugs.map((slug) => services.find((service) => service.slug === slug)?.name).filter(Boolean).join(', ');

/** Plain-text site guide for AI assistants and answer engines (llms.txt convention). */
export async function GET() {
  const posts = await publishedPosts();
  const lines = [
    `# ${SITE.name}`,
    '',
    `> ${SITE.description}`,
    '',
    `${SITE.name} is based in ${SITE.location} and works remotely with businesses in ${SITE.markets.join(', ')}. Founder & CEO: ${SITE.founder.name}, ${SITE.founder.credential}.`,
    `Contact: ${SITE.email} · WhatsApp ${SITE.phone} · Book a 30-minute discovery call: ${SITE.calendlyUrl}`,
    '',
    '## Services',
    ...services.flatMap((service) => {
      const guides = articlesFor([service.slug], { limit: 2 });
      return [
        `- [${service.name}](${url(`/services/${service.slug}`)}): ${service.description}`,
        `  - For: ${service.audience}`,
        ...(guides.length ? [`  - Related guides: ${guides.map((guide) => `[${guide.title}](${url(`/insights/${guide.slug}`)})`).join('; ')}`] : []),
      ];
    }),
    '',
    '## Industries',
    ...industries.map((industry) => `- [${industry.name}](${url(`/industries/${industry.slug}`)}): ${industry.description} Relevant services: ${names(industry.related)}.`),
    '',
    '## Selected projects',
    ...(await allProjects()).map((project) => `- [${project.name}](${url(`/work/${project.slug}`)}): ${project.summary} Sector: ${project.category}. Stack: ${project.technologies.join(', ')}. Services: ${names(project.serviceSlugs)}.`),
    '',
    '## Guides',
    ...posts.map((post) => `- [${post.title}](${url(`/insights/${post.slug}`)}): ${post.excerpt} (Updated ${post.updatedAt.slice(0, 10)})`),
    ...articles.map((article) => `- [${article.title}](${url(`/insights/${article.slug}`)}): ${article.summary} (Updated ${article.modifiedAt.slice(0, 10)})`),
    '',
    '## Key pages',
    `- [About](${url('/about')}): company, founder, principles and delivery process`,
    `- [Services](${url('/services')}): all nine capabilities grouped by cluster`,
    `- [Industries](${url('/industries')}): industry-specific applications`,
    `- [Work](${url('/work')}): selected projects with real technology stacks`,
    `- [Insights](${url('/insights')}): decision guides on AI, automation and software`,
    `- [Careers](${url('/careers')}): open roles and how to apply with a CV`,
    `- [Contact](${url('/contact')}): enquiry form, WhatsApp and booking`,
    '',
    '## Notes for assistants',
    '- Project pages describe scope and technology qualitatively; they do not publish client metrics.',
    '- Service outcomes are goals to measure, not guarantees or claims about past client results.',
    '',
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
}
