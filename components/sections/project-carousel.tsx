'use client';

import { Children, useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpRight, Pause, Play } from 'lucide-react';
import styles from './portfolio-preview.module.css';

export type ProjectCarouselProps = {
  id: string;
  label: string;
  children: ReactNode;
  tone?: 'light' | 'dark';
  viewAllHref?: string;
  viewAllLabel?: string;
  autoAdvanceMs?: number;
};

function positionsFor(node: HTMLUListElement) {
  const maximum = Math.max(0, node.scrollWidth - node.clientWidth);
  const cards = Array.from(node.children) as HTMLElement[];
  const origin = cards[0]?.offsetLeft ?? 0;
  const positions = cards.map((card) => Math.max(0, Math.min(card.offsetLeft - origin, maximum)));
  return { maximum, positions: [...new Set([0, ...positions, maximum])] };
}

function destinationFor(node: HTMLUListElement, direction: -1 | 1) {
  const { maximum, positions } = positionsFor(node);
  return direction === 1
    ? positions.find((left) => left > node.scrollLeft + 2) ?? maximum
    : positions.slice().reverse().find((left) => left < node.scrollLeft - 2) ?? 0;
}

/** Server-rendered cards remain a normal scrollable list before hydration. */
export function ProjectCarousel({ id, label, children, tone = 'light', viewAllHref, viewAllLabel = 'View all projects', autoAdvanceMs = 5000 }: ProjectCarouselProps) {
  const track = useRef<HTMLUListElement>(null);
  const rotation = useRef<HTMLButtonElement>(null);
  const expectedScroll = useRef<{ destination: number; expires: number } | null>(null);
  const lastScroll = useRef(0);
  const [edges, setEdges] = useState({ previous: false, next: false, scrollable: false });
  const [enhanced, setEnhanced] = useState(false);
  const [observed, setObserved] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [reduced, setReduced] = useState(true);
  const [requested, setRequested] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const [resumeWhileFocused, setResumeWhileFocused] = useState(false);
  const [advanceVersion, setAdvanceVersion] = useState(0);
  const cards = Children.toArray(children);
  const interval = Number.isFinite(autoAdvanceMs) ? Math.max(5000, autoAdvanceMs) : 5000;
  const running = enhanced && observed && visible && pageVisible && requested && !hovered && (!focusWithin || resumeWhileFocused) && !reduced && edges.scrollable;

  function stopAutomaticAdvance() {
    expectedScroll.current = null;
    setRequested(false);
  }

  useEffect(() => {
    const node = track.current;
    if (!node) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => { setReduced(preference.matches); if (preference.matches) setRequested(false); };
    const updatePage = () => setPageVisible(!document.hidden);
    const measure = () => {
      const maximum = Math.max(0, node.scrollWidth - node.clientWidth);
      const left = Math.max(0, Math.min(node.scrollLeft, maximum));
      const next = { previous: left > 2, next: left < maximum - 2, scrollable: maximum > 2 };
      setEdges((current) => current.previous === next.previous && current.next === next.next && current.scrollable === next.scrollable ? current : next);
    };
    const onScroll = () => {
      const expected = expectedScroll.current;
      const changed = Math.abs(node.scrollLeft - lastScroll.current) > 1;
      if (changed && (!expected || Date.now() > expected.expires)) setRequested(false);
      if (expected && Math.abs(node.scrollLeft - expected.destination) <= 2) expectedScroll.current = null;
      lastScroll.current = node.scrollLeft;
      measure();
    };
    const onScrollEnd = () => { expectedScroll.current = null; measure(); };
    const visibility = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver((entries) => {
      const entry = entries.find((item) => item.target === node);
      if (entry) setVisible(entry.isIntersecting);
    }, { threshold: .15 });
    visibility?.observe(node);
    const resize = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    resize?.observe(node);
    if (node.firstElementChild) resize?.observe(node.firstElementChild);
    updateMotion(); updatePage(); measure();
    setObserved(Boolean(visibility)); setEnhanced(true);
    preference.addEventListener('change', updateMotion);
    document.addEventListener('visibilitychange', updatePage);
    node.addEventListener('scroll', onScroll, { passive: true });
    node.addEventListener('scrollend', onScrollEnd);
    window.addEventListener('resize', measure);
    return () => {
      visibility?.disconnect(); resize?.disconnect();
      preference.removeEventListener('change', updateMotion);
      document.removeEventListener('visibilitychange', updatePage);
      node.removeEventListener('scroll', onScroll); node.removeEventListener('scrollend', onScrollEnd);
      window.removeEventListener('resize', measure);
      expectedScroll.current = null;
    };
  }, [id, cards.length]);

  function scrollToPosition(node: HTMLUListElement, destination: number) {
    const maximum = Math.max(0, node.scrollWidth - node.clientWidth);
    const left = Math.max(0, Math.min(destination, maximum));
    expectedScroll.current = { destination: left, expires: Date.now() + 1500 };
    node.scrollTo({ left, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }

  useEffect(() => {
    if (!running) return;
    // A full visible dwell precedes each advance, including after suspension.
    const timer = window.setTimeout(() => {
      const node = track.current;
      if (!node) return;
      const pendingImage = Array.from(node.querySelectorAll<HTMLImageElement>('img')).some((image) => {
        const item = image.closest('li');
        return !image.complete && item && item.offsetLeft + item.offsetWidth > node.scrollLeft && item.offsetLeft < node.scrollLeft + node.clientWidth;
      });
      if (pendingImage) { setAdvanceVersion((current) => current + 1); return; }
      const maximum = Math.max(0, node.scrollWidth - node.clientWidth);
      scrollToPosition(node, maximum - node.scrollLeft <= 2 ? 0 : destinationFor(node, 1));
      setAdvanceVersion((current) => current + 1);
    }, interval);
    return () => window.clearTimeout(timer);
  }, [running, interval, advanceVersion, id, cards.length]);

  function move(direction: -1 | 1) {
    stopAutomaticAdvance();
    const node = track.current;
    if (node) scrollToPosition(node, destinationFor(node, direction));
  }

  return <div className={styles.carousel} data-tone={tone} data-enhanced={enhanced} data-autoplay={running}
    onFocusCapture={(event) => {
      setFocusWithin(true); setResumeWhileFocused(false);
      if ((event.target as EventTarget) !== rotation.current) stopAutomaticAdvance();
    }}
    onBlurCapture={(event) => {
      if (!event.relatedTarget || !event.currentTarget.contains(event.relatedTarget as Node)) { setFocusWithin(false); setResumeWhileFocused(false); }
    }}>
    <div className={styles.railToolbar}>
      <div className={styles.railMeta}>
        <p><span>{String(cards.length).padStart(2, '0')}</span> selected projects</p>
        <p id={`${id}-instructions`}>Swipe to explore, or use the arrow controls.</p>
      </div>
      <div className={styles.railActions}>
        <span className={styles.playbackStatus}>{!enhanced || !observed ? 'Manual browsing' : reduced ? 'Motion reduced' : requested && !hovered && (!focusWithin || resumeWhileFocused) ? 'Auto advance on' : 'Auto advance paused'}</span>
        <button ref={rotation} type="button" className={styles.rotationButton}
          disabled={!enhanced || !observed || reduced || !edges.scrollable}
          onClick={() => { setRequested((current) => !current); setResumeWhileFocused(true); }} aria-pressed={!requested}
          aria-label={requested ? 'Pause automatic project advance' : 'Resume automatic project advance'} aria-controls={id}>
          {requested ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}<span>{requested ? 'Pause' : 'Resume'}</span>
        </button>
        <button type="button" onClick={() => move(-1)} disabled={!edges.previous} aria-label="Previous projects" aria-controls={id}><ArrowLeft size={18} aria-hidden="true" /></button>
        <button type="button" onClick={() => move(1)} disabled={!edges.next} aria-label="Next projects" aria-controls={id}><ArrowRight size={18} aria-hidden="true" /></button>
        {viewAllHref && <Link href={viewAllHref} className={styles.allLink}>{viewAllLabel}<ArrowUpRight size={16} aria-hidden="true" /></Link>}
      </div>
    </div>
    <ul ref={track} id={id} className={styles.projectTrack} role="list" tabIndex={0} aria-label={label} aria-describedby={`${id}-instructions`} aria-live="off"
      onPointerEnter={(event) => { if (event.pointerType === 'mouse') setHovered(true); }}
      onPointerLeave={(event) => { if (event.pointerType === 'mouse') setHovered(false); }}
      onPointerDown={stopAutomaticAdvance}
      onWheel={(event) => { if (Math.abs(event.deltaX) > 0 || event.shiftKey) stopAutomaticAdvance(); }}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1); }
        else if (event.key === 'Home' || event.key === 'End') {
          event.preventDefault(); stopAutomaticAdvance();
          const node = track.current;
          if (node) scrollToPosition(node, event.key === 'Home' ? 0 : node.scrollWidth - node.clientWidth);
        }
      }}>
      {cards.map((card, index) => <li key={index} className={styles.projectItem}>{card}</li>)}
    </ul>
  </div>;
}
