import type { Metadata } from 'next';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { CallToAction, Eyebrow, Heading, Trail } from '@/components/ui';
import { allInsights } from '@/lib/data/insights';
import { services } from '@/lib/data/services';
import { breadcrumbs, collectionSchema, pageMetadata } from '@/lib/seo';
import { JsonLd } from '@/components/content/json-ld';
import { HubLinks } from '@/components/content/related-links';
import { InsightCover } from '@/components/content/insight-cover';
import { TiltSurface } from '@/components/depth/tilt-surface';

export const metadata: Metadata = pageMetadata({
  title: 'Insights: AI, Automation & Software Development Guides',
  description: 'Practical engineering guides on AI agents vs workflow automation, build vs buy software decisions, enterprise RAG, voice AI, CRM pipelines, and technical SEO.',
  path: '/insights',
});

const EDITORIAL = [
  ['Written by the people who build', 'Each article carries its author’s name and role. The advice comes from delivery work, not from a content calendar.'],
  ['Sources you can check', 'Guides link to the official documentation and research they rely on, so you can verify a claim before acting on it.'],
  ['Dated and revised', 'Every article shows when it was last updated. Tools change quickly; an old answer should look old.'],
] as const;

export default async function InsightsPage() {
  const insights = await allInsights();
  // How many articles cover each service, for the "browse by topic" links.
  const topics = services.map((service) => ({ service, count: insights.filter((insight) => insight.relatedServices.includes(service.slug)).length })).filter((topic) => topic.count > 0);

  return (
    <>
      <JsonLd data={[breadcrumbs([{ name: 'Home', url: '/' }, { name: 'Insights', url: '/insights' }]), collectionSchema({ name: 'Lexvaxa Insights', description: 'Engineering guides on AI, automation, software and search decisions.', path: '/insights', items: insights.map((insight) => ({ name: insight.title, url: `/insights/${insight.slug}` })) })]} />
      <header className="page-hero container">
        <Trail items={[{ label: 'Insights' }]} />
        <Eyebrow>Insights</Eyebrow>
        <h1>
          Guides for better<br />
          <span className="blue-text">technology decisions.</span>
        </h1>
        <p>
          Clear engineering guides, architectural frameworks, and automation strategies written for business owners and technical leaders.
        </p>
      </header>

      <section className="section container" aria-label="All articles">
        <div className="insights-grid">
          {insights.map((insight, index) => (
            <TiltSurface key={insight.slug} lift max={4} className="tilt-cell"><Link href={`/insights/${insight.slug}`} className="insight-card">
              <div className="insight-cover-wrap">
                <InsightCover cover={insight.cover} label={insight.category} className="insight-cover-img" priority={index < 2}
                  sizes="(max-width: 700px) calc(100vw - 40px), (max-width: 1100px) 46vw, 380px" />
              </div>
              <div className="insight-card-body">
                <p className="insight-meta">
                  <span className="insight-category-pill">{insight.category}</span>
                  <span className="insight-dot">·</span>
                  <span>{insight.readingTime}</span>
                </p>
                <h2>{insight.title}</h2>
                <p className="insight-summary">{insight.summary}</p>
                <span className="card-link">
                  {insight.cover?.kind === 'guide' ? 'Read guide' : 'Read article'} <ArrowRight size="1em" className="inline-icon" aria-hidden="true" />
                </span>
              </div>
            </Link></TiltSurface>
          ))}
        </div>
      </section>

      <section className="section section-soft" aria-labelledby="topics-title"><div className="container">
        <Heading id="topics-title" eyebrow="Browse by topic" title="Insights by service." description="Each guide links to the service it supports." />
        <ul className="topic-list">
          {topics.map(({ service, count }) => <li key={service.slug}><Link href={`/services/${service.slug}`}>
            <b>{service.shortName}</b><span>{count} {count === 1 ? 'article' : 'articles'}</span><i aria-hidden="true"><ArrowUpRight size="1em" className="inline-icon" aria-hidden="true" /></i>
          </Link></li>)}
        </ul>
      </div></section>

      <section className="section container" aria-labelledby="editorial-title">
        <Heading id="editorial-title" eyebrow="How we write" title="Our editorial standards." />
        <ol className="point-columns">
          {EDITORIAL.map(([title, text], index) => <li key={title}><span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><h3>{title}</h3><p>{text}</p></li>)}
        </ol>
      </section>

      <HubLinks current="/insights" />
      <CallToAction title="Need to turn an idea into a working system?" />
    </>
  );
}
