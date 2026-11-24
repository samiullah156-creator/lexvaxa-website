'use client';

import Link from 'next/link';
import { ArrowRight, Briefcase, CalendarCheck, Layers, Users } from 'lucide-react';
import { services } from '@/lib/data/services';
import { industries } from '@/lib/data/industries';
import { ServiceBadge } from '@/components/depth/service-badge';
import { INDUSTRY_ICONS } from '@/components/depth/industry-badge';
import styles from './mega-menu.module.css';

const ENGAGEMENTS = [
  { label: 'Project-based delivery', href: '/work#engineering-approach', icon: Layers },
  { label: 'A dedicated team', href: '/about', icon: Users },
  { label: 'Free discovery call', href: '/contact', icon: CalendarCheck },
];

/** Floating “What we do” panel: free project plan, capabilities, industries and ways to work together. */
export function MegaMenu({ id, onNavigate }: { id: string; onNavigate: () => void }) {
  return <div id={id} className={styles.panel} role="region" aria-label="What we do">
    <div className={styles.grid}>
      <div className={styles.featured}>
        <span className={styles.badge}>Free · no obligation</span>
        <h3>Get a project plan in one day</h3>
        <p>Tell us what you want to build or fix. Within one business day you get a clear first step: scope, timeline and a realistic budget range.</p>
        <Link href="/contact" className={styles.featuredLink} onClick={onNavigate}>Get your free plan <ArrowRight size={16} aria-hidden="true" /></Link>
      </div>
      <div>
        <p className={styles.heading}>Capabilities</p>
        <ul className={styles.capabilities}>
          {services.map((service) => {
            return <li key={service.slug}><Link href={`/services/${service.slug}`} onClick={onNavigate}>
              <ServiceBadge slug={service.slug} size="sm" />
              <span><b>{service.shortName}</b><small>{service.blurb}</small></span>
            </Link></li>;
          })}
        </ul>
      </div>
      <div>
        <p className={styles.heading}>Industry focus</p>
        <ul className={styles.industries}>
          {industries.map((industry) => {
            const Icon = INDUSTRY_ICONS[industry.slug] ?? Briefcase;
            return <li key={industry.slug}><Link href={`/industries/${industry.slug}`} onClick={onNavigate}><Icon size={17} aria-hidden="true" />{industry.name}</Link></li>;
          })}
        </ul>
        <Link href="/industries" className={styles.all} onClick={onNavigate}>All industries <ArrowRight size={14} aria-hidden="true" /></Link>
      </div>
    </div>
    <div className={styles.footer}>
      <span>Ways to work with us:</span>
      {ENGAGEMENTS.map(({ label, href, icon: Icon }) => <Link key={label} href={href} onClick={onNavigate}><Icon size={15} aria-hidden="true" />{label}</Link>)}
      <Link href="/services" className={styles.compare} onClick={onNavigate}>Compare all services <ArrowRight size={14} aria-hidden="true" /></Link>
    </div>
  </div>;
}
