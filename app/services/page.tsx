import type { Metadata } from 'next';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { ProcessScene } from '@/components/depth/process-scene';
import Link from 'next/link';
import { CallToAction, Eyebrow, Heading, Trail } from '@/components/ui';
import { services } from '@/lib/data/services';
import { deliverySteps } from '@/lib/data/delivery';
import { breadcrumbs, collectionSchema, pageMetadata } from '@/lib/seo';
import { mapServices } from '@/lib/data/service-map';
import { ServiceMap3D } from '@/components/depth/service-map-3d';
import { TiltSurface } from '@/components/depth/tilt-surface';
import { JsonLd } from '@/components/content/json-ld';
import { HubLinks } from '@/components/content/related-links';
import { FaqSection, type Faq } from '@/components/content/faq-section';
import { EngineeringStack } from '@/components/sections/engineering-stack';

export const metadata: Metadata = pageMetadata({
  title: 'AI Development & Software Engineering Services',
  description: 'AI agent development, generative AI, voice AI, RAG, custom software, SaaS, CRM automation, AI search optimization and digital marketing services.',
  path: '/services',
});

const faqs: Faq[] = [
  { question: 'Can several services be combined in one project?', answer: 'Yes. The services describe capabilities, not separate products. An automation project may also need a CRM integration and a small custom interface; we scope that as one piece of work with one team.' },
  { question: 'Do we need to replace the software we already use?', answer: 'Usually not. We scope integrations around your current systems first. Whether a connection is feasible depends on API access, data quality, permissions and the vendor.' },
  { question: 'How do you decide between AI and conventional software?', answer: 'By the task. Fixed, predictable rules are better served by conventional software or a workflow. We add an AI component only where interpretation, classification or flexible language adds clear value, and a person stays in control of consequential decisions.' },
  { question: 'What do we have at the end of a project?', answer: 'Working software, plus the documentation, tests and ownership notes your team needs to run and change it. Handover is part of the project, not an extra.' },
  { question: 'How does a project start?', answer: 'With a conversation about the business goal, the systems involved, who will use the result and any timeline or budget limits. From that we suggest what a sensible first phase would include.' },
];

export default function ServicesPage() { return <>
  <JsonLd data={[breadcrumbs([{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }]), collectionSchema({ name: 'Lexvaxa services', description: 'Software development, AI and automation services.', path: '/services', items: services.map((s) => ({ name: s.name, url: `/services/${s.slug}` })) })]} />
  <div className="page-hero container map-hero"><div><Trail items={[{ label: 'Services' }]} /><Eyebrow>What we do</Eyebrow><h1>AI and software<br /><span className="blue-text">development services.</span></h1><p>Nine services across AI, software engineering and growth. Engage one on its own or combine several into a single end-to-end solution.</p></div>
    <ServiceMap3D services={mapServices} label="Nine capabilities in three clusters. Hover or focus a block to see its connections; select it to open the service." /></div>
  <section className="section container"><Eyebrow>Engineering & systems</Eyebrow><h2 className="mid-heading">Software, AI & business automation</h2><div className="services-grid">{services.slice(0,7).map((s, index) => <TiltSurface key={s.slug} lift max={5} className="tilt-cell"><Link className="service-card" href={`/services/${s.slug}`}><div className="service-card-top"><span className="service-number" data-depth="24">{String(index+1).padStart(2,'0')}</span><span className="service-arrow" data-depth="36"><ArrowUpRight size="1em" className="inline-icon" aria-hidden="true" /></span></div><h2>{s.name}</h2><p>{s.description}</p><span className="card-link">See capabilities <ArrowRight size="1em" className="inline-icon" aria-hidden="true" /></span></Link></TiltSurface>)}</div></section>
  <section className="section section-soft"><div className="container"><Eyebrow>Growth & discoverability</Eyebrow><h2 className="mid-heading">Search visibility & digital marketing</h2><div className="services-grid">{services.slice(7).map((s, index) => <TiltSurface key={s.slug} lift max={5} className="tilt-cell"><Link className="service-card" href={`/services/${s.slug}`}><div className="service-card-top"><span className="service-number" data-depth="24">{String(index+8).padStart(2,'0')}</span><span className="service-arrow" data-depth="36"><ArrowUpRight size="1em" className="inline-icon" aria-hidden="true" /></span></div><h2>{s.name}</h2><p>{s.description}</p><span className="card-link">See capabilities <ArrowRight size="1em" className="inline-icon" aria-hidden="true" /></span></Link></TiltSurface>)}</div></div></section>
  <EngineeringStack />

  <section className="section section-soft" aria-labelledby="engagement-title"><div className="container">
    <Heading id="engagement-title" eyebrow="How an engagement runs" title="Our delivery process." description="Four stages, each ending with a deliverable you review and approve." />
    <ol className="approach-steps">{deliverySteps.map((step) => <li key={step.number}>
      <ProcessScene className="approach-render" name={step.render} />
      <span>{step.number}</span><h3>{step.title}</h3><p>{step.description}</p><p className="approach-output">You receive: <b>{step.output}</b></p>
    </li>)}</ol>
  </div></section>

  <FaqSection id="services-faq-title" title="Frequently asked questions." faqs={faqs} />
  <HubLinks current="/services" title="See these services in context" />
  <CallToAction title="Discuss your project with us." description="Tell us about the process, product or challenge. We will recommend the right services and a sensible first phase." />
</>; }
