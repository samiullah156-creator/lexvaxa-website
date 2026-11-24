import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const root = path.resolve(import.meta.dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const textPresent = (value) => typeof value === 'string' && value.trim().length > 0;

/** Read only static data literals; do not execute content modules or derived exports. */
function readData(file, variable) {
  const source = ts.createSourceFile(file, read(file), ts.ScriptTarget.Latest, true);
  const declaration = source.statements.filter(ts.isVariableStatement).flatMap((statement) => statement.declarationList.declarations).find((item) => item.name.getText(source) === variable);
  if (!declaration?.initializer) throw new Error(file + ': missing ' + variable + ' data export');
  function literal(node) {
    if (ts.isStringLiteralLike(node)) return node.text;
    if (ts.isNumericLiteral(node)) return Number(node.text);
    if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
    if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
    if (node.kind === ts.SyntaxKind.NullKeyword) return null;
    if (ts.isAsExpression(node) || ts.isSatisfiesExpression(node) || ts.isParenthesizedExpression(node)) return literal(node.expression);
    if (ts.isArrayLiteralExpression(node)) return node.elements.map(literal);
    if (ts.isObjectLiteralExpression(node)) return Object.fromEntries(node.properties.map((property) => {
      if (!ts.isPropertyAssignment(property) || !property.name || ts.isComputedPropertyName(property.name)) throw new Error(file + ': expected a static property in ' + variable);
      const key = ts.isIdentifier(property.name) || ts.isStringLiteralLike(property.name) ? property.name.text : property.name.getText(source);
      return [key, literal(property.initializer)];
    }));
    throw new Error(file + ': ' + variable + ' must contain static literals for the relationship audit');
  }
  return literal(declaration.initializer);
}

export function validateRelationships({ services, industries, articles, serviceExtensions, serviceSeo }) {
  const problems = [];
  function slugSet(items, expected, label) {
    if (!Array.isArray(items)) { problems.push(label + ': expected an array'); return new Set(); }
    if (items.length !== expected) problems.push(label + ': expected ' + expected + ' entries, found ' + items.length);
    const slugs = items.map((item) => item?.slug);
    for (const slug of slugs) if (!textPresent(slug)) problems.push(label + ': missing slug');
    if (new Set(slugs).size !== slugs.length) problems.push(label + ': duplicate slug');
    return new Set(slugs.filter(textPresent));
  }

  const serviceSlugs = slugSet(services, 9, 'services');
  slugSet(industries, 10, 'industries');
  const articleSlugs = slugSet(articles, 6, 'articles');
  function references(values, label) {
    if (!Array.isArray(values) || values.length === 0) { problems.push(label + ': expected service references'); return; }
    if (new Set(values).size !== values.length) problems.push(label + ': duplicate service reference');
    for (const slug of values) if (!serviceSlugs.has(slug)) problems.push(label + ': unknown service ' + slug);
  }
  function exactServiceKeys(record, label) {
    const keys = Object.keys(record ?? {});
    for (const slug of serviceSlugs) if (!Object.hasOwn(record ?? {}, slug)) problems.push(label + ': missing ' + slug);
    for (const slug of keys) if (!serviceSlugs.has(slug)) problems.push(label + ': unknown service key ' + slug);
  }

  exactServiceKeys(serviceExtensions, 'serviceExtensions');
  exactServiceKeys(serviceSeo, 'serviceSeo');
  for (const [slug, extension] of Object.entries(serviceExtensions ?? {})) {
    references(extension.related, 'serviceExtensions.' + slug + '.related');
    if (!Array.isArray(extension.useCases) || extension.useCases.length === 0) problems.push('serviceExtensions.' + slug + ': missing use cases');
    else if (extension.useCases.some((entry) => !textPresent(entry.name) || !textPresent(entry.detail))) problems.push('serviceExtensions.' + slug + ': incomplete use case');
    if (!textPresent(extension.request)) problems.push('serviceExtensions.' + slug + ': missing enquiry request');
  }
  for (const [slug, metadata] of Object.entries(serviceSeo ?? {})) {
    if (!textPresent(metadata.title) || !textPresent(metadata.description)) problems.push('serviceSeo.' + slug + ': incomplete metadata');
    if (metadata.guide) {
      const href = metadata.guide.href;
      const articleSlug = typeof href === 'string' && href.startsWith('/insights/') ? href.slice('/insights/'.length).split(/[?#]/)[0] : null;
      if (!articleSlugs.has(articleSlug)) problems.push('serviceSeo.' + slug + ': unknown guide ' + href);
    }
  }
  for (const industry of industries ?? []) references(industry.related, 'industries.' + industry.slug + '.related');
  for (const article of articles ?? []) {
    references(article.relatedServices, 'articles.' + article.slug + '.relatedServices');
    const ctaSlug = article.serviceCta?.serviceSlug;
    if (!serviceSlugs.has(ctaSlug)) problems.push('articles.' + article.slug + ': unknown service CTA ' + ctaSlug);
    else if (!article.relatedServices?.includes(ctaSlug)) problems.push('articles.' + article.slug + ': CTA service is missing from relatedServices');
  }
  return problems;
}

const problems = [];
let data;
try {
  data = Object.fromEntries([
    ['services', 'lib/data/services.ts'],
    ['industries', 'lib/data/industries.ts'],
    ['articles', 'lib/data/articles.ts'],
    ['serviceExtensions', 'lib/data/service-extensions.ts'],
    ['serviceSeo', 'lib/data/service-seo.ts'],
  ].map(([variable, file]) => [variable, readData(file, variable)]));
  problems.push(...validateRelationships(data));
  // Exercise rejection paths as well as the current positive manifest, so a
  // relaxed technology count cannot accidentally weaken unrelated guards.
  const negativeCases = [
    ['missing extension coverage', (fixture) => { delete fixture.serviceExtensions[fixture.services[0].slug]; }, /serviceExtensions: missing/],
    ['unknown industry relation', (fixture) => { fixture.industries[0].related.push('not-a-service'); }, /industries\..*: unknown service/],
    ['unknown article CTA', (fixture) => { fixture.articles[0].serviceCta.serviceSlug = 'not-a-service'; }, /unknown service CTA/],
  ];
  for (const [label, mutate, expected] of negativeCases) {
    const fixture = structuredClone(data); mutate(fixture);
    if (!validateRelationships(fixture).some((problem) => expected.test(problem))) problems.push('Relationship rejection guard failed: ' + label);
  }
} catch (error) {
  problems.push(error.message);
}
for (const file of ['app/page.tsx', 'app/contact/page.tsx', 'app/work/page.tsx', 'app/work/[slug]/page.tsx', 'components/forms/project-enquiry-form.tsx', 'app/sitemap.ts', 'app/robots.ts', 'public/brand/lexvaxa-logo.svg']) {
  if (!fs.existsSync(path.join(root, file))) problems.push('Missing ' + file);
}
if (fs.existsSync(path.join(root, 'app/contact/page.tsx')) && !read('app/contact/page.tsx').includes('ProjectEnquiryForm')) problems.push('Contact form is not mounted');
if (fs.existsSync(path.join(root, 'components/forms/project-enquiry-form.tsx')) && !read('components/forms/project-enquiry-form.tsx').includes('mailto:')) problems.push('Enquiry composer has no mailto action');

if (data) console.log('Checked ' + data.services.length + ' services, ' + data.industries.length + ' industries, ' + data.articles.length + ' guides; related services, metadata and CTA/guide targets. Projects are validated by the CMS.');
if (problems.length) {
  console.error(problems.join('\n'));
  process.exitCode = 1;
} else {
  console.log('PASS: content coverage and relationships are consistent.');
}

