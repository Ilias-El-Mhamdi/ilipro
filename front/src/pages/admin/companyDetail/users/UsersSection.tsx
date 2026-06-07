import {useCompanyUsers, useCompanyProjects, useUsers} from '../../../../lib/queries.ts';
import {useManageUsers} from './useManageUsers';
import {useLinkUser} from './useLinkUser';
import {UserCard} from './userCard/UserCard';
import {LoadingText} from '../../../../components/atoms/LoadingText.tsx';
import {EmptyText} from '../../../../components/atoms/EmptyText.tsx';
import {ConfirmDialog} from '../../../../components/molecules/ConfirmDialog.tsx';
import {AddUserModal} from './AddUserModal.tsx';
import {LinkUserModal} from './LinkUserModal.tsx';

interface Props {
    companySlug: string;
    companyId: string;
}

export function UsersSection({companySlug, companyId}: Props) {
    const {data: users = [], isLoading} = useCompanyUsers(companySlug);
    const {data: projects = []} = useCompanyProjects(companySlug);
    const {data: allUsers = []} = useUsers();
    const manage = useManageUsers(companySlug);
    const linkUser = useLinkUser(companySlug, users, allUsers);

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs text-gray-500 uppercase tracking-widest">Utilisateurs</h2>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            linkUser.setModalOpen(true);
                            linkUser.setSearch('');
                            linkUser.setSelectedId(null);
                        }}
                        className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                    >
                        + Lier
                    </button>
                    <button onClick={() => manage.setModalOpen(true)}
                            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer">+
                        Ajouter
                    </button>
                </div>
            </div>

            {isLoading ? (
                <LoadingText className="text-gray-600 text-sm"/>
            ) : users.length === 0 ? (
<EmptyText message="Aucun utilisateur pour cette entreprise." className="text-gray-600 text-sm"/>
            ) : (
                <div className="grid grid-cols-4 gap-3">
                    {users.map((user) => (
                        <div key={user.id} id={`user-${user.id}`}
                             className="rounded-xl transition-shadow duration-300">
                            <UserCard
                                user={user}
                                license={user.license ?? null}
                                projects={projects}
                                companySlug={companySlug}
                                companyId={companyId}
                                onDelete={manage.setConfirm}
                            />
                        </div>
                    ))}
                </div>
            )}

            {manage.modalOpen && <AddUserModal manage={manage}/>}
            {linkUser.modalOpen && <LinkUserModal link={linkUser}/>}

            {manage.confirm && (
                <ConfirmDialog
                    message={`Retirer « ${manage.confirm.firstName} ${manage.confirm.lastName} » de cette entreprise ?`}
                    onConfirm={() => manage.remove.mutate(manage.confirm!.id)}
                    onCancel={() => manage.setConfirm(null)}
                />
            )}
        </div>
    );
}
