import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { ProjectCard } from '@/components/sections/project-card';
import { ProjectGrid } from '@/components/sections/project-grid';
import { JsonLd } from '@/components/content/json-ld';
import { CallToAction, Eyebrow, Heading, Trail } from '@/components/ui';
import { allProjects, type AnyProject } from '@/lib/data/all-projects';
import { PROJECT_TRACKS } from '@/lib/data/projects';
import { services } from '@/lib/data/services';
import { breadcrumbs, collectionSchema, pageMetadata } from '@/lib/seo';
import { ProcessScene } from '@/components/depth/process-scene';
import { HubLinks } from '@/components/content/related-links';
import { FaqSection, type Faq } from '@/components/content/faq-section';
import styles from './work.module.css';

// Everything on this page is counted from the published projects in the admin, so it stays true as projects change.
function portfolioFacts(projects: readonly AnyProject[]) {
  const technologyTally = [...projects.flatMap((project) => project.technologies)
    .reduce((tally, name) => tally.set(name, (tally.get(name) ?? 0) + 1), new Map<string, number>())]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const byService = services.map((service) => ({ service, projects: projects.filter((project) => project.serviceSlugs.includes(service.slug)) }))
    .filter((entry) => entry.projects.length > 0);
  const faqs: Faq[] = [
    { question: 'Can we see these projects running?', answer: `Where a public version exists, the project page links to its live demo. Every project page shows the interface, the main features and the technology stack.` },
    ...staticFaqs,
  ];
  return { technologyTally, byService, faqs };
}

const staticFaqs: Faq[] = [
  { question: 'Why are there no client metrics on the project pages?', answer: 'Project pages describe what was built and how. We do not publish performance figures unless they can be verified publicly, so you will not find invented percentages here.' },
  { question: 'What is a solution blueprint?', answer: 'Projects marked "Solution blueprint" are not client case studies. They show the system design we start from for common automation and AI work, with an interface preview we designed, so you can see how such a system would work before we adapt it to your tools and data.' },
  { question: 'Can Lexvaxa build something similar for us?', answer: 'Yes. Tell us about your users, your workflows and the systems you already run. Similar work starts with a discovery conversation, and the scope is agreed before any build begins.' },
];

export const metadata: Metadata = pageMetadata({
  title: 'Portfolio: AI, Software & Web Development Projects',
  description: 'Lexvaxa portfolio of AI agents, automation, custom software, SaaS and web development projects, with live demos and the technology stack behind each one.',
  path: '/work',
});

const method = [
  { number: '01 / DISCOVER', render: 'discover', title: 'Process mapping', description: 'Identify triggers, actors, business rules, edge cases, data sources and acceptable outcomes.' },
  { number: '02 / DESIGN', render: 'design', title: 'System boundaries', description: 'Choose what is deterministic, where AI can assist and which decisions require approval.' },
  { number: '03 / DELIVER', render: 'build', title: 'Incremental validation', description: 'Test against realistic inputs, exceptions and permission failures before production rollout.' },
];

export default async function Work() {
  const projects = await allProjects();
  const { technologyTally, byService, faqs } = portfolioFacts(projects);
  return (
    <>
      <JsonLd data={[breadcrumbs([{ name: 'Home', url: '/' }, { name: 'Selected projects', url: '/work' }]), collectionSchema({ name: 'Lexvaxa selected projects', description: 'Platforms, tools and products delivered by Lexvaxa.', path: '/work', items: projects.map((p) => ({ name: p.name, url: `/work/${p.slug}` })) })]} />
      <header className={`page-hero container ${styles.pageHeader}`}>
        <Trail items={[{ label: 'Selected projects' }]} />
        <div className={styles.headerLayout}>
          <div>
            <Eyebrow>Selected work</Eyebrow>
            <h1>Selected <span>projects.</span></h1>
            <p className={styles.introduction}>AI systems, custom software and websites delivered for clients worldwide. Filter by service, then open any project to see its features, live demo and technology stack.</p>
          </div>
          <div className={styles.portfolioFacts}>
            <p>What we build</p>
            <ul>{PROJECT_TRACKS.map((track) => <li key={track.id}>{track.label}</li>)}<li>SaaS products</li></ul>
          </div>
        </div>
      </header>

      <section id="project-portfolio" className={styles.portfolio} aria-label="Project portfolio">
        <div className="container">
          <ProjectGrid
            filters={byService.map(({ service, projects: matching }) => ({ slug: service.slug, label: service.shortName, count: matching.length }))}
            items={projects.map((project) => ({ slug: project.slug, services: project.serviceSlugs }))}>
            {projects.map((project) => <ProjectCard key={project.slug} project={project} headingLevel={2} />)}
          </ProjectGrid>
        </div>
      </section>

      <section id="engineering-approach" className={styles.methodSection} aria-labelledby="work-method-title">
        <div className="container">
          <div className={styles.sectionHeading}>
            <Eyebrow>Our engineering approach</Eyebrow>
            <h2 id="work-method-title">Our engineering approach.</h2>
            <p>Architecture, data handling, approval paths and maintainability matter just as much as the final interface.</p>
          </div>
          <ol className={styles.methodGrid}>
            {method.map((step) => (
              <li key={step.number}><ProcessScene className={styles.methodRender} name={step.render} /><span>{step.number}</span><h3>{step.title}</h3><p>{step.description}</p></li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section container" aria-labelledby="work-stack-title">
        <Heading id="work-stack-title" eyebrow="Across the portfolio" title="Technology stack." description={`Counted from the ${projects.length} projects above. Each project page lists its own stack in full.`} />
        <ul className="tech-tally" aria-label="Technologies and the number of projects that use each">
          {technologyTally.map(([name, count]) => <li key={name}><b>{name}</b><span>{count} {count === 1 ? 'project' : 'projects'}</span></li>)}
        </ul>
      </section>

      <section className="section section-soft" aria-labelledby="work-services-title"><div className="container">
        <Heading id="work-services-title" eyebrow="Projects by service" title="Projects by service." />
        <div className="fit-table-wrap"><table className="fit-table fit-table-wide">
          <caption className="sr-only">Services and the projects that used them</caption>
          <thead><tr><th scope="col">Service</th><th scope="col">Projects</th></tr></thead>
          <tbody>{byService.map(({ service, projects }) => <tr key={service.slug}>
            <th scope="row" data-label="Service"><Link href={`/services/${service.slug}`}>{service.shortName} <ArrowUpRight size="1em" className="inline-icon" aria-hidden="true" /></Link></th>
            <td data-label="Projects"><ul className="applies-chips">{projects.map((project) => <li key={project.slug}><Link href={`/work/${project.slug}`}>{project.name}</Link></li>)}</ul></td>
          </tr>)}</tbody>
        </table></div>
      </div></section>

      <FaqSection id="work-faq-title" title="Frequently asked questions." faqs={faqs} />

      <div className={`container ${styles.serviceLink}`}><p>Have a different product in mind?</p><Link href="/services">Explore our capabilities<ArrowRight size={17} aria-hidden="true" /></Link></div>
      <HubLinks current="/work" />
      <CallToAction title="Start your project with Lexvaxa." />
    </>
  );
}
