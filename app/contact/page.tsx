import type { Metadata } from 'next';
import { Eyebrow, Trail } from '@/components/ui';
import { ProjectEnquiryForm } from '@/components/forms/project-enquiry-form';
import { CalendlyEmbed, ContactChannels } from '@/components/forms/booking';
import { JsonLd } from '@/components/content/json-ld';
import { SITE } from '@/lib/site';
import { pageMetadata } from '@/lib/seo';
import { HubLinks } from '@/components/content/related-links';

export const metadata: Metadata = pageMetadata({
  title: 'Contact Lexvaxa: Book a Call or Send an Enquiry',
  description: 'Contact Lexvaxa about AI agents, voice AI, automation, custom software or SaaS. Book a 30-minute discovery call, message us on WhatsApp or send an enquiry.',
  path: '/contact',
});

const FACTS = [['< 1 day', 'Reply to every enquiry'], ['30 min', 'Free discovery call'], ['EN · UR', 'Languages we work in'], ['Remote', 'Teams in any time zone']] as const;

const NEXT_STEPS = [
  ['01', 'We read your enquiry', 'An engineer reviews your goal and the systems involved, usually within one business day.'],
  ['02', 'Discovery call', 'A focused 30-minute call to understand the workflow, users and constraints.'],
  ['03', 'Scoped first phase', 'You receive a clear proposal for a first phase that can be built, reviewed and owned.'],
] as const;

const contactSchema = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Contact Lexvaxa',
  url: `${SITE.url}/contact`,
  mainEntity: {
    '@type': 'Organization',
    name: SITE.name,
    url: SITE.url,
    email: SITE.email,
    telephone: SITE.phone,
    contactPoint: [{ '@type': 'ContactPoint', contactType: 'sales', email: SITE.email, telephone: SITE.phone, availableLanguage: ['English', 'Urdu'], areaServed: SITE.markets }],
  },
};

export default function Contact() {
  return <>
    <JsonLd data={contactSchema} />
    <header className="page-hero container"><Trail items={[{ label: 'Contact' }]} /><Eyebrow>Contact Lexvaxa</Eyebrow><h1>Tell us what your business <span className="blue-text">needs next.</span></h1><p>Send an enquiry, book a 30-minute discovery call or message us on WhatsApp. We reply within one business day and scope around your actual systems and goals.</p>
      <ul className="contact-facts" aria-label="How we respond">{FACTS.map(([value, label]) => <li key={label}><b>{value}</b><span>{label}</span></li>)}</ul>
    </header>
    <section className="section section-soft" aria-labelledby="enquiry-title"><div className="container contact-layout">
      <div className="enquiry-card">
        <h2 id="enquiry-title">Tell us about your enquiry</h2>
        <p className="enquiry-lead">Complete the form and give us enough context to understand your enquiry.</p>
        <ProjectEnquiryForm />
      </div>
      <aside className="contact-aside" aria-labelledby="direct-title">
        <div className="contact-direct">
          <Eyebrow>Talk to us directly</Eyebrow>
          <h2 id="direct-title">Prefer a quick conversation?</h2>
          <p>Message us on WhatsApp, email the team or pick a time that suits you.</p>
          <ContactChannels compact />
        </div>
        <div className="contact-next">
          <span className="eyebrow">What happens next</span>
          <ol className="next-steps">{NEXT_STEPS.map(([number, title, text]) => <li key={number}><span>{number}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol>
        </div>
      </aside>
    </div></section>
    <section className="section" aria-labelledby="schedule-title"><div className="container schedule-layout">
      <div><Eyebrow>Book a discovery call</Eyebrow><h2 id="schedule-title">Pick a time that suits you.</h2><p className="schedule-lead">Choose a 30-minute slot. Bring your goal, the tools you use today and any constraints. We will come prepared with questions, not a sales deck.</p></div>
      <CalendlyEmbed />
    </div></section>
    <HubLinks current="/contact" title="Before you get in touch" />
  </>;
}
