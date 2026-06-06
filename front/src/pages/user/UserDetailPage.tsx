import { useParams } from 'react-router-dom';
import { useUserBySlug } from '../../lib/queries';
import { UserLayout } from '../../components/templates/UserLayout';
import { LoadingText } from '../../components/atoms/LoadingText';
import { EmptyText } from '../../components/atoms/EmptyText';
import { CompanySection } from '../admin/userDetail/company/CompanySection';
import { UserHeader } from '../admin/userDetail/UserHeader';

export function UserDetailPage() {
  const { userSlug } = useParams<{ userSlug: string }>();
  const { data: user, isLoading } = useUserBySlug(userSlug!);

  if (isLoading) {
    return <UserLayout><LoadingText /></UserLayout>;
  }

  if (!user) {
    return <UserLayout><EmptyText message="Utilisateur introuvable." /></UserLayout>;
  }

  return (
    <UserLayout>
      <UserHeader firstName={user.firstName} lastName={user.lastName} email={user.email} />

      {user.companies.length === 0 ? (
        <EmptyText message="Vous n'appartenez à aucune entreprise." className="text-gray-600 text-sm" />
      ) : (
        user.companies.map((section) => (
          <CompanySection key={section.id} section={section} user={user} isAdmin={false} />
        ))
      )}
    </UserLayout>
  );
}
