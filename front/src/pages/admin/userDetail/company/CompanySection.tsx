import {Link} from 'react-router-dom';
import type {UserCompanySection, UserDetail} from '../../../../lib/queries.ts';
import {LicenseCard} from './license/LicenseCard.tsx';
import {ProjectRow} from './project/ProjectRow.tsx';
import {EmptyText} from '../../../../components/atoms/EmptyText.tsx';


// ─── CompanySection ───────────────────────────────────────────────────────────

interface Props {
    section: UserCompanySection;
    user: UserDetail;
    isAdmin?: boolean;
}

export function CompanySection({section, user, isAdmin = true}: Props) {
    return (
        <div className="mb-10">
            <CompanySectionHeader slug={section.slug} name={section.name} isAdmin={isAdmin}/>
            <LicenseSection section={section} user={user}/>
            <ProjectsSubSection section={section} user={user}/>
        </div>
    );
}

// ─── Company header ───────────────────────────────────────────────────────────

function CompanySectionHeader({slug, name, isAdmin}: { slug: string; name: string; isAdmin: boolean }) {
    return (
        <div className="flex items-center gap-2 mb-5 pb-2 border-b border-gray-800">
            {isAdmin ? (
                <>
                    <Link
                        to={`/admin/companies/${slug}`}
                        className="flex items-center gap-1.5 text-lg font-semibold text-white hover:text-indigo-300 transition-colors"
                    >
                        {name}
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-gray-600" viewBox="0 0 24 24"
                             fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                            <polyline points="15 3 21 3 21 9"/>
                            <line x1="10" y1="14" x2="21" y2="3"/>
                        </svg>
                    </Link>
                </>
            ) : (
                <h2 className="text-lg font-semibold text-white">{name}</h2>
            )}
        </div>
    );
}

// ─── License sub-section ──────────────────────────────────────────────────────

function LicenseSection({section, user}: { section: UserCompanySection; user: UserDetail }) {
    return (
        <div className="mb-6">
            <h3 className="text-xs text-gray-500 uppercase tracking-widest mb-3">Licence</h3>
            <div className="w-1/4">
                <LicenseCard license={section.license} projects={section.projects} user={user}/>
            </div>
        </div>
    );
}

// ─── Projects sub-section ─────────────────────────────────────────────────────

function ProjectsSubSection({section, user}: { section: UserCompanySection; user: UserDetail }) {
    return (
        <div>
            <h3 className="text-xs text-gray-500 uppercase tracking-widest mb-3">Projets</h3>
            {section.projects.length === 0 ? (
                <EmptyText message="Aucun projet dans cette entreprise." className="text-gray-600 text-sm"/>
            ) : (
                <div className="flex flex-col gap-4">
                    {section.projects.map((project) => (
                        <ProjectRow key={project.id} project={project} user={user} license={section.license} members={section.members}/>
                    ))}
                </div>
            )}
        </div>
    );
}

