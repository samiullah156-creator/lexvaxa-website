import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { CallToAction } from '@/components/ui';
import { pageMetadata, websiteSchema } from '@/lib/seo';
import { JsonLd } from '@/components/content/json-ld';
import { HeroSection } from '@/components/sections/hero';
import { TechMarquee } from '@/components/sections/tech-marquee';
import { CompanyStats } from '@/components/sections/company-stats';
import { IndustryExplorer } from '@/components/sections/industry-explorer';
import { Capabilities } from '@/components/sections/capabilities';
import { ProjectsPreview } from '@/components/sections/projects-preview';
import { InsightsPreview } from '@/components/sections/insights-preview';
import { allInsights } from '@/lib/data/insights';
import { homeProjects } from '@/lib/data/all-projects';
import { AboutPreview } from '@/components/sections/about-preview';
import { Testimonials } from '@/components/sections/testimonials';
import { TeamSection } from '@/components/sections/team-section';
import { AnimatedContainer } from '@/components/animations/animated-container';
import styles from './home.module.css';

const reveal = { trigger: 'viewport' as const, once: true, distance: 14, stiffness: 240, damping: 28 };

export const metadata: Metadata = pageMetadata({
  title: 'AI Development & Custom Software Company',
  description: 'Lexvaxa is an AI development company building AI agents, voice AI, workflow automation, CRM integrations and custom software for growing businesses.',
  path: '/',
});

export default async function Home() {
  // Newest admin posts and guides together, so a fresh article is linked from the homepage.
  const [insights, featured] = await Promise.all([allInsights(), homeProjects()]);
  return (
    <>
      <JsonLd data={websiteSchema()} />
      <HeroSection />

      <TechMarquee />

      {/* Below the hero, each group is laid out and painted only when it nears the viewport
          (content-visibility), so a phone does not lay out the whole long page before it can respond. */}
      <div className={styles.deferred}>
        <Capabilities />
      </div>

      <div className={styles.deferred}>
        <AboutPreview />
        <CompanyStats />
      </div>

      <div className={styles.deferred}>
        <section className={styles.section} aria-labelledby="industries-title">
          <div className="container">
            <AnimatedContainer {...reveal} className={styles.splitHeading}>
              <div><p className={styles.label}>Industries</p><h2 id="industries-title">Industries <br />we serve.</h2></div>
              <div><p>Legal, logistics, healthcare, real estate, finance and SaaS teams each run on different rules. We build to the rules of yours.</p><Link href="/industries" className={styles.textLink}>All industries <ArrowUpRight size={16} aria-hidden="true" /></Link></div>
            </AnimatedContainer>
            <IndustryExplorer />
          </div>
        </section>
      </div>

      <div className={styles.deferred}>
        <ProjectsPreview projects={featured} />
        <Testimonials />
      </div>
      <div className={styles.deferred}>
        <TeamSection />
        <InsightsPreview items={insights} />
        <AnimatedContainer {...reveal} distance={12}><CallToAction /></AnimatedContainer>
      </div>
    </>
  );
}
