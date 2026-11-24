'use client';

import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import styles from './nav-panel.module.css';

export type NavLatest = { slug: string; title: string; category: string; readingTime: string };

const WHO = [
  { href: '/about', title: 'About Lexvaxa', text: 'Who we are, how we work and the team behind it.' },
  { href: '/work', title: 'Our Work', text: 'Case studies of products we have built and launched.' },
  { href: '/careers', title: 'Careers', text: 'Open roles. We are hiring engineers and designers.' },
  { href: '/contact', title: 'Contact', text: 'Talk to an engineer about your project.' },
];

/** The smaller drop-down panels of the header ("Who We Are", "What We Think"). Words first, no decoration. */
export function NavPanel({ id, kind, latest, onNavigate }: { id: string; kind: 'who' | 'think'; latest: readonly NavLatest[]; onNavigate: () => void }) {
  if (kind === 'who') {
    return <div id={id} className={styles.panel} role="region" aria-label="Who we are">
      <ul className={styles.list}>{WHO.map((item) => <li key={item.href}><Link href={item.href} onClick={onNavigate}>
        <b>{item.title}<ArrowUpRight size={14} aria-hidden="true" /></b><span>{item.text}</span>
      </Link></li>)}</ul>
    </div>;
  }
  return <div id={id} className={`${styles.panel} ${styles.wide}`} role="region" aria-label="What we think">
    <div className={styles.intro}>
      <p className={styles.heading}>Insights</p>
      <p>Practical guides on AI, automation and software decisions, written by the engineers who build them.</p>
      <Link href="/insights" onClick={onNavigate} className={styles.all}>All insights <ArrowRight size={15} aria-hidden="true" /></Link>
    </div>
    <div>
      <p className={styles.heading}>Latest</p>
      <ul className={styles.list}>{latest.map((item) => <li key={item.slug}><Link href={`/insights/${item.slug}`} onClick={onNavigate}>
        <b>{item.title}</b><span>{item.category} · {item.readingTime}</span>
      </Link></li>)}</ul>
    </div>
  </div>;
}
