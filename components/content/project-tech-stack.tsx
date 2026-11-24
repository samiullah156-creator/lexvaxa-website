'use client';

import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { Pause, Play } from 'lucide-react';
import styles from './project-tech-stack.module.css';

type ProjectTechStackProps = {
  technologies: readonly string[];
  projectName: string;
  id?: string;
};

/** The original semantic list stays readable until motion is safe to enhance. */
export function ProjectTechStack({ technologies, projectName, id }: ProjectTechStackProps) {
  const section = useRef<HTMLElement>(null);
  const instance = useId();
  const headingId = `${id ?? instance}-heading`;
  const trackId = `${id ?? instance}-track`;
  const [enhanced, setEnhanced] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [visible, setVisible] = useState(false);
  const [documentVisible, setDocumentVisible] = useState(true);
  const [paused, setPaused] = useState(false);
  const stack = [...new Set(technologies)];
  // Enough copies to cover wide screens while moving by exactly one list.
  const copies = Math.max(3, Math.ceil(9 / Math.max(1, stack.length)));

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setReduced(media.matches);
    const updateVisibility = () => setDocumentVisible(!document.hidden);
    updatePreference();
    updateVisibility();
    setEnhanced(true);
    media.addEventListener('change', updatePreference);
    document.addEventListener('visibilitychange', updateVisibility);
    const node = section.current;
    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver((entries) => {
      const entry = entries.find((item) => item.target === node);
      if (entry) setVisible(entry.isIntersecting);
    }, { threshold: 0 });
    if (node && observer) observer.observe(node);
    else setVisible(true);
    return () => {
      media.removeEventListener('change', updatePreference);
      document.removeEventListener('visibilitychange', updateVisibility);
      observer?.disconnect();
    };
  }, []);

  if (stack.length === 0) return null;
  const running = enhanced && !reduced && visible && documentVisible && !paused;
  const motionStyle = {
    '--stack-copies': copies + 1,
    '--stack-duration': `${Math.max(24, stack.length * 8)}s`,
    '--stack-static-rows': Math.ceil(stack.length / 2),
  } as CSSProperties;

  return (
    <section ref={section} id={id} className={styles.section} aria-labelledby={headingId}
      data-enhanced={enhanced} data-reduced={reduced} data-running={running} data-paused={paused} style={motionStyle}>
      <div className={styles.heading}>
        <div><p className={styles.eyebrow}>Tools behind the experience</p><h2 id={headingId}>Technology stack<span>.</span></h2></div>
        <button type="button" hidden={!enhanced || reduced} className={styles.control}
          aria-controls={trackId} aria-pressed={paused}
          aria-label={paused ? 'Resume technology stack scrolling' : 'Pause technology stack scrolling'}
          title={paused ? 'Resume scrolling' : 'Pause and show the full stack'} onClick={() => setPaused((current) => !current)}>
          {paused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
          <span className={styles.controlText}>{paused ? 'Resume scrolling' : 'Pause scrolling'}</span>
        </button>
      </div>
      <div id={trackId} className={styles.viewport}>
        <div className={styles.rail}>
          <ul className={styles.list} aria-label={`${projectName} technology stack`}>
            {stack.map((technology, index) => <li key={technology} className={styles.tile}>
              <span className={styles.tileMeta} aria-hidden="true">PROJECT STACK / {String(index + 1).padStart(2, '0')}</span><span>{technology}</span>
            </li>)}
          </ul>
          {Array.from({ length: copies }, (_, copy) => (
            <ul key={copy} className={`${styles.list} ${styles.copy}`} aria-hidden="true" inert>
              {stack.map((technology, index) => <li key={technology} className={styles.tile}>
                <span className={styles.tileMeta}>PROJECT STACK / {String(index + 1).padStart(2, '0')}</span><span>{technology}</span>
              </li>)}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
