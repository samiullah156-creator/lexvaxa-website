<!-- styled:v2 -->
<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:1d1726,50:167dfe,100:9533fa&height=180&section=header&text=Lexvaxa%20website&fontSize=46&fontColor=ffffff&fontAlignY=36&desc=Open-source%20project&descAlignY=58&descSize=16&animation=fadeIn" width="100%" alt="Lexvaxa website" />

**The public Lexvaxa website: services, industries, portfolio, insights, careers and contact.**


<p>
  <a href="#project-structure">Project structure</a> ·
  <a href="#getting-started">Getting started</a>
</p>

</div>

---

Built with Next.js 16 (App Router), React 19 and TypeScript, deployed on Vercel as `lexvaxa-site`.

Static copy lives in this repository. Team members, projects, testimonials and site settings come from the
CMS (`../lexvaxa-backend`) and are cached with incremental static regeneration; the CMS calls
`/api/revalidate` after each change so updates appear within seconds.

## Getting started

Requires Node.js 20.9 or newer.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Start the CMS first (`cd ../lexvaxa-backend && npm run dev`) so CMS-driven sections have data.

### Environment variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin used in metadata, sitemap and JSON-LD |
| `CMS_URL` | CMS address used on the server for content |
| `NEXT_PUBLIC_CMS_URL` | CMS address used in the browser (forms, uploads) |
| `REVALIDATE_SECRET` | Shared secret for `/api/revalidate`; same value as in the CMS |
| `SITE_NOINDEX` | Set to `true` on preview deployments to block indexing |
| `GOOGLE_SITE_VERIFICATION`, `BING_SITE_VERIFICATION` | Search console verification tokens (optional) |

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server |
| `npm run typecheck` | TypeScript check |
| `npm run verify:source` | Source and design rules: assets, styles, stale links |
| `npm run verify:global` | Cross-page relationships: services, industries, projects, insights |
| `npm run verify:seo` | Metadata, canonical URLs, sitemap and structured data |
| `npm run verify:hero`, `verify:animation` | Hero and motion component contracts |
| `npm run verify:routes` | HTTP audit of every sitemap page against a running build |

For the route audit, run `npm start -- --port 3101` in one terminal and `npm run verify:routes` in another
(set `BASE_URL` to audit a different origin).

## Project structure

```text
app/                 Routes, one folder per URL segment; sitemap.ts, robots.ts, llms.txt, manifest.ts
  api/revalidate/    Cache revalidation webhook called by the CMS
components/
  layout/            Header, footer, mega menu, mobile navigation
  sections/          Page sections (hero, projects, testimonials, team, ...)
  content/           Articles, FAQs, related links, JSON-LD
  forms/             Contact, booking and career application forms
  animations/ depth/ steel/ systems/   Visual and motion components
  ui.tsx             Shared primitives
lib/
  data/              Services, industries, insights and other structured copy
  cms.ts             CMS client with tagged caching
  seo.ts, site.ts    Metadata helpers and company details
  legacy-redirects.ts  301/308 redirects from the previous site's URLs
public/              Images, logos and media
scripts/             Verification scripts
```

## Conventions

- Server components by default; client components only where interaction or motion needs them.
- Every animation respects `prefers-reduced-motion`.
- Page metadata is built with the helpers in `lib/seo.ts`; service, industry, project and insight pages enter `app/sitemap.ts` from their data, while new static pages are added there by hand. The sitemap and `llms.txt` rebuild every 5 minutes (`revalidate = 300`), so CMS content appears without a redeploy.
- Icons are lucide-react SVGs, never text characters such as → ↗ ✓ (`<ArrowRight size="1em" className="inline-icon" aria-hidden="true" />`).
- Run `npm run typecheck` and the `verify:*` scripts before pushing. CI runs them on every push.

---

<div align="center">

**Built by [Ch Muhammad Samiullah](https://github.com/samiullah156-creator)** · AI Automation Engineer and Full-Stack Developer at [Lexvaxa](https://lexvaxa.com)

<a href="https://github.com/samiullah156-creator"><img src="https://img.shields.io/badge/More%20projects-181717?style=for-the-badge&logo=github&logoColor=white" alt="More projects" /></a>
<a href="https://lexvaxa.com/contact"><img src="https://img.shields.io/badge/Work%20with%20me-167dfe?style=for-the-badge&logo=googlecalendar&logoColor=white" alt="Work with me" /></a>
<a href="https://www.linkedin.com/in/sami-lexvaxa/"><img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn" /></a>

<sub>⭐ Star this repo if you found it useful</sub>

</div>

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:9533fa,50:167dfe,100:1d1726&height=110&section=footer" width="100%" alt="" />
