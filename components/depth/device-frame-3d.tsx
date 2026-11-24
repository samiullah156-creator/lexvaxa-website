import { CdnImage } from '@/components/content/cdn-image';
import { TiltSurface } from './tilt-surface';
import styles from './device-frame-3d.module.css';

type DeviceFrame3DProps = {
  image: { src: string; alt: string; width: number; height: number };
  address: string;
  sizes: string;
  priority?: boolean;
  chips?: readonly string[];
};

/** A browser window in perspective: it settles flat as it scrolls into view and tilts with the pointer. */
export function DeviceFrame3D({ image, address, sizes, priority = false, chips = [] }: DeviceFrame3DProps) {
  return <TiltSurface max={4} className={styles.scene}>
    <div className={styles.frame}>
      <div className={styles.chrome} aria-hidden="true"><i /><i /><i /><span>{address}</span></div>
      <CdnImage src={image.src} alt={image.alt} width={image.width} height={image.height} sizes={sizes}
        loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : undefined} className={styles.image} />
      <span className={styles.shadow} aria-hidden="true" />
      {chips.length > 0 && <ul className={styles.chips} aria-hidden="true" data-depth="48">{chips.map((chip) => <li key={chip}>{chip}</li>)}</ul>}
    </div>
  </TiltSurface>;
}
