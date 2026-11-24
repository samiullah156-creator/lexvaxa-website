'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import styles from './depth.module.css';

type TiltSurfaceProps = {
  children: ReactNode;
  /** Maximum rotation in degrees at the surface edge. */
  max?: number;
  className?: string;
  style?: CSSProperties;
  /** Cast a lifting shadow from the first child while tilted (standalone cards). */
  lift?: boolean;
};

/**
 * Pointer-driven perspective tilt. Children opt into depth with `data-depth="24"`
 * (pixels toward the viewer). Fine pointers only; still for touch and reduced motion.
 * The loop runs only while the surface is moving toward its target.
 */
export function TiltSurface({ children, max = 6, className, style, lift = false }: TiltSurfaceProps) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const capable = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let last = 0;
    let bounds: DOMRect | null = null;
    const current = { x: 0, y: 0 }, target = { x: 0, y: 0 };
    // Time-based easing so the tilt feels the same on 60 Hz and 120 Hz displays.
    const step = (now: number) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
      last = now;
      const ease = 1 - Math.exp(-dt * 11);
      current.x += (target.x - current.x) * ease;
      current.y += (target.y - current.y) * ease;
      element.style.setProperty('--rx', `${(-current.y * max).toFixed(2)}deg`);
      element.style.setProperty('--ry', `${(current.x * max).toFixed(2)}deg`);
      // Light direction for the lifted shadow: it falls away from the raised edge.
      element.style.setProperty('--tx', current.x.toFixed(3));
      element.style.setProperty('--ty', current.y.toFixed(3));
      const settled = Math.abs(target.x - current.x) < 0.002 && Math.abs(target.y - current.y) < 0.002;
      frame = settled ? 0 : requestAnimationFrame(step);
      if (settled) last = 0;
      if (settled && target.x === 0 && target.y === 0) element.dataset.tilting = 'false';
    };
    const kick = () => { if (!frame) frame = requestAnimationFrame(step); };
    const allowed = (event: PointerEvent) => capable.matches && !reduced.matches && event.pointerType === 'mouse';
    const enter = (event: PointerEvent) => { if (allowed(event)) bounds = element.getBoundingClientRect(); };
    const move = (event: PointerEvent) => {
      if (!allowed(event)) return;
      bounds ??= element.getBoundingClientRect();
      target.x = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width) * 2 - 1));
      target.y = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height) * 2 - 1));
      element.dataset.tilting = 'true';
      kick();
    };
    const leave = () => { bounds = null; target.x = 0; target.y = 0; element.dataset.pressed = 'false'; kick(); };
    const press = (event: PointerEvent) => { if (allowed(event)) element.dataset.pressed = 'true'; };
    const release = () => { element.dataset.pressed = 'false'; };
    // Scrolling moves the surface under a still pointer; re-measure on the next move.
    const invalidate = () => { bounds = null; };
    element.addEventListener('pointerenter', enter);
    element.addEventListener('pointermove', move);
    element.addEventListener('pointerleave', leave);
    element.addEventListener('pointerdown', press);
    element.addEventListener('pointerup', release);
    window.addEventListener('scroll', invalidate, { passive: true });
    window.addEventListener('resize', invalidate);
    return () => {
      cancelAnimationFrame(frame);
      element.removeEventListener('pointerenter', enter);
      element.removeEventListener('pointermove', move);
      element.removeEventListener('pointerleave', leave);
      element.removeEventListener('pointerdown', press);
      element.removeEventListener('pointerup', release);
      window.removeEventListener('scroll', invalidate);
      window.removeEventListener('resize', invalidate);
    };
  }, [max]);

  return <div ref={root} className={[styles.tilt, lift && styles.lift, className].filter(Boolean).join(' ')} style={style} data-tilting="false" data-pressed="false">{children}</div>;
}
