'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { MessagesSquare, Pause, Play, X } from 'lucide-react';
import styles from './testimonials.module.css';

export type SpotlightReview = { id: string; quote: string; name: string; detail: string; service?: string; repeat?: boolean };

const STEP_MS = 3400;
const VISIBLE = 3;

function initials(name: string) {
  const clean = name.replace(/[^a-z0-9 ]/gi, ' ').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  return (parts.length > 1 ? parts[0][0] + parts[1][0] : clean.slice(0, 2)).toUpperCase() || '?';
}

/**
 * Reviews as a live message feed: three on screen, a new one slides in at the bottom every few
 * seconds and the oldest leaves at the top. Every review is in the server HTML. It moves only while
 * on screen, never with reduced motion. Clicking a review opens it in full (the feed waits meanwhile).
 */
export function ReviewSpotlight({ reviews, stars }: { reviews: SpotlightReview[]; stars: ReactNode }) {
  const count = reviews.length;
  const [newest, setNewest] = useState(Math.min(VISIBLE, count) - 1);
  const [visible, setVisible] = useState(false);
  const [hold, setHold] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [open, setOpen] = useState<SpotlightReview | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const playing = visible && !hold && !paused && !reduced && !open && count > VISIBLE;

  useEffect(() => {
    const node = dialog.current;
    if (!node) return;
    if (open && !node.open) node.showModal();
    if (!open && node.open) node.close();
  }, [open]);

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const node = root.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.4 });
    observer.observe(node);
    const onVisibility = () => { if (document.hidden) setVisible(false); };
    document.addEventListener('visibilitychange', onVisibility);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', onVisibility); };
  }, []);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => setNewest((index) => (index + 1) % count), STEP_MS);
    return () => window.clearTimeout(timer);
  }, [playing, newest, count]);

  return <div ref={root} className={styles.feed} data-playing={playing || undefined}
    onFocus={(event) => setHold(event.target.matches(':focus-visible') && !event.target.matches('button'))} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setHold(false); }}>
    <div className={styles.feedHead}>
      <span className={styles.feedAvatar} aria-hidden="true"><MessagesSquare size={17} /></span>
      <span className={styles.feedTitle}><b>Client feedback</b><small>Verified reviews, in their own words</small></span>
      <span className={styles.feedLive}><i aria-hidden="true" />Live</span>
      {!reduced && count > VISIBLE && <button type="button" className={styles.feedPause} onClick={() => setPaused((value) => !value)} aria-pressed={paused} aria-label={paused ? 'Play reviews' : 'Pause reviews'}>
        {paused ? <Play size={13} aria-hidden="true" /> : <Pause size={13} aria-hidden="true" />}
      </button>}
    </div>
    <ul className={styles.messages}>
      {reviews.map((review, index) => {
        const age = (newest - index + count) % count;
        const place = age < VISIBLE ? VISIBLE - 1 - age : age === VISIBLE ? -1 : VISIBLE;
        return <li key={review.id} className={styles.message} data-place={place} style={{ '--p': place } as CSSProperties}>
          <figure>
            <span className={styles.avatar} aria-hidden="true">{initials(review.name)}</span>
            <div className={styles.bubble}>
              <figcaption><b>{review.name}</b>{review.detail && <small>{review.detail}</small>}{stars}</figcaption>
              <blockquote><p>{review.quote}</p></blockquote>
              <button type="button" className={styles.readMore} onClick={() => setOpen(review)} tabIndex={place >= 0 && place < VISIBLE ? 0 : -1}
                aria-label={`Read full review from ${review.name}`}><span aria-hidden="true">Read full review</span></button>
            </div>
          </figure>
        </li>;
      })}
    </ul>
    <div className={styles.feedFoot} aria-hidden="true"><span className={styles.typing}><i /><i /><i /></span>Click a review to read it in full</div>
    <dialog ref={dialog} className={styles.reader} aria-labelledby="review-reader-name" onClose={() => setOpen(null)}
      onClick={(event) => { if (event.target === event.currentTarget) setOpen(null); }}>
      {open && <figure>
        <figcaption><span className={styles.avatar} aria-hidden="true">{initials(open.name)}</span>
          <span><b id="review-reader-name">{open.name}</b>{open.detail && <small>{open.detail}</small>}</span>{stars}</figcaption>
        <blockquote><p>{open.quote}</p></blockquote>
      </figure>}
      <button type="button" className={styles.readerClose} onClick={() => setOpen(null)} aria-label="Close review"><X size={18} aria-hidden="true" /></button>
    </dialog>
  </div>;
}
