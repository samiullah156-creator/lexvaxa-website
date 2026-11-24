import type { CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cmsTeam } from '@/lib/cms';
import { cdn, isRemoteImage } from '@/lib/image-source';
import { leadership } from '@/lib/data/leadership';
import { SITE } from '@/lib/site';
import styles from './team-section.module.css';

type Member = { id: string; name: string; role: string; summary: string; focus: string[]; photo: string; linkedin: string };

const initials = (name: string) => name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();

/** Used only when the CMS is not connected or has no team members yet. */
const builtIn: Member[] = [
  { id: 'founder', name: SITE.founder.name, role: SITE.founder.role, summary: `${SITE.founder.credential} leading engineering: AI systems, automation and legal-tech.`,
    focus: SITE.founder.expertise.slice(0, 3), photo: '/media/founder-sami.jpg', linkedin: SITE.founder.linkedin },
  ...leadership.map((leader) => ({ id: leader.id, name: leader.name, role: leader.role, summary: leader.summary, focus: leader.focus, photo: leader.photo ?? '', linkedin: '' })),
];

function LinkedIn() {
  return <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path fill="currentColor" d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4V21H3V9.75Zm6.5 0h3.8v1.6h.06c.53-1 1.84-2.06 3.79-2.06 4.05 0 4.8 2.6 4.8 6V21h-4v-5.1c0-1.22-.02-2.8-1.7-2.8-1.72 0-1.98 1.33-1.98 2.7V21h-4V9.75Z" /></svg>;
}

/**
 * Leadership, compact: a short intro beside one row of people. Managed from the admin's
 * "Team members" list; the built-in leadership shows until that list has entries.
 */
export async function TeamSection() {
  const fromAdmin: Member[] = (await cmsTeam()).map((item) => ({
    id: `cms-${item.id}`, name: item.name, role: item.role, summary: item.summary, photo: item.photo, linkedin: item.linkedinUrl,
    focus: item.focus.split(',').map((value) => value.trim()).filter(Boolean),
  }));
  const listed = fromAdmin.length ? fromAdmin : builtIn;
  // The founder sits in the middle of the row (CTO left, COO right); the others keep admin order.
  const founderAt = listed.findIndex((member) => member.name.trim().toLowerCase() === SITE.founder.name.toLowerCase());
  const founder = founderAt >= 0 ? listed[founderAt] : undefined;
  const others = listed.filter((_, index) => index !== founderAt);
  const team = founder && others.length >= 2 ? [others[0], founder, ...others.slice(1)] : listed;

  return <section className={styles.section} aria-labelledby="team-title">
    <div className="container">
      <div className={styles.head}>
        <div><p className={styles.label}>Our people</p><h2 id="team-title">Leadership <span>team.</span></h2></div>
        <div className={styles.headSide}>
          <p>The people who lead every engagement, from the first workshop to handover and support.</p>
          <Link href="/about#about-team" className={styles.more}>More about us <ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
      </div>
      <ul className={styles.people}>
        {team.map((member, index) => <li key={member.id} style={{ '--i': index } as CSSProperties}>
          <article className={styles.card} aria-label={`${member.name}, ${member.role}`}>
            <span className={styles.photo}>
              {member.photo
                ? <Image src={cdn(member.photo, 320)} unoptimized={isRemoteImage(member.photo)} alt={`${member.name}, ${member.role} at Lexvaxa`} width={160} height={160} sizes="72px" loading="lazy" />
                : <span aria-hidden="true">{initials(member.name)}</span>}
            </span>
            <div className={styles.body}>
              <h3>{member.name}</h3>
              <p className={styles.role}>{member.role}</p>
              <p className={styles.summary}>{member.summary}</p>
            </div>
            {member.linkedin && <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className={styles.social} aria-label={`${member.name} on LinkedIn`}><LinkedIn /></a>}
          </article>
        </li>)}
      </ul>
    </div>
  </section>;
}
