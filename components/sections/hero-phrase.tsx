'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import styles from './hero.module.css';

const glyphs = (text: string) => Array.from(text).map((glyph, index) => (
  <span key={index} className={styles.glyph} style={{ '--i': index } as CSSProperties}>{glyph}</span>
));

/**
 * Visual rotating phrase (the H1 carries the stable accessible sentence).
 * Outgoing glyphs collapse into nodes, a short signal travels toward the
 * mechanism, then the next phrase assembles from those nodes and settles.
 */
export function HeroPhrase({ phrase, still }: { phrase: string; still: boolean }) {
  const [shown, setShown] = useState({ current: phrase, previous: null as string | null, version: 0 });
  if (shown.current !== phrase) setShown({ current: phrase, previous: still ? null : shown.current, version: shown.version + 1 });

  useEffect(() => {
    if (!shown.previous) return;
    const timer = window.setTimeout(() => setShown((state) => ({ ...state, previous: null })), 900);
    return () => window.clearTimeout(timer);
  }, [shown.version, shown.previous]);

  return <span className={styles.phrase} aria-hidden="true">
    {shown.previous && <span key={`out-${shown.version}`} className={styles.phraseOut}>{glyphs(shown.previous)}<span className={styles.period}>.</span></span>}
    {shown.previous && <span key={`nodes-${shown.version}`} className={styles.nodes}><i /><i /><i /></span>}
    <span key={`in-${shown.version}`} className={styles.phraseIn} data-entering={shown.version > 0 && !still}>
      {glyphs(shown.current)}<span className={styles.period}>.</span>
    </span>
  </span>;
}
