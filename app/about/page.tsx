import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, CalendarCheck, Check, KeyRound, LifeBuoy, ListChecks, Mail, MessageCircle } from 'lucide-react';
import { Trail } from '@/components/ui';
import { JsonLd } from '@/components/content/json-ld';
import { AboutFounderCard } from '@/components/animations/about-founder-card';
import { LeadershipTeam } from '@/components/sections/leadership-team';
import { leadership as builtInLeadership, leadersFromCms } from '@/lib/data/leadership';
import { cmsTeam } from '@/lib/cms';
import { BrandOrbit } from '@/components/animations/brand-orbit';
import { AnimatedContainer } from '@/components/animations/animated-container';
import { breadcrumbs, pageMetadata } from '@/lib/seo';
import { serviceBySlug } from '@/lib/data/services';
import { SITE } from '@/lib/site';
import { ProcessScene } from '@/components/depth/process-scene';
import { ServiceMap3D } from '@/components/depth/service-map-3d';
import { mapServices } from '@/lib/data/service-map';
import { HubLinks } from '@/components/content/related-links';
import styles from './about.module.css';

export const metadata: Metadata = pageMetadata({
  title: 'About Us: AI & Software Development Company',
  description: 'Lexvaxa is an AI and software development company founded by Sami Chaudhary. Meet our leadership team and see how we deliver AI and custom software.',
  path: '/about',
});

const capabilityGroups = [
  {
    number: '01',
    title: 'AI & intelligent automation',
    description: 'AI agents, generative AI and voice assistants that take on routine work, with human review where it matters.',
    slugs: ['ai-agents-intelligent-automation', 'generative-ai-ml-engineering', 'conversational-voice-ai'],
  },
  {
    number: '02',
    title: 'Software, products & data',
    description: 'Custom web applications, SaaS products and data platforms, built to scale and fully owned by you.',
    slugs: ['custom-software-web-apps', 'saas-ai-product-development', 'rag-data-business-intelligence'],
  },
  {
    number: '03',
    title: 'Connected growth',
    description: 'CRM automation, AI search optimization and digital marketing that turn visibility into revenue.',
    slugs: ['crm-revenue-automation', 'ai-search-optimization', 'digital-marketing-growth'],
  },
];

const deliverySteps = [
  ['Discover', 'discover', 'Map users, workflows, connected systems and the business outcome.'],
  ['Design', 'design', 'Agree architecture, data, permissions and milestones before build.'],
  ['Build & validate', 'build', 'Deliver in reviewed milestones, testing workflows, integrations and edge cases.'],
  ['Launch & hand over', 'launch', 'Deploy, document and hand over, with ongoing support and maintenance.'],
];

const reveal = { trigger: 'viewport' as const, once: true, distance: 12, stiffness: 240, damping: 28 };

// How the founder keeps the work simple; each line restates a commitment made elsewhere on the site.
const APPROACH = [
  { title: 'Clear boundaries', text: 'Scope, ownership and handover are agreed before any build starts.' },
  { title: 'Integrations that earn their place', text: 'A connection is added only when it removes manual work or risk.' },
  { title: 'Code worth inheriting', text: 'Documented and readable, so the next developer can take over with confidence.' },
];

// How an engagement runs day to day: each line restates commitments made elsewhere on the site.
const WORKING = [
  { icon: CalendarCheck, title: 'Working progress every week', text: 'Weekly demos of working software, with your approval before each next step.' },
  { icon: ListChecks, title: 'Scope and milestones agreed first', text: 'Scope, milestones and handover are agreed in writing before build begins.' },
  { icon: KeyRound, title: 'You own everything', text: 'Code, documentation and every account are transferred to you at handover.' },
  { icon: LifeBuoy, title: 'Support after launch', text: 'Monitoring, maintenance and improvements continue after go-live.' },
];

export default async function About() {
  // Leadership comes from the admin (Team members); the built-in list is used if the CMS is unavailable.
  const team = leadersFromCms(await cmsTeam(), SITE.founder.name);
  const leadership = team.length ? team : builtInLeadership;
  return (
    <div className={styles.page}>
      <JsonLd data={[
        breadcrumbs([{ name: 'Home', url: '/' }, { name: 'About', url: '/about' }]),
        {
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          '@id': SITE.url + '/about#webpage',
          url: SITE.url + '/about',
          name: 'About Lexvaxa',
          description: SITE.description,
          about: { '@id': SITE.url + '/#organization' },
          isPartOf: { '@id': SITE.url + '/#website' },
        },
        {
          '@context': 'https://schema.org',
          '@type': 'Person',
          '@id': SITE.url + '/about#founder',
          name: SITE.founder.name,
          jobTitle: SITE.founder.role,
          description: SITE.founder.bio,
          image: SITE.url + '/media/founder-sami.jpg',
          url: SITE.url + '/about#founder',
          sameAs: [SITE.founder.linkedin],
          worksFor: { '@id': SITE.url + '/#organization' },
          homeLocation: { '@type': 'Place', name: SITE.location },
          colleague: leadership.map((leader) => ({ '@id': SITE.url + '/about#' + leader.id })),
          knowsAbout: SITE.founder.expertise,
          hasCredential: { '@type': 'EducationalOccupationalCredential', name: SITE.founder.credential, recognizedBy: { '@type': 'Organization', name: 'Microsoft' } },
        },
        ...leadership.map((leader) => ({
          '@context': 'https://schema.org',
          '@type': 'Person',
          '@id': SITE.url + '/about#' + leader.id,
          name: leader.name,
          jobTitle: leader.role,
          description: leader.summary,
          knowsAbout: leader.focus,
          ...(leader.photo ? { image: new URL(leader.photo, SITE.url).toString() } : {}),
          worksFor: { '@id': SITE.url + '/#organization' },
        })),
      ]} />

      <header className={styles.hero} id="about-lexvaxa">
        <div className={styles.container}>
          <Trail items={[{ label: 'About' }]} />
          <div className={styles.heroGrid}>
            <div className={styles.introduction}>
              <p className={styles.eyebrow}>About Lexvaxa</p>
              <h1>Engineering<br />with <span>Intelligence.</span></h1>
              <p className={styles.lead}>Lexvaxa is an AI and software development company. We build AI agents, automation and custom software that fit the way your business already works.</p>
              <p>The company is led by {SITE.founder.name}, a {SITE.founder.credential}, with a senior team covering architecture, AI engineering and project delivery.</p>
                            <div className={styles.heroActions}>
                <Link href="/contact" className={styles.primaryLink}>Discuss your project<ArrowUpRight size={17} aria-hidden="true" /></Link>
                <Link href="/work" className={styles.textLink}>Explore our work<ArrowRight size={16} aria-hidden="true" /></Link>
              </div>
            </div>
            <BrandOrbit id="about-brand-orbit" />
          </div>
          <dl className={styles.companyFacts}>
            <div><dt>Engineering focus</dt><dd>Software · AI · Automation</dd></div>
            <div><dt>Founder &amp; CEO</dt><dd><a href="#founder">{SITE.founder.name}<ArrowUpRight size={14} aria-hidden="true" /></a></dd></div>
            <div><dt>Location &amp; collaboration</dt><dd>{SITE.location}<span>Remote project delivery</span></dd></div>
          </dl>
        </div>
      </header>

      <nav className={styles.sectionNavigation} aria-label="About page sections"><div className={styles.container}>
        <a href="#about-purpose">Our approach</a><a href="#about-capabilities">Capabilities</a><a href="#about-process">Delivery process</a><a href="#founder">Meet the founder</a><a href="#about-collaboration">Working together</a>
      </div></nav>

      <section className={styles.section} aria-labelledby="about-purpose">
        <AnimatedContainer {...reveal} className={styles.container + ' ' + styles.purposeGrid}>
          <div>
            <p className={styles.eyebrow}>Our approach</p>
            <h2 id="about-purpose">Business first.<br />Technology second.</h2>
            <p className={styles.body}>
              Every engagement starts with how the work actually happens: who does it, where it stalls and what the result should be. Each recommendation, whether AI, automation or a single integration, follows from that.
            </p>
                      </div>
          <div className={styles.principles}>
            <div>
              <span>01</span>
              <div><h3>Start with the problem</h3><p>We map the real process first. The right answer may be AI, a better workflow or one well-placed integration.</p></div>
            </div>
            <div>
              <span>02</span>
              <div><h3>Connect what matters</h3><p>Applications, data and approvals work as one system, so information is entered once.</p></div>
            </div>
            <div>
              <span>03</span>
              <div><h3>Make ownership clear</h3><p>You own the code, documentation and accounts. No vendor lock-in.</p></div>
            </div>
          </div>
        </AnimatedContainer>
      </section>


      <section className={styles.capabilitiesSection} aria-labelledby="about-capabilities">
        <div className={styles.container}>
          <div className={styles.sectionHeading}>
            <div><p className={styles.eyebrow}>What we do</p><h2 id="about-capabilities">Services and<br />capabilities.</h2></div>
            <Link href="/services" className={styles.textLink}>Explore all services <ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
          <AnimatedContainer {...reveal} className={styles.capabilityGrid}>
            {capabilityGroups.map((group) => (
              <div className={styles.capabilityGroup} key={group.number}>
                <span className={styles.groupNumber}>{group.number} /</span>
                <h3>{group.title}</h3>
                <p>{group.description}</p>
                <ul>
                  {group.slugs.map((slug) => (
                    <li key={slug}>
                      <Link href={'/services/' + slug}>{serviceBySlug[slug].shortName}<ArrowUpRight size={14} aria-hidden="true" /></Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </AnimatedContainer>
          <div className={styles.capabilityMap}><ServiceMap3D services={mapServices} label="Explore how Lexvaxa’s AI, software and growth capabilities connect." /></div>
        </div>
      </section>

      <section className={styles.processSection} aria-labelledby="about-process">
        <div className={styles.container}>
          <div className={styles.sectionHeading}>
            <div><p className={styles.eyebrow}>How we work</p><h2 id="about-process">Our delivery<br />process.</h2></div>
            <div className={styles.processIntro}>
              <p>Four stages with agreed milestones and sign-off at each one, so scope, cost and progress stay visible.</p>
              <Link href="/work" className={styles.textLink}>Our engineering approach <ArrowRight size={16} aria-hidden="true" /></Link>
            </div>
          </div>
          <AnimatedContainer {...reveal} as="ol" className={styles.deliverySteps}>
            {deliverySteps.map(([title, render, description], index) => (
              <li key={title}>
                <span className={styles.stepRender}><ProcessScene name={render} /><b>{String(index + 1).padStart(2, '0')}</b></span>
                <h3>{title}</h3>
                <p>{description}</p>
              </li>
            ))}
          </AnimatedContainer>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="about-leadership">
        <AnimatedContainer {...reveal} className={styles.container + ' ' + styles.leadershipGrid}>
          <div className={styles.founderIntro}>
            <p className={styles.eyebrow}>Leadership</p>
            <h2 id="about-leadership">Meet our<br />founder.</h2>
            <p className={styles.body}>{SITE.founder.name} founded Lexvaxa to give growing businesses access to senior engineering and practical AI, delivered with clear scope and accountability.</p>
            <ul className={styles.approach} aria-label="How we keep the work simple">
              {APPROACH.map(({ title, text }) => <li key={title}>
                <span aria-hidden="true"><Check size={15} /></span>
                <div><b>{title}</b><small>{text}</small></div>
              </li>)}
            </ul>
            <Link href="/contact" className={styles.textLink}>Start a conversation <ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
          <AboutFounderCard />
        </AnimatedContainer>
      </section>

      <section className={`${styles.section} ${styles.teamSection}`} aria-labelledby="about-team">
        <div className={styles.container}>
          <div className={styles.sectionHeading}>
            <div><p className={styles.eyebrow}>Our team</p><h2 id="about-team">Leadership<br />team.</h2></div>
            <p className={styles.body}>Our technology and operations leads own architecture, delivery and integration on every project, from the first workshop to handover.</p>
          </div>
          <LeadershipTeam members={leadership} />
        </div>
      </section>

      <section className={styles.collaborationSection} aria-labelledby="about-collaboration">
        <AnimatedContainer {...reveal} className={styles.container + ' ' + styles.collaborationGrid}>
          <div className={styles.collaborationIntro}>
            <p className={styles.eyebrow}>Working together</p>
            <h2 id="about-collaboration">Working with<br />Lexvaxa.</h2>
            <p className={styles.body}>Headquartered in {SITE.location}, we deliver projects remotely for clients worldwide, with working hours and communication agreed around your team.</p>
            <p className={styles.marketsLabel}>Clients and market focus</p>
            <ul className={styles.markets} aria-label="Market focus">{SITE.markets.map((market) => <li key={market}>{market}</li>)}</ul>
            <div className={styles.contactRow}>
              <Link href="/contact" className={styles.contactPrimary}>Book a free call <ArrowUpRight size={16} aria-hidden="true" /></Link>
              <a className={styles.contactLink} href={`mailto:${SITE.email}`}><Mail size={16} aria-hidden="true" />{SITE.email}</a>
              <a className={styles.contactLink} href={SITE.whatsappUrl} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} aria-hidden="true" />WhatsApp</a>
            </div>
          </div>
          <div className={styles.workingPanel}>
            <ul className={styles.workingList}>
              {WORKING.map(({ icon: Icon, title, text }) => <li key={title}>
                <span aria-hidden="true"><Icon size={18} /></span>
                <div><h3>{title}</h3><p>{text}</p></div>
              </li>)}
            </ul>
            <p className={styles.collaborationNote}>For a useful first conversation, share your business goal, current systems and any timeline or budget constraints.</p>
          </div>
        </AnimatedContainer>
      </section>
      <HubLinks current="/about" title="Explore what we build" />
    </div>
  );
}

