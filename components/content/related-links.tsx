import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Eyebrow } from '@/components/ui';
import { HUBS, type RelatedLink } from '@/lib/related';
import styles from './related-links.module.css';

type Group = { title: string; links: RelatedLink[]; allHref?: string; allLabel?: string };

/** "Keep exploring": contextual links to related guides, projects, industries and services. */
export function RelatedLinks({ id, eyebrow = 'Keep exploring', title, groups, soft = false }: { id: string; eyebrow?: string; title: string; groups: Group[]; soft?: boolean }) {
  const filled = groups.filter((group) => group.links.length > 0);
  if (filled.length === 0) return null;
  return <section className={`section ${soft ? 'section-soft' : ''}`} aria-labelledby={id}>
    <div className="container">
      <div className={styles.heading}><Eyebrow>{eyebrow}</Eyebrow><h2 id={id}>{title}</h2></div>
      <div className={styles.groups} data-count={filled.length}>
        {filled.map((group) => <nav key={group.title} className={styles.group} aria-label={group.title}>
          <h3 className={styles.groupTitle}>{group.title}</h3>
          <ul>
            {group.links.map((link) => <li key={link.href}>
              <Link href={link.href} className={styles.link}>
                <span className={styles.label}>{link.label}</span>
                <span className={styles.title}>{link.title}<ArrowUpRight size={16} aria-hidden="true" /></span>
                <span className={styles.description}>{link.description}</span>
              </Link>
            </li>)}
          </ul>
          {group.allHref && <Link href={group.allHref} className={styles.all}>{group.allLabel ?? 'View all'} <ArrowRight size="1em" className="inline-icon" aria-hidden="true" /></Link>}
        </nav>)}
      </div>
    </div>
  </section>;
}

/** Compact row linking the section hubs to each other (excluding the current one). */
export function HubLinks({ current, title = 'Explore Lexvaxa' }: { current?: string; title?: string }) {
  const hubs = HUBS.filter((hub) => hub.href !== current);
  return <nav className={`container ${styles.hubs}`} aria-label={title}>
    <p className={styles.hubsTitle}>{title}</p>
    <ul>{hubs.map((hub) => <li key={hub.href}><Link href={hub.href} className={styles.hub}>
      <span className={styles.label}>{hub.label}</span><b>{hub.title}<ArrowUpRight size={15} aria-hidden="true" /></b><small>{hub.description}</small>
    </Link></li>)}</ul>
  </nav>;
}
