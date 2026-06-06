import { Link } from 'react-router-dom';
import type { ClientCompanySection, ClientDetail } from '../../../lib/queries';
import { LicenseCard } from './LicenseCard';
import { ProjectRow } from './ProjectRow';

interface Props {
  section: ClientCompanySection;
  client: ClientDetail;
}

export function CompanySection({ section, client }: Props) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-2 mb-5 pb-2 border-b border-gray-800">
        <Link
          to={`/admin/companies/${section.slug}`}
          className="text-lg font-semibold text-white hover:text-indigo-300 transition-colors"
        >
          {section.name}
        </Link>
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
          <polyline points="15 3 21 3 21 9"/>
          <line x1="10" y1="14" x2="21" y2="3"/>
        </svg>
      </div>

      <div className="mb-6">
        <h3 className="text-xs text-gray-500 uppercase tracking-widest mb-3">Licence</h3>
        <LicenseCard license={section.license} projects={section.projects} client={client} />
      </div>

      <div>
        <h3 className="text-xs text-gray-500 uppercase tracking-widest mb-3">Projets</h3>
        {section.projects.length === 0 ? (
          <p className="text-gray-600 text-sm">Aucun projet dans cette entreprise.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {section.projects.map((project) => (
              <ProjectRow key={project.id} project={project} client={client} license={section.license} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
