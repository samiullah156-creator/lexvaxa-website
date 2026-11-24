import { serviceIcon } from './service-icons';
import styles from './service-badge.module.css';

/** Services that read as conversation/visibility work carry the purple brand tone; build work carries blue. */
const PURPLE = new Set(['conversational-voice-ai', 'ai-search-optimization', 'digital-marketing-growth', 'generative-ai-ml-engineering']);

/** Flat icon tile for a service: Lexvaxa's own pictogram in ink with one brand accent. Decorative. */
export function ServiceBadge({ slug, size = 'md', className }: { slug: string; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const Icon = serviceIcon(slug);
  return <span className={`${styles.badge}${className ? ` ${className}` : ''}`} data-size={size} data-tone={PURPLE.has(slug) ? 'purple' : 'blue'} aria-hidden="true">
    <span className={styles.face}><Icon strokeWidth={1.9} /></span>
  </span>;
}
