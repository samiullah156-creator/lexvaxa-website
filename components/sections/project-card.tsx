import { CdnImage } from '@/components/content/cdn-image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import type { Project } from '@/lib/data/projects';
import styles from './portfolio-preview.module.css';

/** Server-rendered content shared by the homepage and selected-project rail. */
export function ProjectCard({ project, headingLevel = 3 }: { project: Project; headingLevel?: 2 | 3 }) {
  const Title = headingLevel === 2 ? 'h2' : 'h3';
  const visibleTechnologies = project.technologies.slice(0, 3);
  const remainingTechnologies = project.technologies.slice(3);

  return <article className={styles.projectCard} data-project={project.slug} data-live={Boolean(project.liveUrl)}>
    <Link href={`/work/${project.slug}`} className={styles.projectCardLink} aria-label={`View ${project.name} project details`}>
      <div className={styles.projectImage}>
        <CdnImage src={project.image.src} alt={project.image.alt} width={project.image.width} height={project.image.height}
          sizes="(max-width: 600px) 84vw, 400px" loading="lazy" />
        <span className={styles.category}>{project.category}</span>
      </div>
      <div className={styles.projectCopy}>
        <p className={styles.projectDiscipline}>{project.discipline}{project.blueprint && ' · Solution blueprint'}</p>
        <Title>{project.name}</Title>
        <p className={styles.projectSummary}>{project.summary}</p>
        <ul className={styles.technologies} role="list" aria-label="Technologies">
          {visibleTechnologies.map((technology) => <li key={technology}>{technology}</li>)}
          {remainingTechnologies.length > 0 && <li className={styles.technologyOverflow} title={remainingTechnologies.join(' · ')}><span aria-hidden="true">+{remainingTechnologies.length}</span><span className="sr-only">Also {remainingTechnologies.join(', ')}</span></li>}
        </ul>
        <span className={styles.projectFoot}><span>View detail</span><ArrowRight size={16} aria-hidden="true" /></span>
      </div>
    </Link>
    {project.liveUrl && <a className={styles.liveDemo} href={project.liveUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open ${project.name} live demo (opens in a new tab)`}>Live demo<ArrowUpRight size={15} aria-hidden="true" /></a>}
  </article>;
}
