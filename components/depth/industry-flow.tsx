import type { CSSProperties } from 'react';
import styles from './industry-flow.module.css';

/** A typical request moving through an industry workflow: four numbered steps, plus the systems it touches. */
export function IndustryFlow({ flow, systems, label }: { flow: readonly string[]; systems: readonly string[]; label: string }) {
  return <div className={styles.flow}>
    <p className={styles.caption}>How a request flows</p>
    <ol className={styles.steps} aria-label={`${label} workflow`}>
      {flow.map((step, index) => <li key={step} style={{ '--i': index } as CSSProperties} data-ai={index === 1}>
        <span className={styles.node} aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
        <span className={styles.text}>{step}</span>
      </li>)}
    </ol>
    <p className={styles.caption}>Connects with</p>
    <ul className={styles.systems}>{systems.map((system, index) => <li key={system} style={{ '--i': index } as CSSProperties}>{system}</li>)}</ul>
  </div>;
}
