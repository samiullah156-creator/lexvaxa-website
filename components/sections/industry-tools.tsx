import type { CSSProperties } from 'react';
import Link from 'next/link';
import { ArrowRight, Blocks, Bot, Globe, Plug, Smartphone, Workflow } from 'lucide-react';
import type { BuildOffering, ToolGroup } from '@/lib/data/industry-tools';
import styles from './industry-tools.module.css';

const FORMATS = [
  { icon: Globe, label: 'Web platforms & portals' },
  { icon: Smartphone, label: 'Mobile apps (iOS & Android)' },
  { icon: Workflow, label: 'Workflow automation' },
  { icon: Bot, label: 'AI agents & assistants' },
];

/**
 * Two offers, in the order development firms present them: custom software built for the industry
 * (named by software type), then integration with the software the team already uses (plain text
 * names, no logos, no partnership claim).
 */
export function IndustryTools({ groups, builds, label }: { groups?: readonly ToolGroup[]; builds?: readonly BuildOffering[]; label: string }) {
  if (!groups?.length && !builds?.length) return null;
  return <section className={`section container ${styles.section}`} aria-labelledby="industry-tools-title">
    <div className={styles.head}>
      <p className={styles.eyebrow}>{label}: build &amp; integrate</p>
      <h2 id="industry-tools-title">Custom software built for you, or your current tools connected<span>.</span></h2>
      <p>We build software from scratch when off-the-shelf tools don&apos;t fit, and integrate with the platforms your team already relies on when they do. Many projects combine both.</p>
    </div>

    {builds?.length ? <div className={styles.buildPanel}>
      <div className={styles.partHead}>
        <span className={styles.partIcon} aria-hidden="true"><Blocks size={18} /></span>
        <div><h3>Custom software development</h3><p>Built around your workflow and data, owned by you, with no per-seat licence.</p></div>
      </div>
      <ul className={styles.offerings}>
        {builds.map((offering, index) => <li key={offering.title} style={{ '--i': index } as CSSProperties}>
          <b>{offering.title}</b><span>{offering.text}</span>
        </li>)}
      </ul>
      <div className={styles.formats}>
        <span className={styles.formatsLabel}>Delivered as</span>
        <ul>{FORMATS.map(({ icon: Icon, label: format }) => <li key={format}><Icon size={15} aria-hidden="true" />{format}</li>)}</ul>
        <Link href="/contact" className={styles.buildLink}>Discuss a custom build<ArrowRight size={16} aria-hidden="true" /></Link>
      </div>
    </div> : null}

    {groups?.length ? <div className={styles.integrations}>
      <div className={styles.partHead}>
        <span className={`${styles.partIcon} ${styles.partIconBlue}`} aria-hidden="true"><Plug size={18} /></span>
        <div><h3>Integration with your current software</h3><p>Connected through official APIs, webhooks or exports, so your team keeps working where it already works.</p></div>
      </div>
      <div className={styles.grid}>
        {groups.map((group, index) => <article key={group.label} className={styles.group} style={{ '--i': index } as CSSProperties}>
          <h4>{group.label}</h4>
          <ul>{group.tools.map((tool) => <li key={tool}>{tool}</li>)}</ul>
        </article>)}
      </div>
      <p className={styles.note}>Product names belong to their owners and are listed to show compatibility, not partnership. Integration depth depends on each vendor&apos;s API access.</p>
    </div> : null}
  </section>;
}
