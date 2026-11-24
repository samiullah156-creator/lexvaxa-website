import Link from 'next/link';
import { ArrowUpRight, CircleCheck, FileText, Mail, MessageCircle } from 'lucide-react';
import { SITE } from '@/lib/site';

export function Eyebrow({ children }: { children: React.ReactNode }) { return <p className="eyebrow"><span className="eyebrow-line" />{children}</p>; }
export function Heading({ eyebrow, title, description, id }: { eyebrow: string; title: string; description?: string; id?: string }) {
  return <div className="section-heading"><Eyebrow>{eyebrow}</Eyebrow><h2 id={id}>{title}</h2>{description && <p>{description}</p>}</div>;
}
export function CallToAction({ title = 'Get your free project plan.', description = 'Tell us what you want to build or fix. Within one business day an engineer replies with a clear first step: scope, timeline and a realistic budget range. No obligation.' }: { title?: string; description?: string }) {
  const options = [
    { href: '/contact', label: 'Send a project brief', detail: 'Scope, systems and timeline', icon: FileText },
    { href: `mailto:${SITE.email}`, label: 'Email the team', detail: SITE.email, icon: Mail },
    { href: SITE.whatsappUrl, label: 'Chat on WhatsApp', detail: 'Quick questions welcome', icon: MessageCircle, external: true },
  ];
  return <section className="cta-section"><div className="container cta-inner">
    <div className="cta-copy"><Eyebrow>Let’s build it together</Eyebrow><h2>{title}</h2><p>{description}</p>
      <Link href="/contact" className="button button-light">Start your free plan <ArrowUpRight size="1em" className="inline-icon" aria-hidden="true" /></Link>
      <ul className="cta-promises" aria-label="What you can expect">{['Reply in under 1 day', 'Free 30-minute call', 'Your idea stays confidential'].map((promise) => <li key={promise}><CircleCheck size={18} strokeWidth={2.4} className="cta-promise-icon" aria-hidden="true" />{promise}</li>)}</ul></div>
    <ul className="cta-options">
      {options.map((option) => <li key={option.label}><a href={option.href} {...(option.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
        <span className="cta-icon" aria-hidden="true"><option.icon size={22} strokeWidth={2} /></span>
        <span><b>{option.label}</b><small>{option.detail}</small></span><span className="cta-arrow" aria-hidden="true"><ArrowUpRight size={18} strokeWidth={2.4} /></span>
      </a></li>)}
    </ul>
    <span className="cta-rings" aria-hidden="true"><i /><i /><i /></span>
  </div></section>;
}
export function Trail({ items }: { items: { label: string; href?: string }[] }) {
  return <nav aria-label="Breadcrumb" className="trail"><Link href="/">Home</Link>{items.map((item, i) => <span key={`${i}-${item.label}`}><span aria-hidden="true">/</span>{item.href ? <Link href={item.href}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}</span>)}</nav>;
}
