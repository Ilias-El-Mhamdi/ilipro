import {useParams} from 'react-router-dom';
import {useUserBySlug} from '../../../lib/queries';
import {AdminLayout} from '../../../components/templates/AdminLayout';
import {LoadingText} from '../../../components/atoms/LoadingText';
import {EmptyText} from '../../../components/atoms/EmptyText';
import {CompanySection} from './company/CompanySection.tsx';
import {BackLink} from '../../../components/atoms/BackLink';
import {UserHeader} from './UserHeader';
import {usePageTitle} from '../../../hooks/usePageTitle';
import {useEditUser} from './useEditUser';
import {UserCardEditModal} from '../companyDetail/users/userCard/UserCardEditModal';
import type {UserDetail} from '../../../lib/queries';

export function UserDetailPage() {
    const {userSlug} = useParams<{ userSlug: string }>();
    const {data: user, isLoading} = useUserBySlug(userSlug!);
    usePageTitle(user ? `${user.firstName} ${user.lastName}` : '');

    if (isLoading) {
        return <AdminLayout><LoadingText/></AdminLayout>;
    }

    if (!user) {
        return <AdminLayout><EmptyText message="Utilisateur introuvable."/></AdminLayout>;
    }

    return (
        <AdminLayout>
            <BackLink to="/admin/users" label="Utilisateurs"/>

            <div className="flex items-start justify-between mb-8">
                <UserHeader firstName={user.firstName} lastName={user.lastName} email={user.email} slug={user.slug}/>
                <EditUserButton user={user}/>
            </div>

            {user.companies.length === 0 ? (
                <EmptyText message="Cet utilisateur n'appartient à aucune entreprise."
                           className="text-gray-600 text-sm"/>
            ) : (
                user.companies.map((section) => (
                    <CompanySection key={section.id} section={section} user={user}/>
                ))
            )}
        </AdminLayout>
    );
}

function EditUserButton({user}: {user: UserDetail}) {
    const {open, setOpen, firstNameDraft, setFirstNameDraft, lastNameDraft, setLastNameDraft, openModal, update} = useEditUser(user);

    return (
        <>
            <button
                onClick={openModal}
                className="text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
            >
                Modifier
            </button>

            {open && (
                <UserCardEditModal
                    user={user}
                    firstNameDraft={firstNameDraft}
                    onFirstNameChange={setFirstNameDraft}
                    lastNameDraft={lastNameDraft}
                    onLastNameChange={setLastNameDraft}
                    onClose={() => setOpen(false)}
                    onSubmit={() => update.mutate()}
                    isPending={update.isPending}
                />
            )}
        </>
    );
}
