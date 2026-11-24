/**
 * Kinematics for the hero's pick-and-place arm.
 *
 * The arm is modelled as a real articulated robot rather than rotated artwork:
 * base yaw (J1), shoulder and elbow pitch (J2/J3) solved in the arm's own plane,
 * a wrist that keeps the tool vertical (J5) and a tool roll (J6) that keeps the
 * carried module facing the viewer. The planar solution is projected with a
 * slight top-down camera, so swinging through the front foreshortens the links.
 */

/** Visible window onto the work cell (the rails continue past both edges). */
export const VIEW = { x: 22, y: 136, width: 396, height: 292 } as const;
export const BASE_X = 220;
export const SHOULDER_Y = 300;
export const FLOOR_Y = 420;
export const UPPER = 132;
export const FOREARM = 122;
/** Camera tilt: how far a point moves down per pixel it is closer to the viewer. */
export const DEPTH = 0.22;
/** Wrist pivot → centre of the gripped module. */
export const TOOL = 44;
export const CHIP = { width: 112, height: 26 } as const;
export const INTAKE = { x: 78, y: 317 } as const;
export const DOCK = { x: 362, y: 317 } as const;

/** roll: tool spin in turns (0 = module faces the viewer). */
export type Pose = { yaw: number; rho: number; h: number; grip: number; roll: number };
export type Point = { x: number; y: number };

const reach = BASE_X - INTAKE.x;
const pickH = SHOULDER_Y - (INTAKE.y - TOOL);
const clearance = 62;

/** Ready pose: reaching forward over the output side, tool clear of the dock. */
export const HOME: Pose = { yaw: 40, rho: 96, h: 118, grip: 0, roll: 0 };
const abovePick: Pose = { yaw: 180, rho: reach, h: pickH + clearance, grip: 0, roll: 0 };
const pick: Pose = { ...abovePick, h: pickH };
const abovePickHeld: Pose = { ...abovePick, grip: 1 };
const pickHeld: Pose = { ...pick, grip: 1 };
/** The tool makes one full turn while it carries the module across. */
const aboveDropHeld: Pose = { yaw: 0, rho: reach, h: pickH + clearance, grip: 1, roll: 1 };
const dropHeld: Pose = { ...aboveDropHeld, h: pickH };
const drop: Pose = { ...dropHeld, grip: 0 };
const aboveDrop: Pose = { ...aboveDropHeld, grip: 0 };

/**
 * Transfer timeline in milliseconds. Release commits the service.
 * Calm and readable: minimum-jerk moves keep every joint smooth, the arm visibly lifts and carries
 * each module (pick-and-place 3.9 s), and a visitor still sees two services change in about eight seconds.
 */
export const T = {
  arrive: 560, eject: 420, reach: 950, descend: 1240, grip: 1390, lift: 1700,
  traverse: 2520, lower: 2780, release: 2900, commit: 2860, raise: 3180, home: 3920,
} as const;
export const TRANSFER_MS = T.home;

type Segment = { from: Pose; to: Pose; start: number; end: number; arc?: number };
const segments: Segment[] = [
  { from: HOME, to: abovePick, start: 0, end: T.reach },
  { from: abovePick, to: pick, start: T.reach, end: T.descend },
  { from: pick, to: pickHeld, start: T.descend + 40, end: T.grip },
  { from: pickHeld, to: abovePickHeld, start: T.grip + 60, end: T.lift },
  { from: abovePickHeld, to: aboveDropHeld, start: T.lift, end: T.traverse, arc: 18 },
  { from: aboveDropHeld, to: dropHeld, start: T.traverse, end: T.lower },
  { from: dropHeld, to: drop, start: T.lower + 40, end: T.release },
  { from: drop, to: aboveDrop, start: T.release + 30, end: T.raise },
  // Returning empty, the tool spins back the other way to its rest orientation.
  { from: aboveDrop, to: HOME, start: T.raise, end: T.home },
];

/** Minimum-jerk profile: zero velocity and acceleration at both ends. */
export const minimumJerk = (t: number) => {
  const x = Math.min(1, Math.max(0, t));
  return x * x * x * (10 - 15 * x + 6 * x * x);
};
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** The commanded pose at a point in the transfer. */
export function plannedPose(time: number): Pose {
  if (time <= 0) return HOME;
  for (let index = segments.length - 1; index >= 0; index -= 1) {
    const segment = segments[index];
    if (time < segment.start) continue;
    const t = minimumJerk((time - segment.start) / (segment.end - segment.start));
    return {
      yaw: mix(segment.from.yaw, segment.to.yaw, t),
      rho: mix(segment.from.rho, segment.to.rho, t),
      h: mix(segment.from.h, segment.to.h, t) + (segment.arc ? Math.sin(Math.PI * t) * segment.arc : 0),
      grip: mix(segment.from.grip, segment.to.grip, t),
      roll: mix(segment.from.roll, segment.to.roll, t),
    };
  }
  return HOME;
}

/** Elbow-up planar IK. Angles in radians, measured from horizontal (up positive). */
export function solveArm(rho: number, h: number) {
  const distance = Math.min(UPPER + FOREARM - 1, Math.max(Math.abs(UPPER - FOREARM) + 1, Math.hypot(rho, h)));
  const cosine = (distance ** 2 - UPPER ** 2 - FOREARM ** 2) / (2 * UPPER * FOREARM);
  const bend = Math.acos(Math.min(1, Math.max(-1, cosine)));
  const shoulder = Math.atan2(h, rho) + Math.atan2(FOREARM * Math.sin(bend), UPPER + FOREARM * Math.cos(bend));
  const elbow = { rho: UPPER * Math.cos(shoulder), h: UPPER * Math.sin(shoulder) };
  return { shoulder, bend, elbow };
}

/** Arm-plane point (horizontal distance, height above shoulder) → screen. */
export function project(rho: number, h: number, yawDegrees: number): Point {
  const yaw = yawDegrees * Math.PI / 180;
  return { x: BASE_X + rho * Math.cos(yaw), y: SHOULDER_Y - h + rho * Math.sin(yaw) * DEPTH };
}

/** Screen positions of every joint for a pose. */
export function armPoints(pose: Pose) {
  const { elbow, shoulder, bend } = solveArm(pose.rho, pose.h);
  return {
    shoulder: { x: BASE_X, y: SHOULDER_Y },
    elbow: project(elbow.rho, elbow.h, pose.yaw),
    wrist: project(pose.rho, pose.h, pose.yaw),
    /** Joint discs face the viewer when the arm plane is parallel to the screen. */
    discScale: Math.max(0.2, Math.abs(Math.cos(pose.yaw * Math.PI / 180))),
    shoulderAngle: shoulder,
    elbowAngle: bend,
  };
}

/**
 * Servo lag: the rendered joint follows the command through a slightly
 * underdamped spring, so stops carry a little inertia instead of freezing.
 */
export type SpringChannel = { value: number; velocity: number };
export function springStep(channel: SpringChannel, target: number, dt: number, omega = 26, zeta = 0.74): SpringChannel {
  const acceleration = omega * omega * (target - channel.value) - 2 * zeta * omega * channel.velocity;
  const velocity = channel.velocity + acceleration * dt;
  return { value: channel.value + velocity * dt, velocity };
}

/** Where the incoming module is during a transfer (null while the gripper holds it). */
export function chipPosition(time: number, wrist: Point): Point & { held: boolean; seated: number; entering?: number } {
  if (time < T.arrive) {
    const t = 1 - (1 - Math.min(1, time / T.arrive)) ** 3;
    return { x: mix(-10, INTAKE.x, t), y: INTAKE.y, held: false, seated: 0, entering: 1 - t };
  }
  if (time < T.grip - 40) return { ...INTAKE, held: false, seated: 0 };
  if (time < T.release - 50) return { x: wrist.x, y: wrist.y + TOOL, held: true, seated: 0 };
  const seat = minimumJerk((time - (T.release - 50)) / 260);
  return { x: DOCK.x, y: DOCK.y + seat * 4, held: false, seated: seat };
}

export const round = (value: number) => Math.round(value * 100) / 100;
