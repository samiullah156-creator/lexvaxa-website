'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { services } from '@/lib/data/services';
import { SERVICE_VISUALS } from '@/lib/data/service-visuals';
import { ServiceSystemPreview } from '@/components/systems/service-system-preview';
import { AnimatedContainer } from '@/components/animations/animated-container';
import { ServiceBadge } from '@/components/depth/service-badge';
import styles from './capabilities.module.css';

const STORAGE_KEY = 'lexvaxa-capability';
const reveal = { trigger: 'viewport' as const, once: true, distance: 14, stiffness: 240, damping: 28 };

export function Capabilities() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    try {
      const slug = window.sessionStorage.getItem(STORAGE_KEY);
      const index = services.findIndex((service) => service.slug === slug);
      if (index >= 0) setActive(index);
    } catch {
      // The explorer remains usable when browser storage is unavailable.
    }
  }, []);

  function select(index: number) {
    setActive(index);
    try {
      window.sessionStorage.setItem(STORAGE_KEY, services[index].slug);
    } catch {
      // Remembering a selection is optional.
    }
  }

  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % services.length;
    else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index + services.length - 1) % services.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = services.length - 1;
    else return;
    event.preventDefault();
    select(next);
    tabs.current[next]?.focus();
  }

  return (
    <section id="capabilities" className={styles.section} aria-labelledby="capabilities-heading">
      <div id="services" className="container">
        <AnimatedContainer {...reveal} className={styles.heading}>
          <div>
            <p className="eyebrow"><span className="eyebrow-line" />Our services</p>
            <h2 id="capabilities-heading">AI and software<br />development services.</h2>
          </div>
          <p className={styles.intro}>From AI agents and voice assistants to CRM automation and custom platforms: what we build, and how it connects to the tools you already run.</p>
        </AnimatedContainer>

        <AnimatedContainer {...reveal} distance={12} delay={0.05} className={styles.explorer}>
          <div className={styles.tabs} role="tablist" aria-orientation="vertical" aria-label="Explore all nine Lexvaxa services">
            {services.map((service, index) => (
                <button
                  key={service.slug}
                  ref={(element) => { tabs.current[index] = element; }}
                  id={`capability-tab-${service.slug}`}
                  type="button" role="tab"
                  aria-selected={index === active} aria-controls={`capability-panel-${service.slug}`}
                  tabIndex={index === active ? 0 : -1}
                  onKeyDown={(event) => navigate(event, index)} onClick={() => select(index)}
                  className={styles.tab}
                >
                  <ServiceBadge slug={service.slug} size="sm" />
                  <span>{service.name}</span>
                  <ArrowRight size={17} aria-hidden="true" className={styles.tabArrow} />
                </button>
            ))}
          </div>

          <div className={styles.panels}>
            {services.map((service, index) => {
              const selected = index === active;
              return (
                <div
                  key={service.slug}
                  id={`capability-panel-${service.slug}`}
                  role="tabpanel"
                  aria-labelledby={`capability-tab-${service.slug}`}
                  aria-hidden={!selected}
                  inert={!selected}
                  tabIndex={selected ? 0 : -1}
                  className={styles.panel}
                  data-active={selected}
                >
                  <div className={styles.visual}>
                    {selected && <ServiceSystemPreview key={service.slug} slug={service.slug} label={`${service.name} system: ${SERVICE_VISUALS[service.slug].description}`} />}
                  </div>
                  <div className={styles.copy}>
                    <h3>{service.name}</h3>
                    <p className={styles.description}>{service.description}</p>
                    <h4 className={styles.deliverablesHeading}>What we can deliver</h4>
                    <ul className={styles.deliverables}>
                      {service.deliverables.slice(0, 3).map((item) => (
                        <li key={item.name}><strong>{item.name}</strong></li>
                      ))}
                    </ul>
                    <div className={styles.links}>
                      <Link href={`/services/${service.slug}`} className={styles.primaryLink}>Explore this service <ArrowUpRight size={17} aria-hidden="true" /></Link>
                      <Link href={`/contact?service=${service.slug}`} className={styles.secondaryLink}>Discuss your project <ArrowRight size={15} aria-hidden="true" /></Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </AnimatedContainer>

        <AnimatedContainer {...reveal} distance={10} className={styles.footer}>
          <p>Start with one service. Add more when the first one is paying off.</p>
          <Link href="/services">Compare all services <ArrowRight size={17} aria-hidden="true" /></Link>
        </AnimatedContainer>
      </div>
    </section>
  );
}
