'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import styles from './brand-orbit.module.css';

type BrandOrbitProps = { id?: string; compact?: boolean };

/** A brand illustration of connected disciplines, rather than live system status. */
export function BrandOrbit({ id, compact = false }: BrandOrbitProps) {
  const generatedId = useId();
  const figure = useRef<HTMLElement>(null);
  const instanceId = id ?? `brand-orbit-${generatedId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const titleId = `${instanceId}-title`;
  const descriptionId = `${instanceId}-description`;
  const canvasId = `${instanceId}-canvas`;
  const [enhanced, setEnhanced] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setReduced(media.matches);
    const updateVisibility = () => setPageVisible(!document.hidden);
    updatePreference();
    updateVisibility();
    setEnhanced(true);
    media.addEventListener('change', updatePreference);
    document.addEventListener('visibilitychange', updateVisibility);
    const node = figure.current;
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

  const running = enhanced && !reduced && visible && pageVisible && !paused;

  return (
    <figure ref={figure} id={instanceId} className={styles.figure} aria-labelledby={titleId} aria-describedby={descriptionId}
      data-compact={compact} data-enhanced={enhanced} data-reduced={reduced} data-running={running} data-paused={paused}>
      <figcaption className={styles.caption}>
        <div className={styles.captionCopy}><p className={styles.eyebrow}>Engineering, connected</p><p id={titleId} className={styles.title}>One connected system<span>.</span></p></div>
        <button type="button" hidden={!enhanced || reduced} className={styles.control} aria-controls={canvasId} aria-pressed={paused}
          aria-label={paused ? 'Resume orbital animation' : 'Pause orbital animation'} title={paused ? 'Resume animation' : 'Pause animation'}
          onClick={() => setPaused((current) => !current)}>
          {paused ? <Play size={15} aria-hidden="true" /> : <Pause size={15} aria-hidden="true" />}
          <span>{paused ? 'Resume' : 'Pause'}</span>
        </button>
      </figcaption>

      <svg id={canvasId} className={styles.canvas} viewBox="0 0 560 430" width="560" height="430" fill="none"
        aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
        <g className={styles.rings} strokeWidth="1.25">
          <circle cx="280" cy="215" r="85" className={styles.ringData} />
          <circle cx="280" cy="215" r="139" className={styles.ringSoftware} />
          <circle cx="280" cy="215" r="192" className={styles.ringAi} />
        </g>
        <g transform="translate(280 215)">
          <g className={`${styles.rotor} ${styles.orbitData}`} data-orbit="data"><circle cx="85" r="8" className={styles.nodeData} /><circle cx="85" r="13" className={styles.nodeOutline} /></g>
          <g className={`${styles.rotor} ${styles.orbitSoftware}`} data-orbit="software"><circle cx="139" r="8" className={styles.nodeSoftware} /><circle cx="139" r="13" className={styles.nodeOutline} /></g>
          <g className={`${styles.rotor} ${styles.orbitAi}`} data-orbit="ai"><circle cx="192" r="8" className={styles.nodeAi} /><circle cx="192" r="13" className={styles.nodeOutline} /></g>
          <g className={`${styles.rotor} ${styles.coreArcs}`} data-object="core-arcs" strokeWidth="3" strokeLinecap="round">
            <path d="M-46.9-55.9A73 73 0 0 1 25-68.6" className={styles.arcData} />
            <path d="M46.9 55.9A73 73 0 0 1-25 68.6" className={styles.arcSoftware} />
          </g>
          <g className={styles.coreIntro}>
            <circle r="61" className={styles.coreOuter} /><circle r="53" className={styles.coreInner} />
            <path d="m-18-19 36 0-18 30Z" className={styles.coreConnections} strokeWidth="1.5" strokeLinejoin="round" />
            <circle cx="-18" cy="-19" r="5" className={styles.nodeData} /><circle cx="18" cy="-19" r="5" className={styles.nodeSoftware} /><circle cy="11" r="5" className={styles.nodeAi} />
            <text y="39" textAnchor="middle" className={styles.coreLabel}>Workflow</text>
          </g>
        </g>
      </svg>

      <ul className={styles.legend} aria-label="Connected disciplines"><li><span className={styles.swatchData} aria-hidden="true" />Data</li><li><span className={styles.swatchSoftware} aria-hidden="true" />Software</li><li><span className={styles.swatchAi} aria-hidden="true" />AI</li></ul>
      <p id={descriptionId} className={styles.description}>Data, software and AI, connected around the way your business works.</p>
    </figure>
  );
}
