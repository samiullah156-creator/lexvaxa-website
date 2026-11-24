/** Groups a project's real technologies into architecture layers, bottom to top. */
export const STACK_LAYERS = [
  { id: 'data', label: 'Data', match: ['MongoDB', 'PostgreSQL', 'MySQL', 'Firebase', 'Supabase', 'Redis', 'pgvector'] },
  { id: 'server', label: 'Server & API', match: ['Node.js', 'Express', 'Django', 'Laravel', 'FastAPI'] },
  { id: 'ai', label: 'AI models', match: ['OpenAI API', 'OpenAI Realtime API'] },
  { id: 'integrations', label: 'Integrations & automation', match: ['n8n', 'HubSpot API', 'Xero API', 'Google Calendar API', 'Twilio'] },
  { id: 'language', label: 'Language & build', match: ['TypeScript', 'JavaScript', 'Python', 'Vite'] },
  { id: 'framework', label: 'Application framework', match: ['React', 'Next.js', 'Vue', 'Angular'] },
  { id: 'interface', label: 'Interface', match: ['HTML5', 'CSS3', 'Tailwind CSS'] },
  { id: 'motion', label: 'Motion & 3D', match: ['GSAP', 'Three.js', 'Framer Motion'] },
] as const;

export type StackLayer = { id: string; label: string; technologies: string[] };

export function projectLayers(technologies: readonly string[]): StackLayer[] {
  const layers: StackLayer[] = STACK_LAYERS.map((layer) => ({
    id: layer.id, label: layer.label,
    technologies: technologies.filter((tech) => (layer.match as readonly string[]).includes(tech)),
  }));
  const known = new Set<string>(STACK_LAYERS.flatMap((layer) => [...layer.match]));
  const other = technologies.filter((tech) => !known.has(tech));
  if (other.length) layers.push({ id: 'other', label: 'Tooling', technologies: other });
  return layers.filter((layer) => layer.technologies.length > 0);
}
