import type {Project, CompanyMember} from '../../../../../lib/queries.ts';
import {useProjectDeliverables} from '../../../../../lib/queries.ts';
import {LicenseBadge} from '../../../../../components/atoms/LicenseBadge.tsx';
import {EmptyText} from '../../../../../components/atoms/EmptyText.tsx';
import {DeliverableRow} from './DeliverableRow.tsx';

interface Props {
    project: Project;
    members?: CompanyMember[];
}

function memberHasAccess(member: CompanyMember, projectId: string): boolean {
    if (!member.license) return false;
    if (member.license.type === 'ADMIN') return true;
    return member.license.projectAccess.some((a) => a.projectId === projectId);
}

export function ProjectRow({project, members = []}: Props) {
    const accessMembers = members.filter((m) => memberHasAccess(m, project.id));

    return (
        <div id={`project-${project.id}`} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800">
                <h3 className="text-white font-semibold">{project.name}</h3>
                <ProjectLinks project={project}/>
            </div>
            <div className="grid grid-cols-2 divide-x divide-gray-800">
                <AccessCell members={accessMembers}/>
                <DeliverablesCell projectId={project.id}/>
            </div>
        </div>
    );
}

function ProjectLinks({project}: { project: Project }) {
    return (
        <div className="flex gap-1.5">
            {project.appUrl && (
                <a href={project.appUrl} target="_blank" rel="noreferrer"
                   className="text-xs bg-indigo-900/30 text-indigo-300 border border-indigo-800/40 rounded px-2 py-0.5 hover:bg-indigo-800/50 transition-colors">
                    App
                </a>
            )}
            {project.docsUrl && (
                <a href={project.docsUrl} target="_blank" rel="noreferrer"
                   className="text-xs bg-gray-800 text-gray-300 border border-gray-700 rounded px-2 py-0.5 hover:bg-gray-700 transition-colors">
                    Doc
                </a>
            )}
            {project.changelogUrl && (
                <a href={project.changelogUrl} target="_blank" rel="noreferrer"
                   className="text-xs bg-orange-900/30 text-orange-300 border border-orange-800/40 rounded px-2 py-0.5 hover:bg-orange-800/50 transition-colors">
                    Changelog
                </a>
            )}
        </div>
    );
}

function AccessCell({members}: { members: CompanyMember[] }) {
    return (
        <div className="px-4 py-3">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Accès</p>
            {members.length === 0 ? (
                <p className="text-xs text-gray-600">Aucun accès</p>
            ) : (
                <div className="flex flex-col gap-1.5">
                    {members.map((m) => {
                        const initials = ((m.firstName?.[0] ?? '') + (m.lastName?.[0] ?? '')).toUpperCase();
                        return (
                            <div key={m.id} className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                    {initials}
                                </div>
                                <span className="text-xs text-gray-300 truncate flex-1">{m.firstName} {m.lastName}</span>
                                {m.license && <LicenseBadge type={m.license.type} className="shrink-0 px-1.5 py-0.5"/>}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function DeliverablesCell({projectId}: { projectId: string }) {
    const {data: deliverables = []} = useProjectDeliverables(projectId);

    return (
        <div className="px-4 py-3">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Livrables</p>
            {deliverables.length === 0 ? (
                <EmptyText message="Aucun livrable" className="text-gray-600 text-xs"/>
            ) : (
                <div className="flex flex-col gap-0.5">
                    {deliverables.map((d) => (
                        <DeliverableRow key={d.id} deliverable={d}/>
                    ))}
                </div>
            )}
        </div>
    );
}
