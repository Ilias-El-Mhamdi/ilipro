import {useCompanyProjects, useCompanyUsers} from '../../../../lib/queries.ts';
import {useManageProjects} from './useManageProjects';
import {ProjectCard} from '../../../../components/organisms/ProjectCard.tsx';
import {LoadingText} from '../../../../components/atoms/LoadingText.tsx';
import {EmptyText} from '../../../../components/atoms/EmptyText.tsx';
import {ConfirmDialog} from '../../../../components/molecules/ConfirmDialog.tsx';
import {AddProjectModal} from './AddProjectModal.tsx';

interface Props {
    companySlug: string;
}

export function ProjectsSection({companySlug}: Props) {
    const {data: projects = [], isLoading} = useCompanyProjects(companySlug);
    const {data: users = []} = useCompanyUsers(companySlug);
    const manage = useManageProjects(companySlug);

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs text-gray-500 uppercase tracking-widest">Projets</h2>
                <button onClick={() => manage.setModalOpen(true)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer">+
                    Ajouter
                </button>
            </div>

            {isLoading ? (
                <LoadingText/>
            ) : projects.length === 0 ? (
                <EmptyText message="Aucun projet pour cette entreprise."/>
            ) : (
                <div className="flex flex-col gap-4">
                    {projects.map((project) => (
                        <div key={project.id} id={`project-${project.slug}`}>
                            <ProjectCard project={project} companySlug={companySlug} users={users}
                                         onDeleteProject={manage.setConfirm}/>
                        </div>
                    ))}
                </div>
            )}

            {manage.modalOpen && <AddProjectModal manage={manage}/>}

            {manage.confirm && (
                <ConfirmDialog
                    message={`Supprimer le projet « ${manage.confirm.name} » ? Cette action est irréversible.`}
                    onConfirm={() => manage.remove.mutate(manage.confirm!.id)}
                    onCancel={() => manage.setConfirm(null)}
                />
            )}
        </div>
    );
}
