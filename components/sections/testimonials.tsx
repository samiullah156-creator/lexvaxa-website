import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Globe2, Repeat2 } from 'lucide-react';
import { cmsTestimonials } from '@/lib/cms';
import { ReviewSpotlight, type SpotlightReview } from './review-spotlight';
import styles from './testimonials.module.css';

/** Five stars. */
function Stars({ label = 'Rated 5 out of 5' }: { label?: string }) {
  return <svg className={styles.stars} viewBox="0 0 100 18" role="img" aria-label={label}>
    {[0, 1, 2, 3, 4].map((index) => <g key={index} transform={`translate(${index * 20} 0)`}>
      <path d="M9 1l2.4 5 5.4.6-4 3.7 1.1 5.4L9 13l-4.8 2.7 1.1-5.4-4-3.7 5.4-.6Z" />
    </g>)}
  </svg>;
}

/**
 * Client reviews, compact: the heading, rating and actions on one side, one large review at a time on
 * the other (every review stays in the HTML). No review count is shown.
 */
export async function Testimonials() {
  // Reviews come from the admin (Reviews), in admin order. The section is hidden until there are some.
  const items = await cmsTestimonials();
  if (!items.length) return null;
  const reviews: SpotlightReview[] = items.map((item) => ({
    id: `cms-${item.id}`, quote: item.quote, name: item.name, detail: [item.role, item.company, item.country].filter(Boolean).join(' · '),
  }));
  const rating = (items.reduce((sum, item) => sum + (item.rating ?? 5), 0) / items.length).toFixed(1);

  return <section className={styles.section} aria-labelledby="testimonials-title">
    <div className={`container ${styles.layout}`}>
      <div className={styles.intro}>
        <p className={styles.label}>Client feedback</p>
        <h2 id="testimonials-title">What our <span>clients say.</span></h2>
        <dl className={styles.proof}>
          <div className={styles.rating}><dt>Average client rating</dt><dd><b>{rating}</b><Stars /></dd></div>
          <div><dt><Globe2 size={15} aria-hidden="true" />Clients in</dt><dd>15+ countries</dd></div>
          <div><dt><Repeat2 size={15} aria-hidden="true" />Many are</dt><dd>repeat clients</dd></div>
        </dl>
        <div className={styles.actions}>
          <Link className={styles.primary} href="/contact">Start your project <ArrowUpRight size={16} aria-hidden="true" /></Link>
          <Link className={styles.secondary} href="/work">See the work <ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
      </div>
      <ReviewSpotlight reviews={reviews} stars={<Stars />} />
    </div>
  </section>;
}
