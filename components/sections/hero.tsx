import { serviceBySlug } from '@/lib/data/services';
import { HERO_ORDER, SERVICE_SYSTEMS } from '@/lib/data/service-systems';
import { HeroShowcase } from './hero-showcase';
import styles from './hero.module.css';

export function HeroSection() {
  // Only the copy the hero shows crosses to the client, not full service records.
  const chapters = HERO_ORDER.map((slug) => ({ slug, name: serviceBySlug[slug].name, description: SERVICE_SYSTEMS[slug].summary }));
  return (
    <section id="hero" className={styles.hero} aria-labelledby="hero-title">
      <HeroShowcase chapters={chapters} />
    </section>
  );
}
