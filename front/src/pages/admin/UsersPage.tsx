import { AdminLayout } from '../../components/templates/AdminLayout';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { Modal } from '../../components/molecules/Modal';
import { ConfirmDialog } from '../../components/molecules/ConfirmDialog';
import { useUserCrud } from '../../hooks/useUserCrud';
import { initials } from '../../lib/utils';
import { TYPE_BADGE } from '../../lib/licenseConstants';

export function UsersPage() {
  const {
    clients,
    isLoading,
    navigate,
    modalOpen, setModalOpen,
    confirmClient, setConfirmClient,
    firstName, setFirstName,
    lastName, setLastName,
    email, setEmail,
    create,
    remove,
  } = useUserCrud();

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Utilisateurs</h1>
        <Button onClick={() => setModalOpen(true)}>+ Ajouter</Button>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Chargement...</p>
      ) : clients.length === 0 ? (
        <p className="text-gray-500">Aucun utilisateur.</p>
      ) : (
        <div className="border border-gray-800 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-900 text-gray-400">
              <tr>
                <th className="text-left px-4 py-3">Utilisateur</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Licence</th>
                <th className="text-left px-4 py-3">Créé le</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => navigate(`/admin/users/${c.slug}`)}
                  className="border-t border-gray-800 hover:bg-gray-900/50 cursor-pointer"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {initials(c.firstName, c.lastName)}
                      </div>
                      <span className="text-white font-medium">{c.firstName} {c.lastName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{c.email}</td>
                  <td className="px-4 py-3">
                    {c.license ? (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${TYPE_BADGE[c.license.type].className}`}>
                        {TYPE_BADGE[c.license.type].label}
                      </span>
                    ) : (
                      <span className="text-gray-600 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {new Date(c.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="danger"
                        onClick={(e) => { e.stopPropagation(); setConfirmClient(c); }}
                      >
                        Supprimer
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <Modal title="Nouvel utilisateur" onClose={() => setModalOpen(false)}>
          <form
            onSubmit={(e) => { e.preventDefault(); create.mutate(); }}
            className="flex flex-col gap-4"
          >
            <div className="flex gap-3">
              <Input label="Prénom" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Prénom" autoFocus />
              <Input label="Nom" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Nom" />
            </div>
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemple.com" />
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Annuler</Button>
              <Button
                type="submit"
                disabled={!firstName.trim() || !lastName.trim() || !email.trim() || create.isPending}
              >
                Créer
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {confirmClient && (
        <ConfirmDialog
          message={`Supprimer l'utilisateur « ${confirmClient.firstName} ${confirmClient.lastName} » ? Cette action est irréversible.`}
          onConfirm={() => remove.mutate(confirmClient.id)}
          onCancel={() => setConfirmClient(null)}
        />
      )}
    </AdminLayout>
  );
}
