import { AdminLayout } from '../../../components/templates/AdminLayout';
import { Button } from '../../../components/atoms/Button';
import { ConfirmDialog } from '../../../components/molecules/ConfirmDialog';
import { useUserCrud } from '../../../hooks/useUserCrud';
import { LoadingText } from '../../../components/atoms/LoadingText';
import { EmptyText } from '../../../components/atoms/EmptyText';
import { UsersTable } from './UsersTable';
import { CreateUserModal } from './CreateUserModal';

export function UsersPage() {
  const {
    users, isLoading, navigate,
    modalOpen, setModalOpen,
    confirmUser, setConfirmUser,
    firstName, setFirstName,
    lastName, setLastName,
    email, setEmail,
    create, remove,
  } = useUserCrud();

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Utilisateurs</h1>
        <Button onClick={() => setModalOpen(true)}>+ Ajouter</Button>
      </div>

      {isLoading ? (
        <LoadingText />
      ) : users.length === 0 ? (
        <EmptyText message="Aucun utilisateur." />
      ) : (
        <UsersTable
          users={users}
          onNavigate={(slug) => navigate(`/admin/users/${slug}`)}
          onDelete={(e, user) => { e.stopPropagation(); setConfirmUser(user); }}
        />
      )}

      {modalOpen && (
        <CreateUserModal
          firstName={firstName} onFirstNameChange={setFirstName}
          lastName={lastName} onLastNameChange={setLastName}
          email={email} onEmailChange={setEmail}
          onClose={() => setModalOpen(false)}
          onSubmit={create.mutate}
          isPending={create.isPending}
        />
      )}
      {confirmUser && (
        <ConfirmDialog
          message={`Supprimer l'utilisateur « ${confirmUser.firstName} ${confirmUser.lastName} » ? Cette action est irréversible.`}
          onConfirm={() => remove.mutate(confirmUser.id)}
          onCancel={() => setConfirmUser(null)}
        />
      )}
    </AdminLayout>
  );
}
