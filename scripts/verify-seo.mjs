import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';

const root = path.resolve(import.meta.dirname, '..');
const nativeRequire = createRequire(import.meta.url);

// Execute the source helpers with isolated deployment settings; no server or build output required.
function sourceLoader(settings = {}) {
  // CMS_URL is cleared so these checks never depend on a running admin backend.
  const env = { ...process.env, NEXT_PUBLIC_SITE_URL: 'https://example.test/', VERCEL_ENV: 'production', SITE_NOINDEX: '', CMS_URL: '', ...settings };
  const cache = new Map();
  function load(file) {
    const filename = path.resolve(root, file);
    if (cache.has(filename)) return cache.get(filename).exports;
    const source = fs.readFileSync(filename, 'utf8');
    const { outputText } = ts.transpileModule(source, {
      fileName: filename,
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
    });
    const loaded = { exports: {} };
    cache.set(filename, loaded);
    const localRequire = (request) => {
      if (!request.startsWith('@/') && !request.startsWith('.')) return nativeRequire(request);
      const target = request.startsWith('@/') ? path.join(root, request.slice(2)) : path.resolve(path.dirname(filename), request);
      const resolved = [target, `${target}.ts`, `${target}.tsx`].find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
      assert.ok(resolved, `Cannot resolve ${request} from ${file}`);
      return load(resolved);
    };
    new Function('require', 'module', 'exports', 'process', 'URL', outputText)(localRequire, loaded, loaded.exports, { env }, URL);
    return loaded.exports;
  }
  return load;
}

const load = sourceLoader();
const { SITE, IS_PREVIEW } = load('lib/site.ts');
const { pageMetadata, organizationSchema, websiteSchema, articleSchema, breadcrumbs } = load('lib/seo.ts');
const { services } = load('lib/data/services.ts');
const { industries } = load('lib/data/industries.ts');
const { articles } = load('lib/data/articles.ts');
const { serviceSeo } = load('lib/data/service-seo.ts');

assert.equal(SITE.url, 'https://example.test');
assert.equal(IS_PREVIEW, false);
assert.throws(() => sourceLoader({ NEXT_PUBLIC_SITE_URL: 'ftp://example.test' })('lib/site.ts'), /HTTP or HTTPS/);

const metadata = pageMetadata({ title: 'Guide | Lexvaxa', description: 'A useful guide.', path: '/insights/guide?source=test#section' });
assert.equal(metadata.alternates.canonical, 'https://example.test/insights/guide');
assert.equal(metadata.title.absolute, 'Guide | Lexvaxa');
assert.equal(metadata.openGraph.title, metadata.title.absolute);
assert.equal(metadata.twitter.title, metadata.title.absolute);
assert.equal(metadata.openGraph.url, metadata.alternates.canonical);
assert.equal(metadata.openGraph.images[0].url, 'https://example.test/og-default.png');
const articleMetadata = pageMetadata({ title: 'Guide', description: 'Guide.', path: '/insights/guide', type: 'article', publishedTime: '2026-10-10T09:00:00Z', image: { url: '/cover.png', width: 1600, height: 900, alt: 'Guide cover' } });
assert.equal(articleMetadata.openGraph.type, 'article');
assert.equal(articleMetadata.openGraph.images[0].height, 900);
assert.equal(articleMetadata.openGraph.publishedTime, '2026-10-10T09:00:00Z');

const organization = organizationSchema();
assert.equal(websiteSchema().publisher['@id'], organization['@id']);
assert.equal(organization.url, pageMetadata({ title: 'Home', description: 'Home.', path: '/' }).alternates.canonical);
assert.equal(breadcrumbs([{ name: 'Home', url: '/' }]).itemListElement[0].item, organization.url);
assert.ok(!('aggregateRating' in organization) && !('award' in organization) && !('address' in organization));
const article = articles[0];
const schema = articleSchema({ title: article.title, description: article.summary, url: `/insights/${article.slug}`, image: article.cover.png, datePublished: article.publishedAt, dateModified: article.modifiedAt, author: article.author });
assert.equal(schema.publisher['@id'], organization['@id']);
assert.equal(schema.dateModified, article.modifiedAt);
assert.equal(schema.image, `https://example.test${article.cover.png}`);

const { JsonLd } = load('components/content/json-ld.tsx');
const dangerous = { name: '</script><script>alert(1)</script>\u2028\u2029' };
const json = JsonLd({ data: [dangerous] }).props.dangerouslySetInnerHTML.__html;
assert.ok(!/[<\u2028\u2029]/u.test(json), 'JSON-LD must not allow script termination or literal line separators');
assert.deepEqual(JSON.parse(json), [dangerous], 'Escaping must preserve the original JSON data');

const sitemap = await load('app/sitemap.ts').default();
const urls = sitemap.map((entry) => entry.url);
assert.equal(new Set(urls).size, urls.length, 'Sitemap URLs must be unique');
for (const [base, entries] of [['services', services], ['industries', industries], ['insights', articles]]) {
  for (const entry of entries) assert.ok(urls.includes(`${SITE.url}/${base}/${entry.slug}`), `Missing ${base}/${entry.slug}`);
}
// Deliberately noindexed development pages must remain outside the public sitemap.
// Inspect only an explicit exported metadata.robots.index=false literal; ordinary
// public routes still require sitemap coverage.
function explicitlyNoindexed(source) {
  const file = ts.createSourceFile('page.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const property = (object, key) => ts.isObjectLiteralExpression(object)
    ? object.properties.find((item) => ts.isPropertyAssignment(item) && (ts.isIdentifier(item.name) || ts.isStringLiteralLike(item.name)) && item.name.text === key)?.initializer
    : undefined;
  for (const statement of file.statements) {
    if (!ts.isVariableStatement(statement) || !statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || declaration.name.text !== 'metadata' || !declaration.initializer) continue;
      let value = declaration.initializer;
      while (ts.isSatisfiesExpression(value) || ts.isAsExpression(value) || ts.isParenthesizedExpression(value)) value = value.expression;
      const robots = property(value, 'robots');
      if (robots && property(robots, 'index')?.kind === ts.SyntaxKind.FalseKeyword) return true;
    }
  }
  return false;
}
assert.equal(explicitlyNoindexed('export const metadata = { robots: { index: false } };'), true);
assert.equal(explicitlyNoindexed('export const metadata = { robots: { index: true } };'), false);
assert.equal(explicitlyNoindexed('const metadata = { robots: { index: false } };'), false);
function checkStaticPages(directory, route = '') {
  const page = path.join(directory, 'page.tsx');
  if (fs.existsSync(page)) {
    const listed = urls.includes(new URL(route || '/', SITE.url).toString());
    if (explicitlyNoindexed(fs.readFileSync(page, 'utf8'))) assert.equal(listed, false, `Noindexed route must not be in sitemap: ${route}`);
    else assert.ok(listed, `Missing static route ${route || '/'}`);
  }
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && !entry.name.startsWith('[')) checkStaticPages(path.join(directory, entry.name), `${route}/${entry.name}`);
  }
}
checkStaticPages(path.join(root, 'app'));
for (const entry of sitemap) {
  const matchingArticle = articles.find((item) => entry.url === `${SITE.url}/insights/${item.slug}`);
  assert.equal(entry.lastModified, matchingArticle?.modifiedAt, 'Only recorded editorial revisions belong in lastModified');
}
for (const service of services) assert.ok(serviceSeo[service.slug]?.title && serviceSeo[service.slug]?.description, `Missing SEO copy for ${service.slug}`);

const robots = load('app/robots.ts').default();
assert.equal(robots.rules.userAgent, '*');
assert.equal(robots.rules.allow, '/');
assert.ok(!robots.rules.disallow.some((rule) => rule === '/' || rule.startsWith('/_next')), 'Public pages and rendering assets must remain crawlable');
assert.equal(robots.sitemap, `${SITE.url}/sitemap.xml`);
for (const settings of [{ VERCEL_ENV: 'preview' }, { VERCEL_ENV: 'development' }, { SITE_NOINDEX: 'true' }]) {
  const preview = sourceLoader(settings);
  assert.equal(preview('lib/site.ts').IS_PREVIEW, true);
  assert.equal(preview('app/robots.ts').default().rules.allow, '/', 'Crawlers need access to read noindex');
  assert.equal(preview('app/robots.ts').default().sitemap, undefined);
  assert.deepEqual(await preview('app/sitemap.ts').default(), []);
}
const layout = fs.readFileSync(path.join(root, 'app/layout.tsx'), 'utf8');
assert.match(layout, /index:\s*!IS_PREVIEW/);
assert.doesNotMatch(layout, /alternates:\s*\{\s*canonical:\s*['"]\/['"]/, 'A layout-level home canonical must not leak to child pages');
const manifest = load('app/manifest.ts').default();
assert.equal(manifest.description, SITE.description);
const icon = fs.readFileSync(path.join(root, 'app/icon.png'));
assert.equal(manifest.icons[0].sizes, `${icon.readUInt32BE(16)}x${icon.readUInt32BE(20)}`);

console.log(`PASS: ${urls.length} canonical sitemap URLs, nine service metadata entries, entity links, article dates, JSON-LD injection escaping, and production/preview crawler settings.`);
