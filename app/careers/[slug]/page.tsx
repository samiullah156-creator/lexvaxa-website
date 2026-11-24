import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowDown, ArrowLeft } from 'lucide-react';
import { Eyebrow, Trail } from '@/components/ui';
import { JsonLd } from '@/components/content/json-ld';
import { CareerApplicationForm } from '@/components/forms/career-application-form';
import { cmsJob, cmsJobs } from '@/lib/cms';
import { breadcrumbs, pageMetadata } from '@/lib/seo';
import { SITE } from '@/lib/site';
import styles from '../careers.module.css';

// Roles are added in the admin, so addresses not known at build time are rendered on first visit.
export const dynamicParams = true;

export async function generateStaticParams() {
  return (await cmsJobs()).map((job) => ({ slug: job.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const job = await cmsJob((await params).slug);
  if (!job) return { title: 'Role not found', robots: { index: false } };
  return pageMetadata({ title: `${job.title}: Careers at Lexvaxa`, description: job.summary.slice(0, 160), path: `/careers/${job.slug}` });
}

const esc = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const EMPLOYMENT: Record<string, string> = { 'Full-time': 'FULL_TIME', 'Part-time': 'PART_TIME', Contract: 'CONTRACTOR', Internship: 'INTERN' };

export default async function Role({ params }: { params: Promise<{ slug: string }> }) {
  const job = await cmsJob((await params).slug);
  if (!job) notFound();
  const roles = (await cmsJobs()).map((item) => ({ slug: item.slug, title: item.title }));
  if (!roles.some((role) => role.slug === job.slug)) roles.unshift({ slug: job.slug, title: job.title });
  const posted = (job.createdAt || job.updatedAt).slice(0, 10);
  const validThrough = new Date(new Date(job.updatedAt).getTime() + 90 * 86_400_000).toISOString().slice(0, 10);

  return <>
    <JsonLd data={[
      breadcrumbs([{ name: 'Home', url: '/' }, { name: 'Careers', url: '/careers' }, { name: job.title, url: `/careers/${job.slug}` }]),
      {
        '@context': 'https://schema.org',
        '@type': 'JobPosting',
        title: job.title,
        description: [`<p>${esc(job.summary)}</p>`, job.responsibilities.length ? `<h3>What you will do</h3><ul>${job.responsibilities.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>` : '', job.requirements.length ? `<h3>What we look for</h3><ul>${job.requirements.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>` : ''].join(''),
        datePosted: posted,
        validThrough,
        employmentType: EMPLOYMENT[job.type] ?? 'FULL_TIME',
        hiringOrganization: { '@type': 'Organization', '@id': `${SITE.url}/#organization`, name: SITE.name, sameAs: SITE.url },
        ...(job.workplace === 'Remote'
          ? { jobLocationType: 'TELECOMMUTE', applicantLocationRequirements: { '@type': 'Country', name: 'Worldwide' } }
          : { jobLocation: { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: job.location || SITE.location } } }),
        directApply: true,
        url: `${SITE.url}/careers/${job.slug}`,
      },
    ]} />

    <header className={styles.hero}>
      <div className="container">
        <Trail items={[{ label: 'Careers', href: '/careers' }, { label: job.title }]} />
        <Eyebrow>{job.team || 'Careers'}</Eyebrow>
        <h1 style={{ margin: '10px 0 14px', fontSize: 'clamp(2rem, 4.6vw, 3.4rem)', letterSpacing: '-.03em', lineHeight: 1.05 }}>{job.title}</h1>
        <p className={styles.lead}>{job.summary}</p>
        <ul className={styles.facts} aria-label="Role details">
          {[job.workplace, job.workplace !== 'Remote' ? job.location : '', job.type, job.experience].filter(Boolean).map((value) => <li key={value}>{value}</li>)}
        </ul>
      </div>
    </header>

    <section className="section">
      <div className={`container ${styles.detailGrid}`}>
        <div>
          {job.responsibilities.length > 0 && <div className={styles.detailBlock}><h2>What you will do</h2><ul>{job.responsibilities.map((item) => <li key={item}>{item}</li>)}</ul></div>}
          {job.requirements.length > 0 && <div className={styles.detailBlock}><h2>What we look for</h2><ul>{job.requirements.map((item) => <li key={item}>{item}</li>)}</ul></div>}
          {job.niceToHave.length > 0 && <div className={styles.detailBlock}><h2>Nice to have</h2><ul>{job.niceToHave.map((item) => <li key={item}>{item}</li>)}</ul></div>}
          <p style={{ marginTop: 34 }}><Link className="text-link" href="/careers"><ArrowLeft size={15} aria-hidden="true" style={{ verticalAlign: '-2px' }} /> All roles</Link></p>
        </div>
        <aside className={styles.summaryCard} aria-label="Summary">
          <dl>
            <dt>Team</dt><dd>{job.team || 'Not specified'}</dd>
            <dt>Workplace</dt><dd>{job.workplace}</dd>
            <dt>Location</dt><dd>{job.location || 'Remote'}</dd>
            <dt>Type</dt><dd>{job.type}</dd>
            {job.experience && <><dt>Experience</dt><dd>{job.experience}</dd></>}
            {job.salary && <><dt>Salary</dt><dd>{job.salary}</dd></>}
          </dl>
          <a className="button" href="#apply" style={{ width: '100%', justifyContent: 'center' }}>Apply for this role <ArrowDown size="1em" className="inline-icon" aria-hidden="true" /></a>
        </aside>
      </div>
    </section>

    <section className="section section-soft" id="apply" aria-labelledby="apply-title">
      <div className={`container ${styles.applyGrid}`}>
        <div className={styles.applyAside}>
          <Eyebrow>Apply</Eyebrow>
          <h2 id="apply-title">Apply for {job.title}.</h2>
          <p>Your CV goes straight to the hiring team. We reply to every application within ten working days.</p>
        </div>
        <div className={styles.applyCard}><CareerApplicationForm roles={roles} defaultRole={job.slug} /></div>
      </div>
    </section>
  </>;
}
