/* Lightweight source/design audit. Uses the existing TypeScript devDependency. */
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const root = path.resolve(import.meta.dirname, '..');
const gradient = /\b(?:repeating-)?(?:linear|radial|conic)-gradient\s*\(/i;
const gradientAtStart = /^\s*(?:repeating-)?(?:linear|radial|conic)-gradient\s*\(/i;
const assetExtension = /\.(?:avif|gif|ico|jpe?g|png|svg|webp|glb|gltf|ktx2|hdr|exr)(?:[?#].*)?$/i;
const staleSlug = 'digital-marketing-performance-growth';
const relative = (file) => path.relative(root, file).replaceAll(path.sep, '/');

function assetProblem(value, file, exists) {
  if (!assetExtension.test(value) || !/^(?:\/(?!\/)|\.{1,2}\/)/.test(value)) return null;
  let asset;
  try { asset = decodeURIComponent(value.split(/[?#]/)[0]); }
  catch { return 'Malformed local asset path: ' + value; }
  const candidates = asset.startsWith('/')
    ? [path.join(root, 'public', asset.slice(1)), path.join(root, 'app', asset.slice(1))]
    : [path.resolve(path.dirname(file), asset)];
  return candidates.some(exists) ? null : 'Missing local image/model asset: ' + value;
}

function isStyleContext(node) {
  for (let parent = node.parent; parent; parent = parent.parent) {
    if (ts.isJsxAttribute(parent) && parent.name.getText() === 'style') return true;
    if (ts.isPropertyAssignment(parent) && /^(?:background|backgroundImage|borderImage|maskImage|css)$/i.test(parent.name.getText().replaceAll(/['"]/g, ''))) return true;
    if (ts.isJsxElement(parent) && parent.openingElement.tagName.getText() === 'style') return true;
    if (ts.isTaggedTemplateExpression(parent) && /^(?:css|styled)\b/.test(parent.tag.getText())) return true;
  }
  return false;
}

export function inspectTypeScript(file, text, exists = fs.existsSync) {
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const problems = source.parseDiagnostics.map((error) => relative(file) + ': ' + ts.flattenDiagnosticMessageText(error.messageText, '\n'));
  const add = (node, message) => {
    const line = source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;
    problems.push(relative(file) + ':' + line + ': ' + message);
  };

  function visit(node) {
    if ((ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) && node.tagName.getText(source) === 'main' && relative(file) !== 'app/layout.tsx') {
      add(node, 'Nested main landmark: app/layout.tsx already provides the page main.');
    }
    if (ts.isStringLiteralLike(node) || ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node)) {
      const value = node.text;
      // Match CSS functions in style contexts or literal gradient values, not prose mentioning gradients.
      if (gradient.test(value) && (isStyleContext(node) || gradientAtStart.test(value))) add(node, 'Forbidden CSS gradient function.');
      if (value.includes(staleSlug)) add(node, 'Stale service slug: use digital-marketing-growth.');
      if (ts.isStringLiteralLike(node)) {
        const problem = assetProblem(value, file, exists);
        if (problem) add(node, problem);
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  return problems;
}

export function inspectCss(file, text, exists = fs.existsSync) {
  const css = text.replace(/\/\*[\s\S]*?\*\//g, '');
  const problems = [];
  if (gradient.test(css)) problems.push(relative(file) + ': forbidden CSS gradient function.');
  for (const match of css.matchAll(/url\(\s*(?:"([^"]+)"|'([^']+)'|([^\s)]+))\s*\)/g)) {
    const problem = assetProblem(match[1] ?? match[2] ?? match[3], file, exists);
    if (problem) problems.push(relative(file) + ': ' + problem);
  }
  return problems;
}

const files = [];
function traverse(folder) {
  for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
    if (['node_modules', '.next', '.git'].includes(entry.name)) continue;
    const file = path.join(folder, entry.name);
    if (entry.isDirectory()) traverse(file);
    else if ((/\.tsx?$/.test(file) && !file.endsWith('.d.ts')) || file.endsWith('.css')) files.push(file);
  }
}
traverse(root);
const problems = files.flatMap((file) => file.endsWith('.css')
  ? inspectCss(file, fs.readFileSync(file, 'utf8'))
  : inspectTypeScript(file, fs.readFileSync(file, 'utf8')));

for (const [file, variable, expected] of [['lib/data/services.ts', 'services', 9], ['lib/data/industries.ts', 'industries', 10], ['lib/data/articles.ts', 'articles', 6]]) {
  const location = path.join(root, file);
  if (!fs.existsSync(location)) { problems.push('Missing ' + file); continue; }
  const source = ts.createSourceFile(location, fs.readFileSync(location, 'utf8'), ts.ScriptTarget.Latest, true);
  const declaration = source.statements.filter(ts.isVariableStatement).flatMap((statement) => statement.declarationList.declarations).find((item) => item.name.getText(source) === variable);
  let initializer = declaration?.initializer;
  while (initializer && (ts.isAsExpression(initializer) || ts.isSatisfiesExpression(initializer) || ts.isParenthesizedExpression(initializer))) initializer = initializer.expression;
  const actual = initializer && ts.isArrayLiteralExpression(initializer) ? initializer.elements.length : -1;
  if (actual !== expected) problems.push(file + ': expected ' + expected + ' entries, received ' + actual);
}
for (const file of ['app/sitemap.ts', 'app/robots.ts', 'app/icon.png', 'public/og-default.png', 'public/brand/lexvaxa-logo.svg']) {
  if (!fs.existsSync(path.join(root, file))) problems.push('Missing ' + file);
}
const robotsFile = path.join(root, 'app/robots.ts');
if (fs.existsSync(robotsFile) && fs.readFileSync(robotsFile, 'utf8').includes('/_next/')) problems.push('robots disallows Next.js rendering assets');

console.log('Checked ' + files.filter((file) => !file.endsWith('.css')).length + ' TS/TSX files and ' + files.filter((file) => file.endsWith('.css')).length + ' CSS files; nine services, ten industries, six guides, landmarks and literal assets.');
if (problems.length) {
  console.error(problems.join('\n'));
  process.exitCode = 1;
} else {
  console.log('PASS: source syntax, design constraints, landmarks and literal asset paths.');
}

