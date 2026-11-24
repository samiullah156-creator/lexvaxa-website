import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Mail, MessageCircle, Phone } from 'lucide-react';
import { LEGAL_NAV, SITE } from '@/lib/site';
import { services } from '@/lib/data/services';
import styles from './footer.module.css';

const companyLinks = [
  { href: '/about', label: 'About us' },
  { href: '/work', label: 'Our work' },
  { href: '/industries', label: 'Industries' },
  { href: '/insights', label: 'Insights' },
  { href: '/careers', label: 'Careers' },
  { href: '/contact', label: 'Contact' },
];

const socialProfiles = [
  { name: 'LinkedIn', icon: 'linkedin', href: SITE.socials.linkedin },
  { name: 'X', icon: 'x', href: SITE.socials.x },
  { name: 'YouTube', icon: 'youtube', href: SITE.socials.youtube },
  { name: 'Instagram', icon: 'instagram', href: SITE.socials.instagram },
] as const;

function SocialMark({ name }: { name: 'linkedin' | 'x' | 'youtube' | 'instagram' }) {
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true" focusable="false">
    {name === 'linkedin' ? <path d="M5.2 3a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4ZM3.4 9h3.7v12H3.4V9Zm5.9 0h3.5v1.6h.1c.5-1 1.8-1.9 3.6-1.9 3.8 0 4.5 2.5 4.5 5.7V21h-3.7v-5.9c0-1.4 0-3.2-1.9-3.2s-2.3 1.5-2.3 3.1v6H9.3V9Z" />
      : name === 'x' ? <path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3L12 15.5 6.3 22H3.1l7.4-8.5L2.8 2h6.5l4.5 6L18.9 2Zm-1.1 18h1.7L8.4 3.9H6.6L17.8 20Z" />
        : name === 'youtube' ? <path d="M21.6 6.2a2.8 2.8 0 0 0-2-2C17.9 3.8 12 3.8 12 3.8s-5.9 0-7.6.4a2.8 2.8 0 0 0-2 2C2 8 2 12 2 12s0 4 .4 5.8a2.8 2.8 0 0 0 2 2c1.7.4 7.6.4 7.6.4s5.9 0 7.6-.4a2.8 2.8 0 0 0 2-2C22 16 22 12 22 12s0-4-.4-5.8ZM10 15.6V8.4l6.2 3.6-6.2 3.6Z" />
          : <><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.8" /><circle cx="17.5" cy="6.5" r="1.1" /></>}
  </svg>;
}

/** Server-rendered navigation and contact details; the footer adds no client runtime. */
export function Footer() {
  const currentYear = new Date().getFullYear();
  const telephone = SITE.phone.replace(/[^\d+]/g, '');

  return <footer id="site-footer" className={styles.footer} role="contentinfo" aria-label={`${SITE.name} footer`}>
    <div className={styles.inner}>
      <div className={styles.grid}>
        <div className={styles.brand}>
          <Link href="/" className={styles.logoLink} aria-label={`${SITE.name} home`}>
            <Image src="/brand/lexvaxa-logo-white.svg" alt={`${SITE.name}: ${SITE.tagline}`} width={212} height={55} className={styles.logo} />
          </Link>
          <p className={styles.mission}>AI engineering, custom software and connected automation.</p>
          <ul className={styles.socials} aria-label="Lexvaxa social profiles">
            {socialProfiles.map((profile) => <li key={profile.icon}>
              <a href={profile.href} target="_blank" rel="noopener noreferrer" aria-label={`${SITE.name} on ${profile.name} (opens in a new tab)`}>
                <SocialMark name={profile.icon} />
              </a>
            </li>)}
          </ul>
        </div>
        <nav className={styles.services} aria-labelledby="footer-services-title">
          <h3 id="footer-services-title">Services</h3>
          <ul className={styles.links}>
            {services.map((service) => <li key={service.slug}>
              <Link href={`/services/${service.slug}`} aria-label={service.name.includes(service.shortName) ? service.name : `${service.shortName}: ${service.name}`}>{service.shortName}</Link>
            </li>)}
          </ul>
        </nav>

        <nav className={styles.company} aria-labelledby="footer-company-title">
          <h3 id="footer-company-title">Company</h3>
          <ul className={styles.links}>
            {companyLinks.map((item) => <li key={item.href}><Link href={item.href}>{item.label}</Link></li>)}
          </ul>
        </nav>

        <section className={styles.connect} aria-labelledby="footer-contact-title">
          <h3 id="footer-contact-title">Get in touch</h3>
          <address className={styles.contacts}>
            <a href={`mailto:${SITE.email}`}><Mail size={16} aria-hidden="true" /><span>{SITE.email}</span></a>
            <a href={`tel:${telephone}`}><Phone size={16} aria-hidden="true" /><span>{SITE.phone}</span></a>
            <a href={SITE.whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="Message Lexvaxa on WhatsApp (opens in a new tab)">
              <MessageCircle size={16} aria-hidden="true" /><span>WhatsApp</span><ArrowUpRight size={14} aria-hidden="true" />
            </a>
          </address>
        </section>
      </div>

      <div className={styles.bottom}>
        <div className={styles.copyright}>
          <p>© {currentYear} {SITE.name}. All rights reserved.</p>
        </div>
        <nav aria-label="Legal and policies">
          <ul className={styles.legal}>
            {LEGAL_NAV.map((item) => <li key={item.href}><Link href={item.href}>{item.label}</Link></li>)}
          </ul>
        </nav>
      </div>
    </div>
  </footer>;
}
