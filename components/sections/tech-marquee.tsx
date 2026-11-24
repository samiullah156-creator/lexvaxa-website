import {
  siAnthropic, siCloudflare, siDocker, siFirebase, siGooglecloud, siGooglegemini, siHubspot, siHuggingface, siLangchain, siMake,
  siMongodb, siN8n, siNextdotjs, siNodedotjs, siPostgresql, siPython, siReact, siShopify, siStripe, siSupabase, siTypescript,
  siVercel, siWhatsapp, siWordpress, siZapier, type SimpleIcon,
} from 'simple-icons';
import type { CSSProperties } from 'react';
import styles from './tech-marquee.module.css';

const PLATFORMS: [SimpleIcon, string][] = [
  [siAnthropic, 'Anthropic'], [siGooglegemini, 'Gemini'], [siGooglecloud, 'Google Cloud'], [siVercel, 'Vercel'], [siNextdotjs, 'Next.js'],
  [siReact, 'React'], [siTypescript, 'TypeScript'], [siNodedotjs, 'Node.js'], [siPython, 'Python'], [siLangchain, 'LangChain'],
  [siHuggingface, 'Hugging Face'], [siSupabase, 'Supabase'], [siPostgresql, 'PostgreSQL'], [siMongodb, 'MongoDB'], [siFirebase, 'Firebase'],
  [siDocker, 'Docker'], [siCloudflare, 'Cloudflare'], [siShopify, 'Shopify'], [siHubspot, 'HubSpot'], [siStripe, 'Stripe'],
  [siZapier, 'Zapier'], [siMake, 'Make'], [siN8n, 'n8n'], [siWhatsapp, 'WhatsApp'], [siWordpress, 'WordPress'],
];

function Logo({ icon, name }: { icon: SimpleIcon; name: string }) {
  // Neutral by default; the platform's own brand colour appears on hover.
  return <li className={styles.logo} style={{ '--brand': `#${icon.hex}` } as CSSProperties}>
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href={`#tm-${icon.slug}`} /></svg>
    <span>{name}</span>
  </li>;
}

/** Scrolling strip of the platforms and technologies Lexvaxa builds with (not a partnership claim). */
export function TechMarquee() {
  return <section className={styles.section} aria-labelledby="tech-title">
    {/* Each logo path is defined once and reused by both copies of the scrolling strip. */}
    <svg className={styles.sprite} aria-hidden="true" focusable="false"><defs>
      {PLATFORMS.map(([icon]) => <symbol key={icon.slug} id={`tm-${icon.slug}`} viewBox="0 0 24 24"><path d={icon.path} /></symbol>)}
    </defs></svg>
    <h2 id="tech-title" className={styles.title}>Platforms and technologies we build with<span>.</span></h2>
    <div className={styles.viewport}>
      <div className={styles.track}>
        <ul className={styles.group} aria-label="Technologies">{PLATFORMS.map(([icon, name]) => <Logo key={name} icon={icon} name={name} />)}</ul>
        <ul className={styles.group} aria-hidden="true">{PLATFORMS.map(([icon, name]) => <Logo key={name} icon={icon} name={name} />)}</ul>
      </div>
    </div>
  </section>;
}
