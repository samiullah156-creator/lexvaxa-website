'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Pause, Play } from 'lucide-react';
import { CdnImage } from '@/components/content/cdn-image';
import styles from './case-tour.module.css';

export type TourStep = { title: string; text: string; x: number; y: number; w: number; h: number };
type Shot = { src: string; alt: string; width: number; height: number };

const STEP_MS = 5200;

/**
 * A guided tour of a real project screenshot: a spotlight moves to each area while the caption explains
 * it. It advances on its own only while visible (and never with reduced motion); every step is also a
 * button, and all step text is in the server HTML.
 */
export function CaseTour({ name, image, steps }: { name: string; image: Shot; steps: TourStep[] }) {
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const root = useRef<HTMLElement>(null);
  const playing = visible && !paused && !reduced && steps.length > 1;

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(media.matches);
    const element = root.current;
    if (!element || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.45 });
    observer.observe(element);
    const onVisibility = () => { if (document.hidden) setVisible(false); };
    document.addEventListener('visibilitychange', onVisibility);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', onVisibility); };
  }, []);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => setActive((index) => (index + 1) % steps.length), STEP_MS);
    return () => window.clearTimeout(timer);
  }, [playing, active, steps.length]);

  const step = steps[active];
  const box = { '--x': `${step.x}%`, '--y': `${step.y}%`, '--w': `${step.w}%`, '--h': `${step.h}%` } as CSSProperties;

  return <section ref={root} className={styles.tour} aria-labelledby="case-tour-title" data-playing={playing || undefined}>
    <div className={styles.heading}>
      <p className={styles.eyebrow}>Guided walkthrough</p>
      <h2 id="case-tour-title">See how {name} works<span>.</span></h2>
    </div>
    <div className={styles.layout}>
      <figure className={styles.frame}>
        <span className={styles.shot}>
          <CdnImage src={image.src} alt={image.alt} width={image.width} height={image.height} sizes="(max-width: 980px) calc(100vw - 32px), 760px" loading="lazy" />
          <span className={styles.spot} style={box} aria-hidden="true" />
          <span className={styles.caption} aria-live="polite">
            <span className={styles.badge}>{active + 1}</span>
            <span><small>Step {active + 1} of {steps.length}</small>{step.title}</span>
          </span>
        </span>
      </figure>
      <div className={styles.side}>
        <ol className={styles.steps}>
          {steps.map((item, index) => <li key={item.title}>
            <button type="button" className={styles.step} aria-current={index === active ? 'step' : undefined} onClick={() => setActive(index)}>
              <span className={styles.num}>{String(index + 1).padStart(2, '0')}</span>
              <span className={styles.stepText}><b>{item.title}</b><span>{item.text}</span></span>
              {index === active && <i key={`${active}-${String(playing)}`} className={styles.progress} aria-hidden="true" />}
            </button>
          </li>)}
        </ol>
        {steps.length > 1 && !reduced && <button type="button" className={styles.toggle} onClick={() => setPaused((value) => !value)} aria-pressed={paused}>
          {paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}{paused ? 'Play walkthrough' : 'Pause walkthrough'}
        </button>}
      </div>
    </div>
  </section>;
}
