import type {Company, Project} from '../../../../lib/queries.ts';
import {ProjectItem} from './ProjectItem.tsx';
import {CompanyRowHeader} from './CompanyRowHeader.tsx';

interface Props {
    company: Company;
    projects: Project[];
    isOpen: boolean;
    isActive: boolean;
    activeProjectHash: string;
    onToggle: () => void;
    onNavigate: (to: string) => void;
}

export function CompanyRow({company, projects, isOpen, isActive, activeProjectHash, onToggle, onNavigate}: Props) {
    return (
        <div>
            <CompanyRowHeader
                name={company.name}
                slug={company.slug}
                hasProjects={projects.length > 0}
                isOpen={isOpen}
                isActive={isActive}
                onToggle={onToggle}
                onNavigate={onNavigate}
            />

            {isOpen && projects.map((project) => (
                <ProjectItem
                    key={project.id}
                    name={project.name}
                    isActive={isActive && activeProjectHash === `#project-${project.slug}`}
                    onClick={() => onNavigate(`/admin/companies/${company.slug}#project-${project.slug}`)}
                />
            ))}
        </div>
    );
}
