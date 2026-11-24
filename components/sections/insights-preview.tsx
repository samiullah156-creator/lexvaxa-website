import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { articles } from '@/lib/data/articles';
import { InsightCover } from '@/components/content/insight-cover';
import type { InsightCard } from '@/lib/data/insights';
import { AnimatedContainer } from '@/components/animations/animated-container';
import styles from './portfolio-preview.module.css';
import { TiltSurface } from '@/components/depth/tilt-surface';

const dateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

/** The part of a title before its subtitle ("CRM Automation for Lead Management: Connecting…" → first half). */
const shortTitle = (title: string) => (title.includes(':') && title.indexOf(':') > 18 ? title.slice(0, title.indexOf(':')) : title);

/** The three newest built-in guides, in the card shape shared with admin posts. */
const latestGuides = (): InsightCard[] => [...articles].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)).slice(0, 3).map((article) => ({
  slug: article.slug, title: article.title, summary: article.summary, category: article.category, readingTime: article.readingTime, publishedAt: article.publishedAt,
  authorName: article.author.name, relatedServices: article.relatedServices,
  cover: { kind: 'guide', src: article.cover.svg, alt: article.cover.alt, width: article.cover.width, height: article.cover.height },
}));

/** Latest three insights. The homepage passes the merged list (admin posts and guides); on its own it shows the guides. */
export function InsightsPreview({ items }: { items?: InsightCard[] } = {}) {
  const latest = (items ?? latestGuides()).slice(0, 3);
  return <section id="latest-insights" className={styles.insightsSection} aria-labelledby="insights-title">
    <div className="container">
      <AnimatedContainer trigger="viewport" once distance={12} stiffness={240} damping={28} className={styles.insightsHeading}>
        <div><p className={styles.eyebrow}>Insights</p><h2 id="insights-title">Latest <span>insights.</span></h2></div>
        <Link href="/insights" className={styles.allLink}>All articles <ArrowUpRight size={16} aria-hidden="true" /></Link>
      </AnimatedContainer>
      {/* One featured article and two compact ones: title, topic and reading time only. */}
      <div className={styles.editorial}>
        {latest.map((article, index) => <AnimatedContainer key={article.slug} trigger="viewport" once distance={12} delay={index * .06} stiffness={240} damping={28} className={index === 0 ? styles.featureItem : styles.compactItem}>
          <TiltSurface lift max={index === 0 ? 3 : 4} className="tilt-cell"><article className={styles.editorialCard}>
            <Link href={`/insights/${article.slug}`} className={styles.editorialLink} aria-label={article.title}>
              <div className={styles.editorialImage}>
                {article.cover?.kind === 'guide'
                  ? <Image src={article.cover.src} alt={article.cover.alt} width={article.cover.width} height={article.cover.height} unoptimized />
                  : <InsightCover cover={article.cover} label={article.category} sizes={index === 0 ? '(max-width: 900px) calc(100vw - 40px), 660px' : '200px'} />}
              </div>
              <div className={styles.editorialCopy}>
                <span className={styles.editorialMeta}><b>{article.category}</b><span aria-hidden="true">·</span><span>{article.readingTime}</span>{index === 0 && <><span aria-hidden="true">·</span><time dateTime={article.publishedAt}>{dateFormat.format(new Date(article.publishedAt))}</time></>}</span>
                <h3>{shortTitle(article.title)}</h3>
                {index === 0 && <span className={styles.editorialMore}>Read article <ArrowRight size={16} aria-hidden="true" /></span>}
              </div>
            </Link>
          </article></TiltSurface>
        </AnimatedContainer>)}
      </div>
    </div>
  </section>;
}
