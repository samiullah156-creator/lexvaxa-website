import type { CSSProperties } from 'react';
import Image from 'next/image';
import { industries } from '@/lib/data/industries';
import { IndustryBadge } from './industry-badge';
import styles from './industry-orbit.module.css';

/**
 * Every sector on one tilted ring around the Lexvaxa core: the same engineering at the centre,
 * applied to different businesses. Pure CSS 3D; decorative, because the cards below carry the links.
 */
export function IndustryOrbit() {
  const step = 360 / industries.length;
  return <div className={styles.scene} aria-hidden="true">
    <div className={styles.floor}><span /><span /><span /></div>
    <div className={styles.core}><Image src="/brand/lexvaxa-mark.svg" alt="" width={64} height={64} /></div>
    <div className={styles.ring}>
      {industries.map((industry, index) => <div key={industry.slug} className={styles.slot} style={{ '--a': `${index * step}deg` } as CSSProperties}>
        <div className={styles.pin}><div className={styles.chip}><IndustryBadge slug={industry.slug} size="sm" /><span>{industry.name.split(' & ')[0].replace(' Operations', '').replace(' Services', '')}</span></div></div>
      </div>)}
    </div>
  </div>;
}
