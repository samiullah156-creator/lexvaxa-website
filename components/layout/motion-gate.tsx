'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Pauses the CSS animations of every page section while it is off screen (see `[data-offscreen]` in
 * globals.css). Looping SVG animations repaint on the main thread even when nobody can see them, so
 * this keeps scrolling and input smooth. Sections resume a little before they scroll into view.
 */
export function MotionGate() {
  const pathname = usePathname();
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const targets = [...document.querySelectorAll<HTMLElement>('main > *, body > footer')];
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) (entry.target as HTMLElement).toggleAttribute('data-offscreen', !entry.isIntersecting);
    }, { rootMargin: '240px 0px' });
    for (const target of targets) observer.observe(target);
    return () => { observer.disconnect(); for (const target of targets) target.removeAttribute('data-offscreen'); };
  }, [pathname]);
  return null;
}
