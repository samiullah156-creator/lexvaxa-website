import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, BadgeCheck, Blocks, Plug } from 'lucide-react';
import { AnimatedContainer } from '@/components/animations/animated-container';
import { BrandOrbit } from '@/components/animations/brand-orbit';
import { SITE } from '@/lib/site';
import styles from './about-preview.module.css';

const reveal = { trigger: 'viewport' as const, once: true, distance: 12, stiffness: 240, damping: 28 };

export function AboutPreview() {
  return <section id="about-lexvaxa" className={styles.section} aria-labelledby="about-preview-title">
    <div className={`container ${styles.grid}`}>
      <AnimatedContainer {...reveal} className={styles.copy}>
        <p className={styles.eyebrow}>About Lexvaxa</p>
        <h2 id="about-preview-title">Your engineering partner<br />for AI and software<span>.</span></h2>
        <p className={styles.lead}>Lexvaxa is an AI and software development company. We design, build and support AI agents, automation and custom platforms for growing businesses, shaped around how your team already works.</p>
        <ul className={styles.ways} aria-label="Two ways we deliver">
          <li><span aria-hidden="true"><Plug size={18} /></span><div><b>Integrate with your existing tools</b><small>AI and automation connected to your CRM, practice management, accounting and e-sign platforms. Nothing has to be replaced.</small></div></li>
          <li><span aria-hidden="true"><Blocks size={18} /></span><div><b>Build custom software</b><small>Web platforms, SaaS products and AI agents built to your requirements, with full ownership of the code.</small></div></li>
        </ul>
        <p className={styles.supporting}>Every engagement has weekly progress reviews, a signed-off scope at each stage and full handover of code, documentation and accounts, followed by ongoing support.</p>
        <div className={styles.founder}>
          <Image src="/media/founder-sami.jpg" alt={`${SITE.founder.name}, ${SITE.founder.role} of Lexvaxa`} width={56} height={56} className={styles.founderPhoto} />
          <p><b>{SITE.founder.name}</b><span>{SITE.founder.role} · <BadgeCheck size={13} aria-hidden="true" />{SITE.founder.credential}</span></p>
        </div>
        <nav className={styles.links} aria-label="Learn about Lexvaxa"><Link href="/about" className={styles.primaryLink}>Meet the team<ArrowUpRight size={17} aria-hidden="true" /></Link><Link href="/work" className={styles.secondaryLink}>See our work<ArrowRight size={17} aria-hidden="true" /></Link></nav>
      </AnimatedContainer>
      <AnimatedContainer {...reveal} distance={10} delay={0.05} className={styles.visual}><BrandOrbit id="home-about-orbit" /></AnimatedContainer>
    </div>
  </section>;
}
