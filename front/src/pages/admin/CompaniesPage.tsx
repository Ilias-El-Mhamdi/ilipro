import { AdminLayout } from '../../components/templates/AdminLayout';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { Modal } from '../../components/molecules/Modal';
import { ConfirmDialog } from '../../components/molecules/ConfirmDialog';
import { useCompanyCrud } from '../../hooks/useCompanyCrud';

export function CompaniesPage() {
  const {
    companies,
    isLoading,
    navigate,
    modalOpen,
    editing,
    confirmId, setConfirmId,
    name, setName,
    remove,
    openCreate,
    openEdit,
    closeModal,
    submit,
    confirmCompany,
  } = useCompanyCrud();

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Entreprises</h1>
        <Button onClick={openCreate}>+ Ajouter</Button>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Chargement...</p>
      ) : companies.length === 0 ? (
        <p className="text-gray-500">Aucune entreprise.</p>
      ) : (
        <div className="border border-gray-800 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-900 text-gray-400">
              <tr>
                <th className="text-left px-4 py-3">Nom</th>
                <th className="text-left px-4 py-3">Créée le</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {companies.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => navigate(`/admin/companies/${c.slug}`)}
                  className="border-t border-gray-800 hover:bg-gray-900/50 cursor-pointer"
                >
                  <td className="px-4 py-3 text-white font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-gray-400">
                    {new Date(c.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" onClick={(e) => openEdit(e, c)}>Éditer</Button>
                      <Button
                        variant="danger"
                        onClick={(e) => { e.stopPropagation(); setConfirmId(c.slug); }}
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
        <Modal title={editing ? "Modifier l'entreprise" : 'Nouvelle entreprise'} onClose={closeModal}>
          <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="flex flex-col gap-4">
            <Input
              label="Nom"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nom de l'entreprise"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="ghost" onClick={closeModal}>Annuler</Button>
              <Button type="submit" disabled={!name.trim()}>
                {editing ? 'Mettre à jour' : 'Créer'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {confirmId && (
        <ConfirmDialog
          message={`Supprimer l'entreprise « ${confirmCompany?.name} » ? Cette action est irréversible.`}
          onConfirm={() => remove.mutate(confirmId)}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </AdminLayout>
  );
}
