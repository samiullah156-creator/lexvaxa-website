'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { industries } from '@/lib/data/industries';
import { industryDetails } from '@/lib/data/industry-details';
import { IndustryBadge } from '@/components/depth/industry-badge';
import { IndustryScene } from '@/components/steel/industry-scenes';
import styles from './industry-explorer.module.css';

/** The opening sentence of a longer answer; the industry page carries the rest. */
const firstSentence = (text: string) => text.match(/^.+?[.!?](?=\s|$)/)?.[0] ?? text;

/** Tabbed industry explorer: each sector with its 3D model, a direct answer and practical use cases. */
export function IndustryExplorer() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const strip = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const measure = useCallback(() => {
    const node = strip.current;
    if (!node) return;
    setEdges({ start: node.scrollLeft <= 4, end: node.scrollLeft + node.clientWidth >= node.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    const node = strip.current;
    if (!node) return;
    measure();
    node.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    return () => { node.removeEventListener('scroll', measure); window.removeEventListener('resize', measure); };
  }, [measure]);

  // Keep the selected sector's tab in view inside the strip (never scrolls the page itself).
  useEffect(() => {
    const node = strip.current, tab = tabs.current[active];
    if (!node || !tab) return;
    const box = node.getBoundingClientRect(), item = tab.getBoundingClientRect();
    const left = node.scrollLeft + (item.left - box.left) - (box.width - item.width) / 2;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    node.scrollTo({ left: Math.max(0, left), behavior: still ? 'auto' : 'smooth' });
  }, [active]);

  const step = (direction: 1 | -1) => setActive((value) => (value + direction + industries.length) % industries.length);
  const industry = industries[active], detail = industryDetails[industry.slug];
  const move = (event: KeyboardEvent, index: number) => {
    const next = event.key === 'ArrowRight' ? index + 1 : event.key === 'ArrowLeft' ? index - 1 : event.key === 'Home' ? 0 : event.key === 'End' ? industries.length - 1 : null;
    if (next === null) return;
    event.preventDefault();
    const target = (next + industries.length) % industries.length;
    setActive(target); tabs.current[target]?.focus();
  };
  return <div className={styles.explorer}>
    <div className={styles.tabBar} data-start={edges.start} data-end={edges.end}>
    <button type="button" className={styles.stepButton} onClick={() => step(-1)} aria-label="Previous industry"><ChevronLeft size={18} aria-hidden="true" /></button>
    <div ref={strip} className={styles.tabs} role="tablist" aria-label="Industries">
      {industries.map((item, index) => <button key={item.slug} ref={(node) => { tabs.current[index] = node; }} type="button" role="tab"
        id={`industry-tab-${item.slug}`} aria-selected={index === active} aria-controls="industry-panel" tabIndex={index === active ? 0 : -1}
        className={styles.tab} onClick={() => setActive(index)} onKeyDown={(event) => move(event, index)}>
        <IndustryBadge slug={item.slug} size="sm" /><span>{item.name}</span>
      </button>)}
    </div>
    <button type="button" className={styles.stepButton} onClick={() => step(1)} aria-label="Next industry"><ChevronRight size={18} aria-hidden="true" /></button>
    <span className={styles.count} aria-hidden="true">{String(active + 1).padStart(2, '0')} / {String(industries.length).padStart(2, '0')}</span>
    </div>
    <div id="industry-panel" role="tabpanel" aria-labelledby={`industry-tab-${industry.slug}`} className={styles.panel} key={industry.slug}>
      <div className={styles.copy}>
        <p className={styles.kicker}>Industry applications</p>
        <h3>{industry.name}</h3>
        <p className={styles.answer}>{firstSentence(detail.answer)}</p>
        <ul className={styles.cases}>{detail.useCases.map((useCase, index) => <li key={useCase.title} style={{ '--i': index } as CSSProperties}><Check size={16} aria-hidden="true" /><span><b>{useCase.title}</b></span></li>)}</ul>
        <Link href={`/industries/${industry.slug}`} className={styles.cta}>Explore {industry.name.toLowerCase()} <span aria-hidden="true"><ArrowRight size={17} /></span></Link>
      </div>
      <div className={styles.side}>
        <div className={styles.visual}><IndustryScene slug={industry.slug} id={`home-${industry.slug}`} /></div>
      </div>
    </div>
  </div>;
}
