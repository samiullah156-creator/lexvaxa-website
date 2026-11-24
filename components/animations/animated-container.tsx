'use client';

import type { ComponentType, ReactNode } from 'react';
import {
  LazyMotion, m, useReducedMotion,
  type HTMLElements, type HTMLMotionProps, type MotionProps, type MotionStyle,
} from 'framer-motion';
import styles from './animated-container.module.css';

// Shared by every instance; loading features does not recreate the motion tags.
const loadFeatures = () => import('./motion-features').then((module) => module.default);
type Tag = keyof HTMLElements;

type AnimationOptions = {
  children?: ReactNode;
  /** Mount for above-fold elements; viewport for scroll entrances. */
  trigger?: 'mount' | 'viewport';
  /** Disable an entrance for content that should be immediately visible. */
  entrance?: boolean;
  distance?: number;
  delay?: number;
  stiffness?: number;
  damping?: number;
  hoverScale?: number | false;
  /** Press feedback is limited to native buttons and links with an href. */
  tapScale?: number | false;
  once?: boolean;
  amount?: number | 'some' | 'all';
  /** Optional layout-change projection; separate from the entrance animation. */
  layout?: MotionProps['layout'];
  style?: MotionStyle;
};

export type AnimatedContainerProps<T extends Tag = 'div'> = AnimationOptions & {
  as?: T;
} & Omit<HTMLMotionProps<NoInfer<T>>, keyof MotionProps | keyof AnimationOptions>;

export function AnimatedContainer<T extends Tag = 'div'>({
  as = 'div' as T,
  children,
  trigger = 'mount',
  entrance = true,
  distance = 20,
  delay = 0,
  stiffness = 260,
  damping = 24,
  hoverScale = false,
  tapScale = false,
  once = true,
  amount = 0.15,
  layout = false,
  className,
  ...props
}: AnimatedContainerProps<T>) {
  const reducedMotion = useReducedMotion() === true;
  const viewportEntrance = entrance && trigger === 'viewport' && !reducedMotion;
  const pressable = as === 'button' || (as === 'a' && 'href' in props && Boolean(props.href));
  const spring = { type: 'spring' as const, stiffness, damping };
  // m caches its tag components. Never call motion.create() during render.
  // Native attributes/ref are checked by the public generic; locally erase only
  // the tag correlation, which TypeScript cannot retain through object rest.
  const Component = m[as] as ComponentType<MotionProps & { className?: string; tabIndex?: number }>;

  return (
    <LazyMotion features={loadFeatures}>
      <Component
        {...props}
        className={[styles.root, className].filter(Boolean).join(' ')}
        tabIndex={props.tabIndex ?? (pressable && tapScale !== false ? 0 : undefined)}
        // Keep initial markup independent of client-only preference detection.
        initial={entrance ? { opacity: 0, y: distance } : false}
        animate={viewportEntrance ? undefined : { opacity: 1, y: 0, scale: 1 }}
        whileInView={viewportEntrance ? { opacity: 1, y: 0, scale: 1 } : undefined}
        viewport={viewportEntrance ? { once, amount } : undefined}
        whileHover={!reducedMotion && hoverScale !== false ? { scale: hoverScale } : undefined}
        whileFocus={!reducedMotion && pressable && hoverScale !== false ? { scale: hoverScale } : undefined}
        whileTap={!reducedMotion && pressable && tapScale !== false ? { scale: tapScale } : undefined}
        layout={reducedMotion ? false : layout}
        transition={reducedMotion ? { duration: 0 } : {
          default: { ...spring, delay },
          opacity: { type: 'tween', duration: 0.24, ease: 'easeOut', delay },
          scale: spring,
          layout: spring,
        }}
      >
        {children}
      </Component>
    </LazyMotion>
  );
}
