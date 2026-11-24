'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import {
  armPoints, BASE_X, CHIP, chipPosition, DEPTH, DOCK, FLOOR_Y, HOME, INTAKE, plannedPose, round, SHOULDER_Y,
  springStep, T, TOOL, TRANSFER_MS, VIEW, type Point, type Pose, type SpringChannel,
} from '@/lib/hero-kinematics';
import { Mail, MessageSquare, Phone } from 'lucide-react';
import { serviceIcon } from '@/components/depth/service-icons';
import styles from './hero-mechanism.module.css';

type MechanismProps = {
  dockLabel: string;
  incomingLabel: string;
  dockSlug: string;
  incomingSlug: string;
  /** Changes to start a new transfer; null keeps the arm at rest. */
  transferId: number | null;
  playing: boolean;
  onCommit: () => void;
  onComplete: () => void;
  /** Render one fixed moment of the transfer (inspection only; disables playback). */
  previewTime?: number;
};

const JAW_OPEN = CHIP.width / 2 + 11;
const JAW_CLOSED = CHIP.width / 2 + 1.5;
/** Turntable ring on the steel drum (yaw markings). */
const DRUM = { x: BASE_X, y: 388, r: 62 };
const PLATE_H = 76;
/** Rails stop inside the column gutters so they never cross neighbouring copy. */
const RAIL_START = VIEW.x - 18;
const RAIL_END = VIEW.x + VIEW.width + 18;
const ROLLERS = [26, 50, 74, 98, 122];
const SETTLE_MS = 260;
/** Incoming work riding the intake belt: a call, an email and a chat. */
const PACKETS = [Phone, Mail, MessageSquare];

/* Oblique 3D: every solid recedes along one screen direction (up-left), so faces and caps stay consistent. */
const DU = { x: -0.79, y: -0.61 };
const PERP = { x: 0.61, y: -0.79 };
const add = (a: Point, b: Point): Point => ({ x: a.x + b.x, y: a.y + b.y });
const mul = (a: Point, k: number): Point => ({ x: a.x * k, y: a.y * k });
const along = (p: Point, ...terms: [Point, number][]) => terms.reduce((acc, [v, k]) => add(acc, mul(v, k)), p);
const pt = (p: Point) => `${round(p.x)} ${round(p.y)}`;
const poly = (points: Point[]) => `M${points.map(pt).join('L')}Z`;
const dots = (points: Point[], r: number) => points.map((p) => `M${round(p.x - r)} ${round(p.y)}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0`).join('');
const unit = (v: Point) => { const length = Math.hypot(v.x, v.y) || 1; return { x: v.x / length, y: v.y / length }; };
const dot = (a: Point, b: Point) => a.x * b.x + a.y * b.y;
const deg = (from: Point, to: Point) => round(Math.atan2(to.y - from.y, to.x - from.x) * 180 / Math.PI);
/** Polygon with filleted corners (machined parts never have knife edges). */
const roundPoly = (points: Point[], r: number) => points.map((p, index) => {
  const prev = points[(index + points.length - 1) % points.length], next = points[(index + 1) % points.length];
  const a = along(p, [unit({ x: prev.x - p.x, y: prev.y - p.y }), r]), b = along(p, [unit({ x: next.x - p.x, y: next.y - p.y }), r]);
  return `${index ? 'L' : 'M'}${pt(a)}Q${pt(p)} ${pt(b)}`;
}).join('') + 'Z';

/** Box extruded along DU from the centre line a→b: front face, lit top faces, shaded side faces. */
function box(a: Point, b: Point, ha: number, hb: number, depth: number) {
  const u = unit({ x: b.x - a.x, y: b.y - a.y }), n = { x: -u.y, y: u.x };
  const front = [along(a, [n, ha]), along(b, [n, hb]), along(b, [n, -hb]), along(a, [n, -ha])];
  const centre = mul(add(a, b), 0.5), d = mul(DU, depth);
  let top = '', side = '', bevel = '', crease = '';
  front.forEach((p, index) => {
    const q = front[(index + 1) % 4];
    let normal = unit({ x: q.y - p.y, y: p.x - q.x });
    if (dot(normal, { x: (p.x + q.x) / 2 - centre.x, y: (p.y + q.y) / 2 - centre.y }) < 0) normal = mul(normal, -1);
    const edge = unit({ x: q.x - p.x, y: q.y - p.y });
    const inset = `M${pt(along(p, [edge, 5], [normal, -1.7]))}L${pt(along(q, [edge, -5], [normal, -1.7]))}`;
    if (dot(normal, d) <= 0) { if (normal.y > Math.abs(normal.x) * 0.4) crease += inset; return; }
    bevel += inset;
    const face = poly([p, q, add(q, d), add(p, d)]);
    if (normal.y < -Math.abs(normal.x) * 0.4) top += face; else side += face;
  });
  const up = u.x >= 0 ? { x: u.y, y: -u.x } : { x: -u.y, y: u.x };
  return {
    u, n, up, front: roundPoly(front, 3.5), top, side, bevel, crease,
  };
}

/** Every pose-dependent path and transform, shared by the server render and animation frames. */
function geometry(pose: Pose) {
  const { shoulder: S, elbow: E, wrist: W } = armPoints(pose);
  const upper = box(S, E, 21, 17, 24);
  const fu = unit({ x: W.x - E.x, y: W.y - E.y });
  const fore = box(E, along(W, [fu, -8]), 16, 13, 20);
  const motor = box(along(E, [fu, 34], [fore.up, 20.5]), along(E, [fu, 68], [fore.up, 20.5]), 5.5, 5.5, 15);
  const wrist = box(along(W, [fu, -17]), along(W, [fu, 17]), 19, 19, 26);
  const frame = poly([along(W, [fu, -9], [wrist.n, 12]), along(W, [fu, 11], [wrist.n, 12]), along(W, [fu, 11], [wrist.n, -12]), along(W, [fu, -9], [wrist.n, -12])]);

  // One corrugated conduit, routed like the reference: up the back of the upper link, a smooth bend over
  // the elbow, then along the top of the forearm into the wrist. White clips hold it to each link.
  const uu = upper.u;
  const out = unit({ x: uu.x - fu.x, y: uu.y - fu.y });
  const outer = dot(upper.n, out) > 0 ? upper.n : mul(upper.n, -1);
  const back = (q: Point, depth: number) => add(q, mul(DU, depth));
  const start = back({ x: S.x - 4, y: S.y + 64 }, 34);
  const s1 = back(along(S, [uu, 46], [outer, 25]), 20), e1 = back(along(E, [uu, -30], [outer, 23]), 20);
  const f1 = back(along(E, [fu, 44], [fore.up, 9]), 22), w1 = back(along(W, [fu, -26], [fore.up, 7]), 22);
  const bend = Math.max(26, Math.hypot(f1.x - e1.x, f1.y - e1.y) * 0.62);
  const conduit = `M${pt(start)}C${pt(add(start, { x: -26, y: -24 }))} ${pt(along(s1, [uu, -36]))} ${pt(s1)}L${pt(e1)}C${pt(along(e1, [uu, bend]))} ${pt(along(f1, [fu, -bend]))} ${pt(f1)}L${pt(w1)}`;
  const clip = (at: Point, across: Point) => `M${pt(along(at, [across, -7.5]))}L${pt(along(at, [across, 7.5]))}`;
  const clips = clip({ x: s1.x + (e1.x - s1.x) * .45, y: s1.y + (e1.y - s1.y) * .45 }, upper.n) + clip({ x: f1.x + (w1.x - f1.x) * .5, y: f1.y + (w1.y - f1.y) * .5 }, fore.n);
  const upperAngle = deg(S, E), foreAngle = deg(E, W);
  const logoAngle = upperAngle < -90 || upperAngle > 90 ? round(upperAngle + 180) : upperAngle;
  const logoAt = along(mul(add(S, E), 0.5), [uu, 6]);

  const ticks = Array.from({ length: 12 }, (_, index) => {
    const angle = (pose.yaw + index * 30) * Math.PI / 180;
    const facing = Math.sin(angle);
    return { x: round(DRUM.x + Math.cos(angle) * DRUM.r * .94), y: round(DRUM.y + facing * DRUM.r * DEPTH * .8), opacity: facing > 0.1 ? round(0.25 + 0.75 * facing) : 0 };
  });
  const spin = Math.cos((pose.roll ?? 0) * Math.PI * 2);
  return {
    paths: {
      upperSide: upper.side, upperTop: upper.top, upperFront: upper.front,
      upperBevel: upper.bevel, upperCrease: upper.crease,
      foreSide: fore.side, foreTop: fore.top, foreFront: fore.front,
      foreBevel: fore.bevel, foreCrease: fore.crease, wristBevel: wrist.bevel, wristCrease: wrist.crease,
      conduit, clips,
      motorSide: motor.side, motorTop: motor.top, motorFront: motor.front,
      wristSide: wrist.side, wristTop: wrist.top, wristFront: wrist.front, wristFrame: frame,
    } as Record<string, string>,
    elbow: { x: round(E.x), y: round(E.y) }, wrist: { x: round(W.x), y: round(W.y) },
    hubs: { shoulder: upperAngle, elbow: foreAngle },
    logo: `translate(${round(logoAt.x)} ${round(logoAt.y)}) rotate(${logoAngle})`,
    /** The tool's soft shadow on the floor: tighter and darker as it descends. */
    shadow: { x: round(W.x), opacity: round(Math.max(0.04, Math.min(0.2, 0.3 - (FLOOR_Y - W.y) / 900))), rx: round(22 + (FLOOR_Y - W.y) * 0.08) },
    jaw: round(JAW_OPEN + (JAW_CLOSED - JAW_OPEN) * pose.grip),
    /** Tool spin seen side-on: the gripper narrows to its edge and turns its back. */
    spinScale: round(Math.sign(spin || 1) * Math.max(0.1, Math.abs(spin))), facing: spin >= 0,
    ticks,
  };
}

/** Module and station state for a moment in the transfer (null = at rest). */
function stations(time: number | null, wrist: Point, grip: number) {
  if (time === null) return {
    state: 'rest', feed: false, emit: false, seated: true, roller: 0,
    free: { opacity: 0, x: INTAKE.x, y: INTAKE.y }, held: 0, docked: { opacity: 1, x: DOCK.x },
  };
  const chip = chipPosition(time, wrist);
  const eject = Math.min(1, time / T.eject);
  const travel = (1 - (1 - Math.min(1, time / T.arrive)) ** 3) * (INTAKE.x + 10);
  return {
    state: grip > 0.5 ? 'holding' : 'moving', feed: time < T.arrive, emit: time >= T.commit, seated: chip.seated > 0.6,
    roller: round(travel / 3.4 * 57.3),
    free: { opacity: chip.held ? 0 : round(1 - (chip.entering ?? 0) * 0.9), x: round(chip.x), y: round(chip.y) }, held: chip.held ? 1 : 0,
    docked: { opacity: round(1 - eject), x: round(DOCK.x + eject * 54) },
  };
}

/**
 * A service module is a slab drawn in the same oblique projection as the arm: the face towards
 * the viewer, a lit top and a shaded left side, both receding along DU. The two extra faces are
 * the sweep of the rounded face; they start where the sweep direction is tangent to its corners.
 */
const SLAB = (() => {
  const r = 5, d = mul(DU, 7);
  const x0 = -CHIP.width / 2, x1 = CHIP.width / 2, y0 = -CHIP.height / 2, y1 = CHIP.height / 2;
  const fromTopRight = add({ x: x1 - r, y: y0 + r }, mul(PERP, r));
  const fromBottomLeft = add({ x: x0 + r, y: y1 - r }, mul(PERP, -r));
  // The top and side faces meet along the edge swept by the middle of the top-left corner.
  const ridge = { x: x0 + r * 0.293, y: y0 + r * 0.293 };
  const back = (p: Point) => add(p, d);
  const arc = (to: Point) => `A${r} ${r} 0 0 0 ${pt(to)}`;
  return {
    x0, y0, r,
    top: `M${pt(fromTopRight)}L${pt(back(fromTopRight))}${arc(back({ x: x1 - r, y: y0 }))}L${pt(back({ x: x0 + r, y: y0 }))}${arc(back(ridge))}L${pt(ridge)}Z`,
    side: `M${pt(ridge)}L${pt(back(ridge))}${arc(back({ x: x0, y: y0 + r }))}L${pt(back({ x: x0, y: y1 - r }))}${arc(back(fromBottomLeft))}L${pt(fromBottomLeft)}Z`,
  };
})();

/** The face of a module with its thickness behind it. `mirrored` is for the back view, which is drawn inside a flipped group. */
function Slab({ face, mirrored = false }: { face: string; mirrored?: boolean }) {
  return <>
    <g transform={mirrored ? 'scale(-1 1)' : undefined}><path d={SLAB.side} className={styles.chipSide} /><path d={SLAB.top} className={styles.chipTop} /></g>
    <rect x={SLAB.x0} y={SLAB.y0} width={CHIP.width} height={CHIP.height} rx={SLAB.r} className={face} />
    <path d={`M${SLAB.x0 + SLAB.r} ${SLAB.y0 + 1.3}H${-SLAB.x0 - SLAB.r}`} className={styles.chipSheen} />
  </>;
}

function Chip({ label, slug }: { label: string; slug: string }) {
  const Icon = serviceIcon(slug);
  return <>
    <Slab face={styles.chipBody} />
    <rect x={SLAB.x0 + 4} y="-9" width="18" height="18" rx="4" className={styles.chipTile} />
    <Icon x={SLAB.x0 + 7.5} y={-5.5} width={11} height={11} strokeWidth={2.2} className={styles.chipIcon} aria-hidden="true" />
    <text x="11" y="3.6" textAnchor="middle" className={styles.chipText}>{label}</text>
  </>;
}

/**
 * The module's back, seen while the tool is turned away: the same white enamel as the front,
 * with a recessed service panel, two locating bolts and the contact strip that seats in the dock.
 */
function ChipBack() {
  const panel = { x: SLAB.x0 + 8, y: SLAB.y0 + 5.5, width: CHIP.width - 16, height: CHIP.height - 11 };
  return <>
    <Slab face={styles.chipBody} mirrored />
    <rect {...panel} rx="3" className={styles.chipPanel} />
    <path d={`M${panel.x + 3} ${panel.y + 0.9}H${panel.x + panel.width - 3}`} className={styles.chipPanelShade} />
    {[panel.x + 8, panel.x + panel.width - 8].map((x) => <g key={x} transform={`translate(${x} 0)`}><circle r="2.6" className={styles.chipBackBolt} /><path d="M-1.5 0h3" className={styles.chipBackSlot} /></g>)}
    <rect x="-17" y="-3.4" width="34" height="6.8" rx="1.6" className={styles.chipConnector} />
    {[-12, -6, 0, 6, 12].map((x) => <rect key={x} x={x - 1.4} y="-1.9" width="2.8" height="3.8" rx=".7" className={styles.chipContact} />)}
  </>;
}

/** A cylinder whose axis recedes along DU: silhouette outline, banded body, then whatever sits on its front cap. */
function Cylinder({ r, length, front = { x: 0, y: 0 }, bands = [], body = styles.cylBody, children }: {
  r: number; length: number; front?: Point; bands?: { from: number; to: number; className: string }[]; body?: string; children?: ReactNode;
}) {
  const at = (t: number) => along(front, [DU, length * t]);
  const p = mul(PERP, r);
  const seg = (t0: number, t1: number) => poly([add(at(t0), p), add(at(t1), p), add(at(t1), mul(p, -1)), add(at(t0), mul(p, -1))]);
  const stops = [1, ...bands.flatMap((band) => [band.to, band.from]), 0];
  const pieces = stops.slice(0, -1).map((t0, index) => {
    const t1 = stops[index + 1];
    const band = bands.find((item) => item.to === t0 && item.from === t1);
    return { t0, t1, className: band ? band.className : body };
  });
  return <>
    <g className={styles.cylOutline}><circle cx={round(at(1).x)} cy={round(at(1).y)} r={r} /><path d={seg(1, 0)} /><circle cx={round(front.x)} cy={round(front.y)} r={r} /></g>
    {pieces.map((piece, index) => <g key={index} className={piece.className}><circle cx={round(at(piece.t0).x)} cy={round(at(piece.t0).y)} r={r} /><path d={seg(piece.t0, piece.t1)} /></g>)}
    <g transform={`translate(${round(front.x)} ${round(front.y)})`}>{children}</g>
  </>;
}

const BOLTS = [0, 1, 2, 3, 4, 5].map((index) => ({ c: round(Math.cos(index * Math.PI / 3 + .5)), s: round(Math.sin(index * Math.PI / 3 + .5)) }));

/** White end cap with a black motor hub, bore and bolt circle (as on the reference joints). */
function Cap({ r, hub = 0.5, ring, joint, angle = 0 }: { r: number; hub?: number; ring?: string; joint?: string; angle?: number }) {
  return <>
    <circle r={r} className={styles.cap} />
    <circle r={round(r - 1.8)} className={styles.capChamfer} />
    {ring && <circle r={round(r * .8)} className={ring} strokeWidth={round(r * .13)} />}
    <circle r={round(r * hub)} className={styles.hub} />
    {/* Output flange turns with the driven link */}
    <g data-hub={joint} transform={`rotate(${angle})`}>
      {BOLTS.map(({ c, s }, index) => <circle key={index} cx={round(c * r * hub * .68)} cy={round(s * r * hub * .68)} r={round(Math.max(1, r * .045))} className={styles.hubBolt} />)}
      <path d={`M${round(r * hub * .5)} 0H${round(r * hub * .9)}`} className={styles.hubMark} />
    </g>
    <circle r={round(r * hub * .42)} className={styles.hubBore} />
    <path d={`M${round(-r * .7)} ${round(-r * .5)}A${round(r * .86)} ${round(r * .86)} 0 0 1 ${round(r * .2)} ${round(-r * .84)}`} className={styles.capGloss} />
  </>;
}

/** Shoulder clevis plate (rounded top) extruded along DU, pivot at the origin. */
const PLATE = `M-30 0A30 30 0 0 1 30 0V${PLATE_H}H-30Z`;
function Plate({ at, depth, className }: { at: Point; depth: number; className: string }) {
  const d = mul(DU, depth), p = mul(PERP, 30);
  return <g transform={`translate(${round(at.x)} ${round(at.y)})`}>
    <g className={styles.plateSide}>
      <path d={PLATE} transform={`translate(${round(d.x)} ${round(d.y)})`} />
      <path d={poly([p, add(p, d), add(mul(p, -1), d), mul(p, -1)])} />
      <path d={poly([{ x: -30, y: 0 }, { x: -30, y: PLATE_H }, add({ x: -30, y: PLATE_H }, d), add({ x: -30, y: 0 }, d)])} />
    </g>
    <path d={PLATE} className={className} />
  </g>;
}

/** Articulated pick-and-place arm: carries each service from intake to output, spinning it as it travels. */
export function HeroMechanism({ dockLabel, incomingLabel, dockSlug, incomingSlug, transferId, playing, onCommit, onComplete, previewTime }: MechanismProps) {
  const svg = useRef<SVGSVGElement>(null);
  const run = useRef({ id: null as number | null, time: 0, committed: false, done: true });
  const springs = useRef<Record<'yaw' | 'rho' | 'h', SpringChannel>>({
    yaw: { value: HOME.yaw, velocity: 0 }, rho: { value: HOME.rho, velocity: 0 }, h: { value: HOME.h, velocity: 0 },
  });
  const sway = useRef({ angle: 0, velocity: 0, history: [] as number[] });
  const callbacks = useRef({ onCommit, onComplete });
  useEffect(() => { callbacks.current = { onCommit, onComplete }; });

  useEffect(() => {
    if (transferId === null || transferId === run.current.id) return;
    run.current = { id: transferId, time: 0, committed: false, done: false };
  }, [transferId]);

  useEffect(() => {
    const root = svg.current;
    if (!playing || !root || previewTime !== undefined) return;
    const nodes = (name: string) => [...root.querySelectorAll<SVGGraphicsElement>(`[data-node="${name}"]`)];
    const node = (name: string) => nodes(name)[0];
    const shapes = [...root.querySelectorAll<SVGPathElement>('[data-path]')];

    const draw = (pose: Pose, time: number | null, dt: number) => {
      const g = geometry(pose);
      for (const shape of shapes) shape.setAttribute('d', g.paths[shape.dataset.path ?? ''] ?? '');
      node('elbow')?.setAttribute('transform', `translate(${g.elbow.x} ${g.elbow.y})`);
      root.querySelector('[data-hub="shoulder"]')?.setAttribute('transform', `rotate(${g.hubs.shoulder})`);
      root.querySelector('[data-hub="elbow"]')?.setAttribute('transform', `rotate(${g.hubs.elbow})`);
      node('logo')?.setAttribute('transform', g.logo);
      node('toolShadow')?.setAttribute('cx', String(g.shadow.x));
      node('toolShadow')?.setAttribute('rx', String(g.shadow.rx));
      node('toolShadow')?.setAttribute('opacity', String(g.shadow.opacity));
      nodes('tick').forEach((tick, index) => {
        const mark = g.ticks[index];
        tick.setAttribute('x1', String(mark.x)); tick.setAttribute('x2', String(mark.x));
        tick.setAttribute('y1', String(mark.y)); tick.setAttribute('y2', String(round(mark.y + 5)));
        tick.setAttribute('opacity', String(mark.opacity));
      });

      // Gripper sway: a stiff, lightly damped response to horizontal acceleration.
      const state = sway.current;
      if (time !== null && dt > 0) {
        state.history.push(g.wrist.x);
        if (state.history.length > 3) state.history.shift();
        const [a, b, c] = state.history;
        const acceleration = state.history.length === 3 ? (c - 2 * b + a) / (dt * dt) : 0;
        state.velocity += (-225 * state.angle - 12.6 * state.velocity - acceleration * 0.0042) * dt;
        state.angle = Math.max(-0.07, Math.min(0.07, state.angle + state.velocity * dt));
      } else Object.assign(state, { angle: 0, velocity: 0, history: [] });
      node('gripper')?.setAttribute('transform', `translate(${g.wrist.x} ${g.wrist.y}) rotate(${round(state.angle * 180 / Math.PI)})`);
      node('spin')?.setAttribute('transform', `scale(${g.spinScale} 1)`);
      node('jawLeft')?.setAttribute('transform', `translate(${-g.jaw} 0)`);
      node('jawRight')?.setAttribute('transform', `translate(${g.jaw} 0)`);

      // Modules: the incoming one travels intake → gripper → dock; the previous one ejects.
      const layout = stations(time, g.wrist, pose.grip);
      Object.assign(root.dataset, { state: layout.state, feed: String(layout.feed), emit: String(layout.emit), seated: String(layout.seated) });
      node('freeChip')?.setAttribute('opacity', String(layout.free.opacity));
      node('freeChip')?.setAttribute('transform', `translate(${layout.free.x} ${layout.free.y})`);
      node('heldChip')?.setAttribute('opacity', String(layout.held && g.facing ? 1 : 0));
      node('heldBack')?.setAttribute('opacity', String(layout.held && !g.facing ? 1 : 0));
      node('dockedChip')?.setAttribute('opacity', String(layout.docked.opacity));
      node('dockedChip')?.setAttribute('transform', `translate(${layout.docked.x} ${DOCK.y + 4})`);
      nodes('roller').forEach((roller) => roller.setAttribute('transform', `rotate(${layout.roller})`));
    };

    if (run.current.done) return;
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const current = run.current;
      if (current.done) return;
      const dt = Math.min(1 / 30, Math.max(0, (now - last) / 1000));
      last = now;
      current.time = Math.min(TRANSFER_MS + SETTLE_MS, current.time + dt * 1000);
      const target = plannedPose(current.time);
      const spring = springs.current;
      spring.yaw = springStep(spring.yaw, target.yaw, dt);
      spring.rho = springStep(spring.rho, target.rho, dt);
      spring.h = springStep(spring.h, target.h, dt);
      draw({ yaw: spring.yaw.value, rho: spring.rho.value, h: spring.h.value, grip: target.grip, roll: target.roll }, current.time, dt);
      if (!current.committed && current.time >= T.commit) { current.committed = true; callbacks.current.onCommit(); }
      if (current.time >= TRANSFER_MS + SETTLE_MS) {
        current.done = true;
        draw(HOME, null, 0);
        callbacks.current.onComplete();
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, transferId, previewTime]);

  const pose = previewTime === undefined ? HOME : plannedPose(previewTime);
  const g = geometry(pose);
  const layout = stations(previewTime ?? null, g.wrist, pose.grip);
  const shape = (key: string, className: string) => <path data-path={key} d={g.paths[key]} className={className} />;
  const studs = Array.from({ length: 12 }, (_, index) => {
    const angle = (index / 12) * Math.PI * 2 + .26;
    return { x: round(BASE_X + Math.cos(angle) * 79), y: round(FLOOR_Y - 13 + Math.sin(angle) * 12.5), front: Math.sin(angle) > 0.05 };
  }).filter((stud) => stud.front);
  const shoulder = { x: BASE_X, y: SHOULDER_Y };
  const plateFront = along(shoulder, [DU, -9]);
  return <div className={styles.stage}><svg ref={svg} className={styles.mechanism} viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.width} ${VIEW.height}`}
    data-state={layout.state} data-seated={layout.seated} data-feed={layout.feed} data-emit={layout.emit} data-live={playing && previewTime === undefined}
    aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="lxm-white" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset=".55" stopColor="#f5f7f9" /><stop offset="1" stopColor="#dde3e9" /></linearGradient>
      <linearGradient id="lxm-body" x1=".2" y1="1" x2=".8" y2="0"><stop offset="0" stopColor="#b7c2cd" /><stop offset=".5" stopColor="#f3f6f8" /><stop offset=".75" stopColor="#ffffff" /><stop offset="1" stopColor="#dfe5ea" /></linearGradient>
      <radialGradient id="lxm-cap" cx=".38" cy=".32" r=".8"><stop offset="0" stopColor="#ffffff" /><stop offset=".6" stopColor="#f1f4f7" /><stop offset="1" stopColor="#c7d0d9" /></radialGradient>
      <radialGradient id="lxm-hub" cx=".4" cy=".34" r=".8"><stop offset="0" stopColor="#4a545e" /><stop offset=".55" stopColor="#20262c" /><stop offset="1" stopColor="#0c0f12" /></radialGradient>
      <radialGradient id="lxm-steel" cx=".35" cy=".3" r=".8"><stop offset="0" stopColor="#ffffff" /><stop offset=".5" stopColor="#c9d2da" /><stop offset="1" stopColor="#7c8a97" /></radialGradient>
      <linearGradient id="lxm-steelCyl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#7d8995" /><stop offset=".18" stopColor="#d9e0e6" /><stop offset=".34" stopColor="#9aa6b1" /><stop offset=".55" stopColor="#f6f8fa" /><stop offset=".78" stopColor="#a3aeb8" /><stop offset="1" stopColor="#6d7884" /></linearGradient>
      <linearGradient id="lxm-steelTop" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f2f5f7" /><stop offset=".5" stopColor="#c8d0d8" /><stop offset="1" stopColor="#e6ebef" /></linearGradient>
      <linearGradient id="lxm-darkCyl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#0f1317" /><stop offset=".35" stopColor="#3b444d" /><stop offset=".5" stopColor="#555f69" /><stop offset=".75" stopColor="#252c33" /><stop offset="1" stopColor="#0c0f12" /></linearGradient>
      <linearGradient id="lxm-anod" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a434c" /><stop offset="1" stopColor="#14181c" /></linearGradient>
      <linearGradient id="lxm-chrome" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#6f7b86" /><stop offset=".25" stopColor="#f3f6f8" /><stop offset=".45" stopColor="#97a3ae" /><stop offset=".65" stopColor="#ffffff" /><stop offset=".85" stopColor="#7f8b96" /><stop offset="1" stopColor="#c9d1d8" /></linearGradient>
      <linearGradient id="lxm-blue" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4c9dff" /><stop offset=".5" stopColor="#167dfe" /><stop offset="1" stopColor="#0a56c2" /></linearGradient>
      <radialGradient id="lxm-ao"><stop offset="0" stopColor="#0b1a2a" stopOpacity=".3" /><stop offset=".55" stopColor="#0b1a2a" stopOpacity=".12" /><stop offset="1" stopColor="#0b1a2a" stopOpacity="0" /></radialGradient>
      <linearGradient id="lxm-chip" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#eef3f8" /></linearGradient>
      <radialGradient id="lxm-studio" cx=".5" cy=".62" r=".55"><stop offset="0" stopColor="#167dfe" stopOpacity=".13" /><stop offset=".6" stopColor="#9533fa" stopOpacity=".04" /><stop offset="1" stopColor="#ffffff" stopOpacity="0" /></radialGradient>
      <linearGradient id="lxm-belt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3b4b5b" /><stop offset="1" stopColor="#1f2b37" /></linearGradient>
    </defs>
    {/* Floor, intake conveyor and output dock */}
    {/* Studio light pooled behind the cell, so the white enamel reads against the page */}
    <ellipse cx={BASE_X} cy={FLOOR_Y - 110} rx="190" ry="150" fill="url(#lxm-studio)" />
    {/* Platform: two guide rings around the cell and a slow scan pulse while it runs */}
    <ellipse cx={BASE_X} cy={FLOOR_Y - 7} rx="170" ry="17" className={styles.platformOuter} />
    <ellipse cx={BASE_X} cy={FLOOR_Y - 7} rx="128" ry="13" className={styles.platformInner} />
    <ellipse cx={BASE_X} cy={FLOOR_Y + 1} rx="112" ry="12" className={styles.contactShadow} />
    <path d={`M${VIEW.x + 40} ${FLOOR_Y}H${VIEW.x + VIEW.width - 40}`} className={styles.floor} />
    <ellipse data-node="toolShadow" cx={g.shadow.x} cy={FLOOR_Y + 1} rx={g.shadow.rx} ry="4" opacity={g.shadow.opacity} className={styles.toolShadow} />
    <g>
      <path d={`M${RAIL_START} ${INTAKE.y + 17}H134`} className={styles.signalRail} />
      <path d={`M${RAIL_START} ${INTAKE.y + 17}H134`} className={styles.inputSignal} pathLength={100} />
      <rect x={RAIL_START + 14} y={INTAKE.y + 13} width={122 - RAIL_START} height="9" rx="4.5" className={styles.belt} />
      {ROLLERS.map((x) => <g key={x} transform={`translate(${x} ${INTAKE.y + 17.5})`}><g data-node="roller" transform={`rotate(${layout.roller})`}><circle r="3.4" className={styles.roller} /><path d="M-2.4 0h4.8" className={styles.rollerSpoke} /></g></g>)}
      <path d={`M${INTAKE.x - 62} ${INTAKE.y + 27}v6H${INTAKE.x + 62}v-6`} className={styles.bracket} />
      <text x={INTAKE.x} y={INTAKE.y + 52} textAnchor="middle" className={styles.stationLabel}>INTAKE</text>
    </g>
    <g>
      <path d={`M${DOCK.x + 66} ${DOCK.y + 28}H${RAIL_END}`} className={styles.outputLine} />
      <path d={`M${DOCK.x + 66} ${DOCK.y + 28}H${RAIL_END}`} className={styles.outputSignal} pathLength={100} />
      <path d={`M${DOCK.x - 60} ${DOCK.y + 39}h120v5H${DOCK.x - 60}Z`} className={styles.dockBase} />
      <path d={`M${DOCK.x - 68} ${DOCK.y + 17}h136l-8 22H${DOCK.x - 60}Z`} className={styles.dockBody} />
      <path d={`M${DOCK.x - 68} ${DOCK.y + 17}h136`} className={styles.dockLip} />
      <rect x={DOCK.x - 30} y={DOCK.y + 27} width="60" height="3" rx="1.5" className={styles.dockIndicator} />
      <circle cx={DOCK.x - 33} cy={DOCK.y + 57} r="2.4" className={styles.liveDot} />
      <text x={DOCK.x + 4} y={DOCK.y + 60} textAnchor="middle" className={styles.stationLabel}>IN FOCUS</text>
    </g>

    {/* Base: polished steel flange with studs and a blue ring, steel drum, black turntable */}
    <path d={`M${BASE_X - 90} ${FLOOR_Y - 13}v7a90 15 0 0 0 180 0v-7Z`} className={styles.steelSide} />
    <ellipse cx={BASE_X} cy={FLOOR_Y - 13} rx="90" ry="15" className={styles.steelTop} />
    <ellipse cx={BASE_X} cy={FLOOR_Y - 14} rx="74" ry="12" className={styles.blueRingGlow} />
    <ellipse cx={BASE_X} cy={FLOOR_Y - 14} rx="74" ry="12" className={styles.blueRing} />
    <circle cx={BASE_X + 58} cy={FLOOR_Y - 4} r="2.2" className={styles.statusLed} />
    {studs.map((stud, index) => <g key={index}><rect x={stud.x - 2.6} y={stud.y - 8} width="5.2" height="8" className={styles.stud} /><ellipse cx={stud.x} cy={stud.y - 8} rx="2.6" ry="1.1" className={styles.studTop} /></g>)}
    <path d={`M${DRUM.x - 64} ${DRUM.y}V${FLOOR_Y - 16}a64 11 0 0 0 128 0V${DRUM.y}Z`} className={styles.steelSide} />
    <path d={`M${DRUM.x - 64} ${FLOOR_Y - 22}a64 11 0 0 0 128 0v2.4a64 11 0 0 1 -128 0Z`} className={styles.blueBand} />
    <ellipse cx={DRUM.x} cy={DRUM.y} rx="64" ry="11" className={styles.steelTop} />
    {g.ticks.map((mark, index) => <line key={index} data-node="tick" x1={mark.x} x2={mark.x} y1={mark.y} y2={round(mark.y + 5)} opacity={mark.opacity} className={styles.tick} />)}
    <ellipse cx={BASE_X} cy={DRUM.y + 1} rx="58" ry="11" fill="url(#lxm-ao)" />
    <path d={`M${BASE_X - 46} ${DRUM.y - 12}V${DRUM.y}a46 8 0 0 0 92 0V${DRUM.y - 12}Z`} className={styles.darkSide} />
    <ellipse cx={BASE_X} cy={DRUM.y - 12} rx="46" ry="8" className={styles.darkTop} />
    <circle cx={BASE_X + 30} cy={DRUM.y - 3} r="2.2" className={styles.statusLed} />

    {/* Modules waiting at the stations sit behind the arm */}
    <g data-node="dockedChip" opacity={layout.docked.opacity} transform={`translate(${layout.docked.x} ${DOCK.y + 4})`}><Chip label={dockLabel} slug={dockSlug} /></g>
    <g data-node="freeChip" opacity={layout.free.opacity} transform={`translate(${layout.free.x} ${layout.free.y})`}><Chip label={incomingLabel} slug={incomingSlug} /></g>

    {/* Shoulder: rear clevis plate and motor, harness, upper link, front clevis plate */}
    <Plate at={along(shoulder, [DU, 34])} depth={8} className={styles.plateBack} />
    <Cylinder r={17} length={24} front={along(shoulder, [DU, 6])} body={styles.motorBody}><circle r="11" className={styles.hub} /></Cylinder>
    {shape('conduit', styles.conduit)}{shape('conduit', styles.conduitRib)}
    <path data-path="conduit" d={g.paths.conduit} transform="translate(-1.2 -1.8)" className={styles.conduitShine} />
    {shape('clips', styles.clipEdge)}{shape('clips', styles.clip)}
    {shape('upperSide', styles.linkSide)}{shape('upperTop', styles.linkTop)}{shape('upperFront', styles.linkFront)}
    {shape('upperBevel', styles.linkBevel)}{shape('upperCrease', styles.linkCrease)}
    <g data-node="logo" transform={g.logo}><text x="0" y="3" textAnchor="middle" className={styles.logo}>LEXVAXA</text></g>
    <circle cx={BASE_X} cy={SHOULDER_Y} r="40" fill="url(#lxm-ao)" />
    <Plate at={plateFront} depth={9} className={styles.plateFront} />
    <g transform={`translate(${round(plateFront.x)} ${round(plateFront.y)})`}><Cap r={20} hub={.52} ring={styles.capRing} joint="shoulder" angle={g.hubs.shoulder} /></g>

    {/* Forearm with its motor pack, elbow drum */}
    {shape('foreSide', styles.linkSide)}{shape('foreTop', styles.linkTop)}{shape('foreFront', styles.linkFront)}
    {shape('foreBevel', styles.linkBevel)}{shape('foreCrease', styles.linkCrease)}
    {shape('motorSide', styles.moduleSide)}{shape('motorTop', styles.moduleTop)}{shape('motorFront', styles.moduleFront)}
    <g data-node="elbow" transform={`translate(${g.elbow.x} ${g.elbow.y})`}>
      <circle cx={round(DU.x * 8)} cy={round(DU.y * 8)} r="40" fill="url(#lxm-ao)" />
      <Cylinder r={25} length={30} front={mul(DU, -6)} bands={[{ from: .2, to: .46, className: styles.cylBand }]}><Cap r={25} hub={.5} joint="elbow" angle={g.hubs.elbow} /></Cylinder>
    </g>

    {/* Tool: steel wrist with blue rings and a spinning steel gripper, emerging from the white wrist housing */}
    <g data-node="gripper" transform={`translate(${g.wrist.x} ${g.wrist.y})`}>
      <rect x="-9" y="6" width="18" height="16" className={styles.shaft} />
      <rect x="-9" y="10" width="18" height="2.6" className={styles.shaftRing} /><rect x="-9" y="16" width="18" height="2.6" className={styles.shaftRing} />
      <g data-node="spin" transform={`scale(${g.spinScale} 1)`}>
        <rect x={-JAW_OPEN - 9} y="25" width={JAW_OPEN * 2 + 18} height="6" rx="1.5" className={styles.rail} />
        <rect x={-JAW_OPEN - 13} y="23.5" width="6" height="9" rx="1.2" className={styles.railStop} /><rect x={JAW_OPEN + 7} y="23.5" width="6" height="9" rx="1.2" className={styles.railStop} />
        <path d={`M-27 21h54l${round(DU.x * 7)} ${round(DU.y * 7)}h-54Z`} className={styles.blockTop} />
        <rect x="-27" y="21" width="54" height="14" rx="1.5" className={styles.block} />
        <rect x="-27" y="23" width="6" height="10" rx="1" className={styles.blockSide} /><rect x="21" y="23" width="6" height="10" rx="1" className={styles.blockSideAlt} />
        <rect x="-9" y="25" width="18" height="3.4" rx="1.7" className={styles.blockLight} />
        <g data-node="heldChip" opacity={layout.held && g.facing ? 1 : 0} transform={`translate(0 ${TOOL})`}><Chip label={incomingLabel} slug={incomingSlug} /></g>
        <g data-node="heldBack" opacity={layout.held && !g.facing ? 1 : 0} transform={`translate(0 ${TOOL})`}><ChipBack /></g>
        <g data-node="jawLeft" transform={`translate(${-g.jaw} 0)`}><path d="M-12 22h12v36l-4 5h-8Z" className={styles.jaw} /><rect x="-10" y="27" width="3" height="11" rx="1" className={styles.jawInsert} /><rect x="-3" y="44" width="3" height="14" rx="1" className={styles.jawPad} /></g>
        <g data-node="jawRight" transform={`translate(${g.jaw} 0)`}><path d="M12 22H0v36l4 5h8Z" className={styles.jaw} /><rect x="7" y="27" width="3" height="11" rx="1" className={styles.jawInsert} /><rect x="0" y="44" width="3" height="14" rx="1" className={styles.jawPad} /></g>
      </g>
    </g>
    {shape('wristSide', styles.linkSide)}{shape('wristTop', styles.linkTop)}{shape('wristFront', styles.linkFront)}{shape('wristBevel', styles.linkBevel)}{shape('wristCrease', styles.linkCrease)}{shape('wristFrame', styles.wristFrame)}
  </svg>
    {/* Looping effects live in HTML so the GPU moves them; animating inside the SVG would repaint the whole drawing every frame. */}
    <div className={styles.fx} aria-hidden="true">
      <span className={styles.scan} />
      <span className={styles.livePulse} />
      <span className={styles.packets}>{PACKETS.map((Glyph, index) => <span key={index} className={styles.packet} style={{ animationDelay: `${-index * 1.25}s` }}><Glyph strokeWidth={2.4} /></span>)}</span>
    </div>
  </div>;
}
