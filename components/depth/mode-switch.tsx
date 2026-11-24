'use client';

import styles from './mode-switch.module.css';

/**
 * A two-position control (Manual | Automated, Office hours | After hours) used on visuals across the
 * site. One button with role="switch": both positions stay readable and the thumb slides to the active one.
 */
export function ModeSwitch({ label, off, on, checked, onChange, className }: {
  label: string;
  off: string;
  on: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  className?: string;
}) {
  return <button type="button" role="switch" aria-checked={checked} aria-label={label} className={`${styles.switch} ${className ?? ''}`} data-checked={checked} onClick={() => onChange(!checked)}>
    <span className={styles.thumb} aria-hidden="true" />
    <span className={styles.option} data-active={!checked} aria-hidden="true">{off}</span>
    <span className={styles.option} data-active={checked} aria-hidden="true"><i className={styles.dot} />{on}</span>
  </button>;
}
