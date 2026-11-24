import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { Eyebrow, Trail } from '@/components/ui';
import { JsonLd } from '@/components/content/json-ld';
import { FaqSection } from '@/components/content/faq-section';
import { HubLinks } from '@/components/content/related-links';
import { CareerApplicationForm } from '@/components/forms/career-application-form';
import { cmsJobs } from '@/lib/cms';
import { breadcrumbs, pageMetadata } from '@/lib/seo';
import { SITE } from '@/lib/site';
import styles from './careers.module.css';

export const metadata: Metadata = pageMetadata({
  title: 'Careers at Lexvaxa: Engineering, AI and Delivery Roles',
  description: 'Work on AI agents, automation and custom software that real businesses run every day. See open roles at Lexvaxa and apply with your CV in two minutes.',
  path: '/careers',
});

const PRINCIPLES = [
  { title: 'You ship real work', text: 'Production systems for paying clients, not demos.', icon: <><path d="M8 34h28" /><path d="M14 34V18l8-8 8 8v16" /><path className={styles.accent} d="M19 26l3 3 6-7" /></> },
  { title: 'Small senior teams', text: 'Few layers. You talk to the client and to the founder.', icon: <><circle cx="16" cy="16" r="5" /><circle cx="30" cy="16" r="5" /><path d="M7 34c1-6 5-9 9-9s8 3 9 9" /><path className={styles.accent} d="M23 34c1-6 4-9 7-9s7 3 8 9" /></> },
  { title: 'Ownership end to end', text: 'From the first call to handover, the work is yours.', icon: <><rect x="8" y="10" width="28" height="24" rx="3" /><path d="M8 17h28" /><path className={styles.accent} d="M15 25h8M15 29h14" /></> },
  { title: 'Learn on the job', text: 'New tools every quarter, reviewed by people who use them.', icon: <><path d="M22 9l14 7-14 7-14-7z" /><path d="M13 19v8c3 3 6 4 9 4s6-1 9-4v-8" /><path className={styles.accent} d="M36 16v10" /></> },
];

const STEPS = [
  ['Application', 'Your CV is read by an engineer, not a filter.', 'Within 10 working days'],
  ['Intro call', '30 minutes about your work and what you want next.', '30 minutes'],
  ['Practical task', 'A small exercise close to the real job, discussed together.', 'A few hours'],
  ['Offer', 'Clear terms, start date and the first project you will join.', 'Within a week'],
] as const;

const FAQS = [
  { question: 'Can I apply if no role matches me?', answer: 'Yes. Choose “General application” in the form. We keep strong CVs on file and contact you when a matching project starts.' },
  { question: 'Do you hire remotely?', answer: `Most of our work is remote. Each role states whether it is remote, hybrid or on-site. Our base is ${SITE.location}.` },
  { question: 'What happens to my CV?', answer: 'It is stored privately in our admin system, only the hiring team can open it, and it is deleted after 12 months unless you ask us to keep it longer. You can ask us to delete it at any time.' },
  { question: 'Which file formats can I upload?', answer: 'PDF or Word (DOC, DOCX), up to 4 MB. A PDF keeps your layout exactly as you designed it.' },
  { question: 'Do you take interns or graduates?', answer: 'When we have capacity to mentor properly, we open internship roles here. You can also send a general application and tell us what you have built.' },
];

export default async function Careers() {
  const jobs = await cmsJobs();
  const roles = jobs.map((job) => ({ slug: job.slug, title: job.title }));
  // The hero stack always shows three cards: real open roles first, the open application last.
  const fillers = [
    { title: 'AI Automation Engineer', team: 'AI', workplace: 'Remote', type: 'Full-time' },
    { title: 'Product Designer', team: 'Design', workplace: 'Remote', type: 'Full-time' },
  ];
  const front = jobs[0] ?? { title: 'Your role here', team: 'Open application', workplace: 'Remote', type: 'Any' };
  const behind = [...jobs.slice(1, 3), ...fillers].slice(0, 2);
  const deck = [behind[1], behind[0], front];

  return <>
    <JsonLd data={[
      breadcrumbs([{ name: 'Home', url: '/' }, { name: 'Careers', url: '/careers' }]),
      ...(jobs.length ? [{
        '@context': 'https://schema.org', '@type': 'ItemList', name: 'Open roles at Lexvaxa',
        itemListElement: jobs.map((job, index) => ({ '@type': 'ListItem', position: index + 1, url: `${SITE.url}/careers/${job.slug}`, name: job.title })),
      }] : []),
    ]} />

    <header className={styles.hero}>
      <div className="container">
        <Trail items={[{ label: 'Careers' }]} />
        <div className={styles.heroGrid}>
          <div>
            <Eyebrow>Careers</Eyebrow>
            <h1>Build your career <span>at Lexvaxa.</span></h1>
            <p className={styles.lead}>Work on AI agents, automation and custom software used by real businesses, in a small senior team with ownership of your work.</p>
            <div className={styles.actions}>
              <a className="button" href={jobs.length ? '#open-roles' : '#apply'}>{jobs.length ? `See ${jobs.length} open role${jobs.length === 1 ? '' : 's'}` : 'Send your CV'} <ArrowDown size="1em" className="inline-icon" aria-hidden="true" /></a>
              <Link className="text-link" href="/work">See what we build <ArrowRight size={15} aria-hidden="true" /></Link>
            </div>
            <ul className={styles.facts} aria-label="At a glance">
              <li>Remote-first</li><li>Based in {SITE.location}</li><li>Clients worldwide</li>
            </ul>
          </div>
          <div className={styles.stage} aria-hidden="true">
            <div className={styles.deck}>
              {deck.map((job, index) => <div className={styles.card} key={job.title}>
                <div className={styles.cardTop}><span className={styles.cardTeam}>{job.team || 'Lexvaxa'}</span>{index === deck.length - 1 && <span className={styles.cardState}>Hiring</span>}</div>
                <p className={styles.cardTitle}>{job.title}</p>
                <div className={styles.cardTags}><span>{job.workplace}</span><span>{job.type}</span></div>
                <div className={styles.cardFoot}><span className={styles.avatars}><i /><i /><i /></span><span className={styles.cardCta}>Apply <ArrowRight size="1em" className="inline-icon" aria-hidden="true" /></span></div>
              </div>)}
            </div>
            <span className={styles.floor} />
          </div>
        </div>
      </div>
    </header>

    <section className="section" aria-labelledby="how-we-work">
      <div className="container">
        <Eyebrow>Working here</Eyebrow>
        <h2 id="how-we-work">Life at Lexvaxa.</h2>
        <div className={styles.principles}>
          {PRINCIPLES.map((item) => <div className={styles.principle} key={item.title}>
            <svg viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{item.icon}</svg>
            <h3>{item.title}</h3><p>{item.text}</p>
          </div>)}
        </div>
      </div>
    </section>

    <section className="section section-soft" id="open-roles" aria-labelledby="open-roles-title">
      <div className="container">
        <div className={styles.rolesHead}>
          <div><Eyebrow>Open roles</Eyebrow><h2 id="open-roles-title">{jobs.length ? 'Where you could start.' : 'No open roles right now.'}</h2></div>
          <a className="text-link" href="#apply">General application <ArrowRight size={15} aria-hidden="true" /></a>
        </div>
        {jobs.length ? <ul className={styles.roles}>
          {jobs.map((job) => <li key={job.slug}><Link className={styles.role} href={`/careers/${job.slug}`}>
            <div><h3>{job.title}</h3><div className={styles.roleMeta}>{[job.team, job.workplace === 'Remote' ? 'Remote' : `${job.workplace} · ${job.location}`, job.type, job.experience].filter(Boolean).map((value) => <span key={value}>{value}</span>)}</div></div>
            <span className={styles.roleArrow}>View role <ArrowRight size={15} aria-hidden="true" /></span>
          </Link></li>)}
        </ul> : <div className={styles.noRoles}>
          <h3>We still read every CV.</h3>
          <p>Send a general application below. When a project needs your skills, you will be the first person we call.</p>
        </div>}
      </div>
    </section>

    <section className="section" aria-labelledby="hiring-title">
      <div className="container">
        <Eyebrow>How we hire</Eyebrow>
        <h2 id="hiring-title">Our hiring process.</h2>
        <ol className={styles.steps}>
          {STEPS.map(([title, text, time]) => <li key={title}><h3>{title}</h3><p>{text}</p><small>{time}</small></li>)}
        </ol>
      </div>
    </section>

    <section className="section section-soft" id="apply" aria-labelledby="apply-title">
      <div className={`container ${styles.applyGrid}`}>
        <div className={styles.applyAside}>
          <Eyebrow>Apply</Eyebrow>
          <h2 id="apply-title">Send your CV.</h2>
          <p>Two minutes. A person on the team reads it and replies, whatever the answer.</p>
          <ul className={styles.checklist}>
            <li>Your CV as PDF or Word</li>
            <li>A link to work you are proud of</li>
            <li>A few honest lines about what you want next</li>
          </ul>
        </div>
        <div className={styles.applyCard}><CareerApplicationForm roles={roles} /></div>
      </div>
    </section>

    <FaqSection id="careers-faq" title="Questions about applying" faqs={FAQS} />
    <HubLinks current="/careers" title="Get to know Lexvaxa first" />
  </>;
}
