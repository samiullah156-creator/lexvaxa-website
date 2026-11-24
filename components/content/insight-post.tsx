import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { CallToAction, Eyebrow, Trail } from '@/components/ui';
import { JsonLd } from '@/components/content/json-ld';
import { ReadingProgress } from '@/components/depth/reading-progress';
import { RelatedLinks } from '@/components/content/related-links';
import { srcSet, type CmsPost } from '@/lib/cms';
import { guidesFor } from '@/lib/data/insights';
import { industriesFor, industryLink, projectLink, projectsFor } from '@/lib/related';
import { allProjects } from '@/lib/data/all-projects';
import { articleSchema, breadcrumbs } from '@/lib/seo';
import { serviceBySlug } from '@/lib/data/services';

const dateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

/** An article written in the admin panel, laid out like the built-in guides. */
export async function InsightPost({ post }: { post: CmsPost }) {
  const path = `/insights/${post.slug}`;
  const related = post.relatedServices.flatMap((slug) => (serviceBySlug[slug] ? [serviceBySlug[slug]] : []));
  const mainService = related[0];
  const revised = post.updatedAt.slice(0, 10) !== post.publishedAt.slice(0, 10);
  const [guides, portfolio] = await Promise.all([guidesFor(post.relatedServices, { exclude: post.slug }), allProjects()]);

  return (
    <>
      <JsonLd data={breadcrumbs([{ name: 'Home', url: '/' }, { name: 'Insights', url: '/insights' }, { name: post.title, url: path }])} />
      <JsonLd data={articleSchema({
        title: post.title, description: post.seoDescription || post.excerpt, url: path, image: post.cover?.url ?? '/og-default.png',
        datePublished: post.publishedAt, dateModified: post.updatedAt, author: { name: post.authorName, role: post.authorRole },
        about: related.map((service) => ({ name: service.name, url: `/services/${service.slug}` })),
      })} />
      {post.faqs.length > 0 && <JsonLd data={{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: post.faqs.map((faq) => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })) }} />}

      <ReadingProgress target=".article-content" />
      <header className="page-hero container article-hero">
        <Trail items={[{ label: 'Insights', href: '/insights' }, { label: post.title }]} />
        <Eyebrow>{post.category || 'Insight'}</Eyebrow>
        <h1>{post.title}</h1>
        <p className="article-lead">{post.excerpt}</p>
        <div className="article-byline">
          <span className="byline-author">By {post.authorName ? `${post.authorName}${post.authorRole ? ` (${post.authorRole})` : ''}` : 'the Lexvaxa team'}</span>
          <span className="byline-dot">·</span>
          <span className="byline-reading">{post.readingMinutes} min read</span>
          <span className="byline-dot">·</span>
          <time dateTime={revised ? post.updatedAt : post.publishedAt} className="byline-date">
            {revised ? 'Updated' : 'Published'} {dateFormat.format(new Date(revised ? post.updatedAt : post.publishedAt))}
          </time>
        </div>
      </header>

      {post.cover && (
        <div className="container article-cover-section">
          <div className="article-featured-image-wrap" style={{ aspectRatio: `${post.cover.width} / ${post.cover.height}`, backgroundColor: post.cover.color }}>
            {/* Already resized to WebP by the backend; the browser picks the size that fits. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.cover.url} srcSet={srcSet(post.cover)} sizes="(max-width: 1040px) calc(100vw - 40px), 980px" width={post.cover.width} height={post.cover.height}
              alt={post.cover.alt} fetchPriority="high" decoding="async" className="article-featured-image" />
          </div>
        </div>
      )}

      <div className="container article-wrap">
        <article className="article-content">
          <div className="cms-prose" dangerouslySetInnerHTML={{ __html: post.html }} />

          {post.faqs.length > 0 && (
            <section className="article-faqs" aria-labelledby="article-faqs-title">
              <h2 id="article-faqs-title">Common questions</h2>
              <div className="faq-list">
                {post.faqs.map((faq) => <details key={faq.question}><summary>{faq.question}<span aria-hidden="true">+</span></summary><p>{faq.answer}</p></details>)}
              </div>
            </section>
          )}

          {post.tags.length > 0 && <ul className="article-tags" aria-label="Topics">{post.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>}

          {mainService && (
            <div className="article-service-cta-card">
              <span className="service-cta-badge">PRACTICAL NEXT STEP</span>
              <h3>Working on this in your own business?</h3>
              <p>{mainService.blurb}</p>
              <div className="service-cta-btns">
                <Link href={`/services/${mainService.slug}`} className="button">Explore {mainService.shortName} <ArrowUpRight size="1em" className="inline-icon" aria-hidden="true" /></Link>
                <Link href={`/contact?service=${mainService.slug}`} className="button button-outline">Discuss your requirements <ArrowRight size="1em" className="inline-icon" aria-hidden="true" /></Link>
              </div>
            </div>
          )}
        </article>

        <aside className="article-aside">
          {post.toc.length > 1 && (
            <nav className="aside-box article-contents" aria-label="On this page">
              <h2>In this article</h2>
              <ol>{post.toc.map((entry) => <li key={entry.id}><a href={`#${entry.id}`}>{entry.label}</a></li>)}</ol>
            </nav>
          )}
          {related.length > 0 && (
            <div className="aside-box">
              <h2>Related capabilities</h2>
              <div className="aside-links-list">
                {related.map((service) => <Link key={service.slug} href={`/services/${service.slug}`} className="aside-service-link"><span>{service.shortName}</span><ArrowUpRight size="1em" className="inline-icon" aria-hidden="true" /></Link>)}
              </div>
            </div>
          )}
          <div className="aside-box aside-cta-box">
            <h3>Engineering consultation</h3>
            <p>Every business problem has a right-sized architecture. Speak directly with our engineering team.</p>
            <Link href="/contact" className="button button-small">Discuss your project <ArrowUpRight size="1em" className="inline-icon" aria-hidden="true" /></Link>
          </div>
          <Link href="/insights" className="text-link"><ArrowLeft size="1em" className="inline-icon" aria-hidden="true" /> Browse all insights</Link>
        </aside>
      </div>

      <RelatedLinks id="article-related-title" soft title="Related guides, projects and industries." groups={[
        { title: 'More reading', links: guides, allHref: '/insights', allLabel: 'All insights' },
        { title: 'Projects in practice', links: projectsFor(portfolio, post.relatedServices).map(projectLink), allHref: '/work', allLabel: 'All projects' },
        { title: 'Where it applies', links: industriesFor(post.relatedServices).map(industryLink), allHref: '/industries', allLabel: 'All industries' },
      ]} />

      <CallToAction title="Make the next technical decision with clarity." />
    </>
  );
}
