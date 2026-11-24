import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import styles from './challenge-solution.module.css';

/** The case study in one glance: the problem, an animated hand-off, and what was built in response. */
export function ChallengeSolution({ challenge, solution }: { challenge: string; solution: string }) {
  return <div className={styles.wrap}>
    <section className={`${styles.card} ${styles.challenge}`} aria-labelledby="project-challenge-title">
      <span className={styles.badge} aria-hidden="true"><AlertTriangle size={18} /></span>
      <p className={styles.step}>01</p>
      <h3 id="project-challenge-title">The challenge</h3>
      <p>{challenge}</p>
    </section>
    <svg className={styles.connector} viewBox="0 0 120 60" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="cs-line" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#f59e0b" /><stop offset=".5" stopColor="#9533fa" /><stop offset="1" stopColor="#167dfe" /></linearGradient>
      </defs>
      <path d="M6 30C36 30 40 10 60 10S84 30 114 30" className={styles.track} />
      <path d="M6 30C36 30 40 10 60 10S84 30 114 30" className={styles.flow} stroke="url(#cs-line)" pathLength={100} />
      <circle r="4" className={styles.dot}><animateMotion dur="2.4s" repeatCount="indefinite" path="M6 30C36 30 40 10 60 10S84 30 114 30" /></circle>
      <path d="M106 24l8 6-8 6" className={styles.head} />
    </svg>
    <section className={`${styles.card} ${styles.solution}`} aria-labelledby="project-solution-title">
      <span className={styles.badge} aria-hidden="true"><CheckCircle2 size={18} /></span>
      <p className={styles.step}>02</p>
      <h3 id="project-solution-title">The solution</h3>
      <p>{solution}</p>
    </section>
  </div>;
}
