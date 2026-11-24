import { useId, type CSSProperties, type ReactNode } from 'react';
import { Bolt, m, Shadow, Slab } from './steel-kit';
import s from './steel.module.css';

/** Point on the shared plinth top: u along the right edge, v along the left edge (0–1). */
export const P = (u: number, v: number) => ({ x: 330 + 320 * u - 170 * v, y: 208 + 160 * u + 85 * v });

/** Floor, machined plinth, brand glow pool and corner bolts shared by every scene. */
export function Stage({ id, glow = 'blue' }: { id: string; glow?: 'blue' | 'purple' }) {
  return <g>
    <Shadow id={id} cx={405} cy={450} rx={300} ry={38} />
    <Slab id={id} x={330} y={208} w={320} d={170} h={16} />
    <ellipse className={s.pool} cx="405" cy="330" rx="170" ry="62" fill={m(id, glow === 'blue' ? 'glow' : 'glowPurple')} />
    {/* Architecture blueprint, drawn on the plinth before anything is built */}
    <path className={s.blueprint} d={[.2, .4, .6, .8].map((t) => { const a = P(t, 0), b = P(t, 1), c = P(0, t), d = P(1, t); return `M${a.x} ${a.y}L${b.x} ${b.y}M${c.x} ${c.y}L${d.x} ${d.y}`; }).join('')} fill="none" stroke="#167dfe" strokeOpacity=".45" strokeWidth="1" strokeDasharray="4 5" />
    <Bolt id={id} x={196} y={302} /><Bolt id={id} x={622} y={366} /><Bolt id={id} x={474} y={438} /><Bolt id={id} x={340} y={222} />
  </g>;
}

/** Staged object: visible once its build stage is reached; blueprint outline before that. */
export function Part({ n, built, ghost = false, children }: { n: number; built: number; ghost?: boolean; children: ReactNode }) {
  return <g className={s.part} data-on={built >= n} data-ghost={ghost && built < n} style={{ '--n': n } as CSSProperties}>{children}</g>;
}

/** Translucent hologram panel projected above an object (left or right plane). */
export function Holo({ x, y, w, h, plane = 'right', children, delay = 0 }: { x: number; y: number; w: number; h: number; plane?: 'right' | 'left' | 'front'; children?: ReactNode; delay?: number }) {
  const linesId = `holo-lines-${useId().replace(/[^a-zA-Z0-9_-]/g, '-')}`;
  const skew = plane === 'right' ? '1 .5 0 1' : plane === 'left' ? '1 -.5 0 1' : '1 0 0 1';
  return <g className={s.holo} style={{ '--d': `${delay}ms` } as CSSProperties}>
    <HoloLines id={linesId} />
    <g transform={`matrix(${skew} ${x} ${y})`}>
      <rect width={w} height={h} rx="8" fill="#167dfe" fillOpacity=".09" stroke="#5ea2ff" strokeOpacity=".75" strokeWidth="1.2" />
      <rect width={w} height={h} rx="8" fill={`url(#${linesId})`} opacity=".5" />
      <path d={`M10 0H${w * .42}`} stroke="#9cc8ff" strokeWidth="2" strokeLinecap="round" />
      {children}
    </g>
  </g>;
}

/** Floating info card with an icon glyph and a confirming check. */
export function Card({ x, y, title, sub, glyph, color = '#167dfe', delay = 0 }: { x: number; y: number; title: string; sub: string; glyph: ReactNode; color?: string; delay?: number }) {
  return <g className={s.card} style={{ '--d': `${delay}ms` } as CSSProperties}>
    <rect x={x + 2} y={y + 4} width="112" height="40" rx="10" fill="#0d1824" opacity=".08" />
    <rect x={x} y={y} width="112" height="40" rx="10" fill="#ffffff" stroke="#d3dce7" />
    <rect x={x + 8} y={y + 8} width="24" height="24" rx="7" fill={color === '#167dfe' ? '#eef5ff' : '#f5efff'} />
    <g transform={`translate(${x + 20} ${y + 20})`} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">{glyph}</g>
    <text x={x + 40} y={y + 18} fill="#231f20" fontSize="9.5" fontWeight="700" fontFamily="var(--font-sans, Arial)">{title}</text>
    <text x={x + 40} y={y + 31} fill="#606775" fontSize="8.5" fontFamily="var(--font-sans, Arial)">{sub}</text>
    <g className={s.check}><circle cx={x + 108} cy={y + 3} r="9" fill={color} stroke="#fff" strokeWidth="2" /><path d={`m${x + 104} ${y + 3} 3 3 5-6`} stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" /></g>
  </g>;
}

export function HoloLines({ id }: { id: string }) {
  return <defs><pattern id={id} width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0 5.5h6" stroke="#9cc8ff" strokeOpacity=".35" strokeWidth=".6" /></pattern></defs>;
}
