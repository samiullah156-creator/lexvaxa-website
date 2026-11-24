/**
 * Project types and portfolio groups. The projects themselves live in the CMS (admin > Projects) and
 * reach the site through lib/all-projects.ts; nothing is hard-coded here.
 */
export type Project = {
  slug: string;
  name: string;
  category: string;
  discipline: string;
  summary: string;
  overview: string;
  challenge: string;
  solution: string;
  technologies: string[];
  features: string[];
  image: { src: string; alt: string; width: number; height: number };
  serviceSlugs: string[];
  sourceUrl?: string;
  liveUrl?: string;
  /** Set when the services alone would place the project in the wrong group. */
  tracks?: ProjectTrack[];
  /**
   * A solution blueprint: a system design Lexvaxa uses as the starting point for this kind of work,
   * shown with a designed interface preview. Labelled as such everywhere; never presented as client work.
   */
  blueprint?: boolean;
};

/** The kind of engineering a project shows, used to filter the portfolio. */
export type ProjectTrack = 'ai' | 'automation' | 'full-stack' | 'web';
export const PROJECT_TRACKS: { id: ProjectTrack; label: string }[] = [
  { id: 'ai', label: 'AI engineering' },
  { id: 'automation', label: 'Automation' },
  { id: 'full-stack', label: 'Full-stack' },
  { id: 'web', label: 'Web & design' },
];

const TRACKS_BY_SERVICE: Record<string, ProjectTrack[]> = {
  'ai-agents-intelligent-automation': ['ai', 'automation'],
  'generative-ai-ml-engineering': ['ai'],
  'conversational-voice-ai': ['ai'],
  'rag-data-business-intelligence': ['ai'],
  'crm-revenue-automation': ['automation'],
  'custom-software-web-apps': ['full-stack'],
  'saas-ai-product-development': ['full-stack'],
  'digital-marketing-growth': ['web'],
  'ai-search-optimization': ['web'],
};

/** A project's groups: its own list when set, otherwise worked out from its services. */
export function projectTracks(project: { tracks?: readonly ProjectTrack[]; serviceSlugs: readonly string[] }): ProjectTrack[] {
  if (project.tracks?.length) return [...project.tracks];
  const found = new Set(project.serviceSlugs.flatMap((slug) => TRACKS_BY_SERVICE[slug] ?? []));
  return PROJECT_TRACKS.map((track) => track.id).filter((id) => found.has(id));
}

export const trackLabel = (id: ProjectTrack) => PROJECT_TRACKS.find((track) => track.id === id)?.label ?? id;
