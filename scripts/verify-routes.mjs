/* Validate rendered HTTP output. Run against a built site with BASE_URL=http://127.0.0.1:3101. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

// Read the actual local content modules so HTTP coverage cannot silently omit
// a project or footer destination. Site identity is evaluated with isolated
// default environment values; canonical origins are checked against the sitemap.
function readContentModule(relativePath) {
  const file = path.resolve(import.meta.dirname, '..', relativePath), exports = {};
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    fileName: file, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  new Function('exports', 'require', 'URL', 'process', code)(exports,
    (name) => { throw new Error('Unexpected content-module import: ' + name); }, URL, { env: {} });
  return exports;
}
// Projects live in the CMS: read the same published list (admin order) the site renders from.
const cmsBase = (process.env.CMS_URL || process.env.NEXT_PUBLIC_CMS_URL || 'http://127.0.0.1:4100').replace(/\/$/, '');
const cmsResponse = await fetch(cmsBase + '/api/public/projects');
assert.ok(cmsResponse.ok, 'The HTTP audit needs the CMS project list at ' + cmsBase);
const cmsBody = await cmsResponse.json();
const projects = (Array.isArray(cmsBody) ? cmsBody : cmsBody.items).map((project) => ({ ...project, liveUrl: project.liveUrl || undefined }));
const featuredProjects = projects.filter((project) => project.featured);
const { services } = readContentModule('lib/data/services.ts');
const { industries } = readContentModule('lib/data/industries.ts');
const { SITE, NAV, LEGAL_NAV } = readContentModule('lib/site.ts');
assert.equal(services.length, 9); assert.equal(industries.length, 10); assert.equal(NAV.length, 6); assert.equal(LEGAL_NAV.length, 5);
assert.equal(SITE.founder.name, 'Sami Chaudhary'); assert.equal(SITE.founder.role, 'Founder & CEO'); assert.equal(SITE.location, 'Lahore, Pakistan');
assert.equal(SITE.email, 'info@lexvaxa.com'); assert.equal(SITE.phone, '+92 326 0879156');
assert.equal(SITE.whatsappUrl, 'https://wa.me/923260879156');
assert.equal(SITE.socials.linkedin, 'https://www.linkedin.com/in/lexvaxa-solutions-6294683ab/');
assert.equal(SITE.socials.instagram, 'https://www.instagram.com/lexvaxa/');
assert.ok(Array.isArray(projects) && projects.length > 0, 'The HTTP audit needs the actual project manifest');
const projectsByPath = new Map(projects.map((project) => ['/work/' + project.slug, project]));
const suppliedLiveUrls = new Map([
  ['saff-hospital-management', 'https://saff-hospital-managment-system-qhnq.vercel.app/'],
  ['wealthy-fitness', 'https://wealthy-fitness.vercel.app/'],
  ['learning-hub', 'https://thelearninghub.vercel.app/'],
  ['genaix', 'https://genaix.vercel.app/'],
]);
for (const project of projects) if (suppliedLiveUrls.has(project.slug)) assert.equal(project.liveUrl, suppliedLiveUrls.get(project.slug), 'Changed live-reference URL: ' + project.slug);

const base = new URL(process.env.BASE_URL || 'http://127.0.0.1:3101');
const failures = [];
const assetPaths = new Set();
const internalLinks = new Set();
const titles = new Map();
const descriptions = new Map();
const documents = new Map();
const decode = (value) => value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const attributes = (tag) => Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*"([^"]*)"/g)].map((match) => [match[1], decode(match[2])]));
const tags = (html, tag) => [...html.matchAll(new RegExp(`<${tag}\\b[^>]*>`, 'gi'))].map((match) => attributes(match[0]));
const text = (value) => decode(value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());
const blocks = (html, tag) => [...html.matchAll(new RegExp(`<${tag}\\b([^>]*)>([\\s\\S]*?)<\\/${tag}>`, 'gi'))]
  .map((match) => ({ attributes: attributes(match[1]), html: match[2] }));
const accessibleText = (html) => text(html.replace(/<([a-z][\w:-]*)\b(?=[^>]*\baria-hidden="true")[^>]*>[\s\S]*?<\/\1>/gi, ''));
const anchorName = (anchor) => anchor.attributes['aria-label'] || accessibleText(anchor.html);
function checkLiveLinks(anchors, project, context) {
  const liveLinks = anchors.filter((anchor) => /\blive demo\b/i.test(anchorName(anchor)));
  assert.deepEqual(liveLinks.map((anchor) => anchor.attributes.href), project.liveUrl ? [project.liveUrl] : [], `${context}: exact supplied live demo link without an invented deployment`);
  for (const anchor of liveLinks) {
    assert.equal(anchor.attributes.target, '_blank', `${context}: live demo must open in a new tab`);
    const rel = new Set((anchor.attributes.rel || '').split(/\s+/));
    assert.ok(rel.has('noopener') && rel.has('noreferrer'), `${context}: external live demo needs noopener noreferrer`);
    assert.match(anchorName(anchor), /opens in a new tab/i, `${context}: live demo accessible name must announce the new tab`);
  }
}

function checkSafeExternal(anchor, context) {
  const url = new URL(anchor.attributes.href);
  assert.equal(url.protocol, 'https:', `${context}: use the actual HTTPS public destination`);
  assert.ok(!url.username && !url.password, `${context}: outbound links must not contain credentials`);
  assert.equal(anchor.attributes.target, '_blank', `${context}: expected a native new-tab link`);
  const rel = new Set((anchor.attributes.rel || '').split(/\s+/));
  assert.ok(rel.has('noopener') && rel.has('noreferrer'), `${context}: external links require noopener noreferrer`);
  assert.match(anchorName(anchor), /opens in a new tab/i, `${context}: the accessible name must announce the new tab`);
}

function checkFooter(markup, pathname) {
  const footers = blocks(markup, 'footer');
  assert.equal(footers.length, 1, `${pathname}: one shared native footer`);
  const footer = footers[0], allRoles = [...markup.matchAll(/<[a-z][\w:-]*\b[^>]*>/gi)].map((match) => attributes(match[0]));
  assert.equal(allRoles.filter((entry) => entry.role === 'contentinfo').length, 1, `${pathname}: one contentinfo landmark`);
  assert.equal(footer.attributes.role, 'contentinfo'); assert.equal(footer.attributes['aria-label'], 'Lexvaxa footer');
  assert.equal(footer.attributes.id, 'site-footer', `${pathname}: working shared footer preview anchor`);
  const navs = blocks(footer.html, 'nav');
  const groups = [
    ['footer-services-title', services.map((service) => ({ href: '/services/' + service.slug, label: service.shortName }))],
    ['footer-company-title', [
      { href: '/about', label: 'About us' }, { href: '/work', label: 'Our work' },
      { href: '/industries', label: 'Industries' }, { href: '/insights', label: 'Insights' }, { href: '/careers', label: 'Careers' }, { href: '/contact', label: 'Contact' },
    ]],
  ];
  for (const [id, expected] of groups) {
    const matches = navs.filter((nav) => nav.attributes['aria-labelledby'] === id);
    assert.equal(matches.length, 1, `${pathname}: missing named footer navigation ${id}`);
    assert.ok(tags(matches[0].html, 'h3').some((heading) => heading.id === id), `${pathname}: footer navigation name must resolve to a native heading`);
    const links = blocks(matches[0].html, 'a');
    assert.deepEqual(links.map((anchor) => ({ href: anchor.attributes.href, label: accessibleText(anchor.html) })), expected,
      `${pathname}: footer ${id} must retain every named canonical destination`);
    if (id === 'footer-services-title') assert.deepEqual(links.map((anchor) => anchor.attributes['aria-label']), services.map((service) => service.name.includes(service.shortName) ? service.name : `${service.shortName}: ${service.name}`), `${pathname}: service names preserve the visible label and canonical meaning for assistive technology`);
  }
  assert.equal(navs.some((nav) => nav.attributes['aria-labelledby'] === 'footer-industries-title'), false, `${pathname}: industries remain connected through the compact company index link`);
  assert.equal(tags(footer.html, 'details').length + tags(footer.html, 'summary').length, 0, `${pathname}: footer navigation must be visible without expanding directories`);
  assert.ok(tags(footer.html, 'h3').some((heading) => heading.id === 'footer-contact-title'), `${pathname}: native Contact heading`);
  const legal = navs.filter((nav) => nav.attributes['aria-label'] === 'Legal and policies');
  assert.equal(legal.length, 1, `${pathname}: legal navigation landmark`);
  assert.deepEqual(blocks(legal[0].html, 'a').map((anchor) => ({ href: anchor.attributes.href, label: accessibleText(anchor.html) })), LEGAL_NAV, `${pathname}: all five canonical policy pages`);
  const logo = tags(footer.html, 'img').filter((image) => image.src === '/brand/lexvaxa-logo-white.svg');
  assert.equal(logo.length, 1, `${pathname}: official white brand logo`);
  assert.equal(logo[0].width, '212'); assert.equal(logo[0].height, '55'); assert.ok(logo[0].alt?.includes(SITE.name) && logo[0].alt.includes(SITE.tagline));
  const addresses = blocks(footer.html, 'address'); assert.equal(addresses.length, 1, `${pathname}: semantic contact details`);
  const contacts = blocks(addresses[0].html, 'a');
  assert.ok(contacts.some((anchor) => anchor.attributes.href === 'mailto:' + SITE.email && accessibleText(anchor.html).includes(SITE.email)), `${pathname}: public email link`);
  assert.ok(contacts.some((anchor) => anchor.attributes.href === 'tel:' + SITE.phone.replace(/[^\d+]/g, '') && accessibleText(anchor.html).includes(SITE.phone)), `${pathname}: public telephone link`);
  const socials = blocks(footer.html, 'ul').filter((list) => list.attributes['aria-label'] === 'Lexvaxa social profiles');
  assert.equal(socials.length, 1, `${pathname}: named company social profiles`);
  const socialLinks = blocks(socials[0].html, 'a'), expectedSocials = [
    ['LinkedIn', SITE.socials.linkedin], ['X', SITE.socials.x], ['YouTube', SITE.socials.youtube], ['Instagram', SITE.socials.instagram],
  ];
  assert.deepEqual(socialLinks.map((anchor) => anchor.attributes.href), expectedSocials.map(([, href]) => href), `${pathname}: four actual company social profiles`);
  socialLinks.forEach((anchor, index) => assert.equal(anchorName(anchor), `${SITE.name} on ${expectedSocials[index][0]} (opens in a new tab)`));
  const external = blocks(footer.html, 'a').filter((anchor) => /^https?:\/\//.test(anchor.attributes.href || ''));
  assert.deepEqual(external.map((anchor) => anchor.attributes.href).sort(), [SITE.whatsappUrl, ...expectedSocials.map(([, href]) => href)].sort(), `${pathname}: five exact company contact/social links`);
  external.forEach((anchor) => checkSafeExternal(anchor, pathname + ' footer'));
  assert.doesNotMatch(accessibleText(footer.html), /\bled\s+by\b/i, `${pathname}: footer must not include personal attribution`);
  assert.ok(!accessibleText(footer.html).toLowerCase().includes(SITE.founder.name.toLowerCase()), `${pathname}: founder information belongs on About, outside the company footer`);
  assert.ok(!blocks(footer.html, 'a').some((anchor) => [SITE.founder.linkedin, SITE.socials.founderLinkedin].includes(anchor.attributes.href)), `${pathname}: footer must not link to the founder’s personal profile`);
  assert.ok(blocks(footer.html, 'a').some((anchor) => anchor.attributes.href === '/contact'), `${pathname}: connected project enquiry link`);
  assert.equal(tags(footer.html, 'form').length, 0, `${pathname}: no unconnected newsletter form`);
  assert.equal(tags(footer.html, 'input').length, 0, `${pathname}: no email collection without a connected workflow`);
  assert.doesNotMatch(accessibleText(footer.html), /\bDDaaS\b|(?:you(?:’|')re|successfully) subscribed/i, `${pathname}: no invented product or subscription-success claim`);
}

function checkBrandOrbit(markup, id, pathname) {
  const figures = blocks(markup, 'figure').filter((figure) => figure.attributes.id === id);
  assert.equal(figures.length, 1, `${pathname}: one complete brand orbit illustration`);
  const figure = figures[0], ids = [...markup.matchAll(/\bid="([^"]+)"/g)].map((match) => decode(match[1]));
  assert.equal(new Set(ids).size, ids.length, `${pathname}: accessible figure IDs must not collide with page content`);
  assert.equal(figure.attributes['aria-labelledby'], id + '-title'); assert.equal(figure.attributes['aria-describedby'], id + '-description');
  for (const suffix of ['title', 'description', 'canvas']) assert.equal(ids.filter((value) => value === id + '-' + suffix).length, 1, `${pathname}: scoped orbital ${suffix} ID`);
  assert.equal(figure.attributes['data-enhanced'], 'false'); assert.equal(figure.attributes['data-reduced'], 'true'); assert.equal(figure.attributes['data-running'], 'false');
  const svg = blocks(figure.html, 'svg').find((vector) => vector.attributes.id === id + '-canvas');
  assert.ok(svg, `${pathname}: native orbital SVG is present before JavaScript`);
  assert.equal(svg.attributes.viewBox, '0 0 560 430'); assert.equal(svg.attributes['aria-hidden'], 'true'); assert.equal(svg.attributes.focusable, 'false');
  assert.deepEqual(tags(svg.html, 'g').filter((group) => group['data-orbit']).map((group) => group['data-orbit']), ['data', 'software', 'ai']);
  assert.ok(blocks(svg.html, 'text').some((label) => accessibleText(label.html) === 'Workflow'), `${pathname}: central Workflow label`);
  const legend = blocks(figure.html, 'ul').filter((list) => list.attributes['aria-label'] === 'Connected disciplines');
  assert.equal(legend.length, 1); assert.deepEqual(blocks(legend[0].html, 'li').map((item) => accessibleText(item.html)), ['Data', 'Software', 'AI']);
  const button = blocks(figure.html, 'button').find((control) => control.attributes['aria-label'] === 'Pause orbital animation');
  assert.ok(button); assert.equal(button.attributes.type, 'button'); assert.equal(button.attributes['aria-controls'], id + '-canvas');
  assert.equal(button.attributes['aria-pressed'], 'false'); assert.ok('hidden' in button.attributes, `${pathname}: a nonfunctional SSR pause control must stay hidden`);
  assert.equal(tags(svg.html, 'image').length + tags(svg.html, 'filter').length + tags(svg.html, 'foreignObject').length, 0, `${pathname}: native sharp vector illustration`);
}

function checkAbout(markup, schemas, canonical) {
  const main = blocks(markup, 'main'); assert.equal(main.length, 1);
  const content = main[0].html;
  assert.match(text(blocks(content, 'h1')[0]?.html || ''), /Engineering with Intelligence\./);
  assert.ok(accessibleText(content).includes(SITE.founder.name) && accessibleText(content).includes(SITE.founder.role) && accessibleText(content).includes(SITE.location), '/about: published founder, role and location');
  assert.ok(schemas.some((schema) => schema['@type'] === 'AboutPage' && schema.url === canonical), '/about: canonical AboutPage schema');
  const facts = blocks(content, 'dl').find((list) => text(list.html).includes('Engineering focus'));
  assert.ok(facts, '/about: native company facts definition list');
  assert.equal(blocks(facts.html, 'dt').length, 3); assert.equal(blocks(facts.html, 'dd').length, 3);
  const nav = blocks(content, 'nav').filter((entry) => entry.attributes['aria-label'] === 'About page sections');
  assert.equal(nav.length, 1);
  const expectedAnchors = ['about-purpose', 'about-capabilities', 'about-process', 'founder', 'about-collaboration'];
  assert.deepEqual(blocks(nav[0].html, 'a').map((link) => link.attributes.href), expectedAnchors.map((id) => '#' + id), '/about: five native section links');
  const pageIds = new Set([...content.matchAll(/\bid="([^"]+)"/g)].map((match) => decode(match[1])));
  for (const id of expectedAnchors) assert.ok(pageIds.has(id), '/about: section target ' + id);
  const founder = blocks(content, 'article').find((article) => article.attributes.id === 'founder');
  assert.ok(founder && accessibleText(founder.html).includes(SITE.founder.name), '/about: named founder article');
  const portrait = tags(founder.html, 'img'); assert.equal(portrait.length, 1);
  const imageUrl = new URL(portrait[0].src, base), imagePath = imageUrl.pathname === '/_next/image' ? imageUrl.searchParams.get('url') : imageUrl.pathname;
  assert.equal(imagePath, '/media/founder-sami.jpg'); assert.ok(portrait[0].alt.includes(SITE.founder.name));
  assert.equal(portrait[0].width, '256'); assert.equal(portrait[0].height, '256'); assert.equal(portrait[0].sizes, '(max-width: 520px) 88px, 120px', '/about: portrait metadata keeps the source/display crop distinction');
  const links = blocks(founder.html, 'a');
  assert.deepEqual(links.map((anchor) => anchor.attributes.href), [SITE.socials.founderLinkedin, SITE.whatsappUrl]);
  links.forEach((anchor) => checkSafeExternal(anchor, '/about founder'));
}

async function get(path) {
  const response = await fetch(new URL(path, base), { redirect: 'manual', signal: AbortSignal.timeout(45000) });
  return { response, body: await response.text() };
}

const { response: sitemapResponse, body: sitemap } = await get('/sitemap.xml');
assert.equal(sitemapResponse.status, 200, 'Sitemap must return 200');
const canonicalUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => decode(match[1]));
const minimumUrls = 33 + projects.length;
assert.ok(canonicalUrls.length >= minimumUrls, `Expected at least ${minimumUrls} public URLs; found ${canonicalUrls.length}. Check preview noindex settings if empty.`);
assert.equal(new Set(canonicalUrls).size, canonicalUrls.length, 'Duplicate sitemap URLs');
const siteOrigin = new URL(canonicalUrls[0]).origin;
for (const pathname of projectsByPath.keys()) assert.ok(canonicalUrls.includes(new URL(pathname, siteOrigin).toString()), 'Project missing from sitemap: ' + pathname);

for (const canonical of canonicalUrls) {
  const pathname = new URL(canonical).pathname;
  try {
    const { response, body } = await get(pathname);
    assert.equal(response.status, 200, `${pathname}: HTTP status`);
    assert.match(response.headers.get('content-type') || '', /text\/html/, `${pathname}: HTML response`);
    const markup = body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
    assert.equal((markup.match(/<h1\b/g) || []).length, 1, `${pathname}: one H1`);
    assert.equal((markup.match(/<main\b/g) || []).length, 1, `${pathname}: one main landmark`);
    checkFooter(markup, pathname);
    const head = body.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] || '';
    const title = text(head.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || '');
    assert.ok(title, `${pathname}: missing title`);
    assert.equal((title.match(/\| Lexvaxa/g) || []).length, 1, `${pathname}: one title brand suffix`);
    assert.ok(!titles.has(title), `${pathname}: title duplicates ${titles.get(title)}`);
    titles.set(title, pathname);
    const meta = tags(head, 'meta');
    const description = meta.find((entry) => entry.name === 'description')?.content;
    assert.ok(description, `${pathname}: missing description`);
    assert.ok(!descriptions.has(description), `${pathname}: duplicate description`);
    descriptions.set(description, pathname);
    const canonicals = tags(head, 'link').filter((entry) => entry.rel === 'canonical');
    assert.deepEqual(canonicals.map((entry) => new URL(entry.href).toString()), [canonical], `${pathname}: canonical mismatch`);
    assert.equal(new URL(meta.find((entry) => entry.property === 'og:url')?.content).toString(), canonical, `${pathname}: OG URL mismatch`);
    assert.ok(!meta.some((entry) => entry.name === 'robots' && /noindex/.test(entry.content)), `${pathname}: unexpectedly noindex`);
    const schemas = [...body.matchAll(/<script\b(?=[^>]*type="application\/ld\+json")[^>]*>([\s\S]*?)<\/script>/gi)].flatMap((match) => {
      const parsed = JSON.parse(match[1]);
      return Array.isArray(parsed) ? parsed : [parsed];
    });
    assert.ok(schemas.some((schema) => schema['@type'] === 'Organization'), `${pathname}: missing organization context`);
    if (pathname === '/' || pathname === '/about') checkBrandOrbit(markup, pathname === '/' ? 'home-about-orbit' : 'about-brand-orbit', pathname);
    if (pathname === '/about') checkAbout(markup, schemas, canonical);
    if (pathname.startsWith('/services/')) assert.ok(schemas.some((schema) => schema['@type'] === 'Service' && schema.url === canonical), `${pathname}: service schema mismatch`);
    if (pathname.startsWith('/insights/')) {
      assert.ok(schemas.some((schema) => schema['@type'] === 'Article' && schema.url === canonical), `${pathname}: article schema mismatch`);
      assert.equal(meta.find((entry) => entry.property === 'og:type')?.content, 'article', `${pathname}: article OG type`);
      // Built-in guides ship a 1200×675 PNG cover. Posts written in the admin panel share their
      // uploaded cover (any size) or fall back to the default card.
      const shareImage = meta.find((entry) => entry.property === 'og:image')?.content || '';
      const shareHeight = meta.find((entry) => entry.property === 'og:image:height')?.content;
      if (shareImage.includes('/images/blog/')) assert.equal(shareHeight, '675', `${pathname}: actual PNG height`);
      else assert.match(shareHeight || '', /^[1-9]\d{1,4}$/, `${pathname}: share image height`);
    }
    if (pathname.startsWith('/work/') && projectsByPath.has(pathname)) {
      const project = projectsByPath.get(pathname);
      assert.ok(project, `${pathname}: project route has no content record`);
      const creativeWork = schemas.find((schema) => schema['@type'] === 'CreativeWork' && schema.url === canonical);
      assert.ok(creativeWork, `${pathname}: CreativeWork schema mismatch`);
      assert.equal(creativeWork.name, project.name, `${pathname}: project schema identity`);
      assert.ok(creativeWork.description, `${pathname}: project schema description`);
      assert.ok(schemas.some((schema) => schema['@type'] === 'BreadcrumbList'
        && schema.itemListElement?.some((item) => item.item === canonical)), `${pathname}: missing project breadcrumb`);
      const expectedImage = new URL(project.image.src, siteOrigin).toString();
      assert.equal(meta.find((entry) => entry.property === 'og:image')?.content, expectedImage, `${pathname}: project OG image`);
      assert.equal(meta.find((entry) => entry.property === 'og:image:width')?.content, String(project.image.width), `${pathname}: project OG image width`);
      assert.equal(meta.find((entry) => entry.property === 'og:image:height')?.content, String(project.image.height), `${pathname}: project OG image height`);
      const pageLinks = tags(markup, 'a').map((link) => link.href && new URL(link.href, canonical));
      for (const slug of project.serviceSlugs) assert.ok(pageLinks.some((link) => link?.origin === siteOrigin && link.pathname === '/services/' + slug), `${pathname}: missing related service ${slug}`);
      const stackLists = blocks(markup, 'ul').filter((list) => list.attributes['aria-hidden'] !== 'true'
        && /\b(?:tech|technology) stack\b/i.test(list.attributes['aria-label'] || ''));
      assert.equal(stackLists.length, 1, `${pathname}: one semantic technology stack list`);
      assert.ok(stackLists[0].attributes['aria-label'].includes(project.name), `${pathname}: technology list must identify the project`);
      assert.deepEqual(blocks(stackLists[0].html, 'li').map((item) => accessibleText(item.html)), project.technologies, `${pathname}: every asserted technology must be present in the semantic list`);
      checkLiveLinks(blocks(markup, 'a'), project, pathname);
      const navigation = blocks(markup, 'nav').filter((nav) => nav.attributes['aria-label'] === 'Project navigation');
      assert.equal(navigation.length, 1, `${pathname}: missing project navigation landmark`);
      const navigationLinks = blocks(navigation[0].html, 'a');
      assert.ok(navigationLinks.some((link) => link.attributes.href === '/work' && /back to all projects/i.test(accessibleText(link.html))), `${pathname}: missing back-to-all-projects link`);
      const position = projects.findIndex((item) => item.slug === project.slug);
      const nextProject = projects[(position + 1) % projects.length];
      assert.ok(position >= 0 && nextProject, `${pathname}: project is absent from the shared navigation order`);
      assert.ok(navigationLinks.some((link) => /next project/i.test(accessibleText(link.html)) && link.attributes.href === '/work/' + nextProject.slug
        && accessibleText(link.html).includes(nextProject.name)), `${pathname}: next project must follow the admin's circular portfolio order`);
    }
    if (pathname === '/' || pathname === '/work') {
      // The homepage shows the featured projects, /work shows every published one, both in admin order.
      const expected = pathname === '/' ? featuredProjects : projects;
      const cards = blocks(markup, 'article').filter((card) => card.attributes['data-project']);
      assert.deepEqual(cards.map((card) => card.attributes['data-project']), expected.map((project) => project.slug), `${pathname}: every project card must keep the admin order in server-rendered HTML`);
      for (const [index, card] of cards.entries()) {
        const project = expected[index], cardLinks = blocks(card.html, 'a');
        assert.equal(cardLinks.length, tags(card.html, 'a').length, `${pathname}: project detail/live demo anchors must be siblings, never nested`);
        const detailLinks = cardLinks.filter((link) => link.attributes.href === '/work/' + project.slug);
        assert.equal(detailLinks.length, 1, `${pathname}: missing native project detail link for ${project.slug}`);
        assert.ok(anchorName(detailLinks[0]).includes(project.name), `${pathname}: project link must identify ${project.slug}`);
        // Homepage cards are compact (name + industry, one detail link); live demos stay on /work.
        if (pathname === '/work') checkLiveLinks(cardLinks, project, pathname + ' card ' + project.slug);
        assert.equal(cardLinks.length, pathname === '/work' && project.liveUrl ? 2 : 1, `${pathname}: project card actions must retain the detail link and only its supplied live demo`);
      }
      const pageAnchors = tags(markup, 'a');
      if (pathname === '/work') for (const liveUrl of suppliedLiveUrls.values()) assert.ok(pageAnchors.some((anchor) => anchor.href === liveUrl), `${pathname}: missing supplied outbound live-project URL ${liveUrl}`);
    }
    const ids = new Set([...markup.matchAll(/\bid="([^"]+)"/g)].map((match) => decode(match[1])));
    documents.set(pathname, ids);
    for (const link of tags(markup, 'a')) {
      if (!link.href || /^(mailto:|tel:|javascript:)/.test(link.href)) continue;
      const url = new URL(link.href, canonical);
      if (url.origin === siteOrigin) internalLinks.add(url.pathname + url.hash);
    }
    for (const image of tags(markup, 'img')) {
      assert.ok('alt' in image, `${pathname}: image missing alt`);
      if (image.src?.startsWith('/')) {
        const url = new URL(image.src, base);
        assetPaths.add(url.pathname === '/_next/image' ? url.searchParams.get('url') : url.pathname);
      }
    }
    const ogImage = meta.find((entry) => entry.property === 'og:image')?.content;
    if (ogImage && new URL(ogImage).origin === siteOrigin) assetPaths.add(new URL(ogImage).pathname);
  } catch (error) {
    failures.push(error.message);
  }
}

for (const link of internalLinks) {
  const url = new URL(link, base);
  const ids = documents.get(url.pathname);
  if (!ids) failures.push(`Internal link points outside the sitemap: ${link}`);
  else if (url.hash && !ids.has(decodeURIComponent(url.hash.slice(1)))) failures.push(`Broken anchor: ${link}`);
}
for (const asset of assetPaths) {
  if (!asset) continue;
  try {
    const response = await fetch(new URL(asset, base), { method: 'HEAD', signal: AbortSignal.timeout(15000) });
    assert.equal(response.status, 200, `Missing rendered asset: ${asset}`);
  } catch (error) { failures.push(error.message); }
}
const missingPaths = ['/not-a-real-page', '/services/not-a-real-service', '/industries/not-a-real-industry', '/insights/not-a-real-guide', '/work/not-a-real-project'];
for (const pathname of missingPaths) {
  const { response, body } = await get(pathname);
  if (response.status !== 404) failures.push(`${pathname}: expected 404, received ${response.status}`);
  if (!/name="robots" content="[^"]*noindex/.test(body)) failures.push(`${pathname}: missing noindex on 404`);
}
const { response: robotsResponse, body: robots } = await get('/robots.txt');
assert.equal(robotsResponse.status, 200);
assert.ok(robots.includes(`Sitemap: ${siteOrigin}/sitemap.xml`));
assert.ok(!/Disallow:\s*\/_next/.test(robots));

if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`PASS: ${canonicalUrls.length} rendered pages including ${projects.length} projects, shared-order portfolio cards, full semantic tech stacks, four exact safe live-demo links, circular project navigation, shared canonical footer/contact/social links, complete SSR brand orbits, About founder/facts/section anchors, unique titles/descriptions, canonical/OG/schema contracts, ${assetPaths.size} images, ${internalLinks.size} internal destinations, ${missingPaths.length} true 404s, robots and sitemap.`);
}
