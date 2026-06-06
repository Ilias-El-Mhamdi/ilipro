import {useParams} from 'react-router-dom';
import {useClientBySlug} from '../../../lib/queries';
import {AdminLayout} from '../../../components/templates/AdminLayout';
import {LoadingText} from '../../../components/atoms/LoadingText';
import {EmptyText} from '../../../components/atoms/EmptyText';
import {CompanySection} from './company/CompanySection.tsx';
import {BackLink} from '../../../components/atoms/BackLink';
import {UserHeader} from './UserHeader';

export function UserDetailPage() {
    const {userSlug} = useParams<{ userSlug: string }>();
    const {data: client, isLoading} = useClientBySlug(userSlug!);

    if (isLoading) {
        return <AdminLayout><LoadingText/></AdminLayout>;
    }

    if (!client) {
        return <AdminLayout><EmptyText message="Utilisateur introuvable."/></AdminLayout>;
    }

    return (
        <AdminLayout>
            <BackLink to="/admin/users" label="Utilisateurs"/>

            <UserHeader firstName={client.firstName} lastName={client.lastName} email={client.email}/>

            {client.companies.length === 0 ? (
                <EmptyText message="Cet utilisateur n'appartient à aucune entreprise."
                           className="text-gray-600 text-sm"/>
            ) : (
                client.companies.map((section) => (
                    <CompanySection key={section.id} section={section} client={client}/>
                ))
            )}
        </AdminLayout>
    );
}
