import type { CSSProperties, ReactNode } from 'react';
import { CdnImage } from '@/components/content/cdn-image';
import { MonitorSmartphone, Server, Database, Layers, Spline, Users, Wrench, type LucideIcon } from 'lucide-react';
import { projectLayers } from '@/lib/data/project-stack';
import styles from './project-walkthrough.module.css';

const ICONS: Record<string, LucideIcon> = { interface: MonitorSmartphone, framework: Layers, language: Wrench, motion: Spline, server: Server, data: Database, other: Wrench };

/**
 * How a project's system fits together, drawn only from its real technologies: a request travels from
 * the people using it, through each architecture layer, to the data. Features follow as guided steps.
 */
type Shot = { src: string; width: number; height: number };
const route = (feature: string) => feature.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').split('-').slice(0, 2).join('-');

const words = (feature: string) => feature.replace(/&/g, 'and').replace(/[^A-Za-z0-9 ]+/g, ' ').trim().split(/\s+/).filter(Boolean).slice(0, 2);
const camel = (feature: string) => words(feature).map((word, index) => index ? word[0].toUpperCase() + word.slice(1).toLowerCase() : word.toLowerCase()).join('');
const pascal = (feature: string) => words(feature).map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase()).join('');
const snake = (feature: string) => words(feature).map((word) => word.toLowerCase()).join('_');

/** A light, screen-like window: a title bar naming the layer's tool, then what that layer is doing. */
function Screen({ title, className = '', children }: { title: string; className?: string; children: ReactNode }) {
  return <div className={`${styles.live} ${styles.lcd} ${className}`} aria-hidden="true">
    <span className={styles.lcdBar}><i /><i /><i /><b>{title}</b></span>
    <div className={styles.lcdBody}>{children}</div>
  </div>;
}

/** A small live picture inside each node, drawn from the project's own features and tools. Decorative. */
function Live({ id, first, features, technologies, image }: { id: string; first: boolean; features: readonly string[]; technologies: readonly string[]; image?: Shot }) {
  const tool = technologies[0] ?? '';
  const picks = (features.length ? features : ['Main workflow']).slice(0, 3);
  if (id === 'users') return <div className={styles.live} aria-hidden="true"><span className={styles.devices}><i className={styles.laptop} /><i className={styles.phone} /></span><span className={styles.online}><b />Live sessions</span></div>;
  if (image && (first || id === 'interface')) return <div className={`${styles.live} ${styles.screen}`} aria-hidden="true"><span className={styles.screenBar}><i /><i /><i /></span><CdnImage src={image.src} alt="" width={image.width} height={image.height} sizes="240px" /></div>;
  if (id === 'server') {
    const lines = picks.map((feature, index) => `${index === 1 ? 'POST' : 'GET '} /api/${route(feature)}`);
    return <Screen title={tool || 'API'} className={styles.log}><div className={styles.logTrack}>{[...lines, ...lines].map((line, index) => <code key={index}><span>{line}</span><b>{index % 3 === 1 ? 201 : 200}</b><small>{18 + ((index * 17) % 40)}ms</small></code>)}</div></Screen>;
  }
  if (id === 'data') return <Screen title={tool || 'Database'} className={styles.table}>
    <code className={styles.tableHead}><span>id</span><span>record</span><span>status</span></code>
    {picks.map((feature, index) => <code key={feature} style={{ '--r': index } as CSSProperties}><span>{1042 + index * 7}</span><span>{snake(feature)}</span><b>saved</b></code>)}
  </Screen>;
  if (id === 'ai') return <Screen title={tool || 'Model'} className={styles.ai}>
    <span className={styles.prompt}>{picks[0]}</span>
    <span className={styles.answer}><i /><i /><i /></span>
    <span className={styles.meter}><small>confidence</small><b><i /></b><small>0.96</small></span>
  </Screen>;
  if (id === 'integrations') return <Screen title="Sync" className={styles.sync}>
    {(technologies.length ? technologies : ['Webhooks']).slice(0, 3).map((name, index) => <code key={name} style={{ '--r': index } as CSSProperties}><span>{name}</span><b>synced</b></code>)}
  </Screen>;
  if (id === 'framework') return <Screen title={tool || 'App'} className={styles.editor}>
    <code><em>{'<App>'}</em></code>
    {picks.map((feature) => <code key={feature}><span className={styles.indent} /><em>{`<${pascal(feature)} />`}</em></code>)}
  </Screen>;
  if (id === 'language') {
    const py = technologies.includes('Python');
    return <Screen title={py ? 'main.py' : technologies.includes('TypeScript') ? 'index.ts' : 'index.js'} className={styles.editor}>
      {picks.map((feature, index) => <code key={feature}><small>{index + 1}</small>{py ? <><em>def</em><span>{snake(feature)}():</span></> : <><em>async function</em><span>{camel(feature)}()</span></>}</code>)}
      <code><small>{picks.length + 1}</small><span className={styles.caret} /></code>
    </Screen>;
  }
  if (id === 'motion') return <Screen title={tool || 'Timeline'} className={styles.timeline}>{[60, 38, 74].map((width, row) => <i key={row} style={{ width: `${width}%`, '--r': row } as CSSProperties} />)}</Screen>;
  return <Screen title="Pipeline" className={styles.sync}>{['build', 'test', 'deploy'].map((step, index) => <code key={step} style={{ '--r': index } as CSSProperties}><span>{step}</span><b>passed</b></code>)}</Screen>;
}

export function ProjectWalkthrough({ name, technologies, features, image }: { name: string; technologies: readonly string[]; features: readonly string[]; image?: Shot }) {
  const layers = projectLayers(technologies).reverse();
  const nodes = [{ id: 'users', label: 'People using it', technologies: ['Browser & mobile'] }, ...layers];
  return <section className={styles.section} aria-labelledby="walkthrough-title">
    <div className={styles.heading}>
      <p className={styles.eyebrow}>System walkthrough</p>
      <h2 id="walkthrough-title">How {name} fits together<span>.</span></h2>
      <p>Each interaction travels through the layers below. The diagram is drawn from the project&apos;s actual technology stack.</p>
    </div>
    <ol className={styles.pipeline} style={{ '--count': nodes.length } as CSSProperties} aria-label={`${name} architecture, from users to data`}>
      {nodes.map((node, index) => {
        const Icon = node.id === 'users' ? Users : ICONS[node.id] ?? Layers;
        return <li key={node.id} className={styles.node} style={{ '--i': index } as CSSProperties}>
          <span className={styles.icon} aria-hidden="true"><Icon size={22} strokeWidth={1.8} /></span>
          <h3>{node.label}</h3>
          <ul>{node.technologies.map((tech) => <li key={tech}>{tech}</li>)}</ul>
          <Live id={node.id} first={index === 1} features={features} technologies={node.technologies} image={image} />
          {index < nodes.length - 1 && <span className={styles.link} aria-hidden="true"><i /><i className={styles.reply} /></span>}
        </li>;
      })}
    </ol>
    <ol className={styles.features} aria-label={`${name} key features`}>
      {features.map((feature, index) => <li key={feature} style={{ '--i': index } as CSSProperties}>
        <span className={styles.step} aria-hidden="true">Step {String(index + 1).padStart(2, '0')}</span>
        <h3>{feature}</h3>
        <span className={styles.bar} aria-hidden="true" />
      </li>)}
    </ol>
  </section>;
}
