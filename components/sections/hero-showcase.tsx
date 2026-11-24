'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { COMPLETE_STATE, SERVICE_SYSTEMS } from '@/lib/data/service-systems';
import { SERVICE_VISUALS } from '@/lib/data/service-visuals';
import { LiveScene } from '@/components/depth/live-scene';
import { moduleIcon } from '@/components/depth/service-icons';
import { ServiceBadge } from '@/components/depth/service-badge';
import { HeroMechanism } from './hero-mechanism';
import { HeroPhrase } from './hero-phrase';
import { ModeSwitch } from '@/components/depth/mode-switch';
import styles from './hero.module.css';
import { TiltSurface } from '@/components/depth/tilt-surface';

export type ShowcaseChapter = { slug: string; name: string; description: string };

/** Dwell on each service before the arm fetches the next one (a new service lands about every 3 s). */
export const HERO_DWELL_MS = 500;

export function HeroShowcase({ chapters }: { chapters: readonly ShowcaseChapter[] }) {
  const count = chapters.length;
  const [active, setActive] = useState(0);
  // The first scene is shown already built; later services assemble when they arrive.
  const [moved, setMoved] = useState(false);
  useEffect(() => { if (active !== 0) setMoved(true); }, [active]);
  const [incoming, setIncoming] = useState(0);
  const [transfer, setTransfer] = useState<{ id: number; to: number } | null>(null);
  const [userPaused, setUserPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const [visible, setVisible] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [dwellKey, setDwellKey] = useState(0);
  const [announcement, setAnnouncement] = useState('');
  const root = useRef<HTMLDivElement>(null);
  const queued = useRef<number | null>(null);
  const transferCount = useRef(0);
  const dwell = useRef({ key: -1, remaining: HERO_DWELL_MS });
  const swipe = useRef<{ x: number; y: number } | null>(null);

  const motion = visible && pageVisible && !reduced && !userPaused;
  const autoAdvance = motion && !hovering && !focusWithin && transfer === null;
  const system = SERVICE_SYSTEMS[chapters[active].slug];
  const chapter = chapters[active];

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => setReduced(preference.matches);
    const updatePage = () => setPageVisible(!document.hidden);
    updateMotion(); updatePage();
    preference.addEventListener('change', updateMotion);
    document.addEventListener('visibilitychange', updatePage);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.2 });
    if (root.current) observer.observe(root.current);
    return () => { observer.disconnect(); preference.removeEventListener('change', updateMotion); document.removeEventListener('visibilitychange', updatePage); };
  }, []);

  const start = useCallback((to: number) => {
    transferCount.current += 1;
    setIncoming(to);
    setTransfer({ id: transferCount.current, to });
  }, []);

  // One dwell timer; pausing keeps the remaining time so the progress bar stays truthful.
  useEffect(() => {
    if (dwell.current.key !== dwellKey) dwell.current = { key: dwellKey, remaining: HERO_DWELL_MS };
    if (!autoAdvance) return;
    const entry = dwell.current;
    const began = Date.now();
    const timer = window.setTimeout(() => start((active + 1) % count), entry.remaining);
    return () => { window.clearTimeout(timer); entry.remaining = Math.max(0, entry.remaining - (Date.now() - began)); };
  }, [autoAdvance, dwellKey, active, count, start]);

  const transferRef = useRef(transfer);
  useEffect(() => { transferRef.current = transfer; }, [transfer]);
  const commit = useCallback(() => { if (transferRef.current) setActive(transferRef.current.to); }, []);
  const complete = useCallback(() => {
    const next = queued.current;
    queued.current = null;
    setDwellKey((key) => key + 1);
    // A queued choice continues straight from the rest pose; otherwise the dwell clock restarts.
    if (next !== null && next !== transferRef.current?.to) start(next);
    else setTransfer(null);
  }, [start]);

  function select(index: number, origin: 'button' | 'key' | 'swipe' = 'button') {
    const next = (index + count) % count;
    if (!motion) {
      queued.current = null;
      setActive(next); setIncoming(next); setTransfer(null); setDwellKey((key) => key + 1);
      setAnnouncement(`${chapters[next].name} selected.`);
      return;
    }
    if (transfer) { queued.current = next; setAnnouncement(`${chapters[next].name} queued.`); return; }
    if (next === active) return;
    start(next);
    if (origin !== 'swipe') setAnnouncement(`Assembling ${chapters[next].name}.`);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowRight') { event.preventDefault(); select((transfer?.to ?? active) + 1, 'key'); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); select((transfer?.to ?? active) - 1, 'key'); }
  }
  function onPointerDown(event: PointerEvent<HTMLDivElement>) { if (event.pointerType !== 'mouse') swipe.current = { x: event.clientX, y: event.clientY }; }
  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    const origin = swipe.current; swipe.current = null;
    if (!origin) return;
    const dx = event.clientX - origin.x, dy = event.clientY - origin.y;
    if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.4) select((transfer?.to ?? active) + (dx < 0 ? 1 : -1), 'swipe');
  }

  const target = transfer?.to ?? active;
  return (
    <div ref={root} className={styles.inner} data-motion={motion} data-transfer={transfer !== null} data-power={userPaused ? 'off' : 'on'}>
      <div className={styles.copy}>
        <p className={styles.eyebrow}><span aria-hidden="true" />AI engineering · Automation · Custom software</p>
        <h1 id="hero-title" className={styles.title}>
          <span className={styles.srOnly}>We engineer AI that connects conversations, workflows, systems and decisions.</span>
          <span className={styles.titlePrefix} aria-hidden="true">We engineer AI that connects</span>
          <HeroPhrase phrase={SERVICE_SYSTEMS[chapters[incoming].slug].phrase} still={!motion} />
        </h1>
        <p className={styles.lead}>We design, build and integrate AI agents, voice AI and custom software that work with the tools your business already uses, so your team spends less time on repetitive work.</p>
        <div className={styles.actions}>
          <Link href="/contact" className={styles.primaryCta}>Get a free project plan <ArrowUpRight size={18} aria-hidden="true" /></Link>
          <Link href="/services" className={styles.secondaryCta}>Explore our services <ArrowUpRight size={16} aria-hidden="true" /></Link>
        </div>
      </div>

      <figure className={styles.machine}>
        <TiltSurface max={4}><HeroMechanism dockLabel={SERVICE_SYSTEMS[chapters[active].slug].token} incomingLabel={SERVICE_SYSTEMS[chapters[incoming].slug].token}
          dockSlug={chapters[active].slug} incomingSlug={chapters[incoming].slug}
          transferId={transfer?.id ?? null} playing={motion} onCommit={commit} onComplete={complete} /></TiltSurface>
        <div className={styles.power}>
          <ModeSwitch label="Automation" off="Manual" on="Automated" checked={!userPaused} onChange={(next) => setUserPaused(!next)} />
          <span className={styles.powerText} aria-live="polite">{userPaused ? 'Work waits for your team' : 'Running around the clock'}</span>
        </div>
        <figcaption className={styles.srOnly}>An articulated arm moves each capability from intake to the service in focus.</figcaption>
      </figure>

      <div className={styles.focus} role="group" aria-roledescription="carousel" aria-label="Service in focus"
        onKeyDown={onKeyDown} onPointerEnter={(event) => { if (event.pointerType === 'mouse') setHovering(true); }} onPointerLeave={() => setHovering(false)}
        onFocus={(event) => setFocusWithin(event.target.matches(':focus-visible'))}
        onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocusWithin(false); }}>
        <div className={styles.focusHeader}>
          <span>Service in focus</span>
          <span className={styles.counter} aria-hidden="true"><b>{String(active + 1).padStart(2, '0')}</b> / {String(count).padStart(2, '0')}</span>
        </div>
        <div className={styles.stage} data-standby={transfer !== null && target !== active} onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
          <LiveScene key={system.slug} system={system} state={COMPLETE_STATE} variant="hero" instanceId="hero" assemble={moved} running={motion} />
          <span className={styles.stageStatus} aria-hidden="true">{transfer && target !== active ? `Assembling ${SERVICE_SYSTEMS[chapters[target].slug].token}` : ''}</span>
        </div>
        <div key={`chain-${system.slug}`} className={styles.chain}>
          <span className={styles.chainLabel}>Service workflow</span>
          <ol aria-label={`${chapter.name} workflow`}>
            {SERVICE_VISUALS[system.slug].steps.map((item, index) => {
              const node = [system.nodes[0], system.nodes.find((entry) => entry.accent === 'purple') ?? system.nodes[2], system.nodes[system.nodes.length - 1]][index];
              const StepIcon = moduleIcon(system.slug, node?.id ?? '');
              return <li key={item} style={{ '--i': index } as CSSProperties}><StepIcon size={13} aria-hidden="true" />{item}</li>;
            })}
          </ol>
        </div>
        <div key={`copy-${system.slug}`} className={styles.focusCopy}>
          <h2><Link href={`/services/${chapter.slug}`} className={styles.serviceLink}><ServiceBadge slug={chapter.slug} className={styles.serviceIcon} /><span className={styles.serviceName}>{chapter.name}</span><ArrowUpRight size={18} aria-hidden="true" /></Link></h2>
          <p>{chapter.description}</p>
        </div>
        <div className={styles.navigation}>
          <button type="button" className={styles.navButton} onClick={() => select(target - 1)} aria-label="Previous service"><ChevronLeft size={17} aria-hidden="true" /></button>
          <div className={styles.segments} role="group" aria-label="Choose a service">
            {chapters.map((item, index) => (
              <button key={item.slug} type="button" className={styles.segment} aria-label={`${index + 1} of ${count}: ${item.name}`} aria-current={index === active ? 'true' : undefined}
                data-queued={transfer?.to === index && index !== active} onClick={() => select(index)}>
                <span key={index === active ? `fill-${dwellKey}` : undefined} className={styles.segmentFill} data-running={index === active && autoAdvance} />
              </button>
            ))}
          </div>
          <button type="button" className={styles.navButton} onClick={() => setUserPaused((value) => !value)} disabled={reduced}
            aria-label={userPaused ? 'Resume service showcase' : 'Pause service showcase'} aria-pressed={userPaused}>
            {userPaused || reduced ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
          </button>
          <button type="button" className={styles.navButton} onClick={() => select(target + 1)} aria-label="Next service"><ChevronRight size={17} aria-hidden="true" /></button>
        </div>
        <p className={styles.srOnly} role="status" aria-live="polite" aria-atomic="true">{announcement}</p>
      </div>
    </div>
  );
}
