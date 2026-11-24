import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowDown, ArrowUpRight, Check } from 'lucide-react';
import { Eyebrow, Heading, Trail } from '@/components/ui';
import { JsonLd } from '@/components/content/json-ld';
import { services, serviceBySlug } from '@/lib/data/services';
import { serviceExtensions } from '@/lib/data/service-extensions';
import { serviceSeo } from '@/lib/data/service-seo';
import { SITE } from '@/lib/site';
import { breadcrumbs, pageMetadata } from '@/lib/seo';
import { ServiceSystemPreview } from '@/components/systems/service-system-preview';
import { ServiceStory } from '@/components/systems/service-story';
import { SERVICE_SYSTEMS } from '@/lib/data/service-systems';
import { industries } from '@/lib/data/industries';
import { allProjects } from '@/lib/data/all-projects';
import { TiltSurface } from '@/components/depth/tilt-surface';
import { RelatedLinks } from '@/components/content/related-links';
import { guidesFor } from '@/lib/data/insights';

export const dynamicParams = false;

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = serviceBySlug[slug];
  if (!service) return {};
  return pageMetadata({
    title: serviceSeo[slug].title,
    description: serviceSeo[slug].description,
    path: `/services/${slug}`,
  });
}

export default async function ServiceDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = serviceBySlug[slug];
  if (!service) notFound();
  const portfolio = await allProjects();

  const crumbs = [
    { name: 'Home', url: '/' },
    { name: 'Services', url: '/services' },
    { name: service.name, url: `/services/${slug}` },
  ];
  const extension = serviceExtensions[slug];
  const seo = serviceSeo[slug];
  const related = extension.related.map((relatedSlug) => serviceBySlug[relatedSlug]);
  const contactUrl = `/contact?service=${encodeURIComponent(slug)}`;
  const guides = await guidesFor([slug]);

  return (
    <>
      <JsonLd
        data={[
          breadcrumbs(crumbs),
          {
            '@context': 'https://schema.org',
            '@type': 'Service',
            '@id': `${SITE.url}/services/${slug}#service`,
            mainEntityOfPage: `${SITE.url}/services/${slug}`,
            name: service.name,
            description: service.description,
            serviceType: service.keyword,
            provider: { '@id': `${SITE.url}/#organization` },
            url: `${SITE.url}/services/${slug}`,
            areaServed: SITE.markets,
            isRelatedTo: related.map((item) => ({ '@id': `${SITE.url}/services/${item.slug}#service` })),
          },
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: service.faqs.map((faq) => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })),
          },
        ]}
      />

      <header className="service-detail-hero">
        <div className="container">
          <Trail items={[{ label: 'Services', href: '/services' }, { label: service.name }]} />
          <div className="service-detail-grid">
            <div className="service-detail-copy">
              <Eyebrow>Engineering discipline / {String(services.indexOf(service) + 1).padStart(2, '0')}</Eyebrow>
              <h1>{service.name}<span className="blue-text">.</span></h1>
              <p className="service-detail-lead">{service.description}</p>
              <div className="hero-buttons">
                <Link href={contactUrl} className="button">Discuss your requirements <ArrowUpRight size={18} aria-hidden="true" /></Link>
                <a href="#capabilities" className="button button-outline">Explore capabilities <ArrowDown size="1em" className="inline-icon" aria-hidden="true" /></a>
              </div>
              <p className="service-detail-principle">Scoped around your users, systems and success measures.</p>
            </div>
            <div className="service-detail-visual">
              <ServiceSystemPreview compare slug={slug} label={`${service.name} system: ${SERVICE_SYSTEMS[slug].nodes.map((node) => node.label).join(', ')}`} />
            </div>
          </div>
          <nav className="service-page-nav" aria-label="On this service page">
            <a href="#overview">Overview</a>
            <a href="#how-it-works">How it works</a>
            <a href="#capabilities">Deliverables</a>
            <a href="#applications">Applications</a>
            <a href="#questions">Questions</a>
          </nav>
        </div>
      </header>

      {/* At a glance section */}
      <section className="section section-soft" id="overview">
        <div className="container two-column">
          <div>
            <Eyebrow>At a glance</Eyebrow>
            <h2>What this service involves</h2>
            <p className="long-copy">{service.whatItIs}</p>
          </div>
          <div className="aside-panel">
            <span className="aside-label">Typically useful for</span>
            <p>{service.audience}</p>
          </div>
        </div>
      </section>

      {/* The Challenge section */}
      <section className="section container">
        <Heading eyebrow="The challenge" title="Business challenges we solve." />
        <div className="problem-grid">
          {service.problems.map((item, i) => (
            <div className="problem-item" key={item}>
              <span>{String(i + 1).padStart(2, '0')}</span>
              <h3>{item}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Specialized capabilities */}
      <section className="section section-soft" id="capabilities">
        <div className="container">
          <Heading
            eyebrow="Specialized capabilities"
            title="What's included in the work."
            description="We configure delivery around the actual project scope rather than applying every component by default."
          />
          <div className="deliverables-grid">
            {service.deliverables.map((item, i) => (
              <div className="deliverable" key={item.name}>
                <span className="service-number">/ {String(i + 1).padStart(2, '0')}</span>
                <h3>{item.name}</h3>
                <p>{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Practical applications */}
      <section className="section container" id="applications">
        <Heading
          eyebrow="Practical applications"
          title={`Where ${service.shortName} can create value.`}
          description="Illustrative use cases to help you explore fit. Actual requirements, safeguards and integrations are evaluated during scoping."
        />
        <div className="use-case-grid">
          {extension.useCases.map((item) => (
            <div className="use-case-card" key={item.name}>
              <h3>{item.name}</h3>
              <p>{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <ServiceStory slug={slug} serviceName={service.shortName} />

      {/* What success can look like */}
      <section className="section section-soft">
        <div className="container">
          <Heading eyebrow="What success can look like" title="Expected outcomes." />
          <div className="outcome-grid">
            {service.outcomes.map((outcome) => (
              <div className="outcome-item" key={outcome}>
                <Check size="1em" className="inline-icon" aria-hidden="true" />
                <p>{outcome}</p>
              </div>
            ))}
          </div>
          <p className="small-note">
            Outcomes are goals to measure, not guarantees or claims about past client results.
          </p>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="section container" id="questions">
        <Heading eyebrow="Frequently asked questions" title={`Questions about ${service.shortName}.`} />
        <div className="faq-list">
          {service.faqs.map((faq) => (
            <details key={faq.question}>
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Where this applies: industries and projects connected to this service */}
      {(() => {
        const usedBy = industries.filter((industry) => industry.related.includes(slug));
        const work = portfolio.filter((project) => project.serviceSlugs.includes(slug)).slice(0, 3);
        if (!usedBy.length && !work.length) return null;
        return <section className="section section-soft" aria-labelledby="applies-title">
          <div className="container applies">
            <div><Eyebrow>Where this applies</Eyebrow><h2 id="applies-title">Industries and projects using {service.shortName}.</h2></div>
            {usedBy.length > 0 && <ul className="applies-chips" aria-label="Industries">{usedBy.map((industry) => <li key={industry.slug}><Link href={`/industries/${industry.slug}`}>{industry.name} <ArrowUpRight size="1em" className="inline-icon" aria-hidden="true" /></Link></li>)}</ul>}
            {work.length > 0 && <ul className="applies-work" aria-label="Related projects">{work.map((project) => <li key={project.slug}><Link href={`/work/${project.slug}`}><span>{project.category}</span><b>{project.name}</b><small>{project.summary}</small></Link></li>)}</ul>}
          </div>
        </section>;
      })()}

      {/* Decision guides connected to this service */}
      <RelatedLinks id="service-guides-title" eyebrow="Learn before you invest" title="Related guides." groups={[
        { title: 'Decision guides', links: guides, allHref: '/insights', allLabel: 'All insights' },
      ]} />

      {/* Related Services */}
      <section className="section container">
        <Heading eyebrow="Explore further" title="Related services." />
        <div className="related-grid">
          {related.map((item) => (
            <TiltSurface key={item.slug} lift max={5} className="tilt-cell">
              <Link className="related-card" href={`/services/${item.slug}`}>
                <h3>{item.name}</h3>
                <span data-depth="24">View service <ArrowUpRight size="1em" className="inline-icon" aria-hidden="true" /></span>
              </Link>
            </TiltSurface>
          ))}
        </div>
      </section>

      {/* Plan the Next Step CTA */}
      <section className="section section-soft">
        <div className="container next-step-panel">
          <div>
            <Eyebrow>Plan the next step</Eyebrow>
            <h2>Discuss {service.shortName} for your business.</h2>
            <p>
              Share your current workflow, existing systems, desired outcome and timeline. We can explore what belongs in the first project phase.
            </p>
          </div>
          <Link className="button" href={contactUrl}>
            Enquire about this service <ArrowUpRight size="1em" className="inline-icon" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
