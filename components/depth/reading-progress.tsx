'use client';

import { useEffect, useRef } from 'react';
import styles from './reading-progress.module.css';

/** Thin progress rail for long-form guides; follows the article element only. */
export function ReadingProgress({ target }: { target: string }) {
  const bar = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const article = document.querySelector<HTMLElement>(target);
    if (!article || !bar.current) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const bounds = article.getBoundingClientRect();
      const total = Math.max(1, bounds.height - window.innerHeight * 0.6);
      const progress = Math.min(1, Math.max(0, (window.innerHeight * 0.4 - bounds.top) / total));
      bar.current?.style.setProperty('transform', `scaleX(${progress.toFixed(4)})`);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); };
  }, [target]);

  return <div className={styles.rail} aria-hidden="true"><span ref={bar} /></div>;
}
