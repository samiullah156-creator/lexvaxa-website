import { Briefcase, createLucideIcon, type LucideIcon } from 'lucide-react';
import { INDUSTRY_GLYPHS } from './industry-glyphs';
import styles from './service-badge.module.css';

/** Lexvaxa's own industry pictograms as icon components (same API as any lucide icon). */
export const INDUSTRY_ICONS: Record<string, LucideIcon> = Object.fromEntries(
  Object.entries(INDUSTRY_GLYPHS).map(([slug, nodes]) => [slug, createLucideIcon(`lexvaxa-industry-${slug}`, nodes as Parameters<typeof createLucideIcon>[1])]),
);
const PURPLE = new Set(['legal-services', 'healthcare-operations', 'ecommerce-retail', 'education-elearning', 'marketing-creative-agencies']);

/** Flat icon tile for an industry (same tile as the service badges). Decorative. */
export function IndustryBadge({ slug, size = 'md' }: { slug: string; size?: 'sm' | 'md' | 'lg' }) {
  const Icon = INDUSTRY_ICONS[slug] ?? Briefcase;
  return <span className={styles.badge} data-size={size} data-tone={PURPLE.has(slug) ? 'purple' : 'blue'} aria-hidden="true">
    <span className={styles.face}><Icon strokeWidth={1.9} /></span>
  </span>;
}
