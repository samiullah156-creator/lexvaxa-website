import { maxStage, SERVICE_SYSTEMS } from '@/lib/data/service-systems';
import { SteelDefs } from './steel-kit';
import { RenderedObject } from './steel-scenes';
import s from './steel.module.css';

export const STEEL_SCENES = [
  'conversational-voice-ai', 'ai-agents-intelligent-automation', 'custom-software-web-apps',
  'generative-ai-ml-engineering', 'rag-data-business-intelligence', 'crm-revenue-automation',
  'saas-ai-product-development', 'ai-search-optimization', 'digital-marketing-growth',
];

/** Studio stage behind each object: concentric floor rings and one orbit arc, drawn as fine brand lines (no fill). */
const ORBIT = 'M228 330A200 200 0 0 1 628 330';
const RINGS = [{ rx: 230, ry: 38, o: .16 }, { rx: 170, ry: 28, o: .24 }, { rx: 112, ry: 18, o: .34 }];

/** Studio backdrop shared by service and industry objects (the orbit draws in first while assembling). */
export function StudioLines() {
  return <g>
    <path d={ORBIT} stroke="#167dfe" strokeOpacity=".14" strokeWidth="1.2" strokeDasharray="2 7" strokeLinecap="round" />
    <path className={s.blueprint} d={ORBIT} stroke="#9533fa" strokeOpacity=".45" strokeWidth="1.4" strokeLinecap="round" pathLength={100} />
    {RINGS.map((ring) => <ellipse key={ring.rx} cx="428" cy="428" rx={ring.rx} ry={ring.ry} stroke="#167dfe" strokeOpacity={ring.o} strokeWidth="1.2" />)}
    <ellipse cx="428" cy="428" rx="66" ry="10" stroke="#167dfe" strokeOpacity=".5" strokeWidth="1.6" strokeDasharray="3 5" />
  </g>;
}

type SteelSceneProps = {
  slug: string;
  /** Unique per rendered instance (material ids). */
  id: string;
  running?: boolean;
  /** Build stage reached (1–5); 99 shows the finished system. */
  built?: number;
  ghost?: boolean;
  assemble?: boolean;
};

/** One physically rendered studio object per service on a brand tile, assembled in story order. */
export function SteelScene({ slug, id, running = true, built = 99, ghost = false, assemble = false }: SteelSceneProps) {
  const system = SERVICE_SYSTEMS[slug];
  if (!system || !STEEL_SCENES.includes(slug)) return null;
  const paint = `st-${id}`.replace(/[^a-zA-Z0-9_-]/g, '-');
  return <svg className={s.scene} data-service={slug} data-running={running} data-assemble={assemble} viewBox="140 40 560 430"
    fill="none" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
    <SteelDefs id={paint} />
    <StudioLines />
    <RenderedObject id={paint} slug={slug} built={built} ghost={ghost} stages={maxStage(system)} />
  </svg>;
}
