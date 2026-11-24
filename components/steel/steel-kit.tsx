/**
 * Steel material kit: brushed steel, chrome, gunmetal, anodized brand metals,
 * glass and soft studio shadows. One light direction (top left) for every object.
 */
export const m = (id: string, name: string) => `url(#${id}-${name})`;

export function SteelDefs({ id }: { id: string }) {
  return <defs>
    {/* Cylindrical brushed steel: read across the object's width */}
    <linearGradient id={`${id}-cyl`} x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#7f8c99" /><stop offset=".1" stopColor="#b9c3cd" /><stop offset=".27" stopColor="#eef2f6" />
      <stop offset=".38" stopColor="#ffffff" /><stop offset=".5" stopColor="#dce3ea" /><stop offset=".68" stopColor="#a7b2bd" />
      <stop offset=".84" stopColor="#c9d1d9" /><stop offset="1" stopColor="#6f7c89" />
    </linearGradient>
    {/* Flat faces */}
    <linearGradient id={`${id}-top`} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#ffffff" /><stop offset=".45" stopColor="#eef2f5" /><stop offset=".7" stopColor="#f8fafb" /><stop offset="1" stopColor="#d6dde4" />
    </linearGradient>
    <linearGradient id={`${id}-left`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#eaeef2" /><stop offset="1" stopColor="#c2cbd4" />
    </linearGradient>
    <linearGradient id={`${id}-right`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#bcc6d0" /><stop offset="1" stopColor="#8d9aa7" />
    </linearGradient>
    {/* Brand anodized metals */}
    <linearGradient id={`${id}-blue`} x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#0a4fb0" /><stop offset=".3" stopColor="#3f94ff" /><stop offset=".42" stopColor="#9cc8ff" /><stop offset=".56" stopColor="#167dfe" /><stop offset="1" stopColor="#0a3f8f" />
    </linearGradient>
    <linearGradient id={`${id}-purple`} x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#5a1aa6" /><stop offset=".3" stopColor="#a15cff" /><stop offset=".42" stopColor="#dcc1ff" /><stop offset=".56" stopColor="#9533fa" /><stop offset="1" stopColor="#4c1590" />
    </linearGradient>
    <radialGradient id={`${id}-shadow`} cx=".5" cy=".5" r=".5">
      <stop offset="0" stopColor="#0d1824" stopOpacity=".28" /><stop offset=".6" stopColor="#0d1824" stopOpacity=".1" /><stop offset="1" stopColor="#0d1824" stopOpacity="0" />
    </radialGradient>
    <radialGradient id={`${id}-glow`} cx=".5" cy=".5" r=".5">
      <stop offset="0" stopColor="#167dfe" stopOpacity=".55" /><stop offset="1" stopColor="#167dfe" stopOpacity="0" />
    </radialGradient>
    <radialGradient id={`${id}-glowPurple`} cx=".5" cy=".5" r=".5">
      <stop offset="0" stopColor="#9533fa" stopOpacity=".5" /><stop offset="1" stopColor="#9533fa" stopOpacity="0" />
    </radialGradient>
    <radialGradient id={`${id}-knob`} cx=".35" cy=".3" r=".75">
      <stop offset="0" stopColor="#ffffff" /><stop offset=".45" stopColor="#c7d0d9" /><stop offset="1" stopColor="#6d7a87" />
    </radialGradient>
    {/* Light acoustic mesh (speaker fabric) */}
    <pattern id={`${id}-grille`} width="5" height="5" patternUnits="userSpaceOnUse">
      <circle cx="2.5" cy="2.5" r="1.05" fill="#b9c7d6" />
    </pattern>
    <pattern id={`${id}-brushed`} width="120" height="3" patternUnits="userSpaceOnUse">
      <path d="M0 1.5h120" stroke="#ffffff" strokeOpacity=".18" strokeWidth=".6" />
    </pattern>
    {/* White enamel housings */}
    <linearGradient id={`${id}-wTop`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset=".6" stopColor="#f6f8fb" /><stop offset="1" stopColor="#e9eef3" /></linearGradient>
    <linearGradient id={`${id}-wLeft`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f8fafc" /><stop offset="1" stopColor="#e1e7ee" /></linearGradient>
    <linearGradient id={`${id}-wRight`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#dae2ea" /><stop offset="1" stopColor="#c0cbd6" /></linearGradient>
    <linearGradient id={`${id}-wCyl`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#d3dce5" /><stop offset=".3" stopColor="#ffffff" /><stop offset=".62" stopColor="#eef2f6" /><stop offset="1" stopColor="#bcc8d3" /></linearGradient>
    {/* Anodised brand blocks */}
    <linearGradient id={`${id}-bTop`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#7ab6ff" /><stop offset="1" stopColor="#3b92ff" /></linearGradient>
    <linearGradient id={`${id}-bLeft`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2d8bff" /><stop offset="1" stopColor="#1571ea" /></linearGradient>
    <linearGradient id={`${id}-bRight`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1263d2" /><stop offset="1" stopColor="#0b4fae" /></linearGradient>
    <linearGradient id={`${id}-pTop`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#c99bff" /><stop offset="1" stopColor="#a35cff" /></linearGradient>
    <linearGradient id={`${id}-pLeft`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9d4dff" /><stop offset="1" stopColor="#8a2ff0" /></linearGradient>
    <linearGradient id={`${id}-pRight`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7422d6" /><stop offset="1" stopColor="#5d17b4" /></linearGradient>
    {/* Frosted glass */}
    <linearGradient id={`${id}-gTop`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#eaf4ff" stopOpacity=".95" /><stop offset="1" stopColor="#cfe4ff" stopOpacity=".8" /></linearGradient>
    <linearGradient id={`${id}-gLeft`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d9eaff" stopOpacity=".85" /><stop offset="1" stopColor="#b8d6ff" stopOpacity=".7" /></linearGradient>
    <linearGradient id={`${id}-gRight`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#b3d1fb" stopOpacity=".85" /><stop offset="1" stopColor="#94bdf5" stopOpacity=".7" /></linearGradient>
    {/* Light display glass */}
    <linearGradient id={`${id}-screen`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#e8f1fd" /></linearGradient>
    {/* Matte clay (studio render look) for the service objects */}
    <linearGradient id={`${id}-clayV`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset=".55" stopColor="#f1f3f6" /><stop offset="1" stopColor="#d3d9e0" /></linearGradient>
    <linearGradient id={`${id}-clayH`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#c9d0d8" /><stop offset=".3" stopColor="#ffffff" /><stop offset=".62" stopColor="#f0f2f5" /><stop offset="1" stopColor="#b7c0ca" /></linearGradient>
    <radialGradient id={`${id}-claySph`} cx=".34" cy=".3" r=".8"><stop offset="0" stopColor="#ffffff" /><stop offset=".55" stopColor="#eef1f4" /><stop offset="1" stopColor="#c1cad4" /></radialGradient>
    <linearGradient id={`${id}-clayDark`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#dfe4ea" /><stop offset="1" stopColor="#c0c8d1" /></linearGradient>
    <linearGradient id={`${id}-tileBlue`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#3b94ff" /><stop offset="1" stopColor="#0c5fd4" /></linearGradient>
    <linearGradient id={`${id}-visor`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2a7df0" /><stop offset="1" stopColor="#0b3f93" /></linearGradient>
    <radialGradient id={`${id}-lens`} cx=".4" cy=".35" r=".75"><stop offset="0" stopColor="#ffffff" stopOpacity=".9" /><stop offset=".6" stopColor="#d7eaff" stopOpacity=".75" /><stop offset="1" stopColor="#a9cffb" stopOpacity=".8" /></radialGradient>
    {/* Robot-matched machine parts: drum bodies and black motor hubs */}
    <linearGradient id={`${id}-drum`} x1=".2" y1="1" x2=".8" y2="0"><stop offset="0" stopColor="#b5c0cc" /><stop offset=".5" stopColor="#f2f5f8" /><stop offset=".75" stopColor="#ffffff" /><stop offset="1" stopColor="#dde3e9" /></linearGradient>
    <radialGradient id={`${id}-hub`} cx=".4" cy=".34" r=".8"><stop offset="0" stopColor="#4a545e" /><stop offset=".55" stopColor="#1f252b" /><stop offset="1" stopColor="#0b0e11" /></radialGradient>
  </defs>;
}

/** Soft contact shadow on the floor. */
export const Shadow = ({ id, cx, cy, rx, ry }: { id: string; cx: number; cy: number; rx: number; ry: number }) =>
  <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={m(id, 'shadow')} />;

/** Chamfered isometric slab: top, front-left, front-right and bright bevel lines. */
export function Slab({ id, x, y, w, d, h, accent = 'blue' }: { id: string; x: number; y: number; w: number; d: number; h: number; accent?: 'blue' | 'purple' | 'none' }) {
  // (x, y) = back corner of the top face; w along the right axis, d along the left axis (2:1 isometric).
  const r = { x: x + w, y: y + w / 2 }, f = { x: x + w - d, y: y + (w + d) / 2 }, l = { x: x - d, y: y + d / 2 };
  return <g>
    <path d={`M${l.x} ${l.y}L${f.x} ${f.y}L${f.x} ${f.y + h}L${l.x} ${l.y + h}Z`} fill={m(id, 'left')} stroke="#a9b5c1" strokeWidth=".8" />
    <path d={`M${f.x} ${f.y}L${r.x} ${r.y}L${r.x} ${r.y + h}L${f.x} ${f.y + h}Z`} fill={m(id, 'right')} stroke="#8796a5" strokeWidth=".8" />
    <path d={`M${x} ${y}L${r.x} ${r.y}L${f.x} ${f.y}L${l.x} ${l.y}Z`} fill={m(id, 'top')} stroke="#b8c3ce" strokeWidth=".8" />
    <path d={`M${x} ${y}L${r.x} ${r.y}L${f.x} ${f.y}L${l.x} ${l.y}Z`} fill={m(id, 'brushed')} />
    <path d={`M${l.x + 2} ${l.y + 1}L${f.x} ${f.y + 1}L${r.x - 2} ${r.y + 1}`} fill="none" stroke="#ffffff" strokeWidth="1.4" strokeOpacity=".9" />
    {accent !== 'none' && <path d={`M${l.x + d * .18} ${l.y + h * .55 + d * .09}L${f.x - d * .05} ${f.y + h * .55 - d * .025}`} stroke={accent === 'blue' ? '#167dfe' : '#9533fa'} strokeWidth="2.4" strokeLinecap="round" />}
  </g>;
}

/** Hex-head bolt with a specular dot. */
export const Bolt = ({ id, x, y, r = 3.4 }: { id: string; x: number; y: number; r?: number }) =>
  <g transform={`translate(${x} ${y})`}><circle r={r} fill={m(id, 'knob')} stroke="#5f6c79" strokeWidth=".6" /><circle cx={-r * .35} cy={-r * .35} r={r * .28} fill="#fff" opacity=".8" /></g>;
