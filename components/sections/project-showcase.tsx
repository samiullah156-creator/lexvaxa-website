'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Pause, Play } from 'lucide-react';
import { CdnImage } from '@/components/content/cdn-image';
import { PROJECT_TRACKS, trackLabel, type Project, type ProjectTrack } from '@/lib/data/projects';
import styles from './project-showcase.module.css';

type ShowcaseProject = Pick<Project, 'slug' | 'name' | 'category' | 'discipline' | 'summary' | 'technologies' | 'features' | 'image' | 'blueprint'> & { tracks: readonly ProjectTrack[] };
type Filter = 'all' | ProjectTrack;

const DWELL_MS = 4600;
const FLY_MS = 560;
/** Cards drawn behind the front one; deeper cards stay in the HTML but out of sight (and without an image). */
const VISIBLE_DEPTH = 3;

/**
 * Featured work as a deck of cards: the front project's screenshot on top, the next ones fanned behind.
 * Every few seconds (only while on screen, never with reduced motion) the front card flies off and the
 * next one comes forward. Each card is one link to its case study, all in server order. Tabs narrow the
 * deck to one kind of work (AI engineering, automation, full-stack, web); the other cards fade out.
 */
export function ProjectShowcase({ projects }: { projects: readonly ShowcaseProject[] }) {
  const count = projects.length;
  const [filter, setFilter] = useState<Filter>('all');
  const [position, setPosition] = useState(0);
  const [leaving, setLeaving] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);
  const [hold, setHold] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [entered, setEntered] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const order = useMemo(() => projects.map((_, index) => index).filter((index) => filter === 'all' || projects[index].tracks.includes(filter)), [projects, filter]);
  const shownCount = order.length;
  const active = order[position % Math.max(shownCount, 1)] ?? 0;
  const playing = visible && !hold && !paused && !reduced && shownCount > 1;
  const project = projects[active];
  const tabs = PROJECT_TRACKS.map((track) => ({ ...track, total: projects.filter((item) => item.tracks.includes(track.id)).length })).filter((track) => track.total > 0);

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const node = root.current;
    if (!node || typeof IntersectionObserver === 'undefined') { setEntered(true); return; }
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
      if (entry.isIntersecting) setEntered(true);
    }, { threshold: 0.3 });
    observer.observe(node);
    const onVisibility = () => { if (document.hidden) setVisible(false); };
    document.addEventListener('visibilitychange', onVisibility);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', onVisibility); };
  }, []);

  const go = (next: number) => {
    const target = (next + shownCount) % shownCount;
    if (target === position) return;
    if (!reduced) {
      setLeaving(active);
      window.setTimeout(() => setLeaving(null), FLY_MS);
    }
    setPosition(target);
  };

  const choose = (next: Filter) => {
    if (next === filter) return;
    setLeaving(null);
    setFilter(next);
    setPosition(0);
  };

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => go(position + 1), DWELL_MS);
    return () => window.clearTimeout(timer);
  });

  return <div ref={root} className={styles.showcase} data-playing={playing || undefined} data-entered={entered || undefined}
    onFocus={(event) => setHold(event.target.matches(':focus-visible') && !event.target.matches('button'))} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setHold(false); }}>
    <div className={styles.filters} role="group" aria-label="Show projects by type">
      <button type="button" aria-pressed={filter === 'all'} onClick={() => choose('all')}>All work<span>{count}</span></button>
      {tabs.map((tab) => <button key={tab.id} type="button" aria-pressed={filter === tab.id} data-current={(filter === 'all' && project.tracks.includes(tab.id)) || undefined}
        onClick={() => choose(tab.id)}>{tab.label}<span>{tab.total}</span></button>)}
    </div>
    <ol className={styles.deck} aria-label="Featured projects">
      <li className={styles.stage} aria-hidden="true" />
      {projects.map((item, index) => {
        const rank = order.indexOf(index);
        const depth = rank < 0 ? VISIBLE_DEPTH + 1 : (rank - position + shownCount) % shownCount;
        const shown = depth <= VISIBLE_DEPTH || index === leaving;
        return <li key={item.slug} className={styles.slot} data-depth={Math.min(depth, VISIBLE_DEPTH + 1)} data-leaving={index === leaving || undefined}
          style={{ '--d': Math.min(depth, VISIBLE_DEPTH + 1), zIndex: index === leaving ? count + 1 : rank < 0 ? 0 : count - depth } as CSSProperties}>
          <article data-project={item.slug} className={styles.card}>
            <Link href={`/work/${item.slug}`} className={styles.cardLink} aria-label={`View ${item.name} case study`} tabIndex={depth === 0 ? 0 : -1}>
              <span className={styles.bar}><i /><i /><i /><b>lexvaxa.com/work/{item.slug}</b><img src="/brand/lexvaxa-mark.svg" alt="" width={34} height={26} className={styles.mark} /></span>
              <span className={styles.shot}>
                {shown && <CdnImage src={item.image.src} alt="" width={item.image.width} height={item.image.height} sizes="(max-width: 900px) 90vw, 600px" loading="lazy" />}
              </span>
              <span className={styles.cardFoot}><span className={styles.cardText}><small>{item.discipline}{item.blueprint && <em> · Blueprint</em>}</small><h3>{item.name}</h3></span><ArrowUpRight size={16} aria-hidden="true" /></span>
            </Link>
          </article>
        </li>;
      })}
    </ol>

    <div className={styles.detail}>
      <div key={project.slug} className={styles.copy} aria-live="polite">
        <p className={styles.chips}><span className={styles.chip}>{project.category}</span>
          {project.tracks.map((track) => <span key={track} className={styles.trackChip}>{trackLabel(track)}</span>)}
          {project.blueprint && <span className={styles.blueprint} title="A system design we use as the starting point for this kind of project">Solution blueprint</span>}</p>
        <p className={styles.title}>{project.name}</p>
        <p className={styles.summary}>{project.summary}</p>
        <ul className={styles.highlights} aria-label={`${project.name} key features`}>{project.features.slice(0, 3).map((feature) => <li key={feature}><Check size={14} strokeWidth={2.6} aria-hidden="true" />{feature}</li>)}</ul>
        <ul className={styles.tags} aria-label={`${project.name} technologies`}>{project.technologies.slice(0, 4).map((tech) => <li key={tech}>{tech}</li>)}</ul>
      </div>
      <div className={styles.controls}>
        <Link href={`/work/${project.slug}`} className={styles.open} tabIndex={-1} aria-hidden="true">Read the case study <ArrowUpRight size={16} aria-hidden="true" /></Link>
        <div className={styles.nav}>
          <span className={styles.counter} aria-hidden="true"><b>{String(position + 1).padStart(2, '0')}</b> / {String(shownCount).padStart(2, '0')}</span>
          <span className={styles.track} aria-hidden="true"><i key={`${active}-${String(playing)}`} /></span>
          <button type="button" onClick={() => go(active - 1)} aria-label="Previous project"><ArrowLeft size={16} aria-hidden="true" /></button>
          <button type="button" onClick={() => go(active + 1)} aria-label="Next project"><ArrowRight size={16} aria-hidden="true" /></button>
          {!reduced && shownCount > 1 && <button type="button" onClick={() => setPaused((value) => !value)} aria-pressed={paused} aria-label={paused ? 'Play showcase' : 'Pause showcase'}>
            {paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
          </button>}
        </div>
      </div>
    </div>
  </div>;
}
