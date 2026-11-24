import { ArrowUpRight, CalendarDays, Mail, MessageCircle, Phone } from 'lucide-react';
import { SITE } from '@/lib/site';
import styles from './booking.module.css';

/** Calendly scheduler, loaded only when it scrolls near the viewport (no third-party script). */
export function CalendlyEmbed({ title = 'Book a 30-minute discovery call with Lexvaxa' }: { title?: string }) {
  const src = `${SITE.calendlyUrl}?hide_gdpr_banner=1&hide_landing_page_details=1&primary_color=167dfe`;
  return <div className={styles.embed}>
    <iframe src={src} title={title} loading="lazy" className={styles.frame} referrerPolicy="strict-origin-when-cross-origin" />
    <p className={styles.fallback}>Calendar not loading? <a href={SITE.calendlyUrl} target="_blank" rel="noopener noreferrer">Open the booking page <ArrowUpRight size="1em" className="inline-icon" aria-hidden="true" /></a></p>
  </div>;
}

/** Direct ways to reach the team: WhatsApp, email, phone and the booking page. */
export function ContactChannels({ compact = false }: { compact?: boolean }) {
  const channels = [
    { href: SITE.whatsappUrl, label: 'WhatsApp', detail: SITE.phone, icon: MessageCircle, external: true, tone: 'whatsapp' },
    { href: `mailto:${SITE.email}`, label: 'Email', detail: SITE.email, icon: Mail },
    { href: `tel:${SITE.phone.replace(/[^\d+]/g, '')}`, label: 'Call', detail: SITE.phone, icon: Phone },
    { href: SITE.calendlyUrl, label: 'Book a call', detail: '30-minute discovery call', icon: CalendarDays, external: true, popup: true },
  ];
  return <ul className={styles.channels} data-compact={compact}>
    {channels.map(({ href, label, detail, icon: Icon, external, tone, popup }) => <li key={label}>
      <a href={href} data-tone={tone} {...(popup ? { 'data-book-call': '' } : {})} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
        <span className={styles.channelIcon} aria-hidden="true"><Icon size={18} strokeWidth={1.9} /></span>
        <span><b>{label}</b><small>{detail}</small></span>
        <span className={styles.arrow} aria-hidden="true"><ArrowUpRight size="1em" className="inline-icon" aria-hidden="true" /></span>
      </a>
    </li>)}
  </ul>;
}
