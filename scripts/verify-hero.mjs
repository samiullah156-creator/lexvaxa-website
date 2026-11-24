/* Hero kinematics, service-system data and component/clock contracts. Retained
 * SystemDiagram assets are checked separately from the mounted SteelScene.
 * Hook doubles do not constitute browser QA. */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { gzipSync } from 'node:zlib';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { createElement, Fragment } from 'react';
import * as nativeReact from 'react';
import * as nativeJsx from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';

const root = path.resolve(import.meta.dirname, '..');
let checks = 0;
const pass = (label) => { checks++; console.log('PASS: ' + label); };
// Motion behavior has its own suite. Preserve only the wrapper's native
// semantics here; the source import audit below still reads its real module.
function AnimatedContainerStub({ as = 'div', ...props }, key) {
  for (const name of ['trigger', 'entrance', 'distance', 'delay', 'stiffness', 'damping', 'hoverScale', 'tapScale', 'once', 'amount', 'layout']) delete props[name];
  return { type: as, props, key };
}
const element = (type, props, key) => type === AnimatedContainerStub ? AnimatedContainerStub(props, key) : ({ type, props, key });
const nodes = (tree) => !tree || typeof tree !== 'object' ? [] : Array.isArray(tree) ? tree.flatMap(nodes) : [tree, ...nodes(tree.props?.children)];
const text = (tree) => tree == null || typeof tree === 'boolean' ? '' : Array.isArray(tree) ? tree.map(text).join('') : typeof tree === 'object' ? text(tree.props?.children) : String(tree);
const accessibleText = (tree) => tree == null || typeof tree === 'boolean' ? '' : Array.isArray(tree) ? tree.map(accessibleText).join('') : typeof tree === 'object' ? [true, 'true'].includes(tree.props?.['aria-hidden']) ? '' : accessibleText(tree.props?.children) : String(tree);
const renderStatic = (tree) => tree == null || typeof tree !== 'object' ? tree : Array.isArray(tree) ? tree.map(renderStatic) : typeof tree.type === 'function' ? renderStatic(tree.type(tree.props)) : { ...tree, props: { ...tree.props, children: renderStatic(tree.props?.children) } };
function nativeVector(tree, position = 'root') {
  if (tree == null || typeof tree === 'boolean') return null;
  if (Array.isArray(tree)) return tree.map((child, index) => nativeVector(child, position + '.' + index));
  if (typeof tree !== 'object') return tree;
  return createElement(tree.type === 'fragment' ? Fragment : tree.type,
    { ...tree.props, key: tree.key ?? position }, nativeVector(tree.props?.children, position + '.children'));
}

function events() {
  const listeners = new Map();
  return {
    addEventListener(type, callback) { if (!listeners.has(type)) listeners.set(type, new Set()); listeners.get(type).add(callback); },
    removeEventListener(type, callback) { listeners.get(type)?.delete(callback); },
    dispatch(type) { for (const callback of [...(listeners.get(type) ?? [])]) callback(); },
    count(type) { return listeners.get(type)?.size ?? 0; },
  };
}

const media = { matches: false, ...events() };
const pointerMedia = { matches: true, ...events() };
const fontCallbacks = [];
const document = { hidden: false, fonts: { ready: { then(callback) { fontCallbacks.push(callback); } } }, ...events() };
const timers = new Map(), observers = new Set(), resizeObservers = new Set();
const rectangle = (left, top, width, height) => ({ left, top, width, height, right: left + width, bottom: top + height });
const rectangles = new Map([
  ['inner', rectangle(100, 200, 1320, 760)],
  ['transferStage', rectangle(100, 212, 1320, 600)],
  ['baseAnchor', rectangle(740, 700, 40, 20)],
  ['serviceToken', rectangle(240, 469, 160, 32)],
  ['deliveryToken', rectangle(1110, 484, 160, 32)],
  ['compactSource', rectangle(410, 460, 148, 32)],
  ['compactDestination', rectangle(740, 484, 148, 32)],
]);
let timerId = 0;
let clockNow = 0;
class ClockDate extends Date { static now() { return clockNow; } }
const storage = new Map(); let storageBlocked = false, focusedHost;
class IntersectionObserver {
  constructor(callback, options) { this.callback = callback; this.options = options; this.targets = new Set(); this.disconnected = false; observers.add(this); }
  observe(target) { this.targets.add(target); }
  disconnect() { this.disconnected = true; this.targets.clear(); observers.delete(this); }
}
class ResizeObserver {
  constructor(callback) { this.callback = callback; this.targets = new Set(); this.disconnected = false; resizeObservers.add(this); }
  observe(target) { this.targets.add(target); }
  disconnect() { this.disconnected = true; this.targets.clear(); resizeObservers.delete(this); }
}
const window = {
  innerWidth: 1440, ...events(),
  matchMedia(query) {
    if (query === '(prefers-reduced-motion: reduce)') return media;
    assert.equal(query, '(hover: hover) and (pointer: fine)'); return pointerMedia;
  },
  setTimeout(callback, delay) { const id = ++timerId; timers.set(id, { callback, delay, dueAt: clockNow + delay }); return id; },
  clearTimeout(id) { timers.delete(id); },
  sessionStorage: {
    getItem(key) { if (storageBlocked) throw new Error('Storage unavailable'); return storage.get(key) ?? null; },
    setItem(key, value) { if (storageBlocked) throw new Error('Storage unavailable'); storage.set(key, value); },
  },
};
const context = vm.createContext({ console, document, window, IntersectionObserver, ResizeObserver, Date: ClockDate, URL, process: { env: {} } });
let currentHarness;
const react = {
  Children: { toArray: (children) => [children].flat(Infinity).filter((child) => child != null && typeof child !== 'boolean') },
  useState: (...args) => currentHarness.useState(...args),
  useRef: (...args) => currentHarness.useRef(...args),
  useEffect: (...args) => currentHarness.useEffect(...args),
  useCallback: (callback) => callback,
  useId: () => currentHarness.useId(),
};
const modules = new Map();
function resolveModule(from, name) {
  const base = name.startsWith('@/') ? name.slice(2) : path.join(path.dirname(from), name);
  return [base, base + '.ts', base + '.tsx', path.join(base, 'index.ts')].find((file) => fs.existsSync(path.join(root, file)) && fs.statSync(path.join(root, file)).isFile());
}
function load(file) {
  file = path.normalize(file); if (modules.has(file)) return modules.get(file);
  const exports = {}; modules.set(file, exports);
  const require = (name) => {
    if (name === 'react') return react;
    if (name === 'react/jsx-runtime') return { jsx: element, jsxs: element, Fragment: 'fragment' };
    if (name === 'next/link') return { default: 'a' };
    if (name === 'next/image') return { default: 'img' };
    // Every icon is a plain 'svg' here; the factory for Lexvaxa's own pictograms returns the same.
    if (name === 'lucide-react') return new Proxy({}, { get: (_target, key) => (key === 'createLucideIcon' ? () => 'svg' : 'svg') });
    if (name.endsWith('.css')) return { default: new Proxy({}, { get: (_, key) => String(key) }) };
    const dependency = resolveModule(file, name);
    assert.ok(dependency, 'Unexpected component dependency: ' + name);
    if (path.normalize(dependency) === path.normalize('components/animations/animated-container.tsx')) return { AnimatedContainer: AnimatedContainerStub };
    // The CMS image wrapper is next/image with a Cloudinary loader: a plain 'img' here, like next/image itself.
    if (path.normalize(dependency) === path.normalize('components/content/cdn-image.tsx')) return { CdnImage: 'img' };
    return load(dependency);
  };
  const { outputText } = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), { fileName: file,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX } });
  new vm.Script('(function(require,exports){' + outputText + '\n})', { filename: file }).runInContext(context)(require, exports);
  return exports;
}

// Render mounted SVG components with React's real SSR dispatcher, including
// nested useId calls. This is still static markup QA, not a browser driver.
const nativeSvgModules = new Map();
function loadNativeSvg(file) {
  file = path.normalize(file); if (nativeSvgModules.has(file)) return nativeSvgModules.get(file);
  const exports = {}; nativeSvgModules.set(file, exports);
  const require = (name) => {
    if (name === 'react') return nativeReact;
    if (name === 'react/jsx-runtime') return nativeJsx;
    if (name.endsWith('.css')) return { default: new Proxy({}, { get: (_, key) => String(key) }) };
    const dependency = resolveModule(file, name);
    assert.ok(dependency, 'Unexpected native SVG dependency: ' + name);
    return loadNativeSvg(dependency);
  };
  const { outputText } = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), { fileName: file,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX } });
  new vm.Script('(function(require,exports){' + outputText + '\n})', { filename: file }).runInContext(context)(require, exports);
  return exports;
}
function svgMarkupTree(markup) {
  const stack = [], roots = [];
  for (const token of markup.match(/<!--[^]*?-->|<\/?[a-zA-Z][\w:-]*\b[^>]*>|[^<]+/g) ?? []) {
    if (token.startsWith('<!--')) continue;
    if (token.startsWith('</')) { assert.ok(stack.length, 'Unexpected SVG closing tag'); stack.pop(); continue; }
    if (!token.startsWith('<')) { if (stack.length) stack.at(-1).props.children.push(token); continue; }
    const type = token.match(/^<([\w:-]+)/)?.[1]; assert.ok(type);
    const props = Object.fromEntries([...token.matchAll(/([\w:-]+)="([^"]*)"/g)].map((match) => [match[1] === 'class' ? 'className' : match[1], match[2]]));
    if (props.style) props.style = Object.fromEntries(props.style.split(';').filter(Boolean).map((entry) => {
      const separator = entry.indexOf(':'), name = entry.slice(0, separator), value = entry.slice(separator + 1);
      return [name, name === '--n' ? Number(value) : value];
    }));
    for (const name of ['data-on', 'data-ghost', 'data-running', 'data-assemble']) if (name in props) props[name] = props[name] === 'true';
    const node = { type, props: { ...props, children: [] } };
    if (stack.length) stack.at(-1).props.children.push(node); else roots.push(node);
    if (!token.endsWith('/>')) stack.push(node);
  }
  assert.equal(stack.length, 0, 'SVG markup must have balanced element boundaries');
  assert.equal(roots.length, 1, 'Expected one native SVG root'); return roots[0];
}

let harnessSerial = 0;
/** Render state changes, then commit dependency-aware effect setup/cleanup after refs. */
function hookHarness(Component, props) {
  const hooks = [], hosts = new Map();
  const identity = ++harnessSerial;
  let cursor = 0, dirty = true, pending = [], tree, serverTree, mounted = true;
  const harness = {
    useState(initial) {
      const i = cursor++;
      if (!hooks[i]) hooks[i] = { value: typeof initial === 'function' ? initial() : initial };
      return [hooks[i].value, (next) => {
        assert.ok(mounted, 'State update after unmount');
        const value = typeof next === 'function' ? next(hooks[i].value) : next;
        if (!Object.is(value, hooks[i].value)) { hooks[i].value = value; dirty = true; }
      }];
    },
    useRef(initial) { const i = cursor++; return (hooks[i] ??= { ref: { current: initial } }).ref; },
    useId() { const i = cursor++; return (hooks[i] ??= { value: ':fixture-' + identity + '-' + i + ':' }).value; },
    useEffect(create, dependencies) {
      const i = cursor++, previous = hooks[i];
      if (!previous || !dependencies || !previous.dependencies || dependencies.length !== previous.dependencies.length || dependencies.some((item, index) => !Object.is(item, previous.dependencies[index]))) {
        pending.push({ i, create, dependencies });
      }
    },
    flush() {
      let renders = 0;
      while (dirty) {
        assert.ok(++renders < 30, 'Hook render loop did not settle');
        dirty = false; cursor = 0; pending = []; currentHarness = harness;
        try { tree = Component(props); } finally { currentHarness = undefined; }
        serverTree ??= tree;
        for (const node of nodes(tree)) if (node.props?.ref && typeof node.type === 'string') {
          const key = node.props.id ?? node.props.className ?? node.type;
          if (!hosts.has(key)) hosts.set(key, { id: node.props.id, rectReads: 0,
            contains(target) { return target === this || target?.owner === this; },
            focus() { focusedHost = this; },
            getBoundingClientRect() { this.rectReads++; return { ...(rectangles.get(key) ?? rectangle(0, 0, 0, 0)) }; },
          });
          const host = hosts.get(key);
          if (node.props.className === 'projectTrack' && !host.scrollTo) {
            Object.assign(host, events(), {
              clientWidth: 720, scrollWidth: 2520, scrollLeft: 0, scrollCalls: [],
              children: [node.props.children].flat().filter(Boolean).map((_, index) => ({ offsetLeft: 40 + index * 360, offsetWidth: 336 })),
              imageDoubles: [],
            });
            host.querySelectorAll = (selector) => { assert.equal(selector, 'img'); return host.imageDoubles; };
            host.firstElementChild = host.children[0];
            host.scrollTo = (options) => { host.scrollCalls.push(options); host.scrollLeft = options.left; host.dispatch('scroll'); };
          }
          if (typeof node.props.ref === 'function') node.props.ref(host);
          else node.props.ref.current ??= host;
        }
        for (const effect of pending) {
          hooks[effect.i]?.cleanup?.();
          hooks[effect.i] = { dependencies: effect.dependencies ? [...effect.dependencies] : undefined, cleanup: effect.create() };
        }
      }
      return tree;
    },
    get tree() { return tree; },
    get serverTree() { return serverTree; },
    host(key) { return hosts.get(key); },
    unmount() { for (const hook of hooks) hook?.cleanup?.(); mounted = false; },
  };
  harness.flush(); return harness;
}
const kinematics = load('lib/hero-kinematics.ts');
const systems = load('lib/data/service-systems.ts');
const { services } = load('lib/data/services.ts');
const { LiveScene } = load('components/depth/live-scene.tsx');
const { SteelScene, STEEL_SCENES } = load('components/steel/steel-scene.tsx');
const { SteelScene: NativeSteelScene } = loadNativeSvg('components/steel/steel-scene.tsx');
const steelTree = (props) => svgMarkupTree(renderToStaticMarkup(createElement(NativeSteelScene, props)));
const { ICONED_MODULES } = load('components/depth/service-icons.tsx');
const { SERVICE_VISUALS } = load('lib/data/service-visuals.ts');
const { HeroSection } = load('components/sections/hero.tsx');
const { HeroShowcase, HERO_DWELL_MS } = load('components/sections/hero-showcase.tsx');
const { HeroMechanism } = load('components/sections/hero-mechanism.tsx');
const { HeroPhrase } = load('components/sections/hero-phrase.tsx');
const { SERVICE_SYSTEMS, HERO_ORDER, COMPLETE_STATE, EMPTY_STATE, storyState, maxStage } = systems;
const { T, TRANSFER_MS, UPPER, FOREARM, TOOL, INTAKE, DOCK, HOME, plannedPose, solveArm, project, minimumJerk, springStep, chipPosition, armPoints } = kinematics;

// Shared timer/listener helpers (also used by the explorer and project suites below).
function timerCount(expected, delay) {
  assert.equal(timers.size, expected, 'Unexpected number of timers');
  if (delay !== undefined) for (const timer of timers.values()) assert.equal(timer.delay, delay);
}
function fireTimer(harness, delay) {
  timerCount(1, delay); const [id, timer] = timers.entries().next().value;
  clockNow = timer.dueAt; timers.delete(id); timer.callback(); harness.flush();
}
function clean(harness) {
  harness.unmount(); timerCount(0); assert.equal(observers.size, 0); assert.equal(resizeObservers.size, 0);
  assert.equal(media.count('change'), 0); assert.equal(document.count('visibilitychange'), 0); assert.equal(window.count('resize'), 0);
  assert.equal(pointerMedia.count('change'), 0);
}
const control = (label, harness) => nodes(harness.tree).find((node) => node.type === 'button' && node.props['aria-label'] === label);
const byClass = (harness, name) => nodes(harness.tree).find((node) => node.props?.className === name);
const click = (button, harness) => { assert.ok(button && !button.props.disabled, 'Control unavailable'); button.props.onClick(); harness.flush(); };
function hidden(value, harness) { document.hidden = value; document.dispatch('visibilitychange'); harness.flush(); }
function motion(value, harness) { media.matches = value; media.dispatch('change'); harness.flush(); }

/* ---------- Kinematics: a physically consistent arm ---------- */
assert.equal(minimumJerk(0), 0); assert.equal(minimumJerk(1), 1); assert.ok(Math.abs(minimumJerk(0.5) - 0.5) < 1e-9);
assert.ok(minimumJerk(0.01) < 0.0001 && 1 - minimumJerk(0.99) < 0.0001, 'Motion profiles must start and stop without a velocity step');
let previous = plannedPose(0), maxYawRate = 0, maxReachRate = 0;
for (let time = 0; time <= TRANSFER_MS; time += 5) {
  const pose = plannedPose(time);
  const distance = Math.hypot(pose.rho, pose.h);
  assert.ok(distance < UPPER + FOREARM - 1 && distance > Math.abs(UPPER - FOREARM) + 1, 'Every commanded pose must be reachable without clamping at ' + time + 'ms');
  const { elbow } = solveArm(pose.rho, pose.h);
  assert.ok(elbow.rho * pose.h - elbow.h * pose.rho < 0, 'The arm must stay in one elbow-up configuration at ' + time + 'ms');
  assert.ok(Math.abs(Math.hypot(elbow.rho, elbow.h) - UPPER) < 1e-6 && Math.abs(Math.hypot(pose.rho - elbow.rho, pose.h - elbow.h) - FOREARM) < 1e-6, 'Links are rigid');
  maxYawRate = Math.max(maxYawRate, Math.abs(pose.yaw - previous.yaw) / 0.005);
  maxReachRate = Math.max(maxReachRate, Math.hypot(pose.rho - previous.rho, pose.h - previous.h) / 0.005);
  previous = pose;
}
assert.ok(maxYawRate < 540, 'Base yaw speed stays plausible: ' + maxYawRate.toFixed(0) + '°/s');
assert.ok(maxReachRate < 680, 'Reach speed stays plausible: ' + maxReachRate.toFixed(0) + 'px/s');
const tool = (time) => { const pose = plannedPose(time); const wrist = project(pose.rho, pose.h, pose.yaw); return { x: wrist.x, y: wrist.y + TOOL, grip: pose.grip }; };
const near = (a, b, tolerance = 0.5) => Math.abs(a.x - b.x) <= tolerance && Math.abs(a.y - b.y) <= tolerance;
assert.ok(near(tool(T.descend + 20), INTAKE), 'The gripper closes on the module at the intake');
assert.ok(near(tool(T.lower + 20), DOCK), 'The gripper releases the module at the dock');
for (let time = T.grip; time <= T.lower; time += 10) assert.ok(tool(time).grip > 0.99, 'Jaws stay closed while carrying');
assert.ok(tool(T.descend).grip < 0.01 && tool(T.raise).grip < 0.01, 'Jaws are open before pickup and after release');
assert.ok(T.lower < T.commit && T.commit < T.release, 'The service commits after the module reaches the dock and before the jaws finish opening');
for (let time = T.lift; time < T.traverse; time += 10) assert.ok(plannedPose(time + 10).yaw <= plannedPose(time).yaw + 1e-9, 'The traverse rotates one way, intake to output');
const handover = chipPosition(T.grip - 40, project(plannedPose(T.grip - 40).rho, plannedPose(T.grip - 40).h, plannedPose(T.grip - 40).yaw));
assert.ok(handover.held && near(handover, INTAKE, 1), 'The module does not jump when the gripper takes it');
const seated = chipPosition(T.release + 400, { x: 0, y: 0 });
assert.equal(seated.x, DOCK.x); assert.ok(seated.seated > 0.99, 'Released modules seat in the dock');
let channel = { value: 0, velocity: 0 }, peak = 0;
for (let step = 0; step < 120; step++) { channel = springStep(channel, 1, 1 / 120); peak = Math.max(peak, channel.value); }
assert.ok(Math.abs(channel.value - 1) < 0.002 && peak < 1.06, 'Servo spring settles within one second with under 6% overshoot');
assert.deepEqual(plannedPose(0), HOME); assert.deepEqual(plannedPose(TRANSFER_MS), HOME);
const rest = armPoints(HOME);
assert.ok(rest.discScale > 0.2 && rest.discScale <= 1, 'Joint discs foreshorten with base yaw');
pass('arm kinematics: reachable elbow-up poses with rigid links, minimum-jerk profiles, plausible joint speeds, exact intake/dock contact and a settling servo spring');

/* ---------- Service systems: one source of truth per service ---------- */
const slugs = services.map((service) => service.slug);
assert.deepEqual(Object.keys(SERVICE_SYSTEMS).sort(), [...slugs].sort(), 'Every service has exactly one system description');
assert.deepEqual([...HERO_ORDER].sort(), [...slugs].sort(), 'The hero shows every service once');
const all = Object.values(SERVICE_SYSTEMS);
assert.equal(new Set(all.map((system) => system.phrase)).size, 9); assert.equal(new Set(all.map((system) => system.token)).size, 9);
for (const system of all) {
  assert.ok(system.phrase.length <= 14, 'Hero phrase must fit one line: ' + system.phrase);
  assert.ok(system.summary.length >= 40 && system.summary.length <= 140, 'Concise summary: ' + system.slug);
  assert.equal(system.chain.length, 4); assert.equal(new Set(system.chain).size, 4);
  assert.ok(system.nodes.length >= 5 && system.nodes.length <= 7);
  const ids = new Set(system.nodes.map((node) => node.id)); assert.equal(ids.size, system.nodes.length);
  for (const node of system.nodes) {
    assert.ok(node.x >= 0 && node.x <= 6.6 && node.y >= 0 && node.y <= 2.6, 'Module stays on the plate: ' + node.id);
    assert.ok(node.label.length <= 22, 'Short module label: ' + node.label);
    assert.ok(node.kind !== 'panel' || node.screen, 'Panels declare their screen content');
  }
  for (const [index, a] of system.nodes.entries()) for (const b of system.nodes.slice(index + 1)) assert.ok(Math.hypot(a.x - b.x, a.y - b.y) > 1.2, 'Modules must not overlap: ' + a.id + '/' + b.id);
  const linked = new Set();
  for (const link of system.links) { assert.ok(ids.has(link.from) && ids.has(link.to), 'Link endpoints exist'); linked.add(link.from); linked.add(link.to); }
  assert.equal(linked.size, ids.size, 'Every module is connected: ' + system.slug);
  assert.ok(system.story.length >= 6 && system.story.length <= 9, 'Story length adapts per service');
  assert.equal(new Set(system.story.map((step) => step.title)).size, system.story.length);
  let before = EMPTY_STATE;
  system.story.forEach((step, index) => {
    const state = storyState(system, index);
    assert.ok(state.built >= before.built && state.linked >= before.linked, 'Assembly never goes backwards');
    for (const id of state.focus) assert.ok(ids.has(id), 'Focus refers to a real module');
    assert.notDeepEqual(JSON.parse(JSON.stringify(state)), JSON.parse(JSON.stringify(before)), 'Each step changes the system: ' + system.slug + ' / ' + step.title);
    assert.ok(step.detail.length <= 120, 'Concise step copy: ' + step.title);
    before = state;
  });
  const final = storyState(system, system.story.length - 1);
  assert.ok(final.built >= maxStage(system) && final.linked >= maxStage(system) && final.live && final.monitor, 'Each story ends with a complete, monitored system: ' + system.slug);
}
pass('nine service systems: unique hero phrases/tokens, four-step capability chains, connected non-overlapping modules and stories that change the diagram at every step and end live');

const shapes = new Set(['path', 'rect', 'circle', 'ellipse', 'polygon', 'polyline', 'line']);
/** SVG material ids are unique per instance and every url(#…) reference resolves. */
function checkMaterials(tree, prefix, generatedPatternPrefix) {
  const rendered = nodes(tree), ids = rendered.filter((node) => node.props?.id).map((node) => node.props.id);
  assert.ok(ids.length >= 6); assert.equal(new Set(ids).size, ids.length, 'SVG IDs must be unique per instance');
  assert.ok(ids.every((id) => id.startsWith(prefix) || (generatedPatternPrefix && id.startsWith(generatedPatternPrefix)
    && /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(id) && rendered.some((node) => node.type === 'pattern' && node.props.id === id))), 'Material resources must use their instance namespace or a safe per-component React pattern ID');
  for (const node of rendered) for (const [name, value] of Object.entries(node.props ?? {})) if (typeof value === 'string' && name !== 'xmlns') {
    assert.doesNotMatch(value, /data:image|https?:\/\//i, 'Equipment must not embed external/raster artwork');
    for (const reference of value.matchAll(/url\(#([^)]*)\)/g)) assert.ok(ids.includes(reference[1]), 'Unresolved material or clip path: ' + reference[1]);
    if (['href', 'xlinkHref'].includes(name) && value.startsWith('#')) assert.ok(ids.includes(value.slice(1)), 'Unresolved SVG reference: ' + value);
  }
  return ids;
}

/* ---------- Mounted service equipment: the current narrower Steel API ---------- */
assert.deepEqual([...STEEL_SCENES].sort(), [...slugs].sort(), 'The mounted renderer must dispatch all nine canonical services exactly once');
assert.equal(SteelScene({ slug: 'not-a-service', id: 'invalid' }), null, 'Unknown services must not show another service’s scene');
const activeGeometry = new Set(), activeBudgets = [];
for (const system of all) {
  const props = { slug: system.slug, id: 'hero-' + system.slug, running: false, built: 99, ghost: false, assemble: true };
  const tree = steelTree(props), complete = nodes(tree);
  assert.equal(tree.type, 'svg'); assert.equal(tree.props['data-service'], system.slug);
  assert.equal(tree.props['data-running'], false); assert.equal(tree.props['data-assemble'], true);
  assert.equal(tree.props.viewBox, '140 40 560 430');
  assert.equal(tree.props['aria-hidden'], 'true'); assert.equal(tree.props.focusable, 'false');
  assert.equal(complete.some((node) => ['foreignObject', 'filter', 'feGaussianBlur', 'img', 'canvas', 'video', 'animate', 'animateMotion', 'animateTransform', 'set', 'script'].includes(node.type)), false, 'Mounted equipment may show its local studio render but no foreign content, filters or SMIL');
  const pair = svgMarkupTree(renderToStaticMarkup(createElement('div', null,
    createElement(NativeSteelScene, props), createElement(NativeSteelScene, { ...props, id: 'explorer-' + system.slug }))));
  const siblings = pair.props.children.filter((node) => typeof node === 'object'); assert.equal(siblings.length, 2);
  const resources = checkMaterials(siblings[0], 'st-hero-' + system.slug + '-', 'holo-lines-');
  const explorerResources = checkMaterials(siblings[1], 'st-explorer-' + system.slug + '-', 'holo-lines-');
  assert.equal(resources.some((id) => explorerResources.includes(id)), false, 'Mounted hero and explorer scenes must not share material, pattern or clip IDs');
  const geometry = complete.filter((node) => shapes.has(node.type) || node.type === 'image').map((node) => [node.type, ...['d', 'points', 'x', 'y', 'cx', 'cy', 'r', 'rx', 'ry', 'width', 'height', 'x1', 'y1', 'x2', 'y2', 'transform', 'href'].map((key) => node.props[key])]);
  for (const node of complete.filter((item) => item.type === 'image')) assert.match(node.props.href, new RegExp('^/services/renders/(' + system.slug + '|drone)\.webp$'), 'Each service shows only its own local studio render and the assembly drone');
  activeGeometry.add(JSON.stringify(geometry));
  for (const node of complete) for (const [name, value] of Object.entries(node.props ?? {})) {
    if (typeof value === 'number') assert.ok(Number.isFinite(value), 'Mounted SVG coordinates must remain finite');
    if (typeof value === 'string' && ['d', 'points', 'transform'].includes(name)) assert.doesNotMatch(value, /NaN|Infinity|undefined/);
  }
  const stagedStates = [EMPTY_STATE, COMPLETE_STATE, ...system.story.map((_, index) => storyState(system, index)), { ...EMPTY_STATE, built: 2, ghost: true }];
  for (const state of stagedStates) {
    const staged = nodes(steelTree({ ...props, built: state.built, ghost: state.ghost }));
    const parts = staged.filter((node) => node.props?.className === 'part');
    assert.ok(parts.length >= 5, 'Each mounted service must have real staged equipment');
    for (const part of parts) {
      const stage = part.props.style?.['--n']; assert.ok(Number.isInteger(stage) && stage >= 1 && stage <= maxStage(system), 'Invalid mounted part stage: ' + JSON.stringify({ slug: system.slug, stage, maximum: maxStage(system), style: part.props.style }));
      assert.equal(part.props['data-on'], state.built >= stage, 'Mounted equipment must follow the current story build stage');
      assert.equal(part.props['data-ghost'], state.ghost && state.built < stage, 'Planned equipment must obey the current ghost state');
    }
  }
  const running = SteelScene({ ...props, running: true, assemble: false });
  assert.equal(running.props['data-running'], true); assert.equal(running.props['data-assemble'], false);
  const markup = renderToStaticMarkup(createElement(NativeSteelScene, props)), bytes = Buffer.byteLength(markup), gzip = gzipSync(markup).length;
  assert.ok(complete.length < 300 && bytes < 45000 && gzip < 8000, 'Mounted vector cost must stay bounded: ' + system.slug);
  assert.equal(markup, renderToStaticMarkup(createElement(NativeSteelScene, props)), 'Fixed mounted-scene props must render deterministic SVG');
  activeBudgets.push({ slug: system.slug, nodes: complete.length, bytes, gzip });
}
assert.equal(activeGeometry.size, 9, 'Mounted services need distinct actual object geometry, not just different labels');
const steelCss = fs.readFileSync(path.join(root, 'components/steel/steel.module.css'), 'utf8');
assert.match(steelCss, /\.scene\[data-running=['"]false['"]\]\s*\*/); assert.match(steelCss, /animation-play-state:\s*paused\s*!important/);
assert.match(steelCss, /prefers-reduced-motion:\s*reduce/); assert.match(steelCss, /scripting:\s*none/);
assert.match(steelCss, /animation:\s*none\s*!important/); assert.match(steelCss, /transition:\s*none\s*!important/);
assert.match(steelCss, /\.card[^}]*\.check[^}]*\{[^}]*opacity:\s*1\s*!important[^}]*transform:\s*none\s*!important/);
assert.doesNotMatch(steelCss, /(?:^|[;{])\s*(?:filter|backdrop-filter)\s*:/);
console.log('ACTIVE_STEEL_BUDGET: ' + JSON.stringify(activeBudgets));
pass('mounted Steel renderer dispatches nine distinct bounded SVGs with isolated material references, stage/ghost state and running/assemble controls; CSS pause and no-JS/reduced completed-state fallbacks are present (finite timelines and module focus highlights are not mounted features)');

/* ---------- Hero composition and controller ---------- */
const section = HeroSection();
assert.equal(section.type, 'section'); assert.equal(section.props.id, 'hero'); assert.equal(section.props['aria-labelledby'], 'hero-title');
const child = nodes(section).find((node) => node.type === HeroShowcase); assert.ok(child);
const snapshot = (value) => JSON.parse(JSON.stringify(value));
assert.deepEqual(snapshot(child.props.chapters.map((chapter) => chapter.slug)), [...HERO_ORDER]);
child.props.chapters.forEach((chapter) => assert.equal(chapter.description, SERVICE_SYSTEMS[chapter.slug].summary));
assert.doesNotThrow(() => JSON.stringify(child.props));

const find = (harness, predicate) => nodes(harness.tree).find(predicate);
const button = (harness, label) => find(harness, (node) => node.type === 'button' && node.props['aria-label'] === label);
const mechanism = (harness) => find(harness, (node) => node.type === HeroMechanism);
const phrase = (harness) => find(harness, (node) => node.type === HeroPhrase).props.phrase;
const heading = (harness) => text(find(harness, (node) => node.type === 'h2'));
const standby = (harness) => find(harness, (node) => node.props?.className === 'stage').props['data-standby'];
const segments = (harness) => nodes(harness.tree).filter((node) => node.props?.className === 'segment');
const status = (harness) => text(find(harness, (node) => node.props?.role === 'status'));
const token = (index) => SERVICE_SYSTEMS[HERO_ORDER[index]].token;
const { TiltSurface } = load('components/depth/tilt-surface.tsx');
function heroServiceMatches(harness, index) {
  const chapter = child.props.chapters[index], system = SERVICE_SYSTEMS[chapter.slug], visual = SERVICE_VISUALS[chapter.slug];
  const diagrams = nodes(harness.tree).filter((node) => node.type === LiveScene); assert.equal(diagrams.length, 1);
  const diagram = diagrams[0];
  assert.equal(diagram.key, chapter.slug); assert.equal(diagram.props.system, system); assert.equal(diagram.props.state, COMPLETE_STATE);
  assert.equal(diagram.props.variant, 'hero'); assert.equal(typeof diagram.props.assemble, 'boolean'); if (index !== 0) assert.equal(diagram.props.assemble, true); assert.equal(diagram.props.running, harness.tree.props['data-motion']);
  assert.equal(heading(harness), chapter.name); assert.equal(mechanism(harness).props.dockLabel, system.token);
  const workflow = nodes(harness.tree).find((node) => node.type === 'ol' && node.props['aria-label'] === chapter.name + ' workflow');
  assert.ok(workflow); assert.deepEqual(nodes(workflow).filter((node) => node.type === 'li').map(text), [...visual.steps]);
  const serviceHeading = find(harness, (node) => node.type === 'h2');
  assert.ok(nodes(serviceHeading).some((node) => node.type === 'a' && node.props.href === '/services/' + chapter.slug));
  const stage = find(harness, (node) => node.props?.className === 'stage');
}

const hero = hookHarness(HeroShowcase, child.props);
const ssr = nodes(hero.serverTree);
assert.equal(ssr.filter((node) => node.type === 'h1').length, 1);
assert.equal(accessibleText(ssr.find((node) => node.type === 'h1')), 'We engineer AI that connects conversations, workflows, systems and decisions.');
assert.ok(ssr.some((node) => node.type === 'a' && node.props.href === '/contact') && ssr.some((node) => node.type === 'a' && node.props.href === '/services'), 'Primary and secondary CTAs');
assert.ok(ssr.some((node) => node.type === 'a' && node.props.href === '/services/' + HERO_ORDER[0]), 'Service in focus links to its page');
assert.ok(!ssr.some((node) => ['img', 'video', 'canvas'].includes(node.type)));
assert.equal(segments(hero).length, 9);
segments(hero).forEach((segment, index) => { assert.equal(segment.props['aria-label'], `${index + 1} of 9: ${child.props.chapters[index].name}`); assert.equal(segment.props.type, 'button'); });
for (const label of ['Previous service', 'Next service', 'Pause service showcase']) assert.ok(button(hero, label), 'Missing control: ' + label);
assert.equal(mechanism(hero).props.transferId, null); assert.equal(mechanism(hero).props.dockLabel, token(0));
assert.equal(phrase(hero), SERVICE_SYSTEMS[HERO_ORDER[0]].phrase);
heroServiceMatches(hero, 0);
const heroTilts = nodes(hero.tree).filter((node) => node.type === TiltSurface); assert.equal(heroTilts.length, 1);
assert.ok(nodes(heroTilts[0]).some((node) => node.type === HeroMechanism), 'The remaining tilt surface belongs to the articulated arm');

// Dwell → transfer → commit → complete → next dwell.
timerCount(1, HERO_DWELL_MS);
fireTimer(hero, HERO_DWELL_MS);
assert.equal(mechanism(hero).props.transferId, 1); assert.equal(mechanism(hero).props.incomingLabel, token(1));
assert.equal(phrase(hero), SERVICE_SYSTEMS[HERO_ORDER[1]].phrase, 'The message changes first');
assert.equal(heading(hero), child.props.chapters[0].name, 'The service in focus waits for the release');
assert.equal(standby(hero), true); timerCount(0);
heroServiceMatches(hero, 0);
mechanism(hero).props.onCommit(); hero.flush();
assert.equal(heading(hero), child.props.chapters[1].name); assert.equal(standby(hero), false);
assert.equal(mechanism(hero).props.dockLabel, token(1));
heroServiceMatches(hero, 1);
mechanism(hero).props.onComplete(); hero.flush();
assert.equal(mechanism(hero).props.transferId, null); timerCount(1, HERO_DWELL_MS);
pass('the hero sequence changes the phrase at pickup, holds the service panel in standby, commits title/diagram/dock together on release and restarts one dwell timer');

// Manual input: keyboard, queueing during a transfer, swipe.
let prevented = false;
hero.tree.props.children[2].props.onKeyDown({ key: 'ArrowRight', preventDefault() { prevented = true; } }); hero.flush();
assert.ok(prevented); assert.equal(mechanism(hero).props.transferId, 2); assert.equal(mechanism(hero).props.incomingLabel, token(2));
click(segments(hero)[6], hero);
assert.match(status(hero), /queued/); assert.equal(mechanism(hero).props.transferId, 2, 'A running transfer is never interrupted');
mechanism(hero).props.onCommit(); hero.flush(); mechanism(hero).props.onComplete(); hero.flush();
timerCount(0);
assert.equal(mechanism(hero).props.transferId, 3); assert.equal(mechanism(hero).props.incomingLabel, token(6), 'The latest queued choice runs next');
mechanism(hero).props.onCommit(); hero.flush(); mechanism(hero).props.onComplete(); hero.flush();
assert.equal(heading(hero), child.props.chapters[6].name);
timerCount(1, HERO_DWELL_MS);
const focusGroup = hero.tree.props.children[2];
focusGroup.props.onPointerEnter({ pointerType: 'mouse' }); hero.flush();
timerCount(0); focusGroup.props.onPointerLeave(); hero.flush(); timerCount(1);
const stage = find(hero, (node) => node.props?.className === 'stage');
stage.props.onPointerDown({ pointerType: 'touch', clientX: 300, clientY: 400 }); stage.props.onPointerUp({ clientX: 210, clientY: 410 }); hero.flush();
assert.equal(mechanism(hero).props.incomingLabel, token(7), 'A left swipe advances');
mechanism(hero).props.onCommit(); hero.flush(); mechanism(hero).props.onComplete(); hero.flush();
pass('keyboard arrows and touch swipes select services, mouse hover holds the dwell timer, and selections made mid-transfer queue the latest choice without interrupting the arm');

// Pause, hidden tab and reduced motion all switch to immediate still selection.
click(button(hero, 'Pause service showcase'), hero);
assert.equal(mechanism(hero).props.playing, false); timerCount(0);
click(button(hero, 'Next service'), hero);
assert.equal(heading(hero), child.props.chapters[8].name); assert.equal(mechanism(hero).props.transferId, null, 'Paused selection is a still update');
click(button(hero, 'Resume service showcase'), hero); timerCount(1, HERO_DWELL_MS);
hidden(true, hero); timerCount(0); assert.equal(mechanism(hero).props.playing, false); hidden(false, hero); timerCount(1);
motion(true, hero); timerCount(0);
assert.equal(button(hero, 'Pause service showcase').props.disabled, true);
click(button(hero, 'Previous service'), hero);
assert.equal(heading(hero), child.props.chapters[7].name); assert.equal(mechanism(hero).props.transferId, null);
motion(false, hero);
clean(hero);
pass('pause, hidden tabs and reduced motion stop the clock and arm, turn selections into immediate stills, and unmount removes every timer, observer and listener');

const serviceAlignment = hookHarness(HeroShowcase, child.props);
heroServiceMatches(serviceAlignment, 0); let previousService = 0;
for (const index of [1, 2, 3, 4, 5, 6, 7, 8, 0]) {
  click(segments(serviceAlignment)[index], serviceAlignment);
  assert.equal(mechanism(serviceAlignment).props.incomingLabel, token(index)); heroServiceMatches(serviceAlignment, previousService);
  mechanism(serviceAlignment).props.onCommit(); serviceAlignment.flush(); heroServiceMatches(serviceAlignment, index);
  mechanism(serviceAlignment).props.onComplete(); serviceAlignment.flush(); heroServiceMatches(serviceAlignment, index);
  previousService = index;
}
clean(serviceAlignment);
pass('all nine hero handoffs commit the matching canonical title/link, dock word, bespoke diagram and three operation steps together while the incoming phrase changes independently before release');

const { ServiceSystemPreview } = load('components/systems/service-system-preview.tsx');
for (const service of services) {
  const label = service.name + ' system: ' + SERVICE_VISUALS[service.slug].description;
  const preview = hookHarness(ServiceSystemPreview, { slug: service.slug, label });
  const diagram = () => nodes(preview.tree).find((node) => node.type === LiveScene);
  const initialDiagram = nodes(preview.serverTree).find((node) => node.type === LiveScene);
  assert.equal(initialDiagram.props.running, false); assert.equal(initialDiagram.props.variant, 'card');
  assert.equal(diagram().props.system.slug, service.slug); assert.equal(diagram().props.state, COMPLETE_STATE); assert.equal(diagram().props.state.live, true);
  const description = nodes(preview.tree).find((node) => node.props?.role === 'img'); assert.equal(description.props['aria-label'], label);
  const workflow = nodes(preview.tree).find((node) => node.type === 'ol' && node.props['aria-label'] === 'Service workflow');
  assert.deepEqual(nodes(workflow).filter((node) => node.type === 'li').map(text), [...SERVICE_VISUALS[service.slug].steps]);
  assert.equal(observers.size, 1); const observer = [...observers][0]; assert.equal(observer.options.threshold, .3);
  assert.deepEqual([...observer.targets], [preview.host('preview')]);
  const visibility = (value) => { observer.callback([{ target: preview.host('preview'), isIntersecting: value }]); preview.flush(); };
  const initialKey = diagram().key; assert.equal(diagram().props.running, false); timerCount(0);
  visibility(false); visibility(true); assert.equal(diagram().props.running, true); assert.notEqual(diagram().key, initialKey, 'First offscreen entrance restarts the finite operation once');
  const enteredKey = diagram().key;
  visibility(false); assert.equal(diagram().props.running, false); visibility(true); assert.equal(diagram().props.running, true); assert.equal(diagram().key, enteredKey, 'Later visibility changes pause the same operation instead of remounting it');
  hidden(true, preview); assert.equal(diagram().props.running, false); hidden(false, preview); assert.equal(diagram().props.running, true); assert.equal(diagram().key, enteredKey);
  click(control('Pause system animation', preview), preview); assert.equal(diagram().props.running, false); assert.equal(control('Resume system animation', preview).props['aria-pressed'], true);
  click(control('Resume system animation', preview), preview); assert.equal(diagram().props.running, true); assert.equal(diagram().key, enteredKey);
  click(control('Pause system animation', preview), preview); click(control('Replay system assembly', preview), preview);
  const replayKey = diagram().key; assert.notEqual(replayKey, enteredKey); assert.equal(diagram().props.running, true); assert.equal(control('Pause system animation', preview).props['aria-pressed'], false);
  motion(true, preview); assert.equal(diagram().props.running, false); assert.equal(control('Pause system animation', preview).props.disabled, true); assert.equal(control('Replay system assembly', preview).props.disabled, true);
  motion(false, preview); assert.equal(diagram().props.running, true); assert.equal(diagram().key, replayKey);
  clockNow += 8000; preview.flush(); timerCount(0); assert.equal(diagram().props.system.slug, service.slug, 'Local playback never auto-selects another service');
  clean(preview); assert.equal(observer.disconnected, true); document.dispatch('visibilitychange'); media.dispatch('change');
}
const mountedVisiblePreview = hookHarness(ServiceSystemPreview, { slug: services[0].slug, label: 'Visible service' });
const mountedVisibleDiagram = () => nodes(mountedVisiblePreview.tree).find((node) => node.type === LiveScene);
const mountedVisibleKey = mountedVisibleDiagram().key;
[...observers][0].callback([{ target: mountedVisiblePreview.host('preview'), isIntersecting: true }]); mountedVisiblePreview.flush();
assert.equal(mountedVisibleDiagram().key, mountedVisibleKey, 'A tab mounted already in view must not replay its mount twice'); clean(mountedVisiblePreview);
const previewCss = fs.readFileSync(path.join(root, 'components/systems/service-system-preview.module.css'), 'utf8');
assert.match(previewCss, /\.controls\s+button\s*\{[^}]*width:\s*44px;[^}]*height:\s*44px/);
pass('all nine explorer scenes retain matching three-step workflows and isolated instances; visible/page/reduced preference, pause/replay, first entrance and cleanup work without another service clock');

const { Capabilities } = load('components/sections/capabilities.tsx');
const tabs = (harness) => nodes(harness.tree).filter((node) => node.props?.role === 'tab');
function capabilityMatches(harness, index) {
  const all = nodes(harness.tree), controls = tabs(harness), service = services[index];
  assert.equal(controls.length, 9);
  controls.forEach((tab, i) => {
    assert.ok(text(tab).includes(services[i].name), 'Missing full service name in explorer');
    assert.equal(tab.props['aria-selected'], i === index); assert.equal(tab.props.tabIndex, i === index ? 0 : -1);
    assert.equal(tab.props['aria-controls'], 'capability-panel-' + services[i].slug);
  });
  const panels = all.filter((node) => node.props?.role === 'tabpanel'); assert.equal(panels.length, 9);
  panels.forEach((panel, i) => { assert.equal(panel.props['aria-hidden'], i !== index); assert.equal(panel.props.inert, i !== index); });
  const panel = panels[index], panelNodes = nodes(panel);
  assert.equal(panel.props['aria-labelledby'], controls[index].props.id);
  assert.equal(text(panelNodes.find((node) => node.type === 'h3')), service.name);
  assert.ok(panelNodes.some((node) => node.type === 'a' && node.props.href === '/services/' + service.slug));
  assert.ok(panelNodes.some((node) => node.type === 'a' && node.props.href === '/contact?service=' + service.slug));
  const previews = all.filter((node) => node.type === ServiceSystemPreview); assert.equal(previews.length, 1);
  assert.equal(previews[0].props.slug, service.slug); assert.equal(previews[0].key, service.slug);
  assert.ok(panelNodes.includes(previews[0]), 'Only the active service panel may mount its system preview');
  assert.ok(previews[0].props.label.startsWith(service.name + ' system:'), 'The system preview needs a descriptive accessible label');
  assert.equal(previews[0].props.label, service.name + ' system: ' + SERVICE_VISUALS[service.slug].description, 'The preview description must explain the selected service’s actual operation');
  assert.equal(all.filter((node) => node.type === 'img').length, 0, 'The explorer must use the vector system diagram rather than a raster image');
}
const explorer = hookHarness(Capabilities, {}); capabilityMatches(explorer, 0);
for (let i = 0; i < 9; i++) { tabs(explorer)[i].props.onClick(); explorer.flush(); capabilityMatches(explorer, i); assert.equal(storage.get('lexvaxa-capability'), services[i].slug); }
function key(harness, from, pressed, expected) {
  let prevented = false;
  tabs(harness)[from].props.onKeyDown({ key: pressed, preventDefault() { prevented = true; } }); harness.flush();
  assert.equal(prevented, true); capabilityMatches(harness, expected); assert.equal(focusedHost?.id, 'capability-tab-' + services[expected].slug);
}
key(explorer, 8, 'Home', 0); key(explorer, 0, 'ArrowLeft', 8);
key(explorer, 8, 'ArrowDown', 0); key(explorer, 0, 'ArrowRight', 1);
key(explorer, 1, 'ArrowUp', 0); key(explorer, 0, 'End', 8);
explorer.unmount();
storage.set('lexvaxa-capability', services[5].slug);
const restored = hookHarness(Capabilities, {}); capabilityMatches(restored, 5); restored.unmount();
storage.set('lexvaxa-capability', 'obsolete-service');
const stale = hookHarness(Capabilities, {}); capabilityMatches(stale, 0); stale.unmount();
storageBlocked = true;
const blocked = hookHarness(Capabilities, {}); capabilityMatches(blocked, 0);
tabs(blocked)[8].props.onClick(); blocked.flush(); capabilityMatches(blocked, 8);
key(blocked, 8, 'ArrowRight', 0); blocked.unmount(); storageBlocked = false;
timerCount(0);
pass('capabilities exposes nine full names with a single matching system preview and selected-service links; roving arrows/Home/End, tab restoration and blocked/stale storage work');

const { ProjectsPreview } = load('components/sections/projects-preview.tsx');
const { ProjectCarousel } = load('components/sections/project-carousel.tsx');
const { ProjectCard } = load('components/sections/project-card.tsx');
const { ProjectTechStack } = load('components/content/project-tech-stack.tsx');
const { InsightsPreview } = load('components/sections/insights-preview.tsx');
// Projects live in the CMS; ten fixture records exercise the shared components (four with live demos).
const projects = Array.from({ length: 10 }, (_, index) => ({
  slug: `fixture-project-${index + 1}`, name: `Fixture Project ${index + 1}`, category: 'Fixture sector', discipline: 'Fixture platform',
  summary: `A short summary of fixture project ${index + 1}.`, overview: 'Overview text.', challenge: 'Challenge text.', solution: 'Solution text.',
  technologies: ['React', 'Node.js', 'PostgreSQL', ...(index % 2 ? ['TypeScript'] : [])], features: ['One', 'Two', 'Three'],
  image: { src: `/fixtures/project-${index + 1}.webp`, alt: `Fixture project ${index + 1} interface`, width: 1280, height: 800 },
  serviceSlugs: ['custom-software-web-apps'], tracks: ['full-stack'], ...(index < 4 ? { liveUrl: `https://fixture-${index + 1}.example.com/` } : {}),
}));
const featuredProjects = projects;
const { articles } = load('lib/data/articles.ts');
const projectSection = ProjectsPreview({ projects });
assert.equal(ProjectsPreview({ projects: [] }), null, 'No featured projects: the homepage section is hidden');
assert.equal(projectSection.type, 'section'); assert.equal(projectSection.props['aria-labelledby'], 'projects-title');
assert.ok(nodes(projectSection).some((node) => node.type === 'h2' && node.props.id === 'projects-title'));
assert.match(fs.readFileSync(path.join(root, 'app/work/page.tsx'), 'utf8'), /<ProjectGrid[\s\S]*?>\s*\{projects\.map\(\(project\) => <ProjectCard /, '/work must list every CMS project in its filterable grid');
const projectRail = { type: ProjectCarousel, props: { id: 'work-projects-track', label: 'Selected project portfolio', tone: 'light', children: projects.map((project) => ({ type: ProjectCard, key: project.slug, props: { project, headingLevel: 2 } })) } };
const projectCards = [projectRail.props.children].flat(); assert.equal(projectCards.length, projects.length);
projectCards.forEach((card, index) => {
  const project = featuredProjects[index];
  assert.equal(card.type, ProjectCard); assert.equal(card.key, project.slug);
  const article = ProjectCard(card.props), all = nodes(article);
  assert.equal(article.type, 'article'); assert.equal(article.props['data-project'], project.slug);
  const links = all.filter((node) => node.type === 'a'); assert.equal(links.length, project.liveUrl ? 2 : 1);
  for (const link of links) assert.equal(nodes(link.props.children).some((node) => node.type === 'a'), false, 'Project links must not be nested');
  assert.equal(links[0].props.href, '/work/' + project.slug); assert.ok(text(article).includes(project.name));
  assert.ok(all.some((node) => node.type === 'h' + (card.props.headingLevel ?? 3) && text(node) === project.name));
  assert.ok(nodes(ProjectCard({ project })).some((node) => node.type === 'h3' && text(node) === project.name));
  assert.ok(nodes(ProjectCard({ project, headingLevel: 2 })).some((node) => node.type === 'h2' && text(node) === project.name));
  assert.ok(text(article).includes(project.summary)); assert.ok(text(article).includes(project.category)); assert.ok(text(article).includes(project.discipline));
  if (project.liveUrl) { assert.equal(links[1].props.href, project.liveUrl); assert.equal(links[1].props.target, '_blank'); assert.match(links[1].props.rel, /noopener/); assert.match(links[1].props.rel, /noreferrer/); }
  const images = all.filter((node) => node.type === 'img'); assert.equal(images.length, 1);
  assert.equal(images[0].props.src, project.image.src); assert.equal(images[0].props.alt, project.image.alt);
  assert.equal(images[0].props.width, project.image.width); assert.equal(images[0].props.height, project.image.height);
  assert.ok(images[0].props.loading !== 'eager' && !images[0].props.preload && !images[0].props.priority, 'Offscreen project cards must not all preload their screenshots');
  const technologies = all.find((node) => node.type === 'ul' && node.props['aria-label'] === 'Technologies');
  assert.ok(technologies);
  assert.deepEqual(nodes(technologies).filter((node) => node.type === 'li').slice(0, 3).map(text), [...project.technologies.slice(0, 3)]);
  for (const technology of project.technologies) assert.ok(accessibleText(technologies).includes(technology), 'Technology overflow must retain the actual names');
});
const carousel = hookHarness(ProjectCarousel, projectRail.props);
const rail = carousel.host(projectRail.props.id); assert.ok(rail);
const serverRail = nodes(carousel.serverTree).find((node) => node.type === 'ul' && node.props.id === projectRail.props.id);
assert.ok(serverRail); assert.equal(serverRail.props.tabIndex, 0); assert.equal(serverRail.props['aria-label'], projectRail.props.label);
assert.equal([serverRail.props.children].flat().length, projects.length, 'All project links must remain in the native server-rendered rail');
assert.equal(nodes(carousel.serverTree).filter((node) => node.type === 'button' && node.props.disabled).length, 3, 'SSR must not guess scroll boundaries or start automatic movement');
const previousProjects = () => control('Previous projects', carousel), nextProjects = () => control('Next projects', carousel);
for (const button of [previousProjects(), nextProjects()]) { assert.equal(button.props.type, 'button'); assert.equal(button.props['aria-controls'], projectRail.props.id); }
assert.equal(previousProjects().props.disabled, true); assert.equal(nextProjects().props.disabled, false);
assert.equal(rail.count('scroll'), 1); assert.equal(rail.count('scrollend'), 1); assert.equal(window.count('resize'), 1); assert.equal(resizeObservers.size, 1);
const railObserver = [...resizeObservers][0]; assert.deepEqual([...railObserver.targets], [rail, rail.firstElementChild]);
timerCount(0);
click(nextProjects(), carousel); assert.equal(rail.scrollLeft, 360); assert.equal(rail.scrollCalls.at(-1).behavior, 'smooth');
assert.equal(previousProjects().props.disabled, false);
click(previousProjects(), carousel); assert.equal(rail.scrollLeft, 0); assert.equal(previousProjects().props.disabled, true);
rail.scrollLeft = 905; rail.dispatch('scroll'); carousel.flush();
click(nextProjects(), carousel); assert.equal(rail.scrollLeft, 1080, 'Next should find the next card after a manual swipe');
click(previousProjects(), carousel); assert.equal(rail.scrollLeft, 720, 'Previous should find the prior card after a manual swipe');
rail.clientWidth = 800; rail.scrollLeft = 1600; railObserver.callback([{ target: rail }]); carousel.flush();
click(nextProjects(), carousel); assert.equal(rail.scrollLeft, 1720, 'The final card destination must clamp to the actual scroll boundary');
assert.equal(nextProjects().props.disabled, true);
rail.scrollLeft = 0; rail.clientWidth = 3000; railObserver.callback([{ target: rail.firstElementChild }]); carousel.flush();
assert.equal(previousProjects().props.disabled, true); assert.equal(nextProjects().props.disabled, true, 'A rail without overflow must disable both arrows');
rail.clientWidth = 720; window.dispatch('resize'); carousel.flush(); assert.equal(nextProjects().props.disabled, false);
media.matches = true; click(nextProjects(), carousel); assert.equal(rail.scrollCalls.at(-1).behavior, 'auto', 'Reduced motion must avoid smooth programmatic scrolling'); media.matches = false;
timerCount(0); clean(carousel); assert.equal(rail.count('scroll'), 0); assert.equal(railObserver.disconnected, true);
rail.dispatch('scroll'); window.dispatch('resize');
pass('seven reusable server-rendered project cards preserve screenshots, actual stack names and separate detail/live links; native rail arrows clamp, follow manual scroll/resize and support reduced motion');

const automatic = hookHarness(ProjectCarousel, projectRail.props);
const automaticRail = automatic.host(projectRail.props.id);
const automaticObserver = [...observers][0];
const autoTrack = () => nodes(automatic.tree).find((node) => node.type === 'ul' && node.props.id === projectRail.props.id);
const autoVisibility = (value) => { automaticObserver.callback([{ target: automaticRail, isIntersecting: value }]); automatic.flush(); };
const autoPause = () => control('Pause automatic project advance', automatic);
const autoResume = () => control('Resume automatic project advance', automatic);
timerCount(0); assert.equal(automatic.tree.props['data-autoplay'], false);
autoVisibility(true); timerCount(1, 5000);
automaticRail.imageDoubles = [{ complete: false, closest: () => automaticRail.children[0] }];
fireTimer(automatic, 5000); assert.equal(automaticRail.scrollCalls.length, 0, 'Pending visible screenshots must get a full additional dwell');
automaticRail.imageDoubles[0].complete = true;
fireTimer(automatic, 5000); assert.equal(automaticRail.scrollLeft, 360); timerCount(1, 5000);
autoTrack().props.onPointerEnter({ pointerType: 'mouse' }); automatic.flush(); timerCount(0);
autoTrack().props.onPointerLeave({ pointerType: 'mouse' }); automatic.flush(); timerCount(1, 5000);
hidden(true, automatic); timerCount(0); hidden(false, automatic); timerCount(1, 5000);
autoVisibility(false); timerCount(0); autoVisibility(true); timerCount(1, 5000);
click(autoPause(), automatic); timerCount(0); assert.equal(autoResume().props['aria-pressed'], true);
click(autoResume(), automatic); timerCount(1, 5000);
automatic.tree.props.onFocusCapture({ target: automatic.host('rotationButton') }); automatic.flush(); timerCount(0);
click(autoPause(), automatic); timerCount(0); click(autoResume(), automatic); timerCount(1, 5000);
automatic.tree.props.onFocusCapture({ target: { owner: automaticRail } }); automatic.flush(); timerCount(0);
automatic.tree.props.onBlurCapture({ currentTarget: { contains: () => false }, relatedTarget: null }); automatic.flush(); timerCount(0);
click(autoResume(), automatic); timerCount(1, 5000);
autoTrack().props.onPointerDown(); automatic.flush(); timerCount(0);
automaticRail.scrollLeft = 1800; automaticRail.dispatch('scroll'); automatic.flush(); timerCount(0);
click(autoResume(), automatic); fireTimer(automatic, 5000); assert.equal(automaticRail.scrollLeft, 0, 'Automatic rotation wraps at the actual scroll boundary');
automaticRail.scrollLeft = 700; automaticRail.dispatch('scroll'); automatic.flush(); timerCount(0);
click(autoResume(), automatic); timerCount(1, 5000);
motion(true, automatic); timerCount(0); assert.equal(autoResume().props.disabled, true);
motion(false, automatic); timerCount(0); click(autoResume(), automatic); timerCount(1, 5000);
const railKey = (keyName, expectedLeft) => {
  let prevented = false;
  autoTrack().props.onKeyDown({ key: keyName, target: automaticRail, currentTarget: automaticRail, preventDefault() { prevented = true; } }); automatic.flush();
  assert.equal(prevented, true); assert.equal(automaticRail.scrollLeft, expectedLeft); timerCount(0);
};
railKey('Home', 0); railKey('ArrowRight', 360); railKey('End', 1800); railKey('ArrowLeft', 1440);
clean(automatic); assert.equal(automaticObserver.disconnected, true); assert.equal(automaticRail.count('scrollend'), 0);
pass('project auto advance waits for visible images, owns one five-second timer, wraps and suspends on hover/focus/hidden/offscreen; manual input stops it until Resume and keyboard/reduced-motion behavior stays usable');

/* The homepage now shows the featured work as a showcase (large 3D preview plus an index of names). */
const { ProjectShowcase } = load('components/sections/project-showcase.tsx');
const homepageShowcase = nodes(projectSection).find((node) => node.type === ProjectShowcase);
assert.ok(homepageShowcase, 'The homepage must mount its project showcase');
assert.deepEqual(homepageShowcase.props.projects.map((project) => project.slug), featuredProjects.map((project) => project.slug), 'The showcase keeps the shared portfolio order');
for (const project of homepageShowcase.props.projects) { const source = featuredProjects.find((item) => item.slug === project.slug); assert.equal(project.image, source.image); assert.equal(project.name, source.name); }
pass('homepage showcase keeps the admin order and screenshots'); //ive links and inert copies; static SSR/touch/reduced browsing, explicit pause/resume, pointer/focus takeover and visibility cleanup gate CSS-only desktop drift');

for (const project of projects) {
  const stackPreview = hookHarness(ProjectTechStack, { id: 'test-stack', projectName: project.name, technologies: project.technologies });
  const initialStack = stackPreview.serverTree;
  assert.equal(initialStack.type, 'section'); assert.equal(initialStack.props['data-enhanced'], false); assert.equal(initialStack.props['data-running'], false);
  const canonicalLists = nodes(initialStack).filter((node) => node.type === 'ul' && node.props['aria-label'] === project.name + ' technology stack');
  assert.equal(canonicalLists.length, 1);
  assert.deepEqual(nodes(canonicalLists[0]).filter((node) => node.type === 'li').map(accessibleText), [...project.technologies]);
  const decorativeLists = nodes(initialStack).filter((node) => node.type === 'ul' && node !== canonicalLists[0]);
  for (const duplicate of decorativeLists) { assert.equal(duplicate.props['aria-hidden'], 'true'); assert.equal(duplicate.props.inert, true); assert.equal(nodes(duplicate).some((node) => ['a', 'button'].includes(node.type)), false); }
  assert.equal(nodes(initialStack).find((node) => node.type === 'button').props.hidden, true);
  const visibility = [...observers][0], section = stackPreview.host('test-stack');
  visibility.callback([{ target: section, isIntersecting: true }]); stackPreview.flush(); assert.equal(stackPreview.tree.props['data-running'], true);
  click(control('Pause technology stack scrolling', stackPreview), stackPreview);
  assert.equal(stackPreview.tree.props['data-paused'], true); assert.equal(stackPreview.tree.props['data-running'], false);
  click(control('Resume technology stack scrolling', stackPreview), stackPreview); assert.equal(stackPreview.tree.props['data-running'], true);
  hidden(true, stackPreview); assert.equal(stackPreview.tree.props['data-running'], false); hidden(false, stackPreview); assert.equal(stackPreview.tree.props['data-running'], true);
  motion(true, stackPreview); assert.equal(stackPreview.tree.props['data-running'], false); assert.equal(nodes(stackPreview.tree).find((node) => node.type === 'button').props.hidden, true);
  motion(false, stackPreview); visibility.callback([{ target: section, isIntersecting: false }]); stackPreview.flush(); assert.equal(stackPreview.tree.props['data-running'], false);
  timerCount(0); clean(stackPreview); assert.equal(visibility.disconnected, true);
}
const stackCss = fs.readFileSync(path.join(root, 'components/content/project-tech-stack.module.css'), 'utf8');
assert.match(stackCss, /prefers-reduced-motion:\s*reduce/); assert.match(stackCss, /scripting:\s*none/);
assert.match(stackCss, /data-paused=['"]true['"]/); assert.match(stackCss, /animation:\s*none\s*!important/);
assert.match(stackCss, /focus-within/); assert.match(stackCss, /hover/); assert.match(stackCss, /min-height:\s*44px/);
pass('all seven technology ribbons retain one complete semantic stack, inert decorative copies, static SSR/no-JS/reduced fallbacks, full-stack explicit pause and visibility cleanup without JavaScript animation clocks');

/* ---------- Brand illustration: complete static content, CSS-only orbital motion ---------- */
const { BrandOrbit } = load('components/animations/brand-orbit.tsx');
const orbitIds = new Set();
function checkOrbitMarkup(tree, expectedId) {
  const all = nodes(tree), id = tree.props.id;
  assert.equal(tree.type, 'figure');
  if (expectedId) assert.equal(id, expectedId);
  assert.match(id, /^[a-zA-Z][a-zA-Z0-9_-]*$/, 'Generated orbital IDs must be safe fragment identifiers');
  const ids = all.filter((node) => node.props?.id).map((node) => node.props.id);
  assert.equal(new Set(ids).size, ids.length, 'Orbital label, description and canvas IDs must be distinct');
  for (const value of ids) { assert.ok(!orbitIds.has(value), 'Orbital IDs must not collide between instances'); orbitIds.add(value); }
  for (const name of ['aria-labelledby', 'aria-describedby']) {
    const target = all.find((node) => node.props?.id === tree.props[name]);
    assert.ok(target && accessibleText(target), 'The figure needs a resolved static accessible name and description');
  }
  const svg = all.find((node) => node.type === 'svg' && node.props.id === id + '-canvas');
  assert.ok(svg); assert.equal(svg.props.viewBox, '0 0 560 430');
  assert.equal(svg.props['aria-hidden'], 'true'); assert.equal(svg.props.focusable, 'false');
  const vector = nodes(svg);
  assert.deepEqual(vector.filter((node) => node.props?.['data-orbit']).map((node) => node.props['data-orbit']), ['data', 'software', 'ai']);
  const rings = vector.find((node) => node.props?.className === 'rings');
  assert.equal(nodes(rings).filter((node) => node.type === 'circle').length, 3);
  assert.ok(vector.some((node) => node.type === 'text' && text(node) === 'Workflow'));
  assert.equal(vector.filter((node) => node.type === 'path' && ['arcData', 'arcSoftware'].includes(node.props.className)).length, 2, 'The inner core arcs remain vector geometry');
  assert.equal(vector.some((node) => ['image', 'filter', 'foreignObject', 'canvas', 'animate', 'animateTransform', 'set'].includes(node.type)), false, 'The orbit must not introduce raster, blur or a second animation engine');
  assert.ok(vector.length < 60, 'The decorative orbital diagram must remain a small SVG');
  const legend = all.find((node) => node.type === 'ul' && node.props['aria-label'] === 'Connected disciplines');
  assert.ok(legend); assert.deepEqual(nodes(legend).filter((node) => node.type === 'li').map(accessibleText), ['Data', 'Software', 'AI']);
  assert.doesNotMatch(text(tree), /\b(?:SYSTEM ACTIVE|LOAD\s*\d|98%|telemetry)\b/i, 'A brand illustration must not report invented live metrics');
  const button = all.find((node) => node.type === 'button');
  assert.ok(button); assert.equal(button.props.type, 'button'); assert.equal(button.props['aria-controls'], svg.props.id);
  assert.equal(button.props.hidden, true); assert.equal(button.props['aria-pressed'], false);
  assert.equal(tree.props['data-enhanced'], false); assert.equal(tree.props['data-reduced'], true); assert.equal(tree.props['data-running'], false);
}
for (const id of ['home-about-orbit', 'about-brand-orbit', undefined, undefined]) {
  const orbit = hookHarness(BrandOrbit, id ? { id } : {});
  checkOrbitMarkup(orbit.serverTree, id);
  const figure = orbit.host(orbit.tree.props.id), observer = [...observers][0];
  assert.ok(figure && observer); assert.deepEqual([...observer.targets], [figure]);
  const visible = (value) => { observer.callback([{ target: figure, isIntersecting: value }]); orbit.flush(); timerCount(0); };
  assert.equal(orbit.tree.props['data-running'], false, 'Offscreen hydration must not start the decorative rotation');
  observer.callback([{ target: {}, isIntersecting: true }]); orbit.flush(); assert.equal(orbit.tree.props['data-running'], false);
  visible(true); assert.equal(orbit.tree.props['data-running'], true); assert.equal(control('Pause orbital animation', orbit).props.hidden, false);
  click(control('Pause orbital animation', orbit), orbit); assert.equal(orbit.tree.props['data-running'], false); assert.equal(control('Resume orbital animation', orbit).props['aria-pressed'], true);
  hidden(true, orbit); hidden(false, orbit); visible(false); visible(true);
  assert.equal(orbit.tree.props['data-running'], false, 'Visibility changes must not clear the visitor’s explicit pause');
  click(control('Resume orbital animation', orbit), orbit); assert.equal(orbit.tree.props['data-running'], true); assert.equal(control('Pause orbital animation', orbit).props['aria-pressed'], false);
  hidden(true, orbit); assert.equal(orbit.tree.props['data-running'], false); hidden(false, orbit); assert.equal(orbit.tree.props['data-running'], true);
  visible(false); assert.equal(orbit.tree.props['data-running'], false); visible(true);
  motion(true, orbit); assert.equal(orbit.tree.props['data-running'], false); assert.equal(control('Pause orbital animation', orbit).props.hidden, true);
  assert.deepEqual(nodes(orbit.tree).filter((node) => node.props?.['data-orbit']).map((node) => node.props['data-orbit']), ['data', 'software', 'ai'], 'Reduced motion retains the complete orbital illustration');
  motion(false, orbit); assert.equal(orbit.tree.props['data-running'], true);
  timerCount(0); clean(orbit); assert.equal(observer.disconnected, true);
  document.dispatch('visibilitychange'); media.dispatch('change');
}
// Missing observers and preferences already present on mount must fail to a useful static illustration.
media.matches = true; document.hidden = true;
const initiallyReducedOrbit = hookHarness(BrandOrbit, { id: 'reduced-orbit' });
assert.equal(initiallyReducedOrbit.tree.props['data-running'], false);
assert.equal(control('Pause orbital animation', initiallyReducedOrbit).props.hidden, true);
clean(initiallyReducedOrbit); media.matches = false; document.hidden = false;
const observerConstructor = context.IntersectionObserver;
context.IntersectionObserver = undefined;
const fallbackOrbit = hookHarness(BrandOrbit, { id: 'fallback-orbit' });
assert.equal(fallbackOrbit.tree.props['data-running'], true, 'An unavailable observer must not leave the illustration unusable');
timerCount(0); clean(fallbackOrbit); context.IntersectionObserver = observerConstructor;
const orbitSource = fs.readFileSync(path.join(root, 'components/animations/brand-orbit.tsx'), 'utf8');
assert.doesNotMatch(orbitSource, /\b(?:setTimeout|setInterval|requestAnimationFrame)\b/, 'Orbital playback must not add a JavaScript clock');
const orbitCss = fs.readFileSync(path.join(root, 'components/animations/brand-orbit.module.css'), 'utf8');
assert.match(orbitCss, /\[data-running=['"]false['"]\][^{]*\.rotor[^{]*\{[^}]*animation-play-state:\s*paused\s*!important/);
assert.doesNotMatch(orbitCss, /\.figure:(?:hover|focus-within)[^{]*\{[^}]*animation-play-state/, 'Explicit Resume must work while the control still has hover or keyboard focus');
assert.match(orbitCss, /scripting:\s*none/); assert.match(orbitCss, /prefers-reduced-motion:\s*reduce/);
assert.match(orbitCss, /\.figure \.rotor[^}]*animation:\s*none\s*!important/);
assert.match(orbitCss, /min-width:\s*44px/); assert.match(orbitCss, /min-height:\s*44px/);
assert.doesNotMatch(orbitCss, /(?:^|[;{])\s*(?:filter|backdrop-filter)\s*:/);
let orbitalTracks = 0;
for (const frame of orbitCss.matchAll(/@keyframes\s+([\w-]+)\s*\{/g)) {
  let end = frame.index + frame[0].length, depth = 1;
  for (; end < orbitCss.length && depth; end++) { if (orbitCss[end] === '{') depth++; else if (orbitCss[end] === '}') depth--; }
  const body = orbitCss.slice(frame.index + frame[0].length, end - 1), properties = [...body.matchAll(/([a-z-]+)\s*:/g)].map((match) => match[1]);
  assert.ok(properties.length); assert.ok(properties.every((name) => ['transform', 'opacity'].includes(name)), 'Orbital motion must avoid animated layout or paint properties');
  if (/Orbit$/.test(frame[1])) { orbitalTracks++; assert.deepEqual([...new Set(properties)], ['transform']); }
}
assert.equal(orbitalTracks, 4, 'Three disciplines and the core arcs need actual rotation tracks');
assert.equal([...orbitCss.matchAll(/animation:\s*[\w-]+\s+\d+s\s+linear\s+infinite/g)].length, 4, 'The requested ambient orbital tracks stay in CSS');
pass('brand orbit keeps complete, uniquely named static SVG/legend content; explicit pause, preference, visibility and page lifecycle control CSS-only rotation with no animation clock or leaked observers');

const { AboutPreview } = load('components/sections/about-preview.tsx');
const aboutPreview = AboutPreview(), aboutNodes = nodes(aboutPreview);
assert.equal(aboutPreview.type, 'section'); assert.equal(aboutPreview.props['aria-labelledby'], 'about-preview-title');
assert.equal(aboutNodes.filter((node) => node.type === 'h2' && node.props.id === 'about-preview-title').length, 1);
assert.equal(aboutNodes.some((node) => node.type === 'h1'), false);
assert.ok(aboutNodes.filter((node) => node.type === 'p' && text(node).length > 70).length >= 2, 'Company context must be native server-readable copy');
assert.deepEqual(aboutNodes.filter((node) => node.type === 'a').map((node) => node.props.href), ['/about', '/work']);
assert.equal(aboutNodes.filter((node) => node.type === BrandOrbit && node.props.id === 'home-about-orbit').length, 1);
const previewSource = ts.createSourceFile('about-preview.tsx', fs.readFileSync(path.join(root, 'components/sections/about-preview.tsx'), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
assert.equal(previewSource.statements.some((node) => ts.isExpressionStatement(node) && ts.isStringLiteral(node.expression) && node.expression.text === 'use client'), false, 'Static About content must not become a client-only boundary');
const homeSource = ts.createSourceFile('page.tsx', fs.readFileSync(path.join(root, 'app/page.tsx'), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
let mountedAboutPreviews = 0;
function countAbout(node) { if ((ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) && node.tagName.getText(homeSource) === 'AboutPreview') mountedAboutPreviews++; ts.forEachChild(node, countAbout); }
countAbout(homeSource); assert.equal(mountedAboutPreviews, 1, 'The homepage must actually mount its server-rendered company introduction');
const founderCss = fs.readFileSync(path.join(root, 'components/animations/about-founder-card.module.css'), 'utf8');
assert.match(founderCss, /\.avatar\s*\{[^}]*width:\s*120px;[^}]*height:\s*120px;[^}]*border-radius:\s*50%/);
assert.match(founderCss, /@media\s*\(max-width:\s*520px\)[\s\S]*\.avatar\s*\{[^}]*width:\s*88px;[^}]*height:\s*88px/);
pass('homepage mounts one server-rendered About introduction with native heading/copy and connected links; founder portrait keeps its compact circular desktop and phone presentation');

const insights = InsightsPreview(), insightNodes = nodes(insights);
const latestArticles = [...articles].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)).slice(0, 3);
assert.equal(insights.type, 'section'); assert.equal(insights.props['aria-labelledby'], 'insights-title');
const insightCards = insightNodes.filter((node) => node.type === 'article'); assert.equal(insightCards.length, 3);
insightCards.forEach((card, index) => {
  const article = latestArticles[index], all = nodes(card), link = all.find((node) => node.type === 'a');
  assert.equal(link.props.href, '/insights/' + article.slug); assert.equal(all.filter((node) => node.type === 'a').length, 1);
  const image = all.find((node) => node.type === 'img'); assert.equal(image.props.src, article.cover.svg); assert.equal(image.props.alt, article.cover.alt);
  // Editorial layout: the lead article carries its date; every card keeps title, topic and reading time, without summaries.
  const date = all.find((node) => node.type === 'time'); if (index === 0) assert.equal(date.props.dateTime, article.publishedAt); else assert.equal(date, undefined);
  const colon = article.title.indexOf(':'), headline = colon > 18 ? article.title.slice(0, colon) : article.title;
  assert.ok(text(card).includes(headline)); assert.ok(link.props['aria-label'].includes(article.title)); assert.equal(text(card).includes(article.summary), false, 'Homepage insight cards stay short');
  assert.ok(text(card).includes(article.category)); assert.ok(text(card).includes(article.readingTime));
});
pass('homepage insight cards use the three latest existing guides in an editorial layout: original covers, headline, topic, reading time, a semantic date on the lead article and connected native links');

/* ---------- 3D assembly stage and service story controls ---------- */
for (const system of Object.values(SERVICE_SYSTEMS)) for (const node of system.nodes) assert.ok(ICONED_MODULES.includes(system.slug + ':' + node.id), 'Every module has a specific icon: ' + system.slug + ':' + node.id);
const { ServiceStory } = load('components/systems/service-story.tsx');
const storySystem = SERVICE_SYSTEMS['conversational-voice-ai'];
const story = hookHarness(ServiceStory, { slug: storySystem.slug, serviceName: 'Voice AI' });
const storyStage = () => nodes(story.tree).find((node) => node.type === LiveScene);
const storyActive = () => nodes(story.tree).findIndex((node) => node.type === 'li' && node.props['aria-current'] === 'step');
const steps3d = nodes(story.tree).filter((node) => node.type === 'li' && node.props['data-index'] !== undefined);
assert.equal(steps3d.length, storySystem.story.length);
const last = storySystem.story.length - 1;
assert.equal(steps3d[last].props['aria-current'], 'step', 'Server HTML shows the finished system');
click(control('Previous step', story), story);
assert.equal(storyStage().props.state.built, storyState(storySystem, last - 1).built);
const playButton = () => nodes(story.tree).find((node) => node.type === 'button' && node.props['aria-pressed'] !== undefined && text(node).includes('assembly') || node.type === 'button' && text(node) === 'Pause');
click(playButton(), story);
const playTimer = [...timers.values()].find((timer) => timer.delay === 1700); assert.ok(playTimer, 'Autoplay advances on its own timer');
fireTimer(story, 1700);
assert.deepEqual(snapshot(storyStage().props.state), snapshot(storyState(storySystem, last)), 'Autoplay advances one step at a time');
const moduleList = () => nodes(story.tree).find((node) => node.type === 'ul' && node.props['aria-label'] === 'System modules');
const moduleButton = (id) => nodes(moduleList()).find((node) => node.type === 'button' && text(node) === storySystem.nodes.find((item) => item.id === id).label);
assert.equal(nodes(moduleList()).filter((node) => node.type === 'button').length, storySystem.nodes.length, 'Every module remains a native inspection control');
click(moduleButton('core'), story);
assert.equal(moduleButton('core').props['aria-pressed'], true);
assert.deepEqual(snapshot(storyStage().props.state.focus), ['core']);
const inspector = nodes(story.tree).find((node) => node.props?.['aria-live'] === 'polite');
const coreStep = storySystem.story.findIndex((_, index) => storyState(storySystem, index).built >= storySystem.nodes.find((node) => node.id === 'core').stage);
assert.match(text(inspector), new RegExp('Built in step ' + String(coreStep + 1).padStart(2, '0')));
click(nodes(inspector).find((node) => node.type === 'button'), story);
assert.equal(storyStage().props.state.built, storyState(storySystem, coreStep).built, 'The inspector jumps to the step that builds the module');
click(moduleButton('core'), story);
assert.equal(moduleButton('core').props['aria-pressed'], false, 'Selecting the same module clears its inspection state');
assert.deepEqual(snapshot(storyStage().props.state.focus), snapshot(storyState(storySystem, coreStep).focus));
const presentationSource = fs.readFileSync(path.join(root, 'components/depth/live-scene.tsx'), 'utf8');
assert.doesNotMatch(presentationSource, /\b(?:setTimeout|setInterval|requestAnimationFrame)\b/, 'The active presentation must not own a second JavaScript operation clock');
timerCount(0);
clean(story);
for (const system of Object.values(SERVICE_SYSTEMS)) {
  const state = storyState(system, 2);
  const presentation = hookHarness(LiveScene, { system, state, variant: 'story', instanceId: 'story-contract', running: false, assemble: true });
  const diagram = nodes(presentation.tree).find((node) => node.type === SteelScene);
  assert.ok(diagram); assert.equal(diagram.props.slug, system.slug); assert.equal(diagram.props.built, state.built); assert.equal(diagram.props.ghost, state.ghost);
  assert.equal(diagram.props.running, false); assert.equal(diagram.props.assemble, true);
  assert.equal(diagram.props.id, 'story-contract-' + system.slug);
  assert.ok(nodes(steelTree(diagram.props)).some((node) => node.props?.['data-service'] === system.slug), 'The active presentation must reach each service’s mounted equipment scene');
  timerCount(0); clean(presentation);
}
pass('active presentation forwards all nine equipment build/ghost states; native module controls inspect, clear and jump to build steps while delivery autoplay advances one step per tick without a second presentation clock');

/* ---------- 3D depth visualizations ---------- */
const { projectLayers, STACK_LAYERS } = load('lib/data/project-stack.ts');
for (const project of projects) {
  const layers = projectLayers(project.technologies);
  assert.equal(layers.flatMap((layer) => layer.technologies).length, project.technologies.length, 'Every technology appears in exactly one layer: ' + project.slug);
  assert.ok(!layers.some((layer) => layer.id === 'other'), 'Known stack layers cover ' + project.slug);
  const order = STACK_LAYERS.map((layer) => layer.id);
  assert.deepEqual(snapshot(layers.map((layer) => order.indexOf(layer.id))), snapshot(layers.map((layer) => order.indexOf(layer.id))).sort((a, b) => a - b), 'Layers run bottom to top');
}
const { mapServices } = load('lib/data/service-map.ts');
const { ServiceMap3D } = load('components/depth/service-map-3d.tsx');
assert.equal(mapServices.length, 9);
for (const item of mapServices) for (const related of item.related) assert.ok(mapServices.some((other) => other.slug === related), 'Map connections resolve: ' + item.slug + ' -> ' + related);
const map = hookHarness(ServiceMap3D, { services: mapServices, label: 'Map', highlight: ['ai-agents-intelligent-automation', 'crm-revenue-automation'] });
const blocks = () => nodes(map.tree).filter((node) => node.type === 'a');
assert.equal(blocks().length, 9);
blocks().forEach((block) => { assert.ok(block.props.href.startsWith('/services/')); assert.equal(block.props['aria-label'], mapServices.find((item) => '/services/' + item.slug === block.props.href).name); });
assert.deepEqual(snapshot(blocks().filter((block) => block.props['data-lit']).map((block) => block.props.href)).sort(), ['/services/ai-agents-intelligent-automation', '/services/crm-revenue-automation']);
blocks().find((block) => block.props.href === '/services/conversational-voice-ai').props.onFocus(); map.flush();
const voice = mapServices.find((item) => item.slug === 'conversational-voice-ai');
assert.deepEqual(snapshot(blocks().filter((block) => block.props['data-linked']).map((block) => block.props.href.slice(10))).sort(), snapshot(voice.related).sort());
assert.match(text(nodes(map.tree).find((node) => node.props?.['aria-live'] === 'polite')), /Conversational & Voice AI connects with/);
map.unmount();
pass('3D visualizations: every project technology maps to one ordered architecture layer; the service map exposes nine named service links, resolves every connection and raises highlighted or focused capabilities');

const visited = new Set();
function audit(file) {
  file = path.normalize(file); if (visited.has(file)) return; visited.add(file);
  assert.ok(!/(?:engineering-lab-stage|lx-character|mascot-engineer|hero-robot-arm|hero-service-art)\.[jt]sx?$/.test(file), 'Retired mascot/lab module is reachable: ' + file);
  const source = ts.createSourceFile(file, fs.readFileSync(path.join(root, file), 'utf8'), ts.ScriptTarget.Latest, true);
  function dependency(name) {
    assert.ok(!/^(?:three(?:\/|$)|@react-three\/)/.test(name) && !/(?:^|\/)three\//.test(name), 'Forbidden rendering dependency: ' + file + ' -> ' + name);
    if (!name.startsWith('.') && !name.startsWith('@/')) return;
    const next = resolveModule(file, name); assert.ok(next, 'Unresolved app import: ' + name);
    if (/\.[cm]?[jt]sx?$/.test(next)) audit(next);
  }
  function visit(node) {
    if (ts.isStringLiteralLike(node)) assert.doesNotMatch(node.text, /\bLX\b|lx-working-pose|lexvaxa_mascot|\/brand\/lx-source/, 'Retired mascot content is reachable: ' + file);
    if (ts.isImportDeclaration(node)) {
      const clause = node.importClause, bindings = clause?.namedBindings;
      const typeOnly = clause?.isTypeOnly || (!clause?.name && bindings && ts.isNamedImports(bindings) && bindings.elements.length > 0 && bindings.elements.every((item) => item.isTypeOnly));
      if (!typeOnly && ts.isStringLiteral(node.moduleSpecifier)) dependency(node.moduleSpecifier.text);
    }
    if (ts.isExportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      const typeOnly = node.isTypeOnly || (node.exportClause && ts.isNamedExports(node.exportClause) && node.exportClause.elements.length > 0 && node.exportClause.elements.every((item) => item.isTypeOnly));
      if (!typeOnly) dependency(node.moduleSpecifier.text);
    }
    if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(node.expression) && node.expression.text === 'require'))) {
      assert.ok(node.arguments[0] && ts.isStringLiteral(node.arguments[0]), 'Cannot audit computed module import: ' + file);
      dependency(node.arguments[0].text);
    }
    if (ts.isNewExpression(node)) assert.ok(!/WebGLRenderer/.test(node.expression.getText(source)), 'Live WebGL constructor: ' + file);
    if (ts.isCallExpression(node) && /getContext$/.test(node.expression.getText(source)) && node.arguments[0] && ts.isStringLiteral(node.arguments[0])) assert.ok(!/^webgl/.test(node.arguments[0].text));
    ts.forEachChild(node, visit);
  }
  visit(source);
}
for (const entry of ['app/page.tsx', 'app/layout.tsx', 'app/about/page.tsx', 'app/services/[slug]/page.tsx', 'app/work/page.tsx', 'app/work/[slug]/page.tsx', 'components/sections/hero.tsx', 'components/sections/capabilities.tsx', 'components/systems/service-story.tsx', 'components/systems/service-system-preview.tsx']) audit(entry);
assert.ok(visited.has(path.normalize('components/animations/animated-container.tsx')), 'The semantic test stub must not bypass the actual animation module import audit');
assert.ok(visited.has(path.normalize('components/animations/motion-features.ts')), 'The actual lazy motion feature import must remain audited');
for (const file of ['components/depth/live-scene.tsx', 'components/depth/service-icons.tsx', 'components/depth/tilt-surface.tsx']) assert.ok(visited.has(path.normalize(file)), 'The active service presentation must be covered by the no-WebGL import audit: ' + file);
for (const file of ['components/steel/steel-scene.tsx', 'components/steel/steel-scenes.tsx', 'components/steel/steel-parts.tsx', 'components/steel/steel-kit.tsx']) assert.ok(visited.has(path.normalize(file)), 'Mounted service equipment must be included in the active import audit: ' + file);
assert.ok(visited.has(path.normalize('lib/data/service-visuals.ts')), 'The operation storyboards must be part of the audited runtime graph');
for (const file of ['components/animations/brand-orbit.tsx', 'components/sections/about-preview.tsx', 'components/animations/about-founder-card.tsx', 'components/layout/footer.tsx']) assert.ok(visited.has(path.normalize(file)), 'About and footer modules must be included in the runtime import audit: ' + file);
pass('page/layout, hero, capabilities, service and project runtime imports exclude Three/WebGL, retired mascot content and lab modules (' + visited.size + ' modules)');
console.log(`Verified ${checks} hero component/clock/asset groups. Hook doubles do not verify browser rendering, visual fit, GPU behavior or field performance.`);
