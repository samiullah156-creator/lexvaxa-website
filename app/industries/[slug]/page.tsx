import type { Metadata } from 'next';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Eyebrow, Heading, CallToAction, Trail } from '@/components/ui';
import { JsonLd } from '@/components/content/json-ld';
import { industries, industryBySlug } from '@/lib/data/industries';
import { industryDetails } from '@/lib/data/industry-details';
import { industrySystems } from '@/lib/data/industry-systems';
import { IndustrySystems } from '@/components/depth/industry-systems';
import { IndustryPains } from '@/components/depth/industry-pains';
import { industryPains } from '@/lib/data/industry-pains';
import { RoiEstimator } from '@/components/depth/roi-estimator';
import { industryRoi } from '@/lib/roi';
import { serviceBySlug } from '@/lib/data/services';
import { breadcrumbs, pageMetadata } from '@/lib/seo';
import { SITE } from '@/lib/site';
import { IndustryScene } from '@/components/steel/industry-scenes';
import { IndustryFlow } from '@/components/depth/industry-flow';
import { ServiceBadge } from '@/components/depth/service-badge';
import { TiltSurface } from '@/components/depth/tilt-surface';
import { AnimatedContainer } from '@/components/animations/animated-container';
import { RelatedLinks } from '@/components/content/related-links';
import { projectLink, projectsFor } from '@/lib/related';
import { allProjects } from '@/lib/data/all-projects';
import { guidesFor } from '@/lib/data/insights';
import { industryBuilds, industryTools } from '@/lib/data/industry-tools';
import { IndustryTools } from '@/components/sections/industry-tools';
import { EngineeringStack } from '@/components/sections/engineering-stack';

export const dynamicParams = false;
export function generateStaticParams() { return industries.map((industry) => ({ slug: industry.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const industry = industryBySlug[slug];
  if (!industry) return {};
  return pageMetadata({ title: `AI & Automation for ${industry.name}`, description: industry.description, path: `/industries/${slug}` });
}

const reveal = { trigger: 'viewport' as const, once: true, distance: 14, stiffness: 240, damping: 28 };

export default async function IndustryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const industry = industryBySlug[slug];
  if (!industry) notFound();
  const detail = industryDetails[slug];
  const [guides, portfolio] = await Promise.all([guidesFor(industry.related), allProjects()]);
  const url = `${SITE.url}/industries/${slug}`;
  const faqSchema = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: detail.faqs.map((faq) => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })) };
  const pageSchema = { '@context': 'https://schema.org', '@type': 'WebPage', name: `AI & Automation for ${industry.name}`, url, description: industry.description, about: industry.name, provider: { '@type': 'Organization', name: SITE.name, url: SITE.url } };
  return <>
    <JsonLd data={breadcrumbs([{ name: 'Home', url: '/' }, { name: 'Industries', url: '/industries' }, { name: industry.name, url: `/industries/${slug}` }])} />
    <JsonLd data={pageSchema} />
    <JsonLd data={faqSchema} />

    <header className="container industry-hero">
      <div>
        <Trail items={[{ label: 'Industries', href: '/industries' }, { label: industry.name }]} />
        <Eyebrow>Industry applications</Eyebrow>
        <h1>AI &amp; automation for {industry.name}<span className="purple-text">.</span></h1>
        <p className="industry-answer">{detail.answer}</p>
        <div className="industry-hero-actions"><Link href="/contact" className="button">Talk through your workflow <ArrowUpRight size="1em" className="inline-icon" aria-hidden="true" /></Link><a href="#use-cases" className="button button-outline">See use cases <ArrowDown size="1em" className="inline-icon" aria-hidden="true" /></a></div>
      </div>
      <div className="industry-side">
        <div className="industry-visual"><IndustryScene slug={slug} id={`page-${slug}`} /></div>
        <IndustryFlow flow={detail.flow} systems={detail.systems} label={industry.name} />
      </div>
    </header>

    <section className="section section-soft" id="use-cases" aria-labelledby="use-cases-title"><div className="container">
      <Heading id="use-cases-title" eyebrow="Use cases" title={`Practical AI use cases for ${industry.name}.`} description="Example solution types we design and build. Each one is scoped around your systems, people and obligations." />
      <div className="usecase-grid">{detail.useCases.map((useCase, index) => <AnimatedContainer key={useCase.title} {...reveal} delay={index * 0.05} as="article" className="usecase-card">
        <><span className="usecase-number">{String(index + 1).padStart(2, '0')}</span><h3>{useCase.title}</h3><p>{useCase.text}</p></>
      </AnimatedContainer>)}</div>
    </div></section>

    <IndustryTools groups={industryTools[slug]} builds={industryBuilds[slug]} label={industry.name} />
    {slug === 'saas-technology' && <EngineeringStack id="saas-engineering-title" />}

    <section className="section section-soft" id="systems" aria-labelledby="systems-title"><div className="container">
      <Heading id="systems-title" eyebrow="Solutions" title="Systems we build for this sector." description={`The systems we are asked for most in ${industry.name}. Each one removes a specific pain point and connects to the tools you already use.`} />
      <IndustrySystems data={industrySystems[slug]} label={industry.name} />
      <IndustryPains pains={industryPains[slug]} label={industry.name} />
      {industryRoi[slug] && <RoiEstimator preset={industryRoi[slug]} context="your team" headingLevel={3} />}
    </div></section>

    <section className="section" aria-labelledby="related-title"><div className="container">
      <Heading id="related-title" eyebrow="Related expertise" title="Related services." />
      <div className="related-grid">{industry.related.map((related) => { const service = serviceBySlug[related]; return <TiltSurface key={service.slug} lift max={5} className="tilt-cell">
        <Link href={`/services/${service.slug}`} className="related-card related-card-icon"><ServiceBadge slug={service.slug} /><h3>{service.name}</h3><span data-depth="24">Explore service <ArrowUpRight size="1em" className="inline-icon" aria-hidden="true" /></span></Link>
      </TiltSurface>; })}</div>
    </div></section>

    <RelatedLinks id="industry-related-title" eyebrow="See it in practice" title="Related projects and guides." groups={[
      { title: 'Related projects', links: projectsFor(portfolio, industry.related, { industry: slug }).map(projectLink), allHref: '/work', allLabel: 'All projects' },
      { title: 'Decision guides', links: guides, allHref: '/insights', allLabel: 'All insights' },
    ]} />

    <section className="section section-soft" aria-labelledby="industry-faq-title"><div className="container faq-layout">
      <div><Eyebrow>Common questions</Eyebrow><h2 id="industry-faq-title">{industry.name}: frequently asked questions.</h2></div>
      <div className="faq-list">{detail.faqs.map((faq) => <details key={faq.question}><summary>{faq.question}<span aria-hidden="true">+</span></summary><p>{faq.answer}</p></details>)}</div>
    </div></section>

    <section className="section container" aria-labelledby="other-industries"><Eyebrow>Other industries</Eyebrow><h2 id="other-industries" className="mid-heading">Explore related sectors.</h2><ul className="applies-chips">{industries.filter((item) => item.slug !== slug).map((item) => <li key={item.slug}><Link href={`/industries/${item.slug}`}>{item.name} <ArrowUpRight size="1em" className="inline-icon" aria-hidden="true" /></Link></li>)}</ul></section>
    <CallToAction title={`Let's map your ${industry.name} use case.`} />
  </>;
}
