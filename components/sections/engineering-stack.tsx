import type { CSSProperties } from 'react';
import Link from 'next/link';
import { ArrowRight, BrainCircuit, Bot, Database, Code2, Cloud, Building2, type LucideIcon } from 'lucide-react';
import { engineeringAreas } from '@/lib/data/engineering-stack';
import styles from './engineering-stack.module.css';

const ICONS: Record<string, LucideIcon> = { ml: BrainCircuit, llm: Bot, data: Database, product: Code2, cloud: Cloud, saas: Building2 };

/** Enterprise and SaaS engineering: six areas, each with what it is for and the tools behind it. */
export function EngineeringStack({ id = 'engineering-stack-title' }: { id?: string }) {
  return <section className={`section container ${styles.section}`} aria-labelledby={id}>
    <div className={styles.head}>
      <div>
        <p className={styles.eyebrow}>Enterprise &amp; SaaS engineering</p>
        <h2 id={id}>From one automation to a full SaaS product<span>.</span></h2>
      </div>
      <p>The engineering we choose from for enterprise systems and SaaS products. Each project uses only the parts it needs, picked after we understand the workflow, the data and who will run it.</p>
    </div>
    <div className={styles.grid}>
      {engineeringAreas.map((area, index) => {
        const Icon = ICONS[area.id] ?? Code2;
        return <article key={area.id} className={styles.card} style={{ '--i': index } as CSSProperties}>
          <span className={styles.icon} aria-hidden="true"><Icon size={20} strokeWidth={1.8} /></span>
          <h3>{area.title}</h3>
          <p>{area.summary}</p>
          <ul aria-label={`${area.title} tools`}>{area.tools.map((tool) => <li key={tool}>{tool}</li>)}</ul>
        </article>;
      })}
    </div>
    <div className={styles.foot}>
      <p>We also design and build SaaS products end to end: discovery, MVP, multi-tenant platform, billing and launch.</p>
      <Link href="/services/saas-ai-product-development">SaaS product development<ArrowRight size={16} aria-hidden="true" /></Link>
    </div>
  </section>;
}
