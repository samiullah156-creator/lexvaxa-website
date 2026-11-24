'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { SERVICE_SYSTEMS, storyState } from '@/lib/data/service-systems';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { LiveScene } from '@/components/depth/live-scene';
import { moduleIcon } from '@/components/depth/service-icons';
import styles from './service-story.module.css';

/**
 * Scroll-driven delivery story: the step crossing the middle of the viewport
 * sets the diagram state, so the system visibly assembles as the visitor reads.
 */
export function ServiceStory({ slug, serviceName }: { slug: string; serviceName: string }) {
  const system = SERVICE_SYSTEMS[slug];
  const steps = system.story;
  // Server HTML shows the finished system; the client rewinds before the section is reached.
  const [active, setActive] = useState(steps.length - 1);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const items = useRef<(HTMLLIElement | null)[]>([]);
  const section = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = section.current;
    if (!element) return;
    const updatePage = () => setPageVisible(!document.hidden);
    updatePage(); document.addEventListener('visibilitychange', updatePage);
    if (element.getBoundingClientRect().top > window.innerHeight * 0.5) setActive(0);
    const stepObserver = new IntersectionObserver((entries) => {
      const crossing = entries.filter((entry) => entry.isIntersecting).map((entry) => Number((entry.target as HTMLElement).dataset.index));
      if (crossing.length) setActive(Math.max(...crossing));
    }, { rootMargin: '-46% 0px -46% 0px' });
    items.current.forEach((item) => item && stepObserver.observe(item));
    const sectionObserver = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    sectionObserver.observe(element);
    return () => { stepObserver.disconnect(); sectionObserver.disconnect(); document.removeEventListener('visibilitychange', updatePage); };
  }, []);

  // Autoplay walks the remaining steps without moving the page.
  useEffect(() => {
    if (!playing) return;
    if (active >= steps.length - 1) { setPlaying(false); return; }
    const timer = window.setTimeout(() => setActive((value) => Math.min(steps.length - 1, value + 1)), 1700);
    return () => window.clearTimeout(timer);
  }, [playing, active, steps.length]);

  function play() {
    if (playing) { setPlaying(false); return; }
    if (active >= steps.length - 1) setActive(0);
    setPlaying(true);
  }
  const go = (index: number) => { setPlaying(false); setActive(Math.max(0, Math.min(steps.length - 1, index))); };
  const builtAt = (stage: number) => steps.findIndex((_, index) => storyState(system, index).built >= stage);
  const inspected = selected ? system.nodes.find((node) => node.id === selected) : undefined;
  const inspectedStep = inspected ? builtAt(inspected.stage) : -1;
  const InspectedIcon = inspected ? moduleIcon(system.slug, inspected.id) : null;

  const step = steps[active];
  return <section ref={section} className={styles.story} id="how-it-works" aria-labelledby="how-it-works-title">
    <div className="container">
      <header className={styles.heading}>
        <p className="eyebrow"><span className="eyebrow-line" />How the engagement works</p>
        <h2 id="how-it-works-title">From first call to a running system.</h2>
        <p>What happens after you hire Lexvaxa for {serviceName.toLowerCase()}, step by step, as the system takes shape.</p>
      </header>
      <div className={styles.layout}>
        <div className={styles.visualColumn}>
          <div className={styles.sticky}>
            <div className={styles.status} aria-hidden="true">
              <span><b>{String(active + 1).padStart(2, '0')}</b> / {String(steps.length).padStart(2, '0')}</span>
              <span className={styles.statusTitle}>{step.title}</span>
              <span className={styles.statusOutput}>{step.output}</span>
            </div>
            <div className={styles.progress} aria-hidden="true"><i style={{ transform: `scaleX(${(active + 1) / steps.length})` }} /></div>
            <LiveScene system={system} state={{ ...storyState(system, active), focus: selected ? [selected] : storyState(system, active).focus }} variant="story" instanceId="story" running={visible && pageVisible} tilt={4} />
            <ul className={styles.modules} aria-label="System modules">
              {system.nodes.map((node) => {
                const Icon = moduleIcon(system.slug, node.id);
                const built = storyState(system, active).built >= node.stage;
                return <li key={node.id}><button type="button" data-built={built} aria-pressed={selected === node.id} onClick={() => setSelected((current) => current === node.id ? null : node.id)}>
                  <Icon size={14} aria-hidden="true" /><span>{node.label}</span>
                </button></li>;
              })}
            </ul>
            <div className={styles.controls}>
              <button type="button" onClick={() => go(active - 1)} disabled={active === 0} aria-label="Previous step"><ChevronLeft size={16} aria-hidden="true" /></button>
              <button type="button" className={styles.play} onClick={play} aria-pressed={playing}>
                {playing ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}{playing ? 'Pause' : active >= steps.length - 1 ? 'Replay assembly' : 'Play assembly'}
              </button>
              <button type="button" onClick={() => go(active + 1)} disabled={active === steps.length - 1} aria-label="Next step"><ChevronRight size={16} aria-hidden="true" /></button>
            </div>
            <div className={styles.inspector} aria-live="polite">
              {inspected && InspectedIcon ? <>
                <span className={styles.inspectorIcon} aria-hidden="true"><InspectedIcon size={18} /></span>
                <div><b>{inspected.label}</b><span>Built in step {String(inspectedStep + 1).padStart(2, '0')} · {steps[inspectedStep]?.title}</span></div>
                <button type="button" onClick={() => go(inspectedStep)}>Show step</button>
              </> : <p>Select a module to see when and why it is built.</p>}
            </div>
          </div>
        </div>
        <ol className={styles.steps}>
          {steps.map((item, index) => (
            <li key={item.title} ref={(element) => { items.current[index] = element; }} data-index={index}
              data-state={index < active ? 'done' : index === active ? 'active' : 'next'} style={{ '--i': index } as CSSProperties}
              aria-current={index === active ? 'step' : undefined}>
              <span className={styles.number} aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
                <span className={styles.output}><span className={styles.srOnly}>Output: </span>{item.output}</span>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  </section>;
}
