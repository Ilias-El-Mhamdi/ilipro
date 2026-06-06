import type { Project, Client } from '../../../lib/queries';
import { ProjectCard } from '../../../components/organisms/ProjectCard';
import { LoadingText } from '../../../components/atoms/LoadingText';
import { EmptyText } from '../../../components/atoms/EmptyText';

interface Props {
  projects: Project[];
  isLoading: boolean;
  clients: Client[];
  companySlug: string;
  onDelete: (project: Project) => void;
  onAdd: () => void;
}

export function ProjectsSection({ projects, isLoading, clients, companySlug, onDelete, onAdd }: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs text-gray-500 uppercase tracking-widest">Projets</h2>
        <button onClick={onAdd} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer">+ Ajouter</button>
      </div>

      {isLoading ? (
        <LoadingText />
      ) : projects.length === 0 ? (
        <EmptyText message="Aucun projet pour cette entreprise." />
      ) : (
        <div className="flex flex-col gap-4">
          {projects.map((project) => (
            <div key={project.id} id={`project-${project.slug}`}>
              <ProjectCard project={project} companySlug={companySlug} clients={clients} onDeleteProject={onDelete} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
