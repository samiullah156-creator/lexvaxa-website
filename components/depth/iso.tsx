import type { CSSProperties, ReactNode } from 'react';
import styles from './iso.module.css';

/**
 * A tiny isometric drawing kit shared by the process and industry scenes. Everything is plain SVG
 * in the brand materials (white enamel, steel, blue, purple, ink), lit from the top left.
 */

export const UNIT = 11;
const ORIGIN = { x: 120, y: 138 };
const COS = 0.866, SIN = 0.5;

export type Point = readonly [number, number];
export type Tone = 'white' | 'steel' | 'blue' | 'purple' | 'ink';

/** Isometric point: x runs to the lower right, y to the lower left, z straight up. */
export const pt = (x: number, y: number, z: number): Point => [ORIGIN.x + (x - y) * COS * UNIT, ORIGIN.y + (x + y) * SIN * UNIT - z * UNIT];
export const poly = (...points: Point[]) => points.map(([px, py]) => `${px.toFixed(1)},${py.toFixed(1)}`).join(' ');
/** A polyline lying on a horizontal plane at height z. */
export const flat = (points: [number, number][], z: number) => poly(...points.map(([px, py]) => pt(px, py, z)));

type Common = { tone?: Tone; className?: string; style?: CSSProperties };

/** A box: its top and the two faces that point at the viewer. */
export function Box({ x, y, z = 0, w, d, h, tone = 'white', className, style }: { x: number; y: number; z?: number; w: number; d: number; h: number } & Common) {
  const top = poly(pt(x, y, z + h), pt(x + w, y, z + h), pt(x + w, y + d, z + h), pt(x, y + d, z + h));
  const left = poly(pt(x, y + d, z + h), pt(x + w, y + d, z + h), pt(x + w, y + d, z), pt(x, y + d, z));
  const right = poly(pt(x + w, y, z + h), pt(x + w, y + d, z + h), pt(x + w, y + d, z), pt(x + w, y, z));
  return <g className={`${styles[tone]} ${className ?? ''}`} style={style}>
    <polygon className={styles.left} points={left} />
    <polygon className={styles.right} points={right} />
    <polygon className={styles.top} points={top} />
    <polyline className={styles.edge} points={poly(pt(x, y + d, z + h), pt(x + w, y + d, z + h), pt(x + w, y, z + h))} />
  </g>;
}

/** A disc lying flat on a horizontal plane (targets, rings, pulses). */
export function Disc({ x, y, z, r, className }: { x: number; y: number; z: number; r: number; className?: string }) {
  const [cx, cy] = pt(x, y, z);
  return <ellipse className={className} cx={cx} cy={cy} rx={r * UNIT * 1.2247} ry={r * UNIT * 0.7071} />;
}

/** The soft shadow an object casts on the plinth (light from the top left, so it falls to the lower right). */
export function Ground({ x, y, w, d, z = 0.71 }: { x: number; y: number; w: number; d: number; z?: number }) {
  return <polygon className={styles.ground} points={flat([[x + 0.25, y + 0.25], [x + w + 0.55, y + 0.25], [x + w + 0.55, y + d + 0.55], [x + 0.25, y + d + 0.55]], z)} />;
}

/** An upright cylinder (coins, wheels lying flat, pillars). */
export function Cylinder({ x, y, z = 0, r, h, tone = 'white', className, style }: { x: number; y: number; z?: number; r: number; h: number } & Common) {
  const [cx, bottom] = pt(x, y, z);
  const top = bottom - h * UNIT;
  const rx = r * UNIT * 1.2247, ry = r * UNIT * 0.7071;
  return <g className={`${styles[tone]} ${className ?? ''}`} style={style}>
    <path className={styles.left} d={`M${cx - rx} ${top}V${bottom}A${rx} ${ry} 0 0 0 ${cx + rx} ${bottom}V${top}Z`} />
    <path className={styles.right} d={`M${cx} ${top + ry}V${bottom + ry}A${rx} ${ry} 0 0 0 ${cx + rx} ${bottom}V${top}A${rx} ${ry} 0 0 1 ${cx} ${top + ry}Z`} />
    <ellipse className={styles.top} cx={cx} cy={top} rx={rx} ry={ry} />
  </g>;
}

/** A wheel standing upright on a side that faces the lower left (a circle in the x–z plane). */
export function Wheel({ x, y, z = 0, r }: { x: number; y: number; z?: number; r: number }) {
  const [cx, cy] = pt(x, y, z + r);
  // A circle in the x–z plane is a unit circle squeezed by cos 30° and sheared by 30°.
  const face = `translate(${cx.toFixed(1)} ${cy.toFixed(1)}) skewY(30) scale(.866 1)`;
  return <g>
    <circle className={styles.tyre} r={r * UNIT} transform={`translate(-2.2 -1.2) ${face}`} />
    <circle className={styles.tyre} r={r * UNIT} transform={face} />
    <circle className={styles.hub} r={r * UNIT * .45} transform={face} />
  </g>;
}

/** A flat panel drawn on a face that looks to the lower left (plane y = const). */
export const leftFace = (x: number, y: number, z: number, w: number, h: number) => poly(pt(x, y, z), pt(x + w, y, z), pt(x + w, y, z + h), pt(x, y, z + h));
/** A flat panel drawn on a face that looks to the lower right (plane x = const). */
export const rightFace = (x: number, y: number, z: number, d: number, h: number) => poly(pt(x, y, z), pt(x, y + d, z), pt(x, y + d, z + h), pt(x, y, z + h));

/** A gable roof sitting on a box footprint, ridge running along x. */
export function Roof({ x, y, z, w, d, h, tone = 'blue' }: { x: number; y: number; z: number; w: number; d: number; h: number; tone?: Tone }) {
  const ridgeY = y + d / 2;
  // Back slope first, then the gable end, then the front slope that faces the viewer.
  return <g className={styles[tone]}>
    <polygon className={styles.top} points={poly(pt(x, y, z), pt(x + w, y, z), pt(x + w, ridgeY, z + h), pt(x, ridgeY, z + h))} />
    <polygon className={styles.right} points={poly(pt(x + w, y, z), pt(x + w, y + d, z), pt(x + w, ridgeY, z + h))} />
    <polygon className={styles.left} points={poly(pt(x, y + d, z), pt(x + w, y + d, z), pt(x + w, ridgeY, z + h), pt(x, ridgeY, z + h))} />
  </g>;
}

/**
 * The plinth every scene stands on: a steel base, a thin blue band and a white top marked with a
 * light blue engineering grid and corner brackets, like a part on a drawing board.
 */
export function Plinth({ children, size = 11 }: { children: ReactNode; size?: number }) {
  const [sx, sy] = pt(0, 0, 0);
  const half = size / 2, corner = half - 0.55, arm = 1;
  const grid: ReactNode[] = [];
  for (let i = -half + 1; i < half - 0.01; i += 1) {
    grid.push(<polyline key={`x${i}`} className={styles.grid} points={flat([[i, -half + 0.12], [i, half - 0.12]], 0.705)} />);
    grid.push(<polyline key={`y${i}`} className={styles.grid} points={flat([[-half + 0.12, i], [half - 0.12, i]], 0.705)} />);
  }
  const corners = ([[-1, -1], [1, -1], [1, 1], [-1, 1]] as const).map(([cx, cy]) => {
    const x0 = cx * corner, y0 = cy * corner;
    return <polyline key={`${cx}${cy}`} className={styles.corner} points={flat([[x0 - cx * arm, y0], [x0, y0], [x0, y0 - cy * arm]], 0.71)} />;
  });
  return <>
    <ellipse className={styles.shadow} cx={sx} cy={sy + 10} rx={size * 8.4} ry={size * 3.9} />
    <Box x={-half - 0.25} y={-half - 0.25} w={size + 0.5} d={size + 0.5} h={0.25} tone="steel" />
    <Box x={-half} y={-half} w={size} d={size} h={0.08} z={0.25} tone="blue" />
    <Box x={-half} y={-half} w={size} d={size} h={0.37} z={0.33} />
    {grid}
    {corners}
    {children}
  </>;
}

export function IsoSvg({ children, className = '', still = false, label }: { children: ReactNode; className?: string; still?: boolean; label?: string }) {
  return <svg className={`${styles.scene} ${className}`} data-still={still} data-scene={label} viewBox="0 0 240 240" aria-hidden="true" focusable="false">{children}</svg>;
}

export { styles as isoStyles };
