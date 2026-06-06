import type {Project, ClientDetail, License} from '../../../../../lib/queries.ts';
import {useProjectDeliverables} from '../../../../../lib/queries.ts';
import {LicenseBadge} from '../../../../../components/atoms/LicenseBadge.tsx';
import {EmptyText} from '../../../../../components/atoms/EmptyText.tsx';
import {DeliverableRow} from './DeliverableRow.tsx';

interface Props {
    project: Project;
    client: ClientDetail;
    license: License | null;
}


export function ProjectRow({project, client, license}: Props) {
    const hasAccess = !license ? false : license.type === 'ADMIN'
        ? true : license.projectAccess.some((a) => a.projectId === project.id);

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800">
                <h3 className="text-white font-semibold">{project.name}</h3>
                <ProjectLinks project={project}/>
            </div>
            <div className="grid grid-cols-2 divide-x divide-gray-800">
                <AccessCell client={client} license={license} hasAccess={hasAccess}/>
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

function AccessCell({client, license, hasAccess}: {
    client: ClientDetail;
    license: License | null;
    hasAccess: boolean
}) {
    const initials = (client.firstName[0] ?? '').toUpperCase() + (client.lastName[0] ?? '').toUpperCase();

    return (
        <div className="px-4 py-3">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Accès</p>
            {hasAccess ? (
                <div className="flex items-center gap-2">
                    <div
                        className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {initials}
                    </div>
                    <span className="text-xs text-gray-300 truncate flex-1">{client.firstName} {client.lastName}</span>
                    {license && <LicenseBadge type={license.type} className="shrink-0 px-1.5 py-0.5"/>}
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <div
                        className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-gray-500 text-xs font-bold shrink-0">
                        {initials}
                    </div>
                    <span className="text-xs text-gray-600 truncate flex-1">{client.firstName} {client.lastName}</span>
                    <span
                        className="shrink-0 text-xs text-red-400 border border-red-900/50 bg-red-900/20 rounded px-1.5 py-0.5">
            Non autorisé
          </span>
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
