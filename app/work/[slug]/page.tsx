import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check } from 'lucide-react';
import { CdnImage } from '@/components/content/cdn-image';
import { CaseTour } from '@/components/depth/case-tour';
import { JsonLd } from '@/components/content/json-ld';
import { CallToAction, Eyebrow, Trail } from '@/components/ui';
import { ProjectTechStack } from '@/components/content/project-tech-stack';
import { allProjects, findProject } from '@/lib/data/all-projects';
import { services } from '@/lib/data/services';
import { breadcrumbs, pageMetadata } from '@/lib/seo';
import { SITE } from '@/lib/site';
import { DeviceFrame3D } from '@/components/depth/device-frame-3d';
import { StackTower3D } from '@/components/depth/stack-tower-3d';
import { projectLayers } from '@/lib/data/project-stack';
import { ProjectWalkthrough } from '@/components/depth/project-walkthrough';
import { ChallengeSolution } from '@/components/depth/challenge-solution';
import { RelatedLinks } from '@/components/content/related-links';
import { industriesFor, industryLink, projectLink, projectsFor } from '@/lib/related';
import { guidesFor } from '@/lib/data/insights';
import { RoiEstimator } from '@/components/depth/roi-estimator';
import { roiFor } from '@/lib/roi';
import { projectTracks } from '@/lib/data/projects';
import { deliverySteps } from '@/lib/data/delivery';
import styles from './project-detail.module.css';

type ProjectPageProps = { params: Promise<{ slug: string }> };

// Projects published later from the admin are rendered on first visit, then cached.
export const dynamicParams = true;

export async function generateStaticParams() {
  return (await allProjects()).map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await findProject(slug);
  if (!project) notFound();

  return pageMetadata({
    title: project.seoTitle || `${project.name}: ${project.category} Project`,
    description: project.seoDescription || project.summary,
    path: `/work/${project.slug}`,
    image: { url: project.image.src, width: project.image.width, height: project.image.height, alt: project.image.alt },
  });
}

export default async function ProjectDetail({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await findProject(slug);
  if (!project) notFound();
  const portfolio = await allProjects();
  const roi = roiFor(project, projectTracks(project));
  const relatedServices = services.filter((service) => project.serviceSlugs.includes(service.slug));
  const projectIndex = portfolio.findIndex((item) => item.slug === project.slug);
  const nextProject = portfolio[(projectIndex + 1) % portfolio.length];
  const previousProject = portfolio[(projectIndex - 1 + portfolio.length) % portfolio.length];
  const canonical = new URL(`/work/${project.slug}`, SITE.url).toString();
  const guides = await guidesFor(project.serviceSlugs);
  const list = (items: string[]) => items.length > 1 ? `${items.slice(0, -1).join(', ')} and ${items.at(-1)}` : items[0] ?? '';
  // Every answer restates published project facts; nothing here adds metrics or claims.
  const faqs = [
    { question: `What is ${project.name}?`, answer: project.overview },
    { question: project.blueprint ? `What problem does ${project.name} solve?` : `What problem did ${project.name} address?`, answer: `${project.challenge} ${project.solution}` },
    ...(project.blueprint ? [{ question: `Is ${project.name} a client project?`, answer: `No. It is a solution blueprint: the system design Lexvaxa starts from for this kind of project, shown with an interface preview designed by Lexvaxa. Each build is adapted to the client's own tools, data and rules.` }] : []),
    { question: `Which technologies power ${project.name}?`, answer: `${project.name} is built with ${list(project.technologies)}.` },
    { question: `What are the main features of ${project.name}?`, answer: `${list(project.features)}.` },
    ...(project.liveUrl ? [{ question: `Can I see ${project.name} live?`, answer: `Yes. A public version is available at ${new URL(project.liveUrl).host}.` }] : []),
    { question: `Can Lexvaxa build a similar ${project.discipline.toLowerCase()}?`, answer: `Yes. Similar work draws on ${list(relatedServices.map((service) => service.name))}. Scope, integrations and timeline are agreed after a discovery conversation about your users and existing systems.` },
  ];

  return (
    <>
      <JsonLd data={breadcrumbs([{ name: 'Home', url: '/' }, { name: 'Selected projects', url: '/work' }, { name: project.name, url: `/work/${project.slug}` }])} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'CreativeWork',
        '@id': `${canonical}#project`,
        url: canonical,
        name: project.name,
        description: project.summary,
        image: new URL(project.image.src, SITE.url).toString(),
        creator: { '@id': `${SITE.url}/#organization` },
        genre: project.category,
        keywords: project.technologies.join(', '),
        isPartOf: { '@id': `${new URL('/work', SITE.url).toString()}#collection` },
        about: relatedServices.map((service) => ({ '@type': 'Service', name: service.name, url: new URL(`/services/${service.slug}`, SITE.url).toString() })),
        ...(project.liveUrl ? { sameAs: project.liveUrl } : {}),
      }} />
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map((faq) => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })) }} />
      <header className={`container ${styles.header}`}>
        <Trail items={[{ label: 'Selected projects', href: '/work' }, { label: project.name }]} />
        <div className={styles.projectMeta}><span className={styles.category}>{project.category}</span><span>{project.discipline}</span>{project.blueprint && <span className={styles.blueprint}>Solution blueprint</span>}</div>
        <h1>{project.name}<span className={styles.titleDot}>.</span></h1>
        <p className={styles.summary}>{project.summary}</p>
        {project.blueprint && <p className={styles.blueprintNote}>A solution blueprint: the system design we start from for this kind of project, shown with an interface preview we designed. We adapt it to your tools, data and rules.</p>}
        <div className={styles.headerActions}>
          {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className={`button ${styles.primaryAction}`} aria-label={`View ${project.name} live demo (opens in a new tab)`}>View live demo<ArrowUpRight size={17} aria-hidden="true" /></a>}
          <Link href="/contact" className={project.liveUrl ? styles.secondaryAction : `button ${styles.primaryAction}`}>Discuss a similar project<ArrowRight size={17} aria-hidden="true" /></Link>
        </div>
      </header>

      <div className="container">
        <figure className={styles.imageFrame}>
          <DeviceFrame3D image={project.image} priority chips={project.technologies.slice(0, 3)}
            address={project.liveUrl ? new URL(project.liveUrl).host : `lexvaxa.com/work/${project.slug}`}
            sizes="(max-width: 580px) calc(100vw - 38px), (max-width: 1220px) calc(100vw - 60px), 1160px" />
          <figcaption><span>{project.blueprint ? 'Designed interface preview' : 'Interface preview'}</span><span>{project.discipline}</span></figcaption>
        </figure>
        {project.walkthrough && project.walkthrough.length > 0 && <CaseTour name={project.name} image={project.image} steps={project.walkthrough} />}
        <ProjectTechStack id="project-tech-stack" projectName={project.name} technologies={project.technologies} />
        {!project.walkthrough?.length && <ProjectWalkthrough name={project.name} technologies={project.technologies} features={project.features} image={project.image} />}
      </div>

      <div className={`container ${styles.detailLayout}`}>
        <article className={styles.article}>
          <section aria-labelledby="project-overview-title">
            <Eyebrow>Project overview</Eyebrow>
            <h2 id="project-overview-title">A closer look at the experience<span className={styles.titleDot}>.</span></h2>
            <p>{project.overview}</p>
            <ChallengeSolution challenge={project.challenge} solution={project.solution} />
          </section>
          <section className={styles.capabilities} aria-labelledby="project-features-title">
            <Eyebrow>What it does</Eyebrow>
            <h2 id="project-features-title">{project.blueprint ? 'What the system handles' : 'What we delivered'}<span className={styles.titleDot}>.</span></h2>
            <ul>{project.features.map((feature, index) => <li key={feature}><span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><b>{feature}</b></li>)}</ul>
          </section>
          <section className={styles.delivery} aria-labelledby="project-delivery-title">
            <Eyebrow>How it gets built</Eyebrow>
            <h2 id="project-delivery-title">{project.blueprint ? 'From blueprint to your system' : 'How the work ran'}<span className={styles.titleDot}>.</span></h2>
            <ol>{deliverySteps.map((step) => <li key={step.number}><span aria-hidden="true">{step.number}</span><div><b>{step.title}</b><p>{step.description}</p><small>{step.output}</small></div></li>)}</ol>
          </section>
          {project.results && project.results.length > 0 && <section className={styles.results} aria-labelledby="project-results-title">
            <Eyebrow>The result</Eyebrow>
            <h2 id="project-results-title">What the client gained<span className={styles.titleDot}>.</span></h2>
            <ul>{project.results.map((result) => <li key={result}><span aria-hidden="true"><Check size={15} strokeWidth={2.6} /></span>{result}</li>)}</ul>
          </section>}
        </article>

        <aside className={styles.aside} aria-label="Project details">
          <section className={styles.facts} aria-labelledby="project-details-title">
            <h2 id="project-details-title">Project details</h2>
            <dl><div><dt>Sector</dt><dd>{project.category}</dd></div><div><dt>Project type</dt><dd>{project.discipline}</dd></div></dl>
            <StackTower3D layers={projectLayers(project.technologies)} projectName={project.name} />
            <a href="#project-tech-stack" className={styles.textLink}>Explore the technology stack<ArrowUpRight size={15} aria-hidden="true" /></a>
          </section>
          <section className={styles.enquiry} aria-labelledby="project-enquiry-title">
            <p className={styles.smallLabel}>Start a conversation</p><h2 id="project-enquiry-title">Planning something similar?</h2>
            <p>Tell us about your users, workflows and existing systems.</p>
            <Link href="/contact" className={styles.textLink}>Discuss your project<ArrowRight size={16} aria-hidden="true" /></Link>
          </section>
        </aside>
      </div>

      <div className="container"><RoiEstimator preset={roi} context="your team" /></div>

      {project.gallery && project.gallery.length > 0 && <section className={`container ${styles.gallery}`} aria-labelledby="project-gallery-title">
        <div className={styles.relatedHeading}><Eyebrow>Project visuals</Eyebrow><h2 id="project-gallery-title">How it works, at a glance<span className={styles.titleDot}>.</span></h2></div>
        <div className={styles.galleryGrid}>{project.gallery.map((image) => <figure key={image.src}>
          <CdnImage src={image.src} alt={image.alt} width={image.width} height={image.height} sizes="(max-width: 860px) calc(100vw - 32px), 580px" loading="lazy" />
          <figcaption>{image.alt}</figcaption>
        </figure>)}</div>
      </section>}

      {relatedServices.length > 0 && <section className={`container ${styles.related}`} aria-labelledby="project-services-title">
        <div className={styles.relatedHeading}><Eyebrow>Related capabilities</Eyebrow><h2 id="project-services-title">Explore the engineering behind it<span className={styles.titleDot}>.</span></h2></div>
        <nav className={styles.capabilityGrid} aria-label="Related services">
          {relatedServices.map((service, index) => <Link key={service.slug} href={`/services/${service.slug}`} className={styles.capability}>
            <div><span className={styles.capabilityNumber} aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><ArrowUpRight size={20} aria-hidden="true" /></div>
            <h3>{service.name}</h3><p>{service.description}</p><span className={styles.capabilityLink}>Explore service<ArrowRight size={16} aria-hidden="true" /></span>
          </Link>)}
        </nav>
      </section>}

      <section className="section section-soft" aria-labelledby="project-faq-title"><div className="container faq-layout">
        <div><Eyebrow>Project questions</Eyebrow><h2 id="project-faq-title">{project.name} at a glance.</h2></div>
        <div className="faq-list">{faqs.map((faq) => <details key={faq.question}><summary>{faq.question}<span aria-hidden="true">+</span></summary><p>{faq.answer}</p></details>)}</div>
      </div></section>

      <RelatedLinks id="project-related-title" title="Related industries, guides and projects." groups={[
        { title: 'Industries', links: industriesFor(project.serviceSlugs, { project: project.slug }).map(industryLink), allHref: '/industries', allLabel: 'All industries' },
        { title: 'Decision guides', links: guides, allHref: '/insights', allLabel: 'All insights' },
        { title: 'Similar projects', links: projectsFor(portfolio, project.serviceSlugs, { exclude: project.slug }).map(projectLink), allHref: '/work', allLabel: 'All projects' },
      ]} />

      <nav className={`container ${styles.projectNavigation}`} aria-label="Project navigation">
        <div className={styles.navLinks}>
          <Link href="/work" className={styles.backLink}><ArrowLeft size={17} aria-hidden="true" />Back to all projects</Link>
          <Link href={`/work/${previousProject.slug}`} className={styles.backLink}><ArrowLeft size={17} aria-hidden="true" /><span>Previous: {previousProject.name}</span></Link>
        </div>
        <Link href={`/work/${nextProject.slug}`} className={styles.nextProject}>
          <div><span>Next project</span><h2>{nextProject.name}</h2><p>{nextProject.category}</p></div>
          <ArrowRight size={24} aria-hidden="true" />
        </Link>
      </nav>
      <CallToAction title="Have a related project in mind?" />
    </>
  );
}
