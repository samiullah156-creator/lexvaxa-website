import { COMPANY_STATS } from '@/lib/data/company-stats';
import styles from './company-stats.module.css';

/** A quiet band of company figures: large numbers, short labels, thin dividers. */
export function CompanyStats() {
  return <section className={styles.section} aria-label="Lexvaxa in numbers">
    <ul className={`container ${styles.list}`}>
      {COMPANY_STATS.map((stat) => <li key={stat.label}><b>{stat.value}</b><span>{stat.label}</span></li>)}
    </ul>
  </section>;
}
