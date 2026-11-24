'use client';

import { useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { TiltSurface } from './tilt-surface';
import styles from './service-map-3d.module.css';

export type MapService = { slug: string; name: string; token: string; related: readonly string[] };

/** Three capability clusters laid out as columns on the board. */
export const MAP_GROUPS = [
  { id: 'ai', label: 'AI & automation', slugs: ['ai-agents-intelligent-automation', 'generative-ai-ml-engineering', 'conversational-voice-ai'] },
  { id: 'build', label: 'Software & data', slugs: ['custom-software-web-apps', 'saas-ai-product-development', 'rag-data-business-intelligence'] },
  { id: 'growth', label: 'Connected growth', slugs: ['crm-revenue-automation', 'ai-search-optimization', 'digital-marketing-growth'] },
] as const;

const COLUMN = [17, 50, 83];
const ROW = [19, 50, 81];

function position(slug: string) {
  for (const [column, group] of MAP_GROUPS.entries()) {
    const row = (group.slugs as readonly string[]).indexOf(slug);
    if (row >= 0) return { x: COLUMN[column], y: ROW[row], group: group.id };
  }
  return { x: 50, y: 50, group: 'build' };
}

type ServiceMap3DProps = {
  services: readonly MapService[];
  /** Raise and emphasise a subset (e.g. the services an industry uses). */
  highlight?: readonly string[];
  label: string;
  className?: string;
};

/**
 * CSS 3D board: real solids (top + four sides) on a tilted plane, billboard labels
 * facing the viewer, and traces for related services. Every block is a link.
 */
export function ServiceMap3D({ services, highlight, label, className }: ServiceMap3DProps) {
  const [active, setActive] = useState<string | null>(null);
  const bySlug = new Map(services.map((service) => [service.slug, service]));
  const wires = new Map<string, { a: string; b: string }>();
  for (const service of services) for (const other of service.related) {
    if (!bySlug.has(other)) continue;
    const key = [service.slug, other].sort().join('|');
    if (!wires.has(key)) wires.set(key, { a: service.slug, b: other });
  }
  const lit = (slug: string) => active === slug || (active === null && Boolean(highlight?.includes(slug)));
  const connected = (slug: string) => active !== null && Boolean(bySlug.get(active)?.related.includes(slug));

  return <div className={[styles.map, className].filter(Boolean).join(' ')} data-focused={active !== null || Boolean(highlight?.length)}>
    <TiltSurface max={5} className={styles.scene}>
      <div className={styles.board}>
        <div className={styles.plate} />
        {MAP_GROUPS.map((group, index) => <div key={group.id} className={styles.pad} data-group={group.id} style={{ '--x': `${COLUMN[index]}%` } as CSSProperties} />)}
        <svg className={styles.wires} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          {[...wires.values()].map(({ a, b }) => {
            const from = position(a), to = position(b);
            const on = active !== null && (active === a || active === b);
            const hl = active === null && Boolean(highlight?.includes(a) && highlight.includes(b));
            return <path key={`${a}-${b}`} d={`M${from.x} ${from.y}L${to.x} ${from.y}L${to.x} ${to.y}`} className={styles.wire} data-on={on || hl} />;
          })}
        </svg>
        {services.map((service) => {
          const spot = position(service.slug);
          return <Link key={service.slug} href={`/services/${service.slug}`} className={styles.block} aria-label={service.name}
            data-group={spot.group} data-lit={lit(service.slug)} data-linked={connected(service.slug)}
            data-dim={(active !== null && active !== service.slug && !connected(service.slug)) || (active === null && Boolean(highlight?.length) && !highlight?.includes(service.slug))}
            style={{ '--x': `${spot.x}%`, '--y': `${spot.y}%` } as CSSProperties}
            onPointerEnter={() => setActive(service.slug)} onPointerLeave={() => setActive(null)}
            onFocus={() => setActive(service.slug)} onBlur={() => setActive(null)}>
            <span className={styles.solid}>
              <span className={`${styles.face} ${styles.top}`}><i /></span>
              <span className={`${styles.face} ${styles.front}`} />
              <span className={`${styles.face} ${styles.back}`} />
              <span className={`${styles.face} ${styles.right}`} />
              <span className={`${styles.face} ${styles.left}`} />
              <span className={styles.billboard} aria-hidden="true">{service.token}</span>
            </span>
          </Link>;
        })}
      </div>
    </TiltSurface>
    <ul className={styles.legend} aria-label="Capability clusters">
      {MAP_GROUPS.map((group) => <li key={group.id} data-group={group.id}>{group.label}</li>)}
    </ul>
    <p className={styles.caption} aria-live="polite">{active ? <><b>{bySlug.get(active)?.name}</b> connects with {bySlug.get(active)?.related.filter((slug) => bySlug.has(slug)).map((slug) => bySlug.get(slug)!.token).join(', ')}</> : label}</p>
  </div>;
}
