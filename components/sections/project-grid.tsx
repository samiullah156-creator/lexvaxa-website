'use client';

import { Children, useState, type ReactNode } from 'react';
import styles from './project-grid.module.css';

export type ProjectFilter = { slug: string; label: string; count: number };
export type ProjectGridItem = { slug: string; services: readonly string[] };

/**
 * Every project on one page, with service filters. The server renders all cards (search engines and
 * visitors without JavaScript see the full portfolio); a filter only hides the cards that do not match.
 */
export function ProjectGrid({ filters, items, children }: { filters: readonly ProjectFilter[]; items: readonly ProjectGridItem[]; children: ReactNode }) {
  const [active, setActive] = useState('all');
  const cards = Children.toArray(children);
  const matches = (item: ProjectGridItem) => active === 'all' || item.services.includes(active);
  const shown = items.filter(matches).length;
  const activeLabel = filters.find((filter) => filter.slug === active)?.label;

  return <div className={styles.wrap}>
    <div className={styles.filters} role="group" aria-label="Filter projects by service">
      <button type="button" aria-pressed={active === 'all'} onClick={() => setActive('all')}>All projects<span>{items.length}</span></button>
      {filters.map((filter) => (
        <button key={filter.slug} type="button" aria-pressed={active === filter.slug} onClick={() => setActive(filter.slug)}>
          {filter.label}<span>{filter.count}</span>
        </button>
      ))}
    </div>
    <p className={styles.status} aria-live="polite">
      {activeLabel ? `${shown} ${shown === 1 ? 'project' : 'projects'} in ${activeLabel}` : `${shown} projects`}
    </p>
    <ul className={styles.grid} role="list">
      {cards.map((card, index) => <li key={items[index]?.slug ?? index} hidden={!items[index] || !matches(items[index])}>{card}</li>)}
    </ul>
  </div>;
}
