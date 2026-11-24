/* Real Motion SSR plus wrapper-policy checks; not a browser animation test. */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as motion from 'framer-motion';
import * as jsxRuntime from 'react/jsx-runtime';
import ts from 'typescript';

const root = path.resolve(import.meta.dirname, '..');
const file = 'components/animations/animated-container.tsx';
let reduced = false, received;
const tags = new Map();
const m = new Proxy({}, { get: (_, tag) => {
  if (!tags.has(tag)) tags.set(tag, (props) => {
    received = props;
    return React.createElement(motion.m[tag], props);
  });
  return tags.get(tag);
} });
const exports = {};
const require = (name) => {
  if (name === 'react') return React;
  if (name === 'react/jsx-runtime') return jsxRuntime;
  if (name === 'framer-motion') return { ...motion, m, useReducedMotion: () => reduced };
  if (name.endsWith('.css')) return { default: { root: 'animated-container' } };
  throw new Error('Unexpected import: ' + name);
};
const { outputText } = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
  fileName: file,
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
});
new vm.Script('(function(require,exports){' + outputText + '\n})', { filename: file })
  .runInNewContext({ console })(require, exports);
const { AnimatedContainer } = exports;
const render = (props) => renderToStaticMarkup(React.createElement(AnimatedContainer, props, 'Readable content'));
const equal = (value, expected) => assert.deepEqual(JSON.parse(JSON.stringify(value)), expected);

const article = render({ as: 'article', id: 'service', className: 'service-card', tapScale: .98, style: { color: 'navy' } });
assert.match(article, /^<article\b/);
assert.match(article, /id="service"/); assert.match(article, /class="animated-container service-card"/);
assert.match(article, /color:navy/); assert.match(article, /Readable content/);
assert.ok(!article.includes('tabindex=')); assert.equal(received.whileTap, undefined);
equal(received.initial, { opacity: 0, y: 20 });
equal(received.animate, { opacity: 1, y: 0, scale: 1 });
assert.equal(received.layout, false);
console.log('PASS: semantic article, native styles/attributes and mount entrance; articles do not become tap targets');

render({ as: 'section', trigger: 'viewport', once: true, amount: .25, stiffness: 320, damping: 30, delay: .12, layout: 'position' });
assert.equal(received.animate, undefined);
equal(received.whileInView, { opacity: 1, y: 0, scale: 1 });
equal(received.viewport, { once: true, amount: .25 });
assert.equal(received.layout, 'position');
assert.equal(received.transition.default.stiffness, 320); assert.equal(received.transition.default.damping, 30);
assert.equal(received.transition.default.delay, .12); assert.equal(received.transition.scale.delay, undefined);
console.log('PASS: viewport entrance, one-time threshold, configurable springs and optional layout projection');

const linkProps = { as: 'a', href: '/services', hoverScale: 1.02, tapScale: .98, 'aria-label': 'Explore services' };
const link = render(linkProps);
assert.match(link, /^<a\b/); assert.match(link, /href="\/services"/); assert.match(link, /tabindex="0"/);
equal(received.whileHover, { scale: 1.02 }); equal(received.whileFocus, { scale: 1.02 });
equal(received.whileTap, { scale: .98 });
const buttonProps = { as: 'button', type: 'button', hoverScale: 1.02, tapScale: .98 };
const button = render(buttonProps);
render({ ...buttonProps, tabIndex: -1 }); assert.equal(received.tabIndex, -1);
console.log('PASS: native link/button hover, keyboard-focus and tap feedback; explicit tabIndex is preserved');

reduced = true;
assert.equal(render(linkProps), link, 'Reduced-motion detection must not change SSR/first-client attributes');
assert.equal(render(buttonProps), button);
render({ ...buttonProps, layout: true, trigger: 'viewport' });
assert.equal(received.whileHover, undefined); assert.equal(received.whileFocus, undefined); assert.equal(received.whileTap, undefined);
assert.equal(received.layout, false); assert.equal(received.viewport, undefined);
equal(received.transition, { duration: 0 });
console.log('PASS: reduced motion disables transforms/gestures/layout without hydration attribute differences');

reduced = false;
render({ entrance: false }); assert.equal(received.initial, false); assert.equal(received.viewport, undefined);
const css = fs.readFileSync(path.join(root, 'components/animations/animated-container.module.css'), 'utf8');
assert.match(css, /scripting:\s*none/); assert.match(css, /prefers-reduced-motion:\s*reduce/);
assert.match(css, /opacity:\s*1\s*!important/); assert.match(css, /transform:\s*none\s*!important/);
console.log('PASS: immediately visible opt-out and CSS fallback for reduced motion/no scripting');

const pendingFeatures = css.match(/:global\(html:not\(\[data-motion-ready='true'\]\)\)\s+\.root\s*\{([^}]*)\}/)?.[1];
assert.ok(pendingFeatures, 'Content must remain visible until the actual feature module reports readiness');
assert.match(pendingFeatures, /opacity:\s*1\s*!important/);
assert.match(pendingFeatures, /transform:\s*none\s*!important/);
assert.match(article, /opacity:0/, 'The readiness fallback must preserve the real Motion entrance target');
const featureFile = 'components/animations/motion-features.ts';
const featureCode = ts.transpileModule(fs.readFileSync(path.join(root, featureFile), 'utf8'), {
  fileName: featureFile, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
function evaluateFeatures(globals = {}) {
  const featureExports = {};
  const featureRequire = (name) => { assert.equal(name, 'framer-motion'); return motion; };
  new vm.Script('(function(require,exports){' + featureCode + '\n})', { filename: featureFile })
    .runInNewContext(globals)(featureRequire, featureExports);
  assert.equal(featureExports.default, motion.domMax, 'Readiness must not replace or bypass the real feature bundle');
}
assert.doesNotThrow(() => evaluateFeatures(), 'The feature module must be safe when evaluated without a browser document');
const writes = [], dataset = new Proxy({ existing: 'preserved' }, {
  set(target, key, value) { writes.push([key, value]); target[key] = value; return true; },
});
evaluateFeatures({ document: { documentElement: { dataset } } });
assert.deepEqual(writes, [['motionReady', 'true']]); assert.equal(dataset.existing, 'preserved');
console.log('PASS: pending/failed feature loading leaves SSR visible; successful real features set one server-safe readiness token without changing entrance targets');
console.log('Verified AnimatedContainer SSR and configuration. Viewport detection, browser gestures and frame timing are not measured here.');
