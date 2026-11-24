'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { COMPLETE_STATE, SERVICE_SYSTEMS } from '@/lib/data/service-systems';
import { SERVICE_VISUALS } from '@/lib/data/service-visuals';
import { LiveScene } from '@/components/depth/live-scene';
import { ModeSwitch } from '@/components/depth/mode-switch';
import styles from './service-system-preview.module.css';

/**
 * A service's system assembling on screen, with its connected capabilities.
 * Assembly replays the first time it scrolls into view; signals pause offscreen.
 */
let pageHydrated = false;

export function ServiceSystemPreview({ slug, label, compare = false }: { slug: string; label: string; compare?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const glowId = useId();
  const seen = useRef(false);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [reduced, setReduced] = useState(true);
  const [paused, setPaused] = useState(false);
  const [version, setVersion] = useState(0);
  const [manual, setManual] = useState(false);
  // Server render and hydration: static, finished scene. Mounted later (tab click): assemble now.
  const [assembleOnMount] = useState(() => typeof window !== 'undefined' && pageHydrated);
  useEffect(() => { pageHydrated = true; }, []);
  const system = SERVICE_SYSTEMS[slug];

  useEffect(() => {
    let initial = true;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => setReduced(preference.matches);
    const updatePage = () => setPageVisible(!document.hidden);
    updateMotion(); updatePage();
    preference.addEventListener('change', updateMotion);
    document.addEventListener('visibilitychange', updatePage);
    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
      // Mounted in view (e.g. a newly selected tab): its mount already assembles.
      if (initial) { initial = false; if (entry.isIntersecting) seen.current = true; }
      if (entry.isIntersecting && !seen.current) {
        seen.current = true;
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) setVersion((value) => value + 1);
      }
    }, { threshold: 0.3 });
    if (root.current && observer) observer.observe(root.current);
    else setVisible(true);
    return () => { observer?.disconnect(); preference.removeEventListener('change', updateMotion); document.removeEventListener('visibilitychange', updatePage); };
  }, []);

  if (!system) return null;
  const running = visible && pageVisible && !reduced && !paused && !manual;
  return <div ref={root} className={styles.preview} data-running={running} data-manual={manual}>
    <div className={styles.artwork} role="img" aria-label={label}>
      <LiveScene key={`${slug}:${version}`} system={system} state={COMPLETE_STATE} variant="card" instanceId="explorer" assemble={assembleOnMount || version > 0} running={running} />
      {!compare && <span className={styles.live} aria-hidden="true"><i />{running ? 'Live system' : 'System ready'}</span>}
      {/* Vector glow, not a background image: a large image here became the page's LCP element and was counted late. */}
      <svg className={styles.glow} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <defs><radialGradient id={glowId} cx=".5" cy=".55" r=".5"><stop offset="0" stopColor="#5fa5ff" stopOpacity=".55" /><stop offset=".45" stopColor="#167dfe" stopOpacity=".18" /><stop offset="1" stopColor="#167dfe" stopOpacity="0" /></radialGradient></defs>
        <rect width="100" height="100" fill={`url(#${glowId})`} />
      </svg>
    </div>
    {compare && <div className={styles.compare}>
      <ModeSwitch label="Automated workflow" off="Manual" on="Automated" checked={!manual} onChange={(next) => setManual(!next)} />
      <span aria-live="polite">{manual ? 'Each step waits for a person.' : 'Steps run on their own.'}</span>
    </div>}
    <div className={styles.footer}>
      <ol className={styles.chain} aria-label="Service workflow">
        {SERVICE_VISUALS[slug].steps.map((item) => <li key={item}>{item}</li>)}
      </ol>
      <div className={styles.controls}>
        <button type="button" aria-label={paused ? 'Resume system animation' : 'Pause system animation'} aria-pressed={paused} disabled={reduced} onClick={() => setPaused((value) => !value)}>
          {paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
        </button>
        <button type="button" aria-label="Replay system assembly" disabled={reduced} onClick={() => { setVersion((value) => value + 1); setPaused(false); }}>
          <RotateCcw size={15} aria-hidden="true" />
        </button>
      </div>
    </div>
  </div>;
}
