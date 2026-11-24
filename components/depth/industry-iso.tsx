import type { ReactNode } from 'react';
import { Box, Cylinder, Disc, Ground, IsoSvg, Plinth, Roof, Wheel, flat, isoStyles as s, leftFace, poly, pt, rightFace } from './iso';

/** A sheet of paper lying on a surface, with a few printed lines. */
function Sheet({ x, y, z = 0.7, w, d, lines = 3 }: { x: number; y: number; z?: number; w: number; d: number; lines?: number }) {
  return <>
    <Box x={x} y={y} w={w} d={d} h={0.12} z={z} />
    {Array.from({ length: lines }, (_, index) => {
      const row = y + 0.5 + index * ((d - 0.9) / Math.max(1, lines - 1));
      return <polyline key={index} className={s.line} points={flat([[x + 0.45, row], [x + w - (index === lines - 1 ? w * 0.45 : 0.45), row]], z + 0.13)} />;
    })}
  </>;
}

/** A map pin standing on the plinth, with a ring pulsing out from its foot. */
function Pin({ x, y, z = 0.71 }: { x: number; y: number; z?: number }) {
  return <>
    <Disc x={x} y={y} z={z} r={0.9} className={`${s.ring} ${s.pulse}`} />
    <Disc x={x} y={y} z={z} r={0.35} className={s.ringPurple} />
    <Box x={x - 0.08} y={y - 0.08} w={0.16} d={0.16} h={1.7} z={z} tone="steel" />
    <g className={s.float}><Cylinder x={x} y={y} z={z + 1.6} r={0.55} h={0.55} tone="purple" /></g>
  </>;
}

/**
 * One small isometric object per industry, in the same materials as the process scenes.
 * Objects are drawn back to front (smaller x + y first) so nearer parts overlap farther ones.
 */

function Legal() {
  const wire = (x: number, side: number) => { const [ax, ay] = pt(x, 0, 7.1); const [bx, by] = pt(x + side * 1.3, 0, 4.25); return <line className={s.wire} x1={ax} y1={ay} x2={bx} y2={by} />; };
  return <Plinth>
    <Cylinder x={-3.4} y={-3.4} z={0.7} r={1.1} h={0.35} tone="steel" />
    <Box x={-4.1} y={-3.95} w={1.3} d={1.1} h={1} z={1.05} tone="ink" />
    <Box x={-2.8} y={-3.55} w={1.6} d={0.32} h={0.32} z={1.4} />
    <Ground x={-4.6} y={1.4} w={2.6} d={2} />
    <Box x={-4.6} y={1.5} w={2.6} d={1.9} h={0.5} z={0.7} tone="blue" />
    <Box x={-4.4} y={1.6} w={2.4} d={1.7} h={0.45} z={1.2} />
    <Box x={-4.5} y={1.4} w={2.5} d={1.8} h={0.45} z={1.65} tone="purple" />
    <Cylinder x={0} y={0} z={0.7} r={1.7} h={0.6} />
    <Box x={-0.3} y={-0.3} w={0.6} d={0.6} h={5.8} z={1.3} tone="steel" />
    <g className={s.sway} style={{ transformOrigin: `${pt(0, 0, 7.2)[0]}px ${pt(0, 0, 7.2)[1]}px` }}>
      {wire(-3.6, -1)}{wire(-3.6, 1)}{wire(3.6, -1)}{wire(3.6, 1)}
      <Box x={-4} y={-0.2} w={8} d={0.4} h={0.35} z={7.1} tone="steel" />
      <Cylinder x={-3.6} y={0} z={4} r={1.45} h={0.25} />
      <Cylinder x={3.6} y={0} z={4} r={1.45} h={0.25} tone="blue" />
    </g>
    <Cylinder x={0} y={0} z={7.45} r={0.45} h={0.45} tone="purple" />
    <Sheet x={1.4} y={2} w={3.2} d={2.6} />
    <Disc x={3.8} y={3.9} z={0.83} r={0.4} className={s.ringPurple} />
  </Plinth>;
}

function Logistics() {
  return <Plinth>
    <polyline className={s.dash} points={flat([[-4.8, 3.6], [0, 3.6], [0, 4.4], [3.6, 4.4]], 0.72)} />
    <Box x={-4.9} y={-4.9} w={3.8} d={2} h={0.25} z={0.7} tone="steel" />
    <Box x={-4.7} y={-4.7} w={1.6} d={1.6} h={1.4} z={0.95} tone="purple" />
    <Box x={-2.9} y={-4.7} w={1.6} d={1.6} h={1} z={0.95} />
    <Box x={-2.7} y={-4.5} w={1.2} d={1.2} h={0.8} z={1.95} />
    <Box x={2.6} y={-4.6} w={0.5} d={0.5} h={2.4} z={0.7} tone="steel" />
    <Cylinder x={2.85} y={-4.35} z={3.1} r={0.45} h={0.35} tone="blue" />
    <Ground x={-4.2} y={-1.6} w={8.2} d={3.4} />
    <Box x={-4.2} y={-1.5} w={8.2} d={3} h={0.5} z={0.9} tone="ink" />
    <Box x={-4} y={-1.6} w={5.2} d={3.2} h={3.6} z={1.4} />
    <polygon className={s.ledPurple} points={leftFace(-3.4, 1.61, 3.6, 2.2, 0.5)} />
    <Box x={1.4} y={-1.6} w={2.4} d={3.2} h={2.6} z={1.4} tone="blue" />
    <polygon className={s.glass} points={rightFace(3.81, -1.3, 2.6, 2.6, 1.1)} />
    <polygon className={s.glass} points={leftFace(1.8, 1.61, 2.6, 1.6, 1.1)} />
    <Wheel x={-2.6} y={1.66} z={0.7} r={0.85} />
    <Wheel x={2.6} y={1.66} z={0.7} r={0.85} />
    <Pin x={4} y={4.4} />
  </Plinth>;
}

function Saas() {
  const unit = (z: number, tone: 'white' | 'steel', late = false) => <g key={z}>
    <Box x={-3.4} y={-1.4} w={3} d={2.8} h={1.5} z={z} tone={tone} />
    <circle className={late ? `${s.ledGreen} ${s.blinkLate}` : `${s.ledGreen} ${s.blink}`} cx={pt(-2.9, 1.41, z + 0.75)[0]} cy={pt(-2.9, 1.41, z + 0.75)[1]} r={1.6} />
    <polyline className={s.line} points={poly(pt(-2.3, 1.41, z + 0.75), pt(-0.8, 1.41, z + 0.75))} />
  </g>;
  const screen = (t: number, z: number) => pt(1.5 + t * 3, -0.29, 3.6 + z);
  const chart = [0, .2, .4, .6, .8, 1].map((t, index) => screen(t, [0.5, 0.9, 0.7, 1.4, 1.2, 1.8][index]));
  return <Plinth>
    <Ground x={-3.4} y={-1.4} w={3} d={2.8} />
    {unit(0.7, 'white')}{unit(2.25, 'steel', true)}{unit(3.8, 'white')}
    <polyline className={s.dash} points={poly(pt(-0.4, 0, 3), pt(1.2, 0, 3.6))} />
    <g className={s.float}>
      <Box x={1.2} y={-0.6} w={3.6} d={0.3} h={2.8} z={3.2} />
      <polygon className={s.glass} points={leftFace(1.4, -0.29, 3.4, 3.2, 2.4)} />
      <polyline className={`${s.lineBlue} ${s.draw}`} points={poly(...chart)} />
    </g>
    <polyline className={s.dash} points={flat([[-1.9, 1.5], [-1.9, 3.4], [-3.1, 3.4]], 0.72)} />
    <Disc x={-3.6} y={3.6} z={0.71} r={1.4} className={`${s.ring} ${s.pulse}`} />
    <Cylinder x={-3.6} y={3.6} z={0.7} r={1} h={0.5} tone="blue" />
    <Cylinder x={-3.6} y={3.6} z={1.25} r={1} h={0.5} />
    <Cylinder x={-3.6} y={3.6} z={1.8} r={1} h={0.5} tone="blue" />
    <Box x={2.4} y={2.6} w={2.2} d={1.6} h={0.25} z={0.7} tone="steel" />
    <polygon className={s.led} points={flat([[2.7, 2.9], [4.3, 2.9], [4.3, 3.9], [2.7, 3.9]], 0.96)} />
  </Plinth>;
}

function Retail() {
  const handle = `M${pt(-1.1, -0.1, 4.9).join(' ')}Q${pt(-0.2, -0.1, 7.4).join(' ')} ${pt(0.7, -0.1, 4.9).join(' ')}`;
  return <Plinth>
    <Box x={-4.6} y={-4.4} w={2} d={2} h={0.9} z={0.7} />
    <Box x={-4.4} y={-4.2} w={1.6} d={1.6} h={0.8} z={1.6} tone="blue" />
    <Ground x={-2} y={-1.2} w={3.6} d={2.2} />
    <Box x={-2} y={-1.2} w={3.6} d={2.2} h={4.2} z={0.7} tone="purple" />
    <path className={s.wire} style={{ strokeWidth: 3, stroke: '#3a3346' }} d={handle} />
    <polygon className={s.top} style={{ fill: '#ffffff33' }} points={leftFace(-2, 1.01, 4.2, 3.6, 0.7)} />
    <circle cx={pt(-0.2, 1.01, 2.6)[0]} cy={pt(-0.2, 1.01, 2.6)[1]} r={6} fill="#fff" />
    <g className={s.floatLate}>
      <Box x={2} y={1} w={2} d={2} h={1.6} z={0.7} />
      <polyline className={s.dash} points={poly(pt(3, 1, 2.3), pt(3, 3, 2.3))} />
      <Box x={2.3} y={1.3} w={1.4} d={1.4} h={1} z={2.3} tone="blue" />
    </g>
    <Box x={-4.6} y={2.2} w={1.8} d={2.8} h={0.25} z={0.7} tone="ink" />
    <polygon className={s.paper} points={flat([[-4.4, 2.4], [-3, 2.4], [-3, 4.8], [-4.4, 4.8]], 0.96)} />
    <polygon className={s.led} points={flat([[-4.2, 2.6], [-3.2, 2.6], [-3.2, 3.4], [-4.2, 3.4]], 0.97)} />
    <polygon className={s.ledPurple} points={flat([[-4.2, 4], [-3.2, 4], [-3.2, 4.5], [-4.2, 4.5]], 0.97)} />
    <polygon className={s.paper} points={flat([[-1.4, 3.4], [0.4, 3.4], [0.9, 3.95], [0.4, 4.5], [-1.4, 4.5]], 0.75)} />
    <Disc x={0.25} y={3.95} z={0.76} r={0.16} className={s.ringPurple} />
  </Plinth>;
}

function Healthcare() {
  const ecg = [[-4.8, -3.6], [-2.4, -3.6], [-1.9, -4.4], [-1.4, -2.8], [-0.9, -3.6], [0.6, -3.6], [1, -4.1], [1.4, -3.6], [4.8, -3.6]] as [number, number][];
  return <Plinth>
    <polyline className={`${s.lineBlue} ${s.draw}`} points={flat(ecg, 0.72)} />
    <Ground x={-2.7} y={-0.6} w={5.4} d={1.2} />
    <Box x={-2.7} y={-0.6} w={1.8} d={1.2} h={1.8} z={2.8} tone="blue" />
    <Box x={-0.9} y={-0.6} w={1.8} d={1.2} h={5.8} z={0.7} tone="blue" />
    <Box x={0.9} y={-0.6} w={1.8} d={1.2} h={1.8} z={2.8} tone="blue" />
    <polyline className={s.lineWhite} points={poly(pt(-0.5, 0.61, 3.7), pt(-0.1, 0.61, 3.7), pt(0.1, 0.61, 4.2), pt(0.35, 0.61, 3.2), pt(0.55, 0.61, 3.7))} />
    <Sheet x={-4.6} y={1.8} w={2.6} d={3.2} lines={4} />
    <Box x={-3.7} y={1.65} w={0.8} d={0.4} h={0.3} z={0.82} tone="steel" />
    <Cylinder x={3.2} y={2.4} z={0.7} r={0.8} h={1.5} />
    <Cylinder x={3.2} y={2.4} z={2.2} r={0.85} h={0.45} tone="blue" />
    <g className={s.floatLate}><Cylinder x={1.2} y={3.8} z={0.7} r={0.35} h={0.3} tone="purple" /></g>
  </Plinth>;
}

function Professional() {
  const handle = `M${pt(-0.9, 0, 4.1).join(' ')}Q${pt(0, 0, 5.6).join(' ')} ${pt(0.9, 0, 4.1).join(' ')}`;
  return <Plinth>
    <Box x={1.6} y={-4.6} w={2.6} d={1.6} h={2} z={0.7} />
    <Box x={1.6} y={-4.6} w={2.6} d={1.6} h={0.45} z={2.7} tone="purple" />
    {[0, 1, 2].map((row) => [0, 1, 2, 3].map((col) => <circle key={`${row}${col}`} className={row === 1 && col === 2 ? s.led : s.cell}
      cx={pt(1.95 + col * 0.6, -2.99, 2.25 - row * 0.5)[0]} cy={pt(1.95 + col * 0.6, -2.99, 2.25 - row * 0.5)[1]} r={1.7} />))}
    <Ground x={-2.6} y={-0.9} w={5.2} d={1.8} />
    <Box x={-2.6} y={-0.9} w={5.2} d={1.8} h={3.4} z={0.7} tone="blue" />
    <path className={s.wire} style={{ strokeWidth: 3, stroke: '#3a3346' }} d={handle} />
    <polyline className={s.lineWhite} points={poly(pt(-2.6, 0.91, 3.1), pt(2.6, 0.91, 3.1))} />
    <polygon className={s.top} style={{ fill: '#fff' }} points={leftFace(-0.4, 0.92, 2.7, 0.8, 0.6)} />
    <Box x={-4.4} y={1.9} w={3} d={2.2} h={0.15} z={0.7} />
    <g className={s.floatLate}>
      <Box x={-4.1} y={2.1} w={3} d={2.2} h={0.15} z={0.9} />
      <polyline className={s.line} points={flat([[-3.7, 2.7], [-1.6, 2.7]], 1.06)} />
      <polyline className={s.line} points={flat([[-3.7, 3.3], [-2.3, 3.3]], 1.06)} />
    </g>
    <Cylinder x={3.3} y={2.6} z={0.7} r={0.65} h={1.2} />
  </Plinth>;
}

function RealEstate() {
  const windows = [0, 1, 2].flatMap((row) => [0, 1].map((col) => <polygon key={`${row}${col}`} className={s.glass}
    points={leftFace(-4.7 + col * 0.8, -3.19, 1.6 + row * 1.5, 0.5, 0.8)} />));
  return <Plinth>
    <Box x={-5} y={-5} w={2} d={1.8} h={5.6} z={0.7} tone="steel" />
    {windows}
    <polygon className={s.path} points={flat([[0.3, 1.6], [1, 1.6], [1.6, 5.4], [0.6, 5.4]], 0.72)} />
    <Ground x={-2.6} y={-2} w={4.4} d={3.6} />
    <Box x={-2.6} y={-2} w={4.4} d={3.6} h={3} z={0.7} />
    <Roof x={-2.9} y={-2.3} z={3.7} w={5} d={4.2} h={2} tone="blue" />
    <polygon className={s.glass} points={leftFace(-2, 1.61, 1.9, 1.2, 1)} />
    <polygon className={s.top} style={{ fill: '#3a3346', stroke: '#16111d' }} points={leftFace(0.3, 1.61, 0.7, 1, 1.9)} />
    <polygon className={s.glass} points={rightFace(1.81, -1.4, 1.9, 1.2, 1)} />
    <Box x={3} y={2.2} w={0.2} d={0.2} h={2.6} z={0.7} tone="steel" />
    <g className={s.sway} style={{ transformOrigin: `${pt(3.1, 2.3, 3.2)[0]}px ${pt(3.1, 2.3, 3.2)[1]}px` }}>
      <Box x={2.3} y={2.4} w={1.8} d={0.15} h={1.1} z={2.1} tone="purple" />
    </g>
    <g className={s.floatLate}>
      <Disc x={-3.4} y={3.4} z={1.6} r={0.6} className={s.ringBlue} />
      <Box x={-2.9} y={3.3} w={1.6} d={0.22} h={0.15} z={1.55} tone="blue" />
    </g>
  </Plinth>;
}

function Education() {
  const tassel = `M${pt(-0.2, -0.4, 3.9).join(' ')}L${pt(1.9, -0.4, 3.9).join(' ')}L${pt(1.9, -0.4, 2.6).join(' ')}`;
  return <Plinth>
    <Ground x={-3} y={-2} w={5} d={3.4} />
    <Box x={-3} y={-2} w={5} d={3.4} h={0.8} z={0.7} tone="blue" />
    <Box x={-2.8} y={-1.8} w={4.6} d={3} h={0.7} z={1.5} />
    <polyline className={s.line} points={poly(pt(-2.6, 1.21, 1.85), pt(1.6, 1.21, 1.85))} />
    <Box x={-2.6} y={-2.1} w={4.8} d={3.3} h={0.7} z={2.2} tone="purple" />
    <g className={s.float}>
      <Cylinder x={-0.2} y={-0.4} z={2.9} r={1.3} h={0.75} tone="ink" />
      <Box x={-2.4} y={-2.6} w={4.4} d={4.4} h={0.22} z={3.65} tone="ink" />
      <Cylinder x={-0.2} y={-0.4} z={3.87} r={0.3} h={0.15} tone="blue" />
      <path className={s.lineBlue} d={tassel} />
      <circle className={s.led} cx={pt(1.9, -0.4, 2.5)[0]} cy={pt(1.9, -0.4, 2.5)[1]} r={2.4} />
    </g>
    <Box x={1.6} y={2.4} w={3.2} d={0.2} h={2.1} z={0.95} tone="ink" />
    <polygon className={s.glass} points={leftFace(1.8, 2.61, 1.15, 2.8, 1.7)} />
    <polygon className={s.led} points={poly(pt(2.95, 2.62, 1.55), pt(2.95, 2.62, 2.45), pt(3.75, 2.62, 2))} />
    <Box x={1.6} y={2.4} w={3.2} d={2.2} h={0.25} z={0.7} tone="steel" />
    <Box x={-4.6} y={3.2} w={3} d={0.3} h={0.3} z={0.7} tone="purple" />
    <Box x={-1.6} y={3.2} w={0.5} d={0.3} h={0.3} z={0.7} />
  </Plinth>;
}

function Finance() {
  const bars: [number, number, 'steel' | 'white' | 'blue' | 'purple'][] = [[-4, 1.6, 'steel'], [-2.2, 2.8, 'white'], [-0.4, 4, 'blue'], [1.4, 5.4, 'purple']];
  return <Plinth>
    <Ground x={-4} y={-1.6} w={6.8} d={1.4} />
    {bars.map(([x, h, tone], index) => <g key={x} className={s.grow} style={{ animationDelay: `${index * 0.12}s` }}><Box x={x} y={-1.6} w={1.4} d={1.4} h={h} z={0.7} tone={tone} /></g>)}
    <polyline className={`${s.lineBlue} ${s.draw}`} points={poly(pt(-3.3, -0.9, 3.2), pt(-1.5, -0.9, 4.4), pt(0.3, -0.9, 5.6), pt(2.1, -0.9, 7.2), pt(3, -0.9, 7.9))} />
    <Cylinder x={3.1} y={2.4} z={0.7} r={1} h={0.35} />
    <Cylinder x={3.1} y={2.4} z={1.05} r={1} h={0.35} tone="steel" />
    <Cylinder x={3.1} y={2.4} z={1.4} r={1} h={0.35} />
    <Disc x={1.2} y={3.4} z={0.71} r={1.1} className={`${s.ring} ${s.pulse}`} />
    <g className={s.float}><Cylinder x={1.2} y={3.4} z={1.2} r={0.8} h={0.3} tone="blue" /></g>
    <Sheet x={-4.6} y={1.6} w={2.4} d={3.4} lines={4} />
    <polyline className={s.lineBlue} points={flat([[-4.15, 4.5], [-3, 4.5]], 0.84)} />
  </Plinth>;
}

function Marketing() {
  return <Plinth>
    <Ground x={-3.8} y={-2.2} w={5.8} d={0.8} />
    <Box x={-3.8} y={-2.2} w={5.8} d={0.45} h={4.6} z={0.7} tone="ink" />
    <polygon className={s.top} style={{ fill: '#ffffff', stroke: '#16111d' }} points={leftFace(-3.5, -1.74, 1, 5.2, 4)} />
    <polygon className={s.led} points={leftFace(-3.1, -1.73, 3.5, 2.4, 1.2)} />
    <polygon className={s.ledPurple} points={leftFace(-0.4, -1.73, 3.5, 2, 1.2)} />
    <polyline className={s.line} points={poly(pt(-3.1, -1.73, 2.6), pt(1.4, -1.73, 2.6))} />
    <polyline className={s.line} points={poly(pt(-3.1, -1.73, 1.9), pt(-0.2, -1.73, 1.9))} />
    <g className={s.float}><Box x={0.8} y={1} w={1.3} d={1.3} h={1.3} z={0.7} tone="blue" /></g>
    <g className={s.floatLate}><Box x={2.6} y={1.4} w={1.3} d={1.3} h={1.3} z={0.7} tone="purple" /></g>
    <g className={s.float}><Box x={1.6} y={3} w={1.3} d={1.3} h={1.3} z={0.7} /></g>
    <Disc x={-2.8} y={3} z={0.71} r={2.1} className={`${s.ring} ${s.pulse}`} />
    <Cylinder x={-2.8} y={3} z={0.7} r={1.7} h={0.3} />
    <Disc x={-2.8} y={3} z={1.01} r={1.2} className={s.ringBlue} />
    <Disc x={-2.8} y={3} z={1.01} r={0.75} className={s.ringWhite} />
    <Disc x={-2.8} y={3} z={1.01} r={0.32} className={s.ringPurple} />
  </Plinth>;
}

const SCENES: Record<string, () => ReactNode> = {
  'legal-services': Legal, 'logistics-field-services': Logistics, 'saas-technology': Saas, 'ecommerce-retail': Retail,
  'healthcare-operations': Healthcare, 'professional-services': Professional, 'real-estate-property': RealEstate,
  'education-elearning': Education, 'finance-accounting': Finance, 'marketing-creative-agencies': Marketing,
};

export const hasIndustryScene = (slug: string) => slug in SCENES;

export function IndustryIso({ slug, className, still = false }: { slug: string; className?: string; still?: boolean }) {
  const Scene = SCENES[slug];
  return Scene ? <IsoSvg className={className} still={still} label={slug}><Scene /></IsoSvg> : null;
}
