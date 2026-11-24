'use client';

import type { DiagramState, ServiceSystem } from '@/lib/data/service-systems';
import { SteelScene } from '@/components/steel/steel-scene';
import { TiltSurface } from './tilt-surface';
import styles from './live-scene.module.css';

type LiveSceneProps = {
  system: ServiceSystem;
  state: DiagramState;
  variant?: 'hero' | 'card' | 'story';
  instanceId: string;
  running: boolean;
  assemble?: boolean;
  tilt?: number;
};

/** A service's steel equipment presented in depth: pointer tilt and a lifted contact shadow. */
export function LiveScene({ system, state, variant = 'card', instanceId, running, assemble = false, tilt = 6 }: LiveSceneProps) {
  return <TiltSurface max={tilt} className={styles.scene}>
    <div className={styles.body} data-variant={variant}>
      <SteelScene slug={system.slug} id={`${instanceId}-${system.slug}`} running={running} built={state.built} ghost={state.ghost} assemble={assemble} />
    </div>
  </TiltSurface>;
}
