import type { CSSProperties } from 'react';
import { Part } from './steel-parts';
import s from './steel.module.css';

/*
 * Each service is a physically rendered studio object (glossy ceramic, polished chrome, anodised
 * brand blue, glass) saved as a transparent still in /public/services/renders. The still is split
 * into horizontal bands, one per build stage. When a service comes into focus, a drone carries each
 * band in, lowers it into place with a small contact glow and flies off; a light sweep finishes it.
 */
export type SceneProps = { id: string; built: number; ghost: boolean; slug: string; stages: number };

/** Where the render sits in the scene (viewBox 140 40 560 430), slightly overlapping the backdrop. */
const FRAME = { x: 168, y: -14, size: 520 };
const BANDS = 5;
const DRONE = 128;
/** Horizontal landing offsets and approach sides, so flights do not stack on one line. */
const FLIGHTS = [{ x: -70, from: -300 }, { x: 60, from: 300 }, { x: -30, from: -320 }, { x: 80, from: 300 }, { x: 0, from: -300 }];

export function RenderedObject({ id, built, ghost, slug, stages }: SceneProps) {
  const band = FRAME.size / BANDS, centre = FRAME.x + FRAME.size / 2, src = `/services/renders/${slug}.webp`;
  const top = (k: number) => FRAME.y + FRAME.size - band * (k + 1);
  return <g className={s.float}>
    <defs>
      {Array.from({ length: BANDS }, (_, k) => <clipPath key={k} id={`${id}-band${k}`}>
        <rect x={FRAME.x} y={top(k) - (k === BANDS - 1 ? 40 : 0)} width={FRAME.size} height={band + (k === BANDS - 1 ? 40 : 0) + .6} />
      </clipPath>)}
      <mask id={`${id}-shape`} style={{ maskType: 'alpha' } as CSSProperties}><image href={src} x={FRAME.x} y={FRAME.y} width={FRAME.size} height={FRAME.size} /></mask>
      <linearGradient id={`${id}-sweep`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset=".5" stopColor="#fff" stopOpacity=".85" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
    </defs>
    {Array.from({ length: BANDS }, (_, k) => <Part key={k} n={Math.min(stages, k + 1)} built={built} ghost={ghost}>
      <g clipPath={`url(#${id}-band${k})`}><image href={src} x={FRAME.x} y={FRAME.y} width={FRAME.size} height={FRAME.size} preserveAspectRatio="xMidYMid meet" /></g>
    </Part>)}
    {/* Assembly crew: one flight per band, timed to that band's build stage (only while assembling) */}
    {Array.from({ length: BANDS }, (_, k) => {
      const stage = Math.min(stages, k + 1), flight = FLIGHTS[k], y = top(k);
      return <g key={k} style={{ '--n': stage } as CSSProperties}>
        <ellipse className={s.spark} cx={centre + flight.x * .4} cy={y + 6} rx="46" ry="7" fill="#167dfe" />
        {/* Banks into the approach, levels out to lower the part on a tether, releases and climbs away */}
        <g className={s.drone} style={{ '--dx': `${flight.from}px`, '--tilt': flight.from < 0 ? '11deg' : '-11deg' } as CSSProperties}>
          <line className={s.tether} x1={centre + flight.x} y1={y - DRONE * .2} x2={centre + flight.x} y2={y + 6} />
          <ellipse className={s.downwash} cx={centre + flight.x} cy={y - 2} rx="34" ry="5" />
          <image href="/services/renders/drone.webp" x={centre + flight.x - DRONE / 2} y={y - DRONE * .78} width={DRONE} height={DRONE} />
        </g>
      </g>;
    })}
    <g mask={`url(#${id}-shape)`}><rect className={s.sweepLight} x={FRAME.x - 180} y={FRAME.y} width="150" height={FRAME.size} fill={`url(#${id}-sweep)`} /></g>
  </g>;
}
