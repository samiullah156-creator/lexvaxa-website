import type { CSSProperties, ReactNode } from 'react';
import styles from './process-scene.module.css';

/**
 * The four delivery phases as small isometric scenes, drawn in the same materials as the hero
 * machine (white enamel, steel, brand blue and purple). Vector, so they stay sharp from a 64px
 * thumbnail to a 240px stage, and they cost no image download.
 */

const UNIT = 11;
const ORIGIN = { x: 120, y: 138 };
const COS = 0.866, SIN = 0.5;

/** Isometric point: x runs to the lower right, y to the lower left, z straight up. */
const pt = (x: number, y: number, z: number) => [ORIGIN.x + (x - y) * COS * UNIT, ORIGIN.y + (x + y) * SIN * UNIT - z * UNIT] as const;
const poly = (...points: (readonly [number, number])[]) => points.map(([px, py]) => `${px.toFixed(1)},${py.toFixed(1)}`).join(' ');

type Tone = 'white' | 'steel' | 'blue' | 'purple' | 'ink';

/** A box: top face plus the two faces that point at the viewer. */
function Box({ x, y, z = 0, w, d, h, tone = 'white', className, style }: { x: number; y: number; z?: number; w: number; d: number; h: number; tone?: Tone; className?: string; style?: CSSProperties }) {
  const top = poly(pt(x, y, z + h), pt(x + w, y, z + h), pt(x + w, y + d, z + h), pt(x, y + d, z + h));
  const left = poly(pt(x, y + d, z + h), pt(x + w, y + d, z + h), pt(x + w, y + d, z), pt(x, y + d, z));
  const right = poly(pt(x + w, y, z + h), pt(x + w, y + d, z + h), pt(x + w, y + d, z), pt(x + w, y, z));
  return <g className={`${styles[tone]} ${className ?? ''}`} style={style}>
    <polygon className={styles.left} points={left} />
    <polygon className={styles.right} points={right} />
    <polygon className={styles.top} points={top} />
  </g>;
}

/** A line drawn on the top plane of a box (z fixed). */
const flat = (points: [number, number][], z: number) => poly(...points.map(([px, py]) => pt(px, py, z)));

function Base({ children }: { children: ReactNode }) {
  const [sx, sy] = pt(0, 0, 0);
  return <>
    <ellipse className={styles.shadow} cx={sx} cy={sy + 8} rx={86} ry={40} />
    <Box x={-5.5} y={-5.5} w={11} d={11} h={0.7} tone="white" />
    <polygon className={styles.baseRing} points={flat([[-4.9, -4.9], [4.9, -4.9], [4.9, 4.9], [-4.9, 4.9]], 0.71)} />
    {children}
  </>;
}

/** 01 Understand: a lens moving over the current workflow, laid out as cards. */
function Discover() {
  const [lx, ly] = pt(1.2, -0.6, 6.4);
  return <Base>
    <Box x={-4} y={-3.6} w={3.4} d={2.4} h={0.25} z={0.7} />
    <Box x={0.4} y={-3.6} w={3.4} d={2.4} h={0.25} z={0.7} tone="blue" />
    <Box x={-4} y={0.4} w={3.4} d={2.4} h={0.25} z={0.7} />
    <Box x={0.4} y={0.4} w={3.4} d={2.4} h={0.25} z={0.7} tone="steel" />
    {[[-3.4, -2.6], [-3.4, 1.4], [1, 1.4]].map(([cx, cy]) => <polyline key={`${cx}${cy}`} className={styles.cardLine} points={flat([[cx, cy], [cx + 2.2, cy]], 0.96)} />)}
    <polyline className={styles.flowLine} points={flat([[-0.6, -2.4], [0.4, -2.4]], 0.96)} />
    <polyline className={styles.flowLine} points={flat([[2.1, -1.2], [2.1, 0.4]], 0.96)} />
    <g className={styles.lens}>
      <line className={styles.lensHandle} x1={lx + 20} y1={ly + 20} x2={lx + 44} y2={ly + 44} />
      <circle className={styles.lensRimBack} cx={lx + 2} cy={ly + 3} r={27} />
      <circle className={styles.lensGlass} cx={lx} cy={ly} r={27} />
      <path className={styles.lensShine} d={`M${lx - 15} ${ly - 8}a17 17 0 0 1 12-11`} />
    </g>
  </Base>;
}

/** 02 Design: the system as layers (data, logic, interface) with the connections between them. */
function Design() {
  const layer = (z: number, tone: Tone, delay: number) => <Box x={-3.6} y={-3.6} w={7.2} d={7.2} h={0.35} z={z} tone={tone} className={styles.layer} style={{ animationDelay: `${delay}s` }} />;
  const corner = (x: number, y: number) => { const [ax, ay] = pt(x, y, 1.4); const [bx, by] = pt(x, y, 6.1); return <line key={`${x}${y}`} className={styles.link} x1={ax} y1={ay} x2={bx} y2={by} />; };
  return <Base>
    {corner(-3.6, -3.6)}{corner(3.6, -3.6)}
    {layer(1.1, 'steel', 0)}
    {layer(3.6, 'white', 0.15)}
    {corner(-3.6, 3.6)}{corner(3.6, 3.6)}
    {layer(6.1, 'blue', 0.3)}
    <Box x={-2.4} y={-2.4} w={1.3} d={1.3} h={1.3} z={6.45} tone="white" className={styles.layer} style={{ animationDelay: '.3s' }} />
    <Box x={1.1} y={-0.6} w={1.3} d={1.3} h={1.3} z={6.45} tone="purple" className={styles.layer} style={{ animationDelay: '.3s' }} />
    <Box x={-0.6} y={1.2} w={1.3} d={1.3} h={1.3} z={6.45} tone="white" className={styles.layer} style={{ animationDelay: '.3s' }} />
  </Base>;
}

/** 03 Build: modules assembled one by one; the last one is lowered into place. */
function Build() {
  return <Base>
    <Box x={-3.4} y={-3.4} w={3.2} d={3.2} h={3.2} z={0.7} />
    <Box x={0.2} y={-3.4} w={3.2} d={3.2} h={3.2} z={0.7} tone="steel" />
    <Box x={-3.4} y={0.2} w={3.2} d={3.2} h={3.2} z={0.7} tone="white" />
    <Box x={0.2} y={0.2} w={3.2} d={3.2} h={3.2} z={0.7} tone="blue" className={styles.drop} />
    <Box x={-3.4} y={-3.4} w={3.2} d={3.2} h={1.6} z={3.9} tone="purple" className={styles.dropLate} />
    <polyline className={styles.seam} points={flat([[-3.4, -0.1], [3.4, -0.1]], 3.92)} />
  </Base>;
}

/** 04 Handover & improve: a live dashboard your team owns, the documentation beside it, and the improvement loop. */
function Launch() {
  const sx = -3.8, sw = 7.6, sy = -3.6, sd = 0.7, sz = 0.7, sh = 6;
  const screen = (t: number, z: number) => pt(sx + 0.55 + t * (sw - 1.1), sy + sd + 0.001, sz + z);
  const pulse = [0, .14, .2, .26, .32, .4, .55, .62, .68, .74, .86, 1].map((t, index) => screen(t, [2.6, 2.6, 3.9, 1.6, 2.6, 2.6, 2.6, 3.4, 2, 2.6, 2.6, 2.6][index]));
  const panel = poly(screen(0, 0.55), screen(1, 0.55), screen(1, sh - 0.55), screen(0, sh - 0.55));
  const ring = Array.from({ length: 33 }, (_unused, index) => { const angle = (index / 32) * Math.PI * 1.7 + 0.6; return pt(1.6 + Math.cos(angle) * 2.6, 2.4 + Math.sin(angle) * 2.6, 0.72); });
  const [ax, ay] = ring[ring.length - 1];
  return <Base>
    <polyline className={styles.loop} points={poly(...ring)} />
    <circle className={styles.loopHead} cx={ax} cy={ay} r={3.6} />
    <Box x={sx} y={sy} w={sw} d={sd} h={sh} z={sz} tone="white" />
    <polygon className={styles.screen} points={panel} />
    <polyline className={styles.pulse} points={poly(...pulse)} />
    {[0.12, 0.27, 0.42].map((t, index) => <polygon key={t} className={styles.bar} points={poly(screen(t + .62, 0.9), screen(t + .62 + .09, 0.9), screen(t + .62 + .09, 1.2 + index * 0.45), screen(t + .62, 1.2 + index * 0.45))} style={{ display: t + .62 + .09 > 1 ? 'none' : undefined }} />)}
    <Box x={-1.4} y={2.2} w={2.6} d={2} h={0.3} z={0.7} />
    <Box x={-1.3} y={2.3} w={2.6} d={2} h={0.3} z={1} tone="steel" />
    <Box x={-1.2} y={2.2} w={2.6} d={2} h={0.3} z={1.3} />
    <Box x={-0.8} y={2.5} w={0.9} d={0.9} h={0.18} z={1.6} tone="purple" />
  </Base>;
}

const SCENES: Record<string, () => ReactNode> = { discover: Discover, design: Design, build: Build, launch: Launch };

export function ProcessScene({ name, className = '', still = false }: { name: string; className?: string; still?: boolean }) {
  const Scene = SCENES[name] ?? Discover;
  return <svg className={`${styles.scene} ${className}`} data-still={still} viewBox="0 0 240 240" aria-hidden="true" focusable="false"><Scene /></svg>;
}
