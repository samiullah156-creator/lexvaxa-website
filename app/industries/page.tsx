import type { Metadata } from 'next';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { CallToAction, Eyebrow, Heading, Trail } from '@/components/ui';
import { industries } from '@/lib/data/industries';
import { serviceBySlug } from '@/lib/data/services';
import { breadcrumbs, collectionSchema, pageMetadata } from '@/lib/seo';
import { TiltSurface } from '@/components/depth/tilt-surface';
import { IndustryScene } from '@/components/steel/industry-scenes';
import { IndustryOrbit } from '@/components/depth/industry-orbit';
import { JsonLd } from '@/components/content/json-ld';
import { HubLinks } from '@/components/content/related-links';
import { FaqSection, type Faq } from '@/components/content/faq-section';

export const metadata: Metadata = pageMetadata({ title:'AI & Automation Solutions by Industry', description:'Explore operational AI, automation and custom software applications in legal, e-commerce, healthcare operations, professional services, SaaS and logistics.', path:'/industries' });

const DIFFERENCES = [
  ['The systems already in place', 'A law firm works from matter files and document stores. A retailer works from orders, stock and support tickets. We start from the software you already run.'],
  ['Who has to stay in control', 'Some decisions belong to a qualified person: a lawyer, a clinician, a finance lead. Each industry page shows where human approval is designed in.'],
  ['What a good result looks like', 'Success is defined differently in every sector. We agree the outcome that matters to you before the first phase begins, and measure against it.'],
] as const;

const faqs: Faq[] = [
  { question: 'Our industry is not listed. Can you still help?', answer: 'Yes. The services are organised around engineering capabilities, so they apply across sectors. What changes is the context: every implementation has to account for its own industry and regional requirements.' },
  { question: 'How do you handle sensitive or regulated information?', answer: 'Access rules, human approvals and data boundaries are agreed before anything is built, and each industry page lists the safeguards we design in for that sector. Your organisation’s legal and compliance obligations stay with you and your advisers; we build to the rules you give us.' },
  { question: 'Where does an industry project usually begin?', answer: 'With one workflow. We map how the work happens today, run a focused first phase on real cases with your team, and widen the scope only when the results support it.' },
];

export default function Industries() { return <>
  <JsonLd data={[breadcrumbs([{ name: 'Home', url: '/' }, { name: 'Industries', url: '/industries' }]), collectionSchema({ name: 'AI and automation by industry', description: 'AI, automation and custom software solutions for legal, logistics, healthcare, real estate, finance, SaaS, ecommerce and education businesses.', path: '/industries', items: industries.map((i) => ({ name: i.name, url: `/industries/${i.slug}` })) })]} />
  <header className="page-hero container page-hero-visual"><div><Trail items={[{label:'Industries'}]}/><Eyebrow>Industries</Eyebrow><h1>Industry solutions<br/><span className="blue-text">built on AI and software.</span></h1><p>Each sector runs on its own workflows, data and compliance rules. We design AI and software around the requirements of yours.</p></div><IndustryOrbit /></header>
  <section className="section container" aria-label="Industries"><div className="industry-grid">{industries.map((industry) => <TiltSurface key={industry.slug} lift max={5} className="tilt-cell"><Link className="industry-card industry-card-large industry-card-visual" href={`/industries/${industry.slug}`}><div className="industry-card-scene" data-depth="30"><IndustryScene slug={industry.slug} id={`index-${industry.slug}`} /></div><h2>{industry.name}</h2><p>{industry.description}</p><span>View applications <ArrowRight size="1em" className="inline-icon" aria-hidden="true" /></span></Link></TiltSurface>)}</div></section>

  <section className="section section-soft" aria-labelledby="differences-title"><div className="container">
    <Heading id="differences-title" eyebrow="Same capabilities, different context" title="Industry-specific delivery." />
    <ol className="point-columns">
      {DIFFERENCES.map(([title, text], index) => <li key={title}><span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><h3>{title}</h3><p>{text}</p></li>)}
    </ol>
  </div></section>

  {/* Which services each sector draws on most; every cell links to the service page. */}
  <section className="section container" aria-labelledby="matrix-title">
    <Heading id="matrix-title" eyebrow="Capabilities by industry" title="Services by industry." description="The services most often delivered in each sector." />
    <div className="fit-table-wrap"><table className="fit-table fit-table-wide">
      <caption className="sr-only">Industries and the services most relevant to each</caption>
      <thead><tr><th scope="col">Industry</th><th scope="col">Most relevant services</th></tr></thead>
      <tbody>{industries.map((industry) => <tr key={industry.slug}>
        <th scope="row" data-label="Industry"><Link href={`/industries/${industry.slug}`}>{industry.name} <ArrowUpRight size="1em" className="inline-icon" aria-hidden="true" /></Link></th>
        <td data-label="Most relevant services"><ul className="applies-chips">{industry.related.map((slug) => <li key={slug}><Link href={`/services/${slug}`}>{serviceBySlug[slug].shortName}</Link></li>)}</ul></td>
      </tr>)}</tbody>
    </table></div>
  </section>

  <FaqSection id="industries-faq-title" title="Frequently asked questions." faqs={faqs} soft />
  <HubLinks current="/industries" />
  <CallToAction title="Discuss your industry workflow." description="A discovery session defines the technical scope, responsibilities and safeguards for your sector."/>
</>; }
