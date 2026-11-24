import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { projectTracks, type Project } from '@/lib/data/projects';
import { AnimatedContainer } from '@/components/animations/animated-container';
import { ProjectShowcase } from './project-showcase';
import styles from './projects-preview.module.css';

/** Featured work: the projects switched on for the homepage in the admin, in admin order. */
export function ProjectsPreview({ projects }: { projects: readonly Project[] }) {
  if (!projects.length) return null;
  return <section id="featured-projects" className={styles.section} aria-labelledby="projects-title">
    <div className="container">
      <AnimatedContainer trigger="viewport" once distance={12} stiffness={240} damping={28} className={styles.heading}>
        <div><p className={styles.eyebrow}>Selected work</p><h2 id="projects-title">Featured <span>projects.</span></h2></div>
        <Link href="/work" className={styles.all}>View all projects <ArrowUpRight size={16} aria-hidden="true" /></Link>
      </AnimatedContainer>
      <ProjectShowcase projects={projects.map((project) => {
        const { slug, name, category, discipline, summary, technologies, features, image, blueprint } = project;
        return { slug, name, category, discipline, summary, technologies, features, image, blueprint, tracks: projectTracks(project) };
      })} />
    </div>
  </section>;
}
