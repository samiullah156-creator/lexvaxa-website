import type { Metadata } from 'next';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Eyebrow, Trail, CallToAction } from '@/components/ui';
import { JsonLd } from '@/components/content/json-ld';
import { articles, articleBySlug } from '@/lib/data/articles';
import { serviceBySlug } from '@/lib/data/services';
import { breadcrumbs, pageMetadata, articleSchema } from '@/lib/seo';
import { ReadingProgress } from '@/components/depth/reading-progress';
import { RelatedLinks } from '@/components/content/related-links';
import { industriesFor, industryLink, projectLink, projectsFor } from '@/lib/related';
import { allProjects } from '@/lib/data/all-projects';
import { InsightPost } from '@/components/content/insight-post';
import { cmsPost } from '@/lib/cms';
import { guidesFor, publishedPosts } from '@/lib/data/insights';

// Built-in guides are known at build time. Posts written in the admin panel are rendered the
// first time someone requests them, then served as static pages like everything else.
export const dynamicParams = true;

export async function generateStaticParams() {
  const posts = await publishedPosts();
  return [...articles, ...posts].map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = articleBySlug[slug];
  if (!article) {
    const post = await cmsPost(slug);
    if (!post) return {};
    return pageMetadata({
      title: `${post.seoTitle || post.title} | Lexvaxa`,
      description: post.seoDescription || post.excerpt,
      path: `/insights/${slug}`,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      ...(post.cover ? { image: { url: post.cover.url, width: post.cover.width, height: post.cover.height, alt: post.cover.alt || post.title } } : {}),
    });
  }

  return pageMetadata({
    title: article.seoTitle || `${article.title} | Lexvaxa`,
    description: article.metaDescription || article.summary,
    path: `/insights/${slug}`,
    type: 'article',
    publishedTime: article.publishedAt,
    modifiedTime: article.modifiedAt,
    image: {
      url: article.cover.png,
      width: 1200,
      height: 675,
      alt: article.cover.alt,
    },
  });
}

export default async function InsightDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = articleBySlug[slug];
  if (!article) {
    const post = await cmsPost(slug);
    if (!post) notFound();
    return <InsightPost post={post} />;
  }
  const [guides, portfolio] = await Promise.all([guidesFor(article.relatedServices, { exclude: slug }), allProjects()]);

  return (
    <>
      <JsonLd
        data={breadcrumbs([
          { name: 'Home', url: '/' },
          { name: 'Insights', url: '/insights' },
          { name: article.title, url: `/insights/${slug}` },
        ])}
      />
      <JsonLd
        data={articleSchema({
          title: article.title,
          description: article.summary,
          url: `/insights/${slug}`,
          image: article.cover.png,
          datePublished: article.publishedAt,
          dateModified: article.modifiedAt,
          author: article.author,
          about: article.relatedServices.flatMap((s) => serviceBySlug[s] ? [{ name: serviceBySlug[s].name, url: `/services/${s}` }] : []),
        })}
      />

      <ReadingProgress target=".article-content" />
      <header className="page-hero container article-hero">
        <Trail items={[{ label: 'Insights', href: '/insights' }, { label: article.title }]} />
        <Eyebrow>{article.category} · Practical Architecture Guide</Eyebrow>
        <h1>{article.title}</h1>
        <p className="article-lead">{article.summary}</p>
        <div className="article-byline">
          <span className="byline-author">By {article.author.name} ({article.author.role})</span>
          <span className="byline-dot">·</span>
          <span className="byline-reading">{article.readingTime}</span>
          <span className="byline-dot">·</span>
          <time dateTime={article.modifiedAt} className="byline-date">
            Updated {new Date(article.modifiedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </time>
        </div>
      </header>

      {/* Featured 16:9 Vector SVG Cover */}
      <div className="container article-cover-section">
        <div className="article-featured-image-wrap">
          <Image
            src={article.cover.svg}
            alt={article.cover.alt}
            width={article.cover.width}
            height={article.cover.height}
            priority
            unoptimized
            className="article-featured-image"
          />
        </div>
      </div>

      <div className="container article-wrap">
        <article className="article-content">
          {article.sections.map((section) => (
            <section key={section.heading} id={`section-${article.sections.indexOf(section) + 1}`} className="article-section-block">
              <h2>{section.heading}</h2>
              {section.paragraphs.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
              {section.points && section.points.length > 0 && (
                <ul className="article-points-list">
                  {section.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          {/* Contextual Service Callout */}
          <div className="article-service-cta-card">
            <span className="service-cta-badge">PRACTICAL NEXT STEP</span>
            <h3>{article.serviceCta.title}</h3>
            <p>{article.serviceCta.description}</p>
            <div className="service-cta-btns">
              <Link href={`/services/${article.serviceCta.serviceSlug}`} className="button">
                {article.serviceCta.buttonText} <ArrowUpRight size="1em" className="inline-icon" aria-hidden="true" />
              </Link>
              <Link href="/contact" className="button button-outline">
                Discuss Your Requirements <ArrowRight size="1em" className="inline-icon" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <section className="source-notes" aria-labelledby="article-sources">
            <h2 id="article-sources">Sources and further reading</h2>
            <p>Official documentation and original research supporting this guide. Product behavior and guidance can change; check the linked source for current details.</p>
            <ul>
              {article.sources.map((source) => (
                <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}<span className="sr-only"> (opens in a new tab)</span></a></li>
              ))}
            </ul>
          </section>
        </article>

        <aside className="article-aside">
          <nav className="aside-box article-contents" aria-label="On this page">
            <h2>In this guide</h2>
            <ol>{article.sections.map((section, index) => <li key={section.heading}><a href={`#section-${index + 1}`}>{section.heading}</a></li>)}</ol>
          </nav>
          <div className="aside-box">
            <h2>Related capabilities</h2>
            <div className="aside-links-list">
              {article.relatedServices.map((s) => {
                const service = serviceBySlug[s];
                if (!service) return null;
                return (
                  <Link key={s} href={`/services/${s}`} className="aside-service-link">
                    <span>{service.shortName || service.name}</span>
                    <ArrowUpRight size="1em" className="inline-icon" aria-hidden="true" />
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="aside-box aside-cta-box">
            <h3>Engineering consultation</h3>
            <p>Every business problem has a right-sized architecture. Speak directly with our engineering team.</p>
            <Link href="/contact" className="button button-small">
              Discuss your project <ArrowUpRight size="1em" className="inline-icon" aria-hidden="true" />
            </Link>
          </div>

          <Link href="/insights" className="text-link">
            <ArrowLeft size="1em" className="inline-icon" aria-hidden="true" /> Browse all insights
          </Link>
        </aside>
      </div>

      <RelatedLinks id="article-related-title" soft title="Related guides, projects and industries." groups={[
        { title: 'More guides', links: guides, allHref: '/insights', allLabel: 'All insights' },
        { title: 'Projects in practice', links: projectsFor(portfolio, article.relatedServices).map(projectLink), allHref: '/work', allLabel: 'All projects' },
        { title: 'Where it applies', links: industriesFor(article.relatedServices).map(industryLink), allHref: '/industries', allLabel: 'All industries' },
      ]} />

      <CallToAction title="Make the next technical decision with clarity." />
    </>
  );
}
