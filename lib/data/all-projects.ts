import { cmsProjects, type CmsProject } from '../cms';
import type { Project } from './projects';

/** A published project from the CMS, in the website's Project shape. */
export type AnyProject = Project & Partial<Pick<CmsProject, 'featured' | 'seoTitle' | 'seoDescription' | 'updatedAt' | 'gallery' | 'walkthrough' | 'results'>>;

const toProject = (project: CmsProject): AnyProject => ({ ...project, liveUrl: project.liveUrl || undefined });

/** The whole portfolio, in the order set in the admin (Projects > Order). */
export async function allProjects(): Promise<AnyProject[]> {
  return (await cmsProjects()).map(toProject);
}

/** Projects switched on for the homepage ("Feature on the homepage" in the admin), same order. */
export async function homeProjects(): Promise<AnyProject[]> {
  return (await allProjects()).filter((project) => project.featured);
}

export async function findProject(slug: string): Promise<AnyProject | undefined> {
  return (await allProjects()).find((project) => project.slug === slug);
}
