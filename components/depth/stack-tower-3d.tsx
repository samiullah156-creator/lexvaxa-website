import type { CSSProperties } from 'react';
import type { StackLayer } from '@/lib/data/project-stack';
import { TiltSurface } from './tilt-surface';
import styles from './stack-tower-3d.module.css';

/** A project's architecture as stacked 3D slabs; layers separate on hover. */
export function StackTower3D({ layers, projectName }: { layers: readonly StackLayer[]; projectName: string }) {
  return <figure className={styles.tower} style={{ '--count': layers.length } as CSSProperties}>
    <TiltSurface max={6} className={styles.scene}>
      <div className={styles.stack} aria-hidden="true">
        {layers.map((layer, index) => (
          <div key={layer.id} className={styles.slab} data-layer={layer.id} style={{ '--i': index } as CSSProperties}>
            <span className={`${styles.face} ${styles.top}`}><i /></span>
            <span className={`${styles.face} ${styles.front}`} />
            <span className={`${styles.face} ${styles.right}`} />
            <span className={styles.tag}><b>{layer.label}</b>{layer.technologies.join(' · ')}</span>
          </div>
        ))}
      </div>
    </TiltSurface>
    <figcaption>
      <span className={styles.caption}>Architecture layers</span>
      <ul className={styles.list} aria-label={`${projectName} architecture layers`}>
        {[...layers].reverse().map((layer) => <li key={layer.id}><span>{layer.label}</span>{layer.technologies.join(', ')}</li>)}
      </ul>
    </figcaption>
  </figure>;
}
