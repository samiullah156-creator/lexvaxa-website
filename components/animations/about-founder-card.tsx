import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { SITE } from '@/lib/site';
import styles from './about-founder-card.module.css';

export function AboutFounderCard() {
  return (
    <article id="founder" className={styles.card} aria-label={'Engineering leadership: ' + SITE.founder.name}>
      <div className={styles.identity}>
        <div className={styles.avatar}>
          <Image
            src="/media/founder-sami.jpg"
            alt={SITE.founder.name + ', founder of Lexvaxa.'}
            width={256}
            height={256}
            sizes="(max-width: 520px) 88px, 120px"
            className={styles.portrait}
          />
        </div>
        <div className={styles.nameBlock}>
          <p className={styles.eyebrow}>Engineering leadership</p>
          <h3>{SITE.founder.name}</h3>
          <p className={styles.role}>{SITE.founder.role}</p>
          <p className={styles.credential}>{SITE.founder.credential}</p>
        </div>
      </div>
      <p className={styles.bio}>{SITE.founder.bio}</p>
      <p className={styles.bio}>{SITE.founder.vision}</p>
      <dl className={styles.facts}>
        <div><dt>Education</dt><dd>{SITE.founder.education.qualification}<span>{SITE.founder.education.institution}</span></dd></div>
        <div><dt>Based in</dt><dd>{SITE.location}<span>Clients in {SITE.markets.join(', ')}</span></dd></div>
      </dl>
      <p className={styles.focusLabel}>Core expertise</p>
      <ul className={styles.focus} aria-label="Core expertise">
        {SITE.founder.expertise.map((item) => <li key={item}>{item}</li>)}
      </ul>
      <div className={styles.links}>
        <Link
          href={SITE.socials.founderLinkedin}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={SITE.founder.name + ' on LinkedIn (opens in a new tab)'}
        >
          LinkedIn <ArrowUpRight size={14} aria-hidden="true" />
        </Link>
        <Link
          href={SITE.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={'Contact ' + SITE.founder.name + ' through WhatsApp (opens in a new tab)'}
        >
          WhatsApp <ArrowUpRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

