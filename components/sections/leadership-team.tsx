import Image from 'next/image';
import type { CSSProperties } from 'react';
import { leadership, type Leader } from '@/lib/data/leadership';
import { cdn, isRemoteImage } from '@/lib/image-source';
import styles from './leadership-team.module.css';

const initials = (name: string) => name.split(' ').map((part) => part[0]).join('').slice(0, 2);

/**
 * The leadership team that works alongside the founder: role, remit and focus areas. People come from
 * the admin (Team members) when given; the built-in list is the fallback while the CMS is unavailable.
 */
export function LeadershipTeam({ members = leadership }: { members?: readonly Leader[] }) {
  return <ul className={styles.grid}>
    {members.map((leader, index) => <li key={leader.id} className={styles.card} style={{ '--i': index } as CSSProperties}>
      <article id={leader.id} aria-label={`${leader.role}: ${leader.name}`}>
        <div className={styles.identity}>
          <span className={styles.avatar}>
            {leader.photo
              ? <Image src={cdn(leader.photo, 192)} unoptimized={isRemoteImage(leader.photo)} alt={`${leader.name}, ${leader.role} at Lexvaxa.`} width={192} height={192} sizes="96px" />
              : <span aria-hidden="true">{initials(leader.name)}</span>}
          </span>
          <div>
            <h3>{leader.name}</h3>
            <p className={styles.role}>{leader.role}</p>
          </div>
        </div>
        <blockquote className={styles.summary}><p>{leader.summary}</p></blockquote>
        {leader.focus.length > 0 && <ul className={styles.focus} aria-label={`${leader.name} focus areas`}>{leader.focus.map((item) => <li key={item}>{item}</li>)}</ul>}
      </article>
    </li>)}
  </ul>;
}
