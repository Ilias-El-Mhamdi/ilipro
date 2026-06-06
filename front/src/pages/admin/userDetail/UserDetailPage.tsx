import {useParams} from 'react-router-dom';
import {useUserBySlug} from '../../../lib/queries';
import {AdminLayout} from '../../../components/templates/AdminLayout';
import {LoadingText} from '../../../components/atoms/LoadingText';
import {EmptyText} from '../../../components/atoms/EmptyText';
import {CompanySection} from './company/CompanySection.tsx';
import {BackLink} from '../../../components/atoms/BackLink';
import {UserHeader} from './UserHeader';

export function UserDetailPage() {
    const {userSlug} = useParams<{ userSlug: string }>();
    const {data: user, isLoading} = useUserBySlug(userSlug!);

    if (isLoading) {
        return <AdminLayout><LoadingText/></AdminLayout>;
    }

    if (!user) {
        return <AdminLayout><EmptyText message="Utilisateur introuvable."/></AdminLayout>;
    }

    return (
        <AdminLayout>
            <BackLink to="/admin/users" label="Utilisateurs"/>

            <UserHeader firstName={user.firstName} lastName={user.lastName} email={user.email}/>

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
