'use client';

import { useId, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Calculator } from 'lucide-react';
import { estimateRoi, type RoiPreset } from '@/lib/roi';
import styles from './roi-estimator.module.css';

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const whole = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const oneDecimal = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });

type Field = { key: 'volume' | 'minutes' | 'share' | 'hourlyCost'; label: string; min: number; max: number; step: number; suffix: string };

/**
 * ROI estimate from the visitor's own numbers: how much time and money a system could give back each
 * month and year, and how fast an optional budget pays back. Starts from example figures that are
 * labelled as such; nothing here is a promised result. Works without JavaScript as a static example.
 */
export function RoiEstimator({ preset, context, headingLevel = 2 }: { preset: RoiPreset; context: string; headingLevel?: 2 | 3 }) {
  const id = useId();
  const [values, setValues] = useState({ volume: preset.volume, minutes: preset.minutes, share: preset.share, hourlyCost: preset.hourlyCost });
  const [budget, setBudget] = useState(0);
  const result = estimateRoi(values, budget);
  const Title = headingLevel === 2 ? 'h2' : 'h3';

  const fields: Field[] = [
    { key: 'volume', label: `${preset.unit[0].toUpperCase()}${preset.unit.slice(1)} per month`, min: 10, max: Math.max(5000, preset.volume * 4), step: 10, suffix: '' },
    { key: 'minutes', label: 'Minutes of manual work each', min: 1, max: 120, step: 1, suffix: ' min' },
    { key: 'share', label: 'Share the system takes over', min: 10, max: 90, step: 5, suffix: '%' },
    { key: 'hourlyCost', label: 'Staff cost per hour (USD)', min: 5, max: 150, step: 1, suffix: '' },
  ];

  return <section className={styles.roi} aria-labelledby={`${id}-title`}>
    <div className={styles.intro}>
      <p className={styles.label}><Calculator size={14} aria-hidden="true" />ROI estimate</p>
      <Title id={`${id}-title`}>What could this give back to {context}?</Title>
      <p>Work it out with your own numbers. The starting figures are only examples for <b>{preset.task.toLowerCase()}</b>; change them to match your team.</p>
    </div>

    <div className={styles.panel}>
      <div className={styles.inputs}>
        {fields.map((field) => {
          const value = values[field.key];
          const fill = ((value - field.min) / (field.max - field.min)) * 100;
          return <label key={field.key} className={styles.field}>
            <span className={styles.fieldTop}><span>{field.label}</span><output htmlFor={`${id}-${field.key}`}>{field.key === 'hourlyCost' ? money.format(value) : whole.format(value) + field.suffix}</output></span>
            <input id={`${id}-${field.key}`} type="range" min={field.min} max={field.max} step={field.step} value={value} style={{ '--fill': `${Math.min(100, Math.max(0, fill))}%` } as CSSProperties}
              onChange={(event) => setValues((current) => ({ ...current, [field.key]: Number(event.target.value) }))} />
          </label>;
        })}
        <label className={styles.budget}>
          <span>Project budget, optional (USD)</span>
          <input type="number" inputMode="numeric" min={0} step={500} placeholder="e.g. 15000" value={budget || ''} onChange={(event) => setBudget(Math.max(0, Number(event.target.value) || 0))} />
        </label>
      </div>

      <div className={styles.results} aria-live="polite">
        <div className={styles.big}><small>Value of time saved per year</small><b>{money.format(result.yearly)}</b></div>
        <dl>
          <div><dt>Hours back each month</dt><dd>{whole.format(result.hours)} h</dd></div>
          <div><dt>Value each month</dt><dd>{money.format(result.monthly)}</dd></div>
          <div><dt>Equal to full-time staff</dt><dd>{oneDecimal.format(result.people)}</dd></div>
          <div><dt>Payback</dt><dd>{result.paybackMonths === undefined ? 'Add a budget' : result.paybackMonths < 1 ? 'Under 1 month' : `${oneDecimal.format(result.paybackMonths)} months`}</dd></div>
        </dl>
        <p className={styles.note}>An estimate of staff time only, from the numbers above. It leaves out faster replies, fewer errors and extra sales, and it is not a guaranteed result. We confirm real figures with you in discovery.</p>
        <Link href="/contact" className={styles.cta}>Get a costed plan for your numbers <ArrowUpRight size={16} aria-hidden="true" /></Link>
      </div>
    </div>
  </section>;
}
